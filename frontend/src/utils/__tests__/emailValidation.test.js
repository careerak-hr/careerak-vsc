/**
 * Email Validation Tests
 * 
 * اختبارات للتحقق من صحة دوال التحقق من البريد الإلكتروني
 * Requirements: 4.1 - التحقق من صحة البريد (regex validation)
 */

import {
  isValidEmail,
  validateEmailWithMessage,
  extractDomain,
  isEmailFromDomain,
  isCommonEmailDomain,
  normalizeEmail,
  COMMON_EMAIL_DOMAINS,
  EMAIL_REGEX
} from '../emailValidation';

describe('Email Validation', () => {
  describe('isValidEmail', () => {
    test('يجب أن يقبل بريد إلكتروني صحيح', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('user_name@example-domain.com')).toBe(true);
    });

    test('يجب أن يرفض بريد إلكتروني بدون @', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
      expect(isValidEmail('user.example.com')).toBe(false);
    });

    test('يجب أن يرفض بريد إلكتروني بدون نطاق', () => {
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });

    test('يجب أن يرفض بريد إلكتروني بدون اسم مستخدم', () => {
      expect(isValidEmail('@example.com')).toBe(false);
    });

    test('يجب أن يرفض بريد إلكتروني فارغ', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });

    test('يجب أن يرفض بريد إلكتروني طويل جداً', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });

    test('يجب أن يرفض بريد إلكتروني مع @ متعددة', () => {
      expect(isValidEmail('user@@example.com')).toBe(false);
      expect(isValidEmail('user@domain@example.com')).toBe(false);
    });

    test('يجب أن يرفض بريد إلكتروني مع رموز غير مسموحة', () => {
      expect(isValidEmail('user name@example.com')).toBe(false);
      expect(isValidEmail('user#name@example.com')).toBe(false);
    });

    test('يجب أن يقبل بريد إلكتروني مع مسافات في البداية والنهاية', () => {
      expect(isValidEmail('  user@example.com  ')).toBe(true);
    });
  });

  describe('validateEmailWithMessage', () => {
    test('يجب أن يرجع valid: true لبريد صحيح', () => {
      const result = validateEmailWithMessage('user@example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('يجب أن يرجع رسالة خطأ لبريد فارغ', () => {
      const result = validateEmailWithMessage('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('يرجى إدخال البريد الإلكتروني');
    });

    test('يجب أن يرجع رسالة خطأ لبريد بدون @', () => {
      const result = validateEmailWithMessage('userexample.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('البريد الإلكتروني يجب أن يحتوي على @');
    });

    test('يجب أن يرجع رسالة خطأ لبريد مع @ متعددة', () => {
      const result = validateEmailWithMessage('user@@example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('البريد الإلكتروني يجب أن يحتوي على @ واحدة فقط');
    });

    test('يجب أن يرجع رسالة خطأ لبريد بدون اسم مستخدم', () => {
      const result = validateEmailWithMessage('@example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('البريد الإلكتروني يجب أن يحتوي على اسم مستخدم قبل @');
    });

    test('يجب أن يرجع رسالة خطأ لبريد بدون نطاق', () => {
      const result = validateEmailWithMessage('user@');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('البريد الإلكتروني يجب أن يحتوي على نطاق بعد @');
    });

    test('يجب أن يرجع رسالة خطأ لبريد بدون نقطة في النطاق', () => {
      const result = validateEmailWithMessage('user@domain');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('النطاق يجب أن يحتوي على نقطة (.)');
    });

    test('يجب أن يرجع رسالة خطأ لبريد مع امتداد نطاق قصير', () => {
      const result = validateEmailWithMessage('user@domain.c');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('امتداد النطاق يجب أن يكون حرفين على الأقل');
    });

    test('يجب أن يرجع رسالة خطأ لبريد طويل جداً', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmailWithMessage(longEmail);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('البريد الإلكتروني طويل جداً (الحد الأقصى 254 حرف)');
    });

    test('يجب أن يرجع رسالة خطأ لاسم مستخدم طويل جداً', () => {
      const longEmail = 'a'.repeat(65) + '@example.com';
      const result = validateEmailWithMessage(longEmail);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('اسم المستخدم طويل جداً (الحد الأقصى 64 حرف)');
    });
  });

  describe('extractDomain', () => {
    test('يجب أن يستخرج النطاق من بريد صحيح', () => {
      expect(extractDomain('user@example.com')).toBe('example.com');
      expect(extractDomain('test@gmail.com')).toBe('gmail.com');
      expect(extractDomain('admin@company.co.uk')).toBe('company.co.uk');
    });

    test('يجب أن يرجع null لبريد غير صحيح', () => {
      expect(extractDomain('invalid')).toBeNull();
      expect(extractDomain('user@')).toBeNull();
      expect(extractDomain('@example.com')).toBeNull();
    });
  });

  describe('isEmailFromDomain', () => {
    test('يجب أن يتحقق من النطاق بشكل صحيح', () => {
      expect(isEmailFromDomain('user@gmail.com', 'gmail.com')).toBe(true);
      expect(isEmailFromDomain('user@yahoo.com', 'gmail.com')).toBe(false);
    });

    test('يجب أن يكون غير حساس لحالة الأحرف', () => {
      expect(isEmailFromDomain('user@Gmail.COM', 'gmail.com')).toBe(true);
      expect(isEmailFromDomain('user@gmail.com', 'GMAIL.COM')).toBe(true);
    });

    test('يجب أن يرجع false لبريد غير صحيح', () => {
      expect(isEmailFromDomain('invalid', 'gmail.com')).toBe(false);
    });
  });

  describe('isCommonEmailDomain', () => {
    test('يجب أن يتعرف على النطاقات الشائعة', () => {
      expect(isCommonEmailDomain('user@gmail.com')).toBe(true);
      expect(isCommonEmailDomain('user@yahoo.com')).toBe(true);
      expect(isCommonEmailDomain('user@hotmail.com')).toBe(true);
      expect(isCommonEmailDomain('user@outlook.com')).toBe(true);
    });

    test('يجب أن يرجع false للنطاقات غير الشائعة', () => {
      expect(isCommonEmailDomain('user@mycompany.com')).toBe(false);
      expect(isCommonEmailDomain('user@custom-domain.org')).toBe(false);
    });

    test('يجب أن يكون غير حساس لحالة الأحرف', () => {
      expect(isCommonEmailDomain('user@GMAIL.COM')).toBe(true);
    });
  });

  describe('normalizeEmail', () => {
    test('يجب أن ينظف البريد الإلكتروني', () => {
      expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com');
      expect(normalizeEmail('TEST@GMAIL.COM')).toBe('test@gmail.com');
    });

    test('يجب أن يرجع سلسلة فارغة لقيم غير صحيحة', () => {
      expect(normalizeEmail('')).toBe('');
      expect(normalizeEmail(null)).toBe('');
      expect(normalizeEmail(undefined)).toBe('');
    });
  });

  describe('EMAIL_REGEX', () => {
    test('يجب أن يكون regex صحيح', () => {
      expect(EMAIL_REGEX).toBeInstanceOf(RegExp);
      expect(EMAIL_REGEX.test('user@example.com')).toBe(true);
      expect(EMAIL_REGEX.test('invalid')).toBe(false);
    });
  });

  describe('COMMON_EMAIL_DOMAINS', () => {
    test('يجب أن يحتوي على نطاقات شائعة', () => {
      expect(COMMON_EMAIL_DOMAINS).toContain('gmail.com');
      expect(COMMON_EMAIL_DOMAINS).toContain('yahoo.com');
      expect(COMMON_EMAIL_DOMAINS).toContain('hotmail.com');
      expect(COMMON_EMAIL_DOMAINS).toContain('outlook.com');
    });

    test('يجب أن يكون array', () => {
      expect(Array.isArray(COMMON_EMAIL_DOMAINS)).toBe(true);
      expect(COMMON_EMAIL_DOMAINS.length).toBeGreaterThan(0);
    });
  });
});
