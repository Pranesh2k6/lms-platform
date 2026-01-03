import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import calendarRoutes from './routes/calendar.js';
import courseRoutes from './routes/courses.js';
import assignmentRoutes from './routes/assignments.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import sectionRoutes from './routes/sections.js';
import aiAgentRoutes from './routes/aiAgent.js';

// Import socket handlers
import chatHandlers from './socket/chatHandlers.js';

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both Vite ports
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both Vite ports
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/ai-agent', aiAgentRoutes);

// Socket event handler for assignment creation
app.use('/api/assignments', (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    // If this is a successful assignment creation
    if (res.locals.socketData && res.statusCode === 201) {
      const { courseId, assignment, students } = res.locals.socketData;

      // Emit to all students in the course
      students.forEach(student => {
        io.to(`user_${student._id}`).emit('assignment_created', {
          courseId,
          courseTitle: assignment.courseId.title,
          courseCode: assignment.courseId.courseCode,
          assignment: {
            id: assignment._id,
            title: assignment.title,
            dueDate: assignment.dueDate
          }
        });
      });
    }

    return originalJson(data);
  };

  next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join course rooms
  socket.on('join_courses', (courseIds) => {
    if (Array.isArray(courseIds)) {
      courseIds.forEach(courseId => {
        socket.join(`course_${courseId}`);
      });
      console.log(`User joined ${courseIds.length} course rooms`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize chat handlers
chatHandlers(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
