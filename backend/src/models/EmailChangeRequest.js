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
    type: String,
    required: true,
    select: false
  }, // Hashed
  newEmailOTP: {
    type: String,
    required: true,
    select: false
  }, // Hashed
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
    default: Date.now,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  completedAt: Date
}, {
  timestamps: false // Using custom createdAt
});

// TTL Index - automatically delete expired requests
emailChangeRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save hook to set expiration (15 minutes)
emailChangeRequestSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  }
  next();
});

// Methods
emailChangeRequestSchema.methods.verifyOldEmail = function() {
  this.oldEmailVerified = true;
  return this.save();
};

emailChangeRequestSchema.methods.verifyNewEmail = function() {
  this.newEmailVerified = true;
  return this.save();
};

emailChangeRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

emailChangeRequestSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

emailChangeRequestSchema.methods.isBothEmailsVerified = function() {
  return this.oldEmailVerified && this.newEmailVerified;
};

emailChangeRequestSchema.methods.verifyOTP = async function(email, otp) {
  const bcrypt = require('bcryptjs');
  
  if (email === this.oldEmail) {
    // Need to explicitly select the field
    const request = await this.constructor.findById(this._id).select('+oldEmailOTP');
    return bcrypt.compare(otp, request.oldEmailOTP);
  } else if (email === this.newEmail) {
    const request = await this.constructor.findById(this._id).select('+newEmailOTP');
    return bcrypt.compare(otp, request.newEmailOTP);
  }
  return false;
};

// Statics
emailChangeRequestSchema.statics.createRequest = async function(userId, oldEmail, newEmail, oldOTP, newOTP) {
  const bcrypt = require('bcryptjs');
  
  // Hash OTPs
  const hashedOldOTP = await bcrypt.hash(oldOTP, 10);
  const hashedNewOTP = await bcrypt.hash(newOTP, 10);
  
  // Delete any existing pending requests for this user
  await this.deleteMany({ userId, status: 'pending' });
  
  return this.create({
    userId,
    oldEmail,
    newEmail,
    oldEmailOTP: hashedOldOTP,
    newEmailOTP: hashedNewOTP
  });
};

emailChangeRequestSchema.statics.findPendingRequest = function(userId) {
  return this.findOne({
    userId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
};

const EmailChangeRequest = mongoose.model('EmailChangeRequest', emailChangeRequestSchema);

module.exports = EmailChangeRequest;
