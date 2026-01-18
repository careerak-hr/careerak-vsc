const mongoose = require('mongoose');

const trainingCourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  objective: String,
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: String,
  skillsFocused: [String],
  duration: {
    value: Number,
    unit: { type: String, enum: ['hours', 'days', 'weeks'] }
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    frequency: String
  },
  trainees: [{
    employeeId: mongoose.Schema.Types.ObjectId,
    status: { type: String, enum: ['Enrolled', 'Completed', 'Dropped'] }
  }],
  budget: Number,
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Planned'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TrainingCourse', trainingCourseSchema);
