const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// الحصول على إشعارات المستخدم
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user.id;
    
    const result = await notificationService.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإشعارات'
    });
  }
};

// الحصول على عدد الإشعارات غير المقروءة
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const Notification = require('../models/Notification');
    
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    
    res.json({
      success: true,
      count
    });
    
  } catch (error) {
    logger.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب عدد الإشعارات'
    });
  }
};

// تحديد إشعار كمقروء
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await notificationService.markAsRead(id, userId);
    
    res.json({
      success: true,
      data: notification
    });
    
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الإشعار'
    });
  }
};

// تحديد جميع الإشعارات كمقروءة
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await notificationService.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة'
    });
    
  } catch (error) {
    logger.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الإشعارات'
    });
  }
};

// حذف إشعار
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await notificationService.deleteNotification(id, userId);
    
    res.json({
      success: true,
      message: 'تم حذف الإشعار'
    });
    
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الإشعار'
    });
  }
};

// الحصول على تفضيلات الإشعارات
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await notificationService.getUserPreferences(userId);
    
    res.json({
      success: true,
      data: preferences
    });
    
  } catch (error) {
    logger.error('Error getting preferences:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التفضيلات'
    });
  }
};

// تحديث تفضيلات الإشعارات
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;
    
    const updated = await notificationService.updatePreferences(userId, preferences);
    
    res.json({
      success: true,
      data: updated,
      message: 'تم تحديث التفضيلات بنجاح'
    });
    
  } catch (error) {
    logger.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث التفضيلات'
    });
  }
};

// إضافة Push Subscription
exports.subscribePush = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = req.body;
    
    await notificationService.addPushSubscription(userId, subscription);
    
    res.json({
      success: true,
      message: 'تم تفعيل الإشعارات الفورية'
    });
    
  } catch (error) {
    logger.error('Error subscribing to push:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تفعيل الإشعارات'
    });
  }
};

// إزالة Push Subscription
exports.unsubscribePush = async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;
    
    await notificationService.removePushSubscription(userId, endpoint);
    
    res.json({
      success: true,
      message: 'تم إلغاء الإشعارات الفورية'
    });
    
  } catch (error) {
    logger.error('Error unsubscribing from push:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إلغاء الإشعارات'
    });
  }
};

// الحصول على إعدادات تكرار الإشعارات
exports.getNotificationFrequency = async (req, res) => {
  try {
    const userId = req.user.id;
    const frequency = await notificationService.getNotificationFrequency(userId);
    
    res.json({
      success: true,
      data: frequency
    });
    
  } catch (error) {
    logger.error('Error getting notification frequency:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات التكرار'
    });
  }
};

// تحديث إعدادات تكرار الإشعارات
exports.updateNotificationFrequency = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recommendations, applications, system } = req.body;
    
    // التحقق من القيم الصحيحة
    const validFrequencies = ['instant', 'hourly', 'daily', 'weekly', 'disabled'];
    
    const frequencySettings = {};
    
    if (recommendations !== undefined) {
      if (!validFrequencies.includes(recommendations) && recommendations !== 'weekly') {
        return res.status(400).json({
          success: false,
          message: 'قيمة غير صحيحة لتكرار التوصيات'
        });
      }
      frequencySettings.recommendations = recommendations;
    }
    
    if (applications !== undefined) {
      const validAppFrequencies = ['instant', 'hourly', 'daily', 'disabled'];
      if (!validAppFrequencies.includes(applications)) {
        return res.status(400).json({
          success: false,
          message: 'قيمة غير صحيحة لتكرار إشعارات التطبيقات'
        });
      }
      frequencySettings.applications = applications;
    }
    
    if (system !== undefined) {
      const validSystemFrequencies = ['instant', 'daily', 'weekly', 'disabled'];
      if (!validSystemFrequencies.includes(system)) {
        return res.status(400).json({
          success: false,
          message: 'قيمة غير صحيحة لتكرار إشعارات النظام'
        });
      }
      frequencySettings.system = system;
    }
    
    const updated = await notificationService.updateNotificationFrequency(userId, frequencySettings);
    
    res.json({
      success: true,
      data: updated.notificationFrequency,
      message: 'تم تحديث إعدادات التكرار بنجاح'
    });
    
  } catch (error) {
    logger.error('Error updating notification frequency:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات التكرار'
    });
  }
};

// إرسال الإشعارات المجمعة يدوياً
exports.sendBatchNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.body;
    
    if (!['recommendations', 'applications', 'system'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'فئة غير صحيحة'
      });
    }
    
    const result = await notificationService.sendBatchNotifications(userId, category);
    
    res.json({
      success: true,
      data: result,
      message: result.sent > 0 ? `تم إرسال ${result.sent} إشعارات` : 'لا توجد إشعارات مؤجلة'
    });
    
  } catch (error) {
    logger.error('Error sending batch notifications:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إرسال الإشعارات المجمعة'
    });
  }
};

module.exports = exports;
