/**
 * Property-Based Tests: Self-Referral Prevention
 *
 * **Validates: Requirements 6.1, 6.2**
 *
 * Property 5: Self-Referral Prevention
 * For any referral attempt, if the referrer and referred user have the same
 * IP address or device fingerprint, the referral should be rejected.
 */

jest.mock('../src/models/Referral', () => ({
  findOne: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.mock('../src/models/FraudCheck', () => ({
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
  findOneAndUpdate: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/models/User', () => ({
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue(null)
}));

const fc = require('fast-check');
const Referral = require('../src/models/Referral');
const antiFraudService = require('../src/services/antiFraudService');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Set up mocks for a completely clean referral (no fraud signals).
 * Call order for runFullFraudCheck with ipAddress + deviceFingerprint:
 *   findOne #1: checkSameIP - IP self-referral check  → null
 *   countDocuments #1: checkSameIP - concurrent pending → 0
 *   countDocuments #2: checkMonthlyIPLimit             → 0
 *   findOne #2: checkSameDevice - device self-referral → null
 *   findOne #3: checkSameDevice - same device referral → null
 *   countDocuments #3: checkRapidSignups               → 0
 *   countDocuments #4: checkPatternMatching ip+device  → 0
 *   countDocuments #5: checkPatternMatching burst      → 0
 */
function setupCleanMocks() {
  Referral.findOne.mockResolvedValue(null);
  Referral.countDocuments.mockResolvedValue(0);
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty string that looks like a user ID */
const userIdArb = fc.string({ minLength: 1, maxLength: 36 }).filter(s => s.trim().length > 0);

/** Simple IPv4 address */
const ipArb = fc.tuple(
  fc.integer({ min: 1, max: 254 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 1, max: 254 })
).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);

/** Device fingerprint string */
const fingerprintArb = fc.string({ minLength: 4, maxLength: 64 }).filter(s => s.trim().length > 0);

// ---------------------------------------------------------------------------
// Property 5a: Same-user self-referral is always blocked
// ---------------------------------------------------------------------------

describe('Property 5: Self-Referral Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupCleanMocks();
  });

  /**
   * Sub-property 5a: For any userId, referrerId === referredUserId → blocked
   *
   * This is pure logic (no DB needed) — the service short-circuits immediately.
   * **Validates: Requirements 6.1**
   */
  test('5a: same-user referral is always blocked regardless of userId format', async () => {
    await fc.assert(
      fc.asyncProperty(userIdArb, async (userId) => {
        const result = await antiFraudService.checkFraud({
          referrerId: userId,
          referredUserId: userId,
          ipAddress: '10.0.0.1'
        });

        expect(result.allowed).toBe(false);
        expect(result.status).toBe('blocked');
        expect(result.flags).toContain('self_referral');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 5b: Same-user referral score is always 100 (maximum)
   *
   * **Validates: Requirements 6.1**
   */
  test('5b: same-user referral always returns score 100', async () => {
    await fc.assert(
      fc.asyncProperty(userIdArb, async (userId) => {
        const result = await antiFraudService.checkFraud({
          referrerId: userId,
          referredUserId: userId
        });

        expect(result.score).toBe(100);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Sub-property 5c: Same IP detection adds >= 30 to the suspicion score
   *
   * When Referral.findOne returns a match for the IP self-referral check,
   * the score must include the sameIP weight (30).
   * **Validates: Requirements 6.1**
   */
  test('5c: same IP detection contributes >= 30 to suspicion score', async () => {
    await fc.assert(
      fc.asyncProperty(ipArb, async (ip) => {
        jest.clearAllMocks();

        // findOne #1 (IP self-referral) → match → triggers same_ip_self_referral flag
        // All subsequent calls → null / 0
        Referral.findOne
          .mockResolvedValueOnce({ _id: 'ip-match' }) // IP self-referral hit
          .mockResolvedValue(null);
        Referral.countDocuments.mockResolvedValue(0);

        const result = await antiFraudService.checkFraud({
          referrerId: 'user-A',
          referredUserId: 'user-B',
          ipAddress: ip
        });

        expect(result.score).toBeGreaterThanOrEqual(antiFraudService.SCORE_WEIGHTS.sameIP);
        expect(result.flags.some(f => f.startsWith('same_ip'))).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Sub-property 5d: Same device detection adds >= 40 to the suspicion score
   *
   * When Referral.findOne returns a match for the device check,
   * the score must include the sameDevice weight (40), making it >= 40.
   * Score >= 40 means suspicious or blocked.
   * **Validates: Requirements 6.2**
   */
  test('5d: same device detection contributes >= 40 to suspicion score', async () => {
    await fc.assert(
      fc.asyncProperty(fingerprintArb, async (fingerprint) => {
        jest.clearAllMocks();

        // Call order for calculateSuspicionScore with ipAddress + deviceFingerprint:
        // findOne #1: IP self-referral → null (no IP flag)
        // countDocuments #1: IP monthly → 0
        // findOne #2: device self-referral → null
        // findOne #3: same device referral → match (adds 40)
        // countDocuments #2: rapid signups → 0
        Referral.findOne
          .mockResolvedValueOnce(null)   // IP self-referral: clean
          .mockResolvedValueOnce(null)   // device self-referral: clean
          .mockResolvedValueOnce({ _id: 'device-match' }); // same device: hit
        Referral.countDocuments.mockResolvedValue(0);

        const result = await antiFraudService.calculateSuspicionScore({
          referrerId: 'user-A',
          referredUserId: 'user-B',
          ipAddress: '10.0.0.1',
          deviceFingerprint: fingerprint
        });

        expect(result.score).toBeGreaterThanOrEqual(antiFraudService.SCORE_WEIGHTS.sameDevice);
        expect(result.flags).toContain('same_device');
        // score >= 40 means suspicious or blocked
        expect(['suspicious', 'blocked']).toContain(result.status);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Sub-property 5e: Same IP + same device → score >= 70 → blocked
   *
   * sameIP (30) + sameDevice (40) = 70 → blocked
   * **Validates: Requirements 6.1, 6.2**
   */
  test('5e: same IP and same device together always result in blocked status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(ipArb, fingerprintArb),
        async ([ip, fingerprint]) => {
          jest.clearAllMocks();

          // Call order for runFullFraudCheck with ipAddress + deviceFingerprint:
          // findOne #1: IP self-referral → match (adds 30 via sameIP flag)
          // countDocuments #1: concurrent pending → 0
          // countDocuments #2: monthly IP limit → 0
          // findOne #2: device self-referral → null
          // findOne #3: same device referral → match (adds 40)
          // countDocuments #3: rapid signups → 0
          // countDocuments #4: pattern ip+device → 0
          // countDocuments #5: pattern burst → 0
          Referral.findOne
            .mockResolvedValueOnce({ _id: 'ip-match' })     // IP self-referral hit
            .mockResolvedValueOnce(null)                     // device self-referral: clean
            .mockResolvedValueOnce({ _id: 'device-match' }); // same device hit
          Referral.countDocuments.mockResolvedValue(0);

          const result = await antiFraudService.checkFraud({
            referrerId: 'user-A',
            referredUserId: 'user-B',
            ipAddress: ip,
            deviceFingerprint: fingerprint
          });

          expect(result.score).toBeGreaterThanOrEqual(70);
          expect(result.status).toBe('blocked');
          expect(result.allowed).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Sub-property 5f: Clean referral (different users, different IP, different device)
   * is always allowed with status 'clean'
   *
   * **Validates: Requirements 6.1, 6.2**
   */
  test('5f: clean referral with different users/IP/device is always allowed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          ipArb,
          fingerprintArb
        ).filter(([a, b]) => a !== b),
        async ([referrerId, referredUserId, ip, fingerprint]) => {
          jest.clearAllMocks();
          // All mocks return null/0 → no fraud signals
          Referral.findOne.mockResolvedValue(null);
          Referral.countDocuments.mockResolvedValue(0);

          const result = await antiFraudService.checkFraud({
            referrerId,
            referredUserId,
            ipAddress: ip,
            deviceFingerprint: fingerprint
          });

          expect(result.allowed).toBe(true);
          expect(result.status).toBe('clean');
          expect(result.score).toBe(0);
          expect(result.waitingPeriodDays).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
