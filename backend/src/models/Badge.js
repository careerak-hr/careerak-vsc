const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  // معرف فريد للـ badge
  badgeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // اسم الـ badge
  name: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String, required: true }
  },
  
  // وصف الـ badge
  description: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String, required: true }
  },
  
  // أيقونة الـ badge (emoji أو رابط صورة)
  icon: {
    type: String,
    required: true
  },
  
  // معايير الحصول على الـ badge
  criteria: {
    // نوع المعيار
    type: {
      type: String,
      enum: [
        'courses_completed',      // عدد الدورات المكتملة
        'course_speed',           // سرعة إكمال الدورة
        'high_ratings',           // تقييمات عالية
        'specialization',         // التخصص في مجال
        'daily_login',            // تسجيل دخول يومي
        'job_obtained',           // الحصول على وظيفة
        'certificates_earned',    // عدد الشهادات
        'skills_mastered'         // إتقان مهارات
      ],
      required: true
    },
    
    // القيمة المطلوبة (عدد، مدة، إلخ)
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    
    // معايير إضافية (اختياري)
    additional: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // مستوى الندرة
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  // النقاط الممنوحة
  points: {
    type: Number,
    default: 10,
    min: 0
  },
  
  // الفئة
  category: {
    type: String,
    enum: ['learning', 'achievement', 'engagement', 'career', 'social'],
    required: true
  },
  
  // هل الـ badge نشط
  isActive: {
    type: Boolean,
    default: true
  },
  
  // ترتيب العرض
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // لون الـ badge (للعرض)
  color: {
    type: String,
    default: '#304B60'
  }
}, {
  timestamps: true
});

// ========== Indexes ==========

badgeSchema.index({ badgeId: 1 }, { unique: true });
badgeSchema.index({ category: 1, displayOrder: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ isActive: 1 });

// ========== Instance Methods ==========

/**
 * Get badge details in specific language
 * @param {String} lang - Language code (ar, en, fr)
 * @returns {Object} Badge details
 */
badgeSchema.methods.getDetails = function(lang = 'ar') {
  return {
    badgeId: this.badgeId,
    name: this.name[lang] || this.name.ar,
    description: this.description[lang] || this.description.ar,
    icon: this.icon,
    rarity: this.rarity,
    points: this.points,
    category: this.category,
    color: this.color
  };
};

/**
 * Check if user meets criteria for this badge
 * @param {Object} userStats - User statistics
 * @returns {Boolean} True if criteria met
 */
badgeSchema.methods.checkCriteria = function(userStats) {
  const { type, value, additional } = this.criteria;
  
  switch (type) {
    case 'courses_completed':
      return userStats.coursesCompleted >= value;
      
    case 'course_speed':
      // value is in days
      return userStats.fastestCourseCompletion <= value;
      
    case 'high_ratings':
      // value is { count: X, minRating: Y }
      return userStats.highRatingsCount >= value.count && 
             userStats.averageRating >= value.minRating;
      
    case 'specialization':
      // value is { category: 'X', count: Y }
      const categoryCount = userStats.coursesByCategory?.[value.category] || 0;
      return categoryCount >= value.count;
      
    case 'daily_login':
      // value is consecutive days
      return userStats.consecutiveLoginDays >= value;
      
    case 'job_obtained':
      return userStats.jobObtained === true;
      
    case 'certificates_earned':
      return userStats.certificatesEarned >= value;
      
    case 'skills_mastered':
      return userStats.skillsMastered >= value;
      
    default:
      return false;
  }
};

// ========== Static Methods ==========

/**
 * Get all active badges
 * @param {Object} options - Query options
 * @returns {Array} Array of badges
 */
badgeSchema.statics.getActiveBadges = function(options = {}) {
  const query = { isActive: true };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.rarity) {
    query.rarity = options.rarity;
  }
  
  return this.find(query)
    .sort({ displayOrder: 1, createdAt: 1 })
    .exec();
};

/**
 * Get badge by ID
 * @param {String} badgeId - Badge ID
 * @returns {Object} Badge
 */
badgeSchema.statics.getByBadgeId = function(badgeId) {
  return this.findOne({ badgeId, isActive: true }).exec();
};

/**
 * Get badges by category
 * @param {String} category - Category
 * @returns {Array} Array of badges
 */
badgeSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true })
    .sort({ displayOrder: 1 })
    .exec();
};

/**
 * Count badges by rarity
 * @returns {Object} Count by rarity
 */
badgeSchema.statics.countByRarity = async function() {
  const result = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$rarity', count: { $sum: 1 } } }
  ]);
  
  const counts = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    total: 0
  };
  
  result.forEach(item => {
    counts[item._id] = item.count;
    counts.total += item.count;
  });
  
  return counts;
};

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
