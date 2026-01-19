const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// استيراد المسارات
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// إعدادات الأمان
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ الاتصال بقاعدة البيانات
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next();
  }
});

// ✅ الحل الجذري: مطابقة المسارات مع نداءات الهاتف
// جعل كل المسارات تبدأ بـ /api صراحة داخل Express
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// مسار الفحص (سيصبح https://careerak-vsc.vercel.app/api/health)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Operational',
    database: require('mongoose').connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// الصفحة الرئيسية (سيصبح https://careerak-vsc.vercel.app/api)
app.get('/api', (req, res) => {
  res.status(200).send("Careerak API Gateway is LIVE.");
});

// مسار افتراضي للمساعدة في التشخيص
app.get('/', (req, res) => {
  res.status(200).send("Careerak Server is running. Use /api path for requests.");
});

module.exports = app;
