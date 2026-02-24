/**
 * reCAPTCHA Service Tests
 * 
 * اختبارات أساسية لخدمة reCAPTCHA
 */

const recaptchaService = require('../src/services/recaptchaService');

describe('RecaptchaService', () => {
  describe('verifyToken', () => {
    it('should return success when CAPTCHA is disabled', async () => {
      // حفظ القيمة الأصلية
      const originalEnabled = recaptchaService.enabled;
      
      // تعطيل CAPTCHA
      recaptchaService.enabled = false;
      
      const result = await recaptchaService.verifyToken('fake_token');
      
      expect(result.success).toBe(true);
      expect(result.score).toBe(1.0);
      expect(result.action).toBe('disabled');
      
      // استعادة القيمة الأصلية
      recaptchaService.enabled = originalEnabled;
    });

    it('should return error when token is missing', async () => {
      // حفظ القيمة الأصلية
      const originalEnabled = recaptchaService.enabled;
      
      // تفعيل CAPTCHA
      recaptchaService.enabled = true;
      
      const result = await recaptchaService.verifyToken(null);
      
      expect(result.success).toBe(false);
      expect(result.score).toBe(0);
      expect(result.action).toBe('missing_token');
      
      // استعادة القيمة الأصلية
      recaptchaService.enabled = originalEnabled;
    });

    it('should return error when secret key is missing', async () => {
      // حفظ القيم الأصلية
      const originalEnabled = recaptchaService.enabled;
      const originalSecretKey = recaptchaService.secretKey;
      
      // تفعيل CAPTCHA وحذف secret key
      recaptchaService.enabled = true;
      recaptchaService.secretKey = null;
      
      const result = await recaptchaService.verifyToken('fake_token');
      
      expect(result.success).toBe(false);
      expect(result.score).toBe(0);
      expect(result.action).toBe('config_error');
      
      // استعادة القيم الأصلية
      recaptchaService.enabled = originalEnabled;
      recaptchaService.secretKey = originalSecretKey;
    });
  });

  describe('getErrorMessage', () => {
    it('should return correct error message for known error codes', () => {
      const message = recaptchaService.getErrorMessage(['missing-input-secret']);
      expect(message).toContain('secret parameter is missing');
    });

    it('should return error code for unknown errors', () => {
      const message = recaptchaService.getErrorMessage(['unknown-error']);
      expect(message).toBe('unknown-error');
    });

    it('should return "Unknown error" for empty array', () => {
      const message = recaptchaService.getErrorMessage([]);
      expect(message).toBe('Unknown error');
    });
  });

  describe('shouldRequireCaptcha', () => {
    it('should return false when CAPTCHA is disabled', async () => {
      // حفظ القيمة الأصلية
      const originalEnabled = recaptchaService.enabled;
      
      // تعطيل CAPTCHA
      recaptchaService.enabled = false;
      
      const result = await recaptchaService.shouldRequireCaptcha('user123', 'register');
      
      expect(result).toBe(false);
      
      // استعادة القيمة الأصلية
      recaptchaService.enabled = originalEnabled;
    });

    it('should return true when CAPTCHA is enabled', async () => {
      // حفظ القيمة الأصلية
      const originalEnabled = recaptchaService.enabled;
      
      // تفعيل CAPTCHA
      recaptchaService.enabled = true;
      
      const result = await recaptchaService.shouldRequireCaptcha('user123', 'register');
      
      expect(result).toBe(true);
      
      // استعادة القيمة الأصلية
      recaptchaService.enabled = originalEnabled;
    });
  });
});
