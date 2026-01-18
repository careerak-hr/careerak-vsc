require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ نترك معالجة CORS بالكامل لملف vercel.json لضمان عدم التضارب
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// محاولة الاتصال بقاعدة البيانات (بشكل غير معطل للسيرفر)
connectDB().then(() => {
  console.log("Database connected successfully");
}).catch(err => {
  console.error("Database connection failed:", err.message);
});

// المسارات الأساسية
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// اختبار الصحة (بدون قاعدة بيانات)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'alive', environment: 'production' });
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.status(200).send('Careerak Master Server is Running Successfully');
});

// تصدير التطبيق لـ Vercel
module.exports = app;

// للتشغيل المحلي
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Locally running on port ${PORT}`);
  });
}
