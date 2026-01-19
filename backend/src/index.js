require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 1. CORS مفتوح لضمان وصول الموبايل والويب
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 2. Middleware للاتصال الذكي بقاعدة البيانات
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Critical DB Connection Error:", err.message);
    res.status(500).json({ error: "Database unavailable", details: err.message });
  }
});

// 3. المسارات
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ready', cloud: 'vercel' });
});

// ⚠️ أهم نقطة: تصدير التطبيق بدون app.listen للإنتاج
module.exports = app;

// 4. تشغيل محلي فقط للمطور
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Local Server running on port ${PORT}`);
  });
}
