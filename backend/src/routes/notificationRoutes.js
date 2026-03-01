const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// جميع المسارات تحتاج مصادقة
router.use(auth);

// الحصول على الإشعارات
router.get('/', notificationController.getNotifications);

// الحصول على عدد الإشعارات غير المقروءة
router.get('/unread-count', notificationController.getUnreadCount);

// تحديد إشعار كمقروء
router.patch('/:id/read', notificationController.markAsRead);

// تحديد جميع الإشعارات كمقروءة
router.patch('/mark-all-read', notificationController.markAllAsRead);

// حذف إشعار
router.delete('/:id', notificationController.deleteNotification);

// الحصول على تفضيلات الإشعارات
router.get('/preferences', notificationController.getPreferences);

// تحديث تفضيلات الإشعارات
router.put('/preferences', notificationController.updatePreferences);

// إضافة Push Subscription
router.post('/push/subscribe', notificationController.subscribePush);

// إزالة Push Subscription
router.post('/push/unsubscribe', notificationController.unsubscribePush);

// الحصول على إعدادات تكرار الإشعارات
router.get('/frequency', notificationController.getNotificationFrequency);

// تحديث إعدادات تكرار الإشعارات
router.put('/frequency', notificationController.updateNotificationFrequency);

// إرسال الإشعارات المجمعة يدوياً
router.post('/batch/send', notificationController.sendBatchNotifications);

module.exports = router;
