const {
  createActivityLog,
  getActivityLogs,
  searchActivityLogs,
  getUserActivityLogs,
  getActivityLogStats
} = require('../services/activityLogService');
const { getClientIp } = require('../middleware/activityLogger');
const logger = require('../utils/logger');

/**
 * Activity Log Controller
 * Handles HTTP requests for activity log operations
 */

/**
 * GET /api/admin/activity-log
 * Get activity logs with pagination and filtering
 */
const getActivityLogsHandler = async (req, res) => {
  try {
    const {
      page,
      limit,
      actionType,
      actorId,
      targetType,
      startDate,
      endDate,
      sortBy,
      sortOrder
    } = req.query;

    const result = await getActivityLogs({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      actionType,
      actorId,
      targetType,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getActivityLogsHandler', {
      error: error.message,
      query: req.query
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity logs',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/activity-log/search
 * Search activity logs using text search
 */
const searchActivityLogsHandler = async (req, res) => {
  try {
    const {
      q,
      searchTerm,
      page,
      limit,
      actionType,
      startDate,
      endDate
    } = req.query;

    // Support both 'q' and 'searchTerm' query parameters
    const term = q || searchTerm;

    if (!term) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required',
        message: 'Please provide a search term using "q" or "searchTerm" query parameter'
      });
    }

    const result = await searchActivityLogs({
      searchTerm: term,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      actionType,
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
      searchTerm: result.searchTerm
    });
  } catch (error) {
    logger.error('Error in searchActivityLogsHandler', {
      error: error.message,
      query: req.query
    });
    res.status(500).json({
      success: false,
      error: 'Failed to search activity logs',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/activity-log/user/:userId
 * Get activity logs for a specific user
 */
const getUserActivityLogsHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit, actionType, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await getUserActivityLogs(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      actionType,
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
      userId
    });
  } catch (error) {
    logger.error('Error in getUserActivityLogsHandler', {
      error: error.message,
      userId: req.params.userId
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user activity logs',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/activity-log/stats
 * Get activity log statistics
 */
const getActivityLogStatsHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await getActivityLogStats({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getActivityLogStatsHandler', {
      error: error.message,
      query: req.query
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity log statistics',
      message: error.message
    });
  }
};

/**
 * POST /api/admin/activity-log
 * Create a manual activity log entry
 */
const createActivityLogHandler = async (req, res) => {
  try {
    const {
      actionType,
      targetType,
      targetId,
      details,
      metadata
    } = req.body;

    // Validate required fields
    if (!actionType || !targetType || !targetId || !details) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'actionType, targetType, targetId, and details are required'
      });
    }

    // Get actor information from authenticated user
    const actorId = req.user._id || req.user.id;
    const actorName = req.user.name || req.user.username;

    // Get IP address
    const ipAddress = getClientIp(req);

    // Create activity log
    const activityLog = await createActivityLog({
      actorId,
      actorName,
      actionType,
      targetType,
      targetId,
      details,
      ipAddress,
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      data: activityLog,
      message: 'Activity log created successfully'
    });
  } catch (error) {
    logger.error('Error in createActivityLogHandler', {
      error: error.message,
      body: req.body
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create activity log',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/activity-log/action-types
 * Get list of available action types
 */
const getActionTypesHandler = async (req, res) => {
  try {
    const actionTypes = [
      'user_registered',
      'job_posted',
      'application_submitted',
      'application_status_changed',
      'course_published',
      'course_enrolled',
      'review_posted',
      'content_reported',
      'user_modified',
      'content_deleted'
    ];

    res.status(200).json({
      success: true,
      data: actionTypes
    });
  } catch (error) {
    logger.error('Error in getActionTypesHandler', {
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch action types',
      message: error.message
    });
  }
};

module.exports = {
  getActivityLogsHandler,
  searchActivityLogsHandler,
  getUserActivityLogsHandler,
  getActivityLogStatsHandler,
  createActivityLogHandler,
  getActionTypesHandler
};
