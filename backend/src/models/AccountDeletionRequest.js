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
  reason: String,
  
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
    required: true,
    default: Date.now
  },
  scheduledDate: Date, // 30 days after request for scheduled deletions
  completedAt: Date,
  cancelledAt: Date,
  
  // Reminders
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound Indexes
accountDeletionRequestSchema.index({ status: 1, scheduledDate: 1 });
accountDeletionRequestSchema.index({ scheduledDate: 1 });

// Pre-save hook to set scheduledDate for scheduled deletions
accountDeletionRequestSchema.pre('save', function(next) {
  if (this.isNew && this.type === 'scheduled' && !this.scheduledDate) {
    // Set scheduled date to 30 days from now
    this.scheduledDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Methods
accountDeletionRequestSchema.methods.cancel = function() {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  return this.save();
};

accountDeletionRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

accountDeletionRequestSchema.methods.markReminderSent = function() {
  this.reminderSent = true;
  return this.save();
};

accountDeletionRequestSchema.methods.getDaysRemaining = function() {
  if (!this.scheduledDate || this.status !== 'pending') {
    return 0;
  }
  const now = new Date();
  const diff = this.scheduledDate - now;
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
};

accountDeletionRequestSchema.methods.shouldSendReminder = function() {
  if (this.status !== 'pending' || this.reminderSent || !this.scheduledDate) {
    return false;
  }
  const daysRemaining = this.getDaysRemaining();
  return daysRemaining === 7;
};

accountDeletionRequestSchema.methods.isReadyForDeletion = function() {
  if (this.status !== 'pending') {
    return false;
  }
  if (this.type === 'immediate') {
    return true;
  }
  return this.scheduledDate && new Date() >= this.scheduledDate;
};

// Statics
accountDeletionRequestSchema.statics.findPendingDeletions = function() {
  return this.find({
    status: 'pending',
    scheduledDate: { $lte: new Date() }
  });
};

accountDeletionRequestSchema.statics.findDeletionsNeedingReminder = function() {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const eightDaysFromNow = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'pending',
    reminderSent: false,
    scheduledDate: {
      $gte: sevenDaysFromNow,
      $lt: eightDaysFromNow
    }
  });
};

const AccountDeletionRequest = mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);

module.exports = AccountDeletionRequest;
