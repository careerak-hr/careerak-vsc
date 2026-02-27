/**
 * 🕐 Daily Recommendation Cron Job
 * مهمة جدولة التحديث اليومي للتوصيات
 * 
 * تشغيل تلقائي يومياً في الساعة 2:00 صباحاً
 * لتوليد توصيات جديدة لجميع المستخدمين النشطين
 * 
 * المتطلبات: 7.2 (تحديث يومي للتوصيات)
 * Task: 12.2 تحديث يومي
 */

const cron = require('node-cron');
const dailyRecommendationService = require('../services/dailyRecommendationService');

class DailyRecommendationCron {
  constructor() {
    this.cronJob = null;
    this.isScheduled = false;
    this.schedule = '0 2 * * *'; // كل يوم في الساعة 2:00 صباحاً
    this.timezone = 'Africa/Cairo'; // توقيت القاهرة
  }

  /**
   * بدء جدولة التحديث اليومي
   * @param {Object} options - خيارات الجدولة
   */
  start(options = {}) {
    if (this.isScheduled) {
      console.log('⚠️ التحديث اليومي مجدول بالفعل');
      return;
    }

    try {
      // استخدام الجدول المخصص إذا تم توفيره
      const schedule = options.schedule || this.schedule;
      const timezone = options.timezone || this.timezone;

      console.log('🕐 بدء جدولة التحديث اليومي للتوصيات...');
      console.log(`📅 الجدول: ${schedule} (${timezone})`);

      this.cronJob = cron.schedule(
        schedule,
        async () => {
          console.log('\n═══════════════════════════════════════════════════════');
          console.log('🔔 تشغيل التحديث اليومي المجدول للتوصيات');
          console.log(`⏰ الوقت: ${new Date().toLocaleString('ar-EG')}`);
          console.log('═══════════════════════════════════════════════════════\n');

          try {
            const result = await dailyRecommendationService.runDailyUpdate({
              lastActiveWithinDays: 30, // المستخدمون النشطون خلال آخر 30 يوم
              minProfileCompleteness: 30, // اكتمال الملف الشخصي 30% على الأقل
              batchSize: 10, // معالجة 10 مستخدمين في كل دفعة
              maxUsers: 1000 // حد أقصى 1000 مستخدم
            });

            if (result.success) {
              console.log('\n✅ اكتمل التحديث اليومي المجدول بنجاح');
              console.log(`📊 الإحصائيات:`);
              console.log(`   - المستخدمون المعالجون: ${result.stats.processedUsers}`);
              console.log(`   - إجمالي التوصيات: ${result.stats.totalRecommendations}`);
              console.log(`   - المدة: ${Math.round(result.stats.duration / 1000)} ثانية`);
            } else {
              console.error('\n❌ فشل التحديث اليومي المجدول');
              console.error(`   الخطأ: ${result.error || result.message}`);
            }

          } catch (error) {
            console.error('\n❌ خطأ في تنفيذ التحديث اليومي المجدول:', error);
          }

          console.log('\n═══════════════════════════════════════════════════════\n');
        },
        {
          scheduled: true,
          timezone
        }
      );

      this.isScheduled = true;
      console.log('✅ تم جدولة التحديث اليومي بنجاح');
      console.log(`ℹ️ التشغيل التالي: ${this.getNextRunTime()}`);

    } catch (error) {
      console.error('❌ خطأ في جدولة التحديث اليومي:', error);
      this.isScheduled = false;
    }
  }

  /**
   * إيقاف جدولة التحديث اليومي
   */
  stop() {
    if (!this.isScheduled || !this.cronJob) {
      console.log('⚠️ التحديث اليومي غير مجدول');
      return;
    }

    try {
      this.cronJob.stop();
      this.isScheduled = false;
      console.log('✅ تم إيقاف جدولة التحديث اليومي');

    } catch (error) {
      console.error('❌ خطأ في إيقاف جدولة التحديث اليومي:', error);
    }
  }

  /**
   * تشغيل التحديث يدوياً (للاختبار)
   */
  async runManually(options = {}) {
    console.log('🔧 تشغيل التحديث اليومي يدوياً...');

    try {
      const result = await dailyRecommendationService.runDailyUpdate({
        lastActiveWithinDays: options.lastActiveWithinDays || 30,
        minProfileCompleteness: options.minProfileCompleteness || 30,
        batchSize: options.batchSize || 10,
        maxUsers: options.maxUsers || 1000
      });

      return result;

    } catch (error) {
      console.error('❌ خطأ في التشغيل اليدوي:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * الحصول على وقت التشغيل التالي
   * @returns {string} - وقت التشغيل التالي
   */
  getNextRunTime() {
    if (!this.isScheduled) {
      return 'غير مجدول';
    }

    // حساب وقت التشغيل التالي بناءً على الجدول
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 2:00 صباحاً

    return tomorrow.toLocaleString('ar-EG');
  }

  /**
   * الحصول على حالة الجدولة
   * @returns {Object} - حالة الجدولة
   */
  getStatus() {
    return {
      isScheduled: this.isScheduled,
      schedule: this.schedule,
      timezone: this.timezone,
      nextRunTime: this.getNextRunTime(),
      serviceStatus: dailyRecommendationService.getStatus()
    };
  }
}

// إنشاء نسخة واحدة من Cron Job (Singleton)
const dailyRecommendationCron = new DailyRecommendationCron();

module.exports = dailyRecommendationCron;
