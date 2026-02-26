/**
 * 🤖 User Interaction Service
 * خدمة تتبع وتحليل تفاعلات المستخدم مع التوصيات
 * 
 * تتعامل مع تسجيل التفاعلات، تحليل الأنماط، وتحديث التوصيات بناءً على السلوك
 * 
 * المتطلبات: 6.1, 6.2, 6.3 (تتبع التفاعلات، تحليل الأنماط، تحديث النماذج)
 */

const UserInteraction = require('../models/UserInteraction');
const Recommendation = require('../models/Recommendation');

class UserInteractionService {
  constructor() {
    this.interactionWeights = {
      'apply': 2.0,  // تقديم = وزن عالي
      'like': 1.5,   // إعجاب = وزن متوسط
      'save': 1.2,   // حفظ = وزن متوسط منخفض
      'view': 0.5,   // مشاهدة = وزن منخفض
      'ignore': -1.0 // تجاهل = وزن سلبي
    };
    
    this.preferenceDecayRate = 0.95; // معدل تضاؤل التفضيلات مع الوقت
    this.minInteractionCount = 5;    // الحد الأدنى للتفاعلات لتحليل ذكي
  }
  
  /**
   * تسجيل تفاعل مستخدم مع توصية
   */
  async logInteraction(userId, itemType, itemId, action, options = {}) {
    try {
      // تسجيل التفاعل في قاعدة البيانات
      const interaction = await UserInteraction.logInteraction(
        userId, itemType, itemId, action, options
      );
      
      // تحديث حالة التوصية إذا كانت موجودة
      await this.updateRecommendationStatus(userId, itemType, itemId, action);
      
      // تحليل التفضيلات وتحديث النماذج (في الخلفية)
      this.analyzeAndUpdatePreferences(userId, itemType).catch(console.error);
      
      return interaction;
    } catch (error) {
      console.error('❌ خطأ في تسجيل التفاعل:', error.message);
      throw error;
    }
  }
  
  /**
   * تحديث حالة التوصية بناءً على التفاعل
   */
  async updateRecommendationStatus(userId, itemType, itemId, action) {
    try {
      const Recommendation = require('../models/Recommendation');
      
      // البحث عن التوصية
      const recommendation = await Recommendation.findOne({
        userId,
        itemType,
        itemId
      });
      
      if (recommendation) {
        // تحديث حالة التوصية بناءً على التفاعل
        switch (action) {
          case 'view':
            await recommendation.updateStatus('view');
            break;
          case 'like':
            await recommendation.updateStatus('click');
            break;
          case 'apply':
            await recommendation.updateStatus('apply');
            break;
        }
      }
    } catch (error) {
      // لا نرمي الخطأ حتى لا نؤثر على تجربة المستخدم
      console.warn('⚠️ خطأ في تحديث حالة التوصية:', error.message);
    }
  }
  
  /**
   * تحليل تفضيلات المستخدم وتحديث النماذج
   */
  async analyzeAndUpdatePreferences(userId, itemType = 'job') {
    try {
      // جلب إحصاءات التفاعلات
      const stats = await UserInteraction.getUserInteractionStats(userId, { itemType });
      
      // التحقق من وجود تفاعلات كافية
      const totalInteractions = stats[itemType]?.totalInteractions || 0;
      if (totalInteractions < this.minInteractionCount) {
        return null; // لا توجد تفاعلات كافية للتحليل
      }
      
      // تحليل التفضيلات
      const preferences = await this.analyzeUserPreferences(userId, itemType);
      
      // تحديث ملف المستخدم بالتفضيلات
      await this.updateUserProfileWithPreferences(userId, preferences);
      
      // إعادة حساب التوصيات بناءً على التفضيلات الجديدة
      await this.updateRecommendationsBasedOnPreferences(userId, itemType, preferences);
      
      return preferences;
    } catch (error) {
      console.error('❌ خطأ في تحليل التفضيلات:', error.message);
      throw error;
    }
  }
  
  /**
   * تحليل تفضيلات المستخدم من التفاعلات
   */
  async analyzeUserPreferences(userId, itemType) {
    // جلب التفاعلات الإيجابية والسلبية
    const interactions = await UserInteraction.getUserInteractions(userId, {
      itemType,
      limit: 100,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
    
    // تحليل الأنماط
    const patterns = this.extractPatternsFromInteractions(interactions);
    
    // استخراج التفضيلات
    const preferences = {
      userId,
      itemType,
      patterns,
      preferredCategories: this.extractPreferredCategories(interactions),
      dislikedCategories: this.extractDislikedCategories(interactions),
      preferredFeatures: this.extractPreferredFeatures(interactions),
      interactionWeights: this.calculateInteractionWeights(interactions),
      lastAnalyzed: new Date()
    };
    
    return preferences;
  }
  
  /**
   * استخراج الأنماط من التفاعلات
   */
  extractPatternsFromInteractions(interactions) {
    const patterns = {
      timeBased: this.analyzeTimePatterns(interactions),
      actionSequences: this.analyzeActionSequences(interactions),
      categoryPatterns: this.analyzeCategoryPatterns(interactions),
      scorePatterns: this.analyzeScorePatterns(interactions)
    };
    
    return patterns;
  }
  
  /**
   * تحليل الأنماط الزمنية
   */
  analyzeTimePatterns(interactions) {
    if (interactions.length === 0) return {};
    
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
    
    // تحديد الوقت المفضل
    let preferredTime = 'evening';
    let maxCount = 0;
    
    Object.entries(timeSlots).forEach(([time, count]) => {
      if (count > maxCount) {
        maxCount = count;
        preferredTime = time;
      }
    });
    
    return {
      timeSlots,
      preferredTime,
      totalInteractions: interactions.length
    };
  }
  
  /**
   * تحليل تسلسل الإجراءات
   */
  analyzeActionSequences(interactions) {
    if (interactions.length < 2) return {};
    
    const sequences = [];
    for (let i = 0; i < interactions.length - 1; i++) {
      const current = interactions[i];
      const next = interactions[i + 1];
      
      if (current.itemId.toString() === next.itemId.toString()) {
        sequences.push(`${current.action} → ${next.action}`);
      }
    }
    
    // حساب تكرار التسلسلات
    const sequenceCounts = {};
    sequences.forEach(sequence => {
      sequenceCounts[sequence] = (sequenceCounts[sequence] || 0) + 1;
    });
    
    return {
      sequences: sequenceCounts,
      totalSequences: sequences.length,
      commonSequences: Object.entries(sequenceCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([sequence, count]) => ({ sequence, count }))
    };
  }
  
  /**
   * تحليل أنماط الفئات
   */
  analyzeCategoryPatterns(interactions) {
    // هذا يتطلب بيانات الفئات من العناصر
    // حالياً نرجع بيانات افتراضية
    return {
      note: 'يتطلب تكامل مع بيانات الفئات من العناصر'
    };
  }
  
  /**
   * تحليل أنماط الدرجات
   */
  analyzeScorePatterns(interactions) {
    const scores = interactions
      .filter(i => i.context.originalScore > 0)
      .map(i => i.context.originalScore);
    
    if (scores.length === 0) return {};
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    
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
    
    // حساب المتوسطات
    const avgByAction = {};
    Object.entries(scoresByAction).forEach(([action, actionScores]) => {
      avgByAction[action] = actionScores.reduce((sum, s) => sum + s, 0) / actionScores.length;
    });
    
    return {
      overall: {
        avg: avgScore,
        min: minScore,
        max: maxScore,
        count: scores.length
      },
      byAction: avgByAction
    };
  }
  
  /**
   * استخراج الفئات المفضلة
   */
  extractPreferredCategories(interactions) {
    // هذا يتطلب بيانات الفئات من العناصر
    // حالياً نرجع قائمة افتراضية
    const positiveInteractions = interactions.filter(i => 
      ['like', 'apply', 'save'].includes(i.action)
    );
    
    return {
      count: positiveInteractions.length,
      items: positiveInteractions.map(i => i.itemId),
      note: 'يتطلب تكامل مع بيانات الفئات من العناصر'
    };
  }
  
  /**
   * استخراج الفئات غير المحببة
   */
  extractDislikedCategories(interactions) {
    const negativeInteractions = interactions.filter(i => i.action === 'ignore');
    
    return {
      count: negativeInteractions.length,
      items: negativeInteractions.map(i => i.itemId),
      note: 'يتطلب تكامل مع بيانات الفئات من العناصر'
    };
  }
  
  /**
   * استخراج الميزات المفضلة
   */
  extractPreferredFeatures(interactions) {
    // هذا يتطلب بيانات الميزات من العناصر
    // حالياً نرجع بيانات افتراضية
    return {
      note: 'يتطلب تكامل مع بيانات الميزات من العناصر'
    };
  }
  
  /**
   * حساب أوزان التفاعلات
   */
  calculateInteractionWeights(interactions) {
    const weights = {};
    let totalWeight = 0;
    
    interactions.forEach(interaction => {
      const weight = this.interactionWeights[interaction.action] || 0;
      weights[interaction.action] = (weights[interaction.action] || 0) + weight;
      totalWeight += weight;
    });
    
    // حساب النسب المئوية
    const percentages = {};
    Object.entries(weights).forEach(([action, weight]) => {
      percentages[action] = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
    });
    
    return {
      weights,
      percentages,
      totalWeight,
      dominantAction: Object.entries(percentages)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'view'
    };
  }
  
  /**
   * تحديث ملف المستخدم بالتفضيلات
   */
  async updateUserProfileWithPreferences(userId, preferences) {
    try {
      const User = require('../models/User');
      
      await User.findByIdAndUpdate(userId, {
        $set: {
          'preferences.ai': preferences,
          'preferences.lastUpdated': new Date()
        }
      });
      
      console.log(`✅ تم تحديث تفضيلات المستخدم ${userId}`);
    } catch (error) {
      console.warn('⚠️ خطأ في تحديث تفضيلات المستخدم:', error.message);
    }
  }
  
  /**
   * تحديث التوصيات بناءً على التفضيلات
   */
  async updateRecommendationsBasedOnPreferences(userId, itemType, preferences) {
    try {
      // جلب التوصيات الحالية
      const recommendations = await Recommendation.getUserRecommendations(userId, {
        itemType,
        includeSeen: true,
        limit: 50
      });
      
      if (recommendations.length === 0) return;
      
      // تطبيق التفضيلات على التوصيات
      const updatedRecommendations = recommendations.map(rec => {
        const newScore = this.adjustScoreBasedOnPreferences(rec, preferences);
        
        return {
          ...rec.toObject(),
          score: newScore,
          reasons: this.updateReasonsBasedOnPreferences(rec.reasons, preferences)
        };
      });
      
      // ترتيب التوصيات حسب الدرجة الجديدة
      updatedRecommendations.sort((a, b) => b.score - a.score);
      
      // حفظ التوصيات المحدثة
      await Recommendation.updateUserRecommendations(userId, updatedRecommendations);
      
      console.log(`✅ تم تحديث ${updatedRecommendations.length} توصية للمستخدم ${userId}`);
    } catch (error) {
      console.error('❌ خطأ في تحديث التوصيات:', error.message);
    }
  }
  
  /**
   * ضبط درجة التوصية بناءً على التفضيلات
   */
  adjustScoreBasedOnPreferences(recommendation, preferences) {
    let adjustedScore = recommendation.score;
    
    // تطبيق أوزان التفاعلات
    const interactionWeight = preferences.interactionWeights?.totalWeight || 0;
    if (interactionWeight > 0) {
      // زيادة الدرجة بناءً على وزن التفاعلات الإيجابية
      const positiveBoost = Math.min(interactionWeight * 0.1, 20); // زيادة حتى 20%
      adjustedScore += positiveBoost;
    }
    
    // تطبيق أنماط الدرجات
    const scorePatterns = preferences.patterns?.scorePatterns;
    if (scorePatterns?.overall?.avg) {
      const avgScore = scorePatterns.overall.avg;
      const scoreDiff = recommendation.score - avgScore;
      
      // إذا كانت الدرجة أعلى من المتوسط، زيادة طفيفة
      if (scoreDiff > 0) {
        adjustedScore += Math.min(scoreDiff * 0.2, 10); // زيادة حتى 10%
      }
    }
    
    // التأكد من أن الدرجة بين 0 و 100
    return Math.max(0, Math.min(100, adjustedScore));
  }
  
  /**
   * تحديث أسباب التوصية بناءً على التفضيلات
   */
  updateReasonsBasedOnPreferences(reasons, preferences) {
    const updatedReasons = [...reasons];
    
    // إضافة سبب التعلم من السلوك إذا كان هناك تفاعلات كافية
    const totalInteractions = preferences.patterns?.timeBased?.totalInteractions || 0;
    if (totalInteractions >= this.minInteractionCount) {
      // البحث عن سبب behavior إذا كان موجوداً
      const behaviorReasonIndex = updatedReasons.findIndex(r => r.type === 'behavior');
      
      if (behaviorReasonIndex >= 0) {
        // تحديث السبب الموجود
        updatedReasons[behaviorReasonIndex] = {
          type: 'behavior',
          message: 'التوصية مبنية على تفاعلاتك السابقة وتحليل سلوكك',
          strength: 'medium',
          details: {
            interactionCount: totalInteractions,
            dominantAction: preferences.interactionWeights?.dominantAction,
            lastAnalyzed: preferences.lastAnalyzed
          }
        };
      } else {
        // إضافة سبب جديد
        updatedReasons.push({
          type: 'behavior',
          message: 'التوصية مبنية على تحليل تفاعلاتك السابقة',
          strength: 'medium',
          details: {
            interactionCount: totalInteractions,
            analysisDate: preferences.lastAnalyzed
          }
        });
      }
    }
    
    return updatedReasons;
  }
  
  /**
   * جلب إحصاءات تفاعلات المستخدم
   */
  async getUserStats(userId, options = {}) {
    try {
      const stats = await UserInteraction.getUserInteractionStats(userId, options);
      const conversionRate = await UserInteraction.calculateConversionRate(userId, options);
      const preferences = await UserInteraction.analyzeUserPreferences(userId, options.itemType);
      
      return {
        interactionStats: stats,
        conversionRate,
        preferences,
        summary: this.generateStatsSummary(stats, conversionRate)
      };
    } catch (error) {
      console.error('❌ خطأ في جلب إحصاءات المستخدم:', error.message);
      throw error;
    }
  }
  
  /**
   * توليد ملخص للإحصاءات
   */
  generateStatsSummary(stats, conversionRate) {
    const jobStats = stats.job || {};
    const totalInteractions = jobStats.totalInteractions || 0;
    
    let summary = 'لا توجد تفاعلات كافية للتحليل';
    let level = 'beginner';
    
    if (totalInteractions >= 50) {
      summary = 'مستخدم نشط جداً مع تفاعلات متعددة';
      level = 'expert';
    } else if (totalInteractions >= 20) {
      summary = 'مستخدم نشط مع تفاعلات جيدة';
      level = 'intermediate';
    } else if (totalInteractions >= 5) {
      summary = 'مستخدم مبتدئ مع بعض التفاعلات';
      level = 'beginner';
    }
    
    return {
      summary,
      level,
      totalInteractions,
      viewToApplyRate: conversionRate.viewToApply || 0,
      engagementScore: this.calculateEngagementScore(stats, conversionRate)
    };
  }
  
  /**
   * حساب درجة المشاركة
   */
  calculateEngagementScore(stats, conversionRate) {
    const jobStats = stats.job || {};
    const totalInteractions = jobStats.totalInteractions || 0;
    const viewToApply = conversionRate.viewToApply || 0;
    
    if (totalInteractions === 0) return 0;
    
    // حساب الدرجة بناءً على عدد التفاعلات ومعدل التحويل
    const interactionScore = Math.min(totalInteractions / 10, 10); // حتى 10 نقاط
    const conversionScore = Math.min(viewToApply / 5, 10); // حتى 10 نقاط
    
    return Math.round((interactionScore + conversionScore) / 2 * 10) / 10; // من 0 إلى 10
  }
  
  /**
   * تنظيف التفاعلات القديمة
   */
  async cleanupOldData(days = 90) {
    try {
      const result = await UserInteraction.cleanupOldInteractions(days);
      console.log(`✅ تم حذف ${result.deletedCount} تفاعل قديم`);
      return result;
    } catch (error) {
      console.error('❌ خطأ في تنظيف البيانات القديمة:', error.message);
      throw error;
    }
  }
  
  /**
   * إعادة تدوير النماذج بناءً على التفاعلات الجديدة
   */
  async retrainModelsBasedOnInteractions(options = {}) {
    try {
      // هذا يتطلب تكامل مع نظام ML
      // حالياً نرجع رسالة توضيحية
      console.log('🔄 إعادة تدوير النماذج بناءً على التفاعلات الجديدة...');
      
      return {
        status: 'scheduled',
        message: 'تم جدولة إعادة تدوير النماذج بناءً على التفاعلات الجديدة',
        note: 'يتطلب تكامل مع نظام ML للتدريب الفعلي'
      };
    } catch (error) {
      console.error('❌ خطأ في إعادة تدوير النماذج:', error.message);
      throw error;
    }
  }
}

module.exports = UserInteractionService;