const mongoose = require('mongoose');

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
      'course_match',
      'application_accepted',
      'application_rejected',
      'application_reviewed',
      'new_application',
      'job_closed',
      'system'
    ],
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
  }
}, {
  timestamps: true
});

// Index مركب للبحث السريع
queuedNotificationSchema.index({ recipient: 1, type: 1, queuedAt: 1 });

// حذف تلقائي للإشعارات المؤجلة القديمة (أكثر من 30 يوم)
queuedNotificationSchema.index({ queuedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('QueuedNotification', queuedNotificationSchema);
