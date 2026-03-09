const fc = require('fast-check');
const mongoose = require('mongoose');
const ActiveSession = require('../src/models/ActiveSession');
const sessionService = require('../src/services/sessionService');
const { User } = require('../src/models/User');

// Feature: settings-page-enhancements, Property 12: Session Termination
// Property 12: For any active session, terminating it should immediately invalidate 
// the session token and prevent further API access.
// Validates: Requirements 9.3

describe('Property 12: Session Termination', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await ActiveSession.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      email: 'test@example.com',
      password: 'Test1234!',
      phone: '+201234567890',
      role: 'Employee',
      country: 'Egypt'
    });
  });

  afterEach(async () => {
    await ActiveSession.deleteMany({});
    await User.deleteMany({});
  });

  test('Property 12: Terminating a session invalidates it immediately', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          deviceType: fc.constantFrom('desktop', 'mobile', 'tablet'),
          os: fc.constantFrom('Windows', 'macOS', 'Linux', 'iOS', 'Android'),
          browser: fc.constantFrom('Chrome', 'Firefox', 'Safari', 'Edge'),
          ipAddress: fc.ipV4(),
          country: fc.constantFrom('Egypt', 'Saudi Arabia', 'UAE', 'USA'),
          city: fc.string({ minLength: 3, maxLength: 20 })
        }),
        async (sessionData) => {
          // Create a session
          const token = `test-token-${Date.now()}-${Math.random()}`;
          const session = await sessionService.createSession({
            userId: testUser._id,
            token,
            device: {
              type: sessionData.deviceType,
              os: sessionData.os,
              browser: sessionData.browser
            },
            location: {
              ipAddress: sessionData.ipAddress,
              country: sessionData.country,
              city: sessionData.city
            }
          });

          // Verify session exists and is valid
          const beforeTermination = await sessionService.getSessionByToken(token);
          expect(beforeTermination).not.toBeNull();
          expect(beforeTermination._id.toString()).toBe(session._id.toString());

          // Terminate the session
          await sessionService.logoutSession(testUser._id.toString(), session._id.toString());

          // Verify session is invalidated
          const afterTermination = await sessionService.getSessionByToken(token);
          expect(afterTermination).toBeNull();

          // Verify session is not in active sessions list
          const activeSessions = await sessionService.getActiveSessions(testUser._id.toString());
          const terminatedSession = activeSessions.find(s => s.id === session._id.toString());
          expect(terminatedSession).toBeUndefined();
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 12: Cannot terminate non-existent session', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.hexaString({ minLength: 24, maxLength: 24 }), // MongoDB ObjectId hex string
        async (fakeSessionId) => {
          // Try to terminate non-existent session
          await expect(
            sessionService.logoutSession(testUser._id.toString(), fakeSessionId)
          ).rejects.toThrow();
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 12: Cannot terminate another user\'s session', async () => {
    // Create another user
    const otherUser = await User.create({
      email: 'other@example.com',
      password: 'Test1234!',
      phone: '+201234567891',
      role: 'Employee',
      country: 'Egypt'
    });

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          deviceType: fc.constantFrom('desktop', 'mobile', 'tablet'),
          ipAddress: fc.ipV4()
        }),
        async (sessionData) => {
          // Create session for other user
          const token = `test-token-${Date.now()}-${Math.random()}`;
          const session = await sessionService.createSession({
            userId: otherUser._id,
            token,
            device: { type: sessionData.deviceType },
            location: { ipAddress: sessionData.ipAddress }
          });

          // Try to terminate other user's session
          await expect(
            sessionService.logoutSession(testUser._id.toString(), session._id.toString())
          ).rejects.toThrow();

          // Verify session still exists
          const stillExists = await sessionService.getSessionByToken(token);
          expect(stillExists).not.toBeNull();
        }
      ),
      { numRuns: 20 }
    );

    await User.deleteOne({ _id: otherUser._id });
  });
});

// Feature: settings-page-enhancements, Property 13: Bulk Session Termination
// Property 13: For any user with multiple active sessions, "logout all others" 
// should invalidate all sessions except the current one.
// Validates: Requirements 9.4

describe('Property 13: Bulk Session Termination', () => {
  let testUser;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await ActiveSession.deleteMany({});
    await User.deleteMany({});

    testUser = await User.create({
      email: 'test@example.com',
      password: 'Test1234!',
      phone: '+201234567890',
      role: 'Employee',
      country: 'Egypt'
    });
  });

  afterEach(async () => {
    await ActiveSession.deleteMany({});
    await User.deleteMany({});
  });

  test('Property 13: Logout all others keeps only current session', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 10 }), // Number of sessions
        fc.integer({ min: 0, max: 9 }), // Index of current session
        async (numSessions, currentIndex) => {
          // Create multiple sessions
          const sessions = [];
          for (let i = 0; i < numSessions; i++) {
            const token = `test-token-${Date.now()}-${i}-${Math.random()}`;
            const session = await sessionService.createSession({
              userId: testUser._id,
              token,
              device: {
                type: i % 2 === 0 ? 'desktop' : 'mobile',
                os: 'Test OS',
                browser: 'Test Browser'
              },
              location: {
                ipAddress: `192.168.1.${i}`,
                country: 'Egypt'
              }
            });
            sessions.push(session);
          }

          // Select current session
          const currentSessionIndex = currentIndex % numSessions;
          const currentSession = sessions[currentSessionIndex];

          // Logout all other sessions
          const loggedOutCount = await sessionService.logoutAllOtherSessions(
            testUser._id.toString(),
            currentSession._id.toString()
          );

          // Verify correct number of sessions logged out
          expect(loggedOutCount).toBe(numSessions - 1);

          // Verify only current session remains
          const remainingSessions = await sessionService.getActiveSessions(testUser._id.toString());
          expect(remainingSessions).toHaveLength(1);
          expect(remainingSessions[0].id).toBe(currentSession._id.toString());

          // Verify current session is still valid
          const currentStillValid = await sessionService.getSessionByToken(currentSession.token);
          expect(currentStillValid).not.toBeNull();

          // Verify other sessions are invalidated
          for (let i = 0; i < sessions.length; i++) {
            if (i !== currentSessionIndex) {
              const otherSession = await sessionService.getSessionByToken(sessions[i].token);
              expect(otherSession).toBeNull();
            }
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 13: Logout all others with single session does nothing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          deviceType: fc.constantFrom('desktop', 'mobile', 'tablet'),
          ipAddress: fc.ipV4()
        }),
        async (sessionData) => {
          // Create single session
          const token = `test-token-${Date.now()}-${Math.random()}`;
          const session = await sessionService.createSession({
            userId: testUser._id,
            token,
            device: { type: sessionData.deviceType },
            location: { ipAddress: sessionData.ipAddress }
          });

          // Logout all others (should be 0)
          const loggedOutCount = await sessionService.logoutAllOtherSessions(
            testUser._id.toString(),
            session._id.toString()
          );

          expect(loggedOutCount).toBe(0);

          // Verify session still exists
          const stillExists = await sessionService.getSessionByToken(token);
          expect(stillExists).not.toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 13: Logout all others is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 5 }),
        async (numSessions) => {
          // Create multiple sessions
          const sessions = [];
          for (let i = 0; i < numSessions; i++) {
            const token = `test-token-${Date.now()}-${i}-${Math.random()}`;
            const session = await sessionService.createSession({
              userId: testUser._id,
              token,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });
            sessions.push(session);
          }

          const currentSession = sessions[0];

          // First logout
          const firstCount = await sessionService.logoutAllOtherSessions(
            testUser._id.toString(),
            currentSession._id.toString()
          );
          expect(firstCount).toBe(numSessions - 1);

          // Second logout (should be 0)
          const secondCount = await sessionService.logoutAllOtherSessions(
            testUser._id.toString(),
            currentSession._id.toString()
          );
          expect(secondCount).toBe(0);

          // Verify only current session remains
          const remainingSessions = await sessionService.getActiveSessions(testUser._id.toString());
          expect(remainingSessions).toHaveLength(1);
        }
      ),
      { numRuns: 20 }
    );
  });
});
