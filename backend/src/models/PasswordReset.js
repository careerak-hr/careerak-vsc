const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
  used: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index لحذف السجلات المنتهية تلقائياً
passwordResetSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// توليد token عشوائي آمن
passwordResetSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// التحقق من صلاحية الـ token
passwordResetSchema.methods.isValid = function() {
  return !this.used && this.expires > new Date();
};

// تحديد الـ token كمستخدم
passwordResetSchema.methods.markAsUsed = function() {
  this.used = true;
  return this.save();
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
