/**
 * Property Test: Automatic Reward Grant
 * Property 2: Automatic Reward Grant
 *
 * For any completed referral action (signup, course completion, job),
 * the corresponding points should be automatically awarded within 1 minute.
 *
 * Validates: Requirements 2.1, 2.2
 */

const fc = require('fast-check');

// ============================================================
// Mock النماذج - يجب أن تبدأ المتغيرات بـ mock (قاعدة Jest)
// ============================================================

const mockUserFindByIdAndUpdate = jest.fn();
const mockUserFindById = jest.fn();

jest.mock('../src/models/User', () => ({
  User: {
    findById: (...args) => {
      const val = mockUserFindById(...args);
      return { select: jest.fn().mockResolvedValue(val) };
    },
    findByIdAndUpdate: (...args) => mockUserFindByIdAndUpdate(...args)
  }
}));

const mockReferralFindOne = jest.fn();
const mockReferralFindByIdAndUpdate = jest.fn();
const mockReferralCountDocs = jest.fn();

jest.mock('../src/models/Referral', () => ({
  findOne: (...args) => mockReferralFindOne(...args),
  findByIdAndUpdate: (...args) => mockReferralFindByIdAndUpdate(...args),
  countDocuments: (...args) => mockReferralCountDocs(...args)
}));

const mockPtxCreate = jest.fn();

jest.mock('../src/models/PointsTransaction', () => ({
  create: (...args) => mockPtxCreate(...args)
}));

jest.mock('../src/services/notificationService', () => ({
  sendReferralRewardNotification: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/services/leaderboardService', () => ({
  updateAllPeriods: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/models/FraudCheck', () => ({
  create: jest.fn().mockResolvedValue({})
}));

const mongoose = require('mongoose');

// ============================================================
// Helpers
// ============================================================

/**
 * Set up clean mocks for a successful (non-fraudulent) referral scenario.
 * referrerBalance: the balance returned after awarding points to the referrer
 * referredBalance: the balance returned after awarding points to the referred user
 */
function setupCleanReferralMocks({ referrerBalance, referredBalance }) {
  // antiFraud checks: no fraud detected (all countDocuments return 0, findOne returns null)
  mockReferralFindOne.mockResolvedValue(null);
  mockReferralCountDocs.mockResolvedValue(0);
  mockReferralFindByIdAndUpdate.mockResolvedValue({});

  mockUserFindByIdAndUpdate
    .mockResolvedValueOnce({ pointsBalance: referrerBalance })
    .mockResolvedValueOnce({ pointsBalance: referredBalance })
    .mockResolvedValue({});

  mockPtxCreate.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
}

/**
 * Set up mocks for awardFirstCourseReward / awardJobReward.
 * These functions look up the referral first, then award points.
 */
function setupCourseOrJobMocks({ referral, referrerBalance }) {
  mockReferralFindOne.mockResolvedValue(referral);
  mockReferralFindByIdAndUpdate.mockResolvedValue({});
  mockUserFindByIdAndUpdate.mockResolvedValue({ pointsBalance: referrerBalance });
  mockPtxCreate.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
}

// ============================================================
// Property Tests
// ============================================================

describe('Property 2: Automatic Reward Grant', () => {
  let rewardsService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    rewardsService = require('../src/services/rewardsService');
  });

  // ----------------------------------------------------------
  // Property 2a: awardSignupReward grants exactly REWARD_CONFIG.signup.referrer (50) points to referrer
  // ----------------------------------------------------------
  test('awardSignupReward always grants exactly 50 points to the referrer', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary referral scenarios
        fc.record({
          referrerId: fc.string({ minLength: 10, maxLength: 24 }).map(() => new mongoose.Types.ObjectId().toString()),
          referredUserId: fc.string({ minLength: 10, maxLength: 24 }).map(() => new mongoose.Types.ObjectId().toString()),
          ipAddress: fc.ipV4(),
          source: fc.constantFrom('whatsapp', 'email', 'direct', 'other')
        }),
        async ({ referrerId, referredUserId, ipAddress, source }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const initialBalance = 0;
          const expectedReferrerBalance = initialBalance + rewardsService.REWARD_CONFIG.signup.referrer; // 50

          setupCleanReferralMocks({
            referrerBalance: expectedReferrerBalance,
            referredBalance: rewardsService.REWARD_CONFIG.signup.referred // 25
          });

          const referral = {
            _id: new mongoose.Types.ObjectId().toString(),
            referrerId,
            referredUserId,
            ipAddress,
            source,
            rewards: []
          };

          const results = await rewardsService.awardSignupReward(referral);

          // Must return an array with at least the referrer entry
          expect(Array.isArray(results)).toBe(true);
          expect(results.length).toBeGreaterThanOrEqual(1);

          // First result is always the referrer
          const referrerResult = results[0];
          expect(referrerResult.awarded).toBe(rewardsService.REWARD_CONFIG.signup.referrer);
          expect(referrerResult.awarded).toBe(50);
        }
      ),
      { numRuns: 20 }
    );
  });

  // ----------------------------------------------------------
  // Property 2b: awardSignupReward grants exactly REWARD_CONFIG.signup.referred (25) points to referred user
  // ----------------------------------------------------------
  test('awardSignupReward always grants exactly 25 points to the referred user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          referrerId: fc.constant(null).map(() => new mongoose.Types.ObjectId().toString()),
          referredUserId: fc.constant(null).map(() => new mongoose.Types.ObjectId().toString()),
          ipAddress: fc.ipV4()
        }),
        async ({ referrerId, referredUserId, ipAddress }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          setupCleanReferralMocks({
            referrerBalance: rewardsService.REWARD_CONFIG.signup.referrer,
            referredBalance: rewardsService.REWARD_CONFIG.signup.referred
          });

          const referral = {
            _id: new mongoose.Types.ObjectId().toString(),
            referrerId,
            referredUserId,
            ipAddress,
            rewards: []
          };

          const results = await rewardsService.awardSignupReward(referral);

          expect(Array.isArray(results)).toBe(true);
          expect(results.length).toBe(2);

          // Second result is always the referred user
          const referredResult = results[1];
          expect(referredResult.awarded).toBe(rewardsService.REWARD_CONFIG.signup.referred);
          expect(referredResult.awarded).toBe(25);
        }
      ),
      { numRuns: 20 }
    );
  });

  // ----------------------------------------------------------
  // Property 2c: awardFirstCourseReward grants exactly REWARD_CONFIG.first_course.referrer (100) points
  // ----------------------------------------------------------
  test('awardFirstCourseReward always grants exactly 100 points to the referrer', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          referrerId: fc.constant(null).map(() => new mongoose.Types.ObjectId().toString()),
          referredUserId: fc.constant(null).map(() => new mongoose.Types.ObjectId().toString()),
          initialBalance: fc.integer({ min: 0, max: 10000 })
        }),
        async ({ referrerId, referredUserId, initialBalance }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const expectedPoints = rewardsService.REWARD_CONFIG.first_course.referrer; // 100
          const expectedBalance = initialBalance + expectedPoints;

          const referral = {
            _id: new mongoose.Types.ObjectId().toString(),
            referrerId,
            referredUserId,
            status: 'completed',
            rewards: [] // no first_course reward yet
          };

          setupCourseOrJobMocks({ referral, referrerBalance: expectedBalance });

          const result = await rewardsService.awardFirstCourseReward(referredUserId);

          expect(result).not.toBeNull();
          expect(result.awarded).toBe(expectedPoints);
          expect(result.awarded).toBe(100);
        }
      ),
      { numRuns: 20 }
    );
  });

  // ----------------------------------------------------------
  // Property 2d: awardJobReward grants exactly REWARD_CONFIG.job.referrer (200) points
  // ----------------------------------------------------------
  test('awardJobReward always grants exactly 200 points to the referrer', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          referrerId: fc.constant(null).map(() => new mongoose.Types.ObjectId().toString()),
          referredUserId: fc.constant(null).map(() => new mongoose.Types.ObjectId().toString()),
          initialBalance: fc.integer({ min: 0, max: 10000 })
        }),
        async ({ referrerId, referredUserId, initialBalance }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const expectedPoints = rewardsService.REWARD_CONFIG.job.referrer; // 200
          const expectedBalance = initialBalance + expectedPoints;

          const referral = {
            _id: new mongoose.Types.ObjectId().toString(),
            referrerId,
            referredUserId,
            status: 'completed',
            rewards: [] // no job reward yet
          };

          setupCourseOrJobMocks({ referral, referrerBalance: expectedBalance });

          const result = await rewardsService.awardJobReward(referredUserId);

          expect(result).not.toBeNull();
          expect(result.awarded).toBe(expectedPoints);
          expect(result.awarded).toBe(200);
        }
      ),
      { numRuns: 20 }
    );
  });

  // ----------------------------------------------------------
  // Property 2e: No reward is granted twice for the same action
  // ----------------------------------------------------------
  test('awardSignupReward never grants points if signup reward was already awarded', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          referrerId: fc.constant(null).map(() => new mongoose.Types.ObjectId().toString()),
          referredUserId: fc.constant(null).map(() => new mongoose.Types.ObjectId().toString())
        }),
        async ({ referrerId, referredUserId }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const referral = {
            _id: new mongoose.Types.ObjectId().toString(),
            referrerId,
            referredUserId,
            rewards: [{ type: 'signup', points: 50, awardedAt: new Date() }]
          };

          const results = await rewardsService.awardSignupReward(referral);

          // Should return empty array - no double awarding
          expect(Array.isArray(results)).toBe(true);
          expect(results).toHaveLength(0);
          expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
          expect(mockPtxCreate).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });

  // ----------------------------------------------------------
  // Property 2f: awardFirstCourseReward returns null if no completed referral exists
  // ----------------------------------------------------------
  test('awardFirstCourseReward returns null when no completed referral found', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 24 }),
        async (referredUserId) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          // No referral found
          mockReferralFindOne.mockResolvedValue(null);

          const result = await rewardsService.awardFirstCourseReward(referredUserId);

          expect(result).toBeNull();
          expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });

  // ----------------------------------------------------------
  // Property 2g: awardJobReward returns null if no completed referral exists
  // ----------------------------------------------------------
  test('awardJobReward returns null when no completed referral found', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 24 }),
        async (referredUserId) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          mockReferralFindOne.mockResolvedValue(null);

          const result = await rewardsService.awardJobReward(referredUserId);

          expect(result).toBeNull();
          expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 20 }
    );
  });

  // ----------------------------------------------------------
  // Property 2h: Reward amounts match REWARD_CONFIG exactly (no off-by-one)
  // ----------------------------------------------------------
  test('REWARD_CONFIG values match the specified reward amounts exactly', () => {
    const rewardsService = require('../src/services/rewardsService');
    const { REWARD_CONFIG } = rewardsService;

    expect(REWARD_CONFIG.signup.referrer).toBe(50);
    expect(REWARD_CONFIG.signup.referred).toBe(25);
    expect(REWARD_CONFIG.first_course.referrer).toBe(100);
    expect(REWARD_CONFIG.job.referrer).toBe(200);
  });
});
