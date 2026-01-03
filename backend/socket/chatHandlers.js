import { saveMessage } from '../controllers/chatController.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

export default (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a chat room
    socket.on('join_room', async ({ room, userId, userName, userRole }) => {
      try {
        // Validate room access
        if (room === 'staff-global') {
          if (userRole !== 'admin' && userRole !== 'professor') {
            socket.emit('error', { message: 'Access denied to staff chat' });
            return;
          }
        } else {
          // Course-specific room validation
          const course = await Course.findById(room).populate('targetSection');
          if (!course) {
            socket.emit('error', { message: 'Course not found' });
            return;
          }

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
            socket.emit('error', { message: 'Access denied to this course chat' });
            return;
          }
        }

        // Join the room
        socket.join(room);
        console.log(`${userName} joined room: ${room}`);

        // Notify others in the room
        socket.to(room).emit('user_joined', {
          userName,
          message: `${userName} has joined the chat`,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave a chat room
    socket.on('leave_room', ({ room, userName }) => {
      socket.leave(room);
      console.log(`${userName} left room: ${room}`);

      // Notify others in the room
      socket.to(room).emit('user_left', {
        userName,
        message: `${userName} has left the chat`,
        timestamp: new Date()
      });
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { room, sender, senderName, senderRole, content } = data;

        // Save message to database
        const messageData = {
          sender,
          senderName,
          senderRole,
          content,
          room,
          timestamp: new Date()
        };

        const savedMessage = await saveMessage(messageData);

        // Broadcast message to all users in the room (including sender)
        io.to(room).emit('receive_message', savedMessage);

        console.log(`Message sent in room ${room} by ${senderName}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ room, userName }) => {
      socket.to(room).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ room, userName }) => {
      socket.to(room).emit('user_stop_typing', { userName });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
