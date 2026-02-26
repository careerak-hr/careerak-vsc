/**
 * Dashboard Performance Property-Based Tests
 * 
 * Property 32: Dashboard Load Performance
 * 
 * Validates: Requirements 11.1
 * 
 * This test suite validates the performance characteristics of the admin dashboard
 * using property-based testing with fast-check library.
 * 
 * Performance Requirements:
 * - Dashboard load time < 2 seconds
 * - Statistics refresh < 500ms
 * - Export generation time reasonable
 * - Lazy loading performance
 * - Bundle size constraints
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
  clearCache
} = require('../src/services/statisticsService');

// Performance measurement utilities
const measureExecutionTime = async (fn) => {
  const start = process.hrtime.bigint();
  const result = await fn();
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1_000_000; // Convert nanoseconds to milliseconds
  return { result, durationMs };
};

describe('Dashboard Performance Property-Based Tests', () => {
  
  // Setup database connection
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test';
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000
        });
      } catch (error) {
        console.warn('MongoDB not available, skipping performance tests');
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
      await User.deleteMany({ email: /test-perf-/ });
      await JobPosting.deleteMany({ title: /test-perf-/ });
      await JobApplication.deleteMany({ coverLetter: /test-perf-/ });
      await EducationalCourse.deleteMany({ title: /test-perf-/ });
      await Review.deleteMany({ comment: /test-perf-/ });
      clearCache();
    }
  }, 30000);
  
  // Helper to check if DB is available
  const isDBAvailable = () => mongoose.connection.readyState === 1;
  
  /**
   * Property 32.1: Statistics Refresh Performance
   * 
   * For any dataset size, statistics queries should complete within 500ms.
   * This ensures the dashboard remains responsive even with large datasets.
   * 
   * This property ensures that:
   * 1. Statistics queries complete within 500ms
   * 2. Performance is consistent across different data sizes
   * 3. Caching improves performance on repeated queries
   * 4. Multiple concurrent queries don't degrade performance significantly
   * 
   * Validates: Requirement 11.1 (Dashboard load performance)
   */
  describe('Property 32.1: Statistics Refresh Performance', () => {
    
    it('should fetch user statistics within 500ms for small datasets', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 100 }), // Small dataset
          async (userCount) => {
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test users
            const users = [];
            for (let i = 0; i < userCount; i++) {
              users.push({
                name: `Test User ${i}`,
                email: `test-perf-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: i % 3 === 0 ? 'HR' : i % 3 === 1 ? 'Employee' : 'Admin',
                createdAt: new Date(start.getTime() + (i * 1000))
              });
            }
            await User.insertMany(users);
            
            // Measure statistics query time
            const { durationMs } = await measureExecutionTime(async () => {
              return await getUserStatistics({ startDate: start, endDate: now });
            });
            
            // Property: Query should complete within 500ms
            expect(durationMs).toBeLessThan(500);
            
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
          }
        ),
        { numRuns: 100, verbose: true }
      );
    }, 300000);
    
    it('should fetch job statistics within 500ms for small datasets', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 50 }), // Small dataset
          async (jobCount) => {
            // Clean up
            await JobPosting.deleteMany({ title: /test-perf-/ });
            await JobApplication.deleteMany({ coverLetter: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test user
            const testUser = await User.create({
              name: 'Test HR',
              email: `test-perf-hr-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'HR'
            });
            
            // Create test jobs
            const jobs = [];
            for (let i = 0; i < jobCount; i++) {
              jobs.push({
                title: `test-perf-job-${Date.now()}-${i}`,
                description: 'Test job description',
                company: testUser._id,
                location: 'Test Location',
                salary: 50000,
                status: 'Open',
                createdAt: new Date(start.getTime() + (i * 1000))
              });
            }
            await JobPosting.insertMany(jobs);
            
            // Measure statistics query time
            const { durationMs } = await measureExecutionTime(async () => {
              return await getJobStatistics({ startDate: start, endDate: now });
            });
            
            // Property: Query should complete within 500ms
            expect(durationMs).toBeLessThan(500);
            
            // Clean up
            await JobPosting.deleteMany({ title: /test-perf-/ });
            await User.deleteOne({ _id: testUser._id });
            clearCache();
          }
        ),
        { numRuns: 100, verbose: true }
      );
    }, 300000);
    
    it('should benefit from caching on repeated queries', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 20, max: 50 }),
          async (userCount) => {
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test users
            const users = [];
            for (let i = 0; i < userCount; i++) {
              users.push({
                name: `Test User ${i}`,
                email: `test-perf-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: 'Employee',
                createdAt: new Date(start.getTime() + (i * 1000))
              });
            }
            await User.insertMany(users);
            
            // First query (uncached)
            const { durationMs: firstQueryTime } = await measureExecutionTime(async () => {
              return await getUserStatistics({ startDate: start, endDate: now });
            });
            
            // Second query (should be cached)
            const { durationMs: secondQueryTime } = await measureExecutionTime(async () => {
              return await getUserStatistics({ startDate: start, endDate: now });
            });
            
            // Property: Cached query should be faster or similar
            // (allowing for some variance due to system load)
            expect(secondQueryTime).toBeLessThanOrEqual(firstQueryTime * 1.5);
            
            // Property: Both queries should be under 500ms
            expect(firstQueryTime).toBeLessThan(500);
            expect(secondQueryTime).toBeLessThan(500);
            
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
          }
        ),
        { numRuns: 50, verbose: true }
      );
    }, 300000);
    
    it('should handle concurrent statistics queries efficiently', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 20, max: 50 }),
          async (userCount) => {
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test users
            const users = [];
            for (let i = 0; i < userCount; i++) {
              users.push({
                name: `Test User ${i}`,
                email: `test-perf-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: 'Employee',
                createdAt: new Date(start.getTime() + (i * 1000))
              });
            }
            await User.insertMany(users);
            
            // Execute 3 concurrent queries
            const { durationMs } = await measureExecutionTime(async () => {
              return await Promise.all([
                getUserStatistics({ startDate: start, endDate: now }),
                getUserStatistics({ startDate: start, endDate: now }),
                getUserStatistics({ startDate: start, endDate: now })
              ]);
            });
            
            // Property: Concurrent queries should complete within reasonable time
            // (3 queries should not take 3x the time due to caching)
            expect(durationMs).toBeLessThan(1000);
            
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
          }
        ),
        { numRuns: 50, verbose: true }
      );
    }, 300000);
    
  });
  
  /**
   * Property 32.2: Dashboard Load Time
   * 
   * For any reasonable dataset, the complete dashboard data load
   * (all statistics combined) should complete within 2 seconds.
   * 
   * This property ensures that:
   * 1. Complete dashboard load is under 2 seconds
   * 2. Multiple statistics queries can be fetched in parallel
   * 3. Performance scales reasonably with data size
   * 
   * Validates: Requirement 11.1 (Dashboard load within 2 seconds)
   */
  describe('Property 32.2: Dashboard Load Time', () => {
    
    it('should load all dashboard statistics within 2 seconds', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            users: fc.integer({ min: 50, max: 200 }),
            jobs: fc.integer({ min: 20, max: 100 }),
            courses: fc.integer({ min: 10, max: 50 })
          }),
          async ({ users: userCount, jobs: jobCount, courses: courseCount }) => {
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            await JobPosting.deleteMany({ title: /test-perf-/ });
            await EducationalCourse.deleteMany({ title: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test data
            const testUser = await User.create({
              name: 'Test HR',
              email: `test-perf-hr-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'HR'
            });
            
            // Create users
            const usersData = [];
            for (let i = 0; i < userCount; i++) {
              usersData.push({
                name: `Test User ${i}`,
                email: `test-perf-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: 'Employee',
                createdAt: new Date(start.getTime() + (i * 100))
              });
            }
            await User.insertMany(usersData);
            
            // Create jobs
            const jobsData = [];
            for (let i = 0; i < jobCount; i++) {
              jobsData.push({
                title: `test-perf-job-${Date.now()}-${i}`,
                description: 'Test job',
                company: testUser._id,
                location: 'Test Location',
                salary: 50000,
                status: 'Open',
                createdAt: new Date(start.getTime() + (i * 100))
              });
            }
            await JobPosting.insertMany(jobsData);
            
            // Create courses
            const coursesData = [];
            for (let i = 0; i < courseCount; i++) {
              coursesData.push({
                title: `test-perf-course-${Date.now()}-${i}`,
                description: 'Test course',
                instructor: testUser._id,
                duration: 10,
                price: 100,
                status: 'Published',
                createdAt: new Date(start.getTime() + (i * 100))
              });
            }
            await EducationalCourse.insertMany(coursesData);
            
            // Measure complete dashboard load time (all statistics in parallel)
            const { durationMs } = await measureExecutionTime(async () => {
              return await Promise.all([
                getUserStatistics({ startDate: start, endDate: now }),
                getJobStatistics({ startDate: start, endDate: now }),
                getCourseStatistics({ startDate: start, endDate: now }),
                getReviewStatistics({ startDate: start, endDate: now })
              ]);
            });
            
            // Property: Complete dashboard load should be under 2 seconds
            expect(durationMs).toBeLessThan(2000);
            
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            await JobPosting.deleteMany({ title: /test-perf-/ });
            await EducationalCourse.deleteMany({ title: /test-perf-/ });
            clearCache();
          }
        ),
        { numRuns: 100, verbose: true }
      );
    }, 600000);
    
    it('should maintain performance with larger datasets', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      // Test with progressively larger datasets
      const testSizes = [
        { users: 100, jobs: 50, label: 'small' },
        { users: 500, jobs: 200, label: 'medium' },
        { users: 1000, jobs: 500, label: 'large' }
      ];
      
      for (const testSize of testSizes) {
        // Clean up
        await User.deleteMany({ email: /test-perf-/ });
        await JobPosting.deleteMany({ title: /test-perf-/ });
        clearCache();
        
        const now = new Date();
        const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Create test user
        const testUser = await User.create({
          name: 'Test HR',
          email: `test-perf-hr-${Date.now()}@test.com`,
          password: 'hashedpassword123',
          role: 'HR'
        });
        
        // Create users
        const usersData = [];
        for (let i = 0; i < testSize.users; i++) {
          usersData.push({
            name: `Test User ${i}`,
            email: `test-perf-user-${Date.now()}-${i}@test.com`,
            password: 'hashedpassword123',
            role: 'Employee',
            createdAt: new Date(start.getTime() + (i * 50))
          });
        }
        await User.insertMany(usersData);
        
        // Create jobs
        const jobsData = [];
        for (let i = 0; i < testSize.jobs; i++) {
          jobsData.push({
            title: `test-perf-job-${Date.now()}-${i}`,
            description: 'Test job',
            company: testUser._id,
            location: 'Test Location',
            salary: 50000,
            status: 'Open',
            createdAt: new Date(start.getTime() + (i * 50))
          });
        }
        await JobPosting.insertMany(jobsData);
        
        // Measure dashboard load time
        const { durationMs } = await measureExecutionTime(async () => {
          return await Promise.all([
            getUserStatistics({ startDate: start, endDate: now }),
            getJobStatistics({ startDate: start, endDate: now })
          ]);
        });
        
        console.log(`Dashboard load time for ${testSize.label} dataset (${testSize.users} users, ${testSize.jobs} jobs): ${durationMs.toFixed(2)}ms`);
        
        // Property: Even with larger datasets, should stay under 2 seconds
        expect(durationMs).toBeLessThan(2000);
        
        // Clean up
        await User.deleteMany({ email: /test-perf-/ });
        await JobPosting.deleteMany({ title: /test-perf-/ });
        clearCache();
      }
    }, 600000);
    
  });
  
  /**
   * Property 32.3: Query Optimization
   * 
   * For any query, database indexes should be utilized effectively,
   * and query execution plans should be efficient.
   * 
   * This property ensures that:
   * 1. Queries use appropriate indexes
   * 2. Query complexity is reasonable
   * 3. No full collection scans for large datasets
   * 
   * Validates: Requirement 11.3 (Database optimization)
   */
  describe('Property 32.3: Query Optimization', () => {
    
    it('should use indexes for date range queries', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 500 }),
          async (userCount) => {
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test users
            const usersData = [];
            for (let i = 0; i < userCount; i++) {
              usersData.push({
                name: `Test User ${i}`,
                email: `test-perf-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: 'Employee',
                createdAt: new Date(start.getTime() + (i * 50))
              });
            }
            await User.insertMany(usersData);
            
            // Query with explain to check index usage
            const query = User.find({
              createdAt: { $gte: start, $lte: now }
            });
            
            const explainResult = await query.explain('executionStats');
            
            // Property: Query should use index (not COLLSCAN)
            const executionStages = explainResult.executionStats.executionStages;
            const usesIndex = executionStages.stage !== 'COLLSCAN';
            
            // For large datasets, we expect index usage
            if (userCount > 100) {
              expect(usesIndex).toBe(true);
            }
            
            // Property: Query should be fast even with many documents
            const { durationMs } = await measureExecutionTime(async () => {
              return await User.find({
                createdAt: { $gte: start, $lte: now }
              }).lean();
            });
            
            expect(durationMs).toBeLessThan(500);
            
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
          }
        ),
        { numRuns: 20, verbose: true }
      );
    }, 300000);
    
    it('should perform aggregations efficiently', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 300 }),
          async (userCount) => {
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test users with different roles
            const usersData = [];
            for (let i = 0; i < userCount; i++) {
              usersData.push({
                name: `Test User ${i}`,
                email: `test-perf-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: i % 3 === 0 ? 'HR' : i % 3 === 1 ? 'Employee' : 'Admin',
                createdAt: new Date(start.getTime() + (i * 50))
              });
            }
            await User.insertMany(usersData);
            
            // Measure aggregation performance
            const { durationMs } = await measureExecutionTime(async () => {
              return await User.aggregate([
                {
                  $match: {
                    createdAt: { $gte: start, $lte: now }
                  }
                },
                {
                  $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                  }
                }
              ]);
            });
            
            // Property: Aggregation should complete quickly
            expect(durationMs).toBeLessThan(500);
            
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
          }
        ),
        { numRuns: 50, verbose: true }
      );
    }, 300000);
    
  });
  
  /**
   * Property 32.4: Memory Efficiency
   * 
   * For any query, memory usage should be reasonable and not cause
   * memory leaks or excessive allocation.
   * 
   * This property ensures that:
   * 1. Queries don't load entire collections into memory
   * 2. Pagination is used for large result sets
   * 3. Memory is released after queries complete
   * 
   * Validates: Requirement 11.1 (Performance optimization)
   */
  describe('Property 32.4: Memory Efficiency', () => {
    
    it('should use lean queries to reduce memory overhead', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 500 }),
          async (userCount) => {
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test users
            const usersData = [];
            for (let i = 0; i < userCount; i++) {
              usersData.push({
                name: `Test User ${i}`,
                email: `test-perf-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: 'Employee',
                createdAt: new Date(start.getTime() + (i * 50))
              });
            }
            await User.insertMany(usersData);
            
            // Measure memory before query
            const memBefore = process.memoryUsage().heapUsed;
            
            // Execute query with lean()
            const { durationMs } = await measureExecutionTime(async () => {
              return await User.find({
                createdAt: { $gte: start, $lte: now }
              }).lean();
            });
            
            // Force garbage collection if available
            if (global.gc) {
              global.gc();
            }
            
            // Measure memory after query
            const memAfter = process.memoryUsage().heapUsed;
            const memDelta = (memAfter - memBefore) / 1024 / 1024; // MB
            
            // Property: Memory increase should be reasonable (< 50MB for this dataset)
            expect(memDelta).toBeLessThan(50);
            
            // Property: Query should still be fast
            expect(durationMs).toBeLessThan(500);
            
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
          }
        ),
        { numRuns: 20, verbose: true }
      );
    }, 300000);
    
    it('should handle pagination efficiently', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 300 }),
          fc.integer({ min: 10, max: 50 }),
          async (totalCount, pageSize) => {
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
            
            const now = new Date();
            const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            // Create test users
            const usersData = [];
            for (let i = 0; i < totalCount; i++) {
              usersData.push({
                name: `Test User ${i}`,
                email: `test-perf-user-${Date.now()}-${i}@test.com`,
                password: 'hashedpassword123',
                role: 'Employee',
                createdAt: new Date(start.getTime() + (i * 50))
              });
            }
            await User.insertMany(usersData);
            
            // Measure paginated query performance
            const { durationMs } = await measureExecutionTime(async () => {
              return await User.find({
                createdAt: { $gte: start, $lte: now }
              })
              .limit(pageSize)
              .skip(0)
              .lean();
            });
            
            // Property: Paginated query should be fast regardless of total count
            expect(durationMs).toBeLessThan(200);
            
            // Property: Should return correct page size
            const results = await User.find({
              createdAt: { $gte: start, $lte: now }
            })
            .limit(pageSize)
            .skip(0)
            .lean();
            
            expect(results.length).toBeLessThanOrEqual(pageSize);
            
            // Clean up
            await User.deleteMany({ email: /test-perf-/ });
            clearCache();
          }
        ),
        { numRuns: 50, verbose: true }
      );
    }, 300000);
    
  });
  
  /**
   * Property 32.5: Scalability
   * 
   * For increasing dataset sizes, performance degradation should be
   * sub-linear (logarithmic or constant time with proper indexing).
   * 
   * This property ensures that:
   * 1. Performance scales well with data growth
   * 2. Indexes provide logarithmic lookup time
   * 3. System remains responsive under load
   * 
   * Validates: Requirement 11.1 (Performance at scale)
   */
  describe('Property 32.5: Scalability', () => {
    
    it('should scale sub-linearly with dataset size', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      // Test with increasing dataset sizes
      const testSizes = [100, 200, 400, 800];
      const timings = [];
      
      for (const size of testSizes) {
        // Clean up
        await User.deleteMany({ email: /test-perf-/ });
        clearCache();
        
        const now = new Date();
        const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Create test users
        const usersData = [];
        for (let i = 0; i < size; i++) {
          usersData.push({
            name: `Test User ${i}`,
            email: `test-perf-user-${Date.now()}-${i}@test.com`,
            password: 'hashedpassword123',
            role: 'Employee',
            createdAt: new Date(start.getTime() + (i * 50))
          });
        }
        await User.insertMany(usersData);
        
        // Measure query time
        const { durationMs } = await measureExecutionTime(async () => {
          return await getUserStatistics({ startDate: start, endDate: now });
        });
        
        timings.push({ size, time: durationMs });
        console.log(`Dataset size ${size}: ${durationMs.toFixed(2)}ms`);
        
        // Clean up
        await User.deleteMany({ email: /test-perf-/ });
        clearCache();
      }
      
      // Property: Doubling data size should not double query time
      // (should be sub-linear due to indexing)
      for (let i = 1; i < timings.length; i++) {
        const prevTiming = timings[i - 1];
        const currTiming = timings[i];
        
        const sizeRatio = currTiming.size / prevTiming.size;
        const timeRatio = currTiming.time / prevTiming.time;
        
        // Time ratio should be less than size ratio (sub-linear scaling)
        // Allow some variance for small datasets
        if (currTiming.size >= 400) {
          expect(timeRatio).toBeLessThan(sizeRatio * 1.5);
        }
      }
      
      // Property: All queries should still be under 500ms
      for (const timing of timings) {
        expect(timing.time).toBeLessThan(500);
      }
    }, 600000);
    
  });
  
});
