const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  logo: {
    type: String,
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small'
  },
  employeeCount: {
    type: Number,
    min: 0,
    default: null
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    },
    breakdown: {
      culture: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      salary: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      management: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      workLife: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      }
    }
  },
  openPositions: {
    type: Number,
    min: 0,
    default: 0
  },
  website: {
    type: String,
    default: null,
    trim: true
  },
  description: {
    type: String,
    default: null,
    trim: true,
    maxlength: 1000
  },
  responseRate: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    label: {
      type: String,
      enum: ['fast', 'medium', 'slow', null],
      default: null
    },
    averageResponseTime: {
      type: Number, // بالساعات
      default: null
    },
    lastUpdated: {
      type: Date,
      default: null
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
companyInfoSchema.index({ companyId: 1 });
companyInfoSchema.index({ 'rating.average': -1 });
companyInfoSchema.index({ size: 1 });

// Methods
companyInfoSchema.methods.updateRating = function(newRating) {
  const { culture, salary, management, workLife } = newRating;
  
  // Update breakdown
  this.rating.breakdown.culture = culture || this.rating.breakdown.culture;
  this.rating.breakdown.salary = salary || this.rating.breakdown.salary;
  this.rating.breakdown.management = management || this.rating.breakdown.management;
  this.rating.breakdown.workLife = workLife || this.rating.breakdown.workLife;
  
  // Calculate average
  const breakdown = this.rating.breakdown;
  this.rating.average = (
    breakdown.culture + 
    breakdown.salary + 
    breakdown.management + 
    breakdown.workLife
  ) / 4;
  
  this.rating.count += 1;
  this.updatedAt = Date.now();
  
  return this.save();
};

companyInfoSchema.methods.updateResponseRate = function(responseTimeHours) {
  // Calculate response rate based on average response time
  if (responseTimeHours <= 24) {
    this.responseRate.label = 'fast';
    this.responseRate.percentage = 90;
  } else if (responseTimeHours <= 72) {
    this.responseRate.label = 'medium';
    this.responseRate.percentage = 60;
  } else {
    this.responseRate.label = 'slow';
    this.responseRate.percentage = 30;
  }
  
  this.updatedAt = Date.now();
  return this.save();
};

// Statics
companyInfoSchema.statics.getOrCreate = async function(companyId, companyData = {}) {
  let companyInfo = await this.findOne({ companyId });
  
  if (!companyInfo) {
    companyInfo = await this.create({
      companyId,
      name: companyData.name || 'شركة',
      logo: companyData.logo || null,
      website: companyData.website || null,
      description: companyData.description || null
    });
  }
  
  return companyInfo;
};

const CompanyInfo = mongoose.model('CompanyInfo', companyInfoSchema);

module.exports = CompanyInfo;
