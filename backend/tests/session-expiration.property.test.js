const fc = require('fast-check');
const mongoose = require('mongoose');
const ActiveSession = require('../src/models/ActiveSession');
const sessionService = require('../src/services/sessionService');
const { User } = require('../src/models/User');

// Feature: settings-page-enhancements, Property 14: Session Auto-Expiration
// Property 14: For any session inactive for 30 days, the system should 
// automatically expire and remove it.
// Validates: Requirements 9.6

describe('Property 14: Session Auto-Expiration', () => {
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

  test('Property 14: Sessions inactive for 30+ days are cleaned up', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 30, max: 90 }), // Days of inactivity
        fc.integer({ min: 1, max: 5 }), // Number of inactive sessions
        async (daysInactive, numInactiveSessions) => {
          // Create inactive sessions (last activity > 30 days ago)
          const inactiveSessions = [];
          for (let i = 0; i < numInactiveSessions; i++) {
            const token = `inactive-token-${Date.now()}-${i}-${Math.random()}`;
            const session = await sessionService.createSession({
              userId: testUser._id,
              token,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });

            // Manually set lastActivity to past date
            const lastActivity = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);
            await ActiveSession.updateOne(
              { _id: session._id },
              { lastActivity }
            );

            inactiveSessions.push(session);
          }

          // Create active session (recent activity)
          const activeToken = `active-token-${Date.now()}-${Math.random()}`;
          const activeSession = await sessionService.createSession({
            userId: testUser._id,
            token: activeToken,
            device: { type: 'mobile' },
            location: { ipAddress: '192.168.1.100' }
          });

          // Run cleanup
          const cleanedCount = await sessionService.cleanupInactiveSessions();

          // Verify inactive sessions were cleaned
          expect(cleanedCount).toBe(numInactiveSessions);

          // Verify active session still exists
          const activeStillExists = await sessionService.getSessionByToken(activeToken);
          expect(activeStillExists).not.toBeNull();

          // Verify inactive sessions are gone
          for (const inactiveSession of inactiveSessions) {
            const shouldBeNull = await sessionService.getSessionByToken(inactiveSession.token);
            expect(shouldBeNull).toBeNull();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 14: Sessions inactive for less than 30 days are not cleaned', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 29 }), // Days of inactivity (< 30)
        fc.integer({ min: 1, max: 5 }), // Number of sessions
        async (daysInactive, numSessions) => {
          // Create sessions with recent activity (< 30 days)
          const sessions = [];
          for (let i = 0; i < numSessions; i++) {
            const token = `recent-token-${Date.now()}-${i}-${Math.random()}`;
            const session = await sessionService.createSession({
              userId: testUser._id,
              token,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });

            // Set lastActivity to recent date (< 30 days)
            const lastActivity = new Date(Date.now() - daysInactive * 24 * 60 * 60 * 1000);
            await ActiveSession.updateOne(
              { _id: session._id },
              { lastActivity }
            );

            sessions.push(session);
          }

          // Run cleanup
          const cleanedCount = await sessionService.cleanupInactiveSessions();

          // Verify no sessions were cleaned
          expect(cleanedCount).toBe(0);

          // Verify all sessions still exist
          for (const session of sessions) {
            const stillExists = await sessionService.getSessionByToken(session.token);
            expect(stillExists).not.toBeNull();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 14: Expired sessions (past expiresAt) are cleaned up', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }), // Days past expiration
        fc.integer({ min: 1, max: 5 }), // Number of expired sessions
        async (daysPastExpiration, numExpiredSessions) => {
          // Create expired sessions
          const expiredSessions = [];
          for (let i = 0; i < numExpiredSessions; i++) {
            const token = `expired-token-${Date.now()}-${i}-${Math.random()}`;
            
            // Create session with past expiration date
            const expiresAt = new Date(Date.now() - daysPastExpiration * 24 * 60 * 60 * 1000);
            const session = new ActiveSession({
              userId: testUser._id,
              token,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` },
              expiresAt
            });
            await session.save();
            expiredSessions.push(session);
          }

          // Create valid session (future expiration)
          const validToken = `valid-token-${Date.now()}-${Math.random()}`;
          const validSession = await sessionService.createSession({
            userId: testUser._id,
            token: validToken,
            device: { type: 'mobile' },
            location: { ipAddress: '192.168.1.100' }
          });

          // Run cleanup
          const cleanedCount = await sessionService.cleanupExpiredSessions();

          // Verify expired sessions were cleaned
          expect(cleanedCount).toBe(numExpiredSessions);

          // Verify valid session still exists
          const validStillExists = await sessionService.getSessionByToken(validToken);
          expect(validStillExists).not.toBeNull();

          // Verify expired sessions are gone
          for (const expiredSession of expiredSessions) {
            const shouldBeNull = await sessionService.getSessionByToken(expiredSession.token);
            expect(shouldBeNull).toBeNull();
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 14: Cleanup is idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }),
        async (numExpiredSessions) => {
          // Create expired sessions
          for (let i = 0; i < numExpiredSessions; i++) {
            const token = `expired-token-${Date.now()}-${i}-${Math.random()}`;
            const expiresAt = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
            const session = new ActiveSession({
              userId: testUser._id,
              token,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` },
              expiresAt
            });
            await session.save();
          }

          // First cleanup
          const firstCleanup = await sessionService.cleanupExpiredSessions();
          expect(firstCleanup).toBe(numExpiredSessions);

          // Second cleanup (should be 0)
          const secondCleanup = await sessionService.cleanupExpiredSessions();
          expect(secondCleanup).toBe(0);

          // Third cleanup (should still be 0)
          const thirdCleanup = await sessionService.cleanupExpiredSessions();
          expect(thirdCleanup).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 14: TTL index automatically removes expired sessions', async () => {
    // Note: This test verifies the TTL index is set up correctly
    // In production, MongoDB will automatically delete expired documents
    
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }),
        async (numSessions) => {
          // Create sessions with past expiration
          for (let i = 0; i < numSessions; i++) {
            const token = `ttl-token-${Date.now()}-${i}-${Math.random()}`;
            const expiresAt = new Date(Date.now() - 60 * 1000); // 1 minute ago
            const session = new ActiveSession({
              userId: testUser._id,
              token,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` },
              expiresAt
            });
            await session.save();
          }

          // Verify TTL index exists
          const indexes = await ActiveSession.collection.getIndexes();
          const ttlIndex = Object.values(indexes).find(
            index => index.expireAfterSeconds === 0
          );
          expect(ttlIndex).toBeDefined();
          expect(ttlIndex.key).toHaveProperty('expiresAt');
        }
      ),
      { numRuns: 10 }
    );
  });
});
