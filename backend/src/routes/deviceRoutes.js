const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect } = require('../middleware/auth');
const { trackLoginDevice } = require('../middleware/deviceTracking');

// جميع المسارات تتطلب مصادقة وتتبع الجهاز
router.use(protect);
router.use(trackLoginDevice);

/**
 * @route   GET /devices
 * @desc    الحصول على جميع أجهزة المستخدم
 * @access  Private
 */
router.get('/', deviceController.getUserDevices);

/**
 * @route   GET /devices/current
 * @desc    الحصول على معلومات الجهاز الحالي
 * @access  Private
 */
router.get('/current', deviceController.getCurrentDevice);

/**
 * @route   POST /devices/:deviceId/trust
 * @desc    تحديد جهاز كموثوق
 * @access  Private
 */
router.post('/:deviceId/trust', deviceController.trustDevice);

/**
 * @route   DELETE /devices/:deviceId
 * @desc    حذف جهاز
 * @access  Private
 */
router.delete('/:deviceId', deviceController.removeDevice);

/**
 * @route   DELETE /devices/others
 * @desc    حذف جميع الأجهزة الأخرى (ما عدا الجهاز الحالي)
 * @access  Private
 */
router.delete('/others/all', deviceController.removeOtherDevices);

module.exports = router;
