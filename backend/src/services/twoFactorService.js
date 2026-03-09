const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User } = require('../models/User');

/**
 * TwoFactorService - خدمة المصادقة الثنائية (2FA)
 * 
 * المسؤوليات:
 * - تفعيل/تعطيل 2FA
 * - إنشاء والتحقق من OTP
 * - إدارة أكواد الاحتياط
 */
class TwoFactorService {
  /**
   * تفعيل 2FA للمستخدم
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<{secret: string, qrCode: string, backupCodes: string[]}>}
   */
  async enable2FA(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (user.security?.twoFactorEnabled) {
      throw new Error('المصادقة الثنائية مفعلة بالفعل');
    }

    // إنشاء secret
    const secret = speakeasy.generateSecret({
      name: `Careerak (${user.email})`,
      issuer: 'Careerak',
      length: 32
    });

    // إنشاء QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // إنشاء 10 أكواد احتياطية
    const backupCodes = this._generateBackupCodes(10);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    // حفظ البيانات (لكن لا نفعّل 2FA بعد - ننتظر التحقق)
    user.security = user.security || {};
    user.security.twoFactorSecret = secret.base32;
    user.security.backupCodes = hashedBackupCodes;
    user.security.twoFactorEnabled = false; // سيتم التفعيل بعد التحقق
    user.security.twoFactorSetupPending = true;
    
    await user.save();

    return {
      secret: secret.base32,
      qrCode,
      backupCodes // نرجع الأكواد غير المشفرة للمستخدم (مرة واحدة فقط)
    };
  }

  /**
   * التحقق من إعداد 2FA وتفعيله
   * @param {string} userId - معرف المستخدم
   * @param {string} otp - رمز OTP من المستخدم
   * @returns {Promise<boolean>}
   */
  async verify2FASetup(userId, otp) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (!user.security?.twoFactorSetupPending) {
      throw new Error('لا يوجد إعداد 2FA معلق');
    }

    if (!user.security.twoFactorSecret) {
      throw new Error('لم يتم إنشاء secret بعد');
    }

    // التحقق من OTP
    const isValid = speakeasy.totp.verify({
      secret: user.security.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 2 // نسمح بـ ±2 فترات زمنية (60 ثانية)
    });

    if (!isValid) {
      throw new Error('رمز OTP غير صحيح');
    }

    // تفعيل 2FA
    user.security.twoFactorEnabled = true;
    user.security.twoFactorSetupPending = false;
    user.security.twoFactorEnabledAt = new Date();
    
    await user.save();

    return true;
  }

  /**
   * تعطيل 2FA
   * @param {string} userId - معرف المستخدم
   * @param {string} otp - رمز OTP للتحقق
   * @param {string} password - كلمة المرور للتحقق
   * @returns {Promise<boolean>}
   */
  async disable2FA(userId, otp, password) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (!user.security?.twoFactorEnabled) {
      throw new Error('المصادقة الثنائية غير مفعلة');
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('كلمة المرور غير صحيحة');
    }

    // التحقق من OTP
    const isOtpValid = await this.verifyOTP(userId, otp);
    if (!isOtpValid) {
      throw new Error('رمز OTP غير صحيح');
    }

    // تعطيل 2FA وحذف البيانات
    user.security.twoFactorEnabled = false;
    user.security.twoFactorSecret = undefined;
    user.security.backupCodes = undefined;
    user.security.twoFactorEnabledAt = undefined;
    user.security.twoFactorSetupPending = undefined;
    
    await user.save();

    return true;
  }

  /**
   * التحقق من OTP
   * @param {string} userId - معرف المستخدم
   * @param {string} otp - رمز OTP
   * @returns {Promise<boolean>}
   */
  async verifyOTP(userId, otp) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (!user.security?.twoFactorEnabled) {
      throw new Error('المصادقة الثنائية غير مفعلة');
    }

    if (!user.security.twoFactorSecret) {
      throw new Error('لا يوجد secret');
    }

    // التحقق من OTP
    const isValid = speakeasy.totp.verify({
      secret: user.security.twoFactorSecret,
      encoding: 'base32',
      token: otp,
      window: 2
    });

    return isValid;
  }

  /**
   * استخدام كود احتياطي
   * @param {string} userId - معرف المستخدم
   * @param {string} code - الكود الاحتياطي
   * @returns {Promise<boolean>}
   */
  async useBackupCode(userId, code) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (!user.security?.twoFactorEnabled) {
      throw new Error('المصادقة الثنائية غير مفعلة');
    }

    if (!user.security.backupCodes || user.security.backupCodes.length === 0) {
      throw new Error('لا توجد أكواد احتياطية متاحة');
    }

    // البحث عن الكود المطابق
    let codeIndex = -1;
    for (let i = 0; i < user.security.backupCodes.length; i++) {
      const isMatch = await bcrypt.compare(code, user.security.backupCodes[i]);
      if (isMatch) {
        codeIndex = i;
        break;
      }
    }

    if (codeIndex === -1) {
      throw new Error('الكود الاحتياطي غير صحيح');
    }

    // حذف الكود المستخدم
    user.security.backupCodes.splice(codeIndex, 1);
    await user.save();

    return true;
  }

  /**
   * إعادة إنشاء أكواد احتياطية
   * @param {string} userId - معرف المستخدم
   * @param {string} password - كلمة المرور للتحقق
   * @returns {Promise<string[]>}
   */
  async regenerateBackupCodes(userId, password) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    if (!user.security?.twoFactorEnabled) {
      throw new Error('المصادقة الثنائية غير مفعلة');
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('كلمة المرور غير صحيحة');
    }

    // إنشاء أكواد جديدة
    const backupCodes = this._generateBackupCodes(10);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    // حفظ الأكواد الجديدة
    user.security.backupCodes = hashedBackupCodes;
    await user.save();

    return backupCodes;
  }

  /**
   * إنشاء أكواد احتياطية
   * @private
   * @param {number} count - عدد الأكواد
   * @returns {string[]}
   */
  _generateBackupCodes(count) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // إنشاء كود من 8 أحرف (أرقام وحروف)
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * الحصول على حالة 2FA للمستخدم
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<{enabled: boolean, backupCodesCount: number}>}
   */
  async get2FAStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    return {
      enabled: user.security?.twoFactorEnabled || false,
      backupCodesCount: user.security?.backupCodes?.length || 0,
      setupPending: user.security?.twoFactorSetupPending || false
    };
  }
}

module.exports = new TwoFactorService();
