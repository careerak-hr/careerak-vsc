const mongoose = require('mongoose');

const activeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String, // JWT token hash
    required: true,
    unique: true,
    index: true
  },
  
  // Device Information
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      required: true
    },
    os: {
      type: String,
      required: true
    },
    browser: {
      type: String,
      required: true
    },
    fingerprint: {
      type: String
    }
  },
  
  // Location Information
  location: {
    ipAddress: {
      type: String,
      required: true
    },
    country: {
      type: String
    },
    city: {
      type: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Timestamps
  loginTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  
  // Flags
  isTrusted: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
activeSessionSchema.index({ userId: 1, expiresAt: 1 });
activeSessionSchema.index({ userId: 1, lastActivity: -1 });

// TTL index - automatically delete expired sessions
activeSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Update timestamp on save
activeSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ActiveSession', activeSessionSchema);
