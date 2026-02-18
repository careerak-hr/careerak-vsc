const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const createReviewSchema = Joi.object({
  reviewType: Joi.string().valid('company_to_employee', 'employee_to_company').required(),
  revieweeId: Joi.string().required(),
  jobApplicationId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  detailedRatings: Joi.object({
    professionalism: Joi.number().min(1).max(5),
    communication: Joi.number().min(1).max(5),
    skills: Joi.number().min(1).max(5),
    punctuality: Joi.number().min(1).max(5),
    workEnvironment: Joi.number().min(1).max(5),
    management: Joi.number().min(1).max(5),
    benefits: Joi.number().min(1).max(5),
    careerGrowth: Joi.number().min(1).max(5)
  }),
  comment: Joi.string().min(10).max(1000).required(),
  title: Joi.string().max(100),
  pros: Joi.string().max(500),
  cons: Joi.string().max(500),
  wouldRecommend: Joi.boolean(),
  isAnonymous: Joi.boolean()
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5),
  detailedRatings: Joi.object({
    professionalism: Joi.number().min(1).max(5),
    communication: Joi.number().min(1).max(5),
    skills: Joi.number().min(1).max(5),
    punctuality: Joi.number().min(1).max(5),
    workEnvironment: Joi.number().min(1).max(5),
    management: Joi.number().min(1).max(5),
    benefits: Joi.number().min(1).max(5),
    careerGrowth: Joi.number().min(1).max(5)
  }),
  comment: Joi.string().min(10).max(1000),
  title: Joi.string().max(100),
  pros: Joi.string().max(500),
  cons: Joi.string().max(500),
  wouldRecommend: Joi.boolean()
});

const responseSchema = Joi.object({
  responseText: Joi.string().min(10).max(500).required()
});

const helpfulSchema = Joi.object({
  isHelpful: Joi.boolean().required()
});

const reportSchema = Joi.object({
  reason: Joi.string().valid('spam', 'inappropriate', 'fake', 'offensive', 'other').required(),
  description: Joi.string().max(500)
});

const moderateSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  moderationNote: Joi.string().max(500)
});

// Routes

/**
 * @route   POST /reviews
 * @desc    إنشاء تقييم جديد
 * @access  Private
 */
router.post('/', auth, validate(createReviewSchema), reviewController.createReview);

/**
 * @route   GET /reviews/user/:userId
 * @desc    جلب تقييمات مستخدم معين
 * @access  Public
 */
router.get('/user/:userId', reviewController.getUserReviews);

/**
 * @route   GET /reviews/stats/:userId
 * @desc    جلب إحصائيات تقييمات مستخدم
 * @access  Public
 */
router.get('/stats/:userId', reviewController.getReviewStats);

/**
 * @route   GET /reviews/:reviewId
 * @desc    جلب تقييم واحد
 * @access  Public
 */
router.get('/:reviewId', reviewController.getReview);

/**
 * @route   PUT /reviews/:reviewId
 * @desc    تعديل تقييم
 * @access  Private
 */
router.put('/:reviewId', auth, validate(updateReviewSchema), reviewController.updateReview);

/**
 * @route   DELETE /reviews/:reviewId
 * @desc    حذف تقييم
 * @access  Private
 */
router.delete('/:reviewId', auth, reviewController.deleteReview);

/**
 * @route   POST /reviews/:reviewId/response
 * @desc    إضافة رد على تقييم
 * @access  Private
 */
router.post('/:reviewId/response', auth, validate(responseSchema), reviewController.addResponse);

/**
 * @route   POST /reviews/:reviewId/helpful
 * @desc    تحديد التقييم كمفيد/غير مفيد
 * @access  Private
 */
router.post('/:reviewId/helpful', auth, validate(helpfulSchema), reviewController.markHelpful);

/**
 * @route   POST /reviews/:reviewId/report
 * @desc    الإبلاغ عن تقييم
 * @access  Private
 */
router.post('/:reviewId/report', auth, validate(reportSchema), reviewController.reportReview);

/**
 * @route   GET /reviews/admin/flagged
 * @desc    جلب التقييمات المُبلغ عنها (للأدمن)
 * @access  Private (Admin only)
 */
router.get('/admin/flagged', auth, reviewController.getFlaggedReviews);

/**
 * @route   PUT /reviews/admin/:reviewId/moderate
 * @desc    مراجعة تقييم مُبلغ عنه (للأدمن)
 * @access  Private (Admin only)
 */
router.put('/admin/:reviewId/moderate', auth, validate(moderateSchema), reviewController.moderateReview);

module.exports = router;
