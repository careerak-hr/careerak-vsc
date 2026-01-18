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

module.exports = mongoose.model('EducationalCourse', educationalCourseSchema);
