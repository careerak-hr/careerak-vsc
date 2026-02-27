/**
 * 🧪 User Interaction Tests
 * اختبارات نظام تتبع التفاعلات
 * 
 * المتطلبات: 6.1 (تتبع جميع التفاعلات)
 */

const UserInteraction = require('../src/models/UserInteraction');
const UserInteractionService = require('../src/services/userInteractionService');

describe('UserInteraction Model', () => {
  describe('Schema Validation', () => {
    test('يجب أن يحتوي على جميع الحقول المطلوبة', () => {
      const schema = UserInteraction.schema.obj;
      
      expect(schema).toHaveProperty('userId');
      expect(schema).toHaveProperty('itemType');
      expect(schema).toHaveProperty('itemId');
      expect(schema).toHaveProperty('action');
      expect(schema).toHaveProperty('duration');
      expect(schema).toHaveProperty('timestamp');
      expect(schema).toHaveProperty('context');
      expect(schema).toHaveProperty('session');
    });
    
    test('يجب أن يحتوي على enum صحيح للـ action', () => {
      const actionEnum = UserInteraction.schema.path('action').enumValues;
      
      expect(actionEnum).toContain('view');
      expect(actionEnum).toContain('like');
      expect(actionEnum).toContain('apply');
      expect(actionEnum).toContain('ignore');
      expect(actionEnum).toContain('save');
      expect(actionEnum).toHaveLength(5);
    });
    
    test('يجب أن يحتوي على enum صحيح للـ itemType', () => {
      const itemTypeEnum = UserInteraction.schema.path('itemType').enumValues;
      
      expect(itemTypeEnum).toContain('job');
      expect(itemTypeEnum).toContain('course');
      expect(itemTypeEnum).toContain('candidate');
      expect(itemTypeEnum).toHaveLength(3);
    });
  });
  
  describe('Instance Methods', () => {
    let mockInteraction;
    
    beforeEach(() => {
      mockInteraction = {
        action: 'like',
        context: {
          sourcePage: 'recommendations',
          position: 1,
          originalScore: 85
        },
        duration: 30,
        timestamp: new Date(),
        getFormattedDetails: UserInteraction.schema.methods.getFormattedDetails,
        isPositiveInteraction: UserInteraction.schema.methods.isPositiveInteraction,
        isNegativeInteraction: UserInteraction.schema.methods.isNegativeInteraction,
        isNeutralInteraction: UserInteraction.schema.methods.isNeutralInteraction,
        getInteractionWeight: UserInteraction.schema.methods.getInteractionWeight
      };
    });
    
    test('isPositiveInteraction يجب أن يرجع true للتفاعلات الإيجابية', () => {
      mockInteraction.action = 'like';
      expect(mockInteraction.isPositiveInteraction()).toBe(true);
      
      mockInteraction.action = 'apply';
      expect(mockInteraction.isPositiveInteraction()).toBe(true);
      
      mockInteraction.action = 'save';
      expect(mockInteraction.isPositiveInteraction()).toBe(true);
    });
    
    test('isNegativeInteraction يجب أن يرجع true للتفاعلات السلبية', () => {
      mockInteraction.action = 'ignore';
      expect(mockInteraction.isNegativeInteraction()).toBe(true);
      
      mockInteraction.action = 'like';
      expect(mockInteraction.isNegativeInteraction()).toBe(false);
    });
    
    test('isNeutralInteraction يجب أن يرجع true للتفاعلات المحايدة', () => {
      mockInteraction.action = 'view';
      expect(mockInteraction.isNeutralInteraction()).toBe(true);
      
      mockInteraction.action = 'like';
      expect(mockInteraction.isNeutralInteraction()).toBe(false);
    });
    
    test('getInteractionWeight يجب أن يرجع الوزن الصحيح', () => {
      mockInteraction.action = 'apply';
      expect(mockInteraction.getInteractionWeight()).toBe(2.0);
      
      mockInteraction.action = 'like';
      expect(mockInteraction.getInteractionWeight()).toBe(1.5);
      
      mockInteraction.action = 'save';
      expect(mockInteraction.getInteractionWeight()).toBe(1.2);
      
      mockInteraction.action = 'view';
      expect(mockInteraction.getInteractionWeight()).toBe(0.5);
      
      mockInteraction.action = 'ignore';
      expect(mockInteraction.getInteractionWeight()).toBe(-1.0);
    });
  });
});

describe('UserInteractionService', () => {
  let service;
  
  beforeEach(() => {
    service = new UserInteractionService();
  });
  
  describe('Interaction Weights', () => {
    test('يجب أن يحتوي على أوزان صحيحة', () => {
      expect(service.interactionWeights).toEqual({
        'apply': 2.0,
        'like': 1.5,
        'save': 1.2,
        'view': 0.5,
        'ignore': -1.0
      });
    });
  });
  
  describe('Pattern Analysis', () => {
    test('analyzeTimePatterns يجب أن يحلل الأنماط الزمنية بشكل صحيح', () => {
      const interactions = [
        { timestamp: new Date('2026-02-27T08:00:00') }, // morning
        { timestamp: new Date('2026-02-27T14:00:00') }, // afternoon
        { timestamp: new Date('2026-02-27T20:00:00') }, // evening
        { timestamp: new Date('2026-02-27T02:00:00') }  // night
      ];
      
      const patterns = service.analyzeTimePatterns(interactions);
      
      expect(patterns).toHaveProperty('timeSlots');
      expect(patterns).toHaveProperty('preferredTime');
      expect(patterns).toHaveProperty('totalInteractions');
      expect(patterns.totalInteractions).toBe(4);
      expect(patterns.timeSlots.morning).toBe(1);
      expect(patterns.timeSlots.afternoon).toBe(1);
      expect(patterns.timeSlots.evening).toBe(1);
      expect(patterns.timeSlots.night).toBe(1);
    });
    
    test('analyzeScorePatterns يجب أن يحلل أنماط الدرجات بشكل صحيح', () => {
      const interactions = [
        { action: 'like', context: { originalScore: 80 } },
        { action: 'like', context: { originalScore: 90 } },
        { action: 'apply', context: { originalScore: 95 } },
        { action: 'view', context: { originalScore: 70 } }
      ];
      
      const patterns = service.analyzeScorePatterns(interactions);
      
      expect(patterns).toHaveProperty('overall');
      expect(patterns).toHaveProperty('byAction');
      expect(patterns.overall.avg).toBeCloseTo(83.75, 1);
      expect(patterns.overall.min).toBe(70);
      expect(patterns.overall.max).toBe(95);
      expect(patterns.overall.count).toBe(4);
    });
  });
  
  describe('Engagement Score Calculation', () => {
    test('calculateEngagementScore يجب أن يحسب الدرجة بشكل صحيح', () => {
      const stats = {
        job: {
          totalInteractions: 50
        }
      };
      
      const conversionRate = {
        viewToApply: 25
      };
      
      const score = service.calculateEngagementScore(stats, conversionRate);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(10);
    });
    
    test('calculateEngagementScore يجب أن يرجع 0 عند عدم وجود تفاعلات', () => {
      const stats = {
        job: {
          totalInteractions: 0
        }
      };
      
      const conversionRate = {
        viewToApply: 0
      };
      
      const score = service.calculateEngagementScore(stats, conversionRate);
      
      expect(score).toBe(0);
    });
  });
  
  describe('Score Adjustment', () => {
    test('adjustScoreBasedOnPreferences يجب أن يضبط الدرجة بشكل صحيح', () => {
      const recommendation = {
        score: 70,
        toObject: () => ({ score: 70 })
      };
      
      const preferences = {
        interactionWeights: {
          totalWeight: 10
        },
        patterns: {
          scorePatterns: {
            overall: {
              avg: 60
            }
          }
        }
      };
      
      const adjustedScore = service.adjustScoreBasedOnPreferences(recommendation, preferences);
      
      expect(adjustedScore).toBeGreaterThan(70);
      expect(adjustedScore).toBeLessThanOrEqual(100);
    });
    
    test('adjustScoreBasedOnPreferences يجب أن يحافظ على الدرجة بين 0 و 100', () => {
      const recommendation = {
        score: 95,
        toObject: () => ({ score: 95 })
      };
      
      const preferences = {
        interactionWeights: {
          totalWeight: 100
        },
        patterns: {
          scorePatterns: {
            overall: {
              avg: 50
            }
          }
        }
      };
      
      const adjustedScore = service.adjustScoreBasedOnPreferences(recommendation, preferences);
      
      expect(adjustedScore).toBeGreaterThanOrEqual(0);
      expect(adjustedScore).toBeLessThanOrEqual(100);
    });
  });
});

describe('Integration Tests', () => {
  test('النظام يجب أن يتتبع جميع أنواع التفاعلات', () => {
    const validActions = ['view', 'like', 'apply', 'ignore', 'save'];
    const actionEnum = UserInteraction.schema.path('action').enumValues;
    
    validActions.forEach(action => {
      expect(actionEnum).toContain(action);
    });
  });
  
  test('النظام يجب أن يدعم جميع أنواع العناصر', () => {
    const validItemTypes = ['job', 'course', 'candidate'];
    const itemTypeEnum = UserInteraction.schema.path('itemType').enumValues;
    
    validItemTypes.forEach(itemType => {
      expect(itemTypeEnum).toContain(itemType);
    });
  });
  
  test('النظام يجب أن يحتوي على جميع الفهارس المطلوبة', () => {
    const indexes = UserInteraction.schema.indexes();
    
    expect(indexes.length).toBeGreaterThan(0);
    
    // التحقق من وجود فهرس userId
    const userIdIndex = indexes.find(idx => 
      idx[0].userId === 1
    );
    expect(userIdIndex).toBeDefined();
  });
});
