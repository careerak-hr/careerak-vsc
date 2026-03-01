const cron = require('node-cron');
const notificationService = require('../services/notificationService');
const NotificationPreference = require('../models/NotificationPreference');
const logger = require('../utils/logger');

/**
 * Cron Job لإرسال الإشعارات المجمعة تلقائياً
 * 
 * الجدول الزمني:
 * - كل ساعة: للمستخدمين الذين اختاروا 'hourly'
 * - يومياً الساعة 9 صباحاً: للمستخدمين الذين اختاروا 'daily'
 * - أسبوعياً الإثنين الساعة 9 صباحاً: للمستخدمين الذين اختاروا 'weekly'
 */

class BatchNotificationCron {
  
  constructor() {
    this.jobs = [];
  }
  
  // بدء جميع Cron Jobs
  start() {
    logger.info('Starting batch notification cron jobs...');
    
    // كل ساعة (في الدقيقة 0)
    this.jobs.push(
      cron.schedule('0 * * * *', () => {
        this.sendHourlyBatch();
      })
    );
    
    // يومياً الساعة 9 صباحاً
    this.jobs.push(
      cron.schedule('0 9 * * *', () => {
        this.sendDailyBatch();
      })
    );
    
    // أسبوعياً الإثنين الساعة 9 صباحاً
    this.jobs.push(
      cron.schedule('0 9 * * 1', () => {
        this.sendWeeklyBatch();
      })
    );
    
    logger.info('Batch notification cron jobs started successfully');
  }
  
  // إيقاف جميع Cron Jobs
  stop() {
    logger.info('Stopping batch notification cron jobs...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    logger.info('Batch notification cron jobs stopped');
  }
  
  // إرسال الإشعارات المجمعة كل ساعة
  async sendHourlyBatch() {
    try {
      logger.info('Running hourly batch notification job...');
      
      // البحث عن المستخدمين الذين اختاروا 'hourly'
      const users = await NotificationPreference.find({
        $or: [
          { 'notificationFrequency.recommendations': 'hourly' },
          { 'notificationFrequency.applications': 'hourly' }
        ]
      }).select('user notificationFrequency');
      
      logger.info(`Found ${users.length} users with hourly frequency`);
      
      for (const userPref of users) {
        try {
          // إرسال إشعارات التوصيات إذا كانت hourly
          if (userPref.notificationFrequency.recommendations === 'hourly') {
            await notificationService.sendBatchNotifications(userPref.user, 'recommendations');
          }
          
          // إرسال إشعارات التطبيقات إذا كانت hourly
          if (userPref.notificationFrequency.applications === 'hourly') {
            await notificationService.sendBatchNotifications(userPref.user, 'applications');
          }
        } catch (error) {
          logger.error(`Error sending hourly batch for user ${userPref.user}:`, error);
        }
      }
      
      logger.info('Hourly batch notification job completed');
      
    } catch (error) {
      logger.error('Error in hourly batch notification job:', error);
    }
  }
  
  // إرسال الإشعارات المجمعة يومياً
  async sendDailyBatch() {
    try {
      logger.info('Running daily batch notification job...');
      
      // البحث عن المستخدمين الذين اختاروا 'daily'
      const users = await NotificationPreference.find({
        $or: [
          { 'notificationFrequency.recommendations': 'daily' },
          { 'notificationFrequency.applications': 'daily' },
          { 'notificationFrequency.system': 'daily' }
        ]
      }).select('user notificationFrequency');
      
      logger.info(`Found ${users.length} users with daily frequency`);
      
      for (const userPref of users) {
        try {
          // إرسال إشعارات التوصيات إذا كانت daily
          if (userPref.notificationFrequency.recommendations === 'daily') {
            await notificationService.sendBatchNotifications(userPref.user, 'recommendations');
          }
          
          // إرسال إشعارات التطبيقات إذا كانت daily
          if (userPref.notificationFrequency.applications === 'daily') {
            await notificationService.sendBatchNotifications(userPref.user, 'applications');
          }
          
          // إرسال إشعارات النظام إذا كانت daily
          if (userPref.notificationFrequency.system === 'daily') {
            await notificationService.sendBatchNotifications(userPref.user, 'system');
          }
        } catch (error) {
          logger.error(`Error sending daily batch for user ${userPref.user}:`, error);
        }
      }
      
      logger.info('Daily batch notification job completed');
      
    } catch (error) {
      logger.error('Error in daily batch notification job:', error);
    }
  }
  
  // إرسال الإشعارات المجمعة أسبوعياً
  async sendWeeklyBatch() {
    try {
      logger.info('Running weekly batch notification job...');
      
      // البحث عن المستخدمين الذين اختاروا 'weekly'
      const users = await NotificationPreference.find({
        $or: [
          { 'notificationFrequency.recommendations': 'weekly' },
          { 'notificationFrequency.system': 'weekly' }
        ]
      }).select('user notificationFrequency');
      
      logger.info(`Found ${users.length} users with weekly frequency`);
      
      for (const userPref of users) {
        try {
          // إرسال إشعارات التوصيات إذا كانت weekly
          if (userPref.notificationFrequency.recommendations === 'weekly') {
            await notificationService.sendBatchNotifications(userPref.user, 'recommendations');
          }
          
          // إرسال إشعارات النظام إذا كانت weekly
          if (userPref.notificationFrequency.system === 'weekly') {
            await notificationService.sendBatchNotifications(userPref.user, 'system');
          }
        } catch (error) {
          logger.error(`Error sending weekly batch for user ${userPref.user}:`, error);
        }
      }
      
      logger.info('Weekly batch notification job completed');
      
    } catch (error) {
      logger.error('Error in weekly batch notification job:', error);
    }
  }
  
  // إرسال يدوي لجميع الإشعارات المجمعة (للاختبار)
  async sendAllBatches() {
    logger.info('Manually sending all batch notifications...');
    await this.sendHourlyBatch();
    await this.sendDailyBatch();
    await this.sendWeeklyBatch();
    logger.info('All batch notifications sent');
  }
}

// إنشاء instance واحد
const batchNotificationCron = new BatchNotificationCron();

module.exports = batchNotificationCron;
