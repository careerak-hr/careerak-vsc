const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: String,
  email: String,
  phone: String,
  resume: String,
  coverLetter: String,
  experience: {
    type: Number,
    description: 'Years of experience'
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted'],
    default: 'Pending'
  },
  qualifications: [String],
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Indexes for performance optimization (admin dashboard queries)
jobApplicationSchema.index({ appliedAt: -1 }); // For time-based queries
jobApplicationSchema.index({ status: 1, appliedAt: -1 }); // For filtering by status
jobApplicationSchema.index({ jobPosting: 1, status: 1 }); // For job's applications
jobApplicationSchema.index({ applicant: 1, appliedAt: -1 }); // For user's applications
jobApplicationSchema.index({ jobPosting: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
