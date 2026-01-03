import express from 'express';
import {
  getAssignmentsByCourse,
  createAssignment,
  submitAssignment
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.post('/', protect, authorize('professor'), createAssignment);
router.post('/:id/submit', protect, authorize('student'), upload.single('file'), submitAssignment);

export default router;
