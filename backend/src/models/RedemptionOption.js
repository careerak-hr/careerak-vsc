const mongoose = require('mongoose');

/**
 * RedemptionOption Model - خيارات استبدال النقاط
 * Requirements: 3.1, 3.2, 3.3
 */
const redemptionOptionSchema = new mongoose.Schema({
  optionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  pointsCost: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['discount', 'feature', 'subscription'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDays: {
    type: Number,
    default: 30,
    min: 1
  }
}, { timestamps: true });

redemptionOptionSchema.index({ optionId: 1 });
redemptionOptionSchema.index({ isActive: 1 });
redemptionOptionSchema.index({ type: 1 });
redemptionOptionSchema.index({ pointsCost: 1 });

module.exports = mongoose.models.RedemptionOption || mongoose.model('RedemptionOption', redemptionOptionSchema);
