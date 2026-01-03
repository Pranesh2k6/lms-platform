import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  addLecture,
  generateAttendanceCode,
  submitAttendance,
  enrollStudent
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getCourses);
router.post('/', protect, authorize('admin'), createCourse);
router.get('/:id', protect, getCourseById);
router.post('/:id/lectures', protect, authorize('professor'), upload.single('file'), addLecture);
router.post('/:id/attendance/generate', protect, authorize('professor'), generateAttendanceCode);
router.post('/:id/attendance/submit', protect, authorize('student'), submitAttendance);
router.post('/:id/enroll', protect, authorize('admin'), enrollStudent);

export default router;
