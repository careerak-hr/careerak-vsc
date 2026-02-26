/**
 * 🤖 Recommendation Model
 * نموذج توصيات الذكاء الاصطناعي
 * 
 * يخزن التوصيات المولدة للمستخدمين (وظائف، دورات، مرشحين)
 * مع نسب التطابق وأسباب التوصية (explainable AI)
 * 
 * المتطلبات: 1.3, 1.4 (شرح سبب التوصية، نسبة التطابق)
 */

const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  // المستخدم المستهدف
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // نوع العنصر الموصى به
  itemType: {
    type: String,
    enum: ['job', 'course', 'candidate'],
    required: true,
    index: true
  },
  
  // العنصر الموصى به
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    refPath: 'itemType' // مرجع ديناميكي حسب itemType
  },
  
  // درجة التطابق (0-100)
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  
  // ثقة النموذج في التوصية (0-1)
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  
  // أسباب التوصية (explainable AI)
  reasons: [{
    type: {
      type: String,
      enum: ['skills', 'experience', 'education', 'location', 'salary', 'jobType', 'interests', 'behavior'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    strength: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // الميزات المستخدمة في التوصية
  features: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // إصدار النموذج المستخدم
  modelVersion: {
    type: String,
    default: '1.0'
  },
  
  // معلومات إضافية
  metadata: {
    algorithm: {
      type: String,
      enum: ['content_based', 'collaborative', 'hybrid'],
      default: 'content_based'
    },
    ranking: {
      type: Number,
      default: 0
    },
    seen: {
      type: Boolean,
      default: false
    },
    clicked: {
      type: Boolean,
      default: false
    },
    applied: {
      type: Boolean,
      default: false
    }
  },
  
  // تاريخ انتهاء الصلاحية (للتحديث التلقائي)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // أسبوع واحد
    index: { expires: 0 } // TTL index
  },
  
  // التواريخ
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// فهارس مركبة للأداء
recommendationSchema.index({ userId: 1, itemType: 1, score: -1 });
recommendationSchema.index({ userId: 1, 'metadata.seen': 1, score: -1 });
recommendationSchema.index({ itemType: 1, itemId: 1, userId: 1 }, { unique: true });

// Middleware لتحديث updatedAt
recommendationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware لتحديث المرجع الديناميكي
recommendationSchema.pre('save', function(next) {
  if (this.isModified('itemType')) {
    // تحديث المرجع بناءً على itemType
    this.constructor.schema.path('itemId').ref = this.itemType;
  }
  next();
});

// طرق المثيل
recommendationSchema.methods = {
  /**
   * تحديث حالة التوصية (رؤية، نقر، تقديم)
   */
  updateStatus(action) {
    switch (action) {
      case 'view':
        this.metadata.seen = true;
        break;
      case 'click':
        this.metadata.clicked = true;
        break;
      case 'apply':
        this.metadata.applied = true;
        break;
    }
    return this.save();
  },
  
  /**
   * الحصول على أسباب التوصية بصيغة مقروءة
   */
  getFormattedReasons() {
    return this.reasons.map(reason => ({
      type: reason.type,
      message: reason.message,
      strength: reason.strength,
      icon: this.getReasonIcon(reason.type)
    }));
  },
  
  /**
   * الحصول على أيقونة السبب
   */
  getReasonIcon(type) {
    const icons = {
      skills: '💻',
      experience: '📊',
      education: '🎓',
      location: '📍',
      salary: '💰',
      jobType: '⚙️',
      interests: '❤️',
      behavior: '📈'
    };
    return icons[type] || '📌';
  },
  
  /**
   * التحقق من صلاحية التوصية
   */
  isValid() {
    return this.expiresAt > new Date();
  }
};

// طرق ثابتة
recommendationSchema.statics = {
  /**
   * جلب توصيات مستخدم مع فلترة
   */
  async getUserRecommendations(userId, options = {}) {
    const {
      itemType = 'job',
      limit = 20,
      minScore = 30,
      includeSeen = false,
      sortBy = 'score'
    } = options;
    
    const query = {
      userId,
      itemType,
      score: { $gte: minScore },
      expiresAt: { $gt: new Date() }
    };
    
    if (!includeSeen) {
      query['metadata.seen'] = false;
    }
    
    const sort = {};
    sort[sortBy] = -1; // ترتيب تنازلي
    
    return this.find(query)
      .sort(sort)
      .limit(limit)
      .populate('itemId')
      .exec();
  },
  
  /**
   * حذف التوصيات القديمة
   */
  async cleanupOldRecommendations(days = 30) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
  },
  
  /**
   * تحديث توصيات مستخدم
   */
  async updateUserRecommendations(userId, recommendations) {
    // حذف التوصيات القديمة
    await this.deleteMany({ userId });
    
    // إضافة التوصيات الجديدة
    return this.insertMany(recommendations);
  },
  
  /**
   * إحصاءات التوصيات
   */
  async getRecommendationStats(userId) {
    const stats = await this.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$itemType',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          seenCount: {
            $sum: { $cond: ['$metadata.seen', 1, 0] }
          },
          clickedCount: {
            $sum: { $cond: ['$metadata.clicked', 1, 0] }
          },
          appliedCount: {
            $sum: { $cond: ['$metadata.applied', 1, 0] }
          }
        }
      }
    ]);
    
    return stats.reduce((acc, stat) => {
      acc[stat._id] = stat;
      return acc;
    }, {});
  }
};

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;