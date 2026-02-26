const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { protect, authorize } = require('../middleware/auth');
const { shortCacheHeaders } = require('../middleware/cacheHeaders');

/**
 * Statistics Routes for Admin Dashboard
 * 
 * All routes require authentication and admin/moderator authorization.
 * Cache headers middleware adds Cache-Control and ETag headers.
 * Implements Requirements 2.1-2.9, 11.2, 11.5, 11.6
 */

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize('Admin', 'HR')); // Only Admin and HR roles can access statistics

// Apply cache headers middleware to all statistics routes (30 seconds TTL)
router.use(shortCacheHeaders());

/**
 * @route   GET /api/admin/statistics/overview
 * @desc    Get overview statistics (active users, jobs today, applications today, etc.)
 * @access  Private (Admin, HR)
 * @cache   30 seconds with ETag
 * @requirements 2.1-2.6, 11.2
 */
router.get('/overview', statisticsController.getOverview);

/**
 * @route   GET /api/admin/statistics/users
 * @desc    Get user statistics with time range (daily, weekly, monthly)
 * @query   timeRange - daily|weekly|monthly (default: daily)
 * @access  Private (Admin, HR)
 * @cache   30 seconds with ETag
 * @requirements 2.1, 11.2
 */
router.get('/users', statisticsController.getUserStatistics);

/**
 * @route   GET /api/admin/statistics/jobs
 * @desc    Get job statistics with time range (daily, weekly, monthly)
 * @query   timeRange - daily|weekly|monthly (default: daily)
 * @access  Private (Admin, HR)
 * @cache   30 seconds with ETag
 * @requirements 2.2, 11.2
 */
router.get('/jobs', statisticsController.getJobStatistics);

/**
 * @route   GET /api/admin/statistics/courses
 * @desc    Get course statistics with time range (daily, weekly, monthly)
 * @query   timeRange - daily|weekly|monthly (default: daily)
 * @access  Private (Admin, HR)
 * @cache   30 seconds with ETag
 * @requirements 2.3, 11.2
 */
router.get('/courses', statisticsController.getCourseStatistics);

/**
 * @route   GET /api/admin/statistics/reviews
 * @desc    Get review statistics with time range (daily, weekly, monthly)
 * @query   timeRange - daily|weekly|monthly (default: daily)
 * @access  Private (Admin, HR)
 * @cache   30 seconds with ETag
 * @requirements 2.4, 11.2
 */
router.get('/reviews', statisticsController.getReviewStatistics);

module.exports = router;
