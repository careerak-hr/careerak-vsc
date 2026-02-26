/**
 * 🤖 User Interaction Controller
 * معالج طلبات تفاعلات المستخدم مع التوصيات
 * 
 * يتعامل مع API endpoints لتسجيل التفاعلات وجلب الإحصاءات
 * 
 * المتطلبات: 6.1, 6.2, 6.3 (تتبع التفاعلات، تحليل الأنماط، تحديث النماذج)
 */

const UserInteractionService = require('../services/userInteractionService');
const UserInteraction = require('../models/UserInteraction');

class UserInteractionController {
  constructor() {
    this.userInteractionService = new UserInteractionService();
  }
  
  /**
   * تسجيل تفاعل جديد
   */
  async logInteraction(req, res) {
    try {
      const { userId } = req.user; // من middleware المصادقة
      const { itemType, itemId, action } = req.body;
      const options = req.body.options || {};
      
      // التحقق من البيانات المطلوبة
      if (!itemType || !itemId || !action) {
        return res.status(400).json({
          success: false,
          message: 'بيانات ناقصة: itemType, itemId, action مطلوبة'
        });
      }
      
      // التحقق من صحة action
      const validActions = ['view', 'like', 'apply', 'ignore', 'save'];
      if (!validActions.includes(action)) {
        return res.status(400).json({
          success: false,
          message: `action غير صالح. يجب أن يكون واحداً من: ${validActions.join(', ')}`
        });
      }
      
      // التحقق من صحة itemType
      const validItemTypes = ['job', 'course', 'candidate'];
      if (!validItemTypes.includes(itemType)) {
        return res.status(400).json({
          success: false,
          message: `itemType غير صالح. يجب أن يكون واحداً من: ${validItemTypes.join(', ')}`
        });
      }
      
      // تسجيل التفاعل
      const interaction = await this.userInteractionService.logInteraction(
        userId, itemType, itemId, action, options
      );
      
      res.status(201).json({
        success: true,
        message: 'تم تسجيل التفاعل بنجاح',
        data: {
          interaction: {
            id: interaction._id,
            userId: interaction.userId,
            itemType: interaction.itemType,
            itemId: interaction.itemId,
            action: interaction.action,
            duration: interaction.duration,
            timestamp: interaction.timestamp,
            context: interaction.context
          }
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في تسجيل التفاعل:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تسجيل التفاعل',
        error: error.message
      });
    }
  }
  
  /**
   * جلب تفاعلات مستخدم
   */
  async getUserInteractions(req, res) {
    try {
      const { userId } = req.user;
      const {
        itemType,
        action,
        startDate,
        endDate,
        limit = 20,
        page = 1,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = req.query;
      
      const skip = (page - 1) * limit;
      
      const interactions = await UserInteraction.getUserInteractions(userId, {
        itemType,
        action,
        startDate,
        endDate,
        limit: parseInt(limit),
        skip,
        sortBy,
        sortOrder
      });
      
      const totalCount = await UserInteraction.countDocuments({ userId });
      
      res.status(200).json({
        success: true,
        data: {
          interactions: interactions.map(interaction => ({
            id: interaction._id,
            itemType: interaction.itemType,
            itemId: interaction.itemId,
            action: interaction.action,
            duration: interaction.duration,
            timestamp: interaction.timestamp,
            context: interaction.context,
            formattedDetails: interaction.getFormattedDetails(),
            isPositive: interaction.isPositiveInteraction(),
            isNegative: interaction.isNegativeInteraction(),
            weight: interaction.getInteractionWeight()
          })),
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalCount / limit)
          }
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب التفاعلات:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب التفاعلات',
        error: error.message
      });
    }
  }
  
  /**
   * جلب إحصاءات تفاعلات مستخدم
   */
  async getUserStats(req, res) {
    try {
      const { userId } = req.user;
      const { itemType, startDate, endDate } = req.query;
      
      const stats = await this.userInteractionService.getUserStats(userId, {
        itemType,
        startDate,
        endDate
      });
      
      res.status(200).json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصاءات:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب الإحصاءات',
        error: error.message
      });
    }
  }
  
  /**
   * جلب تفضيلات مستخدم
   */
  async getUserPreferences(req, res) {
    try {
      const { userId } = req.user;
      const { itemType = 'job' } = req.query;
      
      const preferences = await UserInteraction.analyzeUserPreferences(userId, { itemType });
      
      res.status(200).json({
        success: true,
        data: {
          preferences,
          analysisDate: new Date(),
          interactionCount: preferences.positiveCount + preferences.negativeCount
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب التفضيلات:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب التفضيلات',
        error: error.message
      });
    }
  }
  
  /**
   * جلب معدل التحويل
   */
  async getConversionRate(req, res) {
    try {
      const { userId } = req.user;
      const { itemType = 'job', startDate, endDate } = req.query;
      
      const conversionRate = await UserInteraction.calculateConversionRate(userId, {
        itemType,
        startDate,
        endDate
      });
      
      res.status(200).json({
        success: true,
        data: {
          conversionRate,
          interpretation: this.interpretConversionRate(conversionRate)
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب معدل التحويل:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في جلب معدل التحويل',
        error: error.message
      });
    }
  }
  
  /**
   * تفسير معدل التحويل
   */
  interpretConversionRate(conversionRate) {
    const viewToApply = conversionRate.viewToApply || 0;
    
    let level = 'منخفض';
    let suggestion = 'حاول التفاعل مع المزيد من التوصيات';
    
    if (viewToApply >= 30) {
      level = 'ممتاز';
      suggestion = 'معدل تحويل ممتاز! استمر في التفاعل مع التوصيات المناسبة';
    } else if (viewToApply >= 20) {
      level = 'جيد';
      suggestion = 'معدل تحويل جيد. يمكنك تحسينه بالتركيز على التوصيات الأعلى درجة';
    } else if (viewToApply >= 10) {
      level = 'متوسط';
      suggestion = 'معدل تحويل متوسط. حاول التفاعل مع التوصيات التي تناسب مهاراتك أكثر';
    } else if (viewToApply >= 5) {
      level = 'منخفض';
      suggestion = 'معدل تحويل منخفض. راجع تفضيلاتك وملفك الشخصي';
    }
    
    return {
      level,
      suggestion,
      viewToApply,
      totalViews: conversionRate.totalViews || 0,
      totalApplies: conversionRate.totalApplies || 0
    };
  }
  
  /**
   * تحليل الأنماط السلوكية
   */
  async analyzeBehaviorPatterns(req, res) {
    try {
      const { userId } = req.user;
      const { itemType = 'job', limit = 50 } = req.query;
      
      const interactions = await UserInteraction.getUserInteractions(userId, {
        itemType,
        limit: parseInt(limit),
        sortBy: 'timestamp',
        sortOrder: 'desc'
      });
      
      if (interactions.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            message: 'لا توجد تفاعلات كافية للتحليل',
            interactionCount: 0,
            patterns: {}
          }
        });
      }
      
      const patterns = this.userInteractionService.extractPatternsFromInteractions(interactions);
      
      res.status(200).json({
        success: true,
        data: {
          interactionCount: interactions.length,
          patterns,
          insights: this.generateBehaviorInsights(patterns, interactions)
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في تحليل الأنماط:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحليل الأنماط',
        error: error.message
      });
    }
  }
  
  /**
   * توليد رؤى سلوكية
   */
  generateBehaviorInsights(patterns, interactions) {
    const insights = [];
    
    // رؤى الوقت
    const timePatterns = patterns.timeBased;
    if (timePatterns && timePatterns.preferredTime) {
      const timeLabels = {
        morning: 'الصباح',
        afternoon: 'الظهر',
        evening: 'المساء',
        night: 'الليل'
      };
      
      insights.push({
        type: 'time',
        message: `تفضل التفاعل مع التوصيات في ${timeLabels[timePatterns.preferredTime]}`,
        confidence: 'high',
        data: timePatterns.timeSlots
      });
    }
    
    // رؤى تسلسل الإجراءات
    const actionSequences = patterns.actionSequences;
    if (actionSequences && actionSequences.commonSequences.length > 0) {
      const topSequence = actionSequences.commonSequences[0];
      insights.push({
        type: 'sequence',
        message: `تسلسل الإجراءات الشائع: ${topSequence.sequence}`,
        confidence: 'medium',
        data: { sequence: topSequence.sequence, count: topSequence.count }
      });
    }
    
    // رؤى الدرجات
    const scorePatterns = patterns.scorePatterns;
    if (scorePatterns && scorePatterns.overall) {
      const avgScore = scorePatterns.overall.avg;
      insights.push({
        type: 'score',
        message: `متوسط درجة التوصيات التي تتفاعل معها: ${avgScore.toFixed(1)}%`,
        confidence: 'medium',
        data: scorePatterns.overall
      });
    }
    
    // رؤى عامة
    const positiveCount = interactions.filter(i => 
      ['like', 'apply', 'save'].includes(i.action)
    ).length;
    
    const negativeCount = interactions.filter(i => i.action === 'ignore').length;
    
    if (positiveCount > negativeCount * 2) {
      insights.push({
        type: 'engagement',
        message: 'لديك مشاركة إيجابية عالية مع التوصيات',
        confidence: 'high',
        data: { positiveCount, negativeCount }
      });
    }
    
    return insights;
  }
  
  /**
   * تحديث التوصيات بناءً على التفاعلات
   */
  async updateRecommendations(req, res) {
    try {
      const { userId } = req.user;
      const { itemType = 'job' } = req.body;
      
      const preferences = await this.userInteractionService.analyzeAndUpdatePreferences(userId, itemType);
      
      if (!preferences) {
        return res.status(200).json({
          success: true,
          message: 'لا توجد تفاعلات كافية لتحديث التوصيات',
          data: {
            interactionCount: 0,
            updated: false
          }
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'تم تحديث التوصيات بناءً على تفاعلاتك',
        data: {
          preferences,
          updated: true,
          interactionCount: preferences.positiveCount + preferences.negativeCount
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ في تحديث التوصيات:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تحديث التوصيات',
        error: error.message
      });
    }
  }
  
  /**
   * حذف تفاعلات قديمة
   */
  async cleanupOldInteractions(req, res) {
    try {
      const { days = 90 } = req.body;
      
      // التحقق من الصلاحيات (للمسؤولين فقط)
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح به. هذه العملية للمسؤولين فقط'
        });
      }
      
      const result = await this.userInteractionService.cleanupOldData(parseInt(days));
      
      res.status(200).json({
        success: true,
        message: `تم حذف ${result.deletedCount} تفاعل قديم`,
        data: result
      });
      
    } catch (error) {
      console.error('❌ خطأ في تنظيف التفاعلات القديمة:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في تنظيف التفاعلات القديمة',
        error: error.message
      });
    }
  }
  
  /**
   * إعادة تدوير النماذج
   */
  async retrainModels(req, res) {
    try {
      const { options } = req.body;
      
      // التحقق من الصلاحيات (للمسؤولين فقط)
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح به. هذه العملية للمسؤولين فقط'
        });
      }
      
      const result = await this.userInteractionService.retrainModelsBasedOnInteractions(options);
      
      res.status(200).json({
        success: true,
        message: 'تم جدولة إعادة تدوير النماذج',
        data: result
      });
      
    } catch (error) {
      console.error('❌ خطأ في إعادة تدوير النماذج:', error.message);
      res.status(500).json({
        success: false,
        message: 'حدث خطأ في إعادة تدوير النماذج',
        error: error.message
      });
    }
  }
}

module.exports = new UserInteractionController();