/**
 * A/B Testing Service
 * 
 * خدمة لاختبار نماذج مختلفة ومقارنة الأداء
 * - إنشاء تجارب A/B
 * - توزيع المستخدمين على المجموعات
 * - تتبع المقاييس
 * - تحليل النتائج
 * 
 * @module services/abTestingService
 */

const User = require('../models/User');
const UserInteraction = require('../models/UserInteraction');
const Recommendation = require('../models/Recommendation');
const MLModel = require('../models/MLModel');

class ABTestingService {
  constructor() {
    // تخزين التجارب النشطة
    this.activeExperiments = new Map();
  }

  /**
   * إنشاء تجربة A/B جديدة
   */
  async createExperiment(config) {
    const {
      name,
      description,
      modelA,
      modelB,
      splitRatio = 0.5,
      duration = 7, // أيام
      metrics = ['ctr', 'conversion', 'engagement']
    } = config;

    const experiment = {
      id: this.generateExperimentId(),
      name,
      description,
      modelA,
      modelB,
      splitRatio,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
      metrics,
      status: 'active',
      results: {
        groupA: this.initializeMetrics(),
        groupB: this.initializeMetrics()
      },
      participants: {
        groupA: [],
        groupB: []
      }
    };

    this.activeExperiments.set(experiment.id, experiment);

    console.log(`✅ تم إنشاء تجربة A/B: ${name} (${experiment.id})`);

    return experiment;
  }

  /**
   * تهيئة المقاييس
   */
  initializeMetrics() {
    return {
      users: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      conversionRate: 0,
      avgEngagementTime: 0,
      totalEngagementTime: 0
    };
  }

  /**
   * تعيين مستخدم لمجموعة
   */
  assignUserToGroup(userId, experimentId) {
    const experiment = this.activeExperiments.get(experimentId);
    
    if (!experiment) {
      throw new Error('تجربة غير موجودة');
    }

    // التحقق من التعيين السابق
    if (experiment.participants.groupA.includes(userId.toString())) {
      return 'A';
    }
    if (experiment.participants.groupB.includes(userId.toString())) {
      return 'B';
    }

    // تعيين عشوائي بناءً على splitRatio
    const random = Math.random();
    const group = random < experiment.splitRatio ? 'A' : 'B';

    // حفظ التعيين
    if (group === 'A') {
      experiment.participants.groupA.push(userId.toString());
      experiment.results.groupA.users++;
    } else {
      experiment.participants.groupB.push(userId.toString());
      experiment.results.groupB.users++;
    }

    return group;
  }

  /**
   * الحصول على النموذج للمستخدم
   */
  async getModelForUser(userId, experimentId) {
    const group = this.assignUserToGroup(userId, experimentId);
    const experiment = this.activeExperiments.get(experimentId);

    return group === 'A' ? experiment.modelA : experiment.modelB;
  }

  /**
   * تسجيل impression (عرض توصية)
   */
  async trackImpression(userId, experimentId, recommendationId) {
    const experiment = this.activeExperiments.get(experimentId);
    
    if (!experiment) return;

    const group = this.getGroupForUser(userId, experiment);
    
    if (group === 'A') {
      experiment.results.groupA.impressions++;
    } else {
      experiment.results.groupB.impressions++;
    }

    // تحديث CTR
    this.updateCTR(experiment);
  }

  /**
   * تسجيل click (نقر على توصية)
   */
  async trackClick(userId, experimentId, recommendationId) {
    const experiment = this.activeExperiments.get(experimentId);
    
    if (!experiment) return;

    const group = this.getGroupForUser(userId, experiment);
    
    if (group === 'A') {
      experiment.results.groupA.clicks++;
    } else {
      experiment.results.groupB.clicks++;
    }

    // تحديث CTR
    this.updateCTR(experiment);
  }

  /**
   * تسجيل conversion (تقديم على وظيفة)
   */
  async trackConversion(userId, experimentId, recommendationId) {
    const experiment = this.activeExperiments.get(experimentId);
    
    if (!experiment) return;

    const group = this.getGroupForUser(userId, experiment);
    
    if (group === 'A') {
      experiment.results.groupA.conversions++;
    } else {
      experiment.results.groupB.conversions++;
    }

    // تحديث Conversion Rate
    this.updateConversionRate(experiment);
  }

  /**
   * تسجيل وقت التفاعل
   */
  async trackEngagement(userId, experimentId, duration) {
    const experiment = this.activeExperiments.get(experimentId);
    
    if (!experiment) return;

    const group = this.getGroupForUser(userId, experiment);
    
    if (group === 'A') {
      experiment.results.groupA.totalEngagementTime += duration;
      experiment.results.groupA.avgEngagementTime = 
        experiment.results.groupA.totalEngagementTime / experiment.results.groupA.users;
    } else {
      experiment.results.groupB.totalEngagementTime += duration;
      experiment.results.groupB.avgEngagementTime = 
        experiment.results.groupB.totalEngagementTime / experiment.results.groupB.users;
    }
  }

  /**
   * الحصول على مجموعة المستخدم
   */
  getGroupForUser(userId, experiment) {
    if (experiment.participants.groupA.includes(userId.toString())) {
      return 'A';
    }
    if (experiment.participants.groupB.includes(userId.toString())) {
      return 'B';
    }
    return null;
  }

  /**
   * تحديث CTR
   */
  updateCTR(experiment) {
    if (experiment.results.groupA.impressions > 0) {
      experiment.results.groupA.ctr = 
        experiment.results.groupA.clicks / experiment.results.groupA.impressions;
    }

    if (experiment.results.groupB.impressions > 0) {
      experiment.results.groupB.ctr = 
        experiment.results.groupB.clicks / experiment.results.groupB.impressions;
    }
  }

  /**
   * تحديث Conversion Rate
   */
  updateConversionRate(experiment) {
    if (experiment.results.groupA.clicks > 0) {
      experiment.results.groupA.conversionRate = 
        experiment.results.groupA.conversions / experiment.results.groupA.clicks;
    }

    if (experiment.results.groupB.clicks > 0) {
      experiment.results.groupB.conversionRate = 
        experiment.results.groupB.conversions / experiment.results.groupB.clicks;
    }
  }

  /**
   * تحليل نتائج التجربة
   */
  async analyzeExperiment(experimentId) {
    const experiment = this.activeExperiments.get(experimentId);
    
    if (!experiment) {
      throw new Error('تجربة غير موجودة');
    }

    const analysis = {
      experimentId: experiment.id,
      name: experiment.name,
      duration: this.calculateDuration(experiment),
      groupA: experiment.results.groupA,
      groupB: experiment.results.groupB,
      comparison: this.compareGroups(experiment),
      winner: this.determineWinner(experiment),
      statisticalSignificance: this.calculateSignificance(experiment),
      recommendations: this.generateRecommendations(experiment)
    };

    return analysis;
  }

  /**
   * حساب مدة التجربة
   */
  calculateDuration(experiment) {
    const now = new Date();
    const duration = (now - experiment.startDate) / (1000 * 60 * 60 * 24);
    return Math.round(duration * 10) / 10; // تقريب لرقم عشري واحد
  }

  /**
   * مقارنة المجموعات
   */
  compareGroups(experiment) {
    const groupA = experiment.results.groupA;
    const groupB = experiment.results.groupB;

    return {
      ctr: {
        groupA: groupA.ctr,
        groupB: groupB.ctr,
        difference: groupB.ctr - groupA.ctr,
        percentChange: groupA.ctr > 0 
          ? ((groupB.ctr - groupA.ctr) / groupA.ctr) * 100 
          : 0
      },
      conversionRate: {
        groupA: groupA.conversionRate,
        groupB: groupB.conversionRate,
        difference: groupB.conversionRate - groupA.conversionRate,
        percentChange: groupA.conversionRate > 0 
          ? ((groupB.conversionRate - groupA.conversionRate) / groupA.conversionRate) * 100 
          : 0
      },
      avgEngagementTime: {
        groupA: groupA.avgEngagementTime,
        groupB: groupB.avgEngagementTime,
        difference: groupB.avgEngagementTime - groupA.avgEngagementTime,
        percentChange: groupA.avgEngagementTime > 0 
          ? ((groupB.avgEngagementTime - groupA.avgEngagementTime) / groupA.avgEngagementTime) * 100 
          : 0
      }
    };
  }

  /**
   * تحديد الفائز
   */
  determineWinner(experiment) {
    const comparison = this.compareGroups(experiment);

    // حساب النقاط لكل مجموعة
    let scoreA = 0;
    let scoreB = 0;

    // CTR (وزن 30%)
    if (comparison.ctr.groupA > comparison.ctr.groupB) {
      scoreA += 30;
    } else if (comparison.ctr.groupB > comparison.ctr.groupA) {
      scoreB += 30;
    }

    // Conversion Rate (وزن 50%)
    if (comparison.conversionRate.groupA > comparison.conversionRate.groupB) {
      scoreA += 50;
    } else if (comparison.conversionRate.groupB > comparison.conversionRate.groupA) {
      scoreB += 50;
    }

    // Engagement Time (وزن 20%)
    if (comparison.avgEngagementTime.groupA > comparison.avgEngagementTime.groupB) {
      scoreA += 20;
    } else if (comparison.avgEngagementTime.groupB > comparison.avgEngagementTime.groupA) {
      scoreB += 20;
    }

    if (scoreA > scoreB) {
      return {
        group: 'A',
        model: experiment.modelA,
        score: scoreA,
        confidence: this.calculateConfidence(scoreA, scoreB)
      };
    } else if (scoreB > scoreA) {
      return {
        group: 'B',
        model: experiment.modelB,
        score: scoreB,
        confidence: this.calculateConfidence(scoreB, scoreA)
      };
    } else {
      return {
        group: 'tie',
        model: null,
        score: scoreA,
        confidence: 0
      };
    }
  }

  /**
   * حساب الثقة
   */
  calculateConfidence(winnerScore, loserScore) {
    const total = winnerScore + loserScore;
    return total > 0 ? (winnerScore / total) * 100 : 0;
  }

  /**
   * حساب الدلالة الإحصائية
   */
  calculateSignificance(experiment) {
    const groupA = experiment.results.groupA;
    const groupB = experiment.results.groupB;

    // حساب z-score للـ CTR
    const p1 = groupA.ctr;
    const p2 = groupB.ctr;
    const n1 = groupA.impressions;
    const n2 = groupB.impressions;

    if (n1 === 0 || n2 === 0) {
      return {
        isSignificant: false,
        pValue: 1,
        confidence: 0
      };
    }

    const pooledP = (groupA.clicks + groupB.clicks) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    
    if (se === 0) {
      return {
        isSignificant: false,
        pValue: 1,
        confidence: 0
      };
    }

    const zScore = (p2 - p1) / se;
    
    // تقريب p-value (مبسط)
    const pValue = this.zScoreToPValue(Math.abs(zScore));
    
    return {
      isSignificant: pValue < 0.05,
      pValue,
      confidence: (1 - pValue) * 100,
      zScore
    };
  }

  /**
   * تحويل z-score إلى p-value (تقريبي)
   */
  zScoreToPValue(z) {
    // تقريب مبسط
    if (z > 3) return 0.001;
    if (z > 2.58) return 0.01;
    if (z > 1.96) return 0.05;
    if (z > 1.65) return 0.1;
    return 0.5;
  }

  /**
   * توليد توصيات
   */
  generateRecommendations(experiment) {
    const recommendations = [];
    const winner = this.determineWinner(experiment);
    const significance = this.calculateSignificance(experiment);

    // التحقق من حجم العينة
    const totalUsers = experiment.results.groupA.users + experiment.results.groupB.users;
    if (totalUsers < 100) {
      recommendations.push({
        type: 'warning',
        message: 'حجم العينة صغير (< 100 مستخدم). يُنصح بالاستمرار في التجربة.'
      });
    }

    // التحقق من الدلالة الإحصائية
    if (!significance.isSignificant) {
      recommendations.push({
        type: 'warning',
        message: 'النتائج ليست ذات دلالة إحصائية. يُنصح بالاستمرار في التجربة.'
      });
    }

    // توصية بالفائز
    if (winner.group !== 'tie' && significance.isSignificant) {
      recommendations.push({
        type: 'success',
        message: `يُنصح باستخدام النموذج ${winner.model} (المجموعة ${winner.group}) بثقة ${winner.confidence.toFixed(1)}%`
      });
    }

    // توصيات للتحسين
    const comparison = this.compareGroups(experiment);
    
    if (comparison.ctr.groupA < 0.1 && comparison.ctr.groupB < 0.1) {
      recommendations.push({
        type: 'improvement',
        message: 'معدل النقر منخفض في كلا المجموعتين. يُنصح بتحسين عرض التوصيات.'
      });
    }

    if (comparison.conversionRate.groupA < 0.2 && comparison.conversionRate.groupB < 0.2) {
      recommendations.push({
        type: 'improvement',
        message: 'معدل التحويل منخفض. يُنصح بتحسين جودة التوصيات.'
      });
    }

    return recommendations;
  }

  /**
   * إيقاف تجربة
   */
  async stopExperiment(experimentId) {
    const experiment = this.activeExperiments.get(experimentId);
    
    if (!experiment) {
      throw new Error('تجربة غير موجودة');
    }

    experiment.status = 'stopped';
    experiment.endDate = new Date();

    console.log(`⏹️  تم إيقاف التجربة: ${experiment.name}`);

    return experiment;
  }

  /**
   * حذف تجربة
   */
  async deleteExperiment(experimentId) {
    const deleted = this.activeExperiments.delete(experimentId);
    
    if (!deleted) {
      throw new Error('تجربة غير موجودة');
    }

    console.log(`🗑️  تم حذف التجربة: ${experimentId}`);

    return { success: true };
  }

  /**
   * الحصول على جميع التجارب
   */
  getAllExperiments() {
    return Array.from(this.activeExperiments.values());
  }

  /**
   * الحصول على تجربة محددة
   */
  getExperiment(experimentId) {
    return this.activeExperiments.get(experimentId);
  }

  /**
   * توليد معرف تجربة
   */
  generateExperimentId() {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = ABTestingService;
