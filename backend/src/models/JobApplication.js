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

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
