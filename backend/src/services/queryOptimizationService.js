/**
 * Query Optimization Service
 * 
 * خدمة تحسين الاستعلامات لنظام التوصيات
 * - استعلامات محسّنة مع indexes
 * - batch processing
 * - pagination
 * - projection (تحديد الحقول المطلوبة فقط)
 * 
 * @module services/queryOptimizationService
 */

const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const UserInteraction = require('../models/UserInteraction');
const Recommendation = require('../models/Recommendation');

class QueryOptimizationService {
  /**
   * جلب مستخدمين بشكل محسّن
   */
  async getOptimizedUsers(filters = {}, options = {}) {
    const {
      role = 'jobseeker',
      hasSkills = true,
      limit = 100,
      skip = 0,
      fields = 'profile preferences'
    } = options;

    try {
      const query = { role };

      if (hasSkills) {
        query['profile.skills'] = { $exists: true, $ne: [] };
      }

      // إضافة فلاتر إضافية
      Object.assign(query, filters);

      const users = await User.find(query)
        .select(fields)
        .limit(limit)
        .skip(skip)
        .lean() // استخدام lean() لتحسين الأداء
        .exec();

      return users;

    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      throw error;
    }
  }

  /**
   * جلب وظائف بشكل محسّن
   */
  async getOptimizedJobs(filters = {}, options = {}) {
    const {
      status = 'active',
      limit = 100,
      skip = 0,
      fields = 'title description requirements location salary workType company',
      sort = { createdAt: -1 }
    } = options;

    try {
      const query = { status };

      // إضافة فلاتر إضافية
      Object.assign(query, filters);

      const jobs = await JobPosting.find(query)
        .select(fields)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean()
        .exec();

      return jobs;

    } catch (error) {
      console.error('خطأ في جلب الوظائف:', error);
      throw error;
    }
  }

  /**
   * جلب تفاعلات بشكل محسّن
   */
  async getOptimizedInteractions(filters = {}, options = {}) {
    const {
      userId,
      itemType = 'job',
      limit = 100,
      skip = 0,
      fields = 'userId itemId itemType action timestamp',
      sort = { timestamp: -1 }
    } = options;

    try {
      const query = { itemType };

      if (userId) {
        query.userId = userId;
      }

      // إضافة فلاتر إضافية
      Object.assign(query, filters);

      const interactions = await UserInteraction.find(query)
        .select(fields)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean()
        .exec();

      return interactions;

    } catch (error) {
      console.error('خطأ في جلب التفاعلات:', error);
      throw error;
    }
  }

  /**
   * جلب توصيات بشكل محسّن
   */
  async getOptimizedRecommendations(filters = {}, options = {}) {
    const {
      userId,
      itemType = 'job',
      limit = 20,
      skip = 0,
      fields = 'userId itemId itemType score reasons createdAt',
      sort = { score: -1 }
    } = options;

    try {
      const query = { itemType };

      if (userId) {
        query.userId = userId;
      }

      // إضافة فلاتر إضافية
      Object.assign(query, filters);

      const recommendations = await Recommendation.find(query)
        .select(fields)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .lean()
        .exec();

      return recommendations;

    } catch (error) {
      console.error('خطأ في جلب التوصيات:', error);
      throw error;
    }
  }

  /**
   * معالجة دفعات (batch processing)
   */
  async processBatch(items, batchSize, processor) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * جلب مستخدمين مشابهين بشكل محسّن
   */
  async getSimilarUsersOptimized(userId, limit = 10) {
    try {
      // جلب ملف المستخدم
      const user = await User.findById(userId)
        .select('profile.skills profile.experience profile.education')
        .lean();

      if (!user || !user.profile) {
        return [];
      }

      // بناء استعلام للمستخدمين المشابهين
      const query = {
        _id: { $ne: userId },
        role: 'jobseeker',
        'profile.skills': { $in: user.profile.skills || [] }
      };

      // جلب المستخدمين المشابهين
      const similarUsers = await User.find(query)
        .select('_id profile.skills profile.experience')
        .limit(limit * 2) // جلب ضعف العدد للتصفية
        .lean();

      // حساب التشابه وترتيب
      const scored = similarUsers.map(u => ({
        userId: u._id,
        similarity: this.calculateSimilarity(user.profile, u.profile)
      }));

      // ترتيب وإرجاع أفضل النتائج
      return scored
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('خطأ في جلب المستخدمين المشابهين:', error);
      throw error;
    }
  }

  /**
   * حساب التشابه بين ملفين
   */
  calculateSimilarity(profile1, profile2) {
    let similarity = 0;

    // تشابه المهارات
    const skills1 = new Set(profile1.skills || []);
    const skills2 = new Set(profile2.skills || []);
    const commonSkills = [...skills1].filter(s => skills2.has(s));
    const skillSimilarity = commonSkills.length / Math.max(skills1.size, skills2.size);
    similarity += skillSimilarity * 0.7;

    // تشابه الخبرة
    const exp1 = profile1.experience?.years || 0;
    const exp2 = profile2.experience?.years || 0;
    const expDiff = Math.abs(exp1 - exp2);
    const expSimilarity = Math.max(0, 1 - expDiff / 10);
    similarity += expSimilarity * 0.3;

    return similarity;
  }

  /**
   * جلب وظائف شائعة بشكل محسّن
   */
  async getPopularJobsOptimized(limit = 20) {
    try {
      // استخدام aggregation pipeline للأداء الأفضل
      const popularJobs = await UserInteraction.aggregate([
        {
          $match: {
            itemType: 'job',
            action: { $in: ['view', 'like', 'apply'] }
          }
        },
        {
          $group: {
            _id: '$itemId',
            count: { $sum: 1 },
            applies: {
              $sum: { $cond: [{ $eq: ['$action', 'apply'] }, 1, 0] }
            }
          }
        },
        {
          $sort: { applies: -1, count: -1 }
        },
        {
          $limit: limit
        }
      ]);

      // جلب تفاصيل الوظائف
      const jobIds = popularJobs.map(j => j._id);
      const jobs = await JobPosting.find({
        _id: { $in: jobIds },
        status: 'active'
      })
        .select('title description requirements location salary company')
        .lean();

      // دمج البيانات
      return jobs.map(job => {
        const stats = popularJobs.find(p => p._id.toString() === job._id.toString());
        return {
          ...job,
          popularity: stats ? stats.count : 0,
          applies: stats ? stats.applies : 0
        };
      });

    } catch (error) {
      console.error('خطأ في جلب الوظائف الشائعة:', error);
      throw error;
    }
  }

  /**
   * إنشاء indexes محسّنة
   */
  async createOptimizedIndexes() {
    try {
      console.log('🔧 إنشاء indexes محسّنة...');

      // User indexes
      await User.collection.createIndex({ role: 1, 'profile.skills': 1 });
      await User.collection.createIndex({ 'profile.experience.years': 1 });
      await User.collection.createIndex({ 'profile.location': 1 });

      // JobPosting indexes
      await JobPosting.collection.createIndex({ status: 1, createdAt: -1 });
      await JobPosting.collection.createIndex({ 'requirements.skills': 1 });
      await JobPosting.collection.createIndex({ location: 1, status: 1 });
      await JobPosting.collection.createIndex({ company: 1, status: 1 });

      // UserInteraction indexes
      await UserInteraction.collection.createIndex({ userId: 1, itemType: 1, timestamp: -1 });
      await UserInteraction.collection.createIndex({ itemId: 1, action: 1 });
      await UserInteraction.collection.createIndex({ timestamp: -1 });

      // Recommendation indexes
      await Recommendation.collection.createIndex({ userId: 1, itemType: 1, score: -1 });
      await Recommendation.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index

      console.log('✅ تم إنشاء جميع indexes بنجاح');

    } catch (error) {
      console.error('خطأ في إنشاء indexes:', error);
      throw error;
    }
  }

  /**
   * تحليل أداء الاستعلامات
   */
  async analyzeQueryPerformance(query, collection) {
    try {
      const explain = await collection.find(query).explain('executionStats');

      return {
        executionTimeMs: explain.executionStats.executionTimeMs,
        totalDocsExamined: explain.executionStats.totalDocsExamined,
        totalKeysExamined: explain.executionStats.totalKeysExamined,
        nReturned: explain.executionStats.nReturned,
        indexUsed: explain.executionStats.executionStages.indexName || 'COLLSCAN'
      };

    } catch (error) {
      console.error('خطأ في تحليل أداء الاستعلام:', error);
      throw error;
    }
  }
}

module.exports = new QueryOptimizationService();
