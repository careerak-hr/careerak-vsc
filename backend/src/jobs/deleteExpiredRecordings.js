const cron = require('node-cron');
const RecordingService = require('../services/recordingService');

const recordingService = new RecordingService();

/**
 * Cron Job: Delete Expired Recordings
 * حذف التسجيلات المنتهية تلقائياً
 * 
 * يعمل يومياً في الساعة 2:00 صباحاً
 * 
 * Requirements: 2.6
 */

/**
 * تشغيل مهمة حذف التسجيلات المنتهية
 */
const runDeleteExpiredRecordings = async () => {
  try {
    console.log('[Cron] Starting expired recordings cleanup...');
    
    const results = await recordingService.deleteExpiredRecordings();
    
    console.log('[Cron] Expired recordings cleanup completed:', {
      total: results.total,
      deleted: results.deleted,
      failed: results.failed,
    });

    if (results.failed > 0) {
      console.error('[Cron] Some recordings failed to delete:', results.errors);
    }

    return results;
  } catch (error) {
    console.error('[Cron] Error in expired recordings cleanup:', error);
    throw error;
  }
};

/**
 * جدولة مهمة الحذف التلقائي
 * يعمل يومياً في الساعة 2:00 صباحاً
 */
const scheduleDeleteExpiredRecordings = () => {
  // Cron expression: '0 2 * * *' = كل يوم في الساعة 2:00 صباحاً
  const task = cron.schedule('0 2 * * *', async () => {
    await runDeleteExpiredRecordings();
  }, {
    scheduled: true,
    timezone: 'UTC',
  });

  console.log('[Cron] Scheduled expired recordings cleanup job (daily at 2:00 AM UTC)');

  return task;
};

/**
 * إيقاف مهمة الحذف التلقائي
 */
const stopDeleteExpiredRecordings = (task) => {
  if (task) {
    task.stop();
    console.log('[Cron] Stopped expired recordings cleanup job');
  }
};

module.exports = {
  runDeleteExpiredRecordings,
  scheduleDeleteExpiredRecordings,
  stopDeleteExpiredRecordings,
};
