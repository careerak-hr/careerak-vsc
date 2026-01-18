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

// ✅ تصحيح CORS: السماح للكل بدون تعارض مع Credentials
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

const isVercel = process.env.VERCEL === '1';
const uploadsDir = isVercel ? '/tmp' : path.join(__dirname, '../uploads');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static(uploadsDir));

connectDB().catch(err => console.error("DB Connection Error:", err));

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/users/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', serverTime: new Date() });
});

app.get('/', (req, res) => {
  res.status(200).send('<h1>Careerak API is LIVE</h1>');
});

const PORT = process.env.PORT || 5000;
if (!isVercel) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server on port ${PORT}`);
  });
}

module.exports = app;
