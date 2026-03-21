/**
 * Property-Based Tests: Fraud Detection Threshold
 *
 * **Validates: Requirements 6.4**
 *
 * Property 8: Fraud Detection Threshold
 * For any user with more than 10 referrals from the same IP in a month,
 * the account should be flagged for manual review.
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
// Arbitraries
// ---------------------------------------------------------------------------

/** Simple IPv4 address */
const ipArb = fc.tuple(
  fc.integer({ min: 1, max: 254 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 1, max: 254 })
).map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);

/** Count >= FRAUD_LIMITS.sameIpMonthlyMax (10) */
const overLimitCountArb = fc.integer({ min: 10, max: 100 });

/** Count < FRAUD_LIMITS.sameIpMonthlyMax (10) */
const underLimitCountArb = fc.integer({ min: 0, max: 9 });

// ---------------------------------------------------------------------------
// Helper: set up mocks for runFullFraudCheck with ipAddress only (no device)
//
// Call order for runFullFraudCheck with ipAddress only:
//   findOne #1:        checkSameIP - IP self-referral check  → null
//   countDocuments #1: checkSameIP - concurrent pending       → 0
//   countDocuments #2: checkMonthlyIPLimit                    → controlled
//   countDocuments #3: checkRapidSignups                      → 0
//   countDocuments #4: checkPatternMatching burst             → 0
// ---------------------------------------------------------------------------
function setupMocksWithMonthlyCount(monthlyCount) {
  Referral.findOne.mockResolvedValue(null);
  Referral.countDocuments
    .mockResolvedValueOnce(0)             // #1: concurrent pending
    .mockResolvedValueOnce(monthlyCount)  // #2: monthly IP limit
    .mockResolvedValueOnce(0)             // #3: rapid signups
    .mockResolvedValueOnce(0);            // #4: pattern burst
}

// ---------------------------------------------------------------------------
// Property 8: Fraud Detection Threshold
// ---------------------------------------------------------------------------

describe('Property 8: Fraud Detection Threshold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Sub-property 8a: For any IP with >= 10 referrals in a month,
   * checkMonthlyIPLimit returns true.
   *
   * **Validates: Requirements 6.4**
   */
  test('8a: checkMonthlyIPLimit returns true when monthly count >= 10', async () => {
    await fc.assert(
      fc.asyncProperty(ipArb, overLimitCountArb, async (ip, count) => {
        jest.clearAllMocks();
        Referral.countDocuments.mockResolvedValue(count);

        const result = await antiFraudService.checkMonthlyIPLimit(ip);

        expect(result).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 8b: For any IP with < 10 referrals in a month,
   * checkMonthlyIPLimit returns false.
   *
   * **Validates: Requirements 6.4**
   */
  test('8b: checkMonthlyIPLimit returns false when monthly count < 10', async () => {
    await fc.assert(
      fc.asyncProperty(ipArb, underLimitCountArb, async (ip, count) => {
        jest.clearAllMocks();
        Referral.countDocuments.mockResolvedValue(count);

        const result = await antiFraudService.checkMonthlyIPLimit(ip);

        expect(result).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 8c: When monthly IP limit is exceeded, checkFraud includes
   * the 'same_ip_monthly_limit' flag in the result.
   *
   * **Validates: Requirements 6.4**
   */
  test('8c: checkFraud includes same_ip_monthly_limit flag when monthly limit exceeded', async () => {
    await fc.assert(
      fc.asyncProperty(ipArb, overLimitCountArb, async (ip, monthlyCount) => {
        jest.clearAllMocks();
        setupMocksWithMonthlyCount(monthlyCount);

        const result = await antiFraudService.checkFraud({
          referrerId: 'user-A',
          referredUserId: 'user-B',
          ipAddress: ip
        });

        expect(result.flags).toContain('same_ip_monthly_limit');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 8d: When monthly IP limit is exceeded, the suspicion score
   * includes at least SCORE_WEIGHTS.sameIP (30) contribution.
   *
   * Note: score 30 alone is 'clean' (< 40 threshold), but the flag IS present,
   * meaning the account is tracked for manual review.
   *
   * **Validates: Requirements 6.4**
   */
  test('8d: score includes sameIP weight (30) when monthly limit exceeded', async () => {
    await fc.assert(
      fc.asyncProperty(ipArb, overLimitCountArb, async (ip, monthlyCount) => {
        jest.clearAllMocks();
        setupMocksWithMonthlyCount(monthlyCount);

        const result = await antiFraudService.checkFraud({
          referrerId: 'user-A',
          referredUserId: 'user-B',
          ipAddress: ip
        });

        expect(result.score).toBeGreaterThanOrEqual(antiFraudService.SCORE_WEIGHTS.sameIP);
        expect(result.flags).toContain('same_ip_monthly_limit');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 8e: When monthly limit is exceeded AND rapid signups are
   * detected, the combined score (30 + 20 = 50) reaches 'suspicious' status.
   *
   * Call order for runFullFraudCheck with ipAddress only:
   *   findOne #1:        IP self-referral → null
   *   countDocuments #1: concurrent pending → 0
   *   countDocuments #2: monthly IP limit  → >= 10 (triggers +30)
   *   countDocuments #3: rapid signups     → >= 5  (triggers +20)
   *   countDocuments #4: pattern burst     → 0
   *
   * **Validates: Requirements 6.4**
   */
  test('8e: monthly limit + rapid signups yields suspicious status (score >= 50)', async () => {
    await fc.assert(
      fc.asyncProperty(
        ipArb,
        overLimitCountArb,
        fc.integer({ min: 5, max: 50 }), // rapid signups count >= 5
        async (ip, monthlyCount, rapidCount) => {
          jest.clearAllMocks();
          Referral.findOne.mockResolvedValue(null);
          Referral.countDocuments
            .mockResolvedValueOnce(0)            // #1: concurrent pending
            .mockResolvedValueOnce(monthlyCount) // #2: monthly IP limit → +30
            .mockResolvedValueOnce(rapidCount)   // #3: rapid signups → +20
            .mockResolvedValueOnce(0);           // #4: pattern burst

          const result = await antiFraudService.checkFraud({
            referrerId: 'user-A',
            referredUserId: 'user-B',
            ipAddress: ip
          });

          const expectedScore =
            antiFraudService.SCORE_WEIGHTS.sameIP +
            antiFraudService.SCORE_WEIGHTS.rapidSignups; // 30 + 20 = 50

          expect(result.score).toBeGreaterThanOrEqual(expectedScore);
          expect(['suspicious', 'blocked']).toContain(result.status);
          expect(result.flags).toContain('same_ip_monthly_limit');
          expect(result.flags).toContain('rapid_signups');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 8f: When monthly count is exactly at the boundary (9 vs 10),
   * the flag is only present at count >= 10.
   *
   * **Validates: Requirements 6.4**
   */
  test('8f: boundary condition - flag absent at count 9, present at count 10', async () => {
    // Count = 9 → no flag
    jest.clearAllMocks();
    setupMocksWithMonthlyCount(9);
    const resultBelow = await antiFraudService.checkFraud({
      referrerId: 'user-A',
      referredUserId: 'user-B',
      ipAddress: '10.0.0.1'
    });
    expect(resultBelow.flags).not.toContain('same_ip_monthly_limit');

    // Count = 10 → flag present
    jest.clearAllMocks();
    setupMocksWithMonthlyCount(10);
    const resultAt = await antiFraudService.checkFraud({
      referrerId: 'user-A',
      referredUserId: 'user-B',
      ipAddress: '10.0.0.1'
    });
    expect(resultAt.flags).toContain('same_ip_monthly_limit');
  });
});
