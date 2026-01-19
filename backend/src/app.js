const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// استيراد المسارات
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// إعدادات الأمان والاتصال
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ الميدل وير الذكي للاتصال بـ MongoDB
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB Middleware Error:", err.message);
    next();
  }
});

// ✅ تفعيل المسارات الحقيقية
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// مسار الفحص السريع
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Operational',
    server: 'Vercel Serverless',
    database: require('mongoose').connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/', (req, res) => {
  res.status(200).send("Careerak Serverless Engine is LIVE.");
});

module.exports = app;
