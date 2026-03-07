const mongoose = require('mongoose');

const salaryDataSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  field: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
    index: true
  },
  salaries: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR', 'GBP', 'AED']
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobPosting'
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    average: {
      type: Number,
      required: true,
      min: 0
    },
    median: {
      type: Number,
      required: true,
      min: 0
    },
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    count: {
      type: Number,
      required: true,
      min: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index للبحث السريع
salaryDataSchema.index({ 
  jobTitle: 1, 
  field: 1, 
  location: 1, 
  experienceLevel: 1 
}, { unique: true });

// Index للبحث بالـ regex
salaryDataSchema.index({ jobTitle: 'text' });

const SalaryData = mongoose.model('SalaryData', salaryDataSchema);

module.exports = SalaryData;
