const AdminNotification = require('../models/AdminNotification');
const NotificationPreference = require('../models/NotificationPreference');
const { User } = require('../models/User');
const logger = require('../utils/logger');
const pusherService = require('./pusherService');

class AdminNotificationService {
  
  /**
   * Create admin notification with priority handling
   * @param {Object} params - Notification parameters
   * @param {String|Array} params.adminId - Admin user ID(s) or 'all' for all admins
   * @param {String} params.type - Notification type
   * @param {String} params.priority - Priority level (low, medium, high, urgent)
   * @param {String} params.title - Notification title
   * @param {String} params.message - Notification message
   * @param {String} params.actionUrl - Optional action URL
   * @param {String} params.relatedId - Optional related document ID
   * @param {String} params.relatedType - Optional related document type
   * @returns {Promise<Array>} Created notifications
   */
  async createAdminNotification({
    adminId,
    type,
    priority = 'medium',
    title,
    message,
    actionUrl,
    relatedId,
    relatedType
  }) {
    try {
      // Get admin IDs
      let adminIds = [];
      
      if (adminId === 'all') {
        // Get all admin and moderator users
        const admins = await User.find({
          role: { $in: ['admin', 'moderator'] }
        }).select('_id');
        adminIds = admins.map(admin => admin._id);
      } else if (Array.isArray(adminId)) {
        adminIds = adminId;
      } else {
        adminIds = [adminId];
      }
      
      if (adminIds.length === 0) {
        logger.warn('No admin users found for notification');
        return [];
      }
      
      // Create notifications for each admin
      const notifications = [];
      
      for (const id of adminIds) {
        // Check preferences
        const shouldSend = await this.shouldSendNotification(id, type);
        
        if (!shouldSend) {
          logger.info(`Notification type ${type} is disabled for admin ${id}`);
          continue;
        }
        
        // Check quiet hours
        if (await this.isQuietHours(id)) {
          logger.info(`Quiet hours active for admin ${id}, skipping notification`);
          continue;
        }
        
        const notification = await AdminNotification.create({
          adminId: id,
          type,
          priority,
          title,
          message,
          actionUrl,
          relatedId,
          relatedType
        });
        
        notifications.push(notification);
        logger.info(`Admin notification created: ${notification._id} for admin ${id}`);
        
        // Broadcast notification via Pusher (Requirement 6.8)
        await pusherService.broadcastNotification(notification.toObject());
        
        // Update unread count for this admin
        const unreadCount = await this.getUnreadCount(id);
        await pusherService.broadcastUnreadNotificationCount(id, unreadCount);
      }
      
      return notifications;
      
    } catch (error) {
      logger.error('Error creating admin notification:', error);
      throw error;
    }
  }
  
  /**
   * Get admin notifications with filtering and pagination
   * @param {String} adminId - Admin user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Notifications with pagination
   */
  async getAdminNotifications(adminId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        priority,
        isRead,
        startDate,
        endDate
      } = options;
      
      // Build query
      const query = { adminId };
      
      if (type) query.type = type;
      if (priority) query.priority = priority;
      if (typeof isRead === 'boolean') query.isRead = isRead;
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      
      // Execute query
      const notifications = await AdminNotification.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean();
      
      const total = await AdminNotification.countDocuments(query);
      const unreadCount = await this.getUnreadCount(adminId);
      
      return {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
      
    } catch (error) {
      logger.error('Error getting admin notifications:', error);
      throw error;
    }
  }
  
  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID
   * @param {String} adminId - Admin user ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, adminId) {
    try {
      const notification = await AdminNotification.findOne({
        _id: notificationId,
        adminId
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      if (notification.isRead) {
        return notification;
      }
      
      notification.isRead = true;
      await notification.save();
      
      logger.info(`Admin notification ${notificationId} marked as read`);
      return notification;
      
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read
   * @param {String} adminId - Admin user ID
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(adminId) {
    try {
      const result = await AdminNotification.updateMany(
        { adminId, isRead: false },
        { isRead: true }
      );
      
      logger.info(`Marked ${result.modifiedCount} notifications as read for admin ${adminId}`);
      return {
        success: true,
        count: result.modifiedCount
      };
      
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Get unread notification count
   * @param {String} adminId - Admin user ID
   * @returns {Promise<Number>} Unread count
   */
  async getUnreadCount(adminId) {
    try {
      return await AdminNotification.countDocuments({
        adminId,
        isRead: false
      });
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }
  
  /**
   * Delete notification
   * @param {String} notificationId - Notification ID
   * @param {String} adminId - Admin user ID
   * @returns {Promise<Object>} Deleted notification
   */
  async deleteNotification(notificationId, adminId) {
    try {
      const notification = await AdminNotification.findOneAndDelete({
        _id: notificationId,
        adminId
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      logger.info(`Admin notification ${notificationId} deleted`);
      return notification;
      
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }
  
  /**
   * Check if notification should be sent based on preferences
   * @param {String} adminId - Admin user ID
   * @param {String} type - Notification type
   * @returns {Promise<Boolean>} Should send notification
   */
  async shouldSendNotification(adminId, type) {
    try {
      const preferences = await NotificationPreference.findOne({ user: adminId });
      
      if (!preferences) {
        return true; // Default: send all notifications
      }
      
      // Check admin preferences
      if (preferences.adminPreferences && preferences.adminPreferences[type]) {
        return preferences.adminPreferences[type].enabled !== false;
      }
      
      return true;
      
    } catch (error) {
      logger.error('Error checking notification preferences:', error);
      return true; // Default: send on error
    }
  }
  
  /**
   * Check if current time is within quiet hours
   * @param {String} adminId - Admin user ID
   * @returns {Promise<Boolean>} Is quiet hours
   */
  async isQuietHours(adminId) {
    try {
      const preferences = await NotificationPreference.findOne({ user: adminId });
      
      if (!preferences || !preferences.quietHours?.enabled) {
        return false;
      }
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const { start, end } = preferences.quietHours;
      
      // Handle quiet hours that span midnight
      if (start < end) {
        return currentTime >= start && currentTime <= end;
      } else {
        return currentTime >= start || currentTime <= end;
      }
      
    } catch (error) {
      logger.error('Error checking quiet hours:', error);
      return false;
    }
  }
  
  // ============================================
  // Notification Creation Helpers
  // ============================================
  
  /**
   * Notify admins of new user registration
   */
  async notifyUserRegistered(userId, userName, userType) {
    return await this.createAdminNotification({
      adminId: 'all',
      type: 'user_registered',
      priority: 'low',
      title: 'مستخدم جديد',
      message: `انضم ${userName} (${userType}) إلى المنصة`,
      actionUrl: `/admin/users/${userId}`,
      relatedId: userId,
      relatedType: 'User'
    });
  }
  
  /**
   * Notify admins of new job posting
   */
  async notifyJobPosted(jobId, jobTitle, companyName) {
    return await this.createAdminNotification({
      adminId: 'all',
      type: 'job_posted',
      priority: 'medium',
      title: 'وظيفة جديدة',
      message: `نشرت ${companyName} وظيفة "${jobTitle}"`,
      actionUrl: `/admin/jobs/${jobId}`,
      relatedId: jobId,
      relatedType: 'JobPosting'
    });
  }
  
  /**
   * Notify admins of new course publication
   */
  async notifyCoursePublished(courseId, courseTitle, instructorName) {
    return await this.createAdminNotification({
      adminId: 'all',
      type: 'course_published',
      priority: 'medium',
      title: 'دورة جديدة',
      message: `نشر ${instructorName} دورة "${courseTitle}"`,
      actionUrl: `/admin/courses/${courseId}`,
      relatedId: courseId,
      relatedType: 'Course'
    });
  }
  
  /**
   * Notify admins of flagged review
   */
  async notifyReviewFlagged(reviewId, reviewerName, targetName, reason) {
    return await this.createAdminNotification({
      adminId: 'all',
      type: 'review_flagged',
      priority: 'high',
      title: 'تقييم مُبلغ عنه',
      message: `تم الإبلاغ عن تقييم من ${reviewerName} على ${targetName}. السبب: ${reason}`,
      actionUrl: `/admin/reviews/${reviewId}`,
      relatedId: reviewId,
      relatedType: 'Review'
    });
  }
  
  /**
   * Notify admins of reported content
   */
  async notifyContentReported(contentId, contentType, reporterName, reason) {
    return await this.createAdminNotification({
      adminId: 'all',
      type: 'content_reported',
      priority: 'high',
      title: 'محتوى مُبلغ عنه',
      message: `تم الإبلاغ عن ${contentType} من قبل ${reporterName}. السبب: ${reason}`,
      actionUrl: `/admin/content/${contentType}/${contentId}`,
      relatedId: contentId,
      relatedType: contentType
    });
  }
  
  /**
   * Notify admins of suspicious activity
   */
  async notifySuspiciousActivity(userId, userName, activityType, details) {
    return await this.createAdminNotification({
      adminId: 'all',
      type: 'suspicious_activity',
      priority: 'urgent',
      title: 'نشاط مشبوه',
      message: `نشاط مشبوه من ${userName}: ${activityType}. ${details}`,
      actionUrl: `/admin/users/${userId}`,
      relatedId: userId,
      relatedType: 'User'
    });
  }
  
  /**
   * Notify admins of system error
   */
  async notifySystemError(errorType, errorMessage, errorStack) {
    return await this.createAdminNotification({
      adminId: 'all',
      type: 'system_error',
      priority: 'urgent',
      title: 'خطأ في النظام',
      message: `${errorType}: ${errorMessage}`,
      actionUrl: '/admin/logs',
      relatedType: 'SystemError'
    });
  }
}

module.exports = new AdminNotificationService();
