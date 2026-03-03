const express = require('express');
const router = express.Router();
const searchAlertController = require('../controllers/searchAlertController');
const { protect } = require('../middleware/auth');

// جميع المسارات محمية بـ authentication
router.use(protect);

/**
 * @route   POST /api/search/alerts
 * @desc    إنشاء تنبيه جديد
 * @access  Private
 */
router.post('/', searchAlertController.createAlert);

/**
 * @route   GET /api/search/alerts
 * @desc    جلب جميع التنبيهات
 * @access  Private
 */
router.get('/', searchAlertController.getAlerts);

/**
 * @route   GET /api/search/alerts/:id
 * @desc    جلب تنبيه واحد
 * @access  Private
 */
router.get('/:id', searchAlertController.getAlertById);

/**
 * @route   PUT /api/search/alerts/:id
 * @desc    تحديث تنبيه
 * @access  Private
 */
router.put('/:id', searchAlertController.updateAlert);

/**
 * @route   DELETE /api/search/alerts/:id
 * @desc    حذف تنبيه
 * @access  Private
 */
router.delete('/:id', searchAlertController.deleteAlert);

module.exports = router;
