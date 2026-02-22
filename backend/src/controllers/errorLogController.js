const ErrorLog = require('../models/ErrorLog');
const logger = require('../utils/logger');

/**
 * Error Log Controller
 * 
 * Handles frontend error logging requests
 * 
 * Requirements:
 * - FR-ERR-3: Log error details (component, stack trace, timestamp)
 * - Task 9.1.4: Integrate error logging with backend
 */

/**
 * Log an error from frontend
 * POST /api/errors
 * 
 * @body {Object} error - Error object
 * @body {string} error.message - Error message
 * @body {string} error.stack - Stack trace
 * @body {string} error.name - Error name
 * @body {Object} context - Error context
 * @body {string} context.component - Component name
 * @body {string} context.action - Action being performed
 * @body {string} context.errorBoundary - Error boundary type
 * @body {string} context.level - Error level
 * @body {Object} context.extra - Additional data
 * @body {string} environment - Environment
 * @body {string} release - Release version
 * @body {string} url - Page URL
 * @body {string} userAgent - User agent string
 */
exports.logError = async (req, res) => {
  try {
    const {
      error,
      context = {},
      environment,
      release,
      url,
      userAgent,
    } = req.body;

    // Validate required fields
    if (!error || !error.message) {
      return res.status(400).json({
        success: false,
        message: 'Error message is required',
      });
    }

    if (!context.component) {
      return res.status(400).json({
        success: false,
        message: 'Component name is required',
      });
    }

    // Parse user agent to extract browser/OS info
    const browserInfo = parseUserAgent(userAgent);

    // Prepare error data
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name || 'Error',
      component: context.component,
      action: context.action || 'Unknown',
      errorBoundary: context.errorBoundary || 'None',
      userId: req.user?._id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      environment: environment || 'production',
      release: release,
      url: url,
      userAgent: userAgent,
      browser: browserInfo.browser,
      os: browserInfo.os,
      device: browserInfo.device,
      level: context.level || 'error',
      extra: context.extra || {},
    };

    // Find or create error log (groups similar errors)
    const errorLog = await ErrorLog.findOrCreate(errorData);

    // Log to backend logger
    logger.error('Frontend error logged', {
      errorId: errorLog._id,
      message: error.message,
      component: context.component,
      userId: req.user?._id,
      count: errorLog.count,
    });

    res.status(201).json({
      success: true,
      message: 'Error logged successfully',
      errorId: errorLog._id,
      count: errorLog.count,
    });
  } catch (err) {
    logger.error('Failed to log frontend error', {
      error: err.message,
      stack: err.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to log error',
    });
  }
};

/**
 * Get error logs (Admin only)
 * GET /api/errors
 * 
 * @query {string} environment - Filter by environment
 * @query {string} level - Filter by level
 * @query {string} status - Filter by status
 * @query {string} component - Filter by component
 * @query {string} userId - Filter by user ID
 * @query {string} startDate - Filter by start date
 * @query {string} endDate - Filter by end date
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 */
exports.getErrors = async (req, res) => {
  try {
    const {
      environment,
      level,
      status,
      component,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter
    const filter = {};
    if (environment) filter.environment = environment;
    if (level) filter.level = level;
    if (status) filter.status = status;
    if (component) filter.component = component;
    if (userId) filter.userId = userId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Get errors with pagination
    const errors = await ErrorLog.find(filter)
      .populate('userId', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count
    const count = await ErrorLog.countDocuments(filter);

    res.json({
      success: true,
      errors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalErrors: count,
    });
  } catch (err) {
    logger.error('Failed to get error logs', {
      error: err.message,
      stack: err.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get error logs',
    });
  }
};

/**
 * Get error statistics (Admin only)
 * GET /api/errors/statistics
 * 
 * @query {string} environment - Filter by environment
 * @query {string} level - Filter by level
 * @query {string} status - Filter by status
 * @query {string} userId - Filter by user ID
 * @query {string} startDate - Filter by start date
 * @query {string} endDate - Filter by end date
 */
exports.getStatistics = async (req, res) => {
  try {
    const {
      environment,
      level,
      status,
      userId,
      startDate,
      endDate,
    } = req.query;

    const filters = {
      environment,
      level,
      status,
      userId,
      startDate,
      endDate,
    };

    const stats = await ErrorLog.getStatistics(filters);

    res.json({
      success: true,
      statistics: stats,
    });
  } catch (err) {
    logger.error('Failed to get error statistics', {
      error: err.message,
      stack: err.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get error statistics',
    });
  }
};

/**
 * Get a single error log (Admin only)
 * GET /api/errors/:id
 */
exports.getError = async (req, res) => {
  try {
    const error = await ErrorLog.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('resolvedBy', 'name email');

    if (!error) {
      return res.status(404).json({
        success: false,
        message: 'Error log not found',
      });
    }

    res.json({
      success: true,
      error,
    });
  } catch (err) {
    logger.error('Failed to get error log', {
      error: err.message,
      stack: err.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get error log',
    });
  }
};

/**
 * Update error status (Admin only)
 * PATCH /api/errors/:id
 * 
 * @body {string} status - New status
 * @body {string} notes - Admin notes
 */
exports.updateErrorStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const error = await ErrorLog.findById(req.params.id);

    if (!error) {
      return res.status(404).json({
        success: false,
        message: 'Error log not found',
      });
    }

    // Update status
    if (status) {
      error.status = status;
      if (status === 'resolved') {
        error.resolvedAt = new Date();
        error.resolvedBy = req.user._id;
      }
    }

    // Update notes
    if (notes) {
      error.notes = notes;
    }

    await error.save();

    res.json({
      success: true,
      message: 'Error status updated',
      error,
    });
  } catch (err) {
    logger.error('Failed to update error status', {
      error: err.message,
      stack: err.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update error status',
    });
  }
};

/**
 * Delete error log (Admin only)
 * DELETE /api/errors/:id
 */
exports.deleteError = async (req, res) => {
  try {
    const error = await ErrorLog.findByIdAndDelete(req.params.id);

    if (!error) {
      return res.status(404).json({
        success: false,
        message: 'Error log not found',
      });
    }

    res.json({
      success: true,
      message: 'Error log deleted',
    });
  } catch (err) {
    logger.error('Failed to delete error log', {
      error: err.message,
      stack: err.stack,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete error log',
    });
  }
};

/**
 * Parse user agent string to extract browser/OS info
 */
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return {
      browser: { name: 'Unknown', version: 'Unknown' },
      os: { name: 'Unknown', version: 'Unknown' },
      device: 'unknown',
    };
  }

  const result = {
    browser: { name: 'Unknown', version: 'Unknown' },
    os: { name: 'Unknown', version: 'Unknown' },
    device: 'unknown',
  };

  // Detect browser
  if (userAgent.includes('Chrome')) {
    result.browser.name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
    if (match) result.browser.version = match[1];
  } else if (userAgent.includes('Firefox')) {
    result.browser.name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) result.browser.version = match[1];
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    result.browser.name = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) result.browser.version = match[1];
  } else if (userAgent.includes('Edge')) {
    result.browser.name = 'Edge';
    const match = userAgent.match(/Edge\/(\d+\.\d+)/);
    if (match) result.browser.version = match[1];
  }

  // Detect OS
  if (userAgent.includes('Windows')) {
    result.os.name = 'Windows';
    if (userAgent.includes('Windows NT 10.0')) result.os.version = '10';
    else if (userAgent.includes('Windows NT 6.3')) result.os.version = '8.1';
    else if (userAgent.includes('Windows NT 6.2')) result.os.version = '8';
    else if (userAgent.includes('Windows NT 6.1')) result.os.version = '7';
  } else if (userAgent.includes('Mac OS X')) {
    result.os.name = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    if (match) result.os.version = match[1].replace('_', '.');
  } else if (userAgent.includes('Linux')) {
    result.os.name = 'Linux';
  } else if (userAgent.includes('Android')) {
    result.os.name = 'Android';
    const match = userAgent.match(/Android (\d+\.\d+)/);
    if (match) result.os.version = match[1];
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    result.os.name = 'iOS';
    const match = userAgent.match(/OS (\d+[._]\d+)/);
    if (match) result.os.version = match[1].replace('_', '.');
  }

  // Detect device type
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    result.device = 'mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    result.device = 'tablet';
  } else {
    result.device = 'desktop';
  }

  return result;
}

module.exports = exports;
