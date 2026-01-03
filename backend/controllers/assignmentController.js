import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';

// @desc    Get assignments by course
// @route   GET /api/assignments/course/:courseId
// @access  Private
export const getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ courseId: req.params.courseId })
      .populate('courseId', 'title courseCode')
      .populate('submissions.studentId', 'name email')
      .sort({ dueDate: -1 });

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create assignment (Professor only)
// @route   POST /api/assignments
// @access  Private/Professor
export const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate } = req.body;

    const course = await Course.findById(courseId).populate('students', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const assignment = await Assignment.create({
      courseId,
      title,
      description,
      dueDate
    });

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('courseId', 'title courseCode');

    // Emit socket event (will be handled in routes)
    res.locals.socketData = {
      courseId,
      assignment: populatedAssignment,
      students: course.students
    };

    res.status(201).json(populatedAssignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit assignment (Student only)
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
export const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.studentId.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    assignment.submissions.push({
      studentId: req.user._id,
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size
      },
      submittedAt: new Date()
    });

    await assignment.save();

    res.json({ message: 'Assignment submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
