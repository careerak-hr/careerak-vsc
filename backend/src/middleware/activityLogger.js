const { createActivityLog } = require('../services/activityLogService');
const logger = require('../utils/logger');

/**
 * Middleware to automatically log admin actions
 * Captures IP address and creates activity log entries
 */

/**
 * Get client IP address from request
 * Handles various proxy scenarios (Vercel, Cloudflare, etc.)
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * Create activity log middleware
 * @param {string} actionType - Type of action being performed
 * @param {Function} getTargetInfo - Function to extract target info from req/res
 * @returns {Function} Express middleware
 */
const logActivity = (actionType, getTargetInfo) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Run logging asynchronously to not block response
        setImmediate(async () => {
          try {
            // Extract target information
            const targetInfo = getTargetInfo ? getTargetInfo(req, res, data) : {};

            // Skip if no target info (operation might have failed)
            if (!targetInfo.targetType || !targetInfo.targetId) {
              return;
            }

            // Get actor information from authenticated user
            const actorId = req.user?._id || req.user?.id;
            const actorName = req.user?.name || req.user?.username || 'Unknown';

            if (!actorId) {
              logger.warn('Activity log skipped: No authenticated user', {
                actionType,
                path: req.path
              });
              return;
            }

            // Get IP address
            const ipAddress = getClientIp(req);

            // Create activity log
            await createActivityLog({
              actorId,
              actorName,
              actionType,
              targetType: targetInfo.targetType,
              targetId: targetInfo.targetId,
              details: targetInfo.details || `${actionType} performed`,
              ipAddress,
              metadata: {
                method: req.method,
                path: req.path,
                userAgent: req.headers['user-agent'],
                ...targetInfo.metadata
              }
            });
          } catch (error) {
            // Log error but don't fail the request
            logger.error('Failed to create activity log', {
              error: error.message,
              actionType,
              path: req.path
            });
          }
        });
      }

      // Call original res.json
      return originalJson(data);
    };

    next();
  };
};

/**
 * Pre-configured middleware for common admin actions
 */

// User management actions
const logUserModified = logActivity('user_modified', (req, res, data) => ({
  targetType: 'User',
  targetId: req.params.id || req.params.userId || data.user?._id,
  details: `User ${req.params.id || 'profile'} modified`,
  metadata: {
    modifiedFields: Object.keys(req.body)
  }
}));

const logUserDeleted = logActivity('content_deleted', (req, res, data) => ({
  targetType: 'User',
  targetId: req.params.id || req.params.userId,
  details: `User account deleted`,
  metadata: {
    reason: req.body.reason
  }
}));

// Content management actions
const logContentDeleted = (contentType) => {
  return logActivity('content_deleted', (req, res, data) => ({
    targetType: contentType,
    targetId: req.params.id,
    details: `${contentType} deleted`,
    metadata: {
      reason: req.body.reason
    }
  }));
};

const logContentReported = (contentType) => {
  return logActivity('content_reported', (req, res, data) => ({
    targetType: contentType,
    targetId: req.params.id || data.report?.contentId,
    details: `${contentType} reported`,
    metadata: {
      reason: req.body.reason,
      reportedBy: req.user?._id
    }
  }));
};

// Job and application actions
const logJobPosted = logActivity('job_posted', (req, res, data) => ({
  targetType: 'JobPosting',
  targetId: data.job?._id || data._id,
  details: `Job posting created: ${data.job?.title || data.title}`,
  metadata: {
    jobTitle: data.job?.title || data.title,
    company: data.job?.company || data.company
  }
}));

const logApplicationStatusChanged = logActivity('application_status_changed', (req, res, data) => ({
  targetType: 'JobApplication',
  targetId: req.params.id || data.application?._id,
  details: `Application status changed to ${req.body.status || data.application?.status}`,
  metadata: {
    oldStatus: data.oldStatus,
    newStatus: req.body.status || data.application?.status,
    jobId: data.application?.jobId
  }
}));

// Course actions
const logCoursePublished = logActivity('course_published', (req, res, data) => ({
  targetType: 'Course',
  targetId: data.course?._id || data._id,
  details: `Course published: ${data.course?.title || data.title}`,
  metadata: {
    courseTitle: data.course?.title || data.title,
    instructor: data.course?.instructor || data.instructor
  }
}));

const logCourseEnrolled = logActivity('course_enrolled', (req, res, data) => ({
  targetType: 'Course',
  targetId: req.params.courseId || data.enrollment?.courseId,
  details: `User enrolled in course`,
  metadata: {
    enrollmentId: data.enrollment?._id,
    userId: req.user?._id
  }
}));

// Review actions
const logReviewPosted = logActivity('review_posted', (req, res, data) => ({
  targetType: 'Review',
  targetId: data.review?._id || data._id,
  details: `Review posted`,
  metadata: {
    rating: data.review?.rating || data.rating,
    reviewedUserId: data.review?.reviewedUserId || data.reviewedUserId
  }
}));

/**
 * Manual activity logging helper
 * Use this in controllers when automatic middleware isn't suitable
 */
const logManualActivity = async (req, actionType, targetType, targetId, details, metadata = {}) => {
  try {
    const actorId = req.user?._id || req.user?.id;
    const actorName = req.user?.name || req.user?.username || 'Unknown';
    const ipAddress = getClientIp(req);

    if (!actorId) {
      logger.warn('Manual activity log skipped: No authenticated user', {
        actionType
      });
      return null;
    }

    return await createActivityLog({
      actorId,
      actorName,
      actionType,
      targetType,
      targetId,
      details,
      ipAddress,
      metadata: {
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent'],
        ...metadata
      }
    });
  } catch (error) {
    logger.error('Failed to create manual activity log', {
      error: error.message,
      actionType
    });
    return null;
  }
};

module.exports = {
  logActivity,
  logUserModified,
  logUserDeleted,
  logContentDeleted,
  logContentReported,
  logJobPosted,
  logApplicationStatusChanged,
  logCoursePublished,
  logCourseEnrolled,
  logReviewPosted,
  logManualActivity,
  getClientIp
};
