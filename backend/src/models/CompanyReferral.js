const mongoose = require('mongoose');

/**
 * CompanyReferral Model - نموذج إحالة الشركات
 * نظام إحالة منفصل للشركات بمكافآت أعلى
 * Requirements: 5.1, 5.2, 5.3
 */
const companyReferralSchema = new mongoose.Schema({
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 6,
    maxlength: 10
  },
  referrerCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // كل شركة لها كود واحد فقط
  },
  referredCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  ipAddress: {
    type: String,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  // مصفوفة المكافآت المكتسبة
  rewards: [{
    type: {
      type: String,
      enum: ['company_signup', 'first_job_post', 'successful_hire', 'annual_subscription']
    },
    points: Number,
    awardedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

companyReferralSchema.index({ referralCode: 1 });
companyReferralSchema.index({ referrerCompanyId: 1 });
companyReferralSchema.index({ referredCompanyId: 1 });
companyReferralSchema.index({ status: 1 });

module.exports = mongoose.models.CompanyReferral || mongoose.model('CompanyReferral', companyReferralSchema);
