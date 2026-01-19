require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ إعدادات CORS المفتوحة للجميع
app.use(cors({ origin: '*' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ المسارات الأساسية
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'alive',
    mongodb: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.status(200).send('Careerak API is Ready for requests.');
});

// تصدير التطبيق لـ Vercel
module.exports = app;

// للتشغيل المحلي فقط
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const connectDB = require('./config/database');
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Locally running on port ${PORT}`);
  });
}
