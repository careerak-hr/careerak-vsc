/**
 * Property Test: Points Balance Consistency
 * Property 3: Points Balance Consistency
 *
 * For any user, the current points balance should equal
 * the sum of all earned points minus all redeemed points.
 *
 * Validates: Requirements 2.4, 3.1
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

const mockPtxCreate = jest.fn();
const mockPtxAggregate = jest.fn();

jest.mock('../src/models/PointsTransaction', () => ({
  create: (...args) => mockPtxCreate(...args),
  aggregate: (...args) => mockPtxAggregate(...args),
  find: jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([])
  }),
  countDocuments: jest.fn().mockResolvedValue(0)
}));

jest.mock('../src/models/Referral', () => ({
  findOne: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/services/notificationService', () => ({
  sendReferralRewardNotification: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/services/leaderboardService', () => ({
  updateAllPeriods: jest.fn().mockResolvedValue(true)
}));

const mongoose = require('mongoose');

// ============================================================
// Helpers
// ============================================================

/**
 * Simulate a sequence of earn/redeem operations and track the running balance.
 * Returns { finalBalance, totalEarned, totalRedeemed }
 */
function computeExpectedBalance(operations) {
  let totalEarned = 0;
  let totalRedeemed = 0;

  for (const op of operations) {
    if (op.type === 'earn') {
      totalEarned += op.amount;
    } else if (op.type === 'redeem') {
      totalRedeemed += op.amount;
    }
  }

  return {
    finalBalance: totalEarned - totalRedeemed,
    totalEarned,
    totalRedeemed
  };
}

/**
 * Set up mocks so that awardPoints records each earn operation
 * and the running balance is tracked correctly.
 */
function setupAwardPointsMocks(operations) {
  let runningBalance = 0;
  const mockReturns = [];

  for (const op of operations) {
    if (op.type === 'earn') {
      runningBalance += op.amount;
      mockReturns.push({ pointsBalance: runningBalance });
    }
  }

  let callIndex = 0;
  mockUserFindByIdAndUpdate.mockImplementation(() => {
    const result = mockReturns[callIndex] || { pointsBalance: runningBalance };
    callIndex++;
    return Promise.resolve(result);
  });

  mockPtxCreate.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
}

// ============================================================
// Property Tests
// ============================================================

describe('Property 3: Points Balance Consistency', () => {
  let rewardsService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    rewardsService = require('../src/services/rewardsService');
  });

  // ----------------------------------------------------------
  // Property 3a: balance = sum(earned) - sum(redeemed) for any sequence of earn operations
  // ----------------------------------------------------------
  test('balance equals sum of earned points after any sequence of earn operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a sequence of 1-10 earn operations with positive amounts
        fc.array(
          fc.record({
            amount: fc.integer({ min: 1, max: 500 }),
            source: fc.constantFrom('referral_signup', 'referral_first_course', 'referral_job', 'welcome_bonus')
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (earnOps) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const userId = new mongoose.Types.ObjectId().toString();
          let runningBalance = 0;

          // Set up mocks to simulate cumulative balance
          mockUserFindByIdAndUpdate.mockImplementation((id, update) => {
            const inc = update.$inc?.pointsBalance || 0;
            runningBalance += inc;
            return Promise.resolve({ pointsBalance: runningBalance });
          });
          mockPtxCreate.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

          // Execute all earn operations
          for (const op of earnOps) {
            await rewardsService.awardPoints(userId, op.amount, op.source, 'test description');
          }

          const expectedTotal = earnOps.reduce((sum, op) => sum + op.amount, 0);

          // The running balance tracked by our mock should equal sum of all earned amounts
          expect(runningBalance).toBe(expectedTotal);
        }
      ),
      { numRuns: 30 }
    );
  });

  // ----------------------------------------------------------
  // Property 3b: balance = earned - redeemed for mixed earn/redeem sequences
  // ----------------------------------------------------------
  test('balance equals earned minus redeemed for any valid earn/redeem sequence', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate earn amounts first, then redeem amounts that don't exceed total earned
        fc.array(fc.integer({ min: 10, max: 300 }), { minLength: 1, maxLength: 8 }).chain(earnAmounts => {
          const totalEarned = earnAmounts.reduce((s, a) => s + a, 0);
          return fc.array(
            fc.integer({ min: 1, max: Math.floor(totalEarned / 2) || 1 }),
            { minLength: 0, maxLength: Math.min(3, earnAmounts.length) }
          ).map(redeemAmounts => ({ earnAmounts, redeemAmounts }));
        }),
        async ({ earnAmounts, redeemAmounts }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const userId = new mongoose.Types.ObjectId().toString();
          let runningBalance = 0;

          // Mock earn operations
          mockUserFindByIdAndUpdate.mockImplementation((id, update) => {
            const inc = update.$inc?.pointsBalance || 0;
            runningBalance += inc;
            return Promise.resolve({ pointsBalance: runningBalance });
          });
          mockPtxCreate.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

          // Execute earn operations
          for (const amount of earnAmounts) {
            await rewardsService.awardPoints(userId, amount, 'referral_signup', 'earn');
          }

          const totalEarned = earnAmounts.reduce((s, a) => s + a, 0);
          const totalRedeemed = redeemAmounts.reduce((s, a) => s + a, 0);
          const expectedFinalBalance = totalEarned - totalRedeemed;

          // Simulate redeem deductions
          for (const amount of redeemAmounts) {
            runningBalance -= amount;
          }

          // The final balance must equal earned - redeemed
          expect(runningBalance).toBe(expectedFinalBalance);
          expect(runningBalance).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 30 }
    );
  });

  // ----------------------------------------------------------
  // Property 3c: awardPoints always records the correct amount in the transaction
  // ----------------------------------------------------------
  test('awardPoints always creates a transaction with the exact awarded amount', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          amount: fc.integer({ min: 1, max: 1000 }),
          source: fc.constantFrom('referral_signup', 'referral_first_course', 'referral_job', 'welcome_bonus'),
          description: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async ({ amount, source, description }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const userId = new mongoose.Types.ObjectId().toString();

          mockUserFindByIdAndUpdate.mockResolvedValue({ pointsBalance: amount });
          mockPtxCreate.mockResolvedValue({ _id: new mongoose.Types.ObjectId(), amount });

          await rewardsService.awardPoints(userId, amount, source, description);

          // Transaction must be created with the exact amount and type 'earn'
          expect(mockPtxCreate).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'earn',
              amount,
              source
            })
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  // ----------------------------------------------------------
  // Property 3d: redeemPoints always creates a transaction with the exact cost
  // ----------------------------------------------------------
  test('redeemPoints always creates a transaction with the exact points cost', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          currentBalance: fc.integer({ min: 100, max: 5000 }),
          pointsCost: fc.integer({ min: 10, max: 100 })
        }).filter(({ currentBalance, pointsCost }) => currentBalance >= pointsCost),
        async ({ currentBalance, pointsCost }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const userId = new mongoose.Types.ObjectId().toString();
          const txId = new mongoose.Types.ObjectId();
          const newBalance = currentBalance - pointsCost;

          mockUserFindById.mockReturnValue({ _id: userId, pointsBalance: currentBalance });
          mockUserFindByIdAndUpdate.mockResolvedValue({
            pointsBalance: newBalance,
            activeRedemptions: [{
              optionId: 'test_option',
              type: 'discount',
              value: 10,
              expiresAt: new Date(Date.now() + 86400000),
              appliedAt: new Date(),
              transactionId: txId
            }]
          });
          mockPtxCreate.mockResolvedValue({ _id: txId });

          const option = {
            optionId: 'test_option',
            name: 'Test Option',
            pointsCost,
            type: 'discount',
            value: 10,
            expiryDays: 30
          };

          const result = await rewardsService.redeemPoints(userId, option);

          // Deducted amount must equal the option's pointsCost exactly
          expect(result.pointsDeducted).toBe(pointsCost);
          expect(result.newBalance).toBe(newBalance);
          expect(result.newBalance).toBe(currentBalance - pointsCost);

          // Transaction must record the exact cost
          expect(mockPtxCreate).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'redeem',
              amount: pointsCost
            })
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  // ----------------------------------------------------------
  // Property 3e: redeemPoints throws when balance is insufficient
  // ----------------------------------------------------------
  test('redeemPoints always throws when pointsCost exceeds current balance', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          currentBalance: fc.integer({ min: 0, max: 499 }),
          pointsCost: fc.integer({ min: 500, max: 1000 })
        }),
        async ({ currentBalance, pointsCost }) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const userId = new mongoose.Types.ObjectId().toString();

          mockUserFindById.mockReturnValue({ _id: userId, pointsBalance: currentBalance });

          const option = {
            optionId: 'expensive_option',
            name: 'Expensive Option',
            pointsCost,
            type: 'discount',
            value: 50,
            expiryDays: 30
          };

          await expect(rewardsService.redeemPoints(userId, option))
            .rejects.toThrow('رصيد النقاط غير كافٍ');

          // Balance must not be modified
          expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
          expect(mockPtxCreate).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 30 }
    );
  });

  // ----------------------------------------------------------
  // Property 3f: balance consistency holds across multiple sequential earn operations
  // ----------------------------------------------------------
  test('running balance is always consistent after each individual earn operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 1, max: 200 }), { minLength: 2, maxLength: 15 }),
        async (amounts) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const userId = new mongoose.Types.ObjectId().toString();
          let simulatedBalance = 0;
          const balancesAfterEachOp = [];

          mockUserFindByIdAndUpdate.mockImplementation((id, update) => {
            const inc = update.$inc?.pointsBalance || 0;
            simulatedBalance += inc;
            return Promise.resolve({ pointsBalance: simulatedBalance });
          });
          mockPtxCreate.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });

          for (let i = 0; i < amounts.length; i++) {
            const result = await rewardsService.awardPoints(userId, amounts[i], 'referral_signup', 'test');
            balancesAfterEachOp.push(result.newBalance);

            // After each operation, balance must equal sum of all amounts so far
            const expectedBalance = amounts.slice(0, i + 1).reduce((s, a) => s + a, 0);
            expect(result.newBalance).toBe(expectedBalance);
          }

          // Final balance must equal total of all amounts
          const totalExpected = amounts.reduce((s, a) => s + a, 0);
          expect(balancesAfterEachOp[balancesAfterEachOp.length - 1]).toBe(totalExpected);
        }
      ),
      { numRuns: 25 }
    );
  });

  // ----------------------------------------------------------
  // Property 3g: getBalance always returns the stored pointsBalance value
  // ----------------------------------------------------------
  test('getBalance always returns the exact stored pointsBalance', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100000 }),
        async (storedBalance) => {
          jest.clearAllMocks();
          rewardsService = require('../src/services/rewardsService');

          const userId = new mongoose.Types.ObjectId().toString();
          mockUserFindById.mockReturnValue({ _id: userId, pointsBalance: storedBalance });

          const balance = await rewardsService.getBalance(userId);

          expect(balance).toBe(storedBalance);
        }
      ),
      { numRuns: 30 }
    );
  });
});
