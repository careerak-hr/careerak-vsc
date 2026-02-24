const express = require('express');
const router = express.Router();
const twoFactorController = require('../controllers/twoFactorController');
const { protect } = require('../middleware/auth');

/**
 * مسارات المصادقة الثنائية (2FA)
 * جميع المسارات محمية بـ authentication ما عدا verify
 */

// إعداد 2FA - توليد QR code
router.post('/setup', protect, twoFactorController.setup2FA);

// تفعيل 2FA - التحقق من الرمز وتفعيل الميزة
router.post('/enable', protect, twoFactorController.enable2FA);

// تعطيل 2FA
router.post('/disable', protect, twoFactorController.disable2FA);

// التحقق من رمز 2FA (أثناء تسجيل الدخول - لا يحتاج protect)
router.post('/verify', twoFactorController.verify2FA);

// الحصول على حالة 2FA
router.get('/status', protect, twoFactorController.get2FAStatus);

// توليد رموز احتياطية جديدة
router.post('/regenerate-backup-codes', protect, twoFactorController.regenerateBackupCodes);

module.exports = router;
