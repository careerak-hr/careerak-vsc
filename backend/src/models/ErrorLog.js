const mongoose = require('mongoose');

/**
 * ErrorLog Model
 * 
 * Stores frontend error logs for monitoring and debugging
 * 
 * Requirements:
 * - FR-ERR-3: Log error details (component, stack trace, timestamp)
 * - Task 9.1.4: Integrate error logging with backend
 */
const errorLogSchema = new mongoose.Schema({
  // Error details
  message: {
    type: String,
    required: true,
    index: true,
  },
  stack: {
    type: String,
  },
  name: {
    type: String,
    default: 'Error',
  },
  
  // Context
  component: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    default: 'Unknown',
  },
  errorBoundary: {
    type: String,
    enum: ['RouteErrorBoundary', 'ComponentErrorBoundary', 'None'],
    default: 'None',
  },
  
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  userEmail: {
    type: String,
  },
  userRole: {
    type: String,
    enum: ['employee', 'company', 'admin'],
  },
  
  // Environment
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'production',
    index: true,
  },
  release: {
    type: String,
  },
  
  // Browser/Device info
  url: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  browser: {
    name: String,
    version: String,
  },
  os: {
    name: String,
    version: String,
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown',
  },
  
  // Error metadata
  level: {
    type: String,
    enum: ['error', 'warning', 'info'],
    default: 'error',
    index: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  firstOccurrence: {
    type: Date,
    default: Date.now,
  },
  lastOccurrence: {
    type: Date,
    default: Date.now,
  },
  
  // Additional data
  extra: {
    type: mongoose.Schema.Types.Mixed,
  },
  
  // Status
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'resolved', 'ignored'],
    default: 'new',
    index: true,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
errorLogSchema.index({ createdAt: -1 });
errorLogSchema.index({ message: 1, component: 1, environment: 1 });
errorLogSchema.index({ userId: 1, createdAt: -1 });
errorLogSchema.index({ status: 1, level: 1 });

// Virtual for error fingerprint (for grouping similar errors)
errorLogSchema.virtual('fingerprint').get(function() {
  return `${this.message}-${this.component}-${this.action}`;
});

// Method to increment error count
errorLogSchema.methods.incrementCount = function() {
  this.count += 1;
  this.lastOccurrence = new Date();
  return this.save();
};

// Static method to find or create error log
errorLogSchema.statics.findOrCreate = async function(errorData) {
  const fingerprint = `${errorData.message}-${errorData.component}-${errorData.action}`;
  
  // Look for existing error with same fingerprint in last 24 hours
  const existingError = await this.findOne({
    message: errorData.message,
    component: errorData.component,
    action: errorData.action,
    environment: errorData.environment,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  }).sort({ createdAt: -1 });
  
  if (existingError) {
    // Increment count and update last occurrence
    await existingError.incrementCount();
    return existingError;
  }
  
  // Create new error log
  return this.create(errorData);
};

// Static method to get error statistics
errorLogSchema.statics.getStatistics = async function(filters = {}) {
  const match = {};
  
  if (filters.environment) match.environment = filters.environment;
  if (filters.level) match.level = filters.level;
  if (filters.status) match.status = filters.status;
  if (filters.userId) match.userId = filters.userId;
  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalErrors: { $sum: 1 },
        totalOccurrences: { $sum: '$count' },
        errorsByLevel: {
          $push: {
            level: '$level',
            count: 1,
          },
        },
        errorsByComponent: {
          $push: {
            component: '$component',
            count: 1,
          },
        },
      },
    },
  ]);
  
  return stats[0] || {
    totalErrors: 0,
    totalOccurrences: 0,
    errorsByLevel: [],
    errorsByComponent: [],
  };
};

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

module.exports = ErrorLog;
