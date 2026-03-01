const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // تفضيلات أنواع الإشعارات العادية
  preferences: {
    job_match: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false }
    },
    application_accepted: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },
    application_rejected: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false }
    },
    application_reviewed: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false }
    },
    new_application: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },
    job_closed: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false }
    },
    course_match: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false }
    },
    system: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false }
    }
  },
  
  // تفضيلات الإشعارات الإدارية (للأدمن فقط)
  adminPreferences: {
    user_registered: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false }
    },
    job_posted: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false }
    },
    course_published: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false }
    },
    review_flagged: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },
    content_reported: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },
    suspicious_activity: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },
    system_error: {
      enabled: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    }
  },
  
  // إعدادات عامة
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { 
      type: String, 
      default: '22:00',
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    end: { 
      type: String, 
      default: '08:00',
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  
  // تخصيص تكرار الإشعارات
  notificationFrequency: {
    // تكرار إشعارات التوصيات (job_match, course_match)
    recommendations: {
      type: String,
      enum: ['instant', 'hourly', 'daily', 'weekly', 'disabled'],
      default: 'daily'
    },
    // تكرار إشعارات التطبيقات (application_accepted, application_rejected, etc.)
    applications: {
      type: String,
      enum: ['instant', 'hourly', 'daily', 'disabled'],
      default: 'instant'
    },
    // تكرار إشعارات النظام (system)
    system: {
      type: String,
      enum: ['instant', 'daily', 'weekly', 'disabled'],
      default: 'instant'
    },
    // آخر مرة تم إرسال إشعارات مجمعة
    lastBatchSent: {
      recommendations: { type: Date, default: null },
      applications: { type: Date, default: null },
      system: { type: Date, default: null }
    }
  },
  
  // Web Push Subscription
  pushSubscriptions: [{
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    },
    deviceInfo: String,
    subscribedAt: { type: Date, default: Date.now }
  }],
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
