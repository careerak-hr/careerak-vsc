const mongoose = require('mongoose');

const emailChangeRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Email Details
  oldEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  newEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  
  // Verification
  oldEmailOTP: {
    type: String, // Hashed
    required: true
  },
  newEmailOTP: {
    type: String, // Hashed
    required: true
  },
  oldEmailVerified: {
    type: Boolean,
    default: false
  },
  newEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending',
    index: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  completedAt: {
    type: Date
  }
});

// TTL index - automatically delete expired requests
emailChangeRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient queries
emailChangeRequestSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('EmailChangeRequest', emailChangeRequestSchema);
