const uploadRoutes = require('./routes/uploadRoutes');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const session = require('express-session');
// const csrf = require('csurf'); // معطل مؤقتاً لحل مشكلة الموبايل
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

const app = express();

// 🔒 Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // تعطيل CSP للتطوير
  crossOriginEmbedderPolicy: false
}));

// 🔐 Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'careerak_session_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 ساعة
  }
}));

// 🛡️ CSRF Protection (تم تعطيله مؤقتاً)
// const csrfProtection = csrf({ cookie: true });

// 🌐 HTTPS Enforcement في الإنتاج
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      logger.warn(`HTTP request redirected to HTTPS: ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// 🚦 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // حد أقصى 100 طلب لكل IP
  message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url
    });
    res.status(429).json({ error: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً' });
  }
});
app.use('/api/', limiter);

// 🧹 Data Sanitization
app.use(mongoSanitize()); // منع NoSQL injection
app.use(xss()); // منع XSS attacks

// 🔹 اتصال عند أول طلب فقط (مناسب لـ Vercel)
let isConnected = false;

// 📊 Monitoring Middleware
app.use(performanceMonitoring);
app.use(securityMonitoring);
app.use(statisticsCollection);
app.use(attackDetection);

app.use('/api/upload', uploadRoutes);

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

// ✅ الحل الجذري لمشكلة CORS: السماح الكامل واليدوي
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// المسارات (بدون حماية CSRF مؤقتاً)
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// مسار للحصول على CSRF token (معطل مؤقتاً)
// app.get('/api/csrf-token', csrfProtection, (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });

app.get('/api/health', (req, res) => {
  logger.info('Health check accessed', { ip: req.ip });
  res.status(200).json({ status: 'live', server: 'vercel', timestamp: new Date().toISOString() });
});

// 📊 مسار الإحصائيات (محمي)
app.get('/api/stats', (req, res) => {
  // التحقق من صلاحية الإدارة (يمكن تحسينه لاحقاً)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.includes('admin')) {
    return res.status(403).json({ error: 'غير مصرح' });
  }
  
  const stats = getStats();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    ...stats,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
    },
    timestamp: new Date().toISOString()
  });
});

// 🚨 Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // if (err.code === 'EBADCSRFTOKEN') { // معطل مؤقتاً
  //   return res.status(403).json({ error: 'رمز الأمان غير صحيح' });
  // }

  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'حدث خطأ في الخادم' 
      : err.message 
  });
});

app.get('/', (req, res) => {
  res.status(200).send("Careerak API is Ready.");
});

module.exports = app;
