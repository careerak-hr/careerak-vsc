const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: [
      'job_match',           // وظيفة مناسبة لمهاراتك
      'application_accepted', // تم قبول طلبك
      'application_rejected', // تم رفض طلبك
      'application_reviewed', // تم مراجعة طلبك
      'new_application',     // طلب توظيف جديد (للشركات)
      'job_closed',          // تم إغلاق الوظيفة
      'course_match',        // دورة مناسبة لك
      'new_device_login',    // تسجيل دخول من جهاز جديد
      'system'               // إشعار نظام عام
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // البيانات المرتبطة بالإشعار
  relatedData: {
    jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting' },
    jobApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingCourse' }
  },
  
  // حالة الإشعار
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: Date,
  
  // أولوية الإشعار
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // للإشعارات المجدولة
  scheduledFor: Date,
  sentAt: Date,
  
  // Web Push Notification data
  pushSent: {
    type: Boolean,
    default: false
  },
  
  pushData: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index مركب للاستعلامات السريعة
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });

// Method لتحديد الإشعار كمقروء
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);
