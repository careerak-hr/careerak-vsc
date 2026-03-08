const mongoose = require('mongoose');

const jobBookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can bookmark a job only once
jobBookmarkSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('JobBookmark', jobBookmarkSchema);
