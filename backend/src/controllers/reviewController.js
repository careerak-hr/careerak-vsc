const Review = require('../models/Review');
const JobApplication = require('../models/JobApplication');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * إنشاء تقييم جديد
 */
exports.createReview = async (req, res) => {
  try {
    const {
      reviewType,
      revieweeId,
      jobApplicationId,
      rating,
      detailedRatings,
      comment,
      title,
      pros,
      cons,
      wouldRecommend,
      isAnonymous
    } = req.body;
    
    const reviewerId = req.user.id;
    
    // التحقق من صحة نوع التقييم
    if (!['company_to_employee', 'employee_to_company'].includes(reviewType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع التقييم غير صحيح'
      });
    }
    
    // جلب طلب التوظيف
    const jobApplication = await JobApplication.findById(jobApplicationId)
      .populate('jobPosting');
    
    if (!jobApplication) {
      return res.status(404).json({
        success: false,
        message: 'طلب التوظيف غير موجود'
      });
    }
    
    // التحقق من حالة الطلب (يجب أن يكون مكتمل)
    if (jobApplication.status !== 'hired') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن كتابة تقييم إلا بعد اكتمال العمل'
      });
    }
    
    // التحقق من الصلاحيات
    if (reviewType === 'company_to_employee') {
      // الشركة تقيم الموظف
      if (jobApplication.jobPosting.company.toString() !== reviewerId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بكتابة هذا التقييم'
        });
      }
      
      if (revieweeId !== jobApplication.applicant.toString()) {
        return res.status(400).json({
          success: false,
          message: 'معرف المُقيَّم غير صحيح'
        });
      }
    } else {
      // الموظف يقيم الشركة
      if (jobApplication.applicant.toString() !== reviewerId) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح لك بكتابة هذا التقييم'
        });
      }
      
      if (revieweeId !== jobApplication.jobPosting.company.toString()) {
        return res.status(400).json({
          success: false,
          message: 'معرف المُقيَّم غير صحيح'
        });
      }
    }
    
    // التحقق من عدم وجود تقييم سابق
    const canReview = await Review.canReview(reviewerId, revieweeId, jobApplicationId);
    if (!canReview) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بكتابة تقييم لهذا الطلب مسبقاً'
      });
    }
    
    // إنشاء التقييم
    const review = await Review.create({
      reviewType,
      reviewer: reviewerId,
      reviewee: revieweeId,
      jobPosting: jobApplication.jobPosting._id,
      jobApplication: jobApplicationId,
      rating,
      detailedRatings,
      comment,
      title,
      pros,
      cons,
      wouldRecommend,
      isAnonymous,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });
    
    logger.info(`Review created: ${review._id} by user ${reviewerId}`);
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة التقييم بنجاح',
      review
    });
    
  } catch (error) {
    logger.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة التقييم',
      error: error.message
    });
  }
};

/**
 * جلب تقييمات مستخدم معين
 */
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reviewType, status = 'approved', page = 1, limit = 10 } = req.query;
    
    const query = {
      reviewee: userId,
      status
    };
    
    if (reviewType) {
      query.reviewType = reviewType;
    }
    
    const skip = (page - 1) * limit;
    
    const [reviews, total, stats] = await Promise.all([
      Review.find(query)
        .populate('reviewer', 'fullName profilePicture userType')
        .populate('jobPosting', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(query),
      Review.calculateAverageRating(userId, reviewType)
    ]);
    
    res.json({
      success: true,
      reviews,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasMore: skip + reviews.length < total
      }
    });
    
  } catch (error) {
    logger.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقييمات',
      error: error.message
    });
  }
};

/**
 * جلب تقييم واحد
 */
exports.getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId)
      .populate('reviewer', 'fullName profilePicture userType')
      .populate('reviewee', 'fullName profilePicture userType')
      .populate('jobPosting', 'title company')
      .populate('jobApplication', 'status');
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    res.json({
      success: true,
      review
    });
    
  } catch (error) {
    logger.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقييم',
      error: error.message
    });
  }
};

/**
 * تعديل تقييم
 */
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const {
      rating,
      detailedRatings,
      comment,
      title,
      pros,
      cons,
      wouldRecommend
    } = req.body;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    // التحقق من الصلاحيات
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذا التقييم'
      });
    }
    
    // التحقق من إمكانية التعديل
    if (!review.canEdit()) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن تعديل التقييم بعد 24 ساعة أو بعد 3 تعديلات'
      });
    }
    
    // تحديث التقييم
    review.rating = rating || review.rating;
    review.detailedRatings = detailedRatings || review.detailedRatings;
    review.comment = comment || review.comment;
    review.title = title || review.title;
    review.pros = pros || review.pros;
    review.cons = cons || review.cons;
    review.wouldRecommend = wouldRecommend !== undefined ? wouldRecommend : review.wouldRecommend;
    
    review.metadata.editedAt = new Date();
    review.metadata.editCount += 1;
    
    await review.save();
    
    logger.info(`Review updated: ${reviewId} by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'تم تحديث التقييم بنجاح',
      review
    });
    
  } catch (error) {
    logger.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث التقييم',
      error: error.message
    });
  }
};

/**
 * حذف تقييم
 */
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    // التحقق من الصلاحيات
    if (review.reviewer.toString() !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذا التقييم'
      });
    }
    
    await review.deleteOne();
    
    logger.info(`Review deleted: ${reviewId} by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'تم حذف التقييم بنجاح'
    });
    
  } catch (error) {
    logger.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف التقييم',
      error: error.message
    });
  }
};

/**
 * إضافة رد على تقييم
 */
exports.addResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { responseText } = req.body;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    // التحقق من الصلاحيات (فقط المُقيَّم يمكنه الرد)
    if (review.reviewee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالرد على هذا التقييم'
      });
    }
    
    // التحقق من عدم وجود رد سابق
    if (review.response && review.response.text) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بالرد على هذا التقييم مسبقاً'
      });
    }
    
    await review.addResponse(responseText);
    
    logger.info(`Response added to review: ${reviewId} by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'تم إضافة الرد بنجاح',
      review
    });
    
  } catch (error) {
    logger.error('Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة الرد',
      error: error.message
    });
  }
};

/**
 * تحديد التقييم كمفيد/غير مفيد
 */
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    await review.markHelpful(req.user.id, isHelpful);
    
    res.json({
      success: true,
      message: 'تم تحديث التقييم بنجاح',
      helpfulCount: review.helpfulCount,
      notHelpfulCount: review.notHelpfulCount
    });
    
  } catch (error) {
    logger.error('Error marking review helpful:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث التقييم',
      error: error.message
    });
  }
};

/**
 * الإبلاغ عن تقييم
 */
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, description } = req.body;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    // التحقق من عدم الإبلاغ المسبق
    const alreadyReported = review.reports.some(
      report => report.reportedBy.toString() === req.user.id
    );
    
    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'لقد قمت بالإبلاغ عن هذا التقييم مسبقاً'
      });
    }
    
    await review.addReport(req.user.id, reason, description);
    
    logger.info(`Review reported: ${reviewId} by user ${req.user.id}`);
    
    res.json({
      success: true,
      message: 'تم الإبلاغ عن التقييم بنجاح'
    });
    
  } catch (error) {
    logger.error('Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء الإبلاغ عن التقييم',
      error: error.message
    });
  }
};

/**
 * جلب إحصائيات التقييمات
 */
exports.getReviewStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reviewType } = req.query;
    
    const stats = await Review.calculateAverageRating(userId, reviewType);
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    logger.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات',
      error: error.message
    });
  }
};

/**
 * جلب التقييمات المُبلغ عنها (للأدمن)
 */
exports.getFlaggedReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      Review.find({ status: 'flagged' })
        .populate('reviewer', 'fullName profilePicture')
        .populate('reviewee', 'fullName profilePicture')
        .populate('jobPosting', 'title')
        .sort({ 'reports.reportedAt': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ status: 'flagged' })
    ]);
    
    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (error) {
    logger.error('Error fetching flagged reviews:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التقييمات المُبلغ عنها',
      error: error.message
    });
  }
};

/**
 * مراجعة تقييم مُبلغ عنه (للأدمن)
 */
exports.moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, moderationNote } = req.body; // action: 'approve' or 'reject'
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'التقييم غير موجود'
      });
    }
    
    review.status = action === 'approve' ? 'approved' : 'rejected';
    review.moderationNote = moderationNote;
    
    await review.save();
    
    logger.info(`Review moderated: ${reviewId} - ${action} by admin ${req.user.id}`);
    
    res.json({
      success: true,
      message: `تم ${action === 'approve' ? 'قبول' : 'رفض'} التقييم بنجاح`,
      review
    });
    
  } catch (error) {
    logger.error('Error moderating review:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء مراجعة التقييم',
      error: error.message
    });
  }
};

module.exports = exports;
