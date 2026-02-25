const adminNotificationService = require('../services/adminNotificationService');
const notificationPreferenceService = require('../services/notificationPreferenceService');
const logger = require('../utils/logger');

class AdminNotificationController {
  
  /**
   * Get admin notifications with pagination and filtering
   * GET /api/admin/notifications
   */
  async getNotifications(req, res) {
    try {
      const adminId = req.user._id;
      
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        type: req.query.type,
        priority: req.query.priority,
        isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const result = await adminNotificationService.getAdminNotifications(adminId, options);
      
      res.json({
        success: true,
        ...result
      });
      
    } catch (error) {
      logger.error('Error in getNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب الإشعارات',
        error: error.message
      });
    }
  }
  
  /**
   * Get unread notification count
   * GET /api/admin/notifications/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const adminId = req.user._id;
      const count = await adminNotificationService.getUnreadCount(adminId);
      
      res.json({
        success: true,
        count
      });
      
    } catch (error) {
      logger.error('Error in getUnreadCount:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب عدد الإشعارات غير المقروءة',
        error: error.message
      });
    }
  }
  
  /**
   * Mark notification as read
   * PATCH /api/admin/notifications/:id/read
   */
  async markAsRead(req, res) {
    try {
      const adminId = req.user._id;
      const notificationId = req.params.id;
      
      const notification = await adminNotificationService.markAsRead(notificationId, adminId);
      
      res.json({
        success: true,
        notification
      });
      
    } catch (error) {
      logger.error('Error in markAsRead:', error);
      
      if (error.message === 'Notification not found') {
        return res.status(404).json({
          success: false,
          message: 'الإشعار غير موجود'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'فشل في تحديد الإشعار كمقروء',
        error: error.message
      });
    }
  }
  
  /**
   * Mark all notifications as read
   * PATCH /api/admin/notifications/mark-all-read
   */
  async markAllAsRead(req, res) {
    try {
      const adminId = req.user._id;
      const result = await adminNotificationService.markAllAsRead(adminId);
      
      res.json({
        success: true,
        ...result
      });
      
    } catch (error) {
      logger.error('Error in markAllAsRead:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تحديد جميع الإشعارات كمقروءة',
        error: error.message
      });
    }
  }
  
  /**
   * Delete notification
   * DELETE /api/admin/notifications/:id
   */
  async deleteNotification(req, res) {
    try {
      const adminId = req.user._id;
      const notificationId = req.params.id;
      
      const notification = await adminNotificationService.deleteNotification(notificationId, adminId);
      
      res.json({
        success: true,
        message: 'تم حذف الإشعار بنجاح',
        notification
      });
      
    } catch (error) {
      logger.error('Error in deleteNotification:', error);
      
      if (error.message === 'Notification not found') {
        return res.status(404).json({
          success: false,
          message: 'الإشعار غير موجود'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'فشل في حذف الإشعار',
        error: error.message
      });
    }
  }
  
  /**
   * Get notification preferences
   * GET /api/admin/notifications/preferences
   */
  async getPreferences(req, res) {
    try {
      const adminId = req.user._id;
      const preferences = await notificationPreferenceService.getPreferences(adminId);
      
      res.json({
        success: true,
        preferences: {
          adminPreferences: preferences.adminPreferences,
          quietHours: preferences.quietHours,
          pushSubscriptions: preferences.pushSubscriptions?.length || 0
        }
      });
      
    } catch (error) {
      logger.error('Error in getPreferences:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب تفضيلات الإشعارات',
        error: error.message
      });
    }
  }
  
  /**
   * Update notification preferences
   * PUT /api/admin/notifications/preferences
   */
  async updatePreferences(req, res) {
    try {
      const adminId = req.user._id;
      const { adminPreferences, quietHours } = req.body;
      
      const updates = {};
      if (adminPreferences) updates.adminPreferences = adminPreferences;
      if (quietHours) updates.quietHours = quietHours;
      
      const preferences = await notificationPreferenceService.updatePreferences(adminId, updates);
      
      res.json({
        success: true,
        message: 'تم تحديث التفضيلات بنجاح',
        preferences: {
          adminPreferences: preferences.adminPreferences,
          quietHours: preferences.quietHours
        }
      });
      
    } catch (error) {
      logger.error('Error in updatePreferences:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث التفضيلات',
        error: error.message
      });
    }
  }
  
  /**
   * Update specific notification type
   * PATCH /api/admin/notifications/preferences/:type
   */
  async updateNotificationType(req, res) {
    try {
      const adminId = req.user._id;
      const notificationType = req.params.type;
      const { enabled, push, email } = req.body;
      
      const settings = {};
      if (typeof enabled === 'boolean') settings.enabled = enabled;
      if (typeof push === 'boolean') settings.push = push;
      if (typeof email === 'boolean') settings.email = email;
      
      const preferences = await notificationPreferenceService.updateNotificationType(
        adminId,
        notificationType,
        settings,
        true // isAdmin
      );
      
      res.json({
        success: true,
        message: 'تم تحديث نوع الإشعار بنجاح',
        preferences: {
          adminPreferences: preferences.adminPreferences
        }
      });
      
    } catch (error) {
      logger.error('Error in updateNotificationType:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث نوع الإشعار',
        error: error.message
      });
    }
  }
  
  /**
   * Update quiet hours
   * PUT /api/admin/notifications/preferences/quiet-hours
   */
  async updateQuietHours(req, res) {
    try {
      const adminId = req.user._id;
      const { enabled, start, end } = req.body;
      
      const quietHours = {};
      if (typeof enabled === 'boolean') quietHours.enabled = enabled;
      if (start) quietHours.start = start;
      if (end) quietHours.end = end;
      
      const preferences = await notificationPreferenceService.updateQuietHours(adminId, quietHours);
      
      res.json({
        success: true,
        message: 'تم تحديث ساعات الهدوء بنجاح',
        quietHours: preferences.quietHours
      });
      
    } catch (error) {
      logger.error('Error in updateQuietHours:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث ساعات الهدوء',
        error: error.message
      });
    }
  }
  
  /**
   * Enable all admin notifications
   * POST /api/admin/notifications/preferences/enable-all
   */
  async enableAllNotifications(req, res) {
    try {
      const adminId = req.user._id;
      const preferences = await notificationPreferenceService.enableAllNotifications(adminId, true);
      
      res.json({
        success: true,
        message: 'تم تفعيل جميع الإشعارات',
        preferences: {
          adminPreferences: preferences.adminPreferences
        }
      });
      
    } catch (error) {
      logger.error('Error in enableAllNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تفعيل جميع الإشعارات',
        error: error.message
      });
    }
  }
  
  /**
   * Disable all admin notifications
   * POST /api/admin/notifications/preferences/disable-all
   */
  async disableAllNotifications(req, res) {
    try {
      const adminId = req.user._id;
      const preferences = await notificationPreferenceService.disableAllNotifications(adminId, true);
      
      res.json({
        success: true,
        message: 'تم تعطيل جميع الإشعارات',
        preferences: {
          adminPreferences: preferences.adminPreferences
        }
      });
      
    } catch (error) {
      logger.error('Error in disableAllNotifications:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تعطيل جميع الإشعارات',
        error: error.message
      });
    }
  }
  
  /**
   * Get notification summary
   * GET /api/admin/notifications/summary
   */
  async getNotificationSummary(req, res) {
    try {
      const adminId = req.user._id;
      const summary = await notificationPreferenceService.getNotificationSummary(adminId);
      
      res.json({
        success: true,
        summary
      });
      
    } catch (error) {
      logger.error('Error in getNotificationSummary:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب ملخص الإشعارات',
        error: error.message
      });
    }
  }
}

module.exports = new AdminNotificationController();
