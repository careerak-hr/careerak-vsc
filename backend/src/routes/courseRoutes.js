/**
 * Course Routes
 * Defines all routes for course-related endpoints
 * Requirements: All course-related requirements
 */

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { generalRateLimiter } = require('../middleware/rateLimiter');
const Joi = require('joi');
const courseReviewRoutes = require('./courseReviewRoutes');

// Validation schemas
const enrollSchema = Joi.object({
  paymentInfo: Joi.object({
    transactionId: Joi.string().optional(),
    amount: Joi.number().optional(),
    currency: Joi.string().optional()
  }).optional()
});

const lessonCompleteSchema = Joi.object({
  quizScore: Joi.number().min(0).max(100).optional(),
  timeSpent: Joi.number().min(0).optional()
});

const shareSchema = Joi.object({
  platform: Joi.string().valid('link', 'facebook', 'twitter', 'linkedin', 'whatsapp').optional()
});

// Apply rate limiting to all course routes
router.use(generalRateLimiter);

// Nest review routes under /courses/:id/reviews
router.use('/:id/reviews', courseReviewRoutes);

// Public routes (no authentication required)

/**
 * @route   GET /api/courses
 * @desc    Get all courses with filtering and pagination
 * @access  Public
 */
router.get('/', courseController.getCourses);

/**
 * @route   GET /api/courses/:id/preview
 * @desc    Get preview content for a course
 * @access  Public
 */
router.get('/:id/preview', courseController.getPreviewContent);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course details by ID
 * @access  Public (but shows more details if authenticated)
 */
router.get('/:id', courseController.getCourseDetails);

// Protected routes (authentication required)

/**
 * @route   GET /api/courses/my-courses
 * @desc    Get user's enrolled courses
 * @access  Private
 */
router.get('/my-courses', protect, courseController.getMyEnrolledCourses);

/**
 * @route   POST /api/courses/:id/enroll
 * @desc    Enroll user in a course
 * @access  Private
 */
router.post('/:id/enroll', protect, validate(enrollSchema), courseController.enrollInCourse);

/**
 * @route   GET /api/courses/:id/progress
 * @desc    Get course progress for enrolled user
 * @access  Private
 */
router.get('/:id/progress', protect, courseController.getCourseProgress);

/**
 * @route   POST /api/courses/:id/lessons/:lessonId/complete
 * @desc    Mark a lesson as complete
 * @access  Private
 */
router.post('/:id/lessons/:lessonId/complete', protect, validate(lessonCompleteSchema), courseController.markLessonComplete);

/**
 * @route   GET /api/courses/:id/certificate
 * @desc    Get course completion certificate
 * @access  Private
 */
router.get('/:id/certificate', protect, courseController.getCertificate);

/**
 * @route   POST /api/courses/:id/share
 * @desc    Generate unique shareable URL with tracking token
 * @access  Public (but tracks referrer if authenticated)
 */
router.post('/:id/share', validate(shareSchema), courseController.shareCourse);

/**
 * @route   GET /api/courses/shared/:token
 * @desc    Decode sharing token and redirect to course details
 * @access  Public
 */
router.get('/shared/:token', courseController.getSharedCourse);

module.exports = router;
