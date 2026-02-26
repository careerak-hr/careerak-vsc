/**
 * 🤖 UserInteraction Model
 * نموذج تتبع تفاعلات المستخدم مع التوصيات
 * 
 * يخزن جميع تفاعلات المستخدم (view, like, apply, ignore, save) مع التوصيات
 * مع تتبع مدة المشاهدة والوقت والسياق
 * 
 * المتطلبات: 6.1 (تتبع جميع التفاعلات)
 */

const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
  // المستخدم الذي قام بالتفاعل
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // نوع العنصر (job, course, candidate)
  itemType: {
    type: String,
    enum: ['job', 'course', 'candidate'],
    required: true,
    index: true
  },
  
  // العنصر الذي تم التفاعل معه
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    refPath: 'itemType' // مرجع ديناميكي حسب itemType
  },
  
  // نوع التفاعل
  action: {
    type: String,
    enum: ['view', 'like', 'apply', 'ignore', 'save'],
    required: true,
    index: true
  },
  
  // مدة المشاهدة (بالثواني) - فقط لتفاعلات view
  duration: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // وقت التفاعل
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // سياق التفاعل (بيانات إضافية)
  context: {
    // صفحة المصدر
    sourcePage: {
      type: String,
      enum: ['recommendations', 'search', 'job_details', 'course_details', 'profile', 'home', 'other'],
      default: 'recommendations'
    },
    
    // طريقة العرض
    displayType: {
      type: String,
      enum: ['list', 'card', 'detailed', 'notification', 'email', 'other'],
      default: 'list'
    },
    
    // موقع العنصر في القائمة
    position: {
      type: Number,
      min: 0,
      default: 0
    },
    
    // درجة التطابق الأصلية
    originalScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    // معلومات إضافية
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // معلومات الجلسة
  session: {
    sessionId: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'other'],
      default: 'desktop'
    },
    browser: String,
    platform: String
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
userInteractionSchema.index({ userId: 1, itemType: 1, action: 1, timestamp: -1 });
userInteractionSchema.index({ itemType: 1, itemId: 1, action: 1 });
userInteractionSchema.index({ userId: 1, 'context.sourcePage': 1, timestamp: -1 });
userInteractionSchema.index({ userId: 1, itemId: 1, action: 1 }, { unique: false });

// Middleware لتحديث updatedAt
userInteractionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware لتحديث المرجع الديناميكي
userInteractionSchema.pre('save', function(next) {
  if (this.isModified('itemType')) {
    // تحديث المرجع بناءً على itemType
    this.constructor.schema.path('itemId').ref = this.itemType;
  }
  next();
});

// طرق المثيل
userInteractionSchema.methods = {
  /**
   * الحصول على تفاصيل التفاعل بصيغة مقروءة
   */
  getFormattedDetails() {
    const actionLabels = {
      'view': 'مشاهدة',
      'like': 'إعجاب',
      'apply': 'تقديم',
      'ignore': 'تجاهل',
      'save': 'حفظ'
    };
    
    const sourceLabels = {
      'recommendations': 'صفحة التوصيات',
      'search': 'نتائج البحث',
      'job_details': 'تفاصيل الوظيفة',
      'course_details': 'تفاصيل الدورة',
      'profile': 'الملف الشخصي',
      'home': 'الصفحة الرئيسية',
      'other': 'أخرى'
    };
    
    return {
      action: actionLabels[this.action] || this.action,
      source: sourceLabels[this.context.sourcePage] || this.context.sourcePage,
      duration: this.duration > 0 ? `${this.duration} ثانية` : 'غير محدد',
      timestamp: this.timestamp.toLocaleString('ar-SA'),
      position: this.context.position > 0 ? `المركز ${this.context.position}` : 'غير محدد'
    };
  },
  
  /**
   * التحقق مما إذا كان التفاعل إيجابياً (like, apply, save)
   */
  isPositiveInteraction() {
    return ['like', 'apply', 'save'].includes(this.action);
  },
  
  /**
   * التحقق مما إذا كان التفاعل سلبياً (ignore)
   */
  isNegativeInteraction() {
    return this.action === 'ignore';
  },
  
  /**
   * التحقق مما إذا كان التفاعل محايداً (view)
   */
  isNeutralInteraction() {
    return this.action === 'view';
  },
  
  /**
   * الحصول على وزن التفاعل للتوصيات
   */
  getInteractionWeight() {
    const weights = {
      'apply': 2.0,  // تقديم = وزن عالي
      'like': 1.5,   // إعجاب = وزن متوسط
      'save': 1.2,   // حفظ = وزن متوسط منخفض
      'view': 0.5,   // مشاهدة = وزن منخفض
      'ignore': -1.0 // تجاهل = وزن سلبي
    };
    
    return weights[this.action] || 0;
  }
};

// طرق ثابتة
userInteractionSchema.statics = {
  /**
   * تسجيل تفاعل جديد
   */
  async logInteraction(userId, itemType, itemId, action, options = {}) {
    const interactionData = {
      userId,
      itemType,
      itemId,
      action,
      duration: options.duration || 0,
      context: {
        sourcePage: options.sourcePage || 'recommendations',
        displayType: options.displayType || 'list',
        position: options.position || 0,
        originalScore: options.originalScore || 0,
        metadata: options.metadata || {}
      },
      session: {
        sessionId: options.sessionId,
        deviceType: options.deviceType || 'desktop',
        browser: options.browser,
        platform: options.platform
      }
    };
    
    // التحقق من عدم وجود تفاعل مكرر حديث
    const existingInteraction = await this.findOne({
      userId,
      itemType,
      itemId,
      action,
      timestamp: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // آخر 5 دقائق
    });
    
    if (existingInteraction) {
      // تحديث التفاعل الموجود
      existingInteraction.duration = Math.max(existingInteraction.duration, interactionData.duration);
      existingInteraction.context = { ...existingInteraction.context, ...interactionData.context };
      existingInteraction.updatedAt = new Date();
      return existingInteraction.save();
    }
    
    // إنشاء تفاعل جديد
    return this.create(interactionData);
  },
  
  /**
   * جلب تفاعلات مستخدم مع فلترة
   */
  async getUserInteractions(userId, options = {}) {
    const {
      itemType,
      action,
      startDate,
      endDate,
      limit = 100,
      skip = 0,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options;
    
    const query = { userId };
    
    if (itemType) query.itemType = itemType;
    if (action) query.action = action;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    return this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('itemId')
      .exec();
  },
  
  /**
   * إحصاءات تفاعلات مستخدم
   */
  async getUserInteractionStats(userId, options = {}) {
    const { itemType, startDate, endDate } = options;
    
    const match = { userId };
    if (itemType) match.itemType = itemType;
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }
    
    const stats = await this.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            action: '$action',
            itemType: '$itemType'
          },
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' },
          avgScore: { $avg: '$context.originalScore' }
        }
      },
      {
        $group: {
          _id: '$_id.itemType',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count',
              totalDuration: '$totalDuration',
              avgDuration: '$avgDuration',
              avgScore: '$avgScore'
            }
          },
          totalInteractions: { $sum: '$count' },
          totalDuration: { $sum: '$totalDuration' }
        }
      }
    ]);
    
    return stats.reduce((acc, stat) => {
      acc[stat._id] = {
        actions: stat.actions.reduce((actionsAcc, actionStat) => {
          actionsAcc[actionStat.action] = {
            count: actionStat.count,
            totalDuration: actionStat.totalDuration,
            avgDuration: actionStat.avgDuration,
            avgScore: actionStat.avgScore
          };
          return actionsAcc;
        }, {}),
        totalInteractions: stat.totalInteractions,
        totalDuration: stat.totalDuration
      };
      return acc;
    }, {});
  },
  
  /**
   * تحليل تفضيلات المستخدم من التفاعلات
   */
  async analyzeUserPreferences(userId, options = {}) {
    const { itemType = 'job', limit = 50 } = options;
    
    // جلب التفاعلات الإيجابية
    const positiveInteractions = await this.find({
      userId,
      itemType,
      action: { $in: ['like', 'apply', 'save'] }
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('itemId')
      .exec();
    
    // جلب التفاعلات السلبية
    const negativeInteractions = await this.find({
      userId,
      itemType,
      action: 'ignore'
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('itemId')
      .exec();
    
    // استخراج الأنماط
    const preferences = {
      likedItems: positiveInteractions.map(interaction => interaction.itemId),
      ignoredItems: negativeInteractions.map(interaction => interaction.itemId),
      positiveCount: positiveInteractions.length,
      negativeCount: negativeInteractions.length,
      lastUpdated: new Date()
    };
    
    return preferences;
  },
  
  /**
   * حساب معدل التحويل (CTR) للمستخدم
   */
  async calculateConversionRate(userId, options = {}) {
    const { itemType = 'job', startDate, endDate } = options;
    
    const match = { userId, itemType };
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = new Date(startDate);
      if (endDate) match.timestamp.$lte = new Date(endDate);
    }
    
    const stats = await this.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalViews: {
            $sum: { $cond: [{ $eq: ['$action', 'view'] }, 1, 0] }
          },
          totalLikes: {
            $sum: { $cond: [{ $eq: ['$action', 'like'] }, 1, 0] }
          },
          totalApplies: {
            $sum: { $cond: [{ $eq: ['$action', 'apply'] }, 1, 0] }
          },
          totalSaves: {
            $sum: { $cond: [{ $eq: ['$action', 'save'] }, 1, 0] }
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return {
        viewToLike: 0,
        viewToApply: 0,
        viewToSave: 0,
        likeToApply: 0
      };
    }
    
    const stat = stats[0];
    return {
      viewToLike: stat.totalViews > 0 ? (stat.totalLikes / stat.totalViews) * 100 : 0,
      viewToApply: stat.totalViews > 0 ? (stat.totalApplies / stat.totalViews) * 100 : 0,
      viewToSave: stat.totalViews > 0 ? (stat.totalSaves / stat.totalViews) * 100 : 0,
      likeToApply: stat.totalLikes > 0 ? (stat.totalApplies / stat.totalLikes) * 100 : 0,
      totalViews: stat.totalViews,
      totalLikes: stat.totalLikes,
      totalApplies: stat.totalApplies,
      totalSaves: stat.totalSaves
    };
  },
  
  /**
   * حذف التفاعلات القديمة
   */
  async cleanupOldInteractions(days = 90) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
  }
};

const UserInteraction = mongoose.model('UserInteraction', userInteractionSchema);

module.exports = UserInteraction;