/**
 * reCAPTCHA Middleware
 * 
 * Middleware للتحقق من reCAPTCHA token
 * يستخدم في endpoints الحساسة مثل التسجيل وتسجيل الدخول
 */

const recaptchaService = require('../services/recaptchaService');
const logger = require('../utils/logger');

/**
 * Middleware للتحقق من reCAPTCHA
 * يتوقع token في body.recaptchaToken
 */
const verifyRecaptcha = async (req, res, next) => {
  try {
    // الحصول على token من body
    const token = req.body.recaptchaToken;
    
    // الحصول على IP address
    const remoteIp = req.ip || req.connection.remoteAddress;

    // التحقق من token
    const result = await recaptchaService.verifyToken(token, remoteIp);

    // إذا فشل التحقق
    if (!result.success) {
      logger.warn('reCAPTCHA verification failed', {
        ip: remoteIp,
        action: result.action,
        score: result.score,
        message: result.message
      });

      return res.status(400).json({
        success: false,
        message: 'التحقق من reCAPTCHA فشل. يرجى المحاولة مرة أخرى.',
        error: 'RECAPTCHA_VERIFICATION_FAILED',
        details: {
          score: result.score,
          action: result.action
        }
      });
    }

    // حفظ النتيجة في request للاستخدام لاحقاً
    req.recaptcha = {
      score: result.score,
      action: result.action
    };

    // تسجيل المحاولة
    const userId = req.user?._id || req.body.email || 'anonymous';
    await recaptchaService.logAttempt(
      userId,
      result.action,
      true,
      result.score
    );

    // المتابعة
    next();

  } catch (error) {
    logger.error('reCAPTCHA middleware error', {
      error: error.message,
      stack: error.stack
    });

    // في حالة خطأ، نسمح بالمتابعة (fail-open)
    // لتجنب منع المستخدمين الشرعيين
    next();
  }
};

/**
 * Middleware اختياري للتحقق من reCAPTCHA
 * يتحقق فقط إذا كان النشاط مشبوه
 */
const verifyRecaptchaConditional = async (req, res, next) => {
  try {
    // التحقق من حاجة المستخدم لـ CAPTCHA
    const userId = req.user?._id || req.body.email || 'anonymous';
    const action = req.body.action || 'unknown';
    
    const requiresCaptcha = await recaptchaService.shouldRequireCaptcha(userId, action);

    // إذا لم يحتاج CAPTCHA، نتابع
    if (!requiresCaptcha) {
      return next();
    }

    // إذا احتاج CAPTCHA، نستخدم middleware العادي
    return verifyRecaptcha(req, res, next);

  } catch (error) {
    logger.error('reCAPTCHA conditional middleware error', {
      error: error.message,
      stack: error.stack
    });

    // في حالة خطأ، نسمح بالمتابعة
    next();
  }
};

module.exports = {
  verifyRecaptcha,
  verifyRecaptchaConditional
};
