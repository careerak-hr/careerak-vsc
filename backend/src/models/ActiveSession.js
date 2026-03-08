const mongoose = require('mongoose');

const activeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  }, // JWT token hash
  
  // Device Information
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      required: true
    },
    os: { type: String, required: true },
    browser: { type: String, required: true },
    fingerprint: { type: String, required: true }
  },
  
  // Location Information
  location: {
    ipAddress: { type: String, required: true },
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Timestamps
  loginTime: { type: Date, required: true, default: Date.now },
  lastActivity: { type: Date, required: true, default: Date.now },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Flags
  isTrusted: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Compound Indexes
activeSessionSchema.index({ userId: 1, expiresAt: 1 });

// TTL Index - automatically delete expired sessions
activeSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
activeSessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

activeSessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Statics
activeSessionSchema.statics.findByUserId = function(userId) {
  return this.find({ userId, expiresAt: { $gt: new Date() } })
    .sort({ loginTime: -1 });
};

activeSessionSchema.statics.findByToken = function(tokenHash) {
  return this.findOne({ token: tokenHash, expiresAt: { $gt: new Date() } });
};

activeSessionSchema.statics.invalidateUserSessions = async function(userId, exceptSessionId = null) {
  const query = { userId };
  if (exceptSessionId) {
    query._id = { $ne: exceptSessionId };
  }
  return this.deleteMany(query);
};

const ActiveSession = mongoose.model('ActiveSession', activeSessionSchema);

module.exports = ActiveSession;
