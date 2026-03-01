/**
 * Recommendation Cache Service
 * 
 * خدمة التخزين المؤقت للتوصيات
 * - تخزين مؤقت ذكي للتوصيات
 * - تحديث تلقائي عند تغيير الملف الشخصي
 * - إدارة ذاكرة التخزين المؤقت
 * 
 * @module services/recommendationCacheService
 */

const redisCache = require('./redisCache');

class RecommendationCacheService {
  constructor() {
    // مدة التخزين المؤقت (بالثواني)
    this.cacheDuration = {
      recommendations: 3600,      // ساعة واحدة
      userProfile: 1800,          // 30 دقيقة
      jobDetails: 7200,           // ساعتان
      similarUsers: 3600,         // ساعة واحدة
      userItemMatrix: 7200        // ساعتان
    };
  }

  /**
   * الحصول على توصيات من الذاكرة المؤقتة
   */
  async getRecommendations(userId, itemType = 'job', limit = 10) {
    try {
      const cacheKey = this.generateCacheKey('recommendations', userId, itemType, limit);
      const cached = await redisCache.get(cacheKey);

      if (cached) {
        console.log(`✅ Cache HIT: توصيات ${itemType} للمستخدم ${userId}`);
        return JSON.parse(cached);
      }

      console.log(`❌ Cache MISS: توصيات ${itemType} للمستخدم ${userId}`);
      return null;

    } catch (error) {
      console.error('خطأ في جلب التوصيات من الذاكرة المؤقتة:', error);
      return null;
    }
  }

  /**
   * حفظ توصيات في الذاكرة المؤقتة
   */
  async setRecommendations(userId, itemType, limit, recommendations) {
    try {
      const cacheKey = this.generateCacheKey('recommendations', userId, itemType, limit);
      await redisCache.set(
        cacheKey,
        JSON.stringify(recommendations),
        this.cacheDuration.recommendations
      );

      console.log(`💾 تم حفظ توصيات ${itemType} للمستخدم ${userId} في الذاكرة المؤقتة`);

    } catch (error) {
      console.error('خطأ في حفظ التوصيات في الذاكرة المؤقتة:', error);
    }
  }

  /**
   * حذف توصيات من الذاكرة المؤقتة
   */
  async invalidateRecommendations(userId, itemType = null) {
    try {
      if (itemType) {
        // حذف نوع محدد
        const pattern = this.generateCacheKey('recommendations', userId, itemType, '*');
        await redisCache.deletePattern(pattern);
        console.log(`🗑️  تم حذف توصيات ${itemType} للمستخدم ${userId}`);
      } else {
        // حذف جميع التوصيات
        const pattern = this.generateCacheKey('recommendations', userId, '*', '*');
        await redisCache.deletePattern(pattern);
        console.log(`🗑️  تم حذف جميع توصيات المستخدم ${userId}`);
      }

    } catch (error) {
      console.error('خطأ في حذف التوصيات من الذاكرة المؤقتة:', error);
    }
  }

  /**
   * الحصول على ملف مستخدم من الذاكرة المؤقتة
   */
  async getUserProfile(userId) {
    try {
      const cacheKey = this.generateCacheKey('userProfile', userId);
      const cached = await redisCache.get(cacheKey);

      if (cached) {
        console.log(`✅ Cache HIT: ملف المستخدم ${userId}`);
        return JSON.parse(cached);
      }

      console.log(`❌ Cache MISS: ملف المستخدم ${userId}`);
      return null;

    } catch (error) {
      console.error('خطأ في جلب ملف المستخدم من الذاكرة المؤقتة:', error);
      return null;
    }
  }

  /**
   * حفظ ملف مستخدم في الذاكرة المؤقتة
   */
  async setUserProfile(userId, profile) {
    try {
      const cacheKey = this.generateCacheKey('userProfile', userId);
      await redisCache.set(
        cacheKey,
        JSON.stringify(profile),
        this.cacheDuration.userProfile
      );

      console.log(`💾 تم حفظ ملف المستخدم ${userId} في الذاكرة المؤقتة`);

    } catch (error) {
      console.error('خطأ في حفظ ملف المستخدم في الذاكرة المؤقتة:', error);
    }
  }

  /**
   * حذف ملف مستخدم من الذاكرة المؤقتة
   */
  async invalidateUserProfile(userId) {
    try {
      const cacheKey = this.generateCacheKey('userProfile', userId);
      await redisCache.del(cacheKey);
      
      // حذف التوصيات أيضاً
      await this.invalidateRecommendations(userId);

      console.log(`🗑️  تم حذف ملف المستخدم ${userId} من الذاكرة المؤقتة`);

    } catch (error) {
      console.error('خطأ في حذف ملف المستخدم من الذاكرة المؤقتة:', error);
    }
  }

  /**
   * الحصول على تفاصيل وظيفة من الذاكرة المؤقتة
   */
  async getJobDetails(jobId) {
    try {
      const cacheKey = this.generateCacheKey('jobDetails', jobId);
      const cached = await redisCache.get(cacheKey);

      if (cached) {
        console.log(`✅ Cache HIT: تفاصيل الوظيفة ${jobId}`);
        return JSON.parse(cached);
      }

      console.log(`❌ Cache MISS: تفاصيل الوظيفة ${jobId}`);
      return null;

    } catch (error) {
      console.error('خطأ في جلب تفاصيل الوظيفة من الذاكرة المؤقتة:', error);
      return null;
    }
  }

  /**
   * حفظ تفاصيل وظيفة في الذاكرة المؤقتة
   */
  async setJobDetails(jobId, details) {
    try {
      const cacheKey = this.generateCacheKey('jobDetails', jobId);
      await redisCache.set(
        cacheKey,
        JSON.stringify(details),
        this.cacheDuration.jobDetails
      );

      console.log(`💾 تم حفظ تفاصيل الوظيفة ${jobId} في الذاكرة المؤقتة`);

    } catch (error) {
      console.error('خطأ في حفظ تفاصيل الوظيفة في الذاكرة المؤقتة:', error);
    }
  }

  /**
   * حذف تفاصيل وظيفة من الذاكرة المؤقتة
   */
  async invalidateJobDetails(jobId) {
    try {
      const cacheKey = this.generateCacheKey('jobDetails', jobId);
      await redisCache.del(cacheKey);

      console.log(`🗑️  تم حذف تفاصيل الوظيفة ${jobId} من الذاكرة المؤقتة`);

    } catch (error) {
      console.error('خطأ في حذف تفاصيل الوظيفة من الذاكرة المؤقتة:', error);
    }
  }

  /**
   * الحصول على مستخدمين مشابهين من الذاكرة المؤقتة
   */
  async getSimilarUsers(userId, limit = 10) {
    try {
      const cacheKey = this.generateCacheKey('similarUsers', userId, limit);
      const cached = await redisCache.get(cacheKey);

      if (cached) {
        console.log(`✅ Cache HIT: مستخدمين مشابهين للمستخدم ${userId}`);
        return JSON.parse(cached);
      }

      console.log(`❌ Cache MISS: مستخدمين مشابهين للمستخدم ${userId}`);
      return null;

    } catch (error) {
      console.error('خطأ في جلب المستخدمين المشابهين من الذاكرة المؤقتة:', error);
      return null;
    }
  }

  /**
   * حفظ مستخدمين مشابهين في الذاكرة المؤقتة
   */
  async setSimilarUsers(userId, limit, similarUsers) {
    try {
      const cacheKey = this.generateCacheKey('similarUsers', userId, limit);
      await redisCache.set(
        cacheKey,
        JSON.stringify(similarUsers),
        this.cacheDuration.similarUsers
      );

      console.log(`💾 تم حفظ المستخدمين المشابهين للمستخدم ${userId} في الذاكرة المؤقتة`);

    } catch (error) {
      console.error('خطأ في حفظ المستخدمين المشابهين في الذاكرة المؤقتة:', error);
    }
  }

  /**
   * الحصول على user-item matrix من الذاكرة المؤقتة
   */
  async getUserItemMatrix() {
    try {
      const cacheKey = this.generateCacheKey('userItemMatrix');
      const cached = await redisCache.get(cacheKey);

      if (cached) {
        console.log(`✅ Cache HIT: user-item matrix`);
        return JSON.parse(cached);
      }

      console.log(`❌ Cache MISS: user-item matrix`);
      return null;

    } catch (error) {
      console.error('خطأ في جلب user-item matrix من الذاكرة المؤقتة:', error);
      return null;
    }
  }

  /**
   * حفظ user-item matrix في الذاكرة المؤقتة
   */
  async setUserItemMatrix(matrix) {
    try {
      const cacheKey = this.generateCacheKey('userItemMatrix');
      await redisCache.set(
        cacheKey,
        JSON.stringify(matrix),
        this.cacheDuration.userItemMatrix
      );

      console.log(`💾 تم حفظ user-item matrix في الذاكرة المؤقتة`);

    } catch (error) {
      console.error('خطأ في حفظ user-item matrix في الذاكرة المؤقتة:', error);
    }
  }

  /**
   * حذف user-item matrix من الذاكرة المؤقتة
   */
  async invalidateUserItemMatrix() {
    try {
      const cacheKey = this.generateCacheKey('userItemMatrix');
      await redisCache.del(cacheKey);

      console.log(`🗑️  تم حذف user-item matrix من الذاكرة المؤقتة`);

    } catch (error) {
      console.error('خطأ في حذف user-item matrix من الذاكرة المؤقتة:', error);
    }
  }

  /**
   * توليد مفتاح الذاكرة المؤقتة
   */
  generateCacheKey(...parts) {
    return `careerak:recommendations:${parts.join(':')}`;
  }

  /**
   * الحصول على إحصائيات الذاكرة المؤقتة
   */
  async getCacheStats() {
    try {
      const stats = {
        recommendations: 0,
        userProfiles: 0,
        jobDetails: 0,
        similarUsers: 0,
        userItemMatrix: 0,
        total: 0
      };

      // حساب عدد المفاتيح لكل نوع
      const patterns = {
        recommendations: 'careerak:recommendations:recommendations:*',
        userProfiles: 'careerak:recommendations:userProfile:*',
        jobDetails: 'careerak:recommendations:jobDetails:*',
        similarUsers: 'careerak:recommendations:similarUsers:*',
        userItemMatrix: 'careerak:recommendations:userItemMatrix'
      };

      for (const [type, pattern] of Object.entries(patterns)) {
        const keys = await redisCache.keys(pattern);
        stats[type] = keys ? keys.length : 0;
        stats.total += stats[type];
      }

      return stats;

    } catch (error) {
      console.error('خطأ في جلب إحصائيات الذاكرة المؤقتة:', error);
      return null;
    }
  }

  /**
   * مسح جميع الذاكرة المؤقتة
   */
  async clearAllCache() {
    try {
      const pattern = 'careerak:recommendations:*';
      await redisCache.deletePattern(pattern);

      console.log(`🗑️  تم مسح جميع الذاكرة المؤقتة للتوصيات`);

    } catch (error) {
      console.error('خطأ في مسح الذاكرة المؤقتة:', error);
    }
  }

  /**
   * تحديث مدة التخزين المؤقت
   */
  setCacheDuration(type, duration) {
    if (this.cacheDuration.hasOwnProperty(type)) {
      this.cacheDuration[type] = duration;
      console.log(`⚙️  تم تحديث مدة التخزين المؤقت لـ ${type}: ${duration}s`);
    }
  }
}

module.exports = new RecommendationCacheService();
