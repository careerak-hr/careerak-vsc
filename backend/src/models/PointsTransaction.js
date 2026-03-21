const mongoose = require('mongoose');

const pointsTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['earn', 'redeem', 'expire'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balance: {
    type: Number,
    required: true // الرصيد بعد المعاملة
  },
  source: {
    type: String,
    enum: ['referral_signup', 'referral_first_course', 'referral_job', 'referral_five_courses', 'referral_paid_subscription', 'welcome_bonus', 'redemption', 'expiry', 'admin'],
    required: true
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    default: null
  },
  redemptionId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

pointsTransactionSchema.index({ userId: 1, createdAt: -1 });
pointsTransactionSchema.index({ referralId: 1 });

module.exports = mongoose.models.PointsTransaction || mongoose.model('PointsTransaction', pointsTransactionSchema);
