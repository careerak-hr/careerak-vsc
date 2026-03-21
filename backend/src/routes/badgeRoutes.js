const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Badge Routes
 * All routes require authentication
 */

// Public routes (no auth required)
router.get('/', badgeController.getAllBadges);
router.get('/user/:userId', badgeController.getUserBadges);

// Protected routes (auth required)
router.use(protect);

router.get('/progress', badgeController.getBadgeProgress);
router.post('/check', badgeController.checkAndAwardBadges);
router.patch('/:userBadgeId/display', badgeController.toggleBadgeDisplay);
router.get('/stats', badgeController.getBadgeStats);
router.get('/leaderboard', badgeController.getLeaderboard);

// Admin routes
router.post('/initialize', authorize('admin'), badgeController.initializeBadges);
router.post('/run-checker', authorize('admin'), badgeController.runBadgeChecker);

module.exports = router;
