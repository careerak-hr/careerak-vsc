const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const securityController = require('../controllers/securityController');
const dataController = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

// جميع المسارات تتطلب مصادقة
router.use(protect);

// ========================================
// Settings Controller Routes
// ========================================

// Profile Management
router.put('/profile', settingsController.updateProfile);

// Email Change
router.post('/email/change', settingsController.initiateEmailChange);
router.post('/email/verify', settingsController.verifyEmailChange);

// Phone Change
router.post('/phone/change', settingsController.changePhone);

// Password Change
router.post('/password/change', settingsController.changePassword);

// Privacy Settings
router.get('/privacy', settingsController.getPrivacySettings);
router.put('/privacy', settingsController.updatePrivacySettings);

// Notification Preferences
router.get('/notifications', settingsController.getNotificationPreferences);
router.put('/notifications', settingsController.updateNotificationPreferences);

// ========================================
// Security Controller Routes
// ========================================

// Two-Factor Authentication
router.post('/2fa/enable', securityController.enable2FA);
router.post('/2fa/disable', securityController.disable2FA);
router.get('/2fa/backup-codes', securityController.getBackupCodes);
router.post('/2fa/regenerate-codes', securityController.regenerateBackupCodes);

// Session Management
router.get('/sessions', securityController.getActiveSessions);
router.delete('/sessions/:id', securityController.logoutSession);
router.delete('/sessions/others', securityController.logoutAllOtherSessions);

// Login History
router.get('/login-history', securityController.getLoginHistory);

// ========================================
// Data Controller Routes
// ========================================

// Data Export
router.post('/data/export', dataController.requestDataExport);
router.get('/data/export/:id', dataController.getExportStatus);
router.get('/data/download/:token', dataController.downloadExport);

// Account Deletion
router.post('/account/delete', dataController.requestAccountDeletion);
router.post('/account/cancel-deletion', dataController.cancelAccountDeletion);
router.get('/account/deletion-status', dataController.getDeletionStatus);

module.exports = router;
