// تحميل متغيرات البيئة من .env
require('dotenv').config();

const uploadRoutes = require('./routes/uploadRoutes');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const session = require('express-session');
// const csrf = require('csurf'); // معطل مؤقتاً لحل مشكلة الموبايل
const passport = require('./config/passport');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const {
  performanceMonitoring,
  securityMonitoring,
  statisticsCollection,
  attackDetection,
  getStats
} = require('./middleware/monitoring');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const authRoutes = require('./routes/authRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const exportRoutes = require('./routes/exportRoutes');
const dashboardLayoutRoutes = require('./routes/dashboardLayoutRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const contentManagementRoutes = require('./routes/contentManagementRoutes');

const app = express();

// 🌐 CORS Configuration - يجب أن يكون أول شيء!
const corsOptions = {
  origin: function (origin, callback) {
    // السماح بجميع الأصول في التطوير
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://careerak-vsc.vercel.app',
      'https://careerak.vercel.app'
    ];
    
    // السماح بالطلبات بدون origin (مثل Postman أو mobile apps)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // السماح بجميع الأصول مؤقتاً
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 ساعة
};

app.use(cors(corsOptions));

// معالجة preflight requests
app.options('*', cors(corsOptions));

// 🗜️ Compression Middleware (gzip/brotli)
// Enable compression for all responses
app.use(compression({
  // Compression level (0-9, default: 6)
  // Higher = better compression but slower
  level: 6,
  
  // Minimum response size to compress (in bytes)
  // Don't compress responses smaller than 1KB
  threshold: 1024,
  
  // Filter function to determine what to compress
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression filter function
    return compression.filter(req, res);
  },
  
  // Memory level (1-9, default: 8)
  // Higher = more memory but better compression
  memLevel: 8,
}));

// 🔒 Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // تعطيل CSP للتطوير
  crossOriginEmbedderPolicy: false
}));

// 🌐 HTTPS Enforcement في الإنتاج
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// ✅ الحل المؤقت: وضع مسار التحقق من الصحة قبل أي شيء آخر
app.get('/health', (req, res) => {
  logger.info('Health check accessed', { ip: req.ip });
  res.status(200).json({ status: 'live', server: 'vercel', timestamp: new Date().toISOString() });
});

// 🔐 Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'careerak_session_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS attacks
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// 🔐 Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// 🚦 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// 🧹 Data Sanitization
app.use(mongoSanitize()); // منع NoSQL injection
app.use(xss()); // منع XSS attacks

// 🔹 اتصال عند أول طلب فقط (مناسب لـ Vercel)
let isConnected = false;
app.use(async (req, res, next) => {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
      console.log("✅ MongoDB connected (first request)");
    }
    next();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// 📊 Monitoring Middleware
app.use(performanceMonitoring);
app.use(securityMonitoring);
app.use(statisticsCollection);
app.use(attackDetection);

app.use('/upload', uploadRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// المسارات (بدون حماية CSRF مؤقتاً)
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/users', userManagementRoutes);
app.use('/admin/activity-log', activityLogRoutes);
app.use('/admin/notifications', adminNotificationRoutes);
app.use('/admin/export', exportRoutes);
app.use('/admin/dashboard', dashboardLayoutRoutes);
app.use('/admin/statistics', statisticsRoutes);
app.use('/admin/reports', reportsRoutes);
app.use('/admin/content', contentManagementRoutes);
app.use('/notifications', notificationRoutes);
app.use('/chat', chatRoutes);
app.use('/reviews', require('./routes/reviewRoutes'));
app.use('/auth', authRoutes);
app.use('/auth/2fa', require('./routes/twoFactorRoutes'));
app.use('/oauth', oauthRoutes);
app.use('/errors', require('./routes/errorLogRoutes'));
app.use('/security-score', require('./routes/securityScoreRoutes'));
app.use('/devices', require('./routes/deviceRoutes'));
app.use('/recommendations', require('./routes/recommendationRoutes'));
app.use('/recommendations', require('./routes/dailyRecommendationRoutes')); // Daily recommendations
app.use('/recommendations/candidates', require('./routes/candidateRankingRoutes'));
app.use('/user-interactions', require('./routes/userInteractionRoutes'));
app.use('/learning-paths', require('./routes/learningPathRoutes'));
app.use('/cv', require('./routes/cvParserRoutes'));
app.use('/profile-analysis', require('./routes/profileAnalysisRoutes'));

// 📊 مسار الإحصائيات (محمي)
app.get('/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes('admin')) {
    return res.status(403).json({ error: 'غير مصرح' });
  }
  const stats = getStats();
  res.json({ ...stats, timestamp: new Date().toISOString() });
});

// 🚨 Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'حدث خطأ في الخادم' 
      : err.message 
  });
});

app.get('/', (req, res) => {
  res.status(200).send("Careerak API is Ready.");
});

// 🕐 بدء جدولة التحديث اليومي للتوصيات
if (process.env.NODE_ENV !== 'test') {
  const dailyRecommendationCron = require('./jobs/dailyRecommendationCron');
  
  // بدء الجدولة تلقائياً عند تشغيل السيرفر
  setTimeout(() => {
    try {
      dailyRecommendationCron.start();
      console.log('✅ تم بدء جدولة التحديث اليومي للتوصيات');
    } catch (error) {
      console.error('❌ خطأ في بدء جدولة التحديث اليومي:', error);
    }
  }, 5000); // انتظار 5 ثواني بعد بدء السيرفر
}

module.exports = app;
