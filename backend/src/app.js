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

// ✅ الاتصال الذكي بـ MongoDB (يحدث عند أول طلب فقط بفضل الـ Caching في database.js)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    next();
  }
});

// ✅ الربط الصحيح للمسارات:
// بما أن الدخول من api/index.js، فإننا لا نكرر كلمة /api هنا إلا إذا أردنا
// المسارات الحقيقية ستكون تحت /api/users و /api/admin
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);

// مسار الفحص السريع (سيصبح متاحاً على /api/health)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'Operational',
    database: require('mongoose').connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// الصفحة الرئيسية للمحرك (ستصبح متاحة على /api)
app.get('/', (req, res) => {
  res.status(200).send("Careerak Serverless Engine is LIVE.");
});

module.exports = app;
