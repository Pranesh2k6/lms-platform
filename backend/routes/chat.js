import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMessages, getRooms } from '../controllers/chatController.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// GET /api/chat/rooms - Get available chat rooms for user
router.get('/rooms', getRooms);

// GET /api/chat/:room/messages - Get messages for a specific room
router.get('/:room/messages', getMessages);

export default router;
