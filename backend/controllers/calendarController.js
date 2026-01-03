import Event from '../models/Event.js';
import User from '../models/User.js';

// @desc    Get events based on user role and visibility
// @route   GET /api/calendar
// @access  Private
export const getEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let events = [];

    // Always include global events
    const globalEvents = await Event.find({ type: 'global' });
    events.push(...globalEvents);

    // Include personal events for this user
    const personalEvents = await Event.find({
      type: 'personal',
      scopeId: userId
    });
    events.push(...personalEvents);

    // Include course events based on role
    if (userRole === 'student') {
      const user = await User.findById(userId).select('enrolledCourses section').populate('section');
      let courseIds = [];

      // Phase 3: Section-based enrollment
      if (user.section) {
        const Course = (await import('../models/Course.js')).default;
        const sectionCourses = await Course.find({ targetSection: user.section._id }).select('_id');
        courseIds = sectionCourses.map(course => course._id);
      } else {
        // Fallback to legacy enrolledCourses
        courseIds = user.enrolledCourses || [];
      }

      const courseEvents = await Event.find({
        type: 'course',
        scopeId: { $in: courseIds }
      });
      events.push(...courseEvents);
    } else if (userRole === 'professor') {
      const user = await User.findById(userId).select('assignedCourses');
      const courseIds = user.assignedCourses || [];

      const courseEvents = await Event.find({
        type: 'course',
        scopeId: { $in: courseIds }
      });
      events.push(...courseEvents);
    }

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new event
// @route   POST /api/calendar
// @access  Private
export const createEvent = async (req, res) => {
  try {
    const { title, start, end, allDay, type, scopeId } = req.body;

    // Validate based on user role
    if (type === 'global' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create global events' });
    }

    if (type === 'course' && req.user.role !== 'professor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only professors can create course events' });
    }

    const event = await Event.create({
      title,
      start,
      end,
      allDay: allDay || false,
      type,
      scopeId: type === 'global' ? null : scopeId
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
