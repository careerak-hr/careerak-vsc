const cron = require('node-cron');
const InterviewRecording = require('../models/InterviewRecording');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

/**
 * Cron Job للحذف التلقائي للتسجيلات المنتهية
 * يعمل يومياً في الساعة 2:00 صباحاً
 */

class RecordingCleanupCron {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.stats = {
      totalRuns: 0,
      totalDeleted: 0,
      totalErrors: 0,
      lastRunStats: null
    };
  }

  /**
   * حذف ملف من Cloudinary
   */
  async deleteFromCloudinary(fileUrl) {
    try {
      // استخراج public_id من URL
      const urlParts = fileUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split('.')[0];
      
      // حذف من Cloudinary
      await cloudinary.uploader.destroy(`careerak/recordings/${publicId}`, {
        resource_type: 'video'
      });
      
      return true;
    } catch (error) {
      logger.error('Error deleting from Cloudinary:', error);
      return false;
    }
  }

  /**
   * حذف تسجيل واحد
   */
  async deleteRecording(recording) {
    try {
      // حذف الملف من التخزين السحابي
      if (recording.fileUrl) {
        await this.deleteFromCloudinary(recording.fileUrl);
      }

      // حذف الصورة المصغرة
      if (recording.thumbnailUrl) {
        await this.deleteFromCloudinary(recording.thumbnailUrl);
      }

      // تحديث حالة التسجيل
      recording.status = 'deleted';
      recording.deletedAt = new Date();
      recording.deletionReason = 'auto_expired';
      await recording.save();

      logger.info(`Recording deleted: ${recording.recordingId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting recording ${recording.recordingId}:`, error);
      return false;
    }
  }

  /**
   * تنفيذ عملية التنظيف
   */
  async cleanup() {
    if (this.isRunning) {
      logger.warn('Cleanup already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    logger.info('Starting recording cleanup job...');

    try {
      // الحصول على التسجيلات المنتهية
      const expiredRecordings = await InterviewRecording.findExpired();
      
      logger.info(`Found ${expiredRecordings.length} expired recordings`);

      let deletedCount = 0;
      let errorCount = 0;

      // حذف كل تسجيل
      for (const recording of expiredRecordings) {
        const success = await this.deleteRecording(recording);
        if (success) {
          deletedCount++;
        } else {
          errorCount++;
        }
      }

      // تحديث الإحصائيات
      const duration = Date.now() - startTime;
      this.stats.totalRuns++;
      this.stats.totalDeleted += deletedCount;
      this.stats.totalErrors += errorCount;
      this.stats.lastRunStats = {
        timestamp: new Date(),
        duration,
        found: expiredRecordings.length,
        deleted: deletedCount,
        errors: errorCount
      };
      this.lastRun = new Date();

      logger.info(`Cleanup completed: ${deletedCount} deleted, ${errorCount} errors, ${duration}ms`);
    } catch (error) {
      logger.error('Error in cleanup job:', error);
      this.stats.totalErrors++;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * إرسال تنبيه للتسجيلات التي ستنتهي قريباً
   */
  async notifyExpiringSoon(daysAhead = 7) {
    try {
      const expiringSoon = await InterviewRecording.findExpiringSoon(daysAhead);
      
      if (expiringSoon.length > 0) {
        logger.info(`${expiringSoon.length} recordings expiring in ${daysAhead} days`);
        
        // يمكن إضافة إرسال إشعارات للمستخدمين هنا
        // await notificationService.sendExpiryWarning(expiringSoon);
      }
    } catch (error) {
      logger.error('Error checking expiring recordings:', error);
    }
  }

  /**
   * بدء Cron Job
   */
  start() {
    // يعمل يومياً في الساعة 2:00 صباحاً
    this.dailyJob = cron.schedule('0 2 * * *', async () => {
      await this.cleanup();
    });

    // يعمل أسبوعياً (الأحد 10:00 صباحاً) للتحقق من التسجيلات التي ستنتهي
    this.weeklyJob = cron.schedule('0 10 * * 0', async () => {
      await this.notifyExpiringSoon(7);
    });

    logger.info('Recording cleanup cron jobs started');
    logger.info('- Daily cleanup: 2:00 AM');
    logger.info('- Weekly expiry check: Sunday 10:00 AM');
  }

  /**
   * إيقاف Cron Job
   */
  stop() {
    if (this.dailyJob) {
      this.dailyJob.stop();
    }
    if (this.weeklyJob) {
      this.weeklyJob.stop();
    }
    logger.info('Recording cleanup cron jobs stopped');
  }

  /**
   * تشغيل يدوي للتنظيف
   */
  async runManually() {
    logger.info('Manual cleanup triggered');
    await this.cleanup();
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastRun: this.lastRun
    };
  }
}

// إنشاء instance واحد
const recordingCleanupCron = new RecordingCleanupCron();

module.exports = recordingCleanupCron;
