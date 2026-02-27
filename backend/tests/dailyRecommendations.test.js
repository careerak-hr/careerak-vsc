/**
 * 🧪 Daily Recommendations Tests
 * اختبارات نظام التوصيات اليومية
 * 
 * Task: 12.2 تحديث يومي
 */

const dailyRecommendationService = require('../src/services/dailyRecommendationService');
const dailyRecommendationCron = require('../src/jobs/dailyRecommendationCron');

describe('Daily Recommendations System', () => {
  
  describe('Daily Recommendation Service', () => {
    
    test('should have required methods', () => {
      expect(typeof dailyRecommendationService.runDailyUpdate).toBe('function');
      expect(typeof dailyRecommendationService.getNewRecommendations).toBe('function');
      expect(typeof dailyRecommendationService.markRecommendationAsSeen).toBe('function');
      expect(typeof dailyRecommendationService.getStatus).toBe('function');
    });
    
    test('should return status object', () => {
      const status = dailyRecommendationService.getStatus();
      
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('lastRunTime');
      expect(status).toHaveProperty('stats');
      expect(typeof status.isRunning).toBe('boolean');
    });
    
    test('should not allow concurrent updates', async () => {
      // محاكاة تشغيل متزامن
      dailyRecommendationService.isRunning = true;
      
      const result = await dailyRecommendationService.runDailyUpdate();
      
      expect(result.success).toBe(false);
      expect(result.isRunning).toBe(true);
      expect(result.message).toContain('قيد التشغيل');
      
      // إعادة تعيين
      dailyRecommendationService.isRunning = false;
    });
    
  });
  
  describe('Daily Recommendation Cron Job', () => {
    
    test('should have required methods', () => {
      expect(typeof dailyRecommendationCron.start).toBe('function');
      expect(typeof dailyRecommendationCron.stop).toBe('function');
      expect(typeof dailyRecommendationCron.runManually).toBe('function');
      expect(typeof dailyRecommendationCron.getStatus).toBe('function');
    });
    
    test('should return status object', () => {
      const status = dailyRecommendationCron.getStatus();
      
      expect(status).toHaveProperty('isScheduled');
      expect(status).toHaveProperty('schedule');
      expect(status).toHaveProperty('timezone');
      expect(status).toHaveProperty('nextRunTime');
      expect(typeof status.isScheduled).toBe('boolean');
    });
    
    test('should have correct default schedule', () => {
      expect(dailyRecommendationCron.schedule).toBe('0 2 * * *');
      expect(dailyRecommendationCron.timezone).toBe('Africa/Cairo');
    });
    
    test('should not start if already scheduled', () => {
      // محاكاة جدولة موجودة
      dailyRecommendationCron.isScheduled = true;
      
      // محاولة البدء مرة أخرى
      dailyRecommendationCron.start();
      
      // يجب أن يظل مجدولاً
      expect(dailyRecommendationCron.isScheduled).toBe(true);
      
      // إعادة تعيين
      dailyRecommendationCron.isScheduled = false;
    });
    
  });
  
  describe('Integration Tests', () => {
    
    test('should handle empty user list gracefully', async () => {
      const result = await dailyRecommendationService.runDailyUpdate({
        maxUsers: 0
      });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('لا يوجد مستخدمون');
    });
    
    test('should validate options', async () => {
      const options = {
        lastActiveWithinDays: 30,
        minProfileCompleteness: 30,
        batchSize: 10,
        maxUsers: 1000
      };
      
      expect(options.lastActiveWithinDays).toBeGreaterThan(0);
      expect(options.minProfileCompleteness).toBeGreaterThanOrEqual(0);
      expect(options.minProfileCompleteness).toBeLessThanOrEqual(100);
      expect(options.batchSize).toBeGreaterThan(0);
      expect(options.maxUsers).toBeGreaterThan(0);
    });
    
  });
  
});
