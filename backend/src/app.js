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
app.get('/api/health', (req, res) => {
  logger.info('Health check accessed', { ip: req.ip });
  res.status(200).json({ status: 'live', server: 'vercel', timestamp: new Date().toISOString() });
});

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

app.use('/api/upload', uploadRoutes);

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

// 📊 مسار الإحصائيات (محمي)
app.get('/api/stats', (req, res) => {
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

module.exports = app;
