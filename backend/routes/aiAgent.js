import express from 'express';
import multer from 'multer';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { chatWithAgent, handleFileUpload } from '../controllers/aiAgentController.js';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, Excel, and CSV files
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, Excel, and CSV files are allowed.'));
    }
  }
});

// All routes require authentication and admin/professor role
router.use(protect);
router.use(authorize('admin', 'professor'));

// POST /api/ai-agent/chat - Chat with AI agent
router.post('/chat', chatWithAgent);

// POST /api/ai-agent/upload - Upload file for parsing
router.post('/upload', upload.single('file'), handleFileUpload);

export default router;
