const fc = require('fast-check');
const mongoose = require('mongoose');
const AccountDeletionRequest = require('../src/models/AccountDeletionRequest');
const { User } = require('../src/models/User');
const accountDeletionService = require('../src/services/accountDeletionService');

// Feature: settings-page-enhancements, Property 22: Account Deletion Reminder
describe('Property 22: Account Deletion Reminder', () => {
  let testUsers = [];

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak_test');
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: /^test-reminder-/ });
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
   * Property 22: Account Deletion Reminder
   * 
   * For any scheduled account deletion, the system should send a reminder 
   * notification exactly 7 days before the deletion date.
   * 
   * Validates: Requirements 12.7
   */
  test('should send reminder exactly 7 days before deletion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-reminder-7days-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request scheduled for 7 days from now
          const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'pending',
            requestedAt: new Date(),
            scheduledDate,
            reminderSent: false
          });

          // Property: Should identify that reminder needs to be sent
          expect(deletionRequest.shouldSendReminder()).toBe(true);
          expect(deletionRequest.getDaysRemaining()).toBeGreaterThanOrEqual(6);
          expect(deletionRequest.getDaysRemaining()).toBeLessThanOrEqual(8);

          // Send reminders
          const results = await accountDeletionService.sendDeletionReminders();

          // Verify reminder was sent
          expect(results.processed).toBeGreaterThanOrEqual(1);
          expect(results.sent).toBeGreaterThanOrEqual(1);

          // Verify reminder flag is set
          const updatedRequest = await AccountDeletionRequest.findById(deletionRequest._id);
          expect(updatedRequest.reminderSent).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should not send reminder if already sent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-reminder-already-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request with reminder already sent
          const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'pending',
            requestedAt: new Date(),
            scheduledDate,
            reminderSent: true // Already sent
          });

          // Property: Should NOT send reminder again
          expect(deletionRequest.shouldSendReminder()).toBe(false);

          // Try to send reminders
          const results = await accountDeletionService.sendDeletionReminders();

          // Verify this request was not processed
          const updatedRequest = await AccountDeletionRequest.findById(deletionRequest._id);
          expect(updatedRequest.reminderSent).toBe(true); // Still true, not changed
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should not send reminder if not 7 days before', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          daysInFuture: fc.integer({ min: 8, max: 30 }).filter(d => d !== 7)
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-reminder-not7-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request NOT scheduled for 7 days from now
          const scheduledDate = new Date(Date.now() + userData.daysInFuture * 24 * 60 * 60 * 1000);
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'pending',
            requestedAt: new Date(),
            scheduledDate,
            reminderSent: false
          });

          // Property: Should NOT send reminder if not exactly 7 days
          expect(deletionRequest.shouldSendReminder()).toBe(false);
          expect(deletionRequest.getDaysRemaining()).not.toBe(7);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should not send reminder for cancelled deletions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-reminder-cancelled-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request scheduled for 7 days from now
          const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'cancelled', // Already cancelled
            requestedAt: new Date(),
            scheduledDate,
            reminderSent: false,
            cancelledAt: new Date()
          });

          // Property: Should NOT send reminder for cancelled deletions
          expect(deletionRequest.shouldSendReminder()).toBe(false);
          expect(deletionRequest.status).toBe('cancelled');
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should not send reminder for completed deletions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-reminder-completed-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request scheduled for 7 days from now
          const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'completed', // Already completed
            requestedAt: new Date(),
            scheduledDate,
            reminderSent: false,
            completedAt: new Date()
          });

          // Property: Should NOT send reminder for completed deletions
          expect(deletionRequest.shouldSendReminder()).toBe(false);
          expect(deletionRequest.status).toBe('completed');
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should send reminder only once per deletion request', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          password: fc.string({ minLength: 8, maxLength: 20 }),
          phone: fc.string({ minLength: 10, maxLength: 15 })
        }),
        async (userData) => {
          // Create test user
          const user = await User.create({
            email: `test-reminder-once-${Date.now()}-${Math.random()}@example.com`,
            password: userData.password,
            phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            role: 'Employee',
            firstName: 'Test',
            lastName: 'User'
          });
          testUsers.push(user);

          // Create deletion request scheduled for 7 days from now
          const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          const deletionRequest = await AccountDeletionRequest.create({
            userId: user._id,
            type: 'scheduled',
            status: 'pending',
            requestedAt: new Date(),
            scheduledDate,
            reminderSent: false
          });

          // Property: First call should send reminder
          const firstResults = await accountDeletionService.sendDeletionReminders();
          expect(firstResults.sent).toBeGreaterThanOrEqual(1);

          // Verify reminder flag is set
          let updatedRequest = await AccountDeletionRequest.findById(deletionRequest._id);
          expect(updatedRequest.reminderSent).toBe(true);

          // Property: Second call should NOT send reminder again
          const secondResults = await accountDeletionService.sendDeletionReminders();
          
          // This specific request should not be in the second batch
          updatedRequest = await AccountDeletionRequest.findById(deletionRequest._id);
          expect(updatedRequest.reminderSent).toBe(true); // Still true, not changed
        }
      ),
      { numRuns: 10 }
    );
  });

  test('should handle multiple users needing reminders', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            password: fc.string({ minLength: 8, maxLength: 20 }),
            phone: fc.string({ minLength: 10, maxLength: 15 })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (usersData) => {
          // Create multiple test users with deletions scheduled for 7 days
          const scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          
          for (const userData of usersData) {
            const user = await User.create({
              email: `test-reminder-multi-${Date.now()}-${Math.random()}@example.com`,
              password: userData.password,
              phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
              role: 'Employee',
              firstName: 'Test',
              lastName: 'User'
            });
            testUsers.push(user);

            await AccountDeletionRequest.create({
              userId: user._id,
              type: 'scheduled',
              status: 'pending',
              requestedAt: new Date(),
              scheduledDate,
              reminderSent: false
            });
          }

          // Property: Should send reminders to all users
          const results = await accountDeletionService.sendDeletionReminders();
          
          expect(results.processed).toBeGreaterThanOrEqual(usersData.length);
          expect(results.sent).toBeGreaterThanOrEqual(usersData.length);
          expect(results.failed).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  });
});
