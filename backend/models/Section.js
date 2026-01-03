import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
    // e.g., "Section A", "Section B"
  },
  program: {
    type: String,
    required: true,
    trim: true
    // e.g., "B.Tech CSE", "B.Tech ECE", "B.Tech Mechanical"
  },
  batch: {
    type: String,
    required: true,
    trim: true
    // e.g., "2024-2028", "2023-2027"
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Create a compound index for unique program-batch-name combination
sectionSchema.index({ program: 1, batch: 1, name: 1 }, { unique: true });

const Section = mongoose.model('Section', sectionSchema);

export default Section;
