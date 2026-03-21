const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 6,
    maxlength: 8
  },
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // كل مستخدم له كود واحد فقط
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: ['whatsapp', 'email', 'direct', 'copy', 'other'],
    default: 'direct'
  },
  ipAddress: String,
  deviceFingerprint: String,
  completedAt: Date,
  rewards: [{
    type: { type: String, enum: ['signup', 'first_course', 'job', 'five_courses', 'paid_subscription'] },
    points: Number,
    awardedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

referralSchema.index({ referralCode: 1 });
referralSchema.index({ referrerId: 1 });
referralSchema.index({ referredUserId: 1 });
referralSchema.index({ status: 1 });

module.exports = mongoose.models.Referral || mongoose.model('Referral', referralSchema);
