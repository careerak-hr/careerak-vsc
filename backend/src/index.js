require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/database');
const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/userRoutes');
const jobPostingRoutes = require('./routes/jobPostingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ✅ تحسين التعامل مع المجلدات في بيئة Vercel
const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel ? '/tmp' : path.join(__dirname, '../uploads');

if (!isVercel && !fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(uploadsDir));

// ✅ محاولة الاتصال بقاعدة البيانات بدون تعطيل السيرفر
connectDB().catch(err => console.error("Initial DB Connection Error:", err));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'حماية كاريرك: تم اكتشاف نشاط مكثف'
});

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'Operational',
    database: 'Checking...',
    environment: isVercel ? 'Production (Vercel)' : 'Development'
  });
});

app.get('/', (req, res) => {
  res.status(200).send('<h1>Careerak API is Live!</h1><p>The server is running perfectly on Vercel.</p>');
});

const PORT = process.env.PORT || 5000;

if (!isVercel) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
