/**
 * 🎯 Learning Path Routes
 * مسارات API لمسارات التعلم المخصصة
 */

const express = require('express');
const router = express.Router();
const learningPathController = require('../controllers/learningPathController');
const { protect } = require('../middleware/auth');

// جميع المسارات تتطلب مصادقة
router.use(protect);

/**
 * @route   POST /api/learning-paths/generate
 * @desc    توليد مسار تعلم مخصص بناءً على الوظائف المستهدفة
 * @access  Private
 * @body    {Object} - بيانات التوليد:
 *   - jobIds: Array<string> - معرفات الوظائف المستهدفة (اختياري)
 *   - targetJobTitles: Array<string> - عناوين الوظائف المستهدفة (اختياري)
 *   - options: Object - خيارات إضافية (اختياري)
 *     - notifications: boolean - تفعيل الإشعارات (افتراضي: true)
 *     - notificationFrequency: string - تكرار الإشعارات ['daily', 'weekly', 'biweekly', 'monthly'] (افتراضي: 'weekly')
 *     - pace: string - سرعة التعلم ['slow', 'moderate', 'fast', 'intensive'] (افتراضي: 'moderate')
 *     - weeklyHours: number - ساعات التعلم الأسبوعية (افتراضي: 10)
 *     - autoUpdate: boolean - التحديث التلقائي (افتراضي: true)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - learningPath: Object - مسار التعلم المولد
 *   - analysis: Object - تحليل التوليد
 *   - metadata: Object - معلومات إضافية
 * 
 * @example
 * POST /api/learning-paths/generate
 * {
 *   "jobIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
 *   "options": {
 *     "pace": "moderate",
 *     "weeklyHours": 12
 *   }
 * }
 */
router.post('/generate', learningPathController.generateLearningPath);

/**
 * @route   GET /api/learning-paths
 * @desc    جلب مسارات التعلم للمستخدم
 * @access  Private
 * @query   {string} [status] - حالة المسار ['active', 'paused', 'completed', 'abandoned'] (اختياري)
 * @query   {number} [limit=20] - الحد الأقصى لعدد المسارات
 * @query   {number} [skip=0] - عدد المسارات لتخطيها
 * @query   {string} [sortBy=createdAt] - حقل الترتيب ['createdAt', 'updatedAt', 'progress.overall']
 * @query   {string} [sortOrder=desc] - اتجاه الترتيب ['asc', 'desc']
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - learningPaths: Array<Object> - قائمة مسارات التعلم
 *   - total: number - العدد الإجمالي
 *   - pagination: Object - معلومات الترقيم
 * 
 * @example
 * GET /api/learning-paths?status=active&limit=10&sortBy=progress.overall&sortOrder=desc
 */
router.get('/', learningPathController.getLearningPaths);

/**
 * @route   GET /api/learning-paths/active
 * @desc    جلب مسار التعلم النشط للمستخدم
 * @access  Private
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - learningPath: Object|null - مسار التعلم النشط
 * 
 * @example
 * GET /api/learning-paths/active
 */
router.get('/active', learningPathController.getActiveLearningPath);

/**
 * @route   GET /api/learning-paths/:pathId
 * @desc    جلب تفاصيل مسار تعلم محدد
 * @access  Private
 * @params  {string} pathId - معرف مسار التعلم
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - learningPath: Object - تفاصيل مسار التعلم
 * 
 * @example
 * GET /api/learning-paths/507f1f77bcf86cd799439011
 */
router.get('/:pathId', learningPathController.getLearningPathDetails);

/**
 * @route   PATCH /api/learning-paths/:pathId/progress
 * @desc    تحديث تقدم دورة في مسار التعلم
 * @access  Private
 * @params  {string} pathId - معرف مسار التعلم
 * @body    {Object} - بيانات التحديث:
 *   - stageOrder: number - رقم المرحلة (مطلوب)
 *   - courseOrder: number - رقم الدورة في المرحلة (مطلوب)
 *   - status: string - الحالة الجديدة ['not_started', 'in_progress', 'completed', 'skipped'] (مطلوب)
 *   - progress: number - نسبة التقدم (0-100) (اختياري)
 *   - notes: string - ملاحظات (اختياري)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - learningPath: Object - مسار التعلم المحدث
 *   - updatedCourse: Object - معلومات الدورة المحدثة
 * 
 * @example
 * PATCH /api/learning-paths/507f1f77bcf86cd799439011/progress
 * {
 *   "stageOrder": 1,
 *   "courseOrder": 1,
 *   "status": "in_progress",
 *   "progress": 25,
 *   "notes": "بدأت في الفصل الأول"
 * }
 */
router.patch('/:pathId/progress', learningPathController.updateCourseProgress);

/**
 * @route   GET /api/learning-paths/:pathId/report
 * @desc    توليد تقرير تقدم مسار التعلم
 * @access  Private
 * @params  {string} pathId - معرف مسار التعلم
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - report: Object - تقرير التقدم
 *     - pathInfo: Object - معلومات المسار
 *     - progress: Object - ملخص التقدم
 *     - skills: Object - المهارات المطورة والمستهدفة
 *     - improvement: Object - مقاييس التحسين
 *     - nextSteps: Array<Object> - الخطوات التالية
 *     - recommendations: Array<Object> - التوصيات
 * 
 * @example
 * GET /api/learning-paths/507f1f77bcf86cd799439011/report
 */
router.get('/:pathId/report', learningPathController.generateProgressReport);

/**
 * @route   GET /api/learning-paths/stats
 * @desc    جلب إحصاءات مسارات التعلم للمستخدم
 * @access  Private
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - stats: Object - إحصاءات مسارات التعلم
 *     - byStatus: Object - الإحصاءات حسب الحالة
 *     - totals: Object - الإجماليات
 * 
 * @example
 * GET /api/learning-paths/stats
 */
router.get('/stats', learningPathController.getLearningStats);

/**
 * @route   PATCH /api/learning-paths/:pathId/status
 * @desc    تحديث حالة مسار التعلم
 * @access  Private
 * @params  {string} pathId - معرف مسار التعلم
 * @body    {Object} - بيانات التحديث:
 *   - status: string - الحالة الجديدة ['active', 'paused', 'completed', 'abandoned'] (مطلوب)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - learningPath: Object - مسار التعلم المحدث
 * 
 * @example
 * PATCH /api/learning-paths/507f1f77bcf86cd799439011/status
 * {
 *   "status": "paused"
 * }
 */
router.patch('/:pathId/status', learningPathController.updatePathStatus);

/**
 * @route   DELETE /api/learning-paths/:pathId
 * @desc    حذف مسار تعلم
 * @access  Private
 * @params  {string} pathId - معرف مسار التعلم
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - deletedPath: Object - معلومات المسار المحذوف
 * 
 * @example
 * DELETE /api/learning-paths/507f1f77bcf86cd799439011
 */
router.delete('/:pathId', learningPathController.deleteLearningPath);

module.exports = router;