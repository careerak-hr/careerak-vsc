/**
 * خدمة إرسال الرسائل القصيرة (SMS)
 * Requirements: 3.3 - دعم SMS (اختياري)
 *
 * تستخدم Twilio لإرسال SMS مع graceful fallback إذا لم تكن المفاتيح مضبوطة
 * SMS معطّل افتراضياً (SMS_ENABLED=false)
 */

const logger = require('../utils/logger');

/**
 * التحقق من تفعيل SMS وتوفر مفاتيح Twilio
 */
function isSmsEnabled() {
  return (
    process.env.SMS_ENABLED === 'true' &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

/**
 * الحصول على عميل Twilio (lazy initialization)
 * يُعاد null إذا لم تكن المفاتيح متوفرة
 */
let twilioClient = null;

function getTwilioClient() {
  if (!isSmsEnabled()) return null;

  if (!twilioClient) {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } catch (err) {
      logger.warn('Twilio package not installed. SMS will be disabled. Run: npm install twilio');
      return null;
    }
  }

  return twilioClient;
}

/**
 * إرسال رسالة SMS
 *
 * @param {string} to - رقم الهاتف بصيغة دولية (مثال: +201234567890)
 * @param {string} body - نص الرسالة
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendSms(to, body) {
  if (!isSmsEnabled()) {
    logger.debug('SMS is disabled or Twilio credentials not configured. Skipping SMS.');
    return { success: false, error: 'SMS_DISABLED' };
  }

  if (!to || !body) {
    logger.warn('sendSms called with missing to or body');
    return { success: false, error: 'MISSING_PARAMS' };
  }

  // تنظيف رقم الهاتف
  const cleanPhone = normalizePhoneNumber(to);
  if (!cleanPhone) {
    logger.warn(`Invalid phone number: ${to}`);
    return { success: false, error: 'INVALID_PHONE' };
  }

  const client = getTwilioClient();
  if (!client) {
    return { success: false, error: 'TWILIO_UNAVAILABLE' };
  }

  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: cleanPhone,
    });

    logger.info(`SMS sent successfully. SID: ${message.sid}, To: ${cleanPhone}`);
    return { success: true, messageId: message.sid };
  } catch (error) {
    logger.error(`Failed to send SMS to ${cleanPhone}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * إرسال تذكير موعد عبر SMS
 *
 * @param {string} phoneNumber - رقم هاتف المستخدم
 * @param {Object} appointment - بيانات الموعد
 * @param {string} reminderType - '24h' أو '1h'
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendAppointmentReminderSms(phoneNumber, appointment, reminderType) {
  const timeLabel = reminderType === '24h' ? 'غداً' : 'خلال ساعة';

  const scheduledTime = new Date(appointment.scheduledAt).toLocaleString('ar-EG', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let body = `تذكير كاريرك: لديك موعد "${appointment.title}" ${timeLabel} في ${scheduledTime}.`;

  if (appointment.meetingLink) {
    body += ` رابط الاجتماع: ${appointment.meetingLink}`;
  } else if (appointment.location) {
    body += ` الموقع: ${appointment.location}`;
  }

  return sendSms(phoneNumber, body);
}

/**
 * تطبيع رقم الهاتف إلى صيغة دولية
 * يدعم الأرقام المصرية والسعودية والإماراتية وغيرها
 *
 * @param {string} phone
 * @returns {string|null}
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null;

  // إزالة المسافات والشرطات والأقواس
  let cleaned = phone.replace(/[\s\-().]/g, '');

  // إذا كان يبدأ بـ + فهو بالفعل بصيغة دولية
  if (cleaned.startsWith('+')) {
    return cleaned.length >= 10 ? cleaned : null;
  }

  // إذا كان يبدأ بـ 00 نحوله إلى +
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
    return cleaned.length >= 10 ? cleaned : null;
  }

  // إذا كان يبدأ بـ 0 (أرقام محلية) - نفترض مصر افتراضياً
  if (cleaned.startsWith('0')) {
    cleaned = '+2' + cleaned;
    return cleaned.length >= 12 ? cleaned : null;
  }

  // إذا كان رقماً بدون بادئة
  if (/^\d{9,15}$/.test(cleaned)) {
    return '+' + cleaned;
  }

  return null;
}

module.exports = {
  isSmsEnabled,
  sendSms,
  sendAppointmentReminderSms,
  normalizePhoneNumber,
};
