const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Attempt Information
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  success: { type: Boolean, required: true },
  failureReason: String,
  
  // Device Information
  device: {
    type: String,
    os: String,
    browser: String
  },
  
  // Location Information
  location: {
    ipAddress: { type: String, required: true },
    country: String,
    city: String
  }
}, {
  timestamps: true
});

// Compound Indexes
loginHistorySchema.index({ userId: 1, timestamp: -1 });

// TTL Index - automatically delete entries older than 90 days
loginHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Statics
loginHistorySchema.statics.logAttempt = function(data) {
  return this.create({
    userId: data.userId,
    timestamp: new Date(),
    success: data.success,
    failureReason: data.failureReason,
    device: {
      type: data.deviceType,
      os: data.os,
      browser: data.browser
    },
    location: {
      ipAddress: data.ipAddress,
      country: data.country,
      city: data.city
    }
  });
};

loginHistorySchema.statics.getUserHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

loginHistorySchema.statics.getFailedAttempts = function(userId, since) {
  return this.find({
    userId,
    success: false,
    timestamp: { $gte: since }
  }).countDocuments();
};

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);

module.exports = LoginHistory;
