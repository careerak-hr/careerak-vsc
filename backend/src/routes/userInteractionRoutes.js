/**
 * 🤖 User Interaction Routes
 * مسارات API لتتبع وتحليل تفاعلات المستخدم مع التوصيات
 * 
 * المتطلبات: 6.1, 6.2, 6.3 (تتبع التفاعلات، تحليل الأنماط، تحديث النماذج)
 */

const express = require('express');
const router = express.Router();
const userInteractionController = require('../controllers/userInteractionController');
const { authenticate, authorize } = require('../middleware/auth');

// جميع المسارات تتطلب مصادقة
router.use(authenticate);

/**
 * @route   POST /api/user-interactions/log
 * @desc    تسجيل تفاعل جديد
 * @access  Private
 * @body    {itemType, itemId, action, options}
 */
router.post('/log', userInteractionController.logInteraction);

/**
 * @route   GET /api/user-interactions
 * @desc    جلب تفاعلات المستخدم
 * @access  Private
 * @query   {itemType, action, startDate, endDate, limit, page, sortBy, sortOrder}
 */
router.get('/', userInteractionController.getUserInteractions);

/**
 * @route   GET /api/user-interactions/stats
 * @desc    جلب إحصاءات تفاعلات المستخدم
 * @access  Private
 * @query   {itemType, startDate, endDate}
 */
router.get('/stats', userInteractionController.getUserStats);

/**
 * @route   GET /api/user-interactions/preferences
 * @desc    جلب تفضيلات المستخدم من التفاعلات
 * @access  Private
 * @query   {itemType}
 */
router.get('/preferences', userInteractionController.getUserPreferences);

/**
 * @route   GET /api/user-interactions/conversion-rate
 * @desc    جلب معدل التحويل
 * @access  Private
 * @query   {itemType, startDate, endDate}
 */
router.get('/conversion-rate', userInteractionController.getConversionRate);

/**
 * @route   GET /api/user-interactions/patterns
 * @desc    تحليل الأنماط السلوكية
 * @access  Private
 * @query   {itemType, limit}
 */
router.get('/patterns', userInteractionController.analyzeBehaviorPatterns);

/**
 * @route   POST /api/user-interactions/update-recommendations
 * @desc    تحديث التوصيات بناءً على التفاعلات
 * @access  Private
 * @body    {itemType}
 */
router.post('/update-recommendations', userInteractionController.updateRecommendations);

// المسارات التالية للمسؤولين فقط
router.use(authorize(['admin']));

/**
 * @route   POST /api/user-interactions/cleanup
 * @desc    حذف تفاعلات قديمة
 * @access  Private (Admin only)
 * @body    {days}
 */
router.post('/cleanup', userInteractionController.cleanupOldInteractions);

/**
 * @route   POST /api/user-interactions/retrain-models
 * @desc    إعادة تدوير النماذج بناءً على التفاعلات
 * @access  Private (Admin only)
 * @body    {options}
 */
router.post('/retrain-models', userInteractionController.retrainModels);

module.exports = router;