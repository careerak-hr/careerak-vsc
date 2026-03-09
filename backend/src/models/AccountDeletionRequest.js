const mongoose = require('mongoose');

const accountDeletionRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Deletion Details
  type: {
    type: String,
    enum: ['immediate', 'scheduled'],
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  
  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now
  },
  scheduledDate: {
    type: Date,
    index: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Reminders
  reminderSent: {
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

// Compound index for cron jobs
accountDeletionRequestSchema.index({ status: 1, scheduledDate: 1 });

// Update timestamp on save
accountDeletionRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);
