/**
 * 🤖 Daily Recommendation Service
 * خدمة التوصيات اليومية
 * 
 * توليد توصيات جديدة يومياً لجميع المستخدمين النشطين
 * مع قسم "جديد لك" في الصفحة الرئيسية
 * 
 * المتطلبات: 7.2, 7.3 (تحديث يومي للتوصيات، قسم "جديد لك")
 * Task: 12.2 تحديث يومي
 */

const ContentBasedFiltering = require('./contentBasedFiltering');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');

class DailyRecommendationService {
  constructor() {
    this.contentBasedFiltering = new ContentBasedFiltering();
    this.isRunning = false;
    this.lastRunTime = null;
    this.stats = {
      totalUsers: 0,
      processedUsers: 0,
      failedUsers: 0,
      totalRecommendations: 0,
      startTime: null,
      endTime: null,
      duration: null
    };
  }

  /**
   * تشغيل التحديث اليومي للتوصيات
   * @param {Object} options - خيارات التشغيل
   * @returns {Promise<Object>} - نتائج التحديث
   */
  async runDailyUpdate(options = {}) {
    if (this.isRunning) {
      console.log('⚠️ التحديث اليومي قيد التشغيل بالفعل');
      return {
        success: false,
        message: 'التحديث اليومي قيد التشغيل بالفعل',
        isRunning: true
      };
    }

    try {
      this.isRunning = true;
      this.stats.startTime = new Date();
      
      console.log('🚀 بدء التحديث اليومي للتوصيات...');
      console.log(`📅 التاريخ: ${this.stats.startTime.toLocaleString('ar-EG')}`);

      // 1. جلب المستخدمين النشطين
      const activeUsers = await this.getActiveUsers(options);
      this.stats.totalUsers = activeUsers.length;
      
      console.log(`👥 عدد المستخدمين النشطين: ${activeUsers.length}`);

      if (activeUsers.length === 0) {
        console.log('ℹ️ لا يوجد مستخدمون نشطون للمعالجة');
        return this.finishUpdate({
          success: true,
          message: 'لا يوجد مستخدمون نشطون للمعالجة'
        });
      }

      // 2. جلب الوظائف النشطة
      const activeJobs = await this.getActiveJobs();
      console.log(`💼 عدد الوظائف النشطة: ${activeJobs.length}`);

      if (activeJobs.length === 0) {
        console.log('ℹ️ لا توجد وظائف نشطة للمعالجة');
        return this.finishUpdate({
          success: true,
          message: 'لا توجد وظائف نشطة للمعالجة'
        });
      }

      // 3. معالجة كل مستخدم
      const batchSize = options.batchSize || 10;
      const results = await this.processUsersInBatches(activeUsers, activeJobs, batchSize);

      // 4. تجميع النتائج
      this.stats.processedUsers = results.filter(r => r.success).length;
      this.stats.failedUsers = results.filter(r => !r.success).length;
      this.stats.totalRecommendations = results.reduce((sum, r) => 
        sum + (r.recommendationsCount || 0), 0);

      console.log('✅ اكتمل التحديث اليومي للتوصيات');
      console.log(`📊 الإحصائيات:`);
      console.log(`   - المستخدمون المعالجون: ${this.stats.processedUsers}/${this.stats.totalUsers}`);
      console.log(`   - المستخدمون الفاشلون: ${this.stats.failedUsers}`);
      console.log(`   - إجمالي التوصيات: ${this.stats.totalRecommendations}`);

      return this.finishUpdate({
        success: true,
        message: 'تم تحديث التوصيات اليومية بنجاح',
        stats: { ...this.stats },
        results
      });

    } catch (error) {
      console.error('❌ خطأ في التحديث اليومي للتوصيات:', error);
      return this.finishUpdate({
        success: false,
        message: 'فشل التحديث اليومي للتوصيات',
        error: error.message
      });
    }
  }

  /**
   * جلب المستخدمين النشطين
   * @param {Object} options - خيارات الفلترة
   * @returns {Promise<Array>} - قائمة المستخدمين
   */
  async getActiveUsers(options = {}) {
    try {
      const query = {
        role: 'user', // فقط المستخدمون العاديون (ليس الشركات)
        isActive: true
      };

      // فلترة حسب آخر نشاط (اختياري)
      if (options.lastActiveWithinDays) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - options.lastActiveWithinDays);
        query.lastActive = { $gte: daysAgo };
      }

      // فلترة حسب اكتمال الملف الشخصي (اختياري)
      if (options.minProfileCompleteness) {
        query['profileCompleteness.percentage'] = { $gte: options.minProfileCompleteness };
      }

      const users = await User.find(query)
        .select('_id name email computerSkills softwareSkills otherSkills experienceList educationList city country')
        .limit(options.maxUsers || 1000) // حد أقصى 1000 مستخدم
        .lean();

      return users;

    } catch (error) {
      console.error('❌ خطأ في جلب المستخدمين النشطين:', error);
      return [];
    }
  }

  /**
   * جلب الوظائف النشطة
   * @returns {Promise<Array>} - قائمة الوظائف
   */
  async getActiveJobs() {
    try {
      const jobs = await JobPosting.find({
        status: 'active',
        expiresAt: { $gt: new Date() }
      })
        .populate('postedBy', 'companyName')
        .limit(500) // حد أقصى 500 وظيفة
        .lean();

      return jobs;

    } catch (error) {
      console.error('❌ خطأ في جلب الوظائف النشطة:', error);
      return [];
    }
  }

  /**
   * معالجة المستخدمين في دفعات
   * @param {Array} users - قائمة المستخدمين
   * @param {Array} jobs - قائمة الوظائف
   * @param {number} batchSize - حجم الدفعة
   * @returns {Promise<Array>} - نتائج المعالجة
   */
  async processUsersInBatches(users, jobs, batchSize) {
    const results = [];
    const totalBatches = Math.ceil(users.length / batchSize);

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(`⚙️ معالجة الدفعة ${batchNumber}/${totalBatches} (${batch.length} مستخدم)...`);

      const batchResults = await Promise.all(
        batch.map(user => this.generateRecommendationsForUser(user, jobs))
      );

      results.push(...batchResults);

      // انتظار قصير بين الدفعات لتجنب الضغط على قاعدة البيانات
      if (i + batchSize < users.length) {
        await this.sleep(1000); // 1 ثانية
      }
    }

    return results;
  }

  /**
   * توليد توصيات لمستخدم واحد
   * @param {Object} user - بيانات المستخدم
   * @param {Array} jobs - قائمة الوظائف
   * @returns {Promise<Object>} - نتيجة التوليد
   */
  async generateRecommendationsForUser(user, jobs) {
    try {
      // توليد التوصيات
      const recommendations = await this.contentBasedFiltering.rankJobsByMatch(
        user,
        jobs,
        {
          saveToDB: false, // سنحفظها يدوياً مع metadata إضافية
          limit: 20,
          minScore: 0.3
        }
      );

      if (recommendations.length === 0) {
        return {
          success: true,
          userId: user._id,
          recommendationsCount: 0,
          message: 'لا توجد توصيات مناسبة'
        };
      }

      // حفظ التوصيات مع علامة "جديد"
      await this.saveNewRecommendations(user._id, recommendations);

      return {
        success: true,
        userId: user._id,
        recommendationsCount: recommendations.length,
        message: 'تم توليد التوصيات بنجاح'
      };

    } catch (error) {
      console.error(`❌ خطأ في توليد توصيات للمستخدم ${user._id}:`, error);
      return {
        success: false,
        userId: user._id,
        error: error.message
      };
    }
  }

  /**
   * حفظ التوصيات الجديدة مع علامة "جديد"
   * @param {string} userId - معرف المستخدم
   * @param {Array} recommendations - قائمة التوصيات
   */
  async saveNewRecommendations(userId, recommendations) {
    try {
      // حذف التوصيات القديمة (أكثر من 7 أيام)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      await Recommendation.deleteMany({
        userId,
        itemType: 'job',
        createdAt: { $lt: sevenDaysAgo }
      });

      // تحديث التوصيات الحالية (إزالة علامة "جديد")
      await Recommendation.updateMany(
        {
          userId,
          itemType: 'job',
          'metadata.isNew': true
        },
        {
          $set: { 'metadata.isNew': false }
        }
      );

      // إنشاء التوصيات الجديدة
      const recommendationDocs = recommendations.map((rec, index) => ({
        userId,
        itemType: 'job',
        itemId: rec.job._id,
        score: rec.matchScore.percentage,
        confidence: rec.matchScore.overall,
        reasons: rec.reasons.map(reason => ({
          type: reason.type,
          message: reason.message,
          strength: reason.strength,
          details: reason.details || {}
        })),
        features: rec.features,
        modelVersion: '1.0',
        metadata: {
          algorithm: 'content_based',
          ranking: index + 1,
          seen: false,
          clicked: false,
          applied: false,
          isNew: true, // علامة "جديد"
          generatedBy: 'daily_update',
          generatedAt: new Date()
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // أسبوع واحد
      }));

      await Recommendation.insertMany(recommendationDocs);

      console.log(`✅ تم حفظ ${recommendationDocs.length} توصية جديدة للمستخدم ${userId}`);

    } catch (error) {
      console.error(`❌ خطأ في حفظ التوصيات للمستخدم ${userId}:`, error);
      throw error;
    }
  }

  /**
   * جلب التوصيات الجديدة للمستخدم (قسم "جديد لك")
   * @param {string} userId - معرف المستخدم
   * @param {Object} options - خيارات إضافية
   * @returns {Promise<Array>} - التوصيات الجديدة
   */
  async getNewRecommendations(userId, options = {}) {
    try {
      const query = {
        userId,
        itemType: 'job',
        'metadata.isNew': true,
        'metadata.seen': false,
        expiresAt: { $gt: new Date() }
      };

      const recommendations = await Recommendation.find(query)
        .sort({ score: -1, 'metadata.ranking': 1 })
        .limit(options.limit || 10)
        .populate('itemId')
        .lean();

      // تحويل إلى تنسيق متوافق
      return recommendations.map(rec => ({
        job: rec.itemId,
        matchScore: {
          percentage: rec.score,
          overall: rec.confidence,
          scores: rec.features?.similarity || {}
        },
        reasons: rec.reasons,
        features: rec.features,
        isNew: true,
        generatedAt: rec.metadata.generatedAt,
        savedAt: rec.createdAt
      }));

    } catch (error) {
      console.error(`❌ خطأ في جلب التوصيات الجديدة للمستخدم ${userId}:`, error);
      return [];
    }
  }

  /**
   * تحديد التوصية كمشاهدة
   * @param {string} recommendationId - معرف التوصية
   */
  async markRecommendationAsSeen(recommendationId) {
    try {
      await Recommendation.findByIdAndUpdate(
        recommendationId,
        {
          $set: {
            'metadata.seen': true,
            'metadata.seenAt': new Date()
          }
        }
      );

      console.log(`✅ تم تحديد التوصية ${recommendationId} كمشاهدة`);

    } catch (error) {
      console.error(`❌ خطأ في تحديد التوصية كمشاهدة:`, error);
    }
  }

  /**
   * إنهاء التحديث وتسجيل الإحصائيات
   * @param {Object} result - نتيجة التحديث
   * @returns {Object} - النتيجة النهائية
   */
  finishUpdate(result) {
    this.isRunning = false;
    this.stats.endTime = new Date();
    this.stats.duration = this.stats.endTime - this.stats.startTime;
    this.lastRunTime = this.stats.endTime;

    console.log(`⏱️ مدة التحديث: ${Math.round(this.stats.duration / 1000)} ثانية`);

    return {
      ...result,
      stats: { ...this.stats },
      lastRunTime: this.lastRunTime
    };
  }

  /**
   * الحصول على حالة التحديث اليومي
   * @returns {Object} - حالة التحديث
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      stats: { ...this.stats }
    };
  }

  /**
   * انتظار لمدة محددة
   * @param {number} ms - المدة بالميلي ثانية
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// إنشاء نسخة واحدة من الخدمة (Singleton)
const dailyRecommendationService = new DailyRecommendationService();

module.exports = dailyRecommendationService;
