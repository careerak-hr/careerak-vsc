const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

/**
 * Cron Job أسبوعي لفحص معدل الحضور للشركات
 * يرسل إشعاراً للشركات التي معدل حضورها أقل من 85%
 * Validates: KPI "معدل الحضور > 85%"
 */

const ATTENDANCE_TARGET = 85;
const MIN_APPOINTMENTS_FOR_ALERT = 5; // الحد الأدنى للمواعيد قبل إرسال التنبيه

/**
 * حساب معدل الحضور لشركة معينة خلال آخر 30 يوم
 */
async function getCompanyAttendanceRate(companyId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const query = {
    organizerId: companyId,
    status: 'completed',
    scheduledAt: { $gte: thirtyDaysAgo },
  };

  const [attended, noShow] = await Promise.all([
    Appointment.countDocuments({ ...query, attendanceStatus: 'attended' }),
    Appointment.countDocuments({ ...query, attendanceStatus: 'no_show' }),
  ]);

  const totalTracked = attended + noShow;
  if (totalTracked < MIN_APPOINTMENTS_FOR_ALERT) return null;

  return {
    attended,
    noShow,
    totalTracked,
    rate: Math.round((attended / totalTracked) * 100),
  };
}

/**
 * فحص جميع الشركات وإرسال إشعارات للشركات التي معدلها أقل من 85%
 */
async function checkAttendanceRates() {
  logger.info('[AttendanceRateCron] Starting weekly attendance rate check...');

  try {
    // جلب جميع الشركات التي لديها مواعيد مكتملة خلال آخر 30 يوم
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const companyIds = await Appointment.distinct('organizerId', {
      status: 'completed',
      scheduledAt: { $gte: thirtyDaysAgo },
    });

    logger.info(`[AttendanceRateCron] Found ${companyIds.length} companies with completed appointments`);

    let alertsSent = 0;
    let skipped = 0;

    for (const companyId of companyIds) {
      try {
        const stats = await getCompanyAttendanceRate(companyId);

        if (!stats) {
          skipped++;
          continue;
        }

        if (stats.rate < ATTENDANCE_TARGET) {
          // إرسال إشعار للشركة
          await notificationService.createNotification({
            recipient: companyId,
            type: 'attendance_alert',
            title: `⚠️ معدل الحضور أقل من ${ATTENDANCE_TARGET}%`,
            message: `معدل حضور المرشحين لديك هذا الشهر ${stats.rate}% (${stats.attended} من ${stats.totalTracked}). الهدف هو ${ATTENDANCE_TARGET}%.`,
            relatedData: {
              attendanceRate: stats.rate,
              attended: stats.attended,
              noShow: stats.noShow,
              totalTracked: stats.totalTracked,
              target: ATTENDANCE_TARGET,
              suggestions: [
                'أرسل تذكيرات إضافية قبل الموعد بـ 48 ساعة',
                'تأكد من تأكيد الحضور مع المرشحين قبل يوم من الموعد',
                'أضف رابط الاجتماع بوضوح في رسائل التأكيد',
                'فكّر في إرسال رسالة تحفيزية قبل المقابلة',
              ],
            },
            priority: 'high',
          });

          alertsSent++;
          logger.info(`[AttendanceRateCron] Alert sent to company ${companyId}, rate: ${stats.rate}%`);
        }
      } catch (err) {
        logger.error(`[AttendanceRateCron] Error processing company ${companyId}:`, err.message);
      }
    }

    logger.info(`[AttendanceRateCron] Completed. Alerts sent: ${alertsSent}, Skipped (insufficient data): ${skipped}`);
    return { alertsSent, skipped, total: companyIds.length };
  } catch (error) {
    logger.error('[AttendanceRateCron] Fatal error:', error.message);
    throw error;
  }
}

/**
 * بدء Cron Job الأسبوعي
 * يعمل كل يوم اثنين الساعة 9 صباحاً UTC
 */
function startAttendanceRateCron() {
  // كل يوم اثنين الساعة 9:00 صباحاً UTC
  cron.schedule('0 9 * * 1', async () => {
    try {
      logger.info('[AttendanceRateCron] Running weekly attendance check...');
      const result = await checkAttendanceRates();
      logger.info('[AttendanceRateCron] Weekly check completed:', result);
    } catch (error) {
      logger.error('[AttendanceRateCron] Error in weekly check:', error.message);
    }
  }, {
    scheduled: true,
    timezone: 'UTC',
  });

  logger.info('[AttendanceRateCron] Started - Runs every Monday at 9:00 AM UTC');
}

module.exports = { startAttendanceRateCron, checkAttendanceRates };
