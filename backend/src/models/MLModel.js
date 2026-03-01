/**
 * 🤖 MLModel Model
 * نموذج نماذج التعلم الآلي
 * 
 * يخزن معلومات نماذج ML المستخدمة في التوصيات
 * مع مقاييس الأداء وإصدارات النماذج
 * 
 * المتطلبات: جميع المتطلبات التقنية
 */

const mongoose = require('mongoose');

const mlModelSchema = new mongoose.Schema({
  // معرف النموذج الفريد
  modelId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // نوع النموذج
  modelType: {
    type: String,
    enum: ['content_based', 'collaborative', 'hybrid', 'cv_parser', 'skill_extractor', 'profile_analyzer'],
    required: true,
    index: true
  },
  
  // إصدار النموذج
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  
  // وصف النموذج
  description: {
    type: String,
    default: ''
  },
  
  // مقاييس الأداء
  metrics: {
    // دقة النموذج (0-1)
    accuracy: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // الدقة (Precision)
    precision: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // الاستدعاء (Recall)
    recall: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // F1 Score
    f1Score: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // NDCG (Normalized Discounted Cumulative Gain)
    ndcg: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // MRR (Mean Reciprocal Rank)
    mrr: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // CTR (Click-Through Rate)
    ctr: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // معدل التحويل (Conversion Rate)
    conversionRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    
    // مقاييس إضافية
    additional: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // معلومات التدريب
  training: {
    // تاريخ التدريب
    trainedAt: {
      type: Date,
      default: Date.now
    },
    
    // حجم بيانات التدريب
    trainingDataSize: {
      type: Number,
      default: 0
    },
    
    // حجم بيانات الاختبار
    testDataSize: {
      type: Number,
      default: 0
    },
    
    // مدة التدريب (بالثواني)
    trainingDuration: {
      type: Number,
      default: 0
    },
    
    // عدد الحقب (Epochs)
    epochs: {
      type: Number,
      default: 0
    },
    
    // معلومات إضافية
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // المعاملات الفائقة (Hyperparameters)
  hyperparameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // الميزات المستخدمة (Features)
  features: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['numerical', 'categorical', 'text', 'embedding', 'boolean'],
      required: true
    },
    importance: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    description: String
  }],
  
  // حالة النموذج
  status: {
    type: String,
    enum: ['training', 'testing', 'active', 'inactive', 'deprecated', 'failed'],
    default: 'training',
    index: true
  },
  
  // هل النموذج نشط حالياً؟
  isActive: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // مسار ملف النموذج (إذا كان محفوظاً)
  modelPath: {
    type: String,
    default: ''
  },
  
  // حجم ملف النموذج (بالبايت)
  modelSize: {
    type: Number,
    default: 0
  },
  
  // معلومات النشر
  deployment: {
    // تاريخ النشر
    deployedAt: Date,
    
    // البيئة (development, staging, production)
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development'
    },
    
    // عدد الطلبات
    requestCount: {
      type: Number,
      default: 0
    },
    
    // متوسط وقت الاستجابة (بالميلي ثانية)
    avgResponseTime: {
      type: Number,
      default: 0
    },
    
    // معدل الأخطاء
    errorRate: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },
  
  // سجل التحديثات
  updateHistory: [{
    version: String,
    updatedAt: Date,
    changes: String,
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // ملاحظات
  notes: {
    type: String,
    default: ''
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
mlModelSchema.index({ modelType: 1, isActive: 1 });
mlModelSchema.index({ modelType: 1, version: 1 });
mlModelSchema.index({ status: 1, isActive: 1 });
mlModelSchema.index({ 'training.trainedAt': -1 });

// Middleware لتحديث updatedAt
mlModelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// طرق المثيل
mlModelSchema.methods = {
  /**
   * تفعيل النموذج
   */
  async activate() {
    // إلغاء تفعيل النماذج الأخرى من نفس النوع
    await this.constructor.updateMany(
      { modelType: this.modelType, isActive: true },
      { isActive: false, status: 'inactive' }
    );
    
    // تفعيل هذا النموذج
    this.isActive = true;
    this.status = 'active';
    this.deployment.deployedAt = new Date();
    
    return this.save();
  },
  
  /**
   * إلغاء تفعيل النموذج
   */
  async deactivate() {
    this.isActive = false;
    this.status = 'inactive';
    return this.save();
  },
  
  /**
   * تحديث مقاييس الأداء
   */
  async updateMetrics(newMetrics) {
    this.metrics = { ...this.metrics.toObject(), ...newMetrics };
    
    // إضافة إلى سجل التحديثات
    this.updateHistory.push({
      version: this.version,
      updatedAt: new Date(),
      changes: 'Updated metrics',
      metrics: newMetrics
    });
    
    return this.save();
  },
  
  /**
   * تحديث إحصاءات النشر
   */
  async updateDeploymentStats(stats) {
    this.deployment = { ...this.deployment.toObject(), ...stats };
    return this.save();
  },
  
  /**
   * الحصول على ملخص النموذج
   */
  getSummary() {
    return {
      modelId: this.modelId,
      modelType: this.modelType,
      version: this.version,
      status: this.status,
      isActive: this.isActive,
      accuracy: this.metrics.accuracy,
      precision: this.metrics.precision,
      recall: this.metrics.recall,
      f1Score: this.metrics.f1Score,
      trainedAt: this.training.trainedAt,
      deployedAt: this.deployment.deployedAt
    };
  },
  
  /**
   * التحقق من جودة النموذج
   */
  isGoodQuality() {
    // معايير الجودة الدنيا
    const minAccuracy = 0.7;
    const minPrecision = 0.6;
    const minRecall = 0.6;
    const minF1Score = 0.6;
    
    return (
      this.metrics.accuracy >= minAccuracy &&
      this.metrics.precision >= minPrecision &&
      this.metrics.recall >= minRecall &&
      this.metrics.f1Score >= minF1Score
    );
  },
  
  /**
   * مقارنة مع نموذج آخر
   */
  compareWith(otherModel) {
    const thisScore = this.getOverallScore();
    const otherScore = otherModel.getOverallScore();
    
    return {
      better: thisScore > otherScore,
      difference: thisScore - otherScore,
      thisScore,
      otherScore,
      metrics: {
        accuracy: this.metrics.accuracy - otherModel.metrics.accuracy,
        precision: this.metrics.precision - otherModel.metrics.precision,
        recall: this.metrics.recall - otherModel.metrics.recall,
        f1Score: this.metrics.f1Score - otherModel.metrics.f1Score
      }
    };
  },
  
  /**
   * حساب الدرجة الإجمالية
   */
  getOverallScore() {
    // متوسط مرجح للمقاييس
    const weights = {
      accuracy: 0.3,
      precision: 0.2,
      recall: 0.2,
      f1Score: 0.3
    };
    
    return (
      this.metrics.accuracy * weights.accuracy +
      this.metrics.precision * weights.precision +
      this.metrics.recall * weights.recall +
      this.metrics.f1Score * weights.f1Score
    );
  }
};

// طرق ثابتة
mlModelSchema.statics = {
  /**
   * الحصول على النموذج النشط من نوع معين
   */
  async getActiveModel(modelType) {
    return this.findOne({
      modelType,
      isActive: true,
      status: 'active'
    });
  },
  
  /**
   * الحصول على أفضل نموذج من نوع معين
   */
  async getBestModel(modelType) {
    const models = await this.find({
      modelType,
      status: { $in: ['active', 'inactive'] }
    }).sort({ 'metrics.f1Score': -1 });
    
    return models.length > 0 ? models[0] : null;
  },
  
  /**
   * إنشاء نموذج جديد
   */
  async createModel(modelData) {
    // توليد modelId فريد
    const modelId = `${modelData.modelType}_${Date.now()}`;
    
    return this.create({
      ...modelData,
      modelId,
      status: 'training'
    });
  },
  
  /**
   * مقارنة نماذج من نفس النوع
   */
  async compareModels(modelType) {
    const models = await this.find({
      modelType,
      status: { $in: ['active', 'inactive'] }
    }).sort({ 'training.trainedAt': -1 });
    
    if (models.length < 2) {
      return null;
    }
    
    const comparison = [];
    for (let i = 0; i < models.length - 1; i++) {
      comparison.push({
        model1: models[i].getSummary(),
        model2: models[i + 1].getSummary(),
        comparison: models[i].compareWith(models[i + 1])
      });
    }
    
    return comparison;
  },
  
  /**
   * حذف النماذج القديمة
   */
  async cleanupOldModels(modelType, keepCount = 5) {
    const models = await this.find({
      modelType,
      isActive: false,
      status: { $in: ['inactive', 'deprecated'] }
    }).sort({ 'training.trainedAt': -1 });
    
    if (models.length <= keepCount) {
      return { deleted: 0 };
    }
    
    const modelsToDelete = models.slice(keepCount);
    const deleteIds = modelsToDelete.map(m => m._id);
    
    const result = await this.deleteMany({
      _id: { $in: deleteIds }
    });
    
    return { deleted: result.deletedCount };
  },
  
  /**
   * إحصاءات النماذج
   */
  async getModelStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: '$modelType',
          totalModels: { $sum: 1 },
          activeModels: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          avgAccuracy: { $avg: '$metrics.accuracy' },
          avgPrecision: { $avg: '$metrics.precision' },
          avgRecall: { $avg: '$metrics.recall' },
          avgF1Score: { $avg: '$metrics.f1Score' },
          latestTraining: { $max: '$training.trainedAt' }
        }
      }
    ]);
    
    return stats.reduce((acc, stat) => {
      acc[stat._id] = {
        totalModels: stat.totalModels,
        activeModels: stat.activeModels,
        avgAccuracy: stat.avgAccuracy,
        avgPrecision: stat.avgPrecision,
        avgRecall: stat.avgRecall,
        avgF1Score: stat.avgF1Score,
        latestTraining: stat.latestTraining
      };
      return acc;
    }, {});
  }
};

const MLModel = mongoose.model('MLModel', mlModelSchema);

module.exports = MLModel;
