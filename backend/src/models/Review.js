const mongoose = require('mongoose');

/**
 * نموذج التقييمات والمراجعات
 * يدعم تقييم الشركات للموظفين والعكس
 */
const reviewSchema = new mongoose.Schema({
  // نوع التقييم
  reviewType: {
    type: String,
    enum: ['company_to_employee', 'employee_to_company'],
    required: true,
    index: true
  },
  
  // المُقيِّم (من يكتب التقييم)
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // المُقيَّم (من يتلقى التقييم)
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // الوظيفة المرتبطة بالتقييم
  jobPosting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true
  },
  
  // طلب التوظيف المرتبط
  jobApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication',
    required: true,
    index: true
  },
  
  // التقييم بالنجوم (1-5)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: function(v) {
        return Number.isInteger(v) || (v % 0.5 === 0);
      },
      message: 'Rating must be an integer or half-star (e.g., 3.5)'
    }
  },
  
  // التقييمات التفصيلية (اختياري)
  detailedRatings: {
    // للموظفين
    professionalism: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    skills: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    
    // للشركات
    workEnvironment: { type: Number, min: 1, max: 5 },
    management: { type: Number, min: 1, max: 5 },
    benefits: { type: Number, min: 1, max: 5 },
    careerGrowth: { type: Number, min: 1, max: 5 }
  },
  
  // التعليق المكتوب
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
    trim: true
  },
  
  // العنوان (اختياري)
  title: {
    type: String,
    maxlength: 100,
    trim: true
  },
  
  // الإيجابيات (اختياري)
  pros: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // السلبيات (اختياري)
  cons: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // هل يوصي بالعمل مع هذا الطرف؟
  wouldRecommend: {
    type: Boolean,
    default: null
  },
  
  // الحالة
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved',
    index: true
  },
  
  // سبب الرفض أو الإبلاغ
  moderationNote: {
    type: String,
    maxlength: 500
  },
  
  // هل التقييم مجهول؟
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  // رد من المُقيَّم (اختياري)
  response: {
    text: {
      type: String,
      maxlength: 500,
      trim: true
    },
    respondedAt: Date
  },
  
  // تفاعلات المستخدمين
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  notHelpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // المستخدمون الذين وجدوا التقييم مفيداً
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // الإبلاغات
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // معلومات إضافية
  metadata: {
    ipAddress: String,
    userAgent: String,
    editedAt: Date,
    editCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes للأداء
reviewSchema.index({ reviewer: 1, reviewee: 1, jobApplication: 1 }, { unique: true });
reviewSchema.index({ reviewee: 1, status: 1, rating: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ jobPosting: 1, status: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ 'reports.reportedBy': 1 });

// Virtual للتحقق من التعديل
reviewSchema.virtual('isEdited').get(function() {
  return this.metadata && this.metadata.editCount > 0;
});

// Virtual لحساب نسبة الفائدة
reviewSchema.virtual('helpfulPercentage').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  if (total === 0) return 0;
  return Math.round((this.helpfulCount / total) * 100);
});

// Method: التحقق من إمكانية التعديل
reviewSchema.methods.canEdit = function() {
  const hoursSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return hoursSinceCreation <= 24 && this.metadata.editCount < 3;
};

// Method: إضافة رد
reviewSchema.methods.addResponse = function(responseText) {
  this.response = {
    text: responseText,
    respondedAt: new Date()
  };
  return this.save();
};

// Method: تحديث الفائدة
reviewSchema.methods.markHelpful = function(userId, isHelpful) {
  const index = this.helpfulBy.indexOf(userId);
  
  if (isHelpful) {
    if (index === -1) {
      this.helpfulBy.push(userId);
      this.helpfulCount += 1;
    }
  } else {
    if (index !== -1) {
      this.helpfulBy.splice(index, 1);
      this.helpfulCount -= 1;
      this.notHelpfulCount += 1;
    }
  }
  
  return this.save();
};

// Method: إضافة إبلاغ
reviewSchema.methods.addReport = function(userId, reason, description) {
  this.reports.push({
    reportedBy: userId,
    reason,
    description
  });
  
  // إذا تجاوزت الإبلاغات 3، ضع التقييم في حالة flagged
  if (this.reports.length >= 3) {
    this.status = 'flagged';
  }
  
  return this.save();
};

// Static: حساب متوسط التقييم لمستخدم
reviewSchema.statics.calculateAverageRating = async function(userId, reviewType) {
  const result = await this.aggregate([
    {
      $match: {
        reviewee: mongoose.Types.ObjectId(userId),
        reviewType: reviewType,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  // حساب توزيع التقييمات
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].ratingDistribution.forEach(rating => {
    const roundedRating = Math.round(rating);
    distribution[roundedRating] = (distribution[roundedRating] || 0) + 1;
  });
  
  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews,
    ratingDistribution: distribution
  };
};

// Static: التحقق من إمكانية كتابة تقييم
reviewSchema.statics.canReview = async function(reviewerId, revieweeId, jobApplicationId) {
  // التحقق من عدم وجود تقييم سابق
  const existingReview = await this.findOne({
    reviewer: reviewerId,
    reviewee: revieweeId,
    jobApplication: jobApplicationId
  });
  
  return !existingReview;
};

// Middleware: قبل الحفظ
reviewSchema.pre('save', function(next) {
  // حساب التقييم الإجمالي من التقييمات التفصيلية إذا لم يكن موجوداً
  if (!this.rating && this.detailedRatings) {
    const ratings = Object.values(this.detailedRatings).filter(r => r);
    if (ratings.length > 0) {
      this.rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }
  }
  
  next();
});

// Middleware: بعد الحفظ - تحديث متوسط التقييم للمستخدم
reviewSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    const stats = await doc.constructor.calculateAverageRating(
      doc.reviewee,
      doc.reviewType
    );
    
    // تحديث ملف المستخدم
    await User.findByIdAndUpdate(doc.reviewee, {
      $set: {
        'reviewStats.averageRating': stats.averageRating,
        'reviewStats.totalReviews': stats.totalReviews,
        'reviewStats.ratingDistribution': stats.ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error updating user review stats:', error);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
