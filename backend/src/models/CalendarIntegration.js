const mongoose = require('mongoose');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || process.env.GOOGLE_ENCRYPTION_KEY || 'careerak_calendar_key_32chars_pad';
const ALGORITHM = 'aes-256-cbc';

/**
 * تشفير النص
 */
function encrypt(text) {
  if (!text) return null;
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (err) {
    console.error('Encryption error:', err.message);
    return null;
  }
}

/**
 * فك تشفير النص
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  try {
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err.message);
    return null;
  }
}

/**
 * نموذج ربط Google Calendar
 * يحفظ بيانات OAuth 2.0 للمستخدمين
 */
const calendarIntegrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },

  // Access Token مشفر
  accessToken: {
    type: String,
    default: null,
  },

  // Refresh Token مشفر
  refreshToken: {
    type: String,
    default: null,
  },

  // تاريخ انتهاء صلاحية Access Token
  tokenExpiry: {
    type: Date,
    default: null,
  },

  // معرف التقويم في Google
  calendarId: {
    type: String,
    default: 'primary',
  },

  // هل التكامل مفعّل
  isActive: {
    type: Boolean,
    default: true,
  },

  // معرف Google للمستخدم
  googleUserId: {
    type: String,
    default: null,
  },

  // بريد Google الإلكتروني
  googleEmail: {
    type: String,
    default: null,
  },

  // آخر مزامنة
  lastSyncAt: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true,
});

/**
 * حفظ Access Token مشفراً
 */
calendarIntegrationSchema.methods.setAccessToken = function(token) {
  this.accessToken = encrypt(token);
};

/**
 * الحصول على Access Token مفكوك التشفير
 */
calendarIntegrationSchema.methods.getAccessToken = function() {
  return decrypt(this.accessToken);
};

/**
 * حفظ Refresh Token مشفراً
 */
calendarIntegrationSchema.methods.setRefreshToken = function(token) {
  this.refreshToken = encrypt(token);
};

/**
 * الحصول على Refresh Token مفكوك التشفير
 */
calendarIntegrationSchema.methods.getRefreshToken = function() {
  return decrypt(this.refreshToken);
};

/**
 * التحقق من انتهاء صلاحية Access Token
 */
calendarIntegrationSchema.methods.isTokenExpired = function() {
  if (!this.tokenExpiry) return true;
  // اعتبار التوكن منتهياً قبل 5 دقائق من الانتهاء الفعلي
  return new Date() >= new Date(this.tokenExpiry.getTime() - 5 * 60 * 1000);
};

const CalendarIntegration = mongoose.model('CalendarIntegration', calendarIntegrationSchema);

module.exports = CalendarIntegration;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
