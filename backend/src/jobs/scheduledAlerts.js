const cron = require('node-cron');
const alertService = require('../services/alertService');
const logger = require('../utils/logger');

/**
 * جدولة التنبيهات اليومية والأسبوعية
 */
class ScheduledAlerts {
  constructor() {
    this.dailyJob = null;
    this.weeklyJob = null;
  }

  /**
   * بدء جميع المهام المجدولة
   */
  start() {
    this.startDailyAlerts();
    this.startWeeklyAlerts();
    logger.info('✅ Scheduled alerts jobs started');
  }

  /**
   * إيقاف جميع المهام المجدولة
   */
  stop() {
    if (this.dailyJob) {
      this.dailyJob.stop();
      logger.info('⏹️ Daily alerts job stopped');
    }
    if (this.weeklyJob) {
      this.weeklyJob.stop();
      logger.info('⏹️ Weekly alerts job stopped');
    }
  }

  /**
   * جدولة التنبيهات اليومية
   * تعمل كل يوم في الساعة 9 صباحاً
   */
  startDailyAlerts() {
    // Cron expression: '0 9 * * *' = كل يوم في الساعة 9:00 صباحاً
    this.dailyJob = cron.schedule('0 9 * * *', async () => {
      try {
        logger.info('🔔 Running daily alerts...');
        await alertService.runScheduledAlerts('daily');
        logger.info('✅ Daily alerts completed');
      } catch (error) {
        logger.error('❌ Error running daily alerts:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    logger.info('📅 Daily alerts scheduled for 9:00 AM UTC');
  }

  /**
   * جدولة التنبيهات الأسبوعية
   * تعمل كل يوم إثنين في الساعة 9 صباحاً
   */
  startWeeklyAlerts() {
    // Cron expression: '0 9 * * 1' = كل يوم إثنين في الساعة 9:00 صباحاً
    this.weeklyJob = cron.schedule('0 9 * * 1', async () => {
      try {
        logger.info('🔔 Running weekly alerts...');
        await alertService.runScheduledAlerts('weekly');
        logger.info('✅ Weekly alerts completed');
      } catch (error) {
        logger.error('❌ Error running weekly alerts:', error);
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    logger.info('📅 Weekly alerts scheduled for Mondays at 9:00 AM UTC');
  }

  /**
   * تشغيل يدوي للتنبيهات اليومية (للاختبار)
   */
  async runDailyNow() {
    try {
      logger.info('🔔 Manually running daily alerts...');
      await alertService.runScheduledAlerts('daily');
      logger.info('✅ Daily alerts completed');
    } catch (error) {
      logger.error('❌ Error running daily alerts:', error);
      throw error;
    }
  }

  /**
   * تشغيل يدوي للتنبيهات الأسبوعية (للاختبار)
   */
  async runWeeklyNow() {
    try {
      logger.info('🔔 Manually running weekly alerts...');
      await alertService.runScheduledAlerts('weekly');
      logger.info('✅ Weekly alerts completed');
    } catch (error) {
      logger.error('❌ Error running weekly alerts:', error);
      throw error;
    }
  }
}

module.exports = new ScheduledAlerts();
