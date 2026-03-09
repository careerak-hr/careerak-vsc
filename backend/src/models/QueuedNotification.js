const mongoose = require('mongoose');

/**
 * Queued Notification Model
 * Stores notifications that are queued for later delivery
 * (e.g., during quiet hours or for batch sending)
 */
const queuedNotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    required: true,
    enum: [
      'job_match',
      'application_accepted',
      'application_rejected',
      'application_reviewed',
      'new_application',
      'job_closed',
      'course_match',
      'system',
      'security',
      'batch_notification'
    ]
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  relatedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  queuedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  
  reason: {
    type: String,
    enum: ['quiet_hours', 'batch_sending', 'frequency_limit', 'other'],
    default: 'other'
  },
  
  retryCount: {
    type: Number,
    default: 0
  },
  
  lastRetryAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
queuedNotificationSchema.index({ recipient: 1, scheduledFor: 1 });
queuedNotificationSchema.index({ scheduledFor: 1, type: 1 });

// TTL index - automatically delete queued notifications after 7 days
queuedNotificationSchema.index({ queuedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('QueuedNotification', queuedNotificationSchema);
