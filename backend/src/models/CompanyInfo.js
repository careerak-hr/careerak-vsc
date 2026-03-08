const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  logo: String,
  description: String,
  website: String,
  employeeCount: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  foundedDate: Date,
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  responseRate: {
    type: Number, // Percentage 0-100
    default: 0
  },
  responseTimeLabel: {
    type: String,
    enum: ['Fast', 'Medium', 'Slow', 'N/A'],
    default: 'N/A'
  },
  totalJobPostings: {
    type: Number,
    default: 0
  },
  activeJobPostings: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CompanyInfo', companyInfoSchema);
