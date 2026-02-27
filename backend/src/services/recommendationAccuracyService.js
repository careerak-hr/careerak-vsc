/**
 * 🎯 Recommendation Accuracy Service
 * خدمة تحسين دقة التوصيات مع الوقت
 * 
 * تتعامل مع قياس وتحسين دقة التوصيات بناءً على تفاعلات المستخدمين
 * 
 * المتطلبات: 6.3 (تحسين دقة التوصيات مع الوقت)
 */

const UserInteraction = require('../models/UserInteraction');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');

class RecommendationAccuracyService {
  constructor() {
    // عتبات الدقة
    this.accuracyThresholds = {
      excellent: 0.75,  // 75%+ = ممتاز
      good: 0.60,       // 60-75% = جيد
      acceptable: 0.45, // 45-60% = مقبول
      poor: 0.30        // < 30% = ضعيف
    };
    
    // أوزان التفاعلات لحساب الدقة
    this.accuracyWeights = {
      'apply': 1.0,     // تقديم = دقة 100%
      'like': 0.8,      // إعجاب = دقة 80%
      'save': 0.7,      // حفظ = دقة 70%
      'view': 0.3,      // مشاهدة = دقة 30%
      'ignore': 0.0     // تجاهل = دقة 0%
    };
    
    // فترة التحليل (آخر 30 يوم)
    this.analysisWindow = 30 * 24 * 60 * 60 * 1000;
    
    // الحد الأدنى للتوصيات للتحليل
    this.minRecommendationsForAnalysis = 10;
  }
  
  /**
   * حساب دقة التوصيات لمستخدم معين
   */
  async calculateUserAccuracy(userId, options = {}) {
    try {
      const itemType = options.itemType || 'job';
      const period = options.period || this.analysisWindow;
      
      // جلب التوصيات في الفترة المحددة
      const startDate = new Date(Date.now() - period);
      const recommendations = await Recommendation.find({
        userId,
        itemType,
        createdAt: { $gte: startDate }
      });
      
      if (recommendations.length < this.minRecommendationsForAnalysis) {
        return {
          status: 'insufficient_data',
          message: 'لا توجد توصيات كافية للتحليل',
          recommendationCount: recommendations.length,
          minRequired: this.minRecommendationsForAnalysis
        };
      }
      
      // جلب التفاعلات المرتبطة بالتوصيات
      const recommendationIds = recommendations.map(r => r.itemId);
      const interactions = await UserInteraction.find({
        userId,
        itemType,
        itemId: { $in: recommendationIds },
        timestamp: { $gte: startDate }
      });
      
      // حساب الدقة
      const accuracy = this.computeAccuracy(recommendations, interactions);
      
      // تحديد مستوى الدقة
      const level = this.getAccuracyLevel(accuracy.overall);
      
      // توليد توصيات للتحسين
      const improvements = this.generateImprovementSuggestions(accuracy, level);
      
      return {
        status: 'success',
        userId,
        itemType,
        period: {
          days: Math.round(period / (24 * 60 * 60 * 1000)),
          startDate,
          endDate: new Date()
        },
        accuracy,
        level,
        improvements,
        analyzedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ خطأ في حساب دقة التوصيات:', error.message);
      throw error;
    }
  }
  
  /**
   * حساب الدقة من التوصيات والتفاعلات
   */
  computeAccuracy(recommendations, interactions) {
    // إنشاء خريطة للتفاعلات حسب itemId
    const interactionMap = new Map();
    interactions.forEach(interaction => {
      const itemId = interaction.itemId.toString();
      if (!interactionMap.has(itemId)) {
        interactionMap.set(itemId, []);
      }
      interactionMap.get(itemId).push(interaction);
    });
    
    // حساب الدقة لكل توصية
    let totalAccuracy = 0;
    let totalWeight = 0;
    const accuracyByScore = {};
    const accuracyByAction = {};
    
    recommendations.forEach(rec => {
      const itemId = rec.itemId.toString();
      const itemInteractions = interactionMap.get(itemId) || [];
      
      if (itemInteractions.length === 0) {
        // لا توجد تفاعلات = دقة 0
        totalAccuracy += 0;
        totalWeight += 1;
      } else {
        // حساب الدقة بناءً على أفضل تفاعل
        const bestInteraction = this.getBestInteraction(itemInteractions);
        const accuracy = this.accuracyWeights[bestInteraction.action] || 0;
        
        totalAccuracy += accuracy;
        totalWeight += 1;
        
        // تجميع حسب نطاق الدرجة
        const scoreRange = this.getScoreRange(rec.score);
        if (!accuracyByScore[scoreRange]) {
          accuracyByScore[scoreRange] = { total: 0, count: 0 };
        }
        accuracyByScore[scoreRange].total += accuracy;
        accuracyByScore[scoreRange].count += 1;
        
        // تجميع حسب نوع التفاعل
        if (!accuracyByAction[bestInteraction.action]) {
          accuracyByAction[bestInteraction.action] = { total: 0, count: 0 };
        }
        accuracyByAction[bestInteraction.action].total += accuracy;
        accuracyByAction[bestInteraction.action].count += 1;
      }
    });
    
    // حساب المتوسطات
    const overall = totalWeight > 0 ? totalAccuracy / totalWeight : 0;
    
    const byScore = {};
    Object.entries(accuracyByScore).forEach(([range, data]) => {
      byScore[range] = data.count > 0 ? data.total / data.count : 0;
    });
    
    const byAction = {};
    Object.entries(accuracyByAction).forEach(([action, data]) => {
      byAction[action] = data.count > 0 ? data.total / data.count : 0;
    });
    
    return {
      overall: Math.round(overall * 100) / 100,
      byScore,
      byAction,
      totalRecommendations: recommendations.length,
      totalInteractions: interactions.length,
      interactionRate: recommendations.length > 0 
        ? Math.round((interactions.length / recommendations.length) * 100) / 100 
        : 0
    };
  }
  
  /**
   * الحصول على أفضل تفاعل من قائمة التفاعلات
   */
  getBestInteraction(interactions) {
    // ترتيب التفاعلات حسب الوزن
    const sortedInteractions = interactions.sort((a, b) => {
      const weightA = this.accuracyWeights[a.action] || 0;
      const weightB = this.accuracyWeights[b.action] || 0;
      return weightB - weightA;
    });
    
    return sortedInteractions[0];
  }
  
  /**
   * تحديد نطاق الدرجة
   */
  getScoreRange(score) {
    if (score >= 80) return '80-100';
    if (score >= 60) return '60-79';
    if (score >= 40) return '40-59';
    if (score >= 20) return '20-39';
    return '0-19';
  }
  
  /**
   * تحديد مستوى الدقة
   */
  getAccuracyLevel(accuracy) {
    if (accuracy >= this.accuracyThresholds.excellent) {
      return {
        level: 'excellent',
        label: 'ممتاز',
        color: 'green',
        message: 'دقة التوصيات ممتازة! استمر في التفاعل لتحسينها أكثر.'
      };
    } else if (accuracy >= this.accuracyThresholds.good) {
      return {
        level: 'good',
        label: 'جيد',
        color: 'blue',
        message: 'دقة التوصيات جيدة. يمكن تحسينها بمزيد من التفاعلات.'
      };
    } else if (accuracy >= this.accuracyThresholds.acceptable) {
      return {
        level: 'acceptable',
        label: 'مقبول',
        color: 'yellow',
        message: 'دقة التوصيات مقبولة. نحتاج المزيد من التفاعلات للتحسين.'
      };
    } else {
      return {
        level: 'poor',
        label: 'ضعيف',
        color: 'red',
        message: 'دقة التوصيات منخفضة. تفاعل أكثر لتحسين التوصيات.'
      };
    }
  }
  
  /**
   * توليد اقتراحات للتحسين
   */
  generateImprovementSuggestions(accuracy, level) {
    const suggestions = [];
    
    // اقتراحات بناءً على معدل التفاعل
    if (accuracy.interactionRate < 0.3) {
      suggestions.push({
        type: 'interaction_rate',
        priority: 'high',
        message: 'معدل التفاعل منخفض. تفاعل مع المزيد من التوصيات (إعجاب، حفظ، تقديم).',
        action: 'increase_interactions',
        expectedImprovement: '+15-20% في الدقة'
      });
    }
    
    // اقتراحات بناءً على الدقة حسب الدرجة
    if (accuracy.byScore) {
      const highScoreAccuracy = accuracy.byScore['80-100'] || 0;
      const lowScoreAccuracy = accuracy.byScore['0-19'] || 0;
      
      if (highScoreAccuracy < 0.6) {
        suggestions.push({
          type: 'high_score_accuracy',
          priority: 'high',
          message: 'التوصيات ذات الدرجات العالية لا تحقق توقعاتك. حدّث ملفك الشخصي.',
          action: 'update_profile',
          expectedImprovement: '+10-15% في الدقة'
        });
      }
      
      if (lowScoreAccuracy > 0.3) {
        suggestions.push({
          type: 'low_score_accuracy',
          priority: 'medium',
          message: 'تتفاعل مع توصيات ذات درجات منخفضة. قد نحتاج لتوسيع نطاق البحث.',
          action: 'expand_search',
          expectedImprovement: '+5-10% في الدقة'
        });
      }
    }
    
    // اقتراحات بناءً على مستوى الدقة
    if (level.level === 'poor' || level.level === 'acceptable') {
      suggestions.push({
        type: 'general_improvement',
        priority: 'high',
        message: 'أكمل ملفك الشخصي وأضف المزيد من المهارات والخبرات.',
        action: 'complete_profile',
        expectedImprovement: '+20-30% في الدقة'
      });
    }
    
    // اقتراحات بناءً على عدد التوصيات
    if (accuracy.totalRecommendations < 20) {
      suggestions.push({
        type: 'more_recommendations',
        priority: 'medium',
        message: 'عدد التوصيات قليل. تصفح المزيد من الوظائف للحصول على توصيات أفضل.',
        action: 'browse_more',
        expectedImprovement: '+10-15% في الدقة'
      });
    }
    
    return suggestions;
  }
  
  /**
   * حساب دقة التوصيات على مستوى النظام
   */
  async calculateSystemAccuracy(options = {}) {
    try {
      const itemType = options.itemType || 'job';
      const period = options.period || this.analysisWindow;
      const sampleSize = options.sampleSize || 100;
      
      console.log('📊 حساب دقة التوصيات على مستوى النظام...');
      
      // جلب عينة من المستخدمين النشطين
      const startDate = new Date(Date.now() - period);
      const activeUsers = await UserInteraction.aggregate([
        {
          $match: {
            itemType,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$userId',
            interactionCount: { $sum: 1 }
          }
        },
        { $sort: { interactionCount: -1 } },
        { $limit: sampleSize }
      ]);
      
      if (activeUsers.length === 0) {
        return {
          status: 'insufficient_data',
          message: 'لا توجد بيانات كافية لحساب دقة النظام'
        };
      }
      
      // حساب الدقة لكل مستخدم
      const userAccuracies = [];
      for (const user of activeUsers) {
        try {
          const accuracy = await this.calculateUserAccuracy(user._id, { itemType, period });
          if (accuracy.status === 'success') {
            userAccuracies.push(accuracy);
          }
        } catch (error) {
          console.warn(`⚠️ خطأ في حساب دقة المستخدم ${user._id}:`, error.message);
        }
      }
      
      if (userAccuracies.length === 0) {
        return {
          status: 'insufficient_data',
          message: 'لا توجد بيانات دقة كافية للمستخدمين'
        };
      }
      
      // حساب المتوسطات
      const systemAccuracy = this.aggregateUserAccuracies(userAccuracies);
      
      // تحديد مستوى الدقة
      const level = this.getAccuracyLevel(systemAccuracy.overall);
      
      // توليد تقرير
      const report = this.generateSystemAccuracyReport(systemAccuracy, level, userAccuracies);
      
      return {
        status: 'success',
        itemType,
        period: {
          days: Math.round(period / (24 * 60 * 60 * 1000)),
          startDate,
          endDate: new Date()
        },
        sampleSize: userAccuracies.length,
        accuracy: systemAccuracy,
        level,
        report,
        analyzedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ خطأ في حساب دقة النظام:', error.message);
      throw error;
    }
  }
  
  /**
   * تجميع دقة المستخدمين
   */
  aggregateUserAccuracies(userAccuracies) {
    const totalUsers = userAccuracies.length;
    
    // حساب المتوسط الإجمالي
    const overallSum = userAccuracies.reduce((sum, acc) => sum + acc.accuracy.overall, 0);
    const overall = overallSum / totalUsers;
    
    // حساب التوزيع حسب المستوى
    const distribution = {
      excellent: 0,
      good: 0,
      acceptable: 0,
      poor: 0
    };
    
    userAccuracies.forEach(acc => {
      distribution[acc.level.level]++;
    });
    
    // حساب النسب المئوية
    const distributionPercentage = {};
    Object.entries(distribution).forEach(([level, count]) => {
      distributionPercentage[level] = Math.round((count / totalUsers) * 100);
    });
    
    // حساب معدل التفاعل الإجمالي
    const interactionRateSum = userAccuracies.reduce((sum, acc) => 
      sum + acc.accuracy.interactionRate, 0
    );
    const avgInteractionRate = interactionRateSum / totalUsers;
    
    return {
      overall: Math.round(overall * 100) / 100,
      distribution,
      distributionPercentage,
      avgInteractionRate: Math.round(avgInteractionRate * 100) / 100,
      totalUsers
    };
  }
  
  /**
   * توليد تقرير دقة النظام
   */
  generateSystemAccuracyReport(systemAccuracy, level, userAccuracies) {
    const report = {
      summary: {
        overall: systemAccuracy.overall,
        level: level.label,
        message: level.message,
        totalUsers: systemAccuracy.totalUsers
      },
      distribution: {
        excellent: `${systemAccuracy.distributionPercentage.excellent}% من المستخدمين`,
        good: `${systemAccuracy.distributionPercentage.good}% من المستخدمين`,
        acceptable: `${systemAccuracy.distributionPercentage.acceptable}% من المستخدمين`,
        poor: `${systemAccuracy.distributionPercentage.poor}% من المستخدمين`
      },
      metrics: {
        avgInteractionRate: systemAccuracy.avgInteractionRate,
        totalRecommendations: userAccuracies.reduce((sum, acc) => 
          sum + acc.accuracy.totalRecommendations, 0
        ),
        totalInteractions: userAccuracies.reduce((sum, acc) => 
          sum + acc.accuracy.totalInteractions, 0
        )
      },
      insights: this.generateSystemInsights(systemAccuracy, level)
    };
    
    return report;
  }
  
  /**
   * توليد رؤى النظام
   */
  generateSystemInsights(systemAccuracy, level) {
    const insights = [];
    
    // رؤية حول الدقة الإجمالية
    if (systemAccuracy.overall >= this.accuracyThresholds.excellent) {
      insights.push({
        type: 'positive',
        message: 'النظام يحقق دقة ممتازة! معظم التوصيات ذات صلة بالمستخدمين.'
      });
    } else if (systemAccuracy.overall < this.accuracyThresholds.acceptable) {
      insights.push({
        type: 'negative',
        message: 'دقة النظام منخفضة. يحتاج النظام لإعادة تدريب النماذج.'
      });
    }
    
    // رؤية حول التوزيع
    if (systemAccuracy.distributionPercentage.poor > 30) {
      insights.push({
        type: 'warning',
        message: 'أكثر من 30% من المستخدمين يحصلون على توصيات ضعيفة الدقة.'
      });
    }
    
    // رؤية حول معدل التفاعل
    if (systemAccuracy.avgInteractionRate < 0.3) {
      insights.push({
        type: 'warning',
        message: 'معدل التفاعل منخفض. قد يحتاج النظام لتحسين جودة التوصيات.'
      });
    }
    
    return insights;
  }
  
  /**
   * تتبع تحسن الدقة مع الوقت
   */
  async trackAccuracyImprovement(userId, options = {}) {
    try {
      const itemType = options.itemType || 'job';
      const periods = options.periods || [7, 14, 30]; // أيام
      
      const accuracyHistory = [];
      
      for (const days of periods) {
        const period = days * 24 * 60 * 60 * 1000;
        const accuracy = await this.calculateUserAccuracy(userId, { itemType, period });
        
        if (accuracy.status === 'success') {
          accuracyHistory.push({
            period: days,
            accuracy: accuracy.accuracy.overall,
            level: accuracy.level.level,
            analyzedAt: new Date()
          });
        }
      }
      
      if (accuracyHistory.length < 2) {
        return {
          status: 'insufficient_data',
          message: 'لا توجد بيانات كافية لتتبع التحسن'
        };
      }
      
      // حساب معدل التحسن
      const improvement = this.calculateImprovementRate(accuracyHistory);
      
      return {
        status: 'success',
        userId,
        itemType,
        history: accuracyHistory,
        improvement,
        analyzedAt: new Date()
      };
      
    } catch (error) {
      console.error('❌ خطأ في تتبع تحسن الدقة:', error.message);
      throw error;
    }
  }
  
  /**
   * حساب معدل التحسن
   */
  calculateImprovementRate(history) {
    if (history.length < 2) return null;
    
    // مقارنة أحدث فترة مع أقدم فترة
    const latest = history[history.length - 1];
    const oldest = history[0];
    
    const change = latest.accuracy - oldest.accuracy;
    const changePercentage = oldest.accuracy > 0 
      ? Math.round((change / oldest.accuracy) * 100) 
      : 0;
    
    let trend = 'stable';
    if (change > 0.05) trend = 'improving';
    else if (change < -0.05) trend = 'declining';
    
    return {
      change: Math.round(change * 100) / 100,
      changePercentage,
      trend,
      message: this.getImprovementMessage(trend, changePercentage)
    };
  }
  
  /**
   * الحصول على رسالة التحسن
   */
  getImprovementMessage(trend, changePercentage) {
    if (trend === 'improving') {
      return `دقة التوصيات تتحسن! زيادة بنسبة ${changePercentage}% 📈`;
    } else if (trend === 'declining') {
      return `دقة التوصيات تتراجع. انخفاض بنسبة ${Math.abs(changePercentage)}% 📉`;
    } else {
      return 'دقة التوصيات مستقرة 📊';
    }
  }
}

module.exports = RecommendationAccuracyService;
