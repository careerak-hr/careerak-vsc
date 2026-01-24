const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// ✅ المسارات نظيفة ومباشرة (يتم استدعاؤها تحت /api/users)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/analyze-image', userController.analyzeImage);
router.post('/verify-otp', userController.verifyOTP);
router.post('/send-otp', userController.sendOTP);

// مسارات محمية
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/ai-recommendations', auth, userController.getAIRecommendations);
router.post('/parse-cv', auth, userController.parseCV);

module.exports = router;
