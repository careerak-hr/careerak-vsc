const mongoose = require('mongoose');

const salaryDataSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
    index: true
  },
  industry: {
    type: String,
    required: true,
    index: true
  },
  location: {
    city: String,
    country: String
  },
  experienceLevel: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Expert'],
    required: true
  },
  minSalary: {
    type: Number,
    required: true
  },
  maxSalary: {
    type: Number,
    required: true
  },
  avgSalary: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EGP'
  },
  sampleSize: {
    type: Number,
    default: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Index for quick lookups
salaryDataSchema.index({ jobTitle: 1, experienceLevel: 1, 'location.country': 1 });

module.exports = mongoose.model('SalaryData', salaryDataSchema);
