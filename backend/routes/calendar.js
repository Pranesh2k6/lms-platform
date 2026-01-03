import express from 'express';
import { getEvents, createEvent } from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getEvents);
router.post('/', protect, createEvent);

export default router;
