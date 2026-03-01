/**
 * Screen Share Routes
 * مسارات API لمشاركة الشاشة
 */

const express = require('express');
const router = express.Router();
const screenShareController = require('../controllers/screenShareController');
const { authenticate } = require('../middleware/auth');

// جميع المسارات تتطلب مصادقة
router.use(authenticate);

/**
 * @route   POST /api/screen-share/start
 * @desc    بدء مشاركة الشاشة (التحقق والتسجيل)
 * @access  Private
 */
router.post('/start', screenShareController.startScreenShare.bind(screenShareController));

/**
 * @route   POST /api/screen-share/stop
 * @desc    إيقاف مشاركة الشاشة
 * @access  Private
 */
router.post('/stop', screenShareController.stopScreenShare.bind(screenShareController));

/**
 * @route   GET /api/screen-share/status/:roomId
 * @desc    الحصول على حالة مشاركة الشاشة
 * @access  Private
 */
router.get('/status/:roomId', screenShareController.getScreenShareStatus.bind(screenShareController));

/**
 * @route   GET /api/screen-share/stats/:roomId
 * @desc    الحصول على إحصائيات مشاركة الشاشة
 * @access  Private
 */
router.get('/stats/:roomId', screenShareController.getScreenShareStats.bind(screenShareController));

/**
 * @route   POST /api/screen-share/switch-source
 * @desc    تبديل مصدر المشاركة (التحقق)
 * @access  Private
 */
router.post('/switch-source', screenShareController.switchSource.bind(screenShareController));

module.exports = router;
