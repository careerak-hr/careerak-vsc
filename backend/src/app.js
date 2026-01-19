const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// مسار تجريبي بسيط جداً
app.get('/test', (req, res) => {
  res.status(200).json({
    message: "Success! Careerak API is working on Vercel",
    timestamp: new Date()
  });
});

// المسار الرئيسي
app.get('/', (req, res) => {
  res.status(200).send("Careerak Serverless Engine is LIVE.");
});

module.exports = app;
