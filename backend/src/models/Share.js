const mongoose = require('mongoose');

const utmParamsSchema = new mongoose.Schema({
  source: { type: String, trim: true },
  medium: { type: String, trim: true },
  campaign: { type: String, trim: true }
}, { _id: false });

const shareSchema = new mongoose.Schema({
  contentType: {
    type: String,
    enum: ['job', 'course', 'profile', 'company'],
    required: [true, 'contentType is required']
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'contentId is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  shareMethod: {
    type: String,
    enum: ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email', 'copy_link', 'internal_chat', 'native'],
    required: [true, 'shareMethod is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  utmParams: {
    type: utmParamsSchema,
    default: () => ({})
  },
  ip: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  // Use Mongoose timestamps so analytics queries can filter by createdAt/updatedAt.
  // The 'timestamp' field is kept for backward compatibility.
  timestamps: true
});

// Compound indexes for performance
shareSchema.index({ contentId: 1, contentType: 1 });
shareSchema.index({ userId: 1, timestamp: -1 });
shareSchema.index({ timestamp: -1 });

/**
 * Get total share count for a specific content item.
 * @param {string} contentType - 'job' | 'course' | 'profile' | 'company'
 * @param {ObjectId|string} contentId
 * @returns {Promise<number>}
 */
shareSchema.statics.getShareCount = function (contentType, contentId) {
  return this.countDocuments({ contentType, contentId: new mongoose.Types.ObjectId(contentId) });
};

/**
 * Get share breakdown by method for a specific content item.
 * @param {string} contentType
 * @param {ObjectId|string} contentId
 * @returns {Promise<Array<{_id: string, count: number}>>}
 */
shareSchema.statics.getSharesByMethod = function (contentType, contentId) {
  return this.aggregate([
    { $match: { contentType, contentId: new mongoose.Types.ObjectId(contentId) } },
    { $group: { _id: '$shareMethod', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Share', shareSchema);
