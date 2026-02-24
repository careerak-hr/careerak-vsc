/**
 * Google reCAPTCHA v3 Service
 * 
 * يوفر خدمات التحقق من reCAPTCHA لمنع البوتات
 * يتم تفعيله عند الاشتباه بنشاط غير طبيعي
 */

const axios = require('axios');
const logger = require('../utils/logger');

class RecaptchaService {
  constructor() {
    this.secretKey = process.env.RECAPTCHA_SECRET_KEY;
    this.enabled = process.env.RECAPTCHA_ENABLED === 'true';
    this.verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    this.minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');
  }

  /**
   * التحقق من token reCAPTCHA
   * @param {string} token - Token من Frontend
   * @param {string} remoteIp - IP address للمستخدم (اختياري)
   * @returns {Promise<Object>} نتيجة التحقق
   */
  async verifyToken(token, remoteIp = null) {
    // إذا كان CAPTCHA معطل، نرجع نجاح
    if (!this.enabled) {
      return {
        success: true,
        score: 1.0,
        action: 'disabled',
        message: 'reCAPTCHA is disabled'
      };
    }

    // التحقق من وجود token
    if (!token) {
      return {
        success: false,
        score: 0,
        action: 'missing_token',
        message: 'reCAPTCHA token is missing'
      };
    }

    // التحقق من وجود secret key
    if (!this.secretKey) {
      logger.error('RECAPTCHA_SECRET_KEY is not configured');
      return {
        success: false,
        score: 0,
        action: 'config_error',
        message: 'reCAPTCHA is not configured properly'
      };
    }

    try {
      // إرسال طلب التحقق إلى Google
      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token
      });

      if (remoteIp) {
        params.append('remoteip', remoteIp);
      }

      const response = await axios.post(this.verifyUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000 // 5 seconds timeout
      });

      const data = response.data;

      // التحقق من النجاح
      if (!data.success) {
        logger.warn('reCAPTCHA verification failed', {
          errorCodes: data['error-codes'],
          action: data.action
        });

        return {
          success: false,
          score: 0,
          action: data.action || 'unknown',
          errorCodes: data['error-codes'],
          message: this.getErrorMessage(data['error-codes'])
        };
      }

      // التحقق من Score (v3 only)
      const score = data.score || 0;
      const action = data.action || 'unknown';

      // التحقق من أن Score أعلى من الحد الأدنى
      if (score < this.minScore) {
        logger.warn('reCAPTCHA score too low', {
          score,
          minScore: this.minScore,
          action
        });

        return {
          success: false,
          score,
          action,
          message: `Score too low: ${score} < ${this.minScore}`
        };
      }

      // نجاح
      logger.info('reCAPTCHA verification successful', {
        score,
        action
      });

      return {
        success: true,
        score,
        action,
        message: 'Verification successful'
      };

    } catch (error) {
      logger.error('reCAPTCHA verification error', {
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        score: 0,
        action: 'error',
        message: 'Verification failed due to server error'
      };
    }
  }

  /**
   * الحصول على رسالة خطأ واضحة
   * @param {Array} errorCodes - أكواد الأخطاء من Google
   * @returns {string} رسالة الخطأ
   */
  getErrorMessage(errorCodes) {
    if (!errorCodes || errorCodes.length === 0) {
      return 'Unknown error';
    }

    const messages = {
      'missing-input-secret': 'The secret parameter is missing',
      'invalid-input-secret': 'The secret parameter is invalid or malformed',
      'missing-input-response': 'The response parameter is missing',
      'invalid-input-response': 'The response parameter is invalid or malformed',
      'bad-request': 'The request is invalid or malformed',
      'timeout-or-duplicate': 'The response is no longer valid: either is too old or has been used previously'
    };

    return errorCodes.map(code => messages[code] || code).join(', ');
  }

  /**
   * التحقق من حاجة المستخدم لـ CAPTCHA
   * بناءً على نشاطه السابق
   * @param {string} userId - معرف المستخدم
   * @param {string} action - نوع العملية (register, login, etc.)
   * @returns {Promise<boolean>} هل يحتاج CAPTCHA؟
   */
  async shouldRequireCaptcha(userId, action) {
    // إذا كان CAPTCHA معطل، لا نحتاجه
    if (!this.enabled) {
      return false;
    }

    // TODO: تنفيذ منطق ذكي للكشف عن النشاط المشبوه
    // مثلاً:
    // - عدد المحاولات الفاشلة
    // - سرعة الطلبات
    // - IP reputation
    // - User agent analysis
    
    // حالياً، نطلب CAPTCHA دائماً إذا كان مفعل
    return true;
  }

  /**
   * تسجيل محاولة CAPTCHA
   * @param {string} userId - معرف المستخدم
   * @param {string} action - نوع العملية
   * @param {boolean} success - هل نجحت؟
   * @param {number} score - النتيجة
   */
  async logAttempt(userId, action, success, score) {
    // TODO: حفظ في قاعدة البيانات للتحليل
    logger.info('reCAPTCHA attempt logged', {
      userId,
      action,
      success,
      score,
      timestamp: new Date()
    });
  }
}

module.exports = new RecaptchaService();
