const express = require('express');
const router = express.Router();
const adminNotificationController = require('../controllers/adminNotificationController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes - require authentication and admin/moderator role
router.use(protect);
router.use(authorize('admin', 'moderator'));

// ============================================
// Notification Routes
// ============================================

/**
 * @route   GET /api/admin/notifications
 * @desc    Get admin notifications with pagination and filtering
 * @access  Private (Admin/Moderator)
 * @query   page, limit, type, priority, isRead, startDate, endDate
 */
router.get('/', adminNotificationController.getNotifications);

/**
 * @route   GET /api/admin/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private (Admin/Moderator)
 */
router.get('/unread-count', adminNotificationController.getUnreadCount);

/**
 * @route   GET /api/admin/notifications/summary
 * @desc    Get notification summary
 * @access  Private (Admin/Moderator)
 */
router.get('/summary', adminNotificationController.getNotificationSummary);

/**
 * @route   PATCH /api/admin/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private (Admin/Moderator)
 */
router.patch('/mark-all-read', adminNotificationController.markAllAsRead);

/**
 * @route   PATCH /api/admin/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private (Admin/Moderator)
 */
router.patch('/:id/read', adminNotificationController.markAsRead);

/**
 * @route   DELETE /api/admin/notifications/:id
 * @desc    Delete notification
 * @access  Private (Admin/Moderator)
 */
router.delete('/:id', adminNotificationController.deleteNotification);

// ============================================
// Preference Routes
// ============================================

/**
 * @route   GET /api/admin/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private (Admin/Moderator)
 */
router.get('/preferences', adminNotificationController.getPreferences);

/**
 * @route   PUT /api/admin/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private (Admin/Moderator)
 * @body    { adminPreferences, quietHours }
 */
router.put('/preferences', adminNotificationController.updatePreferences);

/**
 * @route   PATCH /api/admin/notifications/preferences/:type
 * @desc    Update specific notification type
 * @access  Private (Admin/Moderator)
 * @body    { enabled, push, email }
 */
router.patch('/preferences/:type', adminNotificationController.updateNotificationType);

/**
 * @route   PUT /api/admin/notifications/preferences/quiet-hours
 * @desc    Update quiet hours
 * @access  Private (Admin/Moderator)
 * @body    { enabled, start, end }
 */
router.put('/preferences/quiet-hours', adminNotificationController.updateQuietHours);

/**
 * @route   POST /api/admin/notifications/preferences/enable-all
 * @desc    Enable all admin notifications
 * @access  Private (Admin/Moderator)
 */
router.post('/preferences/enable-all', adminNotificationController.enableAllNotifications);

/**
 * @route   POST /api/admin/notifications/preferences/disable-all
 * @desc    Disable all admin notifications
 * @access  Private (Admin/Moderator)
 */
router.post('/preferences/disable-all', adminNotificationController.disableAllNotifications);

module.exports = router;
