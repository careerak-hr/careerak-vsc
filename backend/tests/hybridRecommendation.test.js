/**
 * Hybrid Recommendation Tests
 * 
 * اختبارات شاملة لخدمة Hybrid Recommendation
 */

const HybridRecommendation = require('../src/services/hybridRecommendation');
const ContentBasedFiltering = require('../src/services/contentBasedFiltering');
const CollaborativeFiltering = require('../src/services/collaborativeFiltering');
const mongoose = require('../src/services/hybridRecommendation');

// Mock the services
jest.mock('../src/services/contentBasedFiltering');
jest.mock('../src/services/collaborativeFiltering');

describe('HybridRecommendation Service', () => {
  let hybridRecommendation;
  let mockContentBased;
  let mockCollaborative;

  beforeEach(() => {
    hybridRecommendation = new HybridRecommendation();
    mockContentBased = hybridRecommendation.contentBased;
    mockCollaborative = hybridRecommendation.collaborative;
    jest.clearAllMocks();
  });

  describe('mergeRecommendations', () => {
    it('should merge recommendations from both models', () => {
      const contentRecs = [
        {
          job: { _id: 'job1', title: 'Job 1' },
          score: 80,
          reasons: ['مهارات متطابقة']
        },
        {
          job: { _id: 'job2', title: 'Job 2' },
          score: 70,
          reasons: ['خبرة مناسبة']
        }
      ];

      const collaborativeRecs = [
        {
          job: { _id: 'job1', title: 'Job 1' },
          score: 75,
          reasons: ['مستخدمين مشابهين أعجبوا']
        },
        {
          job: { _id: 'job3', title: 'Job 3' },
          score: 65,
          reasons: ['توصية من مستخدمين مشابهين']
        }
      ];

      const merged = hybridRecommendation.mergeRecommendations(
        contentRecs,
        collaborativeRecs,
        0.6,
        0.4
      );

      expect(merged.length).toBe(3); // job1, job2, job3
      
      // job1 should be hybrid (in both)
      const job1 = merged.find(r => r.job._id === 'job1');
      expect(job1.source).toBe('hybrid');
      expect(job1.contentScore).toBe(80);
      expect(job1.collaborativeScore).toBe(75);
      expect(job1.finalScore).toBeCloseTo(80 * 0.6 + 75 * 0.4, 1);

      // job2 should be content only
      const job2 = merged.find(r => r.job._id === 'job2');
      expect(job2.source).toBe('content');
      expect(job2.contentScore).toBe(70);
      expect(job2.collaborativeScore).toBe(0);

      // job3 should be collaborative only
      const job3 = merged.find(r => r.job._id === 'job3');
      expect(job3.source).toBe('collaborative');
      expect(job3.contentScore).toBe(0);
      expect(job3.collaborativeScore).toBe(65);
    });

    it('should add hybrid reason for jobs in both models', () => {
      const contentRecs = [
        {
          job: { _id: 'job1', title: 'Job 1' },
          score: 80,
          reasons: ['مهارات متطابقة']
        }
      ];

      const collaborativeRecs = [
        {
          job: { _id: 'job1', title: 'Job 1' },
          score: 75,
          reasons: ['مستخدمين مشابهين']
        }
      ];

      const merged = hybridRecommendation.mergeRecommendations(
        contentRecs,
        collaborativeRecs,
        0.6,
        0.4
      );

      const job1 = merged[0];
      expect(job1.reasons[0]).toContain('توصية قوية');
    });

    it('should handle empty content recommendations', () => {
      const collaborativeRecs = [
        {
          job: { _id: 'job1', title: 'Job 1' },
          score: 75,
          reasons: ['مستخدمين مشابهين']
        }
      ];

      const merged = hybridRecommendation.mergeRecommendations(
        [],
        collaborativeRecs,
        0.6,
        0.4
      );

      expect(merged.length).toBe(1);
      expect(merged[0].source).toBe('collaborative');
    });

    it('should handle empty collaborative recommendations', () => {
      const contentRecs = [
        {
          job: { _id: 'job1', title: 'Job 1' },
          score: 80,
          reasons: ['مهارات متطابقة']
        }
      ];

      const merged = hybridRecommendation.mergeRecommendations(
        contentRecs,
        [],
        0.6,
        0.4
      );

      expect(merged.length).toBe(1);
      expect(merged[0].source).toBe('content');
    });
  });

  describe('determineOptimalWeights', () => {
    it('should return high content weight for new users', async () => {
      const UserInteraction = require('../src/models/UserInteraction');
      UserInteraction.countDocuments = jest.fn().mockResolvedValue(3);

      const weights = await hybridRecommendation.determineOptimalWeights('user1');

      expect(weights.contentBased).toBe(0.9);
      expect(weights.collaborative).toBe(0.1);
      expect(weights.reason).toContain('مستخدم جديد');
    });

    it('should return balanced weights for active users', async () => {
      const UserInteraction = require('../src/models/UserInteraction');
      UserInteraction.countDocuments = jest.fn().mockResolvedValue(15);

      const weights = await hybridRecommendation.determineOptimalWeights('user1');

      expect(weights.contentBased).toBe(0.7);
      expect(weights.collaborative).toBe(0.3);
      expect(weights.reason).toContain('مستخدم نشط');
    });

    it('should return equal weights for very active users', async () => {
      const UserInteraction = require('../src/models/UserInteraction');
      UserInteraction.countDocuments = jest.fn().mockResolvedValue(50);

      const weights = await hybridRecommendation.determineOptimalWeights('user1');

      expect(weights.contentBased).toBe(0.5);
      expect(weights.collaborative).toBe(0.5);
      expect(weights.reason).toContain('نشط جداً');
    });

    it('should return default weights on error', async () => {
      const UserInteraction = require('../src/models/UserInteraction');
      UserInteraction.countDocuments = jest.fn().mockRejectedValue(new Error('DB error'));

      const weights = await hybridRecommendation.determineOptimalWeights('user1');

      expect(weights).toEqual(hybridRecommendation.defaultWeights);
    });
  });

  describe('evaluateRecommendations', () => {
    it('should calculate precision correctly', async () => {
      const UserInteraction = require('../src/models/UserInteraction');
      const mockInteractions = [
        { itemId: 'job1', action: 'like' },
        { itemId: 'job2', action: 'apply' }
      ];

      UserInteraction.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInteractions)
      });

      const recommendations = [
        { job: { _id: 'job1' }, finalScore: 80 },
        { job: { _id: 'job2' }, finalScore: 75 },
        { job: { _id: 'job3' }, finalScore: 70 },
        { job: { _id: 'job4' }, finalScore: 65 }
      ];

      const evaluation = await hybridRecommendation.evaluateRecommendations('user1', recommendations);

      expect(evaluation.totalRecommendations).toBe(4);
      expect(evaluation.hits).toBe(2);
      expect(evaluation.precision).toBe('50.00%');
      expect(evaluation.quality).toBe('good'); // 50% is good, not excellent
    });

    it('should handle empty recommendations', async () => {
      const UserInteraction = require('../src/models/UserInteraction');
      UserInteraction.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });

      const evaluation = await hybridRecommendation.evaluateRecommendations('user1', []);

      expect(evaluation.totalRecommendations).toBe(0);
      expect(evaluation.hits).toBe(0);
      expect(evaluation.precision).toBe('0.00%');
    });

    it('should classify quality correctly', async () => {
      const UserInteraction = require('../src/models/UserInteraction');
      UserInteraction.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { itemId: 'job1', action: 'like' }
        ])
      });

      // Test excellent quality (>50%)
      let recommendations = [
        { job: { _id: 'job1' }, finalScore: 80 }
      ];
      let evaluation = await hybridRecommendation.evaluateRecommendations('user1', recommendations);
      expect(evaluation.quality).toBe('excellent'); // 100% precision

      // Test good quality (30-50%)
      recommendations = [
        { job: { _id: 'job1' }, finalScore: 80 },
        { job: { _id: 'job2' }, finalScore: 75 },
        { job: { _id: 'job3' }, finalScore: 70 }
      ];
      evaluation = await hybridRecommendation.evaluateRecommendations('user1', recommendations);
      expect(evaluation.quality).toBe('good'); // 33.33% precision

      // Test needs improvement (<30%)
      recommendations = [
        { job: { _id: 'job2' }, finalScore: 75 },
        { job: { _id: 'job3' }, finalScore: 70 },
        { job: { _id: 'job4' }, finalScore: 65 },
        { job: { _id: 'job5' }, finalScore: 60 },
        { job: { _id: 'job6' }, finalScore: 55 }
      ];
      evaluation = await hybridRecommendation.evaluateRecommendations('user1', recommendations);
      expect(evaluation.quality).toBe('needs improvement'); // 0% precision
    });
  });

  describe('Integration', () => {
    it('should use both content and collaborative filtering', () => {
      expect(hybridRecommendation.contentBased).toBeInstanceOf(ContentBasedFiltering);
      expect(hybridRecommendation.collaborative).toBeInstanceOf(CollaborativeFiltering);
    });

    it('should have default weights', () => {
      expect(hybridRecommendation.defaultWeights.contentBased).toBe(0.6);
      expect(hybridRecommendation.defaultWeights.collaborative).toBe(0.4);
    });
  });
});
