const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const VideoInterview = require('../models/VideoInterview');
const User = require('../models/User');
const { sendVideoInterviewReminder } = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Cron Job لإرسال تذكيرات مقابلات الفيديو
 * 
 * يرسل تذكيرات:
 * - قبل 24 ساعة من المقابلة
 * - قبل 15 دقيقة من المقابلة
 * 
 * Requirements: 5.3, 5.4
 */

/**
 * إرسال تذكير قبل 24 ساعة
 * يعمل كل ساعة
 */
const send24HourReminders = cron.schedule('0 * * * *', async () => {
  try {
    logger.info('Starting 24-hour reminder job');

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // البحث عن المواعيد المجدولة خلال الساعة القادمة (من 24 إلى 25 ساعة)
    const appointments = await Appointment.find({
      type: 'video_interview',
      status: { $in: ['scheduled', 'confirmed'] },
      scheduledAt: {
        $gte: in24Hours,
        $lt: in25Hours
      },
      'reminders.24hours': { $ne: true }
    }).populate('videoInterviewId');

    logger.info(`Found ${appointments.length} appointments for 24-hour reminders`);

    for (const appointment of appointments) {
      try {
        if (!appointment.videoInterviewId) {
          logger.warn('Appointment has no video interview', { appointmentId: appointment._id });
          continue;
        }

        const videoInterview = appointment.videoInterviewId;
        
        // جلب معلومات المشاركين
        const participantIds = appointment.participants.map(p => p.userId);
        const participants = await User.find({ _id: { $in: participantIds } });

        // إرسال تذكير لكل مشارك
        for (const participant of participants) {
          try {
            await sendVideoInterviewReminder(
              appointment,
              videoInterview,
              participant,
              1440 // 24 ساعة = 1440 دقيقة
            );
            
            logger.info('24-hour reminder sent', {
              appointmentId: appointment._id,
              participantId: participant._id,
              participantEmail: participant.email
            });
          } catch (error) {
            logger.error('Failed to send 24-hour reminder to participant', {
              error: error.message,
              appointmentId: appointment._id,
              participantId: participant._id
            });
          }
        }

        // تحديث حالة التذكير
        appointment.reminders = appointment.reminders || {};
        appointment.reminders['24hours'] = true;
        await appointment.save();

      } catch (error) {
        logger.error('Failed to process appointment for 24-hour reminder', {
          error: error.message,
          appointmentId: appointment._id
        });
      }
    }

    logger.info('24-hour reminder job completed');
  } catch (error) {
    logger.error('24-hour reminder job failed', { error: error.message });
  }
}, {
  scheduled: false // لا نبدأ تلقائياً، سنبدأ يدوياً
});

/**
 * إرسال تذكير قبل 15 دقيقة
 * يعمل كل دقيقة
 */
const send15MinuteReminders = cron.schedule('* * * * *', async () => {
  try {
    logger.info('Starting 15-minute reminder job');

    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
    const in16Minutes = new Date(now.getTime() + 16 * 60 * 1000);

    // البحث عن المواعيد المجدولة خلال الدقيقة القادمة (من 15 إلى 16 دقيقة)
    const appointments = await Appointment.find({
      type: 'video_interview',
      status: { $in: ['scheduled', 'confirmed'] },
      scheduledAt: {
        $gte: in15Minutes,
        $lt: in16Minutes
      },
      'reminders.15minutes': { $ne: true }
    }).populate('videoInterviewId');

    logger.info(`Found ${appointments.length} appointments for 15-minute reminders`);

    for (const appointment of appointments) {
      try {
        if (!appointment.videoInterviewId) {
          logger.warn('Appointment has no video interview', { appointmentId: appointment._id });
          continue;
        }

        const videoInterview = appointment.videoInterviewId;
        
        // جلب معلومات المشاركين
        const participantIds = appointment.participants.map(p => p.userId);
        const participants = await User.find({ _id: { $in: participantIds } });

        // إرسال تذكير لكل مشارك
        for (const participant of participants) {
          try {
            await sendVideoInterviewReminder(
              appointment,
              videoInterview,
              participant,
              15 // 15 دقيقة
            );
            
            logger.info('15-minute reminder sent', {
              appointmentId: appointment._id,
              participantId: participant._id,
              participantEmail: participant.email
            });
          } catch (error) {
            logger.error('Failed to send 15-minute reminder to participant', {
              error: error.message,
              appointmentId: appointment._id,
              participantId: participant._id
            });
          }
        }

        // تحديث حالة التذكير
        appointment.reminders = appointment.reminders || {};
        appointment.reminders['15minutes'] = true;
        await appointment.save();

      } catch (error) {
        logger.error('Failed to process appointment for 15-minute reminder', {
          error: error.message,
          appointmentId: appointment._id
        });
      }
    }

    logger.info('15-minute reminder job completed');
  } catch (error) {
    logger.error('15-minute reminder job failed', { error: error.message });
  }
}, {
  scheduled: false // لا نبدأ تلقائياً، سنبدأ يدوياً
});

/**
 * بدء جميع Cron Jobs
 */
const startReminderJobs = () => {
  send24HourReminders.start();
  send15MinuteReminders.start();
  logger.info('Video interview reminder cron jobs started');
};

/**
 * إيقاف جميع Cron Jobs
 */
const stopReminderJobs = () => {
  send24HourReminders.stop();
  send15MinuteReminders.stop();
  logger.info('Video interview reminder cron jobs stopped');
};

module.exports = {
  startReminderJobs,
  stopReminderJobs,
  send24HourReminders,
  send15MinuteReminders
};
