require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/database');
const os = require('os');
const path = require('path');
const fs = require('fs');

const userRoutes = require('./routes/userRoutes');
const jobPostingRoutes = require('./routes/jobPostingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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

connectDB();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'حماية كاريرك: تم اكتشاف نشاط مكثف'
});

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/users/health-check', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Operational', service: 'Careerak Backend' });
});

// رسالة ترحيبية عند الدخول للرابط الرئيسي للتأكد من عمل السيرفر
app.get('/', (req, res) => {
  res.status(200).send('<h1>Careerak API is Running Successfully!</h1><p>Use /api/health to check status.</p>');
});

const PORT = process.env.PORT || 5000;

// هذا الجزء يضمن عمل السيرفر محلياً وفي Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CAREERAK MASTER SERVER: RUNNING ON PORT ${PORT}`);
  });
}

module.exports = app;
