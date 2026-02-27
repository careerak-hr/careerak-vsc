/**
 * Profile Analysis Model
 * نموذج تحليل الملف الشخصي
 * 
 * يحفظ نتائج التحليل الشامل للملف الشخصي
 */

const mongoose = require('mongoose');

const profileAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // درجة الاكتمال (0-100)
  completenessScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // مستوى الاكتمال
  completenessLevel: {
    type: String,
    enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
    required: true
  },
  
  // تفاصيل الاكتمال حسب الفئة
  completenessDetails: {
    basic: {
      score: Number,
      filled: Number,
      total: Number,
      percentage: Number
    },
    education: {
      score: Number,
      filled: Number,
      total: Number,
      percentage: Number
    },
    experience: {
      score: Number,
      filled: Number,
      total: Number,
      percentage: Number
    },
    skills: {
      score: Number,
      filled: Number,
      total: Number,
      percentage: Number
    },
    training: {
      score: Number,
      filled: Number,
      total: Number,
      percentage: Number
    },
    additional: {
      score: Number,
      filled: Number,
      total: Number,
      percentage: Number
    }
  },
  
  // درجة القوة الإجمالية (0-100)
  strengthScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // نقاط القوة
  strengths: [{
    category: String,
    title: String,
    description: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  
  // نقاط الضعف
  weaknesses: [{
    category: String,
    title: String,
    description: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    missingFields: [{
      field: String,
      label: String
    }]
  }],
  
  // الاقتراحات
  suggestions: [{
    category: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    title: String,
    description: String,
    action: String,
    estimatedImpact: Number, // التأثير المتوقع على الدرجة
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  
  // تاريخ التحليل
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes للأداء
profileAnalysisSchema.index({ userId: 1, analyzedAt: -1 });
profileAnalysisSchema.index({ completenessScore: -1 });
profileAnalysisSchema.index({ strengthScore: -1 });

module.exports = mongoose.model('ProfileAnalysis', profileAnalysisSchema);
