import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Section from '../models/Section.js';
import Event from '../models/Event.js';
import Assignment from '../models/Assignment.js';

export function convertToOllamaTools(tools) {
  return Object.entries(tools).map(([name, tool]) => ({
    type: 'function',
    function: {
      name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters, {
        target: 'openApi3',
        $refStrategy: 'none'
      })
    }
  }));
}

export const tools = {
  getCourseCount: {
    description: 'Get the total number of courses in the system',
    parameters: z.object({}),
    execute: async () => {
      const count = await Course.countDocuments();
      return `There are currently ${count} courses in the system.`;
    }
  },

  createCourse: {
    description: 'Create a new course with title, code, description, instructor, and optional section',
    parameters: z.object({
      title: z.string().describe('The course title (e.g., "Advanced Java Programming")'),
      courseCode: z.string().describe('The course code (e.g., "CS301")'),
      description: z.string().optional().describe('Course description'),
      instructorEmail: z.string().email().describe('Email of the instructor/professor'),
      sectionId: z.string().optional().describe('Section ID to assign this course to'),
      colorIdentifier: z.string().default('#3B82F6').describe('Color for the course card')
    }),
    execute: async ({ title, courseCode, description, instructorEmail, sectionId, colorIdentifier }) => {
      const instructor = await User.findOne({ email: instructorEmail, role: 'professor' });
      if (!instructor) {
        return `Error: No professor found with email ${instructorEmail}`;
      }

      const course = await Course.create({
        title,
        courseCode: courseCode.toUpperCase(),
        description: description || '',
        colorIdentifier,
        instructor: instructor._id,
        targetSection: sectionId || null,
        students: []
      });

      instructor.assignedCourses.push(course._id);
      await instructor.save();

      return `Success: Created course "${title}" (${courseCode}) taught by ${instructor.name}${sectionId ? ' for the specified section' : ''}.`;
    }
  },

  listCourses: {
    description: 'List all courses with basic information',
    parameters: z.object({
      limit: z.number().default(10).describe('Maximum number of courses to return')
    }),
    execute: async ({ limit }) => {
      const courses = await Course.find()
        .limit(limit)
        .populate('instructor', 'name email')
        .populate('targetSection', 'name program batch')
        .select('title courseCode instructor targetSection students');

      if (courses.length === 0) {
        return 'No courses found in the system.';
      }

      const courseList = courses.map(c =>
        `${c.courseCode}: ${c.title} (Instructor: ${c.instructor?.name}, Students: ${c.students?.length || 0}${c.targetSection ? `, Section: ${c.targetSection.name}` : ''})`
      ).join('\n');

      return `Found ${courses.length} course(s):\n${courseList}`;
    }
  },

  createSection: {
    description: 'Create a new section/class for organizing students',
    parameters: z.object({
      name: z.string().describe('Section name (e.g., "Section A", "Section B")'),
      program: z.string().describe('Program name (e.g., "B.Tech CSE", "B.Tech ECE")'),
      batch: z.string().describe('Batch year range (e.g., "2024-2028")')
    }),
    execute: async ({ name, program, batch }) => {
      const section = await Section.create({
        name,
        program,
        batch,
        students: []
      });

      return `Success: Created section "${name}" for ${program} (Batch: ${batch})`;
    }
  },

  listSections: {
    description: 'List all sections in the system',
    parameters: z.object({}),
    execute: async () => {
      const sections = await Section.find().select('name program batch students');

      if (sections.length === 0) {
        return 'No sections found in the system.';
      }

      const sectionList = sections.map(s =>
        `${s.name}: ${s.program} (Batch: ${s.batch}, Students: ${s.students.length})`
      ).join('\n');

      return `Found ${sections.length} section(s):\n${sectionList}`;
    }
  },

  createUser: {
    description: 'Create a new user account (student or professor)',
    parameters: z.object({
      name: z.string().describe('User full name'),
      email: z.string().email().describe('User email address'),
      role: z.enum(['student', 'professor']).describe('User role: "student" or "professor"'),
      sectionName: z.string().optional().describe('Section name to enroll student in (only for students)')
    }),
    execute: async ({ name, email, role, sectionName }) => {
      const existing = await User.findOne({ email });
      if (existing) {
        return `Error: A user with email ${email} already exists.`;
      }

      const generatePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const generatedPassword = generatePassword();

      let sectionId = null;
      if (role === 'student' && sectionName) {
        const section = await Section.findOne({ name: sectionName });
        if (section) {
          sectionId = section._id;
        } else {
          return `Error: Section "${sectionName}" not found.`;
        }
      }

      const userData = {
        name,
        email,
        password: generatedPassword,
        role
      };

      if (role === 'student') {
        userData.section = sectionId;
      } else if (role === 'professor') {
        userData.assignedCourses = [];
      }

      const user = await User.create(userData);

      if (role === 'student' && sectionId) {
        await Section.findByIdAndUpdate(sectionId, {
          $push: { students: user._id }
        });
      }

      const roleText = role === 'student' ? 'student' : 'professor';
      return `Success: Created ${roleText} account for ${name} (${email})${sectionName ? ` in ${sectionName}` : ''}. Temporary password: ${generatedPassword}`;
    }
  },

  getStudentCount: {
    description: 'Get the total number of students in the system',
    parameters: z.object({}),
    execute: async () => {
      const count = await User.countDocuments({ role: 'student' });
      return `There are currently ${count} students in the system.`;
    }
  },

  createEvent: {
    description: 'Create a calendar event (global, course-specific, or personal)',
    parameters: z.object({
      title: z.string().describe('Event title'),
      date: z.string().describe('Event date in ISO format or natural language'),
      type: z.enum(['global', 'course', 'personal']).describe('Event type'),
      courseCode: z.string().optional().describe('Course code if type is "course"'),
      allDay: z.boolean().default(true).describe('Whether event is all-day')
    }),
    execute: async ({ title, date, type, courseCode, allDay }) => {
      let scopeId = null;

      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        return `Error: Invalid date format "${date}". Please use ISO format (YYYY-MM-DD) or specific date.`;
      }

      if (type === 'course') {
        if (!courseCode) {
          return 'Error: Course code is required for course events.';
        }
        const course = await Course.findOne({ courseCode: courseCode.toUpperCase() });
        if (!course) {
          return `Error: Course "${courseCode}" not found.`;
        }
        scopeId = course._id;
      }

      const event = await Event.create({
        title,
        start: eventDate,
        end: eventDate,
        allDay,
        type,
        scopeId
      });

      return `Success: Created ${type} event "${title}" on ${eventDate.toDateString()}.`;
    }
  }
};
