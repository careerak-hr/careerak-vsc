/**
 * Hybrid Recommendation Service
 * 
 * يدمج Content-Based و Collaborative Filtering للحصول على أفضل توصيات
 * Requirements: 1.1, 1.2
 */

const ContentBasedFiltering = require('./contentBasedFiltering');
const CollaborativeFiltering = require('./collaborativeFiltering');
const JobPosting = require('../models/JobPosting');

class HybridRecommendation {
  constructor() {
    this.contentBased = new ContentBasedFiltering();
    this.collaborative = new CollaborativeFiltering();
    
    // الأوزان الافتراضية
    this.defaultWeights = {
      contentBased: 0.6,
      collaborative: 0.4
    };
  }

  /**
   * الحصول على توصيات هجينة
   * Requirements: 1.1, 1.2
   */
  async getHybridRecommendations(userId, options = {}) {
    try {
      const {
        limit = 10,
        contentWeight = this.defaultWeights.contentBased,
        collaborativeWeight = this.defaultWeights.collaborative,
        minScore = 0
      } = options;

      console.log(`Getting hybrid recommendations for user ${userId}`);
      console.log(`Weights: Content=${contentWeight}, Collaborative=${collaborativeWeight}`);

      // جلب المستخدم
      const User = require('../models/User');
      const user = await User.findById(userId).lean();
      
      if (!user) {
        throw new Error('User not found');
      }

      // جلب الوظائف النشطة
      const jobs = await JobPosting.find({ status: 'active' }).lean();
      
      if (jobs.length === 0) {
        return [];
      }

      // الحصول على توصيات Content-Based
      const contentRecommendations = await this.contentBased.rankJobsByMatch(
        user,
        jobs,
        { limit: limit * 2 } // نأخذ ضعف العدد للدمج
      );

      // الحصول على توصيات Collaborative
      const collaborativeRecommendations = await this.collaborative.getCollaborativeRecommendations(
        userId,
        limit * 2
      );

      // دمج التوصيات
      const mergedRecommendations = this.mergeRecommendations(
        contentRecommendations,
        collaborativeRecommendations,
        contentWeight,
        collaborativeWeight
      );

      // فلترة وترتيب
      const finalRecommendations = mergedRecommendations
        .filter(rec => rec.finalScore >= minScore)
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, limit);

      console.log(`Hybrid recommendations generated: ${finalRecommendations.length} jobs`);

      return finalRecommendations;
    } catch (error) {
      console.error('Error getting hybrid recommendations:', error);
      throw error;
    }
  }

  /**
   * دمج التوصيات من النموذجين
   */
  mergeRecommendations(contentRecs, collaborativeRecs, contentWeight, collaborativeWeight) {
    const merged = {};

    // إضافة توصيات Content-Based
    for (const rec of contentRecs) {
      const jobId = rec.job._id.toString();
      
      merged[jobId] = {
        job: rec.job,
        contentScore: rec.score,
        collaborativeScore: 0,
        finalScore: 0,
        reasons: [...rec.reasons],
        source: 'content'
      };
    }

    // إضافة توصيات Collaborative
    for (const rec of collaborativeRecs) {
      const jobId = rec.job._id.toString();
      
      if (merged[jobId]) {
        // الوظيفة موجودة في كلا النموذجين
        merged[jobId].collaborativeScore = rec.score;
        merged[jobId].reasons.push(...rec.reasons);
        merged[jobId].source = 'hybrid';
      } else {
        // الوظيفة موجودة فقط في Collaborative
        merged[jobId] = {
          job: rec.job,
          contentScore: 0,
          collaborativeScore: rec.score,
          finalScore: 0,
          reasons: [...rec.reasons],
          source: 'collaborative'
        };
      }
    }

    // حساب النتيجة النهائية
    const recommendations = Object.values(merged).map(rec => {
      // النتيجة المرجحة
      rec.finalScore = (
        (rec.contentScore * contentWeight) +
        (rec.collaborativeScore * collaborativeWeight)
      );

      // إضافة سبب الدمج
      if (rec.source === 'hybrid') {
        rec.reasons.unshift('توصية قوية: تطابق ممتاز مع ملفك وأعجبت مستخدمين مشابهين');
      }

      return rec;
    });

    return recommendations;
  }

  /**
   * تحديد الأوزان المثلى بناءً على بيانات المستخدم
   */
  async determineOptimalWeights(userId) {
    try {
      const UserInteraction = require('../models/UserInteraction');
      
      // عدد تفاعلات المستخدم
      const interactionCount = await UserInteraction.countDocuments({
        userId,
        itemType: 'job'
      });

      // إذا كان المستخدم جديد (تفاعلات قليلة)
      if (interactionCount < 5) {
        return {
          contentBased: 0.9,
          collaborative: 0.1,
          reason: 'مستخدم جديد - الاعتماد على Content-Based'
        };
      }

      // إذا كان المستخدم نشط (تفاعلات متوسطة)
      if (interactionCount < 20) {
        return {
          contentBased: 0.7,
          collaborative: 0.3,
          reason: 'مستخدم نشط - توازن مع ميل للـ Content-Based'
        };
      }

      // إذا كان المستخدم نشط جداً (تفاعلات كثيرة)
      return {
        contentBased: 0.5,
        collaborative: 0.5,
        reason: 'مستخدم نشط جداً - توازن متساوي'
      };
    } catch (error) {
      console.error('Error determining optimal weights:', error);
      return this.defaultWeights;
    }
  }

  /**
   * الحصول على توصيات ذكية مع أوزان تلقائية
   */
  async getSmartRecommendations(userId, options = {}) {
    try {
      // تحديد الأوزان المثلى
      const weights = await this.determineOptimalWeights(userId);
      
      console.log(`Smart weights for user ${userId}:`, weights);

      // الحصول على التوصيات
      return await this.getHybridRecommendations(userId, {
        ...options,
        contentWeight: weights.contentBased,
        collaborativeWeight: weights.collaborative
      });
    } catch (error) {
      console.error('Error getting smart recommendations:', error);
      throw error;
    }
  }

  /**
   * حفظ التوصيات في قاعدة البيانات
   */
  async saveRecommendations(userId, recommendations, options = {}) {
    try {
      const Recommendation = require('../models/Recommendation');
      
      const savedRecommendations = [];

      for (const rec of recommendations) {
        const recommendation = new Recommendation({
          userId,
          itemType: 'job',
          itemId: rec.job._id,
          score: rec.finalScore,
          confidence: rec.finalScore / 100,
          reasons: rec.reasons,
          features: {
            contentScore: rec.contentScore,
            collaborativeScore: rec.collaborativeScore,
            source: rec.source
          },
          modelVersion: 'hybrid-v1.0',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        await recommendation.save();
        savedRecommendations.push(recommendation);
      }

      console.log(`Saved ${savedRecommendations.length} hybrid recommendations for user ${userId}`);

      return savedRecommendations;
    } catch (error) {
      console.error('Error saving recommendations:', error);
      throw error;
    }
  }

  /**
   * الحصول على التوصيات المحفوظة
   */
  async getSavedRecommendations(userId, options = {}) {
    try {
      const Recommendation = require('../models/Recommendation');
      const { limit = 10, includeExpired = false } = options;

      const query = {
        userId,
        itemType: 'job'
      };

      if (!includeExpired) {
        query.expiresAt = { $gt: new Date() };
      }

      const recommendations = await Recommendation.find(query)
        .sort({ score: -1 })
        .limit(limit)
        .populate('itemId')
        .lean();

      return recommendations.map(rec => ({
        job: rec.itemId,
        finalScore: rec.score,
        contentScore: rec.features?.contentScore || 0,
        collaborativeScore: rec.features?.collaborativeScore || 0,
        reasons: rec.reasons,
        source: rec.features?.source || 'unknown',
        createdAt: rec.createdAt
      }));
    } catch (error) {
      console.error('Error getting saved recommendations:', error);
      throw error;
    }
  }

  /**
   * تقييم جودة التوصيات
   */
  async evaluateRecommendations(userId, recommendations) {
    try {
      const UserInteraction = require('../models/UserInteraction');
      
      // جلب تفاعلات المستخدم الإيجابية
      const positiveInteractions = await UserInteraction.find({
        userId,
        itemType: 'job',
        action: { $in: ['like', 'apply', 'save'] }
      }).lean();

      const likedJobIds = new Set(
        positiveInteractions.map(i => i.itemId.toString())
      );

      // حساب المقاييس
      let hits = 0;
      let totalScore = 0;

      for (const rec of recommendations) {
        const jobId = rec.job._id.toString();
        totalScore += rec.finalScore;

        if (likedJobIds.has(jobId)) {
          hits++;
        }
      }

      const precision = recommendations.length > 0 ? hits / recommendations.length : 0;
      const averageScore = recommendations.length > 0 ? totalScore / recommendations.length : 0;

      return {
        totalRecommendations: recommendations.length,
        hits,
        precision: (precision * 100).toFixed(2) + '%',
        averageScore: averageScore.toFixed(2),
        quality: precision > 0.5 ? 'excellent' : precision > 0.3 ? 'good' : 'needs improvement'
      };
    } catch (error) {
      console.error('Error evaluating recommendations:', error);
      throw error;
    }
  }
}

module.exports = HybridRecommendation;
