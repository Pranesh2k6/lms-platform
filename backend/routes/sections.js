import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createSection,
  getSections,
  getSectionById,
  addStudentsToSection,
  removeStudentFromSection,
  deleteSection
} from '../controllers/sectionController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/sections - Get all sections (Admin, Professor)
router.get('/', authorize('admin', 'professor'), getSections);

// POST /api/sections - Create a new section (Admin only)
router.post('/', authorize('admin'), createSection);

// GET /api/sections/:id - Get a single section (Admin, Professor)
router.get('/:id', authorize('admin', 'professor'), getSectionById);

// POST /api/sections/:id/students - Add students to section (Admin only)
router.post('/:id/students', authorize('admin'), addStudentsToSection);

// DELETE /api/sections/:id/students/:studentId - Remove student from section (Admin only)
router.delete('/:id/students/:studentId', authorize('admin'), removeStudentFromSection);

// DELETE /api/sections/:id - Delete a section (Admin only)
router.delete('/:id', authorize('admin'), deleteSection);

export default router;
