import Section from '../models/Section.js';
import User from '../models/User.js';

// @desc    Create a new section
// @route   POST /api/sections
// @access  Admin only
export const createSection = async (req, res) => {
  try {
    const { name, program, batch } = req.body;

    // Validate required fields
    if (!name || !program || !batch) {
      return res.status(400).json({ message: 'Please provide name, program, and batch' });
    }

    // Check if section already exists
    const existingSection = await Section.findOne({ name, program, batch });
    if (existingSection) {
      return res.status(400).json({ message: 'Section already exists for this program and batch' });
    }

    // Create section
    const section = await Section.create({
      name,
      program,
      batch,
      students: []
    });

    res.status(201).json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all sections
// @route   GET /api/sections
// @access  Admin, Professor
export const getSections = async (req, res) => {
  try {
    const sections = await Section.find()
      .populate('students', 'name email')
      .sort({ program: 1, batch: 1, name: 1 });

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single section by ID
// @route   GET /api/sections/:id
// @access  Admin, Professor
export const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('students', 'name email role');

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add students to a section (bulk operation)
// @route   POST /api/sections/:id/students
// @access  Admin only
export const addStudentsToSection = async (req, res) => {
  try {
    const { emails } = req.body; // Array or comma-separated string

    if (!emails) {
      return res.status(400).json({ message: 'Please provide student emails' });
    }

    // Parse emails (handle both array and comma-separated string)
    const emailArray = Array.isArray(emails)
      ? emails
      : emails.split(',').map(email => email.trim());

    // Find the section
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Find students by email
    const students = await User.find({
      email: { $in: emailArray },
      role: 'student'
    });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found with provided emails' });
    }

    // Track results
    const results = {
      added: [],
      alreadyInSection: [],
      updated: []
    };

    // Update each student
    for (const student of students) {
      // Check if student is already in this section
      if (section.students.includes(student._id)) {
        results.alreadyInSection.push(student.email);
        continue;
      }

      // Add student to section's students array
      section.students.push(student._id);
      results.added.push(student.email);

      // Update student's section field
      student.section = section._id;
      await student.save();
      results.updated.push(student.email);
    }

    // Save section with new students
    await section.save();

    res.json({
      message: `Successfully processed ${students.length} students`,
      section: await Section.findById(section._id).populate('students', 'name email'),
      results
    });
  } catch (error) {
    console.error('Error adding students to section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove a student from a section
// @route   DELETE /api/sections/:id/students/:studentId
// @access  Admin only
export const removeStudentFromSection = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    const section = await Section.findById(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Remove student from section
    section.students = section.students.filter(
      s => s.toString() !== studentId
    );
    await section.save();

    // Clear student's section field
    await User.findByIdAndUpdate(studentId, { $unset: { section: 1 } });

    res.json({
      message: 'Student removed from section',
      section: await Section.findById(id).populate('students', 'name email')
    });
  } catch (error) {
    console.error('Error removing student from section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a section
// @route   DELETE /api/sections/:id
// @access  Admin only
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Clear section reference from all students in this section
    await User.updateMany(
      { section: section._id },
      { $unset: { section: 1 } }
    );

    // Delete the section
    await section.deleteOne();

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
