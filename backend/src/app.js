require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ إعدادات الأمان والاتصال الصافي
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Middleware ذكي للاتصال بـ MongoDB لمرة واحدة وإعادة استخدامه (Caching)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    res.status(500).json({ error: "Database unavailable", details: err.message });
  }
});

// ✅ المسارات الأساسية
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Operational', mode: 'Serverless' });
});

app.get('/', (req, res) => {
  res.status(200).send('<h1>Careerak Cloud API is Live</h1>');
});

// ✅ التصدير الوحيد والنهائي - لا وجود لـ app.listen هنا أبداً
module.exports = app;
