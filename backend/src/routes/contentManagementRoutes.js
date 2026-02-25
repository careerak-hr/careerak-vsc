const express = require('express');
const router = express.Router();
const contentManagementController = require('../controllers/contentManagementController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Content Management Routes
 * All routes require admin authentication
 */

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize('admin', 'moderator'));

/**
 * @route   GET /api/admin/content/pending-jobs
 * @desc    Get pending jobs with filtering
 * @access  Admin, Moderator
 * @query   page, limit, postedBy, postingType, location, startDate, endDate
 */
router.get('/pending-jobs', contentManagementController.getPendingJobs);

/**
 * @route   GET /api/admin/content/pending-courses
 * @desc    Get pending courses with filtering
 * @access  Admin, Moderator
 * @query   page, limit, instructor, category, level, startDate, endDate
 */
router.get('/pending-courses', contentManagementController.getPendingCourses);

/**
 * @route   GET /api/admin/content/flagged
 * @desc    Get flagged content (reviews) with filtering
 * @access  Admin, Moderator
 * @query   page, limit, reviewType, reviewer, reviewee, minReports, startDate, endDate
 */
router.get('/flagged', contentManagementController.getFlaggedContent);

/**
 * @route   PATCH /api/admin/content/:id/approve
 * @desc    Approve content (job, course, or review)
 * @access  Admin, Moderator
 * @body    contentType (required): 'job', 'course', or 'review'
 */
router.patch('/:id/approve', contentManagementController.approveContent);

/**
 * @route   PATCH /api/admin/content/:id/reject
 * @desc    Reject content with reason
 * @access  Admin, Moderator
 * @body    contentType (required): 'job', 'course', or 'review'
 * @body    reason (required): Rejection reason
 */
router.patch('/:id/reject', contentManagementController.rejectContent);

/**
 * @route   DELETE /api/admin/content/:id
 * @desc    Delete content permanently
 * @access  Admin only
 * @query   contentType (required): 'job', 'course', or 'review'
 */
router.delete('/:id', authorize('admin'), contentManagementController.deleteContent);

module.exports = router;
