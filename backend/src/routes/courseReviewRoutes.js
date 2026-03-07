/**
 * Course Review Routes
 * Base path: /courses/:id/reviews
 * Requirements: All review-related requirements
 */

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent router
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const courseReviewController = require('../controllers/courseReviewController');
const Joi = require('joi');

// Validation schemas
const createReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required()
    .messages({
      'number.min': 'التقييم يجب أن يكون بين 1 و 5',
      'number.max': 'التقييم يجب أن يكون بين 1 و 5',
      'any.required': 'التقييم مطلوب'
    }),
  detailedRatings: Joi.object({
    contentQuality: Joi.number().min(1).max(5).optional(),
    instructorEffectiveness: Joi.number().min(1).max(5).optional(),
    valueForMoney: Joi.number().min(1).max(5).optional(),
    practicalApplication: Joi.number().min(1).max(5).optional()
  }).optional(),
  title: Joi.string().min(5).max(100).required()
    .messages({
      'string.min': 'العنوان يجب أن يكون 5 أحرف على الأقل',
      'string.max': 'العنوان يجب ألا يتجاوز 100 حرف',
      'any.required': 'العنوان مطلوب'
    }),
  comment: Joi.string().min(20).max(1000).required()
    .messages({
      'string.min': 'التعليق يجب أن يكون 20 حرف على الأقل',
      'string.max': 'التعليق يجب ألا يتجاوز 1000 حرف',
      'any.required': 'التعليق مطلوب'
    }),
  pros: Joi.string().max(500).optional(),
  cons: Joi.string().max(500).optional(),
  wouldRecommend: Joi.boolean().optional(),
  isAnonymous: Joi.boolean().optional()
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  detailedRatings: Joi.object({
    contentQuality: Joi.number().min(1).max(5).optional(),
    instructorEffectiveness: Joi.number().min(1).max(5).optional(),
    valueForMoney: Joi.number().min(1).max(5).optional(),
    practicalApplication: Joi.number().min(1).max(5).optional()
  }).optional(),
  title: Joi.string().min(5).max(100).optional(),
  comment: Joi.string().min(20).max(1000).optional(),
  pros: Joi.string().max(500).optional(),
  cons: Joi.string().max(500).optional(),
  wouldRecommend: Joi.boolean().optional()
});

const helpfulSchema = Joi.object({
  helpful: Joi.boolean().required()
    .messages({
      'any.required': 'يجب تحديد ما إذا كان التقييم مفيد أم لا'
    })
});

const responseSchema = Joi.object({
  response: Joi.string().min(10).max(500).required()
    .messages({
      'string.min': 'الرد يجب أن يكون 10 أحرف على الأقل',
      'string.max': 'الرد يجب ألا يتجاوز 500 حرف',
      'any.required': 'الرد مطلوب'
    })
});

// Get review statistics for a course (public)
router.get('/stats', courseReviewController.getCourseReviewStats);

// Get all reviews for a course (public)
router.get('/', courseReviewController.getCourseReviews);

// Create a new review (protected)
router.post('/', protect, validate(createReviewSchema), courseReviewController.createCourseReview);

// Update a review (protected)
router.put('/:reviewId', protect, validate(updateReviewSchema), courseReviewController.updateCourseReview);

// Mark review as helpful/not helpful (protected)
router.post('/:reviewId/helpful', protect, validate(helpfulSchema), courseReviewController.markReviewHelpful);

// Add instructor response to review (protected)
router.post('/:reviewId/response', protect, validate(responseSchema), courseReviewController.addReviewResponse);

module.exports = router;
