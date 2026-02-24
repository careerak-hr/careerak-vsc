const twoFactorService = require('../src/services/twoFactorService');

/**
 * اختبارات المصادقة الثنائية (2FA)
 */

describe('Two-Factor Authentication Service', () => {
  describe('generateSecret', () => {
    test('should generate a valid secret', () => {
      const email = 'test@example.com';
      const result = twoFactorService.generateSecret(email);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('otpauth_url');
      expect(result.secret).toBeTruthy();
      expect(result.otpauth_url).toContain('Careerak');
      expect(result.otpauth_url).toContain(encodeURIComponent(email));
    });

    test('should generate different secrets each time', () => {
      const email = 'test@example.com';
      const result1 = twoFactorService.generateSecret(email);
      const result2 = twoFactorService.generateSecret(email);

      expect(result1.secret).not.toBe(result2.secret);
    });
  });

  describe('generateQRCode', () => {
    test('should generate a valid QR code data URL', async () => {
      const email = 'test@example.com';
      const { otpauth_url } = twoFactorService.generateSecret(email);
      const qrCode = await twoFactorService.generateQRCode(otpauth_url);

      expect(qrCode).toBeTruthy();
      expect(qrCode).toContain('data:image/png;base64');
    });

    test('should generate QR code for any text', async () => {
      // qrcode library can generate QR for any text, not just valid URLs
      const qrCode = await twoFactorService.generateQRCode('any-text');
      expect(qrCode).toBeTruthy();
      expect(qrCode).toContain('data:image/png;base64');
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid token', () => {
      const speakeasy = require('speakeasy');
      const secret = speakeasy.generateSecret();
      const token = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32'
      });

      const isValid = twoFactorService.verifyToken(token, secret.base32);
      expect(isValid).toBe(true);
    });

    test('should reject an invalid token', () => {
      const speakeasy = require('speakeasy');
      const secret = speakeasy.generateSecret();
      const invalidToken = '000000';

      const isValid = twoFactorService.verifyToken(invalidToken, secret.base32);
      expect(isValid).toBe(false);
    });
  });

  describe('generateBackupCodes', () => {
    test('should generate 10 backup codes by default', () => {
      const codes = twoFactorService.generateBackupCodes();

      expect(codes).toHaveLength(10);
      codes.forEach(code => {
        expect(code).toHaveLength(8);
        expect(code).toMatch(/^[A-Z0-9]+$/);
      });
    });

    test('should generate specified number of codes', () => {
      const count = 5;
      const codes = twoFactorService.generateBackupCodes(count);

      expect(codes).toHaveLength(count);
    });

    test('should generate unique codes', () => {
      const codes = twoFactorService.generateBackupCodes(20);
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(codes.length);
    });
  });
});

describe('Two-Factor Authentication Integration', () => {
  test('complete 2FA flow', async () => {
    // 1. Generate secret
    const email = 'test@example.com';
    const { secret, otpauth_url } = twoFactorService.generateSecret(email);
    expect(secret).toBeTruthy();

    // 2. Generate QR code
    const qrCode = await twoFactorService.generateQRCode(otpauth_url);
    expect(qrCode).toContain('data:image/png;base64');

    // 3. Generate token
    const speakeasy = require('speakeasy');
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });

    // 4. Verify token
    const isValid = twoFactorService.verifyToken(token, secret);
    expect(isValid).toBe(true);

    // 5. Generate backup codes
    const backupCodes = twoFactorService.generateBackupCodes();
    expect(backupCodes).toHaveLength(10);
  });
});
