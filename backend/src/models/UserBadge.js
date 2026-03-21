const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  // المستخدم
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // الـ badge
  badgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  
  // تاريخ الحصول على الـ badge
  earnedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // التقدم (للـ badges التدريجية)
  progress: {
    current: {
      type: Number,
      default: 0
    },
    target: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // هل يتم عرض الـ badge في الملف الشخصي
  isDisplayed: {
    type: Boolean,
    default: true
  },
  
  // هل تم إرسال إشعار
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  // تاريخ إرسال الإشعار
  notificationSentAt: {
    type: Date,
    default: null
  },
  
  // معلومات إضافية عن كيفية الحصول على الـ badge
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// ========== Indexes ==========

// Index for user's badges
userBadgeSchema.index({ userId: 1, earnedAt: -1 });

// Index for badge holders
userBadgeSchema.index({ badgeId: 1, earnedAt: -1 });

// Compound unique index (user can only earn each badge once)
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Index for displayed badges
userBadgeSchema.index({ userId: 1, isDisplayed: 1 });

// ========== Instance Methods ==========

/**
 * Update progress
 * @param {Number} current - Current progress value
 * @param {Number} target - Target value
 */
userBadgeSchema.methods.updateProgress = function(current, target) {
  this.progress.current = current;
  this.progress.target = target;
  this.progress.percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
};

/**
 * Mark notification as sent
 */
userBadgeSchema.methods.markNotificationSent = function() {
  this.notificationSent = true;
  this.notificationSentAt = new Date();
};

/**
 * Toggle display status
 */
userBadgeSchema.methods.toggleDisplay = function() {
  this.isDisplayed = !this.isDisplayed;
};

/**
 * Get badge details with populated badge info
 * @param {String} lang - Language code
 * @returns {Object} Badge details
 */
userBadgeSchema.methods.getDetails = async function(lang = 'ar') {
  await this.populate('badgeId');
  
  if (!this.badgeId) {
    return null;
  }
  
  return {
    userBadgeId: this._id,
    badge: this.badgeId.getDetails(lang),
    earnedAt: this.earnedAt,
    progress: this.progress,
    isDisplayed: this.isDisplayed
  };
};

// ========== Static Methods ==========

/**
 * Get user's badges
 * @param {String} userId - User ID
 * @param {Object} options - Query options
 * @returns {Array} Array of user badges
 */
userBadgeSchema.statics.getUserBadges = function(userId, options = {}) {
  const query = { userId };
  
  if (options.isDisplayed !== undefined) {
    query.isDisplayed = options.isDisplayed;
  }
  
  return this.find(query)
    .populate('badgeId')
    .sort({ earnedAt: -1 })
    .exec();
};

/**
 * Check if user has badge
 * @param {String} userId - User ID
 * @param {String} badgeId - Badge ID
 * @returns {Boolean} True if user has badge
 */
userBadgeSchema.statics.hasBadge = async function(userId, badgeId) {
  const userBadge = await this.findOne({ userId, badgeId });
  return !!userBadge;
};

/**
 * Award badge to user
 * @param {String} userId - User ID
 * @param {String} badgeId - Badge ID
 * @param {Object} metadata - Additional metadata
 * @returns {Object} User badge
 */
userBadgeSchema.statics.awardBadge = async function(userId, badgeId, metadata = {}) {
  // Check if user already has this badge
  const existing = await this.findOne({ userId, badgeId });
  if (existing) {
    return existing;
  }
  
  // Create new user badge
  const userBadge = new this({
    userId,
    badgeId,
    metadata
  });
  
  await userBadge.save();
  return userBadge;
};

/**
 * Get badges that need notification
 * @param {Number} limit - Limit
 * @returns {Array} Array of user badges
 */
userBadgeSchema.statics.getBadgesNeedingNotification = function(limit = 100) {
  return this.find({ notificationSent: false })
    .populate('userId', 'firstName lastName email')
    .populate('badgeId')
    .limit(limit)
    .exec();
};

/**
 * Count user's badges by category
 * @param {String} userId - User ID
 * @returns {Object} Count by category
 */
userBadgeSchema.statics.countByCategory = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'badges',
        localField: 'badgeId',
        foreignField: '_id',
        as: 'badge'
      }
    },
    { $unwind: '$badge' },
    { $group: { _id: '$badge.category', count: { $sum: 1 } } }
  ]);
  
  const counts = {
    learning: 0,
    achievement: 0,
    engagement: 0,
    career: 0,
    social: 0,
    total: 0
  };
  
  result.forEach(item => {
    counts[item._id] = item.count;
    counts.total += item.count;
  });
  
  return counts;
};

/**
 * Get user's total points from badges
 * @param {String} userId - User ID
 * @returns {Number} Total points
 */
userBadgeSchema.statics.getTotalPoints = async function(userId) {
  const result = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'badges',
        localField: 'badgeId',
        foreignField: '_id',
        as: 'badge'
      }
    },
    { $unwind: '$badge' },
    { $group: { _id: null, totalPoints: { $sum: '$badge.points' } } }
  ]);
  
  return result.length > 0 ? result[0].totalPoints : 0;
};

/**
 * Get leaderboard (top users by badge points)
 * @param {Number} limit - Limit
 * @returns {Array} Array of users with points
 */
userBadgeSchema.statics.getLeaderboard = async function(limit = 10) {
  const result = await this.aggregate([
    {
      $lookup: {
        from: 'badges',
        localField: 'badgeId',
        foreignField: '_id',
        as: 'badge'
      }
    },
    { $unwind: '$badge' },
    {
      $group: {
        _id: '$userId',
        totalPoints: { $sum: '$badge.points' },
        badgeCount: { $sum: 1 }
      }
    },
    { $sort: { totalPoints: -1, badgeCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        totalPoints: 1,
        badgeCount: 1,
        user: {
          firstName: 1,
          lastName: 1,
          profileImage: 1
        }
      }
    }
  ]);
  
  return result;
};

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = UserBadge;
