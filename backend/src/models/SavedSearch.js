const mongoose = require('mongoose');

const SavedSearchSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  searchType: {
    type: String,
    enum: ['jobs', 'courses'],
    required: true
  },
  searchParams: {
    query: String,
    location: String,
    salaryMin: Number,
    salaryMax: Number,
    workType: [String],
    experienceLevel: [String],
    skills: [String],
    skillsLogic: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'OR'
    },
    datePosted: String,
    companySize: [String]
  },
  alertEnabled: {
    type: Boolean,
    default: false
  },
  alertFrequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    default: 'instant'
  },
  notificationMethod: {
    type: String,
    enum: ['push', 'email', 'both'],
    default: 'push'
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  resultCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
SavedSearchSchema.index({ userId: 1, createdAt: -1 });
SavedSearchSchema.index({ alertEnabled: 1, lastChecked: 1 });

// Limit: 10 saved searches per user
SavedSearchSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({
      userId: this.userId
    });
    if (count >= 10) {
      const error = new Error('Maximum 10 saved searches allowed per user');
      error.name = 'ValidationError';
      error.statusCode = 400;
      throw error;
    }
  }
  next();
});

// Update updatedAt on save
SavedSearchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const SavedSearch = mongoose.model('SavedSearch', SavedSearchSchema);

module.exports = SavedSearch;
