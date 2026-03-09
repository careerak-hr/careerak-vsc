const mongoose = require('mongoose');

const phoneChangeRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Phone Details
  oldPhone: {
    type: String,
    required: true,
    trim: true
  },
  newPhone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Verification
  otp: {
    type: String,
    required: true,
    select: false
  }, // Hashed
  verified: {
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
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    required: true,
    index: true
  },
  completedAt: Date
}, {
  timestamps: false // Using custom createdAt
});

// TTL Index - automatically delete expired requests
phoneChangeRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save hook to set expiration (10 minutes)
phoneChangeRequestSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }
  next();
});

// Methods
phoneChangeRequestSchema.methods.verify = function() {
  this.verified = true;
  return this.save();
};

phoneChangeRequestSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

phoneChangeRequestSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

phoneChangeRequestSchema.methods.verifyOTP = async function(otp) {
  const bcrypt = require('bcryptjs');
  
  // Need to explicitly select the field
  const request = await this.constructor.findById(this._id).select('+otp');
  return bcrypt.compare(otp, request.otp);
};

// Statics
phoneChangeRequestSchema.statics.createRequest = async function(userId, oldPhone, newPhone, otp) {
  const bcrypt = require('bcryptjs');
  
  // Hash OTP
  const hashedOTP = await bcrypt.hash(otp, 10);
  
  // Delete any existing pending requests for this user
  await this.deleteMany({ userId, status: 'pending' });
  
  return this.create({
    userId,
    oldPhone,
    newPhone,
    otp: hashedOTP
  });
};

phoneChangeRequestSchema.statics.findPendingRequest = function(userId) {
  return this.findOne({
    userId,
    status: 'pending',
    expiresAt: { $gt: new Date() }
  });
};

const PhoneChangeRequest = mongoose.model('PhoneChangeRequest', phoneChangeRequestSchema);

module.exports = PhoneChangeRequest;
