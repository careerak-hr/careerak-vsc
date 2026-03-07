const cron = require('node-cron');
const alertService = require('../services/alertService');
const logger = require('../utils/logger');

/**
 * جدولة التنبيهات الذكية
 * يستخدم node-cron لتشغيل التنبيهات اليومية والأسبوعية
 */

class AlertScheduler {
  constructor() {
    this.dailyJob = null;
    this.weeklyJob = null;
  }

  /**
   * بدء جميع المهام المجدولة
   */
  start() {
    logger.info('Starting alert scheduler...');

    // التنبيهات اليومية - كل يوم الساعة 9 صباحاً
    this.dailyJob = cron.schedule('0 9 * * *', async () => {
      logger.info('Running daily alerts...');
      try {
        await alertService.runScheduledAlerts('daily');
        logger.info('Daily alerts completed successfully');
      } catch (error) {
        logger.error('Error running daily alerts:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Cairo' // توقيت القاهرة
    });

    // التنبيهات الأسبوعية - كل يوم إثنين الساعة 9 صباحاً
    this.weeklyJob = cron.schedule('0 9 * * 1', async () => {
      logger.info('Running weekly alerts...');
      try {
        await alertService.runScheduledAlerts('weekly');
        logger.info('Weekly alerts completed successfully');
      } catch (error) {
        logger.error('Error running weekly alerts:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Cairo'
    });

    logger.info('Alert scheduler started successfully');
    logger.info('Daily alerts: Every day at 9:00 AM (Africa/Cairo)');
    logger.info('Weekly alerts: Every Monday at 9:00 AM (Africa/Cairo)');
  }

  /**
   * إيقاف جميع المهام المجدولة
   */
  stop() {
    logger.info('Stopping alert scheduler...');

    if (this.dailyJob) {
      this.dailyJob.stop();
      logger.info('Daily alerts stopped');
    }

    if (this.weeklyJob) {
      this.weeklyJob.stop();
      logger.info('Weekly alerts stopped');
    }

    logger.info('Alert scheduler stopped successfully');
  }

  /**
   * تشغيل التنبيهات اليومية يدوياً (للاختبار)
   */
  async runDailyAlertsNow() {
    logger.info('Running daily alerts manually...');
    try {
      await alertService.runScheduledAlerts('daily');
      logger.info('Daily alerts completed successfully');
      return { success: true, message: 'Daily alerts completed' };
    } catch (error) {
      logger.error('Error running daily alerts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * تشغيل التنبيهات الأسبوعية يدوياً (للاختبار)
   */
  async runWeeklyAlertsNow() {
    logger.info('Running weekly alerts manually...');
    try {
      await alertService.runScheduledAlerts('weekly');
      logger.info('Weekly alerts completed successfully');
      return { success: true, message: 'Weekly alerts completed' };
    } catch (error) {
      logger.error('Error running weekly alerts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * الحصول على حالة المهام المجدولة
   */
  getStatus() {
    return {
      dailyJob: {
        running: this.dailyJob ? true : false,
        schedule: '0 9 * * * (Every day at 9:00 AM)',
        timezone: 'Africa/Cairo'
      },
      weeklyJob: {
        running: this.weeklyJob ? true : false,
        schedule: '0 9 * * 1 (Every Monday at 9:00 AM)',
        timezone: 'Africa/Cairo'
      }
    };
  }
}

// تصدير instance واحد
const alertScheduler = new AlertScheduler();

module.exports = alertScheduler;
