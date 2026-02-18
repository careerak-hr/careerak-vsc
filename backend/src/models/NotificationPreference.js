const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // تفضيلات أنواع الإشعارات
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
  
  // إعدادات عامة
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' }, // HH:mm
    end: { type: String, default: '08:00' }
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
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
