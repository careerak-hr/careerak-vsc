const mongoose = require('mongoose');

const sharesByDateSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  count: { type: Number, default: 0 }
}, { _id: false });

const shareAnalyticsSchema = new mongoose.Schema({
  contentType: {
    type: String,
    enum: ['job', 'course', 'profile', 'company'],
    required: [true, 'contentType is required']
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'contentId is required']
  },
  totalShares: {
    type: Number,
    default: 0
  },
  sharesByMethod: {
    type: Map,
    of: Number,
    default: () => new Map()
  },
  sharesByDate: {
    type: [sharesByDateSchema],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Unique compound index on (contentType, contentId)
shareAnalyticsSchema.index({ contentType: 1, contentId: 1 }, { unique: true });

/**
 * Increment share analytics for a content item.
 * Upserts the document, increments totalShares, increments sharesByMethod[shareMethod],
 * and adds/updates today's entry in sharesByDate.
 *
 * @param {string} contentType - 'job' | 'course' | 'profile' | 'company'
 * @param {ObjectId|string} contentId
 * @param {string} shareMethod - e.g. 'facebook', 'copy_link', etc.
 * @returns {Promise<Document>}
 */
shareAnalyticsSchema.statics.incrementShare = async function (contentType, contentId, shareMethod) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First upsert: increment totalShares and update lastUpdated
  await this.findOneAndUpdate(
    { contentType, contentId },
    {
      $inc: { totalShares: 1, [`sharesByMethod.${shareMethod}`]: 1 },
      $set: { lastUpdated: new Date() }
    },
    { upsert: true, new: true }
  );

  // Update today's date entry in sharesByDate array
  const updated = await this.findOneAndUpdate(
    { contentType, contentId, 'sharesByDate.date': today },
    { $inc: { 'sharesByDate.$.count': 1 } },
    { new: true }
  );

  // If today's entry didn't exist, push a new one
  if (!updated) {
    return this.findOneAndUpdate(
      { contentType, contentId },
      { $push: { sharesByDate: { date: today, count: 1 } } },
      { new: true }
    );
  }

  return updated;
};

/**
 * Get the analytics document for a content item.
 *
 * @param {string} contentType
 * @param {ObjectId|string} contentId
 * @returns {Promise<Document|null>}
 */
shareAnalyticsSchema.statics.getAnalytics = function (contentType, contentId) {
  return this.findOne({ contentType, contentId });
};

/**
 * Get top shared content of a given type in the last N days.
 *
 * @param {string} contentType - 'job' | 'course' | 'profile' | 'company'
 * @param {number} limit - number of results to return
 * @param {number} days - look back window in days
 * @returns {Promise<Array>}
 */
shareAnalyticsSchema.statics.getTopContent = function (contentType, limit = 10, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  return this.aggregate([
    { $match: { contentType } },
    {
      $project: {
        contentId: 1,
        contentType: 1,
        totalShares: 1,
        recentShares: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$sharesByDate',
                  as: 'entry',
                  cond: { $gte: ['$$entry.date', since] }
                }
              },
              as: 'filtered',
              in: '$$filtered.count'
            }
          }
        }
      }
    },
    { $sort: { recentShares: -1, totalShares: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('ShareAnalytics', shareAnalyticsSchema);
