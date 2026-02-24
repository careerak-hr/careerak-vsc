const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: [
      'user_registered',
      'job_posted',
      'course_published',
      'review_flagged',
      'content_reported',
      'suspicious_activity',
      'system_error'
    ],
    required: true,
    index: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  actionUrl: {
    type: String
  },
  
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  relatedType: {
    type: String
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
adminNotificationSchema.index({ adminId: 1, isRead: 1, timestamp: -1 });
adminNotificationSchema.index({ adminId: 1, priority: 1, timestamp: -1 });
adminNotificationSchema.index({ adminId: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
