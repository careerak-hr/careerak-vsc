/**
 * Statistics Calculations Property-Based Tests
 * 
 * Property 4: Real-Time Statistics Accuracy
 * 
 * Validates: Requirements 2.1-2.6, 12.1, 12.2
 * 
 * This test suite validates the correctness of statistics calculations
 * using property-based testing with fast-check library.
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const { User } = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const JobApplication = require('../src/models/JobApplication');
const EducationalCourse = require('../src/models/EducationalCourse');
const Review = require('../src/models/Review');
const {
  getUserStatistics,
  getJobStatistics,
  getCourseStatistics,
  getReviewStatistics,
  calculateGrowthRate,
  clearCache
} = require('../src/services/statisticsService');

describe('Statistics Property-Based Tests', () => {
  
  /**
   * Property 4.1: Growth Rate Calculation Correctness
   * 
   * For any pair of numbers (current, previous), the growth rate calculation
   * should follow mathematical rules:
   * - If previous = 0 and current > 0: growth = 100%
   * - If previous = 0 and current = 0: growth = 0%
   * - If previous > 0 and current = 0: growth = -100%
   * - Otherwise: growth = ((current - previous) / previous) * 100
   * 
   * This property ensures that:
   * 1. Growth rate calculation is mathematically correct
   * 2. Edge cases (zero values) are handled properly
   * 3. Large numbers don't cause overflow
   * 4. Negative growth is calculated correctly
   * 
   * Validates: Requirement 12.1 (Growth rate calculation)
   * 
   * NOTE: These tests do NOT require database connection
   */
  describe('Property 4.1: Growth Rate Calculation Correctness', () => {
    
    it('should calculate positive growth rate correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (current, previous) => {
            fc.pre(current > previous); // Ensure positive growth
            
            const growthRate = calculateGrowthRate(current, previous);
            
            // Property: Growth rate should be positive
            expect(growthRate).toBeGreaterThan(0);
            
            // Property: Growth rate should match formula
            const expectedGrowth = ((current - previous) / previous) * 100;
            expect(growthRate).toBeCloseTo(expectedGrowth, 10);
            
            // Property: If current is double previous, growth should be 100%
            if (current === previous * 2) {
              expect(growthRate).toBeCloseTo(100, 5);
            }
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
    
    it('should calculate negative growth rate correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          fc.integer({ min: 1, max: 1000000 }),
          (current, previous) => {
            fc.pre(current < previous); // Ensure negative growth
            
            const growthRate = calculateGrowthRate(current, previous);
            
            // Property: Growth rate should be negative
            expect(growthRate).toBeLessThan(0);
            
            // Property: Growth rate should match formula
            const expectedGrowth = ((current - previous) / previous) * 100;
            expect(growthRate).toBeCloseTo(expectedGrowth, 10);
            
            // Property: If current is half of previous, growth should be -50%
            if (current === Math.floor(previous / 2)) {
              expect(growthRate).toBeCloseTo(-50, 5);
            }
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
    
    it('should handle zero previous value correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          (current) => {
            const previous = 0;
            const growthRate = calculateGrowthRate(current, previous);
            
            // Property: If previous is 0 and current > 0, growth should be 100%
            if (current > 0) {
              expect(growthRate).toBe(100);
            }
            
            // Property: If both are 0, growth should be 0%
            if (current === 0) {
              expect(growthRate).toBe(0);
            }
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
    
    it('should handle zero current value correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (previous) => {
            const current = 0;
            const growthRate = calculateGrowthRate(current, previous);
            
            // Property: If current is 0 and previous > 0, growth should be -100%
            expect(growthRate).toBe(-100);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
    
    it('should handle both values being zero', () => {
      const growthRate = calculateGrowthRate(0, 0);
      
      // Property: If both values are 0, growth should be 0%
      expect(growthRate).toBe(0);
    });
    
    it('should handle large numbers without overflow', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000, max: Math.floor(Number.MAX_SAFE_INTEGER / 100) }),
          fc.integer({ min: 1000000, max: Math.floor(Number.MAX_SAFE_INTEGER / 100) }),
          (current, previous) => {
            const growthRate = calculateGrowthRate(current, previous);
            
            // Property: Growth rate should be a finite number
            expect(Number.isFinite(growthRate)).toBe(true);
            
            // Property: Growth rate should not be NaN
            expect(Number.isNaN(growthRate)).toBe(false);
            
            // Property: Growth rate should match formula
            const expectedGrowth = ((current - previous) / previous) * 100;
            expect(growthRate).toBeCloseTo(expectedGrowth, 5);
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });
    
    it('should be consistent for same inputs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (current, previous) => {
            // Property: Multiple calls with same inputs should return same result
            const result1 = calculateGrowthRate(current, previous);
            const result2 = calculateGrowthRate(current, previous);
            const result3 = calculateGrowthRate(current, previous);
            
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
    
    it('should handle equal values (zero growth)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000000 }),
          (value) => {
            const growthRate = calculateGrowthRate(value, value);
            
            // Property: If current equals previous, growth should be 0%
            expect(growthRate).toBe(0);
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
    
  });
  
  /**
   * Property 4.2: User Statistics Accuracy
   * 
   * For any time period, user statistics should accurately count users
   * and calculate growth rates correctly.
   * 
   * This property ensures that:
   * 1. User counts are accurate for any time period
   * 2. Growth rates are calculated correctly
   * 3. Empty database returns zero counts
   * 4. User type breakdown is accurate
   * 
   * Validates: Requirements 2.1, 12.1, 12.2
   * 
   * NOTE: These tests REQUIRE database connection
   */
  describe('Property 4.2: User Statistics Accuracy', () => {
    
    // Setup database connection
    beforeAll(async () => {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test';
      if (mongoose.connection.readyState === 0) {
        try {
          await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
          });
        } catch (error) {
          console.warn('MongoDB not available, skipping user statistics tests');
        }
      }
    }, 60000);
    
    afterAll(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    }, 60000);
    
    // Clean up test data after each test
    afterEach(async () => {
      if (mongoose.connection.readyState === 1) {
        await User.deleteMany({ email: /test-stats-/ });
        clearCache(); // Clear cache after each test
      }
    }, 30000);
    
    // Helper to check if DB is available
    const isDBAvailable = () => mongoose.connection.readyState === 1;
    
    it('should return zero counts for empty database', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      // Ensure no test users exist
      await User.deleteMany({ email: /test-stats-/ });
      clearCache();
      
      const now = new Date();
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const stats = await getUserStatistics({ startDate: start, endDate: now });
      
      // Property: Empty database should return zero counts
      expect(stats.current.total).toBe(0);
      expect(stats.previous.total).toBe(0);
      expect(stats.growthRate).toBe(0);
      expect(stats.current.byType.HR).toBe(0);
      expect(stats.current.byType.Employee).toBe(0);
      expect(stats.current.byType.Admin).toBe(0);
    }, 30000);
    
    it('should count users accurately for any time period', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }), // Number of users to create
          fc.constantFrom('HR', 'Employee', 'Admin'), // User role
          async (userCount, role) => {
            // Clean up before test
            await User.deleteMany({ email: /test-stats-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create users in current period
            const users = [];
            for (let i = 0; i < userCount; i++) {
              const user = await User.create({
                name: `Test User ${i}`,
                email: `test-stats-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: role,
                createdAt: new Date(start.getTime() + (i * 1000)) // Spread across period
              });
              users.push(user);
            }
            
            // Get statistics
            const stats = await getUserStatistics({ startDate: start, endDate: now });
            
            // Property: Current total should match created users
            expect(stats.current.total).toBe(userCount);
            
            // Property: User type count should match
            expect(stats.current.byType[role]).toBe(userCount);
            
            // Property: Previous period should be 0 (no users created there)
            expect(stats.previous.total).toBe(0);
            
            // Property: Growth rate should be 100% (from 0 to userCount)
            expect(stats.growthRate).toBe(100);
            
            // Clean up
            await User.deleteMany({ _id: { $in: users.map(u => u._id) } });
            clearCache();
          }
        ),
        { numRuns: 10, verbose: true }
      );
    }, 120000);
    
    it('should calculate growth rate correctly across periods', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }), // Previous period users
          fc.integer({ min: 1, max: 5 }), // Current period users
          async (previousCount, currentCount) => {
            // Clean up before test
            await User.deleteMany({ email: /test-stats-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const previousStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
            
            // Create users in previous period
            const previousUsers = [];
            for (let i = 0; i < previousCount; i++) {
              const user = await User.create({
                name: `Previous User ${i}`,
                email: `test-stats-prev-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: 'Employee',
                createdAt: new Date(previousStart.getTime() + (i * 1000))
              });
              previousUsers.push(user);
            }
            
            // Create users in current period
            const currentUsers = [];
            for (let i = 0; i < currentCount; i++) {
              const user = await User.create({
                name: `Current User ${i}`,
                email: `test-stats-curr-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: 'Employee',
                createdAt: new Date(start.getTime() + (i * 1000))
              });
              currentUsers.push(user);
            }
            
            // Get statistics
            const stats = await getUserStatistics({ startDate: start, endDate: now });
            
            // Property: Counts should match
            expect(stats.current.total).toBe(currentCount);
            expect(stats.previous.total).toBe(previousCount);
            
            // Property: Growth rate should match calculation
            const expectedGrowth = calculateGrowthRate(currentCount, previousCount);
            expect(stats.growthRate).toBeCloseTo(expectedGrowth, 5);
            
            // Clean up
            await User.deleteMany({
              _id: { $in: [...previousUsers, ...currentUsers].map(u => u._id) }
            });
            clearCache();
          }
        ),
        { numRuns: 10, verbose: true }
      );
    }, 180000);
    
  });
  
  /**
   * Property 4.3: Job Statistics Accuracy
   * 
   * For any time period, job statistics should accurately count jobs
   * and applications.
   * 
   * This property ensures that:
   * 1. Job counts are accurate
   * 2. Application counts are accurate
   * 3. Growth rates are calculated correctly
   * 4. Status breakdowns are accurate
   * 
   * Validates: Requirements 2.2, 12.1, 12.2
   */
  describe('Property 4.3: Job Statistics Accuracy', () => {
    
    beforeAll(async () => {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test';
      if (mongoose.connection.readyState === 0) {
        try {
          await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
          });
        } catch (error) {
          console.warn('MongoDB not available, skipping job statistics tests');
        }
      }
    }, 60000);
    
    afterAll(async () => {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    }, 60000);
    
    afterEach(async () => {
      if (mongoose.connection.readyState === 1) {
        await JobPosting.deleteMany({ title: /test-stats-/ });
        await JobApplication.deleteMany({ coverLetter: /test-stats-/ });
        clearCache();
      }
    }, 30000);
    
    const isDBAvailable = () => mongoose.connection.readyState === 1;
    
    it('should return zero counts for empty database', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await JobPosting.deleteMany({ title: /test-stats-/ });
      await JobApplication.deleteMany({ coverLetter: /test-stats-/ });
      clearCache();
      
      const now = new Date();
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const stats = await getJobStatistics({ startDate: start, endDate: now });
      
      // Property: Empty database should return zero counts
      expect(stats.jobs.current).toBe(0);
      expect(stats.jobs.previous).toBe(0);
      expect(stats.applications.current).toBe(0);
      expect(stats.applications.previous).toBe(0);
    }, 30000);
    
    it('should count jobs and applications accurately', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }), // Number of jobs
          fc.integer({ min: 1, max: 3 }), // Applications per job
          async (jobCount, appsPerJob) => {
            // Clean up
            await JobPosting.deleteMany({ title: /test-stats-/ });
            await JobApplication.deleteMany({ coverLetter: /test-stats-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test user for job posting
            const testUser = await User.create({
              name: 'Test HR',
              email: `test-stats-hr-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'HR'
            });
            
            // Create jobs
            const jobs = [];
            for (let i = 0; i < jobCount; i++) {
              const job = await JobPosting.create({
                title: `test-stats-job-${Date.now()}-${i}`,
                description: 'Test job description',
                company: testUser._id,
                location: 'Test Location',
                salary: 50000,
                status: 'Open',
                createdAt: new Date(start.getTime() + (i * 1000))
              });
              jobs.push(job);
              
              // Create applications for this job
              for (let j = 0; j < appsPerJob; j++) {
                await JobApplication.create({
                  job: job._id,
                  applicant: testUser._id,
                  coverLetter: `test-stats-application-${Date.now()}-${i}-${j}`,
                  status: 'Pending',
                  appliedAt: new Date(start.getTime() + (i * 1000) + (j * 100))
                });
              }
            }
            
            // Get statistics
            const stats = await getJobStatistics({ startDate: start, endDate: now });
            
            // Property: Job count should match
            expect(stats.jobs.current).toBe(jobCount);
            
            // Property: Application count should match
            const expectedApps = jobCount * appsPerJob;
            expect(stats.applications.current).toBe(expectedApps);
            
            // Clean up
            await JobPosting.deleteMany({ _id: { $in: jobs.map(j => j._id) } });
            await JobApplication.deleteMany({ job: { $in: jobs.map(j => j._id) } });
            await User.deleteOne({ _id: testUser._id });
            clearCache();
          }
        ),
        { numRuns: 5, verbose: true }
      );
    }, 180000);
    
  });
  
  /**
   * Property 4.4: Time Period Equivalence
   * 
   * For equivalent time periods (same duration), the growth rate calculation
   * should be consistent regardless of the actual dates.
   * 
   * This property ensures that:
   * 1. Growth rate depends only on counts, not dates
   * 2. Different time periods with same counts give same growth rate
   * 3. Time period duration is calculated correctly
   * 
   * Validates: Requirement 12.2 (Time period comparison)
   */
  describe('Property 4.4: Time Period Equivalence', () => {
    
    it('should calculate same growth rate for equivalent periods', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 1000 }),
          (count1, count2) => {
            // Calculate growth rate
            const growthRate = calculateGrowthRate(count1, count2);
            
            // Property: Same counts should give same growth rate regardless of context
            const growthRate2 = calculateGrowthRate(count1, count2);
            expect(growthRate).toBe(growthRate2);
            
            // Property: Growth rate should be symmetric for swapped values
            const reverseGrowth = calculateGrowthRate(count2, count1);
            if (count1 !== count2 && count1 !== 0 && count2 !== 0) {
              // If we swap current and previous, the magnitude should be related
              // but not necessarily equal (due to different denominators)
              expect(Math.sign(growthRate)).toBe(-Math.sign(reverseGrowth));
            }
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
    
    it('should handle fractional growth rates correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }),
          fc.integer({ min: 1, max: 99 }),
          (previous, change) => {
            const current = previous + change;
            const growthRate = calculateGrowthRate(current, previous);
            
            // Property: Small changes should result in small growth rates
            const expectedGrowth = (change / previous) * 100;
            expect(growthRate).toBeCloseTo(expectedGrowth, 10);
            
            // Property: Growth rate should be positive for increase
            expect(growthRate).toBeGreaterThan(0);
            
            // Property: Growth rate should be less than 100% for small changes
            if (change < previous) {
              expect(growthRate).toBeLessThan(100);
            }
          }
        ),
        { numRuns: 100, verbose: true }
      );
    });
    
    it('should maintain precision for large numbers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000, max: 10000000 }),
          fc.integer({ min: 1, max: 100 }),
          (base, percentChange) => {
            const previous = base;
            const current = Math.floor(base * (1 + percentChange / 100));
            
            const growthRate = calculateGrowthRate(current, previous);
            
            // Property: Growth rate should be close to the intended percent change
            expect(growthRate).toBeCloseTo(percentChange, 0);
            
            // Property: Result should be finite
            expect(Number.isFinite(growthRate)).toBe(true);
          }
        ),
        { numRuns: 50, verbose: true }
      );
    });
    
  });
  
});
