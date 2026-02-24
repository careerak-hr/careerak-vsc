const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * خدمة المصادقة الثنائية (2FA)
 * توفر وظائف توليد السر، QR code، والتحقق من OTP
 */

/**
 * توليد سر جديد للمصادقة الثنائية
 * @param {string} userEmail - البريد الإلكتروني للمستخدم
 * @returns {Object} - يحتوي على secret و otpauth_url
 */
function generateSecret(userEmail) {
  const secret = speakeasy.generateSecret({
    name: `Careerak (${userEmail})`,
    issuer: 'Careerak',
    length: 32
  });

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url
  };
}

/**
 * توليد QR code من otpauth_url
 * @param {string} otpauth_url - رابط OTP
 * @returns {Promise<string>} - QR code كـ data URL
 */
async function generateQRCode(otpauth_url) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('فشل توليد QR code: ' + error.message);
  }
}

/**
 * التحقق من رمز OTP
 * @param {string} token - الرمز المدخل من المستخدم
 * @param {string} secret - السر المخزن للمستخدم
 * @returns {boolean} - true إذا كان الرمز صحيح
 */
function verifyToken(token, secret) {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2 // يسمح بـ ±2 فترات زمنية (60 ثانية)
  });
}

/**
 * توليد رمز احتياطي (backup code)
 * @returns {string} - رمز احتياطي من 8 أحرف
 */
function generateBackupCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * توليد مجموعة من الرموز الاحتياطية
 * @param {number} count - عدد الرموز (افتراضي: 10)
 * @returns {Array<string>} - مصفوفة من الرموز الاحتياطية
 */
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateBackupCode());
  }
  return codes;
}

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes
};
