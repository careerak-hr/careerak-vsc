const express = require('express');
const router = express.Router();
const savedSearchController = require('../controllers/savedSearchController');
const { protect } = require('../middleware/auth');

// جميع المسارات محمية بـ authentication
router.use(protect);

/**
 * @route   POST /api/search/saved
 * @desc    إنشاء عملية بحث محفوظة جديدة
 * @access  Private
 */
router.post('/', savedSearchController.createSavedSearch);

/**
 * @route   GET /api/search/saved
 * @desc    جلب جميع عمليات البحث المحفوظة
 * @access  Private
 */
router.get('/', savedSearchController.getSavedSearches);

/**
 * @route   GET /api/search/saved/check-limit
 * @desc    التحقق من إمكانية إضافة عملية بحث جديدة
 * @access  Private
 */
router.get('/check-limit', savedSearchController.checkLimit);

/**
 * @route   GET /api/search/saved/:id
 * @desc    جلب عملية بحث محفوظة واحدة
 * @access  Private
 */
router.get('/:id', savedSearchController.getSavedSearchById);

/**
 * @route   PUT /api/search/saved/:id
 * @desc    تحديث عملية بحث محفوظة
 * @access  Private
 */
router.put('/:id', savedSearchController.updateSavedSearch);

/**
 * @route   DELETE /api/search/saved/:id
 * @desc    حذف عملية بحث محفوظة
 * @access  Private
 */
router.delete('/:id', savedSearchController.deleteSavedSearch);

module.exports = router;
