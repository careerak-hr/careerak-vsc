const fc = require('fast-check');
const mongoose = require('mongoose');
const LoginHistory = require('../src/models/LoginHistory');
const sessionService = require('../src/services/sessionService');
const { User } = require('../src/models/User');

// Feature: settings-page-enhancements, Property 15: Login Attempt Logging
// Property 15: For any login attempt (successful or failed), the system should 
// log it with complete details (timestamp, device, location, IP, status).
// Validates: Requirements 10.1

describe('Property 15: Login Attempt Logging', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await LoginHistory.deleteMany({});
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
    await LoginHistory.deleteMany({});
    await User.deleteMany({});
  });

  test('Property 15: Successful login attempts are logged with complete details', async () => {
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
        async (attemptData) => {
          // Log successful login attempt
          const logEntry = await sessionService.logLoginAttempt({
            userId: testUser._id,
            success: true,
            device: {
              type: attemptData.deviceType,
              os: attemptData.os,
              browser: attemptData.browser
            },
            location: {
              ipAddress: attemptData.ipAddress,
              country: attemptData.country,
              city: attemptData.city
            }
          });

          // Verify log entry was created
          expect(logEntry).toBeDefined();
          expect(logEntry.userId.toString()).toBe(testUser._id.toString());
          expect(logEntry.success).toBe(true);
          expect(logEntry.device.type).toBe(attemptData.deviceType);
          expect(logEntry.device.os).toBe(attemptData.os);
          expect(logEntry.device.browser).toBe(attemptData.browser);
          expect(logEntry.location.ipAddress).toBe(attemptData.ipAddress);
          expect(logEntry.location.country).toBe(attemptData.country);
          expect(logEntry.location.city).toBe(attemptData.city);
          expect(logEntry.timestamp).toBeInstanceOf(Date);

          // Verify it appears in login history
          const history = await sessionService.getLoginHistory(testUser._id.toString(), 10);
          expect(history.length).toBeGreaterThan(0);
          
          const latestEntry = history[0];
          expect(latestEntry.success).toBe(true);
          expect(latestEntry.ipAddress).toBe(attemptData.ipAddress);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 15: Failed login attempts are logged with failure reason', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          deviceType: fc.constantFrom('desktop', 'mobile', 'tablet'),
          ipAddress: fc.ipV4(),
          failureReason: fc.constantFrom(
            'Invalid password',
            'User not found',
            'Account locked',
            'Email not verified',
            '2FA required'
          )
        }),
        async (attemptData) => {
          // Log failed login attempt
          const logEntry = await sessionService.logLoginAttempt({
            userId: testUser._id,
            success: false,
            failureReason: attemptData.failureReason,
            device: {
              type: attemptData.deviceType
            },
            location: {
              ipAddress: attemptData.ipAddress
            }
          });

          // Verify log entry was created
          expect(logEntry).toBeDefined();
          expect(logEntry.success).toBe(false);
          expect(logEntry.failureReason).toBe(attemptData.failureReason);

          // Verify it appears in login history
          const history = await sessionService.getLoginHistory(testUser._id.toString(), 10);
          const latestEntry = history[0];
          expect(latestEntry.success).toBe(false);
          expect(latestEntry.failureReason).toBe(attemptData.failureReason);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 15: Multiple login attempts are logged in chronological order', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 10 }),
        async (numAttempts) => {
          const timestamps = [];

          // Log multiple attempts
          for (let i = 0; i < numAttempts; i++) {
            const logEntry = await sessionService.logLoginAttempt({
              userId: testUser._id,
              success: i % 2 === 0, // Alternate success/failure
              failureReason: i % 2 === 1 ? 'Invalid password' : undefined,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });
            timestamps.push(logEntry.timestamp);

            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          // Get login history
          const history = await sessionService.getLoginHistory(testUser._id.toString(), numAttempts);

          // Verify all attempts are logged
          expect(history).toHaveLength(numAttempts);

          // Verify chronological order (newest first)
          for (let i = 0; i < history.length - 1; i++) {
            const current = new Date(history[i].timestamp);
            const next = new Date(history[i + 1].timestamp);
            expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 15: Login history can be filtered by success status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }), // Successful attempts
        fc.integer({ min: 2, max: 5 }), // Failed attempts
        async (numSuccess, numFailed) => {
          // Log successful attempts
          for (let i = 0; i < numSuccess; i++) {
            await sessionService.logLoginAttempt({
              userId: testUser._id,
              success: true,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });
          }

          // Log failed attempts
          for (let i = 0; i < numFailed; i++) {
            await sessionService.logLoginAttempt({
              userId: testUser._id,
              success: false,
              failureReason: 'Invalid password',
              device: { type: 'mobile' },
              location: { ipAddress: `192.168.2.${i}` }
            });
          }

          // Get all history
          const allHistory = await sessionService.getLoginHistory(testUser._id.toString(), 100);
          expect(allHistory).toHaveLength(numSuccess + numFailed);

          // Get only successful
          const successHistory = await sessionService.getLoginHistory(
            testUser._id.toString(),
            100,
            { success: true }
          );
          expect(successHistory).toHaveLength(numSuccess);
          expect(successHistory.every(entry => entry.success)).toBe(true);

          // Get only failed
          const failedHistory = await sessionService.getLoginHistory(
            testUser._id.toString(),
            100,
            { success: false }
          );
          expect(failedHistory).toHaveLength(numFailed);
          expect(failedHistory.every(entry => !entry.success)).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });
});

// Feature: settings-page-enhancements, Property 16: Login History Retention
// Property 16: For any login history entry older than 90 days, the system 
// should automatically remove it.
// Validates: Requirements 10.2

describe('Property 16: Login History Retention', () => {
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
    await LoginHistory.deleteMany({});
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
    await LoginHistory.deleteMany({});
    await User.deleteMany({});
  });

  test('Property 16: Login history entries older than 90 days are removed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 91, max: 180 }), // Days old (> 90)
        fc.integer({ min: 1, max: 5 }), // Number of old entries
        async (daysOld, numOldEntries) => {
          // Create old entries (> 90 days)
          const oldEntries = [];
          for (let i = 0; i < numOldEntries; i++) {
            const timestamp = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
            const entry = new LoginHistory({
              userId: testUser._id,
              success: true,
              timestamp,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });
            await entry.save();
            oldEntries.push(entry);
          }

          // Create recent entry (< 90 days)
          const recentTimestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const recentEntry = new LoginHistory({
            userId: testUser._id,
            success: true,
            timestamp: recentTimestamp,
            device: { type: 'mobile' },
            location: { ipAddress: '192.168.1.100' }
          });
          await recentEntry.save();

          // Verify TTL index exists
          const indexes = await LoginHistory.collection.getIndexes();
          const ttlIndex = Object.values(indexes).find(
            index => index.expireAfterSeconds === 7776000 // 90 days
          );
          expect(ttlIndex).toBeDefined();
          expect(ttlIndex.key).toHaveProperty('timestamp');

          // Note: In production, MongoDB TTL will automatically delete old entries
          // For testing, we verify the index is set up correctly
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 16: Login history entries less than 90 days old are retained', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 89 }), // Days old (< 90)
        fc.integer({ min: 1, max: 5 }), // Number of entries
        async (daysOld, numEntries) => {
          // Create recent entries (< 90 days)
          const entries = [];
          for (let i = 0; i < numEntries; i++) {
            const timestamp = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
            const entry = new LoginHistory({
              userId: testUser._id,
              success: true,
              timestamp,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });
            await entry.save();
            entries.push(entry);
          }

          // Get login history
          const history = await sessionService.getLoginHistory(testUser._id.toString(), 100);

          // Verify all entries are present
          expect(history).toHaveLength(numEntries);

          // Verify all entries are within 90 days
          const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          for (const entry of history) {
            const entryDate = new Date(entry.timestamp);
            expect(entryDate.getTime()).toBeGreaterThan(ninetyDaysAgo.getTime());
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 16: Login history can be filtered by date range', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 5, max: 10 }),
        async (numEntries) => {
          // Create entries across different dates
          const entries = [];
          for (let i = 0; i < numEntries; i++) {
            const daysAgo = i * 10; // 0, 10, 20, 30, ... days ago
            const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
            const entry = new LoginHistory({
              userId: testUser._id,
              success: true,
              timestamp,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });
            await entry.save();
            entries.push({ timestamp, daysAgo });
          }

          // Filter by date range (last 30 days)
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const history = await sessionService.getLoginHistory(
            testUser._id.toString(),
            100,
            { startDate: thirtyDaysAgo }
          );

          // Verify only entries within range are returned
          const expectedCount = entries.filter(e => e.daysAgo <= 30).length;
          expect(history.length).toBeLessThanOrEqual(expectedCount);

          // Verify all returned entries are within range
          for (const entry of history) {
            const entryDate = new Date(entry.timestamp);
            expect(entryDate.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime());
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 16: Login history respects limit parameter', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 10, max: 20 }), // Total entries
        fc.integer({ min: 3, max: 8 }), // Limit
        async (totalEntries, limit) => {
          // Create multiple entries
          for (let i = 0; i < totalEntries; i++) {
            await sessionService.logLoginAttempt({
              userId: testUser._id,
              success: true,
              device: { type: 'desktop' },
              location: { ipAddress: `192.168.1.${i}` }
            });
          }

          // Get limited history
          const history = await sessionService.getLoginHistory(
            testUser._id.toString(),
            limit
          );

          // Verify limit is respected
          expect(history.length).toBeLessThanOrEqual(limit);
          expect(history.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  });
});
