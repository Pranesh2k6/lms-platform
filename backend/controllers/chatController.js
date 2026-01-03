import Message from '../models/Message.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Get messages for a room (staff-global or course-specific)
export const getMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate access to the room
    if (room === 'staff-global') {
      // Only admins and professors can access staff chat
      if (userRole !== 'admin' && userRole !== 'professor') {
        return res.status(403).json({ message: 'Access denied to staff chat' });
      }
    } else {
      // Course-specific chat - validate course access
      const course = await Course.findById(room).populate('targetSection');
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user is instructor or enrolled student
      const isInstructor = course.instructor.toString() === userId;
      let isEnrolled = false;

      if (userRole === 'student') {
        const user = await User.findById(userId).select('section enrolledCourses');

        // Phase 3: Check section-based enrollment
        if (user.section && course.targetSection) {
          isEnrolled = user.section.toString() === course.targetSection._id.toString();
        } else {
          // Fallback to legacy enrollment check
          isEnrolled = course.students.some(
            (studentId) => studentId.toString() === userId
          );
        }
      }

      if (!isInstructor && !isEnrolled && userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied to this course chat' });
      }
    }

    // Fetch messages for the room, sorted by timestamp
    const messages = await Message.find({ room })
      .sort({ timestamp: 1 })
      .limit(100); // Limit to last 100 messages

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get available chat rooms for a user
export const getRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const rooms = [];

    // Add staff room for admins and professors
    if (userRole === 'admin' || userRole === 'professor') {
      rooms.push({
        id: 'staff-global',
        name: 'Staff Room',
        type: 'staff',
        description: 'Chat for all staff members'
      });
    }

    // Add course-specific rooms
    let courses = [];
    if (userRole === 'professor') {
      courses = await Course.find({ instructor: userId }).select('_id title courseCode');
    } else if (userRole === 'student') {
      const user = await User.findById(userId).select('enrolledCourses section').populate('section');

      // Phase 3: Section-based enrollment
      if (user.section) {
        courses = await Course.find({ targetSection: user.section._id }).select('_id title courseCode');
      } else {
        // Fallback to legacy enrolledCourses
        const userWithCourses = await User.findById(userId).populate('enrolledCourses', '_id title courseCode');
        courses = userWithCourses.enrolledCourses;
      }
    } else if (userRole === 'admin') {
      courses = await Course.find().select('_id title courseCode');
    }

    courses.forEach((course) => {
      rooms.push({
        id: course._id.toString(),
        name: `${course.courseCode} - ${course.title}`,
        type: 'course',
        courseCode: course.courseCode
      });
    });

    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save a new message (used for Socket.io event handling)
export const saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};
