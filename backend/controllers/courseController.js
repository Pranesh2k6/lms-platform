import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .populate('students', 'name email')
      .populate('targetSection', 'name program batch');
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('students', 'name email')
      .populate('targetSection', 'name program batch');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create course (Admin only)
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  try {
    const { title, courseCode, description, colorIdentifier, instructorId, targetSection } = req.body;

    // Check if instructor exists and is a professor
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'professor') {
      return res.status(400).json({ message: 'Invalid instructor' });
    }

    const course = await Course.create({
      title,
      courseCode,
      description,
      colorIdentifier: colorIdentifier || '#3B82F6',
      instructor: instructorId,
      targetSection: targetSection || null, // Phase 3: Section-based assignment
      students: [] // Kept for backward compatibility
    });

    // Add course to professor's assignedCourses
    instructor.assignedCourses.push(course._id);
    await instructor.save();

    // Populate targetSection before sending response
    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email')
      .populate('targetSection', 'name program batch');

    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add lecture material to course
// @route   POST /api/courses/:id/lectures
// @access  Private/Professor
export const addLecture = async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    course.lectures.push({
      title,
      description: description || '',
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size
      },
      uploadedAt: new Date()
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate attendance code
// @route   POST /api/courses/:id/attendance/generate
// @access  Private/Professor
export const generateAttendanceCode = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate random 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const today = new Date().toISOString().split('T')[0];

    // Deactivate any existing session for today
    course.attendanceSessions.forEach(session => {
      if (session.date === today) {
        session.isActive = false;
      }
    });

    // Add new session
    course.attendanceSessions.push({
      date: today,
      code,
      isActive: true
    });

    await course.save();

    res.json({
      code,
      date: today,
      courseId: course._id,
      courseTitle: course.title
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit attendance code
// @route   POST /api/courses/:id/attendance/submit
// @access  Private/Student
export const submitAttendance = async (req, res) => {
  try {
    const { code } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Find active session for today
    const activeSession = course.attendanceSessions.find(
      session => session.date === today && session.isActive && session.code === code
    );

    if (!activeSession) {
      return res.status(400).json({ message: 'Invalid or expired attendance code' });
    }

    // Check if already marked present
    const existingRecord = course.attendanceRecords.find(
      record => record.date === today && record.studentId.toString() === req.user._id.toString()
    );

    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    // Mark attendance
    course.attendanceRecords.push({
      date: today,
      studentId: req.user._id,
      status: 'present'
    });

    await course.save();

    res.json({ message: 'Attendance marked successfully', date: today });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Enroll student in course (Admin only)
// @route   POST /api/courses/:id/enroll
// @access  Private/Admin
export const enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    // Check if already enrolled
    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    // Add student to course
    course.students.push(studentId);
    await course.save();

    // Add course to student's enrolledCourses
    student.enrolledCourses.push(course._id);
    await student.save();

    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
