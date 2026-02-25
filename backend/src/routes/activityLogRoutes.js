const express = require('express');
const router = express.Router();
const {
  getActivityLogsHandler,
  searchActivityLogsHandler,
  getUserActivityLogsHandler,
  getActivityLogStatsHandler,
  createActivityLogHandler,
  getActionTypesHandler
} = require('../controllers/activityLogController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Activity Log Routes
 * All routes require authentication and admin/moderator authorization
 */

// Apply authentication and authorization to all routes
router.use(protect);
router.use(authorize('admin', 'moderator'));

/**
 * @route   GET /api/admin/activity-log
 * @desc    Get activity logs with pagination and filtering
 * @access  Admin, Moderator
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 50, max: 100)
 * @query   {string} actionType - Filter by action type
 * @query   {string} actorId - Filter by actor ID
 * @query   {string} targetType - Filter by target type
 * @query   {string} startDate - Filter by start date (ISO format)
 * @query   {string} endDate - Filter by end date (ISO format)
 * @query   {string} sortBy - Sort field (default: timestamp)
 * @query   {string} sortOrder - Sort order: asc or desc (default: desc)
 */
router.get('/', getActivityLogsHandler);

/**
 * @route   GET /api/admin/activity-log/search
 * @desc    Search activity logs using text search
 * @access  Admin, Moderator
 * @query   {string} q - Search term (required)
 * @query   {string} searchTerm - Alternative search term parameter
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 50)
 * @query   {string} actionType - Filter by action type
 * @query   {string} startDate - Filter by start date (ISO format)
 * @query   {string} endDate - Filter by end date (ISO format)
 */
router.get('/search', searchActivityLogsHandler);

/**
 * @route   GET /api/admin/activity-log/stats
 * @desc    Get activity log statistics
 * @access  Admin, Moderator
 * @query   {string} startDate - Filter by start date (ISO format)
 * @query   {string} endDate - Filter by end date (ISO format)
 */
router.get('/stats', getActivityLogStatsHandler);

/**
 * @route   GET /api/admin/activity-log/action-types
 * @desc    Get list of available action types
 * @access  Admin, Moderator
 */
router.get('/action-types', getActionTypesHandler);

/**
 * @route   GET /api/admin/activity-log/user/:userId
 * @desc    Get activity logs for a specific user
 * @access  Admin, Moderator
 * @param   {string} userId - User ID
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 50)
 * @query   {string} actionType - Filter by action type
 * @query   {string} startDate - Filter by start date (ISO format)
 * @query   {string} endDate - Filter by end date (ISO format)
 */
router.get('/user/:userId', getUserActivityLogsHandler);

/**
 * @route   POST /api/admin/activity-log
 * @desc    Create a manual activity log entry
 * @access  Admin, Moderator
 * @body    {string} actionType - Type of action (required)
 * @body    {string} targetType - Type of target entity (required)
 * @body    {string} targetId - ID of target entity (required)
 * @body    {string} details - Description of the action (required)
 * @body    {object} metadata - Additional metadata (optional)
 */
router.post('/', createActivityLogHandler);

module.exports = router;
