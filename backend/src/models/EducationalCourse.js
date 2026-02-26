const mongoose = require('mongoose');

const educationalCourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: String,
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: String,
    required: true
  },
  duration: {
    value: Number,
    unit: { type: String, enum: ['hours', 'days', 'weeks'] }
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  maxParticipants: Number,
  enrolledParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  startDate: Date,
  endDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance optimization (admin dashboard queries)
educationalCourseSchema.index({ createdAt: -1 }); // For time-based queries
educationalCourseSchema.index({ status: 1, createdAt: -1 }); // For filtering by status
educationalCourseSchema.index({ instructor: 1 }); // For instructor's courses
educationalCourseSchema.index({ category: 1 }); // For filtering by category
educationalCourseSchema.index({ level: 1 }); // For filtering by level
educationalCourseSchema.index({ startDate: 1 }); // For upcoming courses

module.exports = mongoose.model('EducationalCourse', educationalCourseSchema);
