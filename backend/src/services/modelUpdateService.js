/**
 * 🤖 Model Update Service
 * خدمة تحديث وإعادة تدوير نماذج التوصيات
 * 
 * تتعامل مع إعادة تدوير النماذج دورياً بناءً على تفاعلات المستخدمين
 * 
 * المتطلبات: 6.3 (إعادة تدوير النماذج دورياً، تحسين التوصيات)
 */

const UserInteraction = require('../models/UserInteraction');
const User = require('../models/User');
const ContentBasedFiltering = require('./contentBasedFiltering');

class ModelUpdateService {
  constructor() {
    this.contentBasedFiltering = new ContentBasedFiltering();
    this.retrainingInterval = 7 * 24 * 60 * 60 * 1000; // أسبوع واحد
    this.minInteractionsForRetraining = 1000; // الحد الأدنى للتفاعلات
    this.lastRetrainingDate = null;
    this.isRetraining = false;
  }
  
  /**
   * بدء خدمة إعادة التدوير الدورية
   */
  startPeriodicRetraining() {
    // التحقق من عدم وجود خدمة قيد التشغيل
    if (this.intervalId) {
      console.log('⚠️ خدمة إعادة التدوير تعمل بالفعل');
      return;
    }
    
    // تشغيل إعادة التدوير أول مرة
    this.retrainModels().catch(console.error);
    
    // جدولة إعادة التدوير الدورية
    this.intervalId = setInterval(() => {
      this.retrainModels().catch(console.error);
    }, this.retrainingInterval);
    
    console.log('✅ بدأت خدمة إعادة تدوير النماذج الدورية');
    console.log(`⏰ فاصل إعادة التدوير: ${this.retrainingInterval / (24 * 60 * 60 * 1000)} أيام`);
  }
  
  /**
   * إيقاف خدمة إعادة التدوير الدورية
   */
  stopPeriodicRetraining() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ توقفت خدمة إعادة تدوير النماذج الدورية');
    }
  }
  
  /**
   * إعادة تدوير النماذج بناءً على التفاعلات الجديدة
   */
  async retrainModels(options = {}) {
    // التحقق من عدم وجود عملية إعادة تدوير قيد التنفيذ
    if (this.isRetraining) {
      console.log('⚠️ عملية إعادة تدوير قيد التنفيذ بالفعل');
      return { status: 'already_running' };
    }
    
    try {
      this.isRetraining = true;
      console.log('🔄 بدء إعادة تدوير النماذج...');
      
      // 1. جمع إحصاءات التفاعلات
      const interactionStats = await this.collectInteractionStats();
      
      // 2. التحقق من وجود تفاعلات كافية
      if (!this.hasEnoughInteractions(interactionStats)) {
        console.log('⚠️ لا توجد تفاعلات كافية لإعادة التدوير');
        return {
          status: 'insufficient_data',
          message: 'لا توجد تفاعلات كافية لإعادة التدوير',
          stats: interactionStats
        };
      }
      
      // 3. تحليل تفضيلات المستخدمين
      const userPreferences = await this.analyzeUserPreferences();
      
      // 4. تحديث أوزان المطابقة
      const updatedWeights = await this.updateMatchingWeights(userPreferences);
      
      // 5. تحديث قاموس المهارات
      const updatedSkills = await this.updateSkillsDictionary(userPreferences);
      
      // 6. حفظ نتائج إعادة التدوير
      const retrainingResult = await this.saveRetrainingResults({
        interactionStats,
        userPreferences,
        updatedWeights,
        updatedSkills,
        options
      });
      
      // 7. تحديث تاريخ إعادة التدوير الأخير
      this.lastRetrainingDate = new Date();
      
      console.log('✅ اكتملت إعادة تدوير النماذج بنجاح');
      
      return {
        status: 'success',
        message: 'تمت إعادة تدوير النماذج بنجاح',
        data: retrainingResult,
        timestamp: this.lastRetrainingDate
      };
      
    } catch (error) {
      console.error('❌ خطأ في إعادة تدوير النماذج:', error.message);
      return {
        status: 'error',
        message: 'حدث خطأ في إعادة تدوير النماذج',
        error: error.message
      };
    } finally {
      this.isRetraining = false;
    }
  }
  
  /**
   * جمع إحصاءات التفاعلات
   */
  async collectInteractionStats() {
    console.log('📊 جمع إحصاءات التفاعلات...');
    
    const stats = await UserInteraction.aggregate([
      {
        $group: {
          _id: {
            itemType: '$itemType',
            action: '$action'
          },
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          avgScore: { $avg: '$context.originalScore' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $group: {
          _id: '$_id.itemType',
          actions: {
            $push: {
              action: '$_id.action',
              count: '$count',
              avgDuration: '$avgDuration',
              avgScore: '$avgScore'
            }
          },
          totalCount: { $sum: '$count' },
          uniqueUsers: { $first: '$uniqueUsers' }
        }
      },
      {
        $project: {
          itemType: '$_id',
          actions: 1,
          totalCount: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
          avgInteractionsPerUser: {
            $cond: [
              { $gt: [{ $size: '$uniqueUsers' }, 0] },
              { $divide: ['$totalCount', { $size: '$uniqueUsers' }] },
              0
            ]
          }
        }
      }
    ]);
    
    // حساب إجمالي التفاعلات
    const totalInteractions = stats.reduce((sum, stat) => sum + stat.totalCount, 0);
    
    return {
      byItemType: stats.reduce((acc, stat) => {
        acc[stat.itemType] = stat;
        return acc;
      }, {}),
      totalInteractions,
      totalUniqueUsers: await UserInteraction.distinct('userId').count(),
      collectionDate: new Date()
    };
  }
  
  /**
   * التحقق من وجود تفاعلات كافية
   */
  hasEnoughInteractions(stats) {
    return stats.totalInteractions >= this.minInteractionsForRetraining;
  }
  
  /**
   * تحليل تفضيلات المستخدمين
   */
  async analyzeUserPreferences() {
    console.log('🔍 تحليل تفضيلات المستخدمين...');
    
    // جلب عينة من المستخدمين النشطين
    const activeUsers = await UserInteraction.aggregate([
      {
        $group: {
          _id: '$userId',
          interactionCount: { $sum: 1 },
          lastInteraction: { $max: '$timestamp' }
        }
      },
      { $sort: { interactionCount: -1 } },
      { $limit: 100 } // عينة من 100 مستخدم نشط
    ]);
    
    const userPreferences = [];
    
    for (const userStat of activeUsers) {
      try {
        const userId = userStat._id;
        
        // جلب تفاعلات المستخدم
        const interactions = await UserInteraction.find({ userId })
          .sort({ timestamp: -1 })
          .limit(50)
          .populate('itemId');
        
        if (interactions.length === 0) continue;
        
        // تحليل التفضيلات
        const preferences = {
          userId,
          interactionCount: userStat.interactionCount,
          lastInteraction: userStat.lastInteraction,
          preferredActions: this.analyzePreferredActions(interactions),
          timePatterns: this.analyzeUserTimePatterns(interactions),
          scorePatterns: this.analyzeUserScorePatterns(interactions),
          itemPatterns: this.analyzeUserItemPatterns(interactions)
        };
        
        userPreferences.push(preferences);
      } catch (error) {
        console.warn(`⚠️ خطأ في تحليل تفضيلات المستخدم ${userStat._id}:`, error.message);
      }
    }
    
    return {
      totalUsersAnalyzed: userPreferences.length,
      users: userPreferences,
      aggregatedPreferences: this.aggregatePreferences(userPreferences),
      analysisDate: new Date()
    };
  }
  
  /**
   * تحليل الإجراءات المفضلة
   */
  analyzePreferredActions(interactions) {
    const actionCounts = {};
    interactions.forEach(interaction => {
      actionCounts[interaction.action] = (actionCounts[interaction.action] || 0) + 1;
    });
    
    const total = interactions.length;
    const percentages = {};
    Object.entries(actionCounts).forEach(([action, count]) => {
      percentages[action] = (count / total) * 100;
    });
    
    return {
      counts: actionCounts,
      percentages,
      dominantAction: Object.entries(percentages)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'view'
    };
  }
  
  /**
   * تحليل الأنماط الزمنية
   */
  analyzeUserTimePatterns(interactions) {
    const timeSlots = {
      morning: 0,   // 6am - 12pm
      afternoon: 0, // 12pm - 6pm
      evening: 0,   // 6pm - 12am
      night: 0      // 12am - 6am
    };
    
    interactions.forEach(interaction => {
      const hour = interaction.timestamp.getHours();
      
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else if (hour >= 18 && hour < 24) timeSlots.evening++;
      else timeSlots.night++;
    });
    
    return {
      timeSlots,
      preferredTime: Object.entries(timeSlots)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'evening'
    };
  }
  
  /**
   * تحليل أنماط الدرجات
   */
  analyzeUserScorePatterns(interactions) {
    const scores = interactions
      .filter(i => i.context.originalScore > 0)
      .map(i => i.context.originalScore);
    
    if (scores.length === 0) return {};
    
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    // تحليل حسب نوع التفاعل
    const scoresByAction = {};
    interactions.forEach(interaction => {
      const score = interaction.context.originalScore;
      if (score > 0) {
        if (!scoresByAction[interaction.action]) {
          scoresByAction[interaction.action] = [];
        }
        scoresByAction[interaction.action].push(score);
      }
    });
    
    const avgByAction = {};
    Object.entries(scoresByAction).forEach(([action, actionScores]) => {
      avgByAction[action] = actionScores.reduce((sum, s) => sum + s, 0) / actionScores.length;
    });
    
    return {
      overall: { avg, min, max, count: scores.length },
      byAction: avgByAction
    };
  }
  
  /**
   * تحليل أنماط العناصر
   */
  analyzeUserItemPatterns(interactions) {
    // هذا يتطلب بيانات إضافية عن العناصر
    // حالياً نرجع بيانات أساسية
    const itemTypes = {};
    interactions.forEach(interaction => {
      itemTypes[interaction.itemType] = (itemTypes[interaction.itemType] || 0) + 1;
    });
    
    return {
      itemTypes,
      preferredItemType: Object.entries(itemTypes)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'job'
    };
  }
  
  /**
   * تجميع التفضيلات
   */
  aggregatePreferences(userPreferences) {
    if (userPreferences.length === 0) return {};
    
    const aggregated = {
      totalUsers: userPreferences.length,
      avgInteractionsPerUser: userPreferences.reduce((sum, p) => sum + p.interactionCount, 0) / userPreferences.length,
      dominantActions: {},
      preferredTimes: {},
      avgScores: {}
    };
    
    // تجميع الإجراءات المهيمنة
    userPreferences.forEach(pref => {
      const action = pref.preferredActions.dominantAction;
      aggregated.dominantActions[action] = (aggregated.dominantActions[action] || 0) + 1;
    });
    
    // تجميع الأوقات المفضلة
    userPreferences.forEach(pref => {
      const time = pref.timePatterns.preferredTime;
      aggregated.preferredTimes[time] = (aggregated.preferredTimes[time] || 0) + 1;
    });
    
    // حساب متوسط الدرجات
    const allScores = userPreferences
      .filter(p => p.scorePatterns.overall)
      .map(p => p.scorePatterns.overall.avg);
    
    if (allScores.length > 0) {
      aggregated.avgScores.overall = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
      aggregated.avgScores.min = Math.min(...allScores);
      aggregated.avgScores.max = Math.max(...allScores);
    }
    
    return aggregated;
  }
  
  /**
   * تحديث أوزان المطابقة
   */
  async updateMatchingWeights(userPreferences) {
    console.log('⚖️ تحديث أوزان المطابقة...');
    
    const aggregated = userPreferences.aggregatedPreferences;
    
    if (!aggregated.dominantActions) {
      console.log('⚠️ لا توجد بيانات كافية لتحديث الأوزان');
      return this.contentBasedFiltering.matchingWeights;
    }
    
    // تحليل فعالية الإجراءات المختلفة
    const actionEffectiveness = {
      'apply': 2.0,  // التقديم = فعالية عالية
      'like': 1.5,   // الإعجاب = فعالية متوسطة
      'save': 1.2,   // الحفظ = فعالية متوسطة منخفضة
      'view': 0.5,   // المشاهدة = فعالية منخفضة
      'ignore': -1.0 // التجاهل = فعالية سلبية
    };
    
    // حساب الأوزان الجديدة بناءً على تفضيلات المستخدمين
    const totalUsers = aggregated.totalUsers || 1;
    const applyRate = (aggregated.dominantActions.apply || 0) / totalUsers;
    const likeRate = (aggregated.dominantActions.like || 0) / totalUsers;
    
    // زيادة وزن المهارات إذا كان معدل التقديم مرتفعاً
    const skillsWeight = this.contentBasedFiltering.matchingWeights.skills;
    const newSkillsWeight = skillsWeight * (1 + applyRate * 0.2); // زيادة حتى 20%
    
    // زيادة وزن الخبرة إذا كان معدل الإعجاب مرتفعاً
    const experienceWeight = this.contentBasedFiltering.matchingWeights.experience;
    const newExperienceWeight = experienceWeight * (1 + likeRate * 0.15); // زيادة حتى 15%
    
    // تحديث الأوزان
    const updatedWeights = {
      ...this.contentBasedFiltering.matchingWeights,
      skills: Math.min(newSkillsWeight, 0.5), // الحد الأقصى 50%
      experience: Math.min(newExperienceWeight, 0.3), // الحد الأقصى 30%
      lastUpdated: new Date()
    };
    
    // تطبيق الأوزان المحدثة
    this.contentBasedFiltering.matchingWeights = updatedWeights;
    
    console.log('✅ تم تحديث أوزان المطابقة:', updatedWeights);
    
    return updatedWeights;
  }
  
  /**
   * تحديث قاموس المهارات
   */
  async updateSkillsDictionary(userPreferences) {
    console.log('📚 تحديث قاموس المهارات...');
    
    // هذا يتطلب تكامل مع نظام استخراج المهارات
    // حا��ياً نرجع قاموس المهارات الحالي
    
    const currentSkills = this.contentBasedFiltering.skillsSynonyms;
    
    return {
      skillsCount: Object.keys(currentSkills).length,
      lastUpdated: new Date(),
      note: 'يتطلب تكامل مع نظام استخراج المهارات من التفاعلات'
    };
  }
  
  /**
   * حفظ نتائج إعادة التدوير
   */
  async saveRetrainingResults(results) {
    console.log('💾 حفظ نتائج إعادة التدوير...');
    
    // يمكن حفظ النتائج في قاعدة البيانات أو ملف
    // حالياً نرجع النتائج فقط
    
    return {
      ...results,
      savedAt: new Date(),
      retrainingId: `retrain_${Date.now()}`
    };
  }
  
  /**
   * الحصول على حالة إعادة التدوير
   */
  getRetrainingStatus() {
    return {
      isRetraining: this.isRetraining,
      lastRetrainingDate: this.lastRetrainingDate,
      retrainingInterval: this.retrainingInterval,
      minInteractionsForRetraining: this.minInteractionsForRetraining,
      isScheduled: !!this.intervalId
    };
  }
}

module.exports = ModelUpdateService;