const cron = require('node-cron');
const appointmentReminderService = require('../services/appointmentReminderService');

/**
 * Cron Job للتذكيرات بالمواعيد
 * 
 * Requirements: 5.3, 5.4
 */

/**
 * تشغيل التذكيرات كل 5 دقائق
 * يتحقق من المواعيد التي تحتاج تذكيرات (24 ساعة و15 دقيقة)
 */
function startAppointmentReminderCron() {
  // تشغيل كل 5 دقائق
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[Appointment Reminder Cron] Running...');
      
      const results = await appointmentReminderService.runAllReminders();
      
      console.log('[Appointment Reminder Cron] Completed:', results);
    } catch (error) {
      console.error('[Appointment Reminder Cron] Error:', error);
    }
  });

  console.log('[Appointment Reminder Cron] Started - Running every 5 minutes');
}

module.exports = { startAppointmentReminderCron };
