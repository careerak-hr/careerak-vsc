const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Personal Information
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: String,
  city: String,
  
  // Education (from profile or manual entry)
  education: [{
    level: String,
    degree: String,
    institution: String,
    city: String,
    country: String,
    year: String,
    grade: String
  }],
  
  // Experience (from profile or manual entry)
  experience: [{
    company: String,
    position: String,
    from: Date,
    to: Date,
    current: Boolean,
    tasks: String,
    workType: String,
    jobLevel: String,
    country: String,
    city: String
  }],
  
  // Skills
  computerSkills: [{
    skill: String,
    proficiency: String
  }],
  softwareSkills: [{
    software: String,
    proficiency: String
  }],
  otherSkills: [String],
  
  // Languages
  languages: [{
    language: String,
    proficiency: String
  }],
  
  // Files
  files: [{
    id: String,
    name: String,
    size: Number,
    type: String,
    url: String,
    cloudinaryId: String,
    category: String,
    uploadedAt: Date
  }],
  
  // Additional Information
  coverLetter: String,
  expectedSalary: Number,
  availableFrom: Date,
  noticePeriod: String,
  
  // Custom Questions
  customAnswers: [{
    questionId: String,
    questionText: String,
    questionType: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  
  // Status Management
  status: {
    type: String,
    enum: ['Submitted', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected', 'Withdrawn'],
    default: 'Submitted',
    index: true
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  withdrawnAt: Date,
  
  // Legacy fields (kept for backward compatibility)
  resume: String,
  qualifications: [String],
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
jobApplicationSchema.index({ applicant: 1, status: 1 });
jobApplicationSchema.index({ jobPosting: 1, status: 1 });
jobApplicationSchema.index({ submittedAt: -1 });
jobApplicationSchema.index({ status: 1, submittedAt: -1 });

// Legacy indexes (kept for backward compatibility)
jobApplicationSchema.index({ appliedAt: -1 });
jobApplicationSchema.index({ status: 1, appliedAt: -1 });
jobApplicationSchema.index({ jobPosting: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
