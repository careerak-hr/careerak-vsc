/**
 * Unit Tests for Statistics Service
 * 
 * Tests Requirements: 2.1-2.6
 * 
 * Test Cases:
 * 1. Growth rate calculation with zero previous value
 * 2. Statistics with empty database
 * 3. Date range filtering edge cases
 */

const {
  getUserStatistics,
  getJobStatistics,
  getCourseStatistics,
  getReviewStatistics,
  getActiveUsersCount,
  calculateGrowthRate,
  clearCache
} = require('../src/services/statisticsService');

const { User } = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const JobApplication = require('../src/models/JobApplication');
const EducationalCourse = require('../src/models/EducationalCourse');
const Review = require('../src/models/Review');

// Mock the models
jest.mock('../src/models/User');
jest.mock('../src/models/JobPosting');
jest.mock('../src/models/JobApplication');
jest.mock('../src/models/EducationalCourse');
jest.mock('../src/models/Review');

describe('Statistics Service - Unit Tests', () => {
  
  beforeEach(() => {
    // Clear cache before each test
    clearCache();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('calculateGrowthRate', () => {
    
    test('should return 100% when previous value is 0 and current > 0', () => {
      // Test case: Growth from 0 to any positive number
      const result = calculateGrowthRate(10, 0);
      expect(result).toBe(100);
    });

    test('should return 0% when both previous and current are 0', () => {
      // Test case: No growth when both are zero
      const result = calculateGrowthRate(0, 0);
      expect(result).toBe(0);
    });

    test('should return correct positive growth rate', () => {
      // Test case: 50% growth (from 100 to 150)
      const result = calculateGrowthRate(150, 100);
      expect(result).toBe(50);
    });

    test('should return correct negative growth rate', () => {
      // Test case: -25% growth (from 100 to 75)
      const result = calculateGrowthRate(75, 100);
      expect(result).toBe(-25);
    });

    test('should handle decimal values correctly', () => {
      // Test case: Growth with decimal values
      const result = calculateGrowthRate(33, 30);
      expect(result).toBeCloseTo(10, 1); // 10% growth
    });
  });

  describe('getUserStatistics - Empty Database', () => {
    
    test('should return zero counts when database is empty', async () => {
      // Mock empty database
      User.countDocuments = jest.fn().mockResolvedValue(0);
      User.aggregate = jest.fn().mockResolvedValue([]);

      const result = await getUserStatistics();

      expect(result.current.total).toBe(0);
      expect(result.previous.total).toBe(0);
      expect(result.current.byType).toEqual({ HR: 0, Employee: 0, Admin: 0 });
      expect(result.previous.byType).toEqual({ HR: 0, Employee: 0, Admin: 0 });
      expect(result.growthRate).toBe(0);
    });

    test('should return 100% growth when previous is 0 and current > 0', async () => {
      // Mock: 0 users in previous period, 5 users in current period
      User.countDocuments = jest.fn()
        .mockResolvedValueOnce(5)  // current total
        .mockResolvedValueOnce(0); // previous total
      
      User.aggregate = jest.fn()
        .mockResolvedValueOnce([    // current by type
          { _id: 'Employee', count: 3 },
          { _id: 'HR', count: 2 }
        ])
        .mockResolvedValueOnce([]); // previous by type (empty)

      const result = await getUserStatistics();

      expect(result.current.total).toBe(5);
      expect(result.previous.total).toBe(0);
      expect(result.growthRate).toBe(100);
    });
  });

  describe('getJobStatistics - Empty Database', () => {
    
    test('should return zero counts when database is empty', async () => {
      // Mock empty database
      JobPosting.countDocuments = jest.fn().mockResolvedValue(0);
      JobApplication.countDocuments = jest.fn().mockResolvedValue(0);
      JobPosting.aggregate = jest.fn().mockResolvedValue([]);
      JobApplication.aggregate = jest.fn().mockResolvedValue([]);

      const result = await getJobStatistics();

      expect(result.jobs.current).toBe(0);
      expect(result.jobs.previous).toBe(0);
      expect(result.applications.current).toBe(0);
      expect(result.applications.previous).toBe(0);
      expect(result.jobs.growthRate).toBe(0);
      expect(result.applications.growthRate).toBe(0);
    });

    test('should handle jobs with no applications', async () => {
      // Mock: 10 jobs but 0 applications
      JobPosting.countDocuments = jest.fn()
        .mockResolvedValueOnce(10)  // current jobs
        .mockResolvedValueOnce(5);  // previous jobs
      
      JobApplication.countDocuments = jest.fn()
        .mockResolvedValueOnce(0)   // current applications
        .mockResolvedValueOnce(0);  // previous applications
      
      JobPosting.aggregate = jest.fn().mockResolvedValue([
        { _id: 'Open', count: 8 },
        { _id: 'Closed', count: 2 }
      ]);
      
      JobApplication.aggregate = jest.fn().mockResolvedValue([]);

      const result = await getJobStatistics();

      expect(result.jobs.current).toBe(10);
      expect(result.jobs.growthRate).toBe(100); // 100% growth from 5 to 10
      expect(result.applications.current).toBe(0);
      expect(result.applications.growthRate).toBe(0);
    });
  });

  describe('getCourseStatistics - Empty Database', () => {
    
    test('should return zero counts when database is empty', async () => {
      // Mock empty database
      EducationalCourse.countDocuments = jest.fn().mockResolvedValue(0);
      EducationalCourse.aggregate = jest.fn()
        .mockResolvedValueOnce([])  // by status
        .mockResolvedValueOnce([{   // enrollment stats
          totalEnrollments: 0,
          currentPeriodEnrollments: 0,
          previousPeriodEnrollments: 0
        }]);

      const result = await getCourseStatistics();

      expect(result.courses.current).toBe(0);
      expect(result.courses.previous).toBe(0);
      expect(result.enrollments.total).toBe(0);
      expect(result.enrollments.current).toBe(0);
      expect(result.enrollments.previous).toBe(0);
      expect(result.courses.growthRate).toBe(0);
      expect(result.enrollments.growthRate).toBe(0);
    });

    test('should handle courses with no enrollments', async () => {
      // Mock: 5 courses but 0 enrollments
      EducationalCourse.countDocuments = jest.fn()
        .mockResolvedValueOnce(5)   // current courses
        .mockResolvedValueOnce(3);  // previous courses
      
      EducationalCourse.aggregate = jest.fn()
        .mockResolvedValueOnce([     // by status
          { _id: 'Published', count: 4 },
          { _id: 'Draft', count: 1 }
        ])
        .mockResolvedValueOnce([{    // enrollment stats
          totalEnrollments: 0,
          currentPeriodEnrollments: 0,
          previousPeriodEnrollments: 0
        }]);

      const result = await getCourseStatistics();

      expect(result.courses.current).toBe(5);
      expect(result.courses.growthRate).toBeCloseTo(66.67, 1); // ~66.67% growth
      expect(result.enrollments.total).toBe(0);
      expect(result.enrollments.growthRate).toBe(0);
    });
  });

  describe('getReviewStatistics - Empty Database', () => {
    
    test('should return zero counts when database is empty', async () => {
      // Mock empty database
      Review.countDocuments = jest.fn().mockResolvedValue(0);
      Review.aggregate = jest.fn()
        .mockResolvedValueOnce([])  // by status
        .mockResolvedValueOnce([{   // rating stats
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: []
        }]);

      const result = await getReviewStatistics();

      expect(result.reviews.current).toBe(0);
      expect(result.reviews.previous).toBe(0);
      expect(result.ratings.average).toBe(0);
      expect(result.ratings.total).toBe(0);
      expect(result.reviews.growthRate).toBe(0);
    });

    test('should handle reviews with no ratings', async () => {
      // Mock: 10 reviews but no approved ratings
      Review.countDocuments = jest.fn()
        .mockResolvedValueOnce(10)  // current reviews
        .mockResolvedValueOnce(5);  // previous reviews
      
      Review.aggregate = jest.fn()
        .mockResolvedValueOnce([     // by status
          { _id: 'pending', count: 10 }
        ])
        .mockResolvedValueOnce([]);  // no rating stats (empty)

      const result = await getReviewStatistics();

      expect(result.reviews.current).toBe(10);
      expect(result.reviews.growthRate).toBe(100); // 100% growth
      expect(result.ratings.average).toBe(0);
      expect(result.ratings.total).toBe(0);
    });
  });

  describe('Date Range Filtering - Edge Cases', () => {
    
    test('should handle same start and end date', async () => {
      // Test case: Query for a single day
      const sameDate = new Date('2024-01-15T00:00:00Z');
      
      User.countDocuments = jest.fn().mockResolvedValue(5);
      User.aggregate = jest.fn().mockResolvedValue([
        { _id: 'Employee', count: 5 }
      ]);

      const result = await getUserStatistics({
        startDate: sameDate,
        endDate: sameDate
      });

      expect(result.current.total).toBe(5);
      
      // Verify countDocuments was called with correct date range
      expect(User.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: expect.objectContaining({
            $gte: sameDate,
            $lte: sameDate
          })
        })
      );
    });

    test('should handle future date range', async () => {
      // Test case: Query for future dates (should return 0)
      const futureStart = new Date('2030-01-01T00:00:00Z');
      const futureEnd = new Date('2030-12-31T23:59:59Z');
      
      User.countDocuments = jest.fn().mockResolvedValue(0);
      User.aggregate = jest.fn().mockResolvedValue([]);

      const result = await getUserStatistics({
        startDate: futureStart,
        endDate: futureEnd
      });

      expect(result.current.total).toBe(0);
      expect(result.previous.total).toBe(0);
      expect(result.growthRate).toBe(0);
    });

    test('should handle very short time range (1 hour)', async () => {
      // Test case: Query for 1 hour period
      const start = new Date('2024-01-15T10:00:00Z');
      const end = new Date('2024-01-15T11:00:00Z');
      
      JobPosting.countDocuments = jest.fn()
        .mockResolvedValueOnce(2)   // current
        .mockResolvedValueOnce(1);  // previous
      
      JobApplication.countDocuments = jest.fn()
        .mockResolvedValueOnce(5)   // current
        .mockResolvedValueOnce(3);  // previous
      
      JobPosting.aggregate = jest.fn().mockResolvedValue([]);
      JobApplication.aggregate = jest.fn().mockResolvedValue([]);

      const result = await getJobStatistics({
        startDate: start,
        endDate: end
      });

      expect(result.jobs.current).toBe(2);
      expect(result.jobs.previous).toBe(1);
      expect(result.jobs.growthRate).toBe(100); // 100% growth
      expect(result.applications.current).toBe(5);
      expect(result.applications.growthRate).toBeCloseTo(66.67, 1);
    });

    test('should handle very long time range (1 year)', async () => {
      // Test case: Query for 1 year period
      const start = new Date('2023-01-01T00:00:00Z');
      const end = new Date('2023-12-31T23:59:59Z');
      
      EducationalCourse.countDocuments = jest.fn()
        .mockResolvedValueOnce(100)  // current year
        .mockResolvedValueOnce(80);  // previous year
      
      EducationalCourse.aggregate = jest.fn()
        .mockResolvedValueOnce([])   // by status
        .mockResolvedValueOnce([{    // enrollment stats
          totalEnrollments: 500,
          currentPeriodEnrollments: 300,
          previousPeriodEnrollments: 200
        }]);

      const result = await getCourseStatistics({
        startDate: start,
        endDate: end
      });

      expect(result.courses.current).toBe(100);
      expect(result.courses.previous).toBe(80);
      expect(result.courses.growthRate).toBe(25); // 25% growth
      expect(result.enrollments.current).toBe(300);
      expect(result.enrollments.growthRate).toBe(50); // 50% growth
    });

    test('should handle end date before start date (invalid range)', async () => {
      // Test case: Invalid date range (end before start)
      const start = new Date('2024-12-31T23:59:59Z');
      const end = new Date('2024-01-01T00:00:00Z');
      
      // The service should still work but return unexpected results
      // In a real implementation, you might want to validate and throw an error
      User.countDocuments = jest.fn().mockResolvedValue(0);
      User.aggregate = jest.fn().mockResolvedValue([]);

      const result = await getUserStatistics({
        startDate: start,
        endDate: end
      });

      // Should return 0 since the range is invalid
      expect(result.current.total).toBe(0);
    });
  });

  describe('getActiveUsersCount', () => {
    
    test('should return 0 for placeholder implementation', async () => {
      // Current implementation returns 0 (placeholder)
      const result = await getActiveUsersCount();
      expect(result).toBe(0);
    });
  });

  describe('Error Handling', () => {
    
    test('should throw error when database query fails', async () => {
      // Mock database error
      User.countDocuments = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(getUserStatistics()).rejects.toThrow('Failed to fetch user statistics');
    });

    test('should throw error when aggregation fails', async () => {
      // Mock aggregation error
      JobPosting.countDocuments = jest.fn().mockResolvedValue(10);
      JobApplication.countDocuments = jest.fn().mockResolvedValue(5);
      JobPosting.aggregate = jest.fn().mockRejectedValue(new Error('Aggregation failed'));

      await expect(getJobStatistics()).rejects.toThrow('Failed to fetch job statistics');
    });
  });

  describe('Cache Behavior', () => {
    
    test('should use cache on second call with same parameters', async () => {
      // Setup mocks
      User.countDocuments = jest.fn().mockResolvedValue(10);
      User.aggregate = jest.fn().mockResolvedValue([
        { _id: 'Employee', count: 10 }
      ]);

      const options = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      // First call - should hit database
      await getUserStatistics(options);
      expect(User.countDocuments).toHaveBeenCalledTimes(2); // current + previous

      // Clear mock call history
      jest.clearAllMocks();

      // Second call with same parameters - should use cache
      await getUserStatistics(options);
      expect(User.countDocuments).not.toHaveBeenCalled(); // Should not hit database
    });

    test('should not use cache after clearing', async () => {
      // Setup mocks
      User.countDocuments = jest.fn().mockResolvedValue(10);
      User.aggregate = jest.fn().mockResolvedValue([]);

      // First call
      await getUserStatistics();
      expect(User.countDocuments).toHaveBeenCalled();

      // Clear cache
      clearCache();
      jest.clearAllMocks();

      // Second call - should hit database again
      await getUserStatistics();
      expect(User.countDocuments).toHaveBeenCalled();
    });
  });
});
