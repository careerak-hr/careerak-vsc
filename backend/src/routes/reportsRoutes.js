const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Reports Routes
 * All routes require admin authentication
 */

// Protect all routes - require authentication and admin role
router.use(protect);
router.use(authorize('admin', 'moderator'));

/**
 * @route   GET /api/admin/reports/users
 * @desc    Generate users report
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/users', reportsController.getUsersReport);

/**
 * @route   GET /api/admin/reports/jobs
 * @desc    Generate jobs report
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/jobs', reportsController.getJobsReport);

/**
 * @route   GET /api/admin/reports/courses
 * @desc    Generate courses report
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/courses', reportsController.getCoursesReport);

/**
 * @route   GET /api/admin/reports/reviews
 * @desc    Generate reviews report
 * @access  Admin
 * @query   startDate, endDate (optional)
 */
router.get('/reviews', reportsController.getReviewsReport);

module.exports = router;
