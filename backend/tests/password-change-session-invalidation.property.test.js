const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../src/models/User');
const ActiveSession = require('../src/models/ActiveSession');
const PasswordChangeService = require('../src/services/passwordChangeService');

/**
 * Property-Based Test: Password Change Session Invalidation
 * 
 * Feature: settings-page-enhancements
 * Property 6: Password Change Session Invalidation
 * 
 * Property Statement:
 * For any successful password change, all sessions except the current one 
 * should be invalidated immediately.
 * 
 * Validates: Requirements 5.4
 */

describe('Property 6: Password Change Session Invalidation', () => {
  let mongoServer;
  let passwordChangeService;

  beforeAll(async () => {
    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    passwordChangeService = new PasswordChangeService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await ActiveSession.deleteMany({});
  });

  /**
   * Property: All other sessions are invalidated after password change
   * 
   * Given: A user with N active sessions
   * When: User changes password from session S
   * Then: All sessions except S are invalidated
   */
  test('should invalidate all other sessions after password change', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate number of sessions (2-10)
        fc.integer({ min: 2, max: 10 }),
        // Generate which session is current (0 to N-1)
        fc.integer({ min: 0, max: 9 }),
        async (numSessions, currentSessionIndex) => {
          // Ensure currentSessionIndex is within bounds
          const actualCurrentIndex = currentSessionIndex % numSessions;

          // Create user with valid password
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'OldPass123!',
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });

          // Create N sessions
          const sessions = [];
          for (let i = 0; i < numSessions; i++) {
            const session = await ActiveSession.create({
              userId: user._id,
              token: `token_${i}_${Date.now()}`,
              device: {
                type: 'desktop',
                os: 'Windows',
                browser: 'Chrome',
                fingerprint: `fp_${i}`
              },
              location: {
                ipAddress: `192.168.1.${i + 1}`
              },
              loginTime: new Date(),
              lastActivity: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });
            sessions.push(session);
          }

          const currentSessionId = sessions[actualCurrentIndex]._id.toString();

          // Count sessions before password change
          const sessionsBeforeCount = await ActiveSession.countDocuments({ userId: user._id });
          expect(sessionsBeforeCount).toBe(numSessions);

          // Change password
          const result = await passwordChangeService.changePassword(
            user._id.toString(),
            'OldPass123!',
            'NewPass456!',
            currentSessionId
          );

          // Verify password change succeeded
          expect(result.success).toBe(true);

          // Count sessions after password change
          const sessionsAfterCount = await ActiveSession.countDocuments({ userId: user._id });

          // Property: Only current session should remain
          expect(sessionsAfterCount).toBe(1);

          // Property: The remaining session should be the current one
          const remainingSession = await ActiveSession.findOne({ userId: user._id });
          expect(remainingSession._id.toString()).toBe(currentSessionId);

          // Property: Number of invalidated sessions should be N-1
          expect(result.sessionsInvalidated).toBe(numSessions - 1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All sessions are invalidated when no current session specified
   * 
   * Given: A user with N active sessions
   * When: User changes password without specifying current session
   * Then: All N sessions are invalidated
   */
  test('should invalidate all sessions when no current session specified', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate number of sessions (1-10)
        fc.integer({ min: 1, max: 10 }),
        async (numSessions) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'OldPass123!',
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });

          // Create N sessions
          for (let i = 0; i < numSessions; i++) {
            await ActiveSession.create({
              userId: user._id,
              token: `token_${i}_${Date.now()}`,
              device: {
                type: 'desktop',
                os: 'Windows',
                browser: 'Chrome',
                fingerprint: `fp_${i}`
              },
              location: {
                ipAddress: `192.168.1.${i + 1}`
              },
              loginTime: new Date(),
              lastActivity: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
          }

          // Count sessions before
          const sessionsBeforeCount = await ActiveSession.countDocuments({ userId: user._id });
          expect(sessionsBeforeCount).toBe(numSessions);

          // Change password without specifying current session
          const result = await passwordChangeService.changePassword(
            user._id.toString(),
            'OldPass123!',
            'NewPass456!',
            null // No current session
          );

          // Verify password change succeeded
          expect(result.success).toBe(true);

          // Count sessions after
          const sessionsAfterCount = await ActiveSession.countDocuments({ userId: user._id });

          // Property: All sessions should be invalidated
          expect(sessionsAfterCount).toBe(0);

          // Property: Number of invalidated sessions should be N
          expect(result.sessionsInvalidated).toBe(numSessions);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Session invalidation is immediate (no delay)
   * 
   * Given: A user with active sessions
   * When: User changes password
   * Then: Sessions are invalidated immediately (within same operation)
   */
  test('should invalidate sessions immediately without delay', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        async (numSessions) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'OldPass123!',
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });

          // Create sessions
          const sessions = [];
          for (let i = 0; i < numSessions; i++) {
            const session = await ActiveSession.create({
              userId: user._id,
              token: `token_${i}_${Date.now()}`,
              device: {
                type: 'desktop',
                os: 'Windows',
                browser: 'Chrome',
                fingerprint: `fp_${i}`
              },
              location: {
                ipAddress: `192.168.1.${i + 1}`
              },
              loginTime: new Date(),
              lastActivity: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            sessions.push(session);
          }

          const currentSessionId = sessions[0]._id.toString();
          const startTime = Date.now();

          // Change password
          await passwordChangeService.changePassword(
            user._id.toString(),
            'OldPass123!',
            'NewPass456!',
            currentSessionId
          );

          const endTime = Date.now();
          const duration = endTime - startTime;

          // Verify sessions are invalidated immediately
          const remainingCount = await ActiveSession.countDocuments({ userId: user._id });
          expect(remainingCount).toBe(1);

          // Property: Operation should complete quickly (< 1 second)
          expect(duration).toBeLessThan(1000);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Session invalidation is atomic (all or nothing)
   * 
   * Given: A user with multiple sessions
   * When: Password change operation completes
   * Then: Either all other sessions are invalidated, or none are (no partial state)
   */
  test('should invalidate sessions atomically', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 8 }),
        async (numSessions) => {
          // Create user
          const user = await User.create({
            email: `test${Date.now()}@example.com`,
            password: 'OldPass123!',
            role: 'Employee',
            phone: `+201${Math.floor(Math.random() * 1000000000)}`,
            country: 'Egypt',
            firstName: 'Test',
            lastName: 'User'
          });

          // Create sessions
          const sessions = [];
          for (let i = 0; i < numSessions; i++) {
            const session = await ActiveSession.create({
              userId: user._id,
              token: `token_${i}_${Date.now()}`,
              device: {
                type: 'desktop',
                os: 'Windows',
                browser: 'Chrome',
                fingerprint: `fp_${i}`
              },
              location: {
                ipAddress: `192.168.1.${i + 1}`
              },
              loginTime: new Date(),
              lastActivity: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            sessions.push(session);
          }

          const currentSessionId = sessions[0]._id.toString();

          // Change password
          const result = await passwordChangeService.changePassword(
            user._id.toString(),
            'OldPass123!',
            'NewPass456!',
            currentSessionId
          );

          // Count remaining sessions
          const remainingCount = await ActiveSession.countDocuments({ userId: user._id });

          // Property: Either exactly 1 session remains (success) or all remain (failure)
          // Since we expect success, should be exactly 1
          if (result.success) {
            expect(remainingCount).toBe(1);
            expect(result.sessionsInvalidated).toBe(numSessions - 1);
          } else {
            // If failed, all sessions should still exist
            expect(remainingCount).toBe(numSessions);
            expect(result.sessionsInvalidated).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
