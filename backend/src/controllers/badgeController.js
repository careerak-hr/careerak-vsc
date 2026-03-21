const badgeService = require('../services/badgeService');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

/**
 * Badge Controller
 * Handles badge-related HTTP requests
 */

/**
 * Get all badges
 * GET /api/badges
 */
exports.getAllBadges = async (req, res) => {
  try {
    const { category, rarity, lang = 'ar' } = req.query;
    
    const badges = await Badge.getActiveBadges({ category, rarity });
    
    const badgesWithDetails = badges.map(badge => badge.getDetails(lang));
    
    res.status(200).json({
      success: true,
      count: badgesWithDetails.length,
      data: badgesWithDetails
    });
  } catch (error) {
    console.error('Error getting all badges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges',
      error: error.message
    });
  }
};

/**
 * Get user's badges
 * GET /api/badges/user/:userId
 */
exports.getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lang = 'ar' } = req.query;
    
    const badges = await badgeService.getBadgesByUser(userId, lang);
    
    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges
    });
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user badges',
      error: error.message
    });
  }
};

/**
 * Get badge progress for user
 * GET /api/badges/progress
 */
exports.getBadgeProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { lang = 'ar' } = req.query;
    
    const progress = await badgeService.calculateProgress(userId);
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error getting badge progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badge progress',
      error: error.message
    });
  }
};

/**
 * Check and award badges to user
 * POST /api/badges/check
 */
exports.checkAndAwardBadges = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const newBadges = await badgeService.checkAndAwardBadges(userId);
    
    res.status(200).json({
      success: true,
      message: `Awarded ${newBadges.length} new badge(s)`,
      count: newBadges.length,
      data: newBadges.map(nb => ({
        badge: nb.badge.getDetails(req.query.lang || 'ar'),
        earnedAt: nb.userBadge.earnedAt
      }))
    });
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking badges',
      error: error.message
    });
  }
};

/**
 * Toggle badge display
 * PATCH /api/badges/:userBadgeId/display
 */
exports.toggleBadgeDisplay = async (req, res) => {
  try {
    const { userBadgeId } = req.params;
    const userId = req.user._id;
    
    const userBadge = await UserBadge.findOne({
      _id: userBadgeId,
      userId
    });
    
    if (!userBadge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }
    
    userBadge.toggleDisplay();
    await userBadge.save();
    
    res.status(200).json({
      success: true,
      message: 'Badge display toggled',
      data: {
        isDisplayed: userBadge.isDisplayed
      }
    });
  } catch (error) {
    console.error('Error toggling badge display:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling badge display',
      error: error.message
    });
  }
};

/**
 * Get badge statistics
 * GET /api/badges/stats
 */
exports.getBadgeStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [
      totalBadges,
      earnedBadges,
      categoryCount,
      totalPoints,
      rarityCount
    ] = await Promise.all([
      Badge.countDocuments({ isActive: true }),
      UserBadge.countDocuments({ userId }),
      UserBadge.countByCategory(userId),
      UserBadge.getTotalPoints(userId),
      Badge.countByRarity()
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalBadges,
        earnedBadges,
        remainingBadges: totalBadges - earnedBadges,
        completionPercentage: Math.round((earnedBadges / totalBadges) * 100),
        categoryCount,
        totalPoints,
        rarityCount
      }
    });
  } catch (error) {
    console.error('Error getting badge stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badge statistics',
      error: error.message
    });
  }
};

/**
 * Get leaderboard
 * GET /api/badges/leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await UserBadge.getLeaderboard(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

/**
 * Initialize badges (Admin only)
 * POST /api/badges/initialize
 */
exports.initializeBadges = async (req, res) => {
  try {
    await badgeService.initializeBadges();
    
    res.status(200).json({
      success: true,
      message: 'Badges initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing badges:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing badges',
      error: error.message
    });
  }
};

/**
 * Run badge checker manually (Admin only)
 * POST /api/badges/run-checker
 */
exports.runBadgeChecker = async (req, res) => {
  try {
    const { runManually } = require('../jobs/badgeCheckerCron');
    const result = await runManually();

    res.status(200).json({
      success: true,
      message: `Badge checker completed: ${result.totalAwarded} badge(s) awarded to ${result.totalProcessed} users`,
      data: result
    });
  } catch (error) {
    console.error('Error running badge checker:', error);
    res.status(500).json({
      success: false,
      message: 'Error running badge checker',
      error: error.message
    });
  }
};
