import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';

// @desc    Get role-based dashboard data
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let dashboardData = {};

    if (userRole === 'admin') {
      // Admin sees system stats
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalProfessors = await User.countDocuments({ role: 'professor' });
      const totalCourses = await Course.countDocuments();

      dashboardData = {
        role: 'admin',
        stats: {
          totalStudents,
          totalProfessors,
          totalCourses
        }
      };
    } else if (userRole === 'professor') {
      // Professor sees their assigned courses and active attendance sessions
      const user = await User.findById(userId).populate({
        path: 'assignedCourses',
        populate: {
          path: 'students',
          select: 'name email'
        }
      });

      const assignedCourses = user.assignedCourses || [];

      // Get active attendance sessions
      const activeSessions = [];
      assignedCourses.forEach(course => {
        const active = course.attendanceSessions.filter(session => session.isActive);
        if (active.length > 0) {
          activeSessions.push({
            courseId: course._id,
            courseTitle: course.title,
            sessions: active
          });
        }
      });

      dashboardData = {
        role: 'professor',
        assignedCourses,
        activeSessions
      };
    } else if (userRole === 'student') {
      // Student sees enrolled courses and upcoming assignments
      const user = await User.findById(userId).populate('section');

      let enrolledCourses = [];
      let courseIds = [];

      // Phase 3: Section-based enrollment
      if (user.section) {
        // Find all courses assigned to the student's section
        enrolledCourses = await Course.find({ targetSection: user.section._id })
          .populate('instructor', 'name email')
          .populate('targetSection', 'name program batch');

        courseIds = enrolledCourses.map(course => course._id);
      } else {
        // Fallback to legacy enrolledCourses array (backward compatibility)
        const userWithCourses = await User.findById(userId).populate({
          path: 'enrolledCourses',
          populate: {
            path: 'instructor',
            select: 'name email'
          }
        });

        enrolledCourses = userWithCourses.enrolledCourses || [];
        courseIds = enrolledCourses.map(course => course._id);
      }

      // Get upcoming assignments (due in the future)
      const upcomingAssignments = await Assignment.find({
        courseId: { $in: courseIds },
        dueDate: { $gte: new Date() }
      })
        .populate('courseId', 'title courseCode')
        .sort({ dueDate: 1 })
        .limit(10);

      dashboardData = {
        role: 'student',
        enrolledCourses,
        upcomingAssignments,
        section: user.section || null
      };
    }

    res.json(dashboardData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
