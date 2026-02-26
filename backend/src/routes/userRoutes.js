const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { validateRegister, validateUpdateProfile, validateLogin } = require('../middleware/validation');

// ✅ المسارات مع التحقق من البيانات
router.post('/register', validateRegister, userController.register);
router.post('/login', validateLogin, userController.login);
router.post('/analyze-image', userController.analyzeImage);
router.post('/verify-otp', userController.verifyOTP);
router.post('/send-otp', userController.sendOTP);

// مسارات محمية
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, validateUpdateProfile, userController.updateProfile);
router.get('/ai-recommendations', auth, userController.getAIRecommendations);
router.post('/parse-cv', auth, userController.parseCV);

// User preferences endpoints
router.get('/preferences', auth, userController.getUserPreferences);
router.put('/preferences', auth, userController.updateUserPreferences);

// Real-time recommendation update endpoints
router.get('/recommendation-update-status', auth, userController.getRecommendationUpdateStatus);
router.get('/recommendation-processing-stats', auth, userController.getRecommendationProcessingStats);

module.exports = router;
