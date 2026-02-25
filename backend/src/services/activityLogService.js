const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');
const pusherService = require('./pusherService');

/**
 * Activity Log Service
 * Handles all activity logging operations with pagination, filtering, and search
 */

/**
 * Create a new activity log entry
 * @param {Object} logData - Activity log data
 * @param {string} logData.actorId - User ID who performed the action
 * @param {string} logData.actorName - Name of the user
 * @param {string} logData.actionType - Type of action performed
 * @param {string} logData.targetType - Type of target entity
 * @param {string} logData.targetId - ID of target entity
 * @param {string} logData.details - Description of the action
 * @param {string} logData.ipAddress - IP address of the actor
 * @param {Object} logData.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Created activity log entry
 */
const createActivityLog = async (logData) => {
  try {
    const {
      actorId,
      actorName,
      actionType,
      targetType,
      targetId,
      details,
      ipAddress,
      metadata = {}
    } = logData;

    // Validate required fields
    if (!actorId || !actorName || !actionType || !targetType || !targetId || !details || !ipAddress) {
      throw new Error('Missing required fields for activity log');
    }

    // Create activity log entry
    const activityLog = new ActivityLog({
      actorId,
      actorName,
      actionType,
      targetType,
      targetId,
      details,
      ipAddress,
      metadata
    });

    await activityLog.save();

    logger.info('Activity log created', {
      actorId,
      actionType,
      targetType,
      targetId
    });

    // Broadcast activity log via Pusher (Requirement 2.7)
    await pusherService.broadcastActivityLog(activityLog.toObject());

    return activityLog;
  } catch (error) {
    logger.error('Error creating activity log', {
      error: error.message,
      logData
    });
    throw error;
  }
};

/**
 * Get activity logs with pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50)
 * @param {string} options.actionType - Filter by action type
 * @param {string} options.actorId - Filter by actor ID
 * @param {string} options.targetType - Filter by target type
 * @param {Date} options.startDate - Filter by start date
 * @param {Date} options.endDate - Filter by end date
 * @param {string} options.sortBy - Sort field (default: timestamp)
 * @param {string} options.sortOrder - Sort order: 'asc' or 'desc' (default: 'desc')
 * @returns {Promise<Object>} Paginated activity logs with metadata
 */
const getActivityLogs = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 50,
      actionType,
      actorId,
      targetType,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options;

    // Build query filter
    const filter = {};

    if (actionType) {
      filter.actionType = actionType;
    }

    if (actorId) {
      filter.actorId = actorId;
    }

    if (targetType) {
      filter.targetType = targetType;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query with pagination
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('actorId', 'name email userType')
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
  } catch (error) {
    logger.error('Error fetching activity logs', {
      error: error.message,
      options
    });
    throw error;
  }
};

/**
 * Search activity logs using text search
 * @param {Object} options - Search options
 * @param {string} options.searchTerm - Search term for text search
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 50)
 * @param {string} options.actionType - Filter by action type
 * @param {Date} options.startDate - Filter by start date
 * @param {Date} options.endDate - Filter by end date
 * @returns {Promise<Object>} Search results with pagination
 */
const searchActivityLogs = async (options = {}) => {
  try {
    const {
      searchTerm,
      page = 1,
      limit = 50,
      actionType,
      startDate,
      endDate
    } = options;

    if (!searchTerm) {
      throw new Error('Search term is required');
    }

    // Build query filter
    const filter = {
      $text: { $search: searchTerm }
    };

    if (actionType) {
      filter.actionType = actionType;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search query with text score sorting
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actorId', 'name email userType')
        .lean(),
      ActivityLog.countDocuments(filter)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      searchTerm
    };
  } catch (error) {
    logger.error('Error searching activity logs', {
      error: error.message,
      options
    });
    throw error;
  }
};

/**
 * Get activity logs for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} User's activity logs
 */
const getUserActivityLogs = async (userId, options = {}) => {
  try {
    return await getActivityLogs({
      ...options,
      actorId: userId
    });
  } catch (error) {
    logger.error('Error fetching user activity logs', {
      error: error.message,
      userId
    });
    throw error;
  }
};

/**
 * Get activity log statistics
 * @param {Object} options - Filter options
 * @returns {Promise<Object>} Activity log statistics
 */
const getActivityLogStats = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    // Aggregate statistics
    const [totalLogs, byActionType, byTargetType, recentActivity] = await Promise.all([
      ActivityLog.countDocuments(dateFilter),
      ActivityLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ActivityLog.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$targetType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      ActivityLog.find(dateFilter)
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('actorId', 'name email')
        .lean()
    ]);

    return {
      totalLogs,
      byActionType: byActionType.map(item => ({
        actionType: item._id,
        count: item.count
      })),
      byTargetType: byTargetType.map(item => ({
        targetType: item._id,
        count: item.count
      })),
      recentActivity
    };
  } catch (error) {
    logger.error('Error fetching activity log stats', {
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  createActivityLog,
  getActivityLogs,
  searchActivityLogs,
  getUserActivityLogs,
  getActivityLogStats
};
