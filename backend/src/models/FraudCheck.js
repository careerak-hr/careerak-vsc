const mongoose = require('mongoose');

const fraudCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
    default: null
  },
  suspicionScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  flags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['clean', 'suspicious', 'blocked'],
    default: 'clean'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  reviewNote: {
    type: String,
    default: null
  }
}, { timestamps: true });

fraudCheckSchema.index({ userId: 1 });
fraudCheckSchema.index({ status: 1 });
fraudCheckSchema.index({ referralId: 1 });
fraudCheckSchema.index({ createdAt: -1 });

module.exports = mongoose.models.FraudCheck || mongoose.model('FraudCheck', fraudCheckSchema);
