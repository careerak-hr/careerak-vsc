const jwt = require('jsonwebtoken');
const OAuthAccount = require('../models/OAuthAccount');
const { User } = require('../models/User');

// Generate JWT token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'careerak_secret_key_2024';
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      email: user.email 
    }, 
    secret, 
    { expiresIn: '30d' }
  );
};

// Sanitize user data
const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.__v;
  delete userObj.otp;
  delete userObj.twoFactorSecret;
  delete userObj.emailVerificationToken;
  return userObj;
};

/**
 * OAuth Success Callback
 * Called after successful OAuth authentication
 */
exports.oauthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/auth/failure?error=authentication_failed');
    }
    
    // Generate JWT token
    const token = generateToken(req.user);
    const user = sanitizeUser(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth success error:', error);
    res.redirect('/auth/failure?error=token_generation_failed');
  }
};

/**
 * OAuth Failure Callback
 */
exports.oauthFailure = (req, res) => {
  const error = req.query.error || 'unknown_error';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/auth/error?error=${error}`);
};

/**
 * Get user's OAuth accounts
 * GET /auth/oauth/accounts
 */
exports.getOAuthAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const oauthAccounts = await OAuthAccount.find({ userId })
      .select('-accessToken -refreshToken')
      .sort({ connectedAt: -1 });
    
    res.status(200).json({
      success: true,
      accounts: oauthAccounts
    });
  } catch (error) {
    console.error('Get OAuth accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في جلب الحسابات المرتبطة'
    });
  }
};

/**
 * Unlink OAuth account
 * DELETE /auth/oauth/:provider
 */
exports.unlinkOAuthAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { provider } = req.params;
    
    // Validate provider
    if (!['google', 'facebook', 'linkedin'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'مزود الخدمة غير صحيح'
      });
    }
    
    // Check if user has a password (can't unlink if OAuth is the only login method)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'المستخدم غير موجود'
      });
    }
    
    // Check if user has other login methods
    const hasPassword = user.password && !user.phone.startsWith('+google_') && !user.phone.startsWith('+facebook_') && !user.phone.startsWith('+linkedin_');
    const otherOAuthAccounts = user.oauthAccounts.filter(acc => acc.provider !== provider);
    
    if (!hasPassword && otherOAuthAccounts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'لا يمكن فك الربط. يجب أن يكون لديك طريقة دخول أخرى (كلمة مرور أو حساب آخر)'
      });
    }
    
    // Remove OAuth account
    await OAuthAccount.findOneAndDelete({ userId, provider });
    
    // Remove from user's oauthAccounts array
    user.oauthAccounts = user.oauthAccounts.filter(acc => acc.provider !== provider);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `تم فك ربط حساب ${provider} بنجاح`
    });
  } catch (error) {
    console.error('Unlink OAuth account error:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في فك ربط الحساب'
    });
  }
};

/**
 * Link OAuth account to existing user
 * This is called when a logged-in user wants to connect an OAuth account
 */
exports.linkOAuthAccount = async (req, res) => {
  try {
    // This will be handled by the OAuth callback
    // The passport strategy will check if user is already logged in
    // and link the account instead of creating a new user
    res.status(200).json({
      success: true,
      message: 'OAuth linking initiated'
    });
  } catch (error) {
    console.error('Link OAuth account error:', error);
    res.status(500).json({
      success: false,
      error: 'فشل في ربط الحساب'
    });
  }
};

module.exports = exports;
