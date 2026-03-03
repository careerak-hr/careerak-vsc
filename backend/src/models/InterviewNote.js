const mongoose = require('mongoose');

/**
 * InterviewNote Model
 * نموذج ملاحظات وتقييم المقابلات
 * 
 * Requirements: 8.4, 8.5
 */
const interviewNoteSchema = new mongoose.Schema({
  // معلومات المقابلة
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VideoInterview',
    required: true,
    index: true
  },

  // معلومات المُقيّم
  evaluatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // معلومات المرشح
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // التقييم الإجمالي (1-5 نجوم)
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  // التقييمات التفصيلية
  ratings: {
    // المهارات التقنية (1-5)
    technicalSkills: {
      type: Number,
      min: 1,
      max: 5
    },

    // مهارات التواصل (1-5)
    communicationSkills: {
      type: Number,
      min: 1,
      max: 5
    },

    // حل المشكلات (1-5)
    problemSolving: {
      type: Number,
      min: 1,
      max: 5
    },

    // الخبرة (1-5)
    experience: {
      type: Number,
      min: 1,
      max: 5
    },

    // الملاءمة الثقافية (1-5)
    culturalFit: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // الملاحظات النصية
  notes: {
    // نقاط القوة
    strengths: {
      type: String,
      maxlength: 1000
    },

    // نقاط الضعف
    weaknesses: {
      type: String,
      maxlength: 1000
    },

    // ملاحظات عامة
    generalNotes: {
      type: String,
      maxlength: 2000
    },

    // توصيات
    recommendations: {
      type: String,
      maxlength: 1000
    }
  },

  // القرار النهائي
  decision: {
    type: String,
    enum: ['hire', 'reject', 'maybe', 'pending'],
    default: 'pending'
  },

  // الأولوية (للمرشحين المقبولين)
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },

  // حالة الملاحظة
  status: {
    type: String,
    enum: ['draft', 'final'],
    default: 'draft'
  },

  // الوصول (خاص أو مشترك مع الفريق)
  visibility: {
    type: String,
    enum: ['private', 'team'],
    default: 'private'
  },

  // المشاركون الذين يمكنهم رؤية الملاحظة
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // تاريخ الإنشاء والتحديث
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

// Indexes للأداء
interviewNoteSchema.index({ interviewId: 1, evaluatorId: 1 });
interviewNoteSchema.index({ candidateId: 1, decision: 1 });
interviewNoteSchema.index({ evaluatorId: 1, createdAt: -1 });

// Virtual للتقييم المتوسط للتقييمات التفصيلية
interviewNoteSchema.virtual('averageDetailedRating').get(function() {
  const ratings = this.ratings;
  const values = [
    ratings.technicalSkills,
    ratings.communicationSkills,
    ratings.problemSolving,
    ratings.experience,
    ratings.culturalFit
  ].filter(r => r !== undefined && r !== null);

  if (values.length === 0) return 0;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return (sum / values.length).toFixed(2);
});

// Middleware لتحديث updatedAt
interviewNoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method للتحقق من صلاحية الوصول
interviewNoteSchema.methods.canAccess = function(userId) {
  // المُقيّم يمكنه الوصول دائماً
  if (this.evaluatorId.toString() === userId.toString()) {
    return true;
  }

  // إذا كانت مشتركة مع الفريق
  if (this.visibility === 'team') {
    return true;
  }

  // إذا كان مشاركاً في القائمة
  return this.sharedWith.some(id => id.toString() === userId.toString());
};

// Method لحساب النتيجة الإجمالية
interviewNoteSchema.methods.calculateOverallScore = function() {
  const overallWeight = 0.4; // 40% للتقييم الإجمالي
  const detailedWeight = 0.6; // 60% للتقييمات التفصيلية

  const avgDetailed = parseFloat(this.averageDetailedRating);
  
  return (this.overallRating * overallWeight + avgDetailed * detailedWeight).toFixed(2);
};

// Static method للحصول على إحصائيات المرشح
interviewNoteSchema.statics.getCandidateStats = async function(candidateId) {
  const notes = await this.find({ candidateId, status: 'final' });

  if (notes.length === 0) {
    return null;
  }

  const totalRating = notes.reduce((sum, note) => sum + note.overallRating, 0);
  const avgRating = (totalRating / notes.length).toFixed(2);

  const decisions = notes.reduce((acc, note) => {
    acc[note.decision] = (acc[note.decision] || 0) + 1;
    return acc;
  }, {});

  return {
    totalInterviews: notes.length,
    averageRating: parseFloat(avgRating),
    decisions,
    latestDecision: notes[notes.length - 1].decision
  };
};

const InterviewNote = mongoose.model('InterviewNote', interviewNoteSchema);

module.exports = InterviewNote;
