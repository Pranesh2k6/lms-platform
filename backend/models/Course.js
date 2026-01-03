import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ''
  },
  colorIdentifier: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  // The professor teaching this course
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The section this course is assigned to (Phase 3)
  targetSection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  // Students enrolled in this course (DEPRECATED - kept for backward compatibility)
  // In Phase 3, students are automatically enrolled via their section
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Course content - file upload version
  lectures: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    file: {
      originalName: {
        type: String,
        required: true
      },
      fileName: {
        type: String,
        required: true
      },
      path: {
        type: String,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true
      }
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Attendance sessions
  attendanceSessions: [{
    date: {
      type: String, // ISO date string
      required: true
    },
    code: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Attendance records
  attendanceRecords: [{
    date: {
      type: String, // ISO date string
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      default: 'absent'
    }
  }]
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
