const mongoose = require('mongoose');

const jobShareSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true // Optional: user who shared the job
  },
  platform: {
    type: String,
    enum: ['whatsapp', 'linkedin', 'twitter', 'facebook', 'copy_link', 'other'],
    required: true
  },
  ip: String, // To help prevent spam
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobShare', jobShareSchema);
