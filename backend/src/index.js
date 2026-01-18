require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ أبسط وأقوى إعداد لـ CORS لضمان عمل المتصفح والهاتف
app.use(cors());

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

connectDB().catch(err => console.error("DB Connection Error:", err));

// ✅ المسارات الأساسية
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'Vercel Ready' });
});

app.get('/', (req, res) => {
  res.status(200).send('Careerak API is Running');
});

const isVercel = process.env.VERCEL === '1';
if (!isVercel) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

module.exports = app;
