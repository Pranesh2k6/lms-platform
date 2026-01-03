import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import XLSX from 'xlsx';
import Papa from 'papaparse';
import sharp from 'sharp';

/**
 * File Parser Service
 * Handles parsing of various file types to extract student/course data
 */

/**
 * Parse image file using OCR
 * @param {Buffer} buffer - Image file buffer
 * @returns {Promise<string>} Extracted text
 */
export const parseImage = async (buffer) => {
  try {
    // Preprocess image for better OCR
    const processedImage = await sharp(buffer)
      .greyscale()
      .normalize()
      .toBuffer();

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(processedImage, 'eng');

    return text;
  } catch (error) {
    throw new Error(`OCR Error: ${error.message}`);
  }
};

/**
 * Parse PDF file
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
export const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF Parse Error: ${error.message}`);
  }
};

/**
 * Parse Excel file
 * @param {Buffer} buffer - Excel file buffer
 * @returns {Promise<Array>} Parsed data as array of objects
 */
export const parseExcel = async (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data;
  } catch (error) {
    throw new Error(`Excel Parse Error: ${error.message}`);
  }
};

/**
 * Parse CSV file
 * @param {string} content - CSV file content as string
 * @returns {Promise<Array>} Parsed data as array of objects
 */
export const parseCSV = async (content) => {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(new Error(`CSV Parse Error: ${error.message}`));
      }
    });
  });
};

/**
 * Parse student data from various file formats
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File MIME type
 * @returns {Promise<Object>} Parsed student data with validation
 */
export const parseStudentFile = async (buffer, mimetype) => {
  let rawText = '';
  let parsedData = [];

  try {
    // Determine file type and parse accordingly
    if (mimetype.startsWith('image/')) {
      rawText = await parseImage(buffer);
      // TODO: Parse text to extract student data
      parsedData = parseTextToStudents(rawText);
    } else if (mimetype === 'application/pdf') {
      rawText = await parsePDF(buffer);
      parsedData = parseTextToStudents(rawText);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
               mimetype === 'application/vnd.ms-excel') {
      parsedData = await parseExcel(buffer);
      parsedData = validateAndNormalizeStudentData(parsedData);
    } else if (mimetype === 'text/csv') {
      const content = buffer.toString('utf-8');
      parsedData = await parseCSV(content);
      parsedData = validateAndNormalizeStudentData(parsedData);
    } else {
      throw new Error(`Unsupported file type: ${mimetype}`);
    }

    return {
      success: true,
      students: parsedData,
      rawText: rawText || null,
      count: parsedData.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      students: [],
      count: 0
    };
  }
};

/**
 * Parse text to extract student information
 * Basic implementation - can be enhanced with better NLP
 * @param {string} text - Raw text
 * @returns {Array} Array of student objects
 */
const parseTextToStudents = (text) => {
  const students = [];
  const lines = text.split('\n').filter(line => line.trim());

  // Simple regex patterns for email and name
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;

  lines.forEach(line => {
    const emails = line.match(emailRegex);
    if (emails && emails.length > 0) {
      // Extract name (text before email)
      const namePart = line.split(emails[0])[0].trim();
      if (namePart) {
        students.push({
          name: namePart.replace(/[^a-zA-Z\s]/g, '').trim(),
          email: emails[0]
        });
      }
    }
  });

  return students;
};

/**
 * Validate and normalize student data from structured files (CSV/Excel)
 * @param {Array} data - Raw parsed data
 * @returns {Array} Validated student objects
 */
const validateAndNormalizeStudentData = (data) => {
  const students = [];

  data.forEach(row => {
    const student = {};

    // Flexible field mapping (case-insensitive)
    const keys = Object.keys(row);
    keys.forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('name')) {
        student.name = row[key];
      } else if (lowerKey.includes('email') || lowerKey.includes('e-mail')) {
        student.email = row[key];
      } else if (lowerKey.includes('section')) {
        student.section = row[key];
      }
    });

    // Validate required fields
    if (student.name && student.email && isValidEmail(student.email)) {
      students.push(student);
    }
  });

  return students;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
  return emailRegex.test(email);
};
