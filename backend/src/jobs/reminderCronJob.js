const cron = require('node-cron');
const reminderService = require('../services/reminderService');
const logger = require('../utils/logger');

/**
 * Cron Job للتذكيرات التلقائية (24h و 1h)
 * يعمل كل دقيقة ويرسل التذكيرات المستحقة
 *
 * Requirements: 3.1, 3.2
 */

let cronJob = null;

function startReminderCronJob() {
  if (cronJob) {
    logger.warn('[ReminderCronJob] Already running');
    return;
  }

  // تشغيل كل دقيقة
  cronJob = cron.schedule('* * * * *', async () => {
    try {
      const results = await reminderService.sendDueReminders();
      if (results.sent > 0 || results.failed > 0) {
        logger.info(`[ReminderCronJob] sent=${results.sent}, failed=${results.failed}`);
      }
    } catch (error) {
      logger.error('[ReminderCronJob] Error:', error);
    }
  });

  logger.info('[ReminderCronJob] Started - running every minute');
  console.log('✅ تم بدء جدولة التذكيرات التلقائية (كل دقيقة)');
}

function stopReminderCronJob() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    logger.info('[ReminderCronJob] Stopped');
  }
}

module.exports = { startReminderCronJob, stopReminderCronJob };
