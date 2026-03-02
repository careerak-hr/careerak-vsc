const Appointment = require('../models/Appointment');
const VideoInterview = require('../models/VideoInterview');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

/**
 * خدمة التذكيرات للمواعيد ومقابلات الفيديو
 * 
 * Requirements: 5.3, 5.4
 */

/**
 * إرسال تذكيرات قبل 24 ساعة
 */
async function send24HourReminders() {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in24HoursPlus5Min = new Date(in24Hours.getTime() + 5 * 60 * 1000);

    // البحث عن المواعيد التي ستحدث خلال 24 ساعة ولم يتم إرسال تذكير لها
    const appointments = await Appointment.find({
      scheduledAt: {
        $gte: in24Hours,
        $lte: in24HoursPlus5Min,
      },
      status: { $in: ['scheduled', 'confirmed'] },
      'reminders.reminder24h.sent': false,
    })
      .populate('organizerId', 'firstName lastName companyName email')
      .populate('participants.userId', 'firstName lastName email')
      .populate('videoInterviewId', 'roomId');

    logger.info(`Found ${appointments.length} appointments for 24h reminders`);

    for (const appointment of appointments) {
      try {
        const scheduledTime = new Date(appointment.scheduledAt).toLocaleString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const meetingLink = appointment.videoInterviewId 
          ? `${process.env.FRONTEND_URL}/video-interview/${appointment.videoInterviewId.roomId}`
          : appointment.meetingLink;
        
        // إرسال تذكير للمنظم
        await notificationService.createNotification({
          recipient: appointment.organizerId._id,
          type: 'interview_reminder_24h',
          title: 'تذكير: مقابلة فيديو غداً 📅',
          message: `لديك مقابلة فيديو "${appointment.title}" غداً في ${scheduledTime}`,
          relatedData: {
            appointment: appointment._id,
            videoInterview: appointment.videoInterviewId?._id,
            meetingLink,
            scheduledAt: appointment.scheduledAt
          },
          priority: 'high',
        });

        // إرسال تذكير للمشاركين
        for (const participant of appointment.participants) {
          if (participant.status === 'accepted' || participant.status === 'pending') {
            await notificationService.createNotification({
              recipient: participant.userId._id,
              type: 'interview_reminder_24h',
              title: 'تذكير: مقابلة فيديو غداً 📅',
              message: `لديك مقابلة فيديو "${appointment.title}" غداً في ${scheduledTime}`,
              relatedData: {
                appointment: appointment._id,
                videoInterview: appointment.videoInterviewId?._id,
                meetingLink,
                scheduledAt: appointment.scheduledAt,
                organizer: {
                  name: appointment.organizerId.companyName || 
                        `${appointment.organizerId.firstName} ${appointment.organizerId.lastName}`,
                  email: appointment.organizerId.email
                }
              },
              priority: 'high',
            });
          }
        }
        
        // إرسال إشعارات فورية عبر Pusher
        const pusherService = require('./pusherService');
        if (pusherService.isEnabled()) {
          // للمنظم
          await pusherService.sendNotificationToUser(appointment.organizerId._id, {
            type: 'interview_reminder_24h',
            title: 'تذكير: مقابلة فيديو غداً 📅',
            message: `مقابلة "${appointment.title}" غداً`,
            appointmentId: appointment._id,
            appointmentTitle: appointment.title,
            scheduledAt: appointment.scheduledAt,
            meetingLink,
            timestamp: new Date().toISOString()
          });
          
          // للمشاركين
          await Promise.all(
            appointment.participants
              .filter(p => p.status === 'accepted' || p.status === 'pending')
              .map(participant =>
                pusherService.sendNotificationToUser(participant.userId._id, {
                  type: 'interview_reminder_24h',
                  title: 'تذكير: مقابلة فيديو غداً 📅',
                  message: `مقابلة "${appointment.title}" غداً`,
                  appointmentId: appointment._id,
                  appointmentTitle: appointment.title,
                  scheduledAt: appointment.scheduledAt,
                  meetingLink,
                  organizerName: appointment.organizerId.companyName || 
                               `${appointment.organizerId.firstName} ${appointment.organizerId.lastName}`,
                  timestamp: new Date().toISOString()
                })
              )
          );
        }

        // تسجيل إرسال التذكير
        await appointment.markReminderSent('24h');

        logger.info(`Sent 24h reminder for appointment ${appointment._id}`);
      } catch (error) {
        logger.error(`Error sending 24h reminder for appointment ${appointment._id}:`, error);
      }
    }

    return {
      success: true,
      count: appointments.length,
      message: `تم إرسال ${appointments.length} تذكير`,
    };
  } catch (error) {
    logger.error('Error in send24HourReminders:', error);
    throw error;
  }
}

/**
 * إرسال تذكيرات قبل 15 دقيقة
 */
async function send15MinuteReminders() {
  try {
    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
    const in15MinutesPlus2Min = new Date(in15Minutes.getTime() + 2 * 60 * 1000);

    // البحث عن المواعيد التي ستحدث خلال 15 دقيقة ولم يتم إرسال تذكير لها
    const appointments = await Appointment.find({
      scheduledAt: {
        $gte: in15Minutes,
        $lte: in15MinutesPlus2Min,
      },
      status: { $in: ['scheduled', 'confirmed'] },
      'reminders.reminder15m.sent': false,
    })
      .populate('organizerId', 'firstName lastName companyName email')
      .populate('participants.userId', 'firstName lastName email')
      .populate('videoInterviewId', 'roomId');

    logger.info(`Found ${appointments.length} appointments for 15m reminders`);

    for (const appointment of appointments) {
      try {
        const scheduledTime = new Date(appointment.scheduledAt).toLocaleString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const meetingLink = appointment.videoInterviewId 
          ? `${process.env.FRONTEND_URL}/video-interview/${appointment.videoInterviewId.roomId}`
          : appointment.meetingLink;
        
        // إرسال تذكير للمنظم
        await notificationService.createNotification({
          recipient: appointment.organizerId._id,
          type: 'interview_reminder_15m',
          title: 'تذكير: مقابلة فيديو خلال 15 دقيقة ⏰',
          message: `مقابلة "${appointment.title}" ستبدأ في ${scheduledTime}. انضم الآن!`,
          relatedData: {
            appointment: appointment._id,
            videoInterview: appointment.videoInterviewId?._id,
            meetingLink,
            scheduledAt: appointment.scheduledAt,
            canJoinNow: true
          },
          priority: 'urgent',
        });

        // إرسال تذكير للمشاركين
        for (const participant of appointment.participants) {
          if (participant.status === 'accepted' || participant.status === 'pending') {
            await notificationService.createNotification({
              recipient: participant.userId._id,
              type: 'interview_reminder_15m',
              title: 'تذكير: مقابلة فيديو خلال 15 دقيقة ⏰',
              message: `مقابلة "${appointment.title}" ستبدأ في ${scheduledTime}. انضم الآن!`,
              relatedData: {
                appointment: appointment._id,
                videoInterview: appointment.videoInterviewId?._id,
                meetingLink,
                scheduledAt: appointment.scheduledAt,
                canJoinNow: true,
                organizer: {
                  name: appointment.organizerId.companyName || 
                        `${appointment.organizerId.firstName} ${appointment.organizerId.lastName}`,
                  email: appointment.organizerId.email
                }
              },
              priority: 'urgent',
            });
          }
        }
        
        // إرسال إشعارات فورية عبر Pusher
        const pusherService = require('./pusherService');
        if (pusherService.isEnabled()) {
          // للمنظم
          await pusherService.sendNotificationToUser(appointment.organizerId._id, {
            type: 'interview_reminder_15m',
            title: 'تذكير: مقابلة فيديو خلال 15 دقيقة ⏰',
            message: `مقابلة "${appointment.title}" ستبدأ قريباً`,
            appointmentId: appointment._id,
            appointmentTitle: appointment.title,
            scheduledAt: appointment.scheduledAt,
            meetingLink,
            canJoinNow: true,
            timestamp: new Date().toISOString()
          });
          
          // للمشاركين
          await Promise.all(
            appointment.participants
              .filter(p => p.status === 'accepted' || p.status === 'pending')
              .map(participant =>
                pusherService.sendNotificationToUser(participant.userId._id, {
                  type: 'interview_reminder_15m',
                  title: 'تذكير: مقابلة فيديو خلال 15 دقيقة ⏰',
                  message: `مقابلة "${appointment.title}" ستبدأ قريباً`,
                  appointmentId: appointment._id,
                  appointmentTitle: appointment.title,
                  scheduledAt: appointment.scheduledAt,
                  meetingLink,
                  canJoinNow: true,
                  organizerName: appointment.organizerId.companyName || 
                               `${appointment.organizerId.firstName} ${appointment.organizerId.lastName}`,
                  timestamp: new Date().toISOString()
                })
              )
          );
        }

        // تسجيل إرسال التذكير
        await appointment.markReminderSent('15m');

        logger.info(`Sent 15m reminder for appointment ${appointment._id}`);
      } catch (error) {
        logger.error(`Error sending 15m reminder for appointment ${appointment._id}:`, error);
      }
    }

    return {
      success: true,
      count: appointments.length,
      message: `تم إرسال ${appointments.length} تذكير`,
    };
  } catch (error) {
    logger.error('Error in send15MinuteReminders:', error);
    throw error;
  }
}

/**
 * تشغيل جميع التذكيرات
 */
async function runAllReminders() {
  try {
    logger.info('Running appointment reminders...');

    const results24h = await send24HourReminders();
    const results15m = await send15MinuteReminders();

    logger.info('Appointment reminders completed');

    return {
      success: true,
      reminders24h: results24h.count,
      reminders15m: results15m.count,
    };
  } catch (error) {
    logger.error('Error in runAllReminders:', error);
    throw error;
  }
}

module.exports = {
  send24HourReminders,
  send15MinuteReminders,
  runAllReminders,
};
