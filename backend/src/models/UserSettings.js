const mongoose = require('mongoose');

const notificationConfigSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  inApp: { type: Boolean, default: true },
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: false }
}, { _id: false });

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['everyone', 'registered', 'none'],
      default: 'everyone'
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    messagePermissions: {
      type: String,
      enum: ['everyone', 'contacts', 'none'],
      default: 'contacts'
    },
    showOnlineStatus: { type: Boolean, default: true },
    allowSearchEngineIndexing: { type: Boolean, default: true }
  },
  
  // Notification Preferences
  notifications: {
    job: notificationConfigSchema,
    course: notificationConfigSchema,
    chat: notificationConfigSchema,
    review: notificationConfigSchema,
    system: notificationConfigSchema,
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' }, // HH:mm format
      end: { type: String, default: '08:00' }
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    }
  },
  
  // Security Settings
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false }, // Hidden by default
    backupCodes: [{ type: String, select: false }], // Hashed, hidden by default
    trustedDevices: [{ type: String }] // Device fingerprints
  },
  
  // Preferences
  preferences: {
    language: {
      type: String,
      enum: ['ar', 'en', 'fr'],
      default: 'ar'
    },
    timezone: { type: String, default: 'Africa/Cairo' }
  }
}, {
  timestamps: true
});

// Indexes
userSettingsSchema.index({ updatedAt: 1 });

// Methods
userSettingsSchema.methods.isInQuietHours = function() {
  if (!this.notifications.quietHours.enabled) {
    return false;
  }
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const { start, end } = this.notifications.quietHours;
  
  // Handle cases where quiet hours span midnight
  if (start < end) {
    return currentTime >= start && currentTime < end;
  } else {
    return currentTime >= start || currentTime < end;
  }
};

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

module.exports = UserSettings;
