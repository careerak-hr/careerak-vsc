const mongoose = require('mongoose');

/**
 * Security Logging Service
 * Logs all security-related actions for audit and monitoring
 */

// Security Log Schema
const securityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'password_change',
      'email_change',
      'phone_change',
      '2fa_enabled',
      '2fa_disabled',
      'session_terminated',
      'all_sessions_terminated',
      'failed_login',
      'suspicious_activity',
      'account_locked',
      'account_unlocked',
      'data_export_requested',
      'account_deletion_requested',
      'account_deletion_cancelled',
      'privacy_settings_changed',
      'notification_preferences_changed'
    ],
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
securityLogSchema.index({ userId: 1, timestamp: -1 });
securityLogSchema.index({ action: 1, timestamp: -1 });
securityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90 days TTL

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

/**
 * Log a security action
 * @param {Object} data - Security log data
 * @param {string} data.userId - User ID
 * @param {string} data.action - Action type
 * @param {Object} data.details - Additional details
 * @param {Object} data.req - Express request object
 * @param {boolean} data.success - Whether action was successful
 * @param {string} data.errorMessage - Error message if failed
 * @returns {Promise<Object>} Created security log
 */
const logSecurityAction = async (data) => {
  try {
    const {
      userId,
      action,
      details = {},
      req,
      success = true,
      errorMessage = null
    } = data;
    
    // Extract IP and user agent from request
    const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
    const userAgent = req?.headers?.['user-agent'] || 'unknown';
    
    // Create security log
    const securityLog = await SecurityLog.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      success,
      errorMessage,
      timestamp: new Date()
    });
    
    // Log to console for immediate visibility
    console.log(`[SECURITY] ${action} by user ${userId} - ${success ? 'SUCCESS' : 'FAILED'}`);
    
    return securityLog;
  } catch (error) {
    console.error('Error logging security action:', error);
    // Don't throw error to avoid breaking the main flow
    return null;
  }
};

/**
 * Get security logs for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of logs to return
 * @param {number} options.skip - Number of logs to skip
 * @param {string} options.action - Filter by action type
 * @param {Date} options.startDate - Filter by start date
 * @param {Date} options.endDate - Filter by end date
 * @returns {Promise<Array>} Security logs
 */
const getUserSecurityLogs = async (userId, options = {}) => {
  const {
    limit = 50,
    skip = 0,
    action = null,
    startDate = null,
    endDate = null
  } = options;
  
  const query = { userId };
  
  if (action) {
    query.action = action;
  }
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = startDate;
    }
    if (endDate) {
      query.timestamp.$lte = endDate;
    }
  }
  
  const logs = await SecurityLog.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
  
  return logs;
};

/**
 * Get security logs for all users (admin only)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Security logs
 */
const getAllSecurityLogs = async (options = {}) => {
  const {
    limit = 100,
    skip = 0,
    action = null,
    userId = null,
    startDate = null,
    endDate = null
  } = options;
  
  const query = {};
  
  if (action) {
    query.action = action;
  }
  
  if (userId) {
    query.userId = userId;
  }
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = startDate;
    }
    if (endDate) {
      query.timestamp.$lte = endDate;
    }
  }
  
  const logs = await SecurityLog.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name email')
    .lean();
  
  return logs;
};

/**
 * Get security statistics for a user
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Security statistics
 */
const getUserSecurityStats = async (userId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const logs = await SecurityLog.find({
    userId,
    timestamp: { $gte: startDate }
  }).lean();
  
  const stats = {
    totalActions: logs.length,
    successfulActions: logs.filter(log => log.success).length,
    failedActions: logs.filter(log => !log.success).length,
    actionsByType: {},
    recentActions: logs.slice(0, 10)
  };
  
  // Count actions by type
  logs.forEach(log => {
    stats.actionsByType[log.action] = (stats.actionsByType[log.action] || 0) + 1;
  });
  
  return stats;
};

/**
 * Detect suspicious activity patterns
 * @param {string} userId - User ID
 * @param {number} hours - Number of hours to analyze
 * @returns {Promise<Object>} Suspicious activity report
 */
const detectSuspiciousActivity = async (userId, hours = 24) => {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  const logs = await SecurityLog.find({
    userId,
    timestamp: { $gte: startDate }
  }).lean();
  
  const suspicious = {
    isSuspicious: false,
    reasons: [],
    score: 0
  };
  
  // Check for multiple failed logins
  const failedLogins = logs.filter(log => 
    log.action === 'failed_login' && !log.success
  ).length;
  
  if (failedLogins >= 5) {
    suspicious.isSuspicious = true;
    suspicious.reasons.push(`${failedLogins} failed login attempts in ${hours} hours`);
    suspicious.score += failedLogins * 2;
  }
  
  // Check for rapid setting changes
  const settingChanges = logs.filter(log => 
    ['password_change', 'email_change', 'phone_change'].includes(log.action)
  ).length;
  
  if (settingChanges >= 3) {
    suspicious.isSuspicious = true;
    suspicious.reasons.push(`${settingChanges} setting changes in ${hours} hours`);
    suspicious.score += settingChanges * 3;
  }
  
  // Check for multiple IP addresses
  const uniqueIPs = new Set(logs.map(log => log.ipAddress)).size;
  
  if (uniqueIPs >= 5) {
    suspicious.isSuspicious = true;
    suspicious.reasons.push(`Activity from ${uniqueIPs} different IP addresses`);
    suspicious.score += uniqueIPs * 2;
  }
  
  return suspicious;
};

module.exports = {
  SecurityLog,
  logSecurityAction,
  getUserSecurityLogs,
  getAllSecurityLogs,
  getUserSecurityStats,
  detectSuspiciousActivity
};
