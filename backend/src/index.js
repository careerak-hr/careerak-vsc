require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ الحل الجذري واليدوي لمشكلة CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // الرد الفوري على طلبات الفحص (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// إعدادات إضافية لزيادة حجم البيانات المسموح بها (للصور)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

// الاتصال بقاعدة البيانات
connectDB().catch(err => console.error("DB Error:", err));

// المسارات
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ready', cloud: 'Vercel' });
});

app.get('/', (req, res) => {
  res.status(200).send('Careerak Server is running and open for all connections.');
});

// هذا السطر يضمن عمل السيرفر في بيئة Vercel
module.exports = app;

// تشغيل محلي فقط
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Locally running on port ${PORT}`);
  });
}
