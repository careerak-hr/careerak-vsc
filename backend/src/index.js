require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Middleware ذكي للتأكد من الاتصال قبل أي مسار
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database Connection Failed", details: err.message });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'alive', mode: 'serverless' });
});

app.get('/', (req, res) => {
  res.status(200).send('Careerak Master API is Online');
});

module.exports = app;
