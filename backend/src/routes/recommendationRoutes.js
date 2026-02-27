/**
 * 🎯 Recommendation Routes
 * مسارات API لتوصيات الوظائف الذكية
 */

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

// جميع المسارات تتطلب مصادقة
router.use(protect);

/**
 * @route   GET /api/recommendations/jobs
 * @desc    الحصول على توصيات الوظائف المخصصة للمستخدم
 * @access  Private
 * @query   {number} [limit=20] - الحد الأقصى لعدد التوصيات
 * @query   {number} [minScore=0.5] - الحد الأدنى لنسبة التطابق (0-1)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - recommendations: Array<Object> - قائمة التوصيات
 *   - total: number - عدد التوصيات
 *   - userProfile: Object - ملخص ملف المستخدم
 * 
 * @example
 * GET /api/recommendations/jobs?limit=10&minScore=0.6
 */
router.get('/jobs', recommendationController.getJobRecommendations);

/**
 * @route   GET /api/recommendations/jobs/:jobId/match
 * @desc    حساب درجة التطابق بين المستخدم ووظيفة محددة
 * @access  Private
 * @params  {string} jobId - معرف الوظيفة
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - job: Object - معلومات الوظيفة
 *   - matchScore: Object - درجة التطابق
 *   - reasons: Array<Object> - أسباب التطابق
 *   - aiAnalysis: Object|null - تحليل الذكاء الاصطناعي
 *   - recommendations: Array<Object> - اقتراحات
 * 
 * @example
 * GET /api/recommendations/jobs/507f1f77bcf86cd799439011/match
 */
router.get('/jobs/:jobId/match', recommendationController.calculateJobMatch);

/**
 * @route   GET /api/recommendations/profile-analysis
 * @desc    تحليل ملف المستخدم وتقديم اقتراحات للتحسين
 * @access  Private
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - analysis: Object - تحليل الملف الشخصي
 *     - profileCompleteness: Object - درجة اكتمال الملف
 *     - strengths: Array<Object> - نقاط القوة
 *     - improvementAreas: Array<Object> - مجالات التحسين
 *     - skillGaps: Array<Object> - فجوات المهارات
 *     - recommendations: Array<Object> - اقتراحات
 * 
 * @example
 * GET /api/recommendations/profile-analysis
 */
router.get('/profile-analysis', recommendationController.analyzeUserProfile);

/**
 * @route   GET /api/recommendations/saved
 * @desc    الحصول على التوصيات المحفوظة من قاعدة البيانات
 * @access  Private
 * @query   {number} [limit=20] - الحد الأقصى لعدد التوصيات
 * @query   {number} [minScore=30] - الحد الأدنى لنسبة التطابق (0-100)
 * @query   {boolean} [excludeSeen=false] - استبعاد التوصيات التي تمت مشاهدتها
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - recommendations: Array<Object> - قائمة التوصيات مع أسبابها
 *   - total: number - عدد التوصيات
 *   - source: string - مصدر التوصيات ['database', 'generated']
 * 
 * @example
 * GET /api/recommendations/saved?limit=10&minScore=50&excludeSeen=true
 */
router.get('/saved', recommendationController.getSavedRecommendations);

/**
 * @route   POST /api/recommendations/feedback
 * @desc    تسجيل تفاعل المستخدم مع التوصية
 * @access  Private
 * @body    {Object} - بيانات التفاعل:
 *   - jobId: string - معرف الوظيفة (مطلوب)
 *   - action: string - نوع التفاعل ['view', 'like', 'apply', 'ignore', 'save'] (مطلوب)
 *   - rating: number - التقييم (1-5) (اختياري)
 *   - comments: string - تعليقات (اختياري)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - feedback: Object - بيانات التفاعل المسجلة
 * 
 * @example
 * POST /api/recommendations/feedback
 * {
 *   "jobId": "507f1f77bcf86cd799439011",
 *   "action": "like",
 *   "rating": 4,
 *   "comments": "وظيفة مناسبة لمهاراتي"
 * }
 */
router.post('/feedback', recommendationController.recordFeedback);

/**
 * @route   GET /api/recommendations/skill-gaps
 * @desc    تحليل فجوات المهارات بين المستخدم والوظائف المستهدفة وتوليد توصيات الدورات
 * @access  Private
 * @query   {string} [jobId] - معرف الوظيفة المستهدفة (اختياري)
 * @query   {string} [targetJobTitle] - عنوان الوظيفة المستهدفة (اختياري)
 * @query   {number} [limit=5] - عدد الوظائف المشابهة للتحليل
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - targetJob: Object - الوظيفة المستهدفة
 *   - analysis: Object - تحليل فجوات المهارات مع الوظيفة المستهدفة
 *   - aggregatedAnalysis: Object - تحليل مجمع لفجوات المهارات
 *   - courseRecommendations: Array<Object> - توصيات الدورات المخصصة
 *   - similarJobsAnalysis: Array<Object> - تحليل الوظائف المشابهة
 *   - improvementPlan: Object - خطة تحسين المهارات
 * 
 * @example
 * GET /api/recommendations/skill-gaps?jobId=507f1f77bcf86cd799439011
 * GET /api/recommendations/skill-gaps?targetJobTitle=مطور ويب
 */
router.get('/skill-gaps', recommendationController.analyzeSkillGaps);

/**
 * @route   GET /api/recommendations/courses
 * @desc    الحصول على توصيات الدورات بناءً على الوظائف المستهدفة
 * @access  Private
 * @query   {string|Array} [jobIds] - معرفات الوظائف المستهدفة (اختياري)
 * @query   {string|Array} [targetJobTitles] - عناوين الوظائف المستهدفة (اختياري)
 * @query   {number} [limit=10] - الحد الأقصى لعدد الدورات المقترحة
 * @query   {boolean} [includeLearningPaths=true] - تضمين مسارات التعلم المخصصة
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - user: Object - معلومات المستخدم
 *   - targetJobs: Array<Object> - الوظائف المستهدفة
 *   - skillGapAnalysis: Object - تحليل فجوات المهارات
 *   - courseRecommendations: Array<Object> - توصيات الدورات المخصصة
 *   - learningPaths: Array<Object> - مسارات التعلم المخصصة
 *   - employmentImprovement: Object - توقع تحسين فرص التوظيف
 *   - report: Object - تقرير التوصيات
 *   - metadata: Object - معلومات إضافية
 * 
 * @example
 * GET /api/recommendations/courses?jobIds=507f1f77bcf86cd799439011
 * GET /api/recommendations/courses?targetJobTitles=مطور ويب&limit=5
 * GET /api/recommendations/courses?targetJobTitles[]=مطور ويب&targetJobTitles[]=مصمم واجهات
 */
router.get('/courses', recommendationController.getCourseRecommendations);

/**
 * @route   GET /api/recommendations/courses/quick
 * @desc    الحصول على توصيات سريعة للدورات بناءً على ملف المستخدم
 * @access  Private
 * @query   {number} [limit=5] - الحد الأقصى لعدد الدورات المقترحة
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - courseRecommendations: Array<Object> - توصيات الدورات المبسطة
 * 
 * @example
 * GET /api/recommendations/courses/quick?limit=3
 */
router.get('/courses/quick', recommendationController.getQuickCourseRecommendations);

/**
 * @route   GET /api/recommendations/candidates/filter
 * @desc    فلترة ذكية للمرشحين حسب الخبرة، المهارات، والموقع
 * @access  Private (للشركات فقط)
 * @query   {string} [jobId] - معرف الوظيفة للفلترة بناءً عليها (اختياري)
 * @query   {string|Array} [skills] - المهارات المطلوبة (اختياري)
 * @query   {number} [minExperience] - الحد الأدنى لسنوات الخبرة (اختياري)
 * @query   {number} [maxExperience] - الحد الأقصى لسنوات الخبرة (اختياري)
 * @query   {string} [location] - الموقع المطلوب (مدينة أو دولة) (اختياري)
 * @query   {string} [education] - المستوى التعليمي المطلوب (اختياري)
 * @query   {number} [minScore=30] - الحد الأدنى لدرجة التطابق (0-100)
 * @query   {number} [limit=50] - الحد الأقصى لعدد المرشحين
 * @query   {string} [sortBy=score] - ترتيب النتائج ['score', 'experience', 'education']
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - candidates: Array<Object> - قائمة المرشحين المفلترين
 *   - stats: Object - إحصاءات الفلترة
 *   - filters: Object - المعايير المستخدمة في الفلترة
 *   - timestamp: Date
 * 
 * @example
 * GET /api/recommendations/candidates/filter?skills=JavaScript&skills=React&minExperience=2&location=القاهرة
 * GET /api/recommendations/candidates/filter?jobId=507f1f77bcf86cd799439011&minScore=50
 * GET /api/recommendations/candidates/filter?education=bachelor&sortBy=experience
 */
router.get('/candidates/filter', recommendationController.filterCandidatesIntelligently);

/**
 * @route   POST /api/recommendations/notify-matches
 * @desc    إرسال إشعارات فورية للمستخدمين عند إيجاد تطابقات جديدة
 * @access  Private (للشركات فقط)
 * @body    {Object} - بيانات الإشعار:
 *   - jobId: string - معرف الوظيفة (مطلوب)
 *   - minScore: number - الحد الأدنى لدرجة التطابق (افتراضي: 70)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - job: Object - معلومات الوظيفة
 *   - stats: Object - إحصاءات الإشعارات
 *   - topMatches: Array<Object> - أفضل التطابقات
 * 
 * @example
 * POST /api/recommendations/notify-matches
 * {
 *   "jobId": "507f1f77bcf86cd799439011",
 *   "minScore": 70
 * }
 */
router.post('/notify-matches', recommendationController.notifyNewMatches);

/**
 * @route   POST /api/recommendations/notify-candidate-match
 * @desc    إشعار الشركة بمرشح مناسب جديد
 * @access  Private (للشركات فقط)
 * @body    {Object} - بيانات الإشعار:
 *   - candidateId: string - معرف المرشح (مطلوب)
 *   - jobId: string - معرف الوظيفة (مطلوب)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - notification: Object - معلومات الإشعار
 *   - match: Object - معلومات التطابق
 * 
 * @example
 * POST /api/recommendations/notify-candidate-match
 * {
 *   "candidateId": "507f1f77bcf86cd799439011",
 *   "jobId": "507f1f77bcf86cd799439012"
 * }
 */
router.post('/notify-candidate-match', recommendationController.notifyCandidateMatch);

/**
 * @route   POST /api/recommendations/notify-update
 * @desc    إرسال إشعار فوري بتحديث التوصيات
 * @access  Private
 * @body    {Object} - بيانات الإشعار:
 *   - updateType: string - نوع التحديث ['new_recommendations', 'profile_updated', 'high_match_found'] (مطلوب)
 *   - data: Object - بيانات إضافية (اختياري)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - message: string
 *   - notification: Object - معلومات الإشعار
 * 
 * @example
 * POST /api/recommendations/notify-update
 * {
 *   "updateType": "high_match_found",
 *   "data": {
 *     "matchScore": 95,
 *     "jobId": "507f1f77bcf86cd799439011"
 *   }
 * }
 */
router.post('/notify-update', recommendationController.notifyRecommendationUpdate);

module.exports = router;

/**
 * @route   GET /api/recommendations/accuracy
 * @desc    الحصول على دقة التوصيات للمستخدم
 * @access  Private
 * @query   {string} [itemType=job] - نوع العنصر ['job', 'course']
 * @query   {number} [period=30] - فترة التحليل بالأيام
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - data: Object - بيانات الدقة
 *     - status: string - حالة التحليل
 *     - accuracy: Object - مقاييس الدقة
 *     - level: Object - مستوى الدقة
 *     - improvements: Array<Object> - اقتراحات التحسين
 * 
 * @example
 * GET /api/recommendations/accuracy?itemType=job&period=30
 */
router.get('/accuracy', recommendationController.getUserAccuracy);

/**
 * @route   GET /api/recommendations/accuracy/system
 * @desc    الحصول على دقة التوصيات على مستوى النظام (للأدمن فقط)
 * @access  Private (Admin only)
 * @query   {string} [itemType=job] - نوع العنصر ['job', 'course']
 * @query   {number} [period=30] - فترة التحليل بالأيام
 * @query   {number} [sampleSize=100] - حجم العينة من المستخدمين
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - data: Object - بيانات دقة النظام
 *     - status: string - حالة التحليل
 *     - accuracy: Object - مقاييس الدقة الإجمالية
 *     - level: Object - مستوى الدقة
 *     - report: Object - تقرير مفصل
 * 
 * @example
 * GET /api/recommendations/accuracy/system?itemType=job&period=30&sampleSize=100
 */
router.get('/accuracy/system', recommendationController.getSystemAccuracy);

/**
 * @route   GET /api/recommendations/accuracy/improvement
 * @desc    تتبع تحسن دقة التوصيات مع الوقت
 * @access  Private
 * @query   {string} [itemType=job] - نوع العنصر ['job', 'course']
 * @query   {string} [periods=7,14,30] - فترات التحليل بالأيام (مفصولة بفواصل)
 * 
 * @response {Object} - استجابة JSON تحتوي على:
 *   - success: boolean
 *   - data: Object - بيانات التحسن
 *     - status: string - حالة التحليل
 *     - history: Array<Object> - سجل الدقة عبر الفترات
 *     - improvement: Object - معدل التحسن
 * 
 * @example
 * GET /api/recommendations/accuracy/improvement?itemType=job&periods=7,14,30
 */
router.get('/accuracy/improvement', recommendationController.getAccuracyImprovement);
