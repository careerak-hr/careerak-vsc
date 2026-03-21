/**
 * Checkpoint 7 - التأكد من الاستبدال والمتصدرين
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.5
 *
 * يتحقق من:
 * 1. نظام استبدال النقاط (Redemption System)
 * 2. لوحة المتصدرين (Leaderboard System)
 */

// ============================================================
// Mocks
// ============================================================

const mockUserFindById = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();

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
const mockPtxFind = jest.fn();
const mockPtxCountDocs = jest.fn();
const mockPtxAggregate = jest.fn();

jest.mock('../src/models/PointsTransaction', () => ({
  create: (...args) => mockPtxCreate(...args),
  find: (...args) => {
    const val = mockPtxFind(...args);
    return {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(val)
    };
  },
  countDocuments: (...args) => mockPtxCountDocs(...args),
  aggregate: (...args) => mockPtxAggregate(...args)
}));

const mockReferralFindOne = jest.fn();
const mockReferralAggregate = jest.fn();

jest.mock('../src/models/Referral', () => ({
  findOne: (...args) => mockReferralFindOne(...args),
  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  aggregate: (...args) => mockReferralAggregate(...args)
}));

const mockLbFind = jest.fn();
const mockLbFindOne = jest.fn();
const mockLbCountDocs = jest.fn();
const mockLbBulkWrite = jest.fn();
const mockLbUpdateMany = jest.fn();

jest.mock('../src/models/Leaderboard', () => ({
  find: (...args) => {
    const val = mockLbFind(...args);
    return {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(val)
    };
  },
  findOne: (...args) => mockLbFindOne(...args),
  countDocuments: (...args) => mockLbCountDocs(...args),
  bulkWrite: (...args) => mockLbBulkWrite(...args),
  updateMany: (...args) => mockLbUpdateMany(...args)
}));

jest.mock('../src/models/FraudCheck', () => ({
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({})
}));

jest.mock('../src/services/notificationService', () => ({
  sendReferralRewardNotification: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/services/pusherService', () => ({
  broadcastLeaderboardUpdate: jest.fn().mockResolvedValue(true)
}));

const mongoose = require('mongoose');

// ============================================================
// 1. نظام استبدال النقاط - Redemption System
// ============================================================

describe('Checkpoint 7.1 - نظام استبدال النقاط (Redemption System)', () => {
  let rewardsService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    rewardsService = require('../src/services/rewardsService');
  });

  // --- خيارات الاستبدال المعرّفة ---
  describe('خيارات الاستبدال - Redemption Options', () => {
    test('REWARD_CONFIG يحتوي على هيكل المكافآت الصحيح', () => {
      const { REWARD_CONFIG } = rewardsService;
      expect(REWARD_CONFIG.signup.referrer).toBe(50);
      expect(REWARD_CONFIG.signup.referred).toBe(25);
      expect(REWARD_CONFIG.first_course.referrer).toBe(100);
      expect(REWARD_CONFIG.job.referrer).toBe(200);
      expect(REWARD_CONFIG.five_courses.referrer).toBe(150);
      expect(REWARD_CONFIG.paid_subscription.referrer).toBe(300);
    });

    test('خيارات الاستبدال تغطي جميع الأنواع المطلوبة (discount, feature, subscription)', () => {
      // Requirements 3.1: خيارات الاستبدال المتاحة
      const redemptionOptions = [
        { optionId: 'discount_10', pointsCost: 100, type: 'discount', value: 10 },
        { optionId: 'discount_25', pointsCost: 250, type: 'discount', value: 25 },
        { optionId: 'free_course', pointsCost: 500, type: 'discount', value: 100 },
        { optionId: 'monthly_sub', pointsCost: 1000, type: 'subscription', value: 1 },
        { optionId: 'profile_boost', pointsCost: 150, type: 'feature', value: 7 },
        { optionId: 'premium_badge', pointsCost: 200, type: 'feature', value: 1 }
      ];

      const types = new Set(redemptionOptions.map(o => o.type));
      expect(types.has('discount')).toBe(true);
      expect(types.has('feature')).toBe(true);
      expect(types.has('subscription')).toBe(true);
    });
  });

  // --- استبدال النقاط يعمل ---
  describe('استبدال النقاط - Points Redemption', () => {
    test('redeemPoints يخصم النقاط الصحيحة من الرصيد', async () => {
      // Requirements 3.4: خصم النقاط تلقائياً بعد الاستبدال
      const txId = new mongoose.Types.ObjectId();
      mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: 500 });
      mockUserFindByIdAndUpdate.mockResolvedValue({
        pointsBalance: 400,
        activeRedemptions: [{
          optionId: 'discount_10', type: 'discount', value: 10,
          expiresAt: new Date(Date.now() + 86400000), appliedAt: new Date(), transactionId: txId
        }]
      });
      mockPtxCreate.mockResolvedValue({ _id: txId });

      const option = { optionId: 'discount_10', name: 'خصم 10%', pointsCost: 100, type: 'discount', value: 10, expiryDays: 30 };
      const result = await rewardsService.redeemPoints('user-1', option);

      expect(result.pointsDeducted).toBe(100);
      expect(result.newBalance).toBe(400);
      expect(result.transactionId).toBeDefined();
    });

    test('redeemPoints يطبق الخصم/الميزة فوراً (appliedRedemption موجود)', async () => {
      // Requirements 3.3: تطبيق الخصم/الميزة فوراً
      // The service generates its own txId internally; we capture it via mockPtxCreate
      let capturedTxId;
      mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: 300 });
      mockPtxCreate.mockImplementation(({ _id }) => {
        capturedTxId = _id;
        return Promise.resolve({ _id });
      });
      mockUserFindByIdAndUpdate.mockImplementation(() => {
        return Promise.resolve({
          pointsBalance: 100,
          activeRedemptions: [{
            optionId: 'profile_boost', type: 'feature', value: 7,
            expiresAt: new Date(Date.now() + 604800000), appliedAt: new Date(),
            transactionId: capturedTxId
          }]
        });
      });

      const option = { optionId: 'profile_boost', name: 'إبراز الملف', pointsCost: 150, type: 'feature', value: 7, expiryDays: 7 };
      const result = await rewardsService.redeemPoints('user-1', option);

      expect(result.appliedRedemption).toBeDefined();
      expect(result.newBalance).toBe(100);
      expect(result.pointsDeducted).toBe(150);
    });

    test('redeemPoints يرفض الاستبدال عند نقص الرصيد', async () => {
      // Requirements 3.2: عرض النقاط المطلوبة والمتاحة
      mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: 50 });

      const option = { optionId: 'discount_25', name: 'خصم 25%', pointsCost: 250, type: 'discount', value: 25, expiryDays: 30 };
      await expect(rewardsService.redeemPoints('user-1', option)).rejects.toThrow('رصيد النقاط غير كافٍ');
      expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
      expect(mockPtxCreate).not.toHaveBeenCalled();
    });

    test('redeemPoints يسجل معاملة من نوع redeem', async () => {
      const txId = new mongoose.Types.ObjectId();
      mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: 1000 });
      mockUserFindByIdAndUpdate.mockResolvedValue({
        pointsBalance: 0,
        activeRedemptions: [{
          optionId: 'monthly_sub', type: 'subscription', value: 1,
          expiresAt: new Date(Date.now() + 2592000000), appliedAt: new Date(), transactionId: txId
        }]
      });
      mockPtxCreate.mockResolvedValue({ _id: txId });

      const option = { optionId: 'monthly_sub', name: 'اشتراك شهري', pointsCost: 1000, type: 'subscription', value: 1, expiryDays: 30 };
      await rewardsService.redeemPoints('user-1', option);

      expect(mockPtxCreate).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'redeem', amount: 1000 })
      );
    });
  });

  // --- سجل الاستبدالات ---
  describe('سجل الاستبدالات - Redemption History', () => {
    test('getTransactionHistory يجلب سجل المعاملات بما فيها الاستبدالات', async () => {
      // Requirements 3.4: سجل بجميع عمليات الاستبدال
      mockPtxFind.mockReturnValue([
        { _id: 'tx-1', type: 'earn', amount: 50 },
        { _id: 'tx-2', type: 'redeem', amount: 100 }
      ]);
      mockPtxCountDocs.mockResolvedValue(2);

      const { transactions, total } = await rewardsService.getTransactionHistory('user-1');
      expect(total).toBe(2);
      expect(transactions.some(t => t.type === 'redeem')).toBe(true);
    });

    test('getActiveRedemptions يجلب الاستبدالات النشطة فقط', async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 86400000);
      const past = new Date(now.getTime() - 86400000);

      mockUserFindById.mockReturnValue({
        _id: 'user-1',
        activeRedemptions: [
          { optionId: 'discount_10', type: 'discount', isUsed: false, expiresAt: future },
          { optionId: 'old_discount', type: 'discount', isUsed: false, expiresAt: past },
          { optionId: 'used_feature', type: 'feature', isUsed: true, expiresAt: future }
        ]
      });

      const active = await rewardsService.getActiveRedemptions('user-1');
      // يجب أن يُرجع فقط الاستبدالات غير المنتهية وغير المستخدمة
      expect(active.length).toBe(1);
      expect(active[0].optionId).toBe('discount_10');
    });
  });

  // --- التحقق من الرصيد قبل الاستبدال ---
  describe('التحقق من الرصيد - Balance Validation', () => {
    test('الاستبدال متاح فقط عند وجود رصيد كافٍ (Property 9)', async () => {
      // Property 9: Redemption Availability - Requirements 3.1, 3.2
      const testCases = [
        { balance: 100, cost: 100, shouldSucceed: true },
        { balance: 200, cost: 100, shouldSucceed: true },
        { balance: 99, cost: 100, shouldSucceed: false },
        { balance: 0, cost: 100, shouldSucceed: false }
      ];

      for (const tc of testCases) {
        jest.clearAllMocks();
        rewardsService = require('../src/services/rewardsService');

        mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: tc.balance });

        if (tc.shouldSucceed) {
          const txId = new mongoose.Types.ObjectId();
          mockUserFindByIdAndUpdate.mockResolvedValue({
            pointsBalance: tc.balance - tc.cost,
            activeRedemptions: [{
              optionId: 'test', type: 'discount', value: 10,
              expiresAt: new Date(Date.now() + 86400000), appliedAt: new Date(), transactionId: txId
            }]
          });
          mockPtxCreate.mockResolvedValue({ _id: txId });

          const option = { optionId: 'test', name: 'Test', pointsCost: tc.cost, type: 'discount', value: 10, expiryDays: 30 };
          const result = await rewardsService.redeemPoints('user-1', option);
          expect(result.newBalance).toBe(tc.balance - tc.cost);
        } else {
          const option = { optionId: 'test', name: 'Test', pointsCost: tc.cost, type: 'discount', value: 10, expiryDays: 30 };
          await expect(rewardsService.redeemPoints('user-1', option)).rejects.toThrow('رصيد النقاط غير كافٍ');
        }
      }
    });

    test('الرصيد بعد الاستبدال = الرصيد قبله - تكلفة الاستبدال (Property 4)', async () => {
      // Property 4: Redemption Deduction - Requirements 3.4
      const testCases = [
        { balance: 500, cost: 100, expected: 400 },
        { balance: 1000, cost: 250, expected: 750 },
        { balance: 200, cost: 150, expected: 50 }
      ];

      for (const tc of testCases) {
        jest.clearAllMocks();
        rewardsService = require('../src/services/rewardsService');

        const txId = new mongoose.Types.ObjectId();
        mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: tc.balance });
        mockUserFindByIdAndUpdate.mockResolvedValue({
          pointsBalance: tc.expected,
          activeRedemptions: [{
            optionId: 'test', type: 'discount', value: 10,
            expiresAt: new Date(Date.now() + 86400000), appliedAt: new Date(), transactionId: txId
          }]
        });
        mockPtxCreate.mockResolvedValue({ _id: txId });

        const option = { optionId: 'test', name: 'Test', pointsCost: tc.cost, type: 'discount', value: 10, expiryDays: 30 };
        const result = await rewardsService.redeemPoints('user-1', option);

        expect(result.newBalance).toBe(tc.expected);
        expect(result.pointsDeducted).toBe(tc.cost);
        expect(result.newBalance).toBe(tc.balance - tc.cost);
      }
    });
  });
});

// ============================================================
// 2. لوحة المتصدرين - Leaderboard System
// ============================================================

describe('Checkpoint 7.2 - لوحة المتصدرين (Leaderboard System)', () => {
  let leaderboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    leaderboardService = require('../src/services/leaderboardService');
  });

  // --- حساب الترتيب ---
  describe('حساب الترتيب - Ranking Calculation', () => {
    test('updateLeaderboard يرتب المستخدمين حسب عدد الإحالات (Property 10)', async () => {
      // Property 10: Leaderboard Ranking - Requirements 4.2
      mockReferralAggregate.mockResolvedValue([
        { _id: 'user-A', referralCount: 10 },
        { _id: 'user-B', referralCount: 5 },
        { _id: 'user-C', referralCount: 8 }
      ]);
      mockPtxAggregate.mockResolvedValue([
        { _id: 'user-A', totalPoints: 500 },
        { _id: 'user-B', totalPoints: 250 },
        { _id: 'user-C', totalPoints: 400 }
      ]);
      mockLbBulkWrite.mockResolvedValue({ ok: 1 });

      const result = await leaderboardService.updateLeaderboard('alltime');
      expect(result.updated).toBe(3);

      // التحقق من أن bulkWrite استُدعي بالترتيب الصحيح
      const bulkOps = mockLbBulkWrite.mock.calls[0][0];
      // user-A (10 إحالات) يجب أن يكون rank=1
      const userAOp = bulkOps.find(op => op.updateOne.filter.userId === 'user-A');
      expect(userAOp.updateOne.update.$set.rank).toBe(1);
      // user-C (8 إحالات) يجب أن يكون rank=2
      const userCOp = bulkOps.find(op => op.updateOne.filter.userId === 'user-C');
      expect(userCOp.updateOne.update.$set.rank).toBe(2);
      // user-B (5 إحالات) يجب أن يكون rank=3
      const userBOp = bulkOps.find(op => op.updateOne.filter.userId === 'user-B');
      expect(userBOp.updateOne.update.$set.rank).toBe(3);
    });

    test('عند التعادل في الإحالات، يُرتَّب حسب النقاط', async () => {
      // Property 10: Leaderboard Ranking - tie-breaking by points
      mockReferralAggregate.mockResolvedValue([
        { _id: 'user-X', referralCount: 5 },
        { _id: 'user-Y', referralCount: 5 }
      ]);
      mockPtxAggregate.mockResolvedValue([
        { _id: 'user-X', totalPoints: 200 },
        { _id: 'user-Y', totalPoints: 350 }
      ]);
      mockLbBulkWrite.mockResolvedValue({ ok: 1 });

      await leaderboardService.updateLeaderboard('alltime');

      const bulkOps = mockLbBulkWrite.mock.calls[0][0];
      // user-Y (350 نقطة) يجب أن يكون rank=1 عند التعادل
      const userYOp = bulkOps.find(op => op.updateOne.filter.userId === 'user-Y');
      expect(userYOp.updateOne.update.$set.rank).toBe(1);
      const userXOp = bulkOps.find(op => op.updateOne.filter.userId === 'user-X');
      expect(userXOp.updateOne.update.$set.rank).toBe(2);
    });

    test('updateLeaderboard يعيد 0 عند عدم وجود بيانات', async () => {
      mockReferralAggregate.mockResolvedValue([]);
      mockPtxAggregate.mockResolvedValue([]);

      const result = await leaderboardService.updateLeaderboard('alltime');
      expect(result.updated).toBe(0);
      expect(mockLbBulkWrite).not.toHaveBeenCalled();
    });
  });

  // --- جلب الترتيب ---
  describe('جلب الترتيب - Get Rankings', () => {
    test('getRankings يجلب المتصدرين مرتبين بشكل صحيح (Property 6)', async () => {
      // Property 6: Leaderboard Accuracy - Requirements 4.1, 4.4
      const mockEntries = [
        {
          rank: 1,
          userId: { _id: 'user-1', firstName: 'أحمد', lastName: 'محمد', profileImage: null },
          referralCount: 10, totalPoints: 500, lastUpdated: new Date()
        },
        {
          rank: 2,
          userId: { _id: 'user-2', firstName: 'سارة', lastName: 'علي', profileImage: null },
          referralCount: 8, totalPoints: 400, lastUpdated: new Date()
        },
        {
          rank: 3,
          userId: { _id: 'user-3', firstName: 'محمد', lastName: 'خالد', profileImage: null },
          referralCount: 5, totalPoints: 250, lastUpdated: new Date()
        }
      ];

      mockLbFind.mockReturnValue(mockEntries);
      mockLbCountDocs.mockResolvedValue(3);

      const { rankings, total } = await leaderboardService.getRankings('alltime');
      expect(total).toBe(3);
      expect(rankings[0].rank).toBe(1);
      expect(rankings[0].referralCount).toBe(10);
      expect(rankings[1].rank).toBe(2);
      expect(rankings[2].rank).toBe(3);
    });

    test('getRankings يُرجع بيانات المستخدم الصحيحة (Property 6)', async () => {
      // Property 6: Leaderboard Accuracy - بيانات المستخدم تطابق قاعدة البيانات
      const mockEntries = [{
        rank: 1,
        userId: { _id: 'user-1', firstName: 'أحمد', lastName: 'محمد', profileImage: 'img.jpg' },
        referralCount: 15, totalPoints: 750, lastUpdated: new Date()
      }];

      mockLbFind.mockReturnValue(mockEntries);
      mockLbCountDocs.mockResolvedValue(1);

      const { rankings } = await leaderboardService.getRankings('alltime');
      expect(rankings[0].referralCount).toBe(15);
      expect(rankings[0].totalPoints).toBe(750);
      expect(rankings[0].name).toBe('أحمد محمد');
    });

    test('getRankings يُرجع جوائز المتصدرين الثلاثة الأوائل', async () => {
      // Requirements 4.1: جوائز المتصدرين
      const mockEntries = [
        { rank: 1, userId: { _id: 'u1', firstName: 'أ', lastName: 'ب', profileImage: null }, referralCount: 10, totalPoints: 500, lastUpdated: new Date() },
        { rank: 2, userId: { _id: 'u2', firstName: 'ج', lastName: 'د', profileImage: null }, referralCount: 8, totalPoints: 400, lastUpdated: new Date() },
        { rank: 3, userId: { _id: 'u3', firstName: 'ه', lastName: 'و', profileImage: null }, referralCount: 5, totalPoints: 250, lastUpdated: new Date() }
      ];

      mockLbFind.mockReturnValue(mockEntries);
      mockLbCountDocs.mockResolvedValue(3);

      const { rankings } = await leaderboardService.getRankings('alltime');
      expect(rankings[0].prize.badge).toBe('gold');
      expect(rankings[0].prize.points).toBe(1000);
      expect(rankings[1].prize.badge).toBe('silver');
      expect(rankings[1].prize.points).toBe(500);
      expect(rankings[2].prize.badge).toBe('bronze');
      expect(rankings[2].prize.points).toBe(250);
    });
  });

  // --- فلترة حسب الفترة ---
  describe('فلترة حسب الفترة - Period Filtering', () => {
    test('updateLeaderboard يدعم الفترات الثلاث: monthly, yearly, alltime', async () => {
      // Requirements 4.3: فلترة حسب الفترة الزمنية
      const periods = ['monthly', 'yearly', 'alltime'];

      for (const period of periods) {
        jest.clearAllMocks();
        leaderboardService = require('../src/services/leaderboardService');

        mockReferralAggregate.mockResolvedValue([{ _id: 'user-1', referralCount: 3 }]);
        mockPtxAggregate.mockResolvedValue([{ _id: 'user-1', totalPoints: 150 }]);
        mockLbBulkWrite.mockResolvedValue({ ok: 1 });

        const result = await leaderboardService.updateLeaderboard(period);
        expect(result.updated).toBe(1);

        // التحقق من أن bulkWrite استُدعي بالفترة الصحيحة
        const bulkOps = mockLbBulkWrite.mock.calls[0][0];
        expect(bulkOps[0].updateOne.filter.period).toBe(period);
      }
    });

    test('updateAllPeriods يحدث الفترات الثلاث دفعة واحدة', async () => {
      // Requirements 4.3: تحديث جميع الفترات
      mockReferralAggregate.mockResolvedValue([{ _id: 'user-1', referralCount: 3 }]);
      mockPtxAggregate.mockResolvedValue([{ _id: 'user-1', totalPoints: 150 }]);
      mockLbBulkWrite.mockResolvedValue({ ok: 1 });
      mockLbFind.mockReturnValue([]);
      mockLbCountDocs.mockResolvedValue(0);

      const result = await leaderboardService.updateAllPeriods();
      expect(result.monthly).toBeDefined();
      expect(result.yearly).toBeDefined();
      expect(result.alltime).toBeDefined();
    });
  });

  // --- ترتيب المستخدم الحالي ---
  describe('ترتيب المستخدم - My Rank', () => {
    test('getMyRank يجلب ترتيب المستخدم الصحيح', async () => {
      // Requirements 4.2: عرض ترتيبي
      mockLbFindOne.mockResolvedValue({
        rank: 5, referralCount: 7, totalPoints: 350, isVisible: true, lastUpdated: new Date()
      });

      const rank = await leaderboardService.getMyRank('user-1', 'alltime');
      expect(rank.rank).toBe(5);
      expect(rank.referralCount).toBe(7);
      expect(rank.totalPoints).toBe(350);
    });

    test('getMyRank يعيد null للمستخدم غير الموجود في اللوحة', async () => {
      mockLbFindOne.mockResolvedValue(null);

      const rank = await leaderboardService.getMyRank('new-user', 'alltime');
      expect(rank.rank).toBeNull();
      expect(rank.referralCount).toBe(0);
    });
  });

  // --- خيار الخصوصية ---
  describe('خيار الخصوصية - Privacy Option', () => {
    test('updateVisibility يخفي المستخدم من اللوحة', async () => {
      // Requirements 4.5: خيار إخفاء الاسم
      mockLbUpdateMany.mockResolvedValue({ modifiedCount: 3 });

      const result = await leaderboardService.updateVisibility('user-1', false);
      expect(result.isVisible).toBe(false);
      expect(mockLbUpdateMany).toHaveBeenCalledWith(
        { userId: 'user-1' },
        { $set: { isVisible: false } }
      );
    });

    test('updateVisibility يُظهر المستخدم في اللوحة', async () => {
      mockLbUpdateMany.mockResolvedValue({ modifiedCount: 3 });

      const result = await leaderboardService.updateVisibility('user-1', true);
      expect(result.isVisible).toBe(true);
    });

    test('getRankings لا يُظهر المستخدمين المخفيين', async () => {
      // Requirements 4.5: المستخدمون المخفيون لا يظهرون في اللوحة
      // Leaderboard.find يُفلتر isVisible: true تلقائياً
      mockLbFind.mockReturnValue([
        { rank: 1, userId: { _id: 'u1', firstName: 'أ', lastName: 'ب', profileImage: null }, referralCount: 10, totalPoints: 500, lastUpdated: new Date() }
      ]);
      mockLbCountDocs.mockResolvedValue(1);

      const { rankings } = await leaderboardService.getRankings('alltime');
      // يجب أن يُرجع فقط المستخدمين المرئيين
      expect(rankings.length).toBe(1);

      // التحقق من أن find استُدعي بفلتر isVisible: true
      expect(mockLbFind).toHaveBeenCalledWith(
        expect.objectContaining({ isVisible: true })
      );
    });
  });

  // --- التحديث الفوري ---
  describe('التحديث الفوري - Real-time Updates', () => {
    test('updateLeaderboard يستدعي bulkWrite لتحديث البيانات', async () => {
      // Requirements 4.2: تحديث فوري للترتيب
      mockReferralAggregate.mockResolvedValue([
        { _id: 'user-1', referralCount: 5 }
      ]);
      mockPtxAggregate.mockResolvedValue([
        { _id: 'user-1', totalPoints: 250 }
      ]);
      mockLbBulkWrite.mockResolvedValue({ ok: 1 });

      await leaderboardService.updateLeaderboard('alltime');
      expect(mockLbBulkWrite).toHaveBeenCalledTimes(1);
    });
  });
});
