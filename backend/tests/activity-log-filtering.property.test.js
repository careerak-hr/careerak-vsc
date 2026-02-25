/**
 * Activity Log Filtering and Search Property-Based Tests
 * 
 * Property 14: Activity Log Filtering and Search
 * 
 * Validates: Requirements 5.12, 5.13, 5.14
 * 
 * This test suite validates the correctness of activity log filtering and search
 * using property-based testing with fast-check library.
 * 
 * Properties tested:
 * - Filtering by action type returns only matching entries
 * - Filtering by actor returns only that actor's entries
 * - Filtering by date range returns only entries within range
 * - Search returns entries containing search term
 * - Pagination works correctly with filters
 * - Multiple filters combine correctly (AND logic)
 */

const fc = require('fast-check');
const mongoose = require('mongoose');
const ActivityLog = require('../src/models/ActivityLog');
const { User } = require('../src/models/User');
const {
  createActivityLog,
  getActivityLogs,
  searchActivityLogs
} = require('../src/services/activityLogService');

describe('Activity Log Filtering and Search Property Tests', () => {
  
  // Setup database connection
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test';
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000
        });
      } catch (error) {
        console.warn('MongoDB not available, skipping activity log filtering tests');
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
      await ActivityLog.deleteMany({ actorName: /test-activity-/ });
      await User.deleteMany({ email: /test-activity-/ });
    }
  }, 30000);
  
  // Helper to check if DB is available
  const isDBAvailable = () => mongoose.connection.readyState === 1;
  
  /**
   * Property 14.1: Action Type Filtering
   * 
   * For any activity log query filtered by action type, the returned entries
   * should only contain logs with that specific action type.
   * 
   * This property ensures that:
   * 1. All returned entries match the filter
   * 2. No entries with different action types are returned
   * 3. The count matches the actual number of matching entries
   * 
   * Validates: Requirement 5.12 (Filter by action type)
   */
  describe('Property 14.1: Action Type Filtering', () => {
    
    it('should return only logs matching the action type filter', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('user_registered', 'job_posted', 'application_submitted', 'course_published'),
          fc.integer({ min: 2, max: 5 }),
          fc.integer({ min: 1, max: 3 }),
          async (targetActionType, matchingCount, nonMatchingCount) => {
            // Clean up
            await ActivityLog.deleteMany({ actorName: /test-activity-/ });
            
            // Create test user
            const testUser = await User.create({
              name: 'Test Activity User',
              email: `test-activity-user-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'Admin'
            });
            
            const allActionTypes = ['user_registered', 'job_posted', 'application_submitted', 'course_published'];
            const otherActionTypes = allActionTypes.filter(t => t !== targetActionType);
            
            // Create matching logs
            const matchingLogs = [];
            for (let i = 0; i < matchingCount; i++) {
              const log = await createActivityLog({
                actorId: testUser._id,
                actorName: `test-activity-actor-${Date.now()}-${i}`,
                actionType: targetActionType,
                targetType: 'TestTarget',
                targetId: new mongoose.Types.ObjectId(),
                details: `Test activity ${i}`,
                ipAddress: '127.0.0.1'
              });
              matchingLogs.push(log);
            }
            
            // Create non-matching logs
            for (let i = 0; i < nonMatchingCount; i++) {
              const randomActionType = otherActionTypes[i % otherActionTypes.length];
              await createActivityLog({
                actorId: testUser._id,
                actorName: `test-activity-actor-other-${Date.now()}-${i}`,
                actionType: randomActionType,
                targetType: 'TestTarget',
                targetId: new mongoose.Types.ObjectId(),
                details: `Other activity ${i}`,
                ipAddress: '127.0.0.1'
              });
            }
            
            // Query with filter
            const result = await getActivityLogs({
              actionType: targetActionType,
              limit: 100
            });
            
            // Property: All returned logs should match the filter
            result.logs.forEach(log => {
              expect(log.actionType).toBe(targetActionType);
            });
            
            // Property: Count should match the number of matching logs
            expect(result.logs.length).toBe(matchingCount);
            expect(result.pagination.total).toBe(matchingCount);
            
            // Clean up
            await ActivityLog.deleteMany({ _id: { $in: matchingLogs.map(l => l._id) } });
            await User.deleteOne({ _id: testUser._id });
          }
        ),
        { numRuns: 10, verbose: true }
      );
    }, 120000);
    
  });
  
  /**
   * Property 14.2: Actor Filtering
   * 
   * For any activity log query filtered by actor ID, the returned entries
   * should only contain logs from that specific actor.
   * 
   * This property ensures that:
   * 1. All returned entries belong to the specified actor
   * 2. No entries from other actors are returned
   * 3. The count is accurate
   * 
   * Validates: Requirement 5.12 (Filter by user)
   */
  describe('Property 14.2: Actor Filtering', () => {
    
    it('should return only logs from the specified actor', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }),
          fc.integer({ min: 1, max: 3 }),
          async (targetActorLogs, otherActorLogs) => {
            // Clean up
            await ActivityLog.deleteMany({ actorName: /test-activity-/ });
            await User.deleteMany({ email: /test-activity-/ });
            
            // Create target actor
            const targetActor = await User.create({
              name: 'Target Actor',
              email: `test-activity-target-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'Admin'
            });
            
            // Create other actor
            const otherActor = await User.create({
              name: 'Other Actor',
              email: `test-activity-other-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'Admin'
            });
            
            // Create logs for target actor
            const targetLogs = [];
            for (let i = 0; i < targetActorLogs; i++) {
              const log = await createActivityLog({
                actorId: targetActor._id,
                actorName: `test-activity-target-${Date.now()}-${i}`,
                actionType: 'user_registered',
                targetType: 'User',
                targetId: new mongoose.Types.ObjectId(),
                details: `Target actor activity ${i}`,
                ipAddress: '127.0.0.1'
              });
              targetLogs.push(log);
            }
            
            // Create logs for other actor
            for (let i = 0; i < otherActorLogs; i++) {
              await createActivityLog({
                actorId: otherActor._id,
                actorName: `test-activity-other-${Date.now()}-${i}`,
                actionType: 'job_posted',
                targetType: 'Job',
                targetId: new mongoose.Types.ObjectId(),
                details: `Other actor activity ${i}`,
                ipAddress: '127.0.0.1'
              });
            }
            
            // Query with actor filter
            const result = await getActivityLogs({
              actorId: targetActor._id.toString(),
              limit: 100
            });
            
            // Property: All returned logs should belong to target actor
            result.logs.forEach(log => {
              expect(log.actorId.toString()).toBe(targetActor._id.toString());
            });
            
            // Property: Count should match target actor's logs
            expect(result.logs.length).toBe(targetActorLogs);
            expect(result.pagination.total).toBe(targetActorLogs);
            
            // Clean up
            await ActivityLog.deleteMany({ _id: { $in: targetLogs.map(l => l._id) } });
            await User.deleteMany({ _id: { $in: [targetActor._id, otherActor._id] } });
          }
        ),
        { numRuns: 10, verbose: true }
      );
    }, 120000);
    
  });
  
  /**
   * Property 14.3: Date Range Filtering
   * 
   * For any activity log query filtered by date range, the returned entries
   * should only contain logs within that date range.
   * 
   * This property ensures that:
   * 1. All returned entries fall within the date range
   * 2. No entries outside the range are returned
   * 3. Boundary dates are handled correctly
   * 
   * Validates: Requirement 5.12 (Filter by date)
   */
  describe('Property 14.3: Date Range Filtering', () => {
    
    it('should return only logs within the specified date range', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 3 }),
          fc.integer({ min: 1, max: 3 }),
          fc.integer({ min: 1, max: 3 }),
          async (beforeCount, withinCount, afterCount) => {
            // Clean up
            await ActivityLog.deleteMany({ actorName: /test-activity-/ });
            
            // Create test user
            const testUser = await User.create({
              name: 'Test Date User',
              email: `test-activity-date-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'Admin'
            });
            
            const now = new Date();
            const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
            const endDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
            const beforeDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000); // Before range
            const afterDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // After range
            
            const allLogs = [];
            
            // Create logs before range
            for (let i = 0; i < beforeCount; i++) {
              const log = await ActivityLog.create({
                actorId: testUser._id,
                actorName: `test-activity-before-${Date.now()}-${i}`,
                actionType: 'user_registered',
                targetType: 'User',
                targetId: new mongoose.Types.ObjectId(),
                details: `Before range ${i}`,
                ipAddress: '127.0.0.1',
                timestamp: new Date(beforeDate.getTime() + (i * 1000))
              });
              allLogs.push(log);
            }
            
            // Create logs within range
            const withinLogs = [];
            for (let i = 0; i < withinCount; i++) {
              const timestamp = new Date(
                startDate.getTime() + 
                ((endDate.getTime() - startDate.getTime()) / withinCount) * i
              );
              const log = await ActivityLog.create({
                actorId: testUser._id,
                actorName: `test-activity-within-${Date.now()}-${i}`,
                actionType: 'job_posted',
                targetType: 'Job',
                targetId: new mongoose.Types.ObjectId(),
                details: `Within range ${i}`,
                ipAddress: '127.0.0.1',
                timestamp
              });
              withinLogs.push(log);
              allLogs.push(log);
            }
            
            // Create logs after range
            for (let i = 0; i < afterCount; i++) {
              const log = await ActivityLog.create({
                actorId: testUser._id,
                actorName: `test-activity-after-${Date.now()}-${i}`,
                actionType: 'course_published',
                targetType: 'Course',
                targetId: new mongoose.Types.ObjectId(),
                details: `After range ${i}`,
                ipAddress: '127.0.0.1',
                timestamp: new Date(afterDate.getTime() + (i * 1000))
              });
              allLogs.push(log);
            }
            
            // Query with date range filter
            const result = await getActivityLogs({
              startDate,
              endDate,
              limit: 100
            });
            
            // Property: All returned logs should be within date range
            result.logs.forEach(log => {
              const logDate = new Date(log.timestamp);
              expect(logDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
              expect(logDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
            });
            
            // Property: Count should match logs within range
            expect(result.logs.length).toBe(withinCount);
            expect(result.pagination.total).toBe(withinCount);
            
            // Clean up
            await ActivityLog.deleteMany({ _id: { $in: allLogs.map(l => l._id) } });
            await User.deleteOne({ _id: testUser._id });
          }
        ),
        { numRuns: 10, verbose: true }
      );
    }, 120000);
    
  });
  
  /**
   * Property 14.4: Text Search
   * 
   * For any search query, the returned entries should contain the search term
   * in either the details or actor name fields.
   * 
   * This property ensures that:
   * 1. All returned entries contain the search term
   * 2. Search is case-insensitive
   * 3. Search works across multiple fields
   * 
   * Validates: Requirement 5.13 (Search functionality)
   */
  describe('Property 14.4: Text Search', () => {
    
    it('should return only logs containing the search term', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('payment', 'registration', 'update', 'delete'),
          fc.integer({ min: 2, max: 4 }),
          fc.integer({ min: 1, max: 3 }),
          async (searchTerm, matchingCount, nonMatchingCount) => {
            // Clean up
            await ActivityLog.deleteMany({ actorName: /test-activity-/ });
            
            // Create test user
            const testUser = await User.create({
              name: 'Test Search User',
              email: `test-activity-search-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'Admin'
            });
            
            const allLogs = [];
            
            // Create matching logs (with search term in details)
            const matchingLogs = [];
            for (let i = 0; i < matchingCount; i++) {
              const log = await createActivityLog({
                actorId: testUser._id,
                actorName: `test-activity-search-${Date.now()}-${i}`,
                actionType: 'user_registered',
                targetType: 'User',
                targetId: new mongoose.Types.ObjectId(),
                details: `This is a ${searchTerm} activity ${i}`,
                ipAddress: '127.0.0.1'
              });
              matchingLogs.push(log);
              allLogs.push(log);
            }
            
            // Create non-matching logs
            for (let i = 0; i < nonMatchingCount; i++) {
              const log = await createActivityLog({
                actorId: testUser._id,
                actorName: `test-activity-nomatch-${Date.now()}-${i}`,
                actionType: 'job_posted',
                targetType: 'Job',
                targetId: new mongoose.Types.ObjectId(),
                details: `Different activity without the term ${i}`,
                ipAddress: '127.0.0.1'
              });
              allLogs.push(log);
            }
            
            // Wait for text index to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Search with term
            const result = await searchActivityLogs({
              searchTerm,
              limit: 100
            });
            
            // Property: All returned logs should contain the search term
            result.logs.forEach(log => {
              const detailsMatch = log.details.toLowerCase().includes(searchTerm.toLowerCase());
              const actorNameMatch = log.actorName.toLowerCase().includes(searchTerm.toLowerCase());
              expect(detailsMatch || actorNameMatch).toBe(true);
            });
            
            // Property: Count should be at least the matching count
            // (may be more if other tests left data)
            expect(result.logs.length).toBeGreaterThanOrEqual(matchingCount);
            
            // Clean up
            await ActivityLog.deleteMany({ _id: { $in: allLogs.map(l => l._id) } });
            await User.deleteOne({ _id: testUser._id });
          }
        ),
        { numRuns: 5, verbose: true }
      );
    }, 180000);
    
  });
  
  /**
   * Property 14.5: Pagination Correctness
   * 
   * For any paginated query, the pagination should work correctly:
   * - Page 1 returns first N items
   * - Page 2 returns next N items
   * - No overlap between pages
   * - Total count is accurate
   * 
   * This property ensures that:
   * 1. Pagination returns correct number of items per page
   * 2. Pages don't overlap
   * 3. All items are accessible across pages
   * 4. Pagination metadata is accurate
   * 
   * Validates: Requirement 5.14 (Pagination)
   */
  describe('Property 14.5: Pagination Correctness', () => {
    
    it('should paginate results correctly without overlap', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10, max: 20 }),
          fc.integer({ min: 3, max: 5 }),
          async (totalLogs, pageSize) => {
            // Clean up
            await ActivityLog.deleteMany({ actorName: /test-activity-/ });
            
            // Create test user
            const testUser = await User.create({
              name: 'Test Pagination User',
              email: `test-activity-page-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'Admin'
            });
            
            // Create logs
            const allLogs = [];
            for (let i = 0; i < totalLogs; i++) {
              const log = await createActivityLog({
                actorId: testUser._id,
                actorName: `test-activity-page-${Date.now()}-${i}`,
                actionType: 'user_registered',
                targetType: 'User',
                targetId: new mongoose.Types.ObjectId(),
                details: `Pagination test ${i}`,
                ipAddress: '127.0.0.1'
              });
              allLogs.push(log);
            }
            
            // Get first page
            const page1 = await getActivityLogs({
              page: 1,
              limit: pageSize
            });
            
            // Get second page
            const page2 = await getActivityLogs({
              page: 2,
              limit: pageSize
            });
            
            // Property: First page should have correct number of items
            expect(page1.logs.length).toBe(Math.min(pageSize, totalLogs));
            
            // Property: Total count should match
            expect(page1.pagination.total).toBe(totalLogs);
            expect(page2.pagination.total).toBe(totalLogs);
            
            // Property: Pages should not overlap
            const page1Ids = page1.logs.map(l => l._id.toString());
            const page2Ids = page2.logs.map(l => l._id.toString());
            const overlap = page1Ids.filter(id => page2Ids.includes(id));
            expect(overlap.length).toBe(0);
            
            // Property: Second page should have correct number of items
            const expectedPage2Size = Math.max(0, Math.min(pageSize, totalLogs - pageSize));
            expect(page2.logs.length).toBe(expectedPage2Size);
            
            // Property: Pagination metadata should be accurate
            const expectedTotalPages = Math.ceil(totalLogs / pageSize);
            expect(page1.pagination.totalPages).toBe(expectedTotalPages);
            expect(page1.pagination.hasNextPage).toBe(totalLogs > pageSize);
            expect(page1.pagination.hasPrevPage).toBe(false);
            
            if (totalLogs > pageSize) {
              expect(page2.pagination.hasPrevPage).toBe(true);
            }
            
            // Clean up
            await ActivityLog.deleteMany({ _id: { $in: allLogs.map(l => l._id) } });
            await User.deleteOne({ _id: testUser._id });
          }
        ),
        { numRuns: 10, verbose: true }
      );
    }, 120000);
    
  });
  
  /**
   * Property 14.6: Multiple Filters Combination
   * 
   * For any query with multiple filters, all filters should be applied
   * using AND logic (all conditions must be met).
   * 
   * This property ensures that:
   * 1. Multiple filters combine correctly
   * 2. All returned entries match ALL filter criteria
   * 3. Filters don't interfere with each other
   * 
   * Validates: Requirement 5.12 (Multiple filter criteria)
   */
  describe('Property 14.6: Multiple Filters Combination', () => {
    
    it('should apply multiple filters with AND logic', async () => {
      if (!isDBAvailable()) {
        console.log('Skipping test: MongoDB not available');
        return;
      }
      
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('user_registered', 'job_posted'),
          fc.integer({ min: 2, max: 4 }),
          async (targetActionType, matchingCount) => {
            // Clean up
            await ActivityLog.deleteMany({ actorName: /test-activity-/ });
            await User.deleteMany({ email: /test-activity-/ });
            
            // Create target actor
            const targetActor = await User.create({
              name: 'Target Multi Actor',
              email: `test-activity-multi-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'Admin'
            });
            
            // Create other actor
            const otherActor = await User.create({
              name: 'Other Multi Actor',
              email: `test-activity-multi-other-${Date.now()}@test.com`,
              password: 'hashedpassword123',
              role: 'Admin'
            });
            
            const now = new Date();
            const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const endDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
            
            const allLogs = [];
            
            // Create logs matching ALL filters
            const matchingLogs = [];
            for (let i = 0; i < matchingCount; i++) {
              const timestamp = new Date(
                startDate.getTime() + 
                ((endDate.getTime() - startDate.getTime()) / matchingCount) * i
              );
              const log = await ActivityLog.create({
                actorId: targetActor._id,
                actorName: `test-activity-multi-match-${Date.now()}-${i}`,
                actionType: targetActionType,
                targetType: 'User',
                targetId: new mongoose.Types.ObjectId(),
                details: `Matching all filters ${i}`,
                ipAddress: '127.0.0.1',
                timestamp
              });
              matchingLogs.push(log);
              allLogs.push(log);
            }
            
            // Create logs matching only some filters
            // Wrong actor
            const log1 = await ActivityLog.create({
              actorId: otherActor._id,
              actorName: `test-activity-multi-wrong-actor-${Date.now()}`,
              actionType: targetActionType,
              targetType: 'User',
              targetId: new mongoose.Types.ObjectId(),
              details: 'Wrong actor',
              ipAddress: '127.0.0.1',
              timestamp: new Date(startDate.getTime() + 1000)
            });
            allLogs.push(log1);
            
            // Wrong action type
            const log2 = await ActivityLog.create({
              actorId: targetActor._id,
              actorName: `test-activity-multi-wrong-action-${Date.now()}`,
              actionType: targetActionType === 'user_registered' ? 'job_posted' : 'user_registered',
              targetType: 'User',
              targetId: new mongoose.Types.ObjectId(),
              details: 'Wrong action type',
              ipAddress: '127.0.0.1',
              timestamp: new Date(startDate.getTime() + 2000)
            });
            allLogs.push(log2);
            
            // Wrong date
            const log3 = await ActivityLog.create({
              actorId: targetActor._id,
              actorName: `test-activity-multi-wrong-date-${Date.now()}`,
              actionType: targetActionType,
              targetType: 'User',
              targetId: new mongoose.Types.ObjectId(),
              details: 'Wrong date',
              ipAddress: '127.0.0.1',
              timestamp: new Date(endDate.getTime() + 24 * 60 * 60 * 1000)
            });
            allLogs.push(log3);
            
            // Query with multiple filters
            const result = await getActivityLogs({
              actorId: targetActor._id.toString(),
              actionType: targetActionType,
              startDate,
              endDate,
              limit: 100
            });
            
            // Property: All returned logs should match ALL filters
            result.logs.forEach(log => {
              expect(log.actorId.toString()).toBe(targetActor._id.toString());
              expect(log.actionType).toBe(targetActionType);
              const logDate = new Date(log.timestamp);
              expect(logDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
              expect(logDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
            });
            
            // Property: Count should match only fully matching logs
            expect(result.logs.length).toBe(matchingCount);
            expect(result.pagination.total).toBe(matchingCount);
            
            // Clean up
            await ActivityLog.deleteMany({ _id: { $in: allLogs.map(l => l._id) } });
            await User.deleteMany({ _id: { $in: [targetActor._id, otherActor._id] } });
          }
        ),
        { numRuns: 5, verbose: true }
      );
    }, 180000);
    
  });
  
});
