const mongoose = require('mongoose');
const crypto = require('crypto');

const emailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires: {
    type: Date,
    required: true,
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index لحذف السجلات المنتهية تلقائياً (بعد 30 يوم من الانتهاء)
emailVerificationSchema.index({ expires: 1 }, { expireAfterSeconds: 2592000 });

// توليد token عشوائي آمن
emailVerificationSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// التحقق من صلاحية الـ token
emailVerificationSchema.methods.isValid = function() {
  return !this.verified && this.expires > new Date();
};

// تحديد البريد كمؤكد
emailVerificationSchema.methods.markAsVerified = function() {
  this.verified = true;
  this.verifiedAt = new Date();
  return this.save();
};

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

module.exports = EmailVerification;
