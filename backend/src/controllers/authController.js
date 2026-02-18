const { calculatePasswordStrength, meetsAllRequirements, generateStrongPassword } = require('../services/passwordService');
const { verifyRefreshToken, generateAccessToken } = require('../services/jwtService');
const validator = require('validator');
const mailcheck = require('mailcheck');
const { User } = require('../models/User');

/**
 * التحقق من صحة البريد الإلكتروني
 * POST /auth/check-email
 */
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // التحقق من وجود البريد
    if (!email) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'البريد الإلكتروني مطلوب',
        errorEn: 'Email is required'
      });
    }

    // 1. التحقق من صحة الصيغة
    if (!validator.isEmail(email)) {
      return res.status(200).json({
        success: true,
        valid: false,
        error: 'البريد الإلكتروني غير صحيح',
        errorEn: 'Invalid email format'
      });
    }

    // 2. التحقق من الأخطاء الشائعة باستخدام mailcheck
    const suggestion = mailcheck.run({
      email: email,
      domains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'msn.com'],
      topLevelDomains: ['com', 'net', 'org', 'edu', 'gov', 'co.uk', 'fr', 'de']
    });

    if (suggestion) {
      return res.status(200).json({
        success: true,
        valid: false,
        error: 'هل تقصد',
        errorEn: 'Did you mean',
        suggestion: suggestion.full
      });
    }

    // 3. التحقق من وجود البريد في قاعدة البيانات
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(200).json({
        success: true,
        valid: false,
        error: 'هذا البريد مستخدم بالفعل',
        errorEn: 'This email is already in use',
        action: 'login'
      });
    }

    // البريد صحيح ومتاح
    return res.status(200).json({
      success: true,
      valid: true,
      message: 'البريد الإلكتروني متاح',
      messageEn: 'Email is available'
    });

  } catch (error) {
    console.error('خطأ في التحقق من البريد الإلكتروني:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      error: 'حدث خطأ أثناء التحقق من البريد الإلكتروني',
      errorEn: 'Error checking email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * التحقق من قوة كلمة المرور
 * POST /auth/validate-password
 */
exports.validatePassword = async (req, res) => {
  try {
    const { password } = req.body;

    // التحقق من وجود كلمة المرور
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور مطلوبة',
        messageEn: 'Password is required'
      });
    }

    // حساب قوة كلمة المرور
    const strength = calculatePasswordStrength(password);

    // التحقق من استيفاء جميع المتطلبات
    const meetsRequirements = meetsAllRequirements(password);

    return res.status(200).json({
      success: true,
      data: {
        ...strength,
        meetsRequirements,
        isAcceptable: strength.score >= 2 && meetsRequirements // قوة متوسطة على الأقل + جميع المتطلبات
      }
    });
  } catch (error) {
    console.error('خطأ في التحقق من كلمة المرور:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من كلمة المرور',
      messageEn: 'Error validating password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * توليد كلمة مرور قوية
 * POST /auth/generate-password
 */
exports.generatePassword = async (req, res) => {
  try {
    const { length } = req.body;

    // توليد كلمة مرور قوية
    const password = generateStrongPassword(length || 14);

    // حساب قوة كلمة المرور المولدة
    const strength = calculatePasswordStrength(password);

    return res.status(200).json({
      success: true,
      data: {
        password,
        strength: {
          score: strength.score,
          label: strength.label,
          labelAr: strength.labelAr,
          color: strength.color,
          percentage: strength.percentage
        }
      }
    });
  } catch (error) {
    console.error('خطأ في توليد كلمة المرور:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء توليد كلمة المرور',
      messageEn: 'Error generating password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * تجديد Access Token باستخدام Refresh Token
 * POST /auth/refresh-token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // التحقق من وجود Refresh Token
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token مطلوب',
        messageEn: 'Refresh token is required'
      });
    }

    // التحقق من صحة Refresh Token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token غير صالح أو منتهي الصلاحية',
        messageEn: 'Invalid or expired refresh token',
        error: error.message
      });
    }

    // البحث عن المستخدم
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
        messageEn: 'User not found'
      });
    }

    // توليد Access Token جديد
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message: 'تم تجديد Token بنجاح',
      messageEn: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        tokenType: 'Bearer'
      }
    });

  } catch (error) {
    console.error('خطأ في تجديد Token:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تجديد Token',
      messageEn: 'Error refreshing token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * إرسال بريد تأكيد البريد الإلكتروني
 * POST /auth/send-verification-email
 */
exports.sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // التحقق من وجود البريد
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب',
        messageEn: 'Email is required'
      });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
        messageEn: 'User not found'
      });
    }

    // التحقق من أن البريد غير مؤكد بالفعل
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مؤكد بالفعل',
        messageEn: 'Email already verified'
      });
    }

    // توليد token للتحقق
    const { generateEmailVerificationToken } = require('../services/jwtService');
    const token = generateEmailVerificationToken(user._id, user.email);

    // حفظ token في قاعدة البيانات
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ساعة
    await user.save();

    // إرسال البريد الإلكتروني
    const { sendVerificationEmail } = require('../services/emailService');
    await sendVerificationEmail(user, token);

    return res.status(200).json({
      success: true,
      message: 'تم إرسال بريد التأكيد بنجاح',
      messageEn: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('خطأ في إرسال بريد التأكيد:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إرسال بريد التأكيد',
      messageEn: 'Error sending verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * تأكيد البريد الإلكتروني
 * POST /auth/verify-email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // التحقق من وجود token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token مطلوب',
        messageEn: 'Token is required'
      });
    }

    // التحقق من صحة token
    const { verifyEmailVerificationToken } = require('../services/jwtService');
    let decoded;
    try {
      decoded = verifyEmailVerificationToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'رابط التأكيد غير صالح أو منتهي الصلاحية',
        messageEn: 'Invalid or expired verification link',
        error: error.message
      });
    }

    // البحث عن المستخدم
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
        messageEn: 'User not found'
      });
    }

    // التحقق من أن البريد غير مؤكد بالفعل
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مؤكد بالفعل',
        messageEn: 'Email already verified'
      });
    }

    // التحقق من أن token يطابق المحفوظ
    if (user.emailVerificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Token غير صالح',
        messageEn: 'Invalid token'
      });
    }

    // التحقق من انتهاء الصلاحية
    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'رابط التأكيد منتهي الصلاحية',
        messageEn: 'Verification link expired'
      });
    }

    // تأكيد البريد
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح',
      messageEn: 'Email verified successfully'
    });

  } catch (error) {
    console.error('خطأ في تأكيد البريد الإلكتروني:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تأكيد البريد الإلكتروني',
      messageEn: 'Error verifying email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * طلب إعادة تعيين كلمة المرور (نسيت كلمة المرور)
 * POST /auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // التحقق من وجود البريد
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مطلوب',
        messageEn: 'Email is required'
      });
    }

    // البحث عن المستخدم
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // لأسباب أمنية، نرجع نفس الرسالة حتى لو لم يكن المستخدم موجوداً
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة التعيين',
        messageEn: 'If the email exists, a reset link will be sent'
      });
    }

    // توليد token لإعادة التعيين
    const { generatePasswordResetToken } = require('../services/jwtService');
    const token = generatePasswordResetToken(user._id, user.email);

    // حفظ token في قاعدة البيانات
    const PasswordReset = require('../models/PasswordReset');
    await PasswordReset.create({
      userId: user._id,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // ساعة واحدة
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // إرسال البريد الإلكتروني
    const { sendPasswordResetEmail } = require('../services/emailService');
    await sendPasswordResetEmail(user, token);

    return res.status(200).json({
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
      messageEn: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('خطأ في طلب إعادة تعيين كلمة المرور:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء معالجة الطلب',
      messageEn: 'Error processing request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * إعادة تعيين كلمة المرور
 * POST /auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة',
        messageEn: 'All fields are required'
      });
    }

    // التحقق من تطابق كلمات المرور
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمات المرور غير متطابقة',
        messageEn: 'Passwords do not match'
      });
    }

    // التحقق من قوة كلمة المرور
    if (!meetsAllRequirements(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور لا تستوفي جميع المتطلبات',
        messageEn: 'Password does not meet all requirements'
      });
    }

    // التحقق من صحة token
    const { verifyPasswordResetToken } = require('../services/jwtService');
    let decoded;
    try {
      decoded = verifyPasswordResetToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية',
        messageEn: 'Invalid or expired reset link',
        error: error.message
      });
    }

    // البحث عن سجل إعادة التعيين
    const PasswordReset = require('../models/PasswordReset');
    const resetRecord = await PasswordReset.findOne({ token, used: false });
    
    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'رابط إعادة التعيين غير صالح أو تم استخدامه بالفعل',
        messageEn: 'Invalid or already used reset link'
      });
    }

    // التحقق من صلاحية السجل
    if (!resetRecord.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'رابط إعادة التعيين منتهي الصلاحية',
        messageEn: 'Reset link expired'
      });
    }

    // البحث عن المستخدم
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود',
        messageEn: 'User not found'
      });
    }

    // تحديث كلمة المرور
    user.password = newPassword;
    
    // تحديث قوة كلمة المرور
    const strength = calculatePasswordStrength(newPassword);
    user.passwordStrength = {
      score: strength.score,
      label: strength.label
    };
    
    await user.save();

    // تحديد token كمستخدم
    await resetRecord.markAsUsed();

    // إرسال بريد تأكيد التغيير
    const { sendPasswordChangedEmail } = require('../services/emailService');
    await sendPasswordChangedEmail(user);

    return res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
      messageEn: 'Password changed successfully'
    });

  } catch (error) {
    console.error('خطأ في إعادة تعيين كلمة المرور:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور',
      messageEn: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
