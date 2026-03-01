/**
 * 🧪 اختبارات نظام تحسين دقة التوصيات
 * 
 * يختبر:
 * - حساب دقة التوصيات
 * - تحديد مستوى الدقة
 * - توليد اقتراحات التحسين
 * - تتبع التحسن مع الوقت
 */

const RecommendationAccuracyService = require('../src/services/recommendationAccuracyService');

describe('🎯 Recommendation Accuracy Service', () => {
  let accuracyService;
  
  beforeEach(() => {
    accuracyService = new RecommendationAccuracyService();
  });
  
  describe('computeAccuracy', () => {
    test('يجب حساب الدقة بشكل صحيح للتوصيات والتفاعلات', () => {
      const recommendations = [
        { itemId: '1', score: 85 },
        { itemId: '2', score: 75 },
        { itemId: '3', score: 65 },
        { itemId: '4', score: 55 },
        { itemId: '5', score: 45 }
      ];
      
      const interactions = [
        { itemId: '1', action: 'apply' },   // 100%
        { itemId: '2', action: 'like' },    // 80%
        { itemId: '3', action: 'save' },    // 70%
        { itemId: '4', action: 'view' },    // 30%
        // itemId 5 لا توجد تفاعلات = 0%
      ];
      
      const accuracy = accuracyService.computeAccuracy(recommendations, interactions);
      
      // (100 + 80 + 70 + 30 + 0) / 5 = 56%
      expect(accuracy.overall).toBeCloseTo(0.56, 2);
      expect(accuracy.totalRecommendations).toBe(5);
      expect(accuracy.totalInteractions).toBe(4);
      expect(accuracy.interactionRate).toBeCloseTo(0.8, 2);
    });
    
    test('يجب إرجاع دقة 0 عند عدم وجود تفاعلات', () => {
      const recommendations = [
        { itemId: '1', score: 85 },
        { itemId: '2', score: 75 }
      ];
      
      const interactions = [];
      
      const accuracy = accuracyService.computeAccuracy(recommendations, interactions);
      
      expect(accuracy.overall).toBe(0);
      expect(accuracy.interactionRate).toBe(0);
    });
    
    test('يجب حساب الدقة حسب نطاق الدرجة', () => {
      const recommendations = [
        { itemId: '1', score: 90 },  // 80-100
        { itemId: '2', score: 70 },  // 60-79
        { itemId: '3', score: 50 }   // 40-59
      ];
      
      const interactions = [
        { itemId: '1', action: 'apply', context: { originalScore: 90 } },
        { itemId: '2', action: 'like', context: { originalScore: 70 } },
        { itemId: '3', action: 'view', context: { originalScore: 50 } }
      ];
      
      const accuracy = accuracyService.computeAccuracy(recommendations, interactions);
      
      expect(accuracy.byScore['80-100']).toBe(1.0);  // apply = 100%
      expect(accuracy.byScore['60-79']).toBe(0.8);   // like = 80%
      expect(accuracy.byScore['40-59']).toBe(0.3);   // view = 30%
    });
  });
  
  describe('getAccuracyLevel', () => {
    test('يجب إرجاع "ممتاز" للدقة >= 75%', () => {
      const level = accuracyService.getAccuracyLevel(0.80);
      
      expect(level.level).toBe('excellent');
      expect(level.label).toBe('ممتاز');
      expect(level.color).toBe('green');
    });
    
    test('يجب إرجاع "جيد" للدقة 60-75%', () => {
      const level = accuracyService.getAccuracyLevel(0.68);
      
      expect(level.level).toBe('good');
      expect(level.label).toBe('جيد');
      expect(level.color).toBe('blue');
    });
    
    test('يجب إرجاع "مقبول" للدقة 45-60%', () => {
      const level = accuracyService.getAccuracyLevel(0.52);
      
      expect(level.level).toBe('acceptable');
      expect(level.label).toBe('مقبول');
      expect(level.color).toBe('yellow');
    });
    
    test('يجب إرجاع "ضعيف" للدقة < 45%', () => {
      const level = accuracyService.getAccuracyLevel(0.35);
      
      expect(level.level).toBe('poor');
      expect(level.label).toBe('ضعيف');
      expect(level.color).toBe('red');
    });
  });
  
  describe('generateImprovementSuggestions', () => {
    test('يجب توليد اقتراح لمعدل تفاعل منخفض', () => {
      const accuracy = {
        overall: 0.50,
        interactionRate: 0.25,  // < 0.3
        byScore: {}
      };
      
      const level = { level: 'acceptable' };
      
      const suggestions = accuracyService.generateImprovementSuggestions(accuracy, level);
      
      const interactionSuggestion = suggestions.find(s => s.type === 'interaction_rate');
      expect(interactionSuggestion).toBeDefined();
      expect(interactionSuggestion.priority).toBe('high');
      expect(interactionSuggestion.expectedImprovement).toContain('+15-20%');
    });
    
    test('يجب توليد اقتراح لدقة منخفضة في الدرجات العالية', () => {
      const accuracy = {
        overall: 0.50,
        interactionRate: 0.60,
        byScore: {
          '80-100': 0.50  // < 0.6
        }
      };
      
      const level = { level: 'acceptable' };
      
      const suggestions = accuracyService.generateImprovementSuggestions(accuracy, level);
      
      const highScoreSuggestion = suggestions.find(s => s.type === 'high_score_accuracy');
      expect(highScoreSuggestion).toBeDefined();
      expect(highScoreSuggestion.action).toBe('update_profile');
    });
    
    test('يجب توليد اقتراح عام للدقة الضعيفة', () => {
      const accuracy = {
        overall: 0.35,
        interactionRate: 0.40,
        byScore: {}
      };
      
      const level = { level: 'poor' };
      
      const suggestions = accuracyService.generateImprovementSuggestions(accuracy, level);
      
      const generalSuggestion = suggestions.find(s => s.type === 'general_improvement');
      expect(generalSuggestion).toBeDefined();
      expect(generalSuggestion.priority).toBe('high');
      expect(generalSuggestion.action).toBe('complete_profile');
    });
  });
  
  describe('getBestInteraction', () => {
    test('يجب إرجاع التفاعل ذو الوزن الأعلى', () => {
      const interactions = [
        { action: 'view' },   // 0.3
        { action: 'like' },   // 0.8
        { action: 'apply' }   // 1.0
      ];
      
      const best = accuracyService.getBestInteraction(interactions);
      
      expect(best.action).toBe('apply');
    });
    
    test('يجب إرجاع التفاعل الوحيد إذا كان واحداً فقط', () => {
      const interactions = [
        { action: 'save' }
      ];
      
      const best = accuracyService.getBestInteraction(interactions);
      
      expect(best.action).toBe('save');
    });
  });
  
  describe('getScoreRange', () => {
    test('يجب إرجاع النطاق الصحيح للدرجات', () => {
      expect(accuracyService.getScoreRange(95)).toBe('80-100');
      expect(accuracyService.getScoreRange(75)).toBe('60-79');
      expect(accuracyService.getScoreRange(55)).toBe('40-59');
      expect(accuracyService.getScoreRange(35)).toBe('20-39');
      expect(accuracyService.getScoreRange(15)).toBe('0-19');
    });
  });
  
  describe('aggregateUserAccuracies', () => {
    test('يجب تجميع دقة المستخدمين بشكل صحيح', () => {
      const userAccuracies = [
        { accuracy: { overall: 0.80, interactionRate: 0.70 }, level: { level: 'excellent' } },
        { accuracy: { overall: 0.65, interactionRate: 0.60 }, level: { level: 'good' } },
        { accuracy: { overall: 0.50, interactionRate: 0.50 }, level: { level: 'acceptable' } },
        { accuracy: { overall: 0.35, interactionRate: 0.40 }, level: { level: 'poor' } }
      ];
      
      const aggregated = accuracyService.aggregateUserAccuracies(userAccuracies);
      
      // (0.80 + 0.65 + 0.50 + 0.35) / 4 = 0.575
      expect(aggregated.overall).toBeCloseTo(0.58, 2);
      expect(aggregated.totalUsers).toBe(4);
      
      expect(aggregated.distribution.excellent).toBe(1);
      expect(aggregated.distribution.good).toBe(1);
      expect(aggregated.distribution.acceptable).toBe(1);
      expect(aggregated.distribution.poor).toBe(1);
      
      expect(aggregated.distributionPercentage.excellent).toBe(25);
      expect(aggregated.distributionPercentage.good).toBe(25);
      expect(aggregated.distributionPercentage.acceptable).toBe(25);
      expect(aggregated.distributionPercentage.poor).toBe(25);
      
      // (0.70 + 0.60 + 0.50 + 0.40) / 4 = 0.55
      expect(aggregated.avgInteractionRate).toBeCloseTo(0.55, 2);
    });
  });
  
  describe('calculateImprovementRate', () => {
    test('يجب حساب معدل التحسن بشكل صحيح', () => {
      const history = [
        { period: 7, accuracy: 0.60 },
        { period: 14, accuracy: 0.65 },
        { period: 30, accuracy: 0.72 }
      ];
      
      const improvement = accuracyService.calculateImprovementRate(history);
      
      // (0.72 - 0.60) / 0.60 = 0.20 = 20%
      expect(improvement.change).toBeCloseTo(0.12, 2);
      expect(improvement.changePercentage).toBe(20);
      expect(improvement.trend).toBe('improving');
      expect(improvement.message).toContain('تتحسن');
    });
    
    test('يجب تحديد اتجاه "declining" عند انخفاض الدقة', () => {
      const history = [
        { period: 7, accuracy: 0.70 },
        { period: 14, accuracy: 0.65 },
        { period: 30, accuracy: 0.60 }
      ];
      
      const improvement = accuracyService.calculateImprovementRate(history);
      
      expect(improvement.trend).toBe('declining');
      expect(improvement.message).toContain('تتراجع');
    });
    
    test('يجب تحديد اتجاه "stable" عند استقرار الدقة', () => {
      const history = [
        { period: 7, accuracy: 0.65 },
        { period: 14, accuracy: 0.66 },
        { period: 30, accuracy: 0.67 }
      ];
      
      const improvement = accuracyService.calculateImprovementRate(history);
      
      expect(improvement.trend).toBe('stable');
      expect(improvement.message).toContain('مستقرة');
    });
  });
  
  describe('generateSystemInsights', () => {
    test('يجب توليد رؤية إيجابية للدقة الممتازة', () => {
      const systemAccuracy = {
        overall: 0.80,
        distributionPercentage: { poor: 10 },
        avgInteractionRate: 0.65
      };
      
      const level = { level: 'excellent' };
      
      const insights = accuracyService.generateSystemInsights(systemAccuracy, level);
      
      const positiveInsight = insights.find(i => i.type === 'positive');
      expect(positiveInsight).toBeDefined();
      expect(positiveInsight.message).toContain('ممتازة');
    });
    
    test('يجب توليد رؤية سلبية للدقة المنخفضة', () => {
      const systemAccuracy = {
        overall: 0.40,
        distributionPercentage: { poor: 35 },
        avgInteractionRate: 0.25
      };
      
      const level = { level: 'poor' };
      
      const insights = accuracyService.generateSystemInsights(systemAccuracy, level);
      
      const negativeInsight = insights.find(i => i.type === 'negative');
      expect(negativeInsight).toBeDefined();
      expect(negativeInsight.message).toContain('منخفضة');
    });
    
    test('يجب توليد تحذير عند وجود > 30% مستخدمين بدقة ضعيفة', () => {
      const systemAccuracy = {
        overall: 0.55,
        distributionPercentage: { poor: 35 },
        avgInteractionRate: 0.50
      };
      
      const level = { level: 'acceptable' };
      
      const insights = accuracyService.generateSystemInsights(systemAccuracy, level);
      
      const warningInsight = insights.find(i => 
        i.type === 'warning' && i.message.includes('30%')
      );
      expect(warningInsight).toBeDefined();
    });
  });
});

describe('📊 Integration Tests', () => {
  test('يجب أن يعمل التدفق الكامل بدون أخطاء', () => {
    const accuracyService = new RecommendationAccuracyService();
    
    // 1. إنشاء بيانات اختبار
    const recommendations = [
      { itemId: '1', score: 90 },
      { itemId: '2', score: 80 },
      { itemId: '3', score: 70 },
      { itemId: '4', score: 60 },
      { itemId: '5', score: 50 }
    ];
    
    const interactions = [
      { itemId: '1', action: 'apply', context: { originalScore: 90 } },
      { itemId: '2', action: 'like', context: { originalScore: 80 } },
      { itemId: '3', action: 'save', context: { originalScore: 70 } }
    ];
    
    // 2. حساب الدقة
    const accuracy = accuracyService.computeAccuracy(recommendations, interactions);
    expect(accuracy.overall).toBeGreaterThan(0);
    
    // 3. تحديد المستوى
    const level = accuracyService.getAccuracyLevel(accuracy.overall);
    expect(level.level).toBeDefined();
    
    // 4. توليد الاقتراحات
    const suggestions = accuracyService.generateImprovementSuggestions(accuracy, level);
    expect(Array.isArray(suggestions)).toBe(true);
    
    // 5. التحقق من النتيجة النهائية
    expect(accuracy.overall).toBeGreaterThanOrEqual(0);
    expect(accuracy.overall).toBeLessThanOrEqual(1);
    expect(level.label).toBeDefined();
    expect(suggestions.length).toBeGreaterThanOrEqual(0);
  });
});

