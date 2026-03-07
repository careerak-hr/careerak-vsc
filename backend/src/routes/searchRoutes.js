const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const savedSearchRoutes = require('./savedSearchRoutes');
const { authenticate } = require('../middleware/auth');
const { searchRateLimiter, autocompleteRateLimiter } = require('../middleware/rateLimiter');
const {
  sanitizeInput,
  validateSearchParams,
  validateFilterParams,
  validateMapParams,
  validateAutocompleteParams
} = require('../middleware/inputValidation');

// تطبيق sanitization على جميع routes
router.use(sanitizeInput);

/**
 * @route   GET /api/search/autocomplete
 * @desc    الحصول على اقتراحات تلقائية للبحث
 * @access  Public (يعمل بدون تسجيل دخول، لكن يعطي نتائج أفضل مع تسجيل الدخول)
 * @query   q - نص البحث (يجب أن يكون 3 أحرف على الأقل)
 * @query   type - نوع البحث (jobs أو courses) - افتراضي: jobs
 * @query   limit - عدد الاقتراحات - افتراضي: 10
 */
router.get('/autocomplete',
  autocompleteRateLimiter,
  validateAutocompleteParams,
  (req, res, next) => {
    // نحاول المصادقة، لكن لا نفرضها
    if (req.headers.authorization) {
      return authenticate(req, res, next);
    }
    next();
  },
  searchController.getAutocomplete
);

/**
 * @route   GET /api/search/jobs
 * @desc    البحث عن الوظائف
 * @access  Public
 * @query   q - نص البحث (مطلوب)
 * @query   page - رقم الصفحة - افتراضي: 1
 * @query   limit - عدد النتائج - افتراضي: 20
 * @query   sort - الترتيب (relevance أو date) - افتراضي: relevance
 * @query   location - الموقع
 * @query   salaryMin - الحد الأدنى للراتب
 * @query   salaryMax - الحد الأقصى للراتب
 * @query   jobType - نوع العمل
 * @query   experienceLevel - مستوى الخبرة
 * @query   skills - المهارات (يمكن تكرارها)
 * @query   companySize - حجم الشركة
 * @query   datePosted - تاريخ النشر (today, week, month)
 */
router.get('/jobs',
  searchRateLimiter,
  validateSearchParams,
  validateFilterParams,
  (req, res, next) => {
    // نحاول المصادقة، لكن لا نفرضها
    if (req.headers.authorization) {
      return authenticate(req, res, next);
    }
    next();
  },
  searchController.searchJobs
);

/**
 * @route   GET /api/search/courses
 * @desc    البحث عن الدورات
 * @access  Public
 * @query   q - نص البحث (مطلوب)
 * @query   page - رقم الصفحة - افتراضي: 1
 * @query   limit - عدد النتائج - افتراضي: 20
 * @query   sort - الترتيب (relevance أو date) - افتراضي: relevance
 */
router.get('/courses',
  searchRateLimiter,
  validateSearchParams,
  (req, res, next) => {
    // نحاول المصادقة، لكن لا نفرضها
    if (req.headers.authorization) {
      return authenticate(req, res, next);
    }
    next();
  },
  searchController.searchCourses
);

/**
 * @route   GET /api/search/map
 * @desc    البحث عن الوظائف على الخريطة بناءً على حدود جغرافية
 * @access  Public
 * @query   north - خط العرض الشمالي (مطلوب)
 * @query   south - خط العرض الجنوبي (مطلوب)
 * @query   east - خط الطول الشرقي (مطلوب)
 * @query   west - خط الطول الغربي (مطلوب)
 * @query   salaryMin - الحد الأدنى للراتب
 * @query   salaryMax - الحد الأقصى للراتب
 * @query   jobType - نوع العمل
 * @query   experienceLevel - مستوى الخبرة
 * @query   skills - المهارات (يمكن تكرارها)
 * @query   companySize - حجم الشركة
 * @query   datePosted - تاريخ النشر (today, week, month)
 */
router.get('/map',
  searchRateLimiter,
  validateMapParams,
  validateFilterParams,
  searchController.searchJobsOnMap
);

// ============================================
// Saved Search Routes (Protected)
// ============================================
router.use('/saved', savedSearchRoutes);

// ============================================
// Search Alert Routes (Protected)
// ============================================
router.use('/alerts', require('./searchAlertRoutes'));

module.exports = router;
