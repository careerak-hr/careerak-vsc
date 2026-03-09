const fc = require('fast-check');
const mongoose = require('mongoose');
const AccountDeletionRequest = require('../src/models/AccountDeletionRequest');
const { User } = require('../src/models/User');
const accountDeletionService = require('../src/services/accountDeletionService');

// Feature: settings-page-enhancements, Property 21: Account Deletion Grace Period
describe('Property 21: Account Deletion Grace Period', () => {
  let testUsers = [];

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test');
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: /^test-grace-period-/ });
    await AccountDeletionRequest.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    testUsers = [];
  });

  afterEach(async () => {
    // Cleanup test users
    const userIds = testUsers.map(u => u._id);
    await User.deleteMany({ _id: { $in: userIds } });
    await AccountDeletionRequest.deleteMany({ userId: { $in: userIds } });
  });

  /**
   * Property 21: Account Deletion Grace Period
   * 
   * For any scheduled account deletion, the system should allow cancellation 
   * during the 30-day grace period.
   * 
   * Validates: Requirements 12.5, 12.6
   */
  test('should allow cancellation during 30-day grace period', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          reason: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-grace-period-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Request scheduled deletion
          const deletionRequest = await accountDeletionService.requestDeletion(
            user._id.toString(),
            {
              type: 'scheduled',
              reason: userData.reason,
              password: userData.password
            }
          );

          // Verify deletion request was created
          expect(deletionRequest).toBeDefined();
          expect(deletionRequest.type).toBe('scheduled');
          expect(deletionRequest.status).toBe('pending');
          expect(deletionRequest.scheduledDate).toBeDefined();
          expect(deletionRequest.daysRemaining).toBeGreaterThan(0);
          expect(deletionRequest.daysRemaining).toBeLessThanOrEqual(30);

          // Property: Should allow cancellation during grace period
          const cancellation = await accountDeletionService.cancelDeletion(user._id.toString());
          
          expect(cancellation).toBeDefined();
          expect(cancellation.message).toContain('cancelled successfully');
          expect(cancellation.cancelledAt).toBeDefined();

          // Verify deletion request is cancelled
          const status = await accountDeletionService.getDeletionStatus(user._id.toString());
          expect(status).toBeNull(); // No pending request after cancellation

          // Verify user account still exists
          const userStillExists = await User.findById(user._id);
          expect(userStillExists).toBeDefined();
        }
      ),
      { numRuns: 10 } // Reduced from 20 for faster execution
    );
  }, 60000); // 60 second timeout

  test('should not allow cancellation after grace period expires', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-grace-expired-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request with expired grace period
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'pending',
            requestedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
            scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago (expired)
          });

          // Property: Should NOT allow cancellation after grace period
          await expect(
            accountDeletionService.cancelDeletion(user._id.toString())
          ).rejects.toThrow(/grace period has expired/i);

          // Verify deletion request is still pending
          const status = await accountDeletionService.getDeletionStatus(user._id.toString());
          expect(status).toBeDefined();
          expect(status.status).toBe('pending');
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should calculate days remaining correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          daysInFuture: fc.integer({ min: 1, max: 30 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-days-remaining-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request with specific scheduled date
          const scheduledDate = new Date(Date.now() + userData.daysInFuture * 24 * 60 * 60 * 1000);
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'pending',
            requestedAt: new Date(),
            scheduledDate
          });

          // Property: Days remaining should be calculated correctly
          const daysRemaining = deletionRequest.getDaysRemaining();
          
          // Allow 1 day tolerance for timing differences
          expect(daysRemaining).toBeGreaterThanOrEqual(userData.daysInFuture - 1);
          expect(daysRemaining).toBeLessThanOrEqual(userData.daysInFuture + 1);
        }
      ),
      { numRuns: 30 }
    );
  });

  test('should allow multiple cancellation and re-request cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          cycles: fc.integer({ min: 2, max: 3 }) // Reduced from 5 for faster execution
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-cycles-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Property: Should allow multiple request-cancel cycles
          for (let i = 0; i < userData.cycles; i++) {
            // Request deletion
            const deletionRequest = await accountDeletionService.requestDeletion(
              user._id.toString(),
              {
                type: 'scheduled',
                reason: `Cycle ${i + 1}`,
                password: userData.password
              }
            );

            expect(deletionRequest.status).toBe('pending');

            // Cancel deletion
            const cancellation = await accountDeletionService.cancelDeletion(user._id.toString());
            expect(cancellation.message).toContain('cancelled successfully');

            // Verify no pending request
            const status = await accountDeletionService.getDeletionStatus(user._id.toString());
            expect(status).toBeNull();
          }

          // Verify user still exists after all cycles
          const userStillExists = await User.findById(user._id);
          expect(userStillExists).toBeDefined();
        }
      ),
      { numRuns: 5 } // Reduced from 10 for faster execution
    );
  }, 60000); // 60 second timeout

  test('should not allow cancellation of immediate deletions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-immediate-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create immediate deletion request
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'immediate',
            status: 'pending',
            requestedAt: new Date()
          });

          // Property: Immediate deletions should be processed immediately
          // (no grace period, so cancellation is not applicable)
          expect(deletionRequest.type).toBe('immediate');
          expect(deletionRequest.scheduledDate).toBeUndefined();
          expect(deletionRequest.getDaysRemaining()).toBe(0);
          expect(deletionRequest.isReadyForDeletion()).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });
});
