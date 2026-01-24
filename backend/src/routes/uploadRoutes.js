const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { uploadCV } = require('../controllers/uploadController');

// رفع سيرة ذاتية
router.post('/cv', upload.single('file'), uploadCV);

module.exports = router;
