const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  actorName: {
    type: String,
    required: true
  },
  
  actionType: {
    type: String,
    enum: [
      'user_registered',
      'job_posted',
      'application_submitted',
      'application_status_changed',
      'course_published',
      'course_enrolled',
      'review_posted',
      'content_reported',
      'user_modified',
      'content_deleted'
    ],
    required: true,
    index: true
  },
  
  targetType: {
    type: String,
    required: true
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  details: {
    type: String,
    required: true
  },
  
  ipAddress: {
    type: String,
    required: true
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance optimization
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ actorId: 1, timestamp: -1 });
activityLogSchema.index({ actionType: 1, timestamp: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });

// Compound index for common queries
activityLogSchema.index({ actorId: 1, actionType: 1, timestamp: -1 });

// Text index for search functionality
activityLogSchema.index({ details: 'text', actorName: 'text' });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
