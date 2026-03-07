const mongoose = require('mongoose');

const applicationDraftSchema = new mongoose.Schema({
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
  step: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },
  formData: {
    // Personal Information (Step 1)
    fullName: String,
    email: String,
    phone: String,
    country: String,
    city: String,
    
    // Education (Step 2)
    education: [{
      level: String,
      degree: String,
      institution: String,
      city: String,
      country: String,
      year: String,
      grade: String
    }],
    
    // Experience (Step 2)
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
    
    // Skills (Step 3)
    computerSkills: [{
      skill: String,
      proficiency: String
    }],
    softwareSkills: [{
      software: String,
      proficiency: String
    }],
    otherSkills: [String],
    
    // Languages (Step 3)
    languages: [{
      language: String,
      proficiency: String
    }],
    
    // Additional Information
    coverLetter: String,
    expectedSalary: Number,
    availableFrom: Date,
    noticePeriod: String
  },
  files: [{
    id: String,
    name: String,
    size: Number,
    type: String,
    url: String,
    cloudinaryId: String,
    category: {
      type: String,
      enum: ['resume', 'cover_letter', 'certificate', 'portfolio', 'other']
    },
    uploadedAt: Date
  }],
  customAnswers: [{
    questionId: String,
    questionText: String,
    questionType: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  lastSaved: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups - one draft per user per job
applicationDraftSchema.index({ applicant: 1, jobPosting: 1 }, { unique: true });

// Index for cleanup queries (delete old drafts)
applicationDraftSchema.index({ lastSaved: 1 });

module.exports = mongoose.model('ApplicationDraft', applicationDraftSchema);
