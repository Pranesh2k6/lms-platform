import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  // Visibility logic
  type: {
    type: String,
    enum: ['global', 'course', 'personal'],
    required: true
  },
  // If type='global': scopeId is null
  // If type='course': scopeId is the Course ObjectId
  // If type='personal': scopeId is the User ObjectId
  scopeId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  }
}, {
  timestamps: true
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
