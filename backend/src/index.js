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
  res.status(200).json({ status: 'Operational' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('--------------------------------------------------');
  console.log(`🚀 CAREERAK MASTER SERVER: RUNNING`);
  
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`👉 API URL: http://${iface.address}:${PORT}/api`);
      }
    }
  }
  console.log('--------------------------------------------------');
});
