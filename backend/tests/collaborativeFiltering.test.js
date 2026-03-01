/**
 * Collaborative Filtering Tests
 * 
 * اختبارات شاملة لخدمة Collaborative Filtering
 */

const CollaborativeFiltering = require('../src/services/collaborativeFiltering');
const UserInteraction = require('../src/models/UserInteraction');
const JobPosting = require('../src/models/JobPosting');
const mongoose = require('mongoose');

// Mock the models
jest.mock('../src/models/UserInteraction');
jest.mock('../src/models/JobPosting');

describe('CollaborativeFiltering Service', () => {
  let collaborativeFiltering;

  beforeEach(() => {
    collaborativeFiltering = new CollaborativeFiltering();
    jest.clearAllMocks();
  });

  describe('getInteractionWeight', () => {
    it('should return correct weights for different actions', () => {
      expect(collaborativeFiltering.getInteractionWeight('apply')).toBe(1.0);
      expect(collaborativeFiltering.getInteractionWeight('like')).toBe(0.8);
      expect(collaborativeFiltering.getInteractionWeight('save')).toBe(0.7);
      expect(collaborativeFiltering.getInteractionWeight('view')).toBe(0.3);
      expect(collaborativeFiltering.getInteractionWeight('ignore')).toBe(-0.5);
    });

    it('should return default weight for unknown action', () => {
      expect(collaborativeFiltering.getInteractionWeight('unknown')).toBe(0.5);
    });
  });

  describe('buildUserItemMatrix', () => {
    it('should build matrix from interactions', async () => {
      const mockInteractions = [
        {
          userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          itemId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          itemType: 'job',
          action: 'apply'
        },
        {
          userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          itemId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
          itemType: 'job',
          action: 'like'
        },
        {
          userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
          itemId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          itemType: 'job',
          action: 'view'
        }
      ];

      UserInteraction.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInteractions)
      });

      const matrix = await collaborativeFiltering.buildUserItemMatrix();

      expect(matrix).toBeDefined();
      expect(Object.keys(matrix).length).toBe(2); // 2 users
      expect(matrix['507f1f77bcf86cd799439011']['507f1f77bcf86cd799439012']).toBe(1.0); // apply
      expect(matrix['507f1f77bcf86cd799439011']['507f1f77bcf86cd799439013']).toBe(0.8); // like
      expect(matrix['507f1f77bcf86cd799439014']['507f1f77bcf86cd799439012']).toBe(0.3); // view
    });

    it('should handle empty interactions', async () => {
      UserInteraction.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });

      const matrix = await collaborativeFiltering.buildUserItemMatrix();

      expect(matrix).toEqual({});
    });

    it('should take highest weight for duplicate interactions', async () => {
      const mockInteractions = [
        {
          userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          itemId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          itemType: 'job',
          action: 'view'
        },
        {
          userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          itemId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
          itemType: 'job',
          action: 'apply'
        }
      ];

      UserInteraction.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInteractions)
      });

      const matrix = await collaborativeFiltering.buildUserItemMatrix();

      expect(matrix['507f1f77bcf86cd799439011']['507f1f77bcf86cd799439012']).toBe(1.0); // apply (higher)
    });
  });

  describe('calculateUserSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const user1Items = {
        'job1': 1.0,
        'job2': 0.8,
        'job3': 0.5
      };

      const user2Items = {
        'job1': 0.9,
        'job2': 0.7,
        'job4': 0.6
      };

      const similarity = collaborativeFiltering.calculateUserSimilarity(user1Items, user2Items);

      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should return 0 for users with no common items', () => {
      const user1Items = { 'job1': 1.0 };
      const user2Items = { 'job2': 1.0 };

      const similarity = collaborativeFiltering.calculateUserSimilarity(user1Items, user2Items);

      expect(similarity).toBe(0);
    });

    it('should return 1 for identical users', () => {
      const userItems = {
        'job1': 1.0,
        'job2': 0.8
      };

      const similarity = collaborativeFiltering.calculateUserSimilarity(userItems, userItems);

      expect(similarity).toBeCloseTo(1, 5);
    });
  });

  describe('findSimilarUsers', () => {
    beforeEach(async () => {
      // بناء مصفوفة تجريبية
      collaborativeFiltering.userItemMatrix = {
        'user1': { 'job1': 1.0, 'job2': 0.8 },
        'user2': { 'job1': 0.9, 'job2': 0.7 },
        'user3': { 'job3': 1.0, 'job4': 0.8 },
        'user4': { 'job1': 0.8, 'job3': 0.6 }
      };
      collaborativeFiltering.lastMatrixUpdate = new Date();
    });

    it('should find similar users', async () => {
      const similarUsers = await collaborativeFiltering.findSimilarUsers('user1', 5);

      expect(similarUsers.length).toBeGreaterThan(0);
      expect(similarUsers[0]).toHaveProperty('userId');
      expect(similarUsers[0]).toHaveProperty('similarity');
      expect(similarUsers[0].similarity).toBeGreaterThan(0);
    });

    it('should return users sorted by similarity', async () => {
      const similarUsers = await collaborativeFiltering.findSimilarUsers('user1', 5);

      for (let i = 0; i < similarUsers.length - 1; i++) {
        expect(similarUsers[i].similarity).toBeGreaterThanOrEqual(similarUsers[i + 1].similarity);
      }
    });

    it('should limit results to topK', async () => {
      const similarUsers = await collaborativeFiltering.findSimilarUsers('user1', 2);

      expect(similarUsers.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for user with no interactions', async () => {
      const similarUsers = await collaborativeFiltering.findSimilarUsers('newUser', 5);

      expect(similarUsers).toEqual([]);
    });
  });

  describe('getCollaborativeRecommendations', () => {
    beforeEach(async () => {
      // بناء مصفوفة تجريبية
      collaborativeFiltering.userItemMatrix = {
        'user1': { 'job1': 1.0 },
        'user2': { 'job1': 0.9, 'job2': 0.8 },
        'user3': { 'job1': 0.8, 'job3': 0.7 }
      };
      collaborativeFiltering.lastMatrixUpdate = new Date();

      // Mock JobPosting
      const mockJobs = [
        { _id: 'job2', title: 'Job 2', status: 'active' },
        { _id: 'job3', title: 'Job 3', status: 'active' }
      ];

      JobPosting.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockJobs)
      });
    });

    it('should return collaborative recommendations', async () => {
      const recommendations = await collaborativeFiltering.getCollaborativeRecommendations('user1', 5);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should not recommend jobs user already interacted with', async () => {
      const recommendations = await collaborativeFiltering.getCollaborativeRecommendations('user1', 5);

      const jobIds = recommendations.map(r => r.job._id);
      expect(jobIds).not.toContain('job1'); // user1 already interacted with job1
    });

    it('should include score and reasons', async () => {
      const recommendations = await collaborativeFiltering.getCollaborativeRecommendations('user1', 5);

      if (recommendations.length > 0) {
        expect(recommendations[0]).toHaveProperty('score');
        expect(recommendations[0]).toHaveProperty('reasons');
        expect(Array.isArray(recommendations[0].reasons)).toBe(true);
      }
    });

    it('should return empty array for user with no similar users', async () => {
      collaborativeFiltering.userItemMatrix = {
        'loneUser': { 'job1': 1.0 }
      };

      const recommendations = await collaborativeFiltering.getCollaborativeRecommendations('loneUser', 5);

      expect(recommendations).toEqual([]);
    });
  });

  describe('generateCollaborativeReasons', () => {
    it('should generate appropriate reasons for many supporting users', () => {
      const reasons = collaborativeFiltering.generateCollaborativeReasons(10, 0.8);

      expect(reasons.length).toBeGreaterThan(0);
      expect(reasons.some(r => r.includes('10 مستخدمين'))).toBe(true);
    });

    it('should generate appropriate reasons for few supporting users', () => {
      const reasons = collaborativeFiltering.generateCollaborativeReasons(3, 0.6);

      expect(reasons.length).toBeGreaterThan(0);
      expect(reasons.some(r => r.includes('عدة مستخدمين'))).toBe(true);
    });

    it('should generate appropriate reasons for one supporting user', () => {
      const reasons = collaborativeFiltering.generateCollaborativeReasons(1, 0.5);

      expect(reasons.length).toBeGreaterThan(0);
      expect(reasons.some(r => r.includes('مستخدم بملف مشابه'))).toBe(true);
    });
  });

  describe('getMatrixStats', () => {
    it('should return correct stats', () => {
      collaborativeFiltering.userItemMatrix = {
        'user1': { 'job1': 1.0, 'job2': 0.8 },
        'user2': { 'job1': 0.9 }
      };
      collaborativeFiltering.lastMatrixUpdate = new Date();

      const stats = collaborativeFiltering.getMatrixStats();

      expect(stats.totalUsers).toBe(2);
      expect(stats.totalInteractions).toBe(3);
      expect(parseFloat(stats.averageInteractionsPerUser)).toBeCloseTo(1.5, 1);
    });

    it('should handle empty matrix', () => {
      collaborativeFiltering.userItemMatrix = null;

      const stats = collaborativeFiltering.getMatrixStats();

      expect(stats.totalUsers).toBe(0);
      expect(stats.totalInteractions).toBe(0);
      expect(stats.averageInteractionsPerUser).toBe(0);
    });
  });
});
