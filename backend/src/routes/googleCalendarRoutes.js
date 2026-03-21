const express = require('express');
const router = express.Router();
const googleCalendarController = require('../controllers/googleCalendarController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

/**
 * مسارات تكامل Google Calendar
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

// Rate limiting خاص بـ OAuth endpoints
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10,
  message: 'تم تجاوز الحد المسموح من طلبات OAuth، يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
});

// الحصول على رابط OAuth (يتطلب مصادقة)
router.get('/auth', protect, oauthLimiter, googleCalendarController.getAuthUrl.bind(googleCalendarController));

// معالجة callback من Google (لا يتطلب مصادقة - Google يعيد التوجيه هنا)
router.get('/callback', googleCalendarController.handleCallback.bind(googleCalendarController));

// مزامنة يدوية (يتطلب مصادقة)
router.post('/sync', protect, googleCalendarController.syncCalendar.bind(googleCalendarController));

// إلغاء الربط (يتطلب مصادقة)
router.delete('/disconnect', protect, googleCalendarController.disconnect.bind(googleCalendarController));

// حالة التكامل (يتطلب مصادقة)
router.get('/status', protect, googleCalendarController.getStatus.bind(googleCalendarController));

module.exports = router;
