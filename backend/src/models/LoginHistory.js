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
    default: Date.now,
    required: true,
    index: true
  },
  success: {
    type: Boolean,
    required: true
  },
  failureReason: String,
  
  // Device Information
  device: {
    type: String,
    os: String,
    browser: String
  },
  
  // Location Information
  location: {
    ipAddress: {
      type: String,
      required: true
    },
    country: String,
    city: String
  }
}, {
  timestamps: true
});

// Indexes
loginHistorySchema.index({ userId: 1, timestamp: -1 });
loginHistorySchema.index({ timestamp: 1 }); // For TTL

// TTL index - automatically delete entries older than 90 days
loginHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);

module.exports = LoginHistory;
