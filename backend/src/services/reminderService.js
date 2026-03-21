const Reminder = require('../models/Reminder');
const Appointment = require('../models/Appointment');
const notificationService = require('./notificationService');
const smsService = require('./smsService');
const logger = require('../utils/logger');

/**
 * خدمة التذكيرات التلقائية للمواعيد
 * Requirements: 3.1, 3.2, 3.3, 3.4
 *
 * تنشئ تذكيرين لكل طرف (24h و 1h) وترسلهما عبر الإشعارات
 */

/**
 * إنشاء تذكيرات لموعد جديد
 * ينشئ 4 تذكيرات: (24h + 1h) × (المنظم + المشارك)
 *
 * @param {Object} appointment - وثيقة الموعد من MongoDB
 * @returns {Promise<Reminder[]>} - قائمة التذكيرات المنشأة
 */
async function createRemindersForAppointment(appointment) {
  try {
    const scheduledAt = new Date(appointment.scheduledAt);
    const remindersToCreate = [];

    // تحديد المستخدمين المعنيين: المنظم + المشاركون
    const userIds = [appointment.organizerId];
    if (appointment.participants && appointment.participants.length > 0) {
      appointment.participants.forEach(p => {
        const uid = p.userId?._id || p.userId;
        if (uid) userIds.push(uid);
      });
    }

    // أنواع التذكيرات وأوقاتها
    const reminderTypes = [
      { type: '24h', offsetMs: 24 * 60 * 60 * 1000 },
      { type: '1h',  offsetMs: 1  * 60 * 60 * 1000 },
    ];

    // تحديد القنوات المتاحة
    const channels = ['notification'];
    if (smsService.isSmsEnabled()) {
      channels.push('sms');
    }

    for (const userId of userIds) {
      for (const { type, offsetMs } of reminderTypes) {
        const scheduledReminderAt = new Date(scheduledAt.getTime() - offsetMs);

        // لا ننشئ تذكيراً في الماضي
        if (scheduledReminderAt <= new Date()) continue;

        for (const channel of channels) {
          remindersToCreate.push({
            appointmentId: appointment._id,
            userId,
            type,
            channel,
            status: 'pending',
            scheduledAt: scheduledReminderAt,
          });
        }
      }
    }

    if (remindersToCreate.length === 0) {
      logger.info(`No future reminders to create for appointment ${appointment._id}`);
      return [];
    }

    // insertMany مع تجاهل التكرار (unique index)
    const created = await Reminder.insertMany(remindersToCreate, { ordered: false }).catch(err => {
      // تجاهل أخطاء الـ duplicate key
      if (err.code === 11000 || (err.writeErrors && err.writeErrors.length > 0)) {
        logger.warn(`Some reminders already exist for appointment ${appointment._id}`);
        return err.insertedDocs || [];
      }
      throw err;
    });

    logger.info(`Created ${created.length} reminders for appointment ${appointment._id}`);
    return created;
  } catch (error) {
    logger.error('Error in createRemindersForAppointment:', error);
    throw error;
  }
}

/**
 * جلب وإرسال التذكيرات المستحقة
 * يُستدعى من الـ cron job كل دقيقة
 *
 * @returns {Promise<{sent: number, failed: number}>}
 */
async function sendDueReminders() {
  try {
    const now = new Date();
    // نافذة زمنية: من الآن حتى دقيقة مضت (لتغطية أي تأخير في الـ cron)
    const windowStart = new Date(now.getTime() - 60 * 1000);

    const dueReminders = await Reminder.find({
      status: 'pending',
      scheduledAt: { $lte: now, $gte: windowStart },
    }).populate({
      path: 'appointmentId',
      select: 'title scheduledAt duration meetingLink location status',
    });

    if (dueReminders.length === 0) {
      return { sent: 0, failed: 0 };
    }

    logger.info(`Found ${dueReminders.length} due reminders`);

    let sent = 0;
    let failed = 0;

    for (const reminder of dueReminders) {
      try {
        await sendReminderNotification(reminder);
        reminder.status = 'sent';
        reminder.sentAt = new Date();
        await reminder.save();
        sent++;
      } catch (error) {
        logger.error(`Failed to send reminder ${reminder._id}:`, error);
        reminder.status = 'failed';
        reminder.failureReason = error.message;
        await reminder.save();
        failed++;
      }
    }

    logger.info(`Reminders: sent=${sent}, failed=${failed}`);
    return { sent, failed };
  } catch (error) {
    logger.error('Error in sendDueReminders:', error);
    throw error;
  }
}

/**
 * إرسال إشعار تذكير واحد عبر notificationService أو SMS
 *
 * @param {Object} reminder - وثيقة التذكير
 */
async function sendReminderNotification(reminder) {
  const appointment = reminder.appointmentId;
  if (!appointment) {
    throw new Error(`Appointment not found for reminder ${reminder._id}`);
  }

  // إرسال عبر SMS إذا كانت القناة sms
  if (reminder.channel === 'sms') {
    await sendReminderViaSms(reminder, appointment);
    return;
  }

  // تنسيق وقت الموعد
  const scheduledTime = new Date(appointment.scheduledAt).toLocaleString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // رسالة التذكير حسب النوع
  const timeLabel = reminder.type === '24h' ? 'غداً' : 'خلال ساعة';
  const title = reminder.type === '24h'
    ? 'تذكير: موعدك غداً 📅'
    : 'تذكير: موعدك خلال ساعة ⏰';
  const message = `لديك موعد "${appointment.title}" ${timeLabel} في ${scheduledTime}`;

  await notificationService.createNotification({
    recipient: reminder.userId,
    type: 'appointment_reminder',
    title,
    message,
    relatedData: {
      appointment: appointment._id,
      scheduledAt: appointment.scheduledAt,
      meetingLink: appointment.meetingLink || null,
      location: appointment.location || null,
    },
    priority: reminder.type === '1h' ? 'urgent' : 'high',
  });

  // إرسال إشعار فوري عبر Pusher إن كان متاحاً
  try {
    const pusherService = require('./pusherService');
    if (pusherService.isEnabled()) {
      await pusherService.sendNotificationToUser(reminder.userId, {
        type: 'appointment_reminder',
        title,
        message,
        appointmentId: appointment._id,
        appointmentTitle: appointment.title,
        scheduledAt: appointment.scheduledAt,
        meetingLink: appointment.meetingLink || null,
        reminderType: reminder.type,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (pusherError) {
    logger.warn('Pusher notification failed for reminder:', pusherError.message);
  }
}

/**
 * إرسال تذكير عبر SMS
 * يتحقق من وجود رقم هاتف للمستخدم قبل الإرسال
 *
 * @param {Object} reminder - وثيقة التذكير
 * @param {Object} appointment - وثيقة الموعد
 */
async function sendReminderViaSms(reminder, appointment) {
  try {
    // جلب رقم هاتف المستخدم
    const User = require('../models/User').User || require('../models/User');
    const user = await User.findById(reminder.userId).select('phone').lean();

    if (!user || !user.phone) {
      throw new Error(`User ${reminder.userId} has no phone number for SMS reminder`);
    }

    const result = await smsService.sendAppointmentReminderSms(
      user.phone,
      appointment,
      reminder.type
    );

    if (!result.success) {
      throw new Error(`SMS send failed: ${result.error}`);
    }

    logger.info(`SMS reminder sent to user ${reminder.userId} for appointment ${appointment._id}`);
  } catch (error) {
    logger.error(`SMS reminder failed for reminder ${reminder._id}:`, error.message);
    throw error;
  }
}

/**
 * جدولة تذكيرات مخصصة من حقل customReminders
 * يُستدعى بعد تحديث customReminders عبر PUT /reminders/:id
 * أو يمكن استدعاؤه دورياً لإنشاء التذكيرات المخصصة المعلقة
 *
 * @param {string} reminderId - معرف التذكير الذي يحتوي على customReminders
 * @returns {Promise<Reminder[]>} - قائمة التذكيرات المخصصة المنشأة
 */
async function scheduleCustomReminders(reminderId) {
  try {
    const reminder = await Reminder.findById(reminderId).populate({
      path: 'appointmentId',
      select: 'title scheduledAt status',
    });

    if (!reminder) {
      logger.warn(`scheduleCustomReminders: reminder ${reminderId} not found`);
      return [];
    }

    const { customReminders, appointmentId: appointment, userId, channel } = reminder;

    if (!customReminders || customReminders.length === 0) return [];
    if (!appointment || appointment.status === 'cancelled') return [];

    const appointmentTime = new Date(appointment.scheduledAt);
    const now = new Date();
    const remindersToCreate = [];

    for (const minutesBefore of customReminders) {
      const scheduledAt = new Date(appointmentTime.getTime() - minutesBefore * 60 * 1000);

      // تخطي التذكيرات في الماضي
      if (scheduledAt <= now) continue;

      remindersToCreate.push({
        appointmentId: appointment._id,
        userId,
        type: '1h', // نوع افتراضي للتذكيرات المخصصة
        channel: channel || 'notification',
        status: 'pending',
        scheduledAt,
      });
    }

    if (remindersToCreate.length === 0) return [];

    const created = await Reminder.insertMany(remindersToCreate, { ordered: false }).catch(err => {
      if (err.code === 11000 || (err.writeErrors && err.writeErrors.length > 0)) {
        logger.warn(`Some custom reminders already exist for reminder ${reminderId}`);
        return err.insertedDocs || [];
      }
      throw err;
    });

    logger.info(`Created ${created.length} custom reminders from reminder ${reminderId}`);
    return created;
  } catch (error) {
    logger.error('Error in scheduleCustomReminders:', error);
    throw error;
  }
}

module.exports = {
  createRemindersForAppointment,
  sendDueReminders,
  sendReminderNotification,
  sendReminderViaSms,
  scheduleCustomReminders,
};
