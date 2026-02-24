/**
 * Security Score Controller
 * معالج طلبات Security Score
 */

const { calculateSecurityScore, getSecurityTips } = require('../services/securityScoreService');
const { User } = require('../models/User');

/**
 * GET /api/security-score
 * الحصول على Security Score للمستخدم الحالي
 */
exports.getSecurityScore = async (req, res) => {
  try {
    const userId = req.user._id;

    // جلب المستخدم من قاعدة البيانات
    const user = await User.findById(userId).select(
      'passwordStrength emailVerified twoFactorEnabled oauthAccounts phone country city profileImage'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // حساب Security Score
    const securityScore = calculateSecurityScore(user);

    // الحصول على النصائح
    const tips = getSecurityTips(securityScore);

    res.status(200).json({
      success: true,
      data: {
        ...securityScore,
        tips
      }
    });
  } catch (error) {
    console.error('Error getting security score:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حساب Security Score',
      error: error.message
    });
  }
};

/**
 * GET /api/security-score/recommendations
 * الحصول على التوصيات فقط
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      'passwordStrength emailVerified twoFactorEnabled oauthAccounts phone country city profileImage'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const securityScore = calculateSecurityScore(user);

    res.status(200).json({
      success: true,
      data: {
        recommendations: securityScore.recommendations,
        score: securityScore.score,
        level: securityScore.level
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التوصيات',
      error: error.message
    });
  }
};
