const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// إعدادات JWT
const JWT_SECRET = process.env.JWT_SECRET || 'careerak_secret_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'careerak_refresh_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 أيام
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'; // 30 يوم

/**
 * توليد Access Token
 * @param {Object} user - بيانات المستخدم
 * @returns {string} - JWT token
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user._id || user.id,
    role: user.role,
    email: user.email,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'careerak',
    audience: 'careerak-users'
  });
};

/**
 * توليد Refresh Token
 * @param {Object} user - بيانات المستخدم
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id || user.id,
    type: 'refresh',
    // إضافة jti (JWT ID) فريد لكل refresh token
    jti: crypto.randomBytes(16).toString('hex')
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'careerak',
    audience: 'careerak-users'
  });
};

/**
 * توليد كلا النوعين من Tokens
 * @param {Object} user - بيانات المستخدم
 * @returns {Object} - { accessToken, refreshToken, expiresIn }
 */
const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // حساب وقت انتهاء الصلاحية بالثواني
  const expiresIn = parseExpiry(JWT_EXPIRES_IN);

  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType: 'Bearer'
  };
};

/**
 * التحقق من صحة Access Token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded payload أو null
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'careerak',
      audience: 'careerak-users'
    });

    // التحقق من نوع Token
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

/**
 * التحقق من صحة Refresh Token
 * @param {string} token - Refresh token
 * @returns {Object} - Decoded payload أو null
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'careerak',
      audience: 'careerak-users'
    });

    // التحقق من نوع Token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw error;
    }
  }
};

/**
 * فك تشفير Token بدون التحقق (للحصول على معلومات منتهية الصلاحية)
 * @param {string} token - JWT token
 * @returns {Object} - Decoded payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * التحقق من انتهاء صلاحية Token
 * @param {string} token - JWT token
 * @returns {boolean} - true إذا انتهت الصلاحية
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * الحصول على وقت انتهاء الصلاحية المتبقي بالثواني
 * @param {string} token - JWT token
 * @returns {number} - الوقت المتبقي بالثواني (0 إذا انتهت الصلاحية)
 */
const getTokenRemainingTime = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - currentTime;
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * تحويل صيغة الوقت (مثل '7d', '24h') إلى ثواني
 * @param {string} expiry - صيغة الوقت
 * @returns {number} - الوقت بالثواني
 */
const parseExpiry = (expiry) => {
  const units = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800
  };

  const match = expiry.match(/^(\d+)([smhdw])$/);
  if (!match) return 604800; // افتراضي: 7 أيام

  const value = parseInt(match[1]);
  const unit = match[2];
  return value * units[unit];
};

/**
 * توليد Token للتحقق من البريد الإلكتروني
 * @param {string} userId - معرف المستخدم
 * @param {string} email - البريد الإلكتروني
 * @returns {string} - Verification token
 */
const generateEmailVerificationToken = (userId, email) => {
  const payload = {
    id: userId,
    email,
    type: 'email_verification',
    jti: crypto.randomBytes(16).toString('hex')
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h', // ينتهي بعد 24 ساعة
    issuer: 'careerak',
    audience: 'careerak-users'
  });
};

/**
 * التحقق من صحة Email Verification Token
 * @param {string} token - Verification token
 * @returns {Object} - Decoded payload
 */
const verifyEmailVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'careerak',
      audience: 'careerak-users'
    });

    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Verification link expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid verification token');
    } else {
      throw error;
    }
  }
};

/**
 * توليد Token لإعادة تعيين كلمة المرور
 * @param {string} userId - معرف المستخدم
 * @param {string} email - البريد الإلكتروني
 * @returns {string} - Password reset token
 */
const generatePasswordResetToken = (userId, email) => {
  const payload = {
    id: userId,
    email,
    type: 'password_reset',
    jti: crypto.randomBytes(16).toString('hex')
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h', // ينتهي بعد ساعة واحدة
    issuer: 'careerak',
    audience: 'careerak-users'
  });
};

/**
 * التحقق من صحة Password Reset Token
 * @param {string} token - Password reset token
 * @returns {Object} - Decoded payload
 */
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'careerak',
      audience: 'careerak-users'
    });

    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Reset link expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid reset token');
    } else {
      throw error;
    }
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenRemainingTime,
  generateEmailVerificationToken,
  verifyEmailVerificationToken,
  generatePasswordResetToken,
  verifyPasswordResetToken
};
