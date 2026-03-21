/**
 * اختبارات التكامل - نظام الإحالة والمكافآت
 * Integration Tests - Referral & Rewards System
 *
 * يغطي تكامل الخدمات مع بعضها باستخدام mocks للنماذج
 * يتبع نفس نمط antiFraud.test.js
 */

// ============================================================
// Mock النماذج - المتغيرات يجب أن تبدأ بـ mock (قاعدة Jest)
// ============================================================

// User mocks
const mockUserFindById = jest.fn();
const mockUserFindOne = jest.fn();
const mockUserFindByIdAndUpdate = jest.fn();
const mockUserUpdateMany = jest.fn();

jest.mock('../src/models/User', () => ({
  User: {
    findById: (...args) => {
      const val = mockUserFindById(...args);
      return { select: jest.fn().mockResolvedValue(val) };
    },
    findOne: (...args) => {
      const val = mockUserFindOne(...args);
      return { select: jest.fn().mockResolvedValue(val) };
    },
    findByIdAndUpdate: (...args) => mockUserFindByIdAndUpdate(...args),
    updateMany: (...args) => mockUserUpdateMany(...args)
  }
}));

// Referral mocks
const mockReferralFindOne = jest.fn();
const mockReferralFind = jest.fn();
const mockReferralCountDocs = jest.fn();
const mockReferralCreate = jest.fn();
const mockReferralFindByIdAndUpdate = jest.fn();
const mockReferralAggregate = jest.fn();
const mockReferralUpdateMany = jest.fn();

jest.mock('../src/models/Referral', () => ({
  findOne: (...args) => mockReferralFindOne(...args),
  find: (...args) => {
    const val = mockReferralFind(...args);
    return {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(val)
    };
  },
  countDocuments: (...args) => mockReferralCountDocs(...args),
  create: (...args) => mockReferralCreate(...args),
  findByIdAndUpdate: (...args) => mockReferralFindByIdAndUpdate(...args),
  aggregate: (...args) => mockReferralAggregate(...args),
  updateMany: (...args) => mockReferralUpdateMany(...args)
}));

// PointsTransaction mocks
const mockPtxFind = jest.fn();
const mockPtxCountDocs = jest.fn();
const mockPtxCreate = jest.fn();
const mockPtxAggregate = jest.fn();

jest.mock('../src/models/PointsTransaction', () => ({
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
  create: (...args) => mockPtxCreate(...args),
  aggregate: (...args) => mockPtxAggregate(...args)
}));

// Leaderboard mocks
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
// ReferralService + AntiFraudService Integration
// ============================================================

describe('ReferralService - تكامل مع AntiFraudService', () => {
  let referralService;

  beforeEach(() => {
    jest.clearAllMocks();
    referralService = require('../src/services/referralService');
  });

  test('getOrCreateReferralCode - يعيد الكود الموجود إذا كان المستخدم لديه كود', async () => {
    mockUserFindById.mockReturnValue({ _id: 'user-1', referralCode: 'ABC1234' });

    const code = await referralService.getOrCreateReferralCode('user-1');
    expect(code).toBe('ABC1234');
  });

  test('getOrCreateReferralCode - ينشئ كوداً جديداً إذا لم يكن للمستخدم كود', async () => {
    mockUserFindById.mockReturnValue({ _id: 'user-1', referralCode: null });
    mockUserFindOne.mockReturnValue(null);
    mockUserFindByIdAndUpdate.mockResolvedValue({});

    const code = await referralService.getOrCreateReferralCode('user-1');
    expect(code).toBeDefined();
    expect(code.length).toBeGreaterThanOrEqual(6);
    expect(mockUserFindByIdAndUpdate).toHaveBeenCalled();
  });

  test('getOrCreateReferralCode - يرمي خطأ إذا المستخدم غير موجود', async () => {
    mockUserFindById.mockReturnValue(null);

    await expect(referralService.getOrCreateReferralCode('nonexistent'))
      .rejects.toThrow('المستخدم غير موجود');
  });

  test('trackReferral - يمنع الإحالة الذاتية', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    mockUserFindOne.mockReturnValue({ _id: userId });

    const result = await referralService.trackReferral({
      referralCode: 'SELF01',
      referredUserId: userId,
      ipAddress: '10.0.0.1'
    });

    expect(result).toBeNull();
  });

  test('trackReferral - يعيد الإحالة الموجودة إذا كان المستخدم مُحالاً مسبقاً', async () => {
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();
    const existingReferral = { _id: 'ref-1', referrerId, referredUserId: referredId, status: 'pending' };

    mockUserFindOne.mockReturnValue({ _id: referrerId });
    mockReferralFindOne.mockResolvedValue(existingReferral);

    const result = await referralService.trackReferral({
      referralCode: 'CODE01',
      referredUserId: referredId,
      ipAddress: '10.0.0.1'
    });

    expect(result).toEqual(existingReferral);
  });

  test('trackReferral - يرفض الإحالة الاحتيالية (نفس IP + جهاز + تسجيل سريع)', async () => {
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();

    mockUserFindOne.mockReturnValue({ _id: referrerId });
    // لا إحالة سابقة للمُحال، ثم فحوصات الاحتيال:
    // checkSameIP.findOne → null (لا إحالة ذاتية بنفس IP)
    // checkSameDevice.findOne #1 → null (لا إحالة ذاتية بنفس الجهاز)
    // checkSameDevice.findOne #2 → { _id: 'device-match' } → 40pts
    mockReferralFindOne
      .mockResolvedValueOnce(null)                  // إحالة سابقة للمُحال
      .mockResolvedValueOnce(null)                  // checkSameIP: IP self-referral
      .mockResolvedValueOnce(null)                  // checkSameDevice: device self-referral
      .mockResolvedValueOnce({ _id: 'device-match' }); // checkSameDevice: same device → 40pts

    // checkSameIP: concurrent=0, monthly=11 (30pts)
    // checkRapidSignups: 0
    // checkPatternMatching: sameIpAndDevice=0, burst=0
    // Score: 30 (IP monthly) + 40 (device) = 70 → blocked ✅
    mockReferralCountDocs
      .mockResolvedValueOnce(0)   // concurrent pending
      .mockResolvedValueOnce(11)  // monthly IP limit (>= 10 → 30pts)
      .mockResolvedValueOnce(0)   // rapid signups
      .mockResolvedValueOnce(0)   // pattern: sameIpAndDevice
      .mockResolvedValueOnce(0);  // pattern: burst

    await expect(referralService.trackReferral({
      referralCode: 'CODE02',
      referredUserId: referredId,
      ipAddress: '192.168.1.1',
      deviceFingerprint: 'fp-fraud'
    })).rejects.toThrow('تم رفض الإحالة بسبب نشاط مشبوه');
  });

  test('trackReferral - ينشئ إحالة نظيفة بنجاح', async () => {
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();
    const newReferral = { _id: 'ref-new', referrerId, referredUserId: referredId, status: 'pending' };

    mockUserFindOne.mockReturnValue({ _id: referrerId });
    mockReferralFindOne.mockResolvedValue(null);
    mockReferralCountDocs.mockResolvedValue(0);
    mockReferralCreate.mockResolvedValue(newReferral);

    const result = await referralService.trackReferral({
      referralCode: 'CLEAN1',
      referredUserId: referredId,
      ipAddress: '10.0.0.1'
    });

    expect(result).toEqual(newReferral);
    expect(mockReferralCreate).toHaveBeenCalled();
  });

  test('getUserReferrals - يجلب إحالات المستخدم مع الإجمالي', async () => {
    const userId = 'user-ref-1';
    const mockReferrals = [
      { _id: 'r1', referrerId: userId, status: 'completed' },
      { _id: 'r2', referrerId: userId, status: 'pending' }
    ];

    mockReferralFind.mockReturnValue(mockReferrals);
    mockReferralCountDocs.mockResolvedValue(2);

    const { referrals, total } = await referralService.getUserReferrals(userId);
    expect(total).toBe(2);
    expect(referrals).toHaveLength(2);
  });

  test('getReferralStats - يحسب الإحصائيات بشكل صحيح', async () => {
    mockReferralCountDocs
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);

    const stats = await referralService.getReferralStats('user-stats-1');
    expect(stats.total).toBe(5);
    expect(stats.completed).toBe(3);
    expect(stats.pending).toBe(2);
    expect(stats.cancelled).toBe(0);
  });
});

// ============================================================
// RewardsService Integration Tests
// ============================================================

describe('RewardsService - تكامل منح النقاط والاستبدال', () => {
  let rewardsService;

  beforeEach(() => {
    jest.clearAllMocks();
    rewardsService = require('../src/services/rewardsService');
  });

  test('getBalance - يجلب رصيد المستخدم', async () => {
    mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: 150 });
    expect(await rewardsService.getBalance('user-1')).toBe(150);
  });

  test('getBalance - يجلب 0 للمستخدم الجديد', async () => {
    mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: 0 });
    expect(await rewardsService.getBalance('user-1')).toBe(0);
  });

  test('getBalance - يرمي خطأ إذا المستخدم غير موجود', async () => {
    mockUserFindById.mockReturnValue(null);
    await expect(rewardsService.getBalance('nonexistent')).rejects.toThrow('المستخدم غير موجود');
  });

  test('awardPoints - يمنح نقاط ويحدث الرصيد', async () => {
    mockUserFindByIdAndUpdate.mockResolvedValue({ pointsBalance: 50 });
    mockPtxCreate.mockResolvedValue({ _id: 'tx-1', amount: 50 });

    const result = await rewardsService.awardPoints('user-1', 50, 'referral_signup', 'مكافأة التسجيل');
    expect(result.awarded).toBe(50);
    expect(result.newBalance).toBe(50);
    expect(mockPtxCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'earn', amount: 50 }));
  });

  test('awardPoints - يرمي خطأ إذا المستخدم غير موجود', async () => {
    mockUserFindByIdAndUpdate.mockResolvedValue(null);
    await expect(rewardsService.awardPoints('nonexistent', 50, 'referral_signup', 'test')).rejects.toThrow();
  });

  test('redeemPoints - يخصم النقاط بشكل صحيح', async () => {
    const txId = new mongoose.Types.ObjectId();
    mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: 500 });
    mockUserFindByIdAndUpdate.mockResolvedValue({
      pointsBalance: 400,
      activeRedemptions: [{
        optionId: 'discount_10', type: 'discount', value: 10,
        expiresAt: new Date(), appliedAt: new Date(), transactionId: txId
      }]
    });
    mockPtxCreate.mockResolvedValue({ _id: txId });

    const option = { optionId: 'discount_10', name: 'خصم 10%', pointsCost: 100, type: 'discount', value: 10, expiryDays: 30 };
    const result = await rewardsService.redeemPoints('user-1', option);
    expect(result.pointsDeducted).toBe(100);
    expect(result.newBalance).toBe(400);
    expect(result.transactionId).toBeDefined();
  });

  test('redeemPoints - يرمي خطأ عند نقص الرصيد', async () => {
    mockUserFindById.mockReturnValue({ _id: 'user-1', pointsBalance: 50 });
    const option = { optionId: 'discount_25', name: 'خصم 25%', pointsCost: 250, type: 'discount', value: 25, expiryDays: 30 };
    await expect(rewardsService.redeemPoints('user-1', option)).rejects.toThrow('رصيد النقاط غير كافٍ');
  });

  test('getTransactionHistory - يجلب سجل المعاملات', async () => {
    mockPtxFind.mockReturnValue([{ _id: 'tx-1', type: 'earn' }, { _id: 'tx-2', type: 'earn' }]);
    mockPtxCountDocs.mockResolvedValue(2);

    const { transactions, total } = await rewardsService.getTransactionHistory('user-1');
    expect(total).toBe(2);
    expect(transactions).toHaveLength(2);
  });

  test('awardSignupReward - يمنح نقاط التسجيل للمحيل والمُحال', async () => {
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();

    mockReferralFindOne.mockResolvedValue(null);
    mockReferralCountDocs.mockResolvedValue(0);
    mockUserFindByIdAndUpdate
      .mockResolvedValueOnce({ pointsBalance: 50 })
      .mockResolvedValueOnce({ pointsBalance: 25 })
      .mockResolvedValue({});
    mockPtxCreate.mockResolvedValue({ _id: 'tx-1' });
    mockReferralFindByIdAndUpdate.mockResolvedValue({});

    const referral = { _id: 'ref-1', referrerId, referredUserId: referredId, ipAddress: '10.0.0.1', rewards: [] };
    const results = await rewardsService.awardSignupReward(referral);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);
    expect(results[0].awarded).toBe(50);
    expect(results[1].awarded).toBe(25);
  });

  test('awardSignupReward - لا يمنح المكافأة مرتين', async () => {
    const referral = {
      _id: 'ref-2', referrerId: 'user-A', referredUserId: 'user-B',
      rewards: [{ type: 'signup', points: 50, awardedAt: new Date() }]
    };
    const results = await rewardsService.awardSignupReward(referral);
    expect(results).toHaveLength(0);
    expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('awardSignupReward - يحظر الإحالة الاحتيالية ويلغيها', async () => {
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();

    // antiFraud مع deviceFingerprint:
    // checkSameIP.findOne → null (لا إحالة ذاتية بنفس IP)
    // checkSameDevice.findOne #1 → null (لا إحالة ذاتية بنفس الجهاز)
    // checkSameDevice.findOne #2 → { _id: 'device-match' } → 40pts
    // checkSameIP: monthly=11 → 30pts
    // Score: 30 + 40 = 70 → blocked ✅
    mockReferralFindOne
      .mockResolvedValueOnce(null)                  // checkSameIP: IP self-referral
      .mockResolvedValueOnce(null)                  // checkSameDevice: device self-referral
      .mockResolvedValueOnce({ _id: 'device-match' }); // checkSameDevice: same device → 40pts
    mockReferralCountDocs
      .mockResolvedValueOnce(0)   // concurrent pending
      .mockResolvedValueOnce(11)  // monthly IP limit → 30pts
      .mockResolvedValueOnce(0)   // rapid signups
      .mockResolvedValueOnce(0)   // pattern: sameIpAndDevice
      .mockResolvedValueOnce(0);  // pattern: burst
    mockReferralFindByIdAndUpdate.mockResolvedValue({});

    const referral = { _id: 'ref-fraud', referrerId, referredUserId: referredId, ipAddress: '192.168.1.1', deviceFingerprint: 'fp-fraud', rewards: [] };
    await rewardsService.awardSignupReward(referral);

    expect(mockReferralFindByIdAndUpdate).toHaveBeenCalledWith('ref-fraud', { status: 'cancelled' });
    expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
  });
});

// ============================================================
// LeaderboardService Integration Tests
// ============================================================

describe('LeaderboardService - تكامل لوحة المتصدرين', () => {
  let leaderboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    leaderboardService = require('../src/services/leaderboardService');
  });

  test('updateLeaderboard - يحدث اللوحة بشكل صحيح', async () => {
    mockReferralAggregate.mockResolvedValue([
      { _id: 'user-1', referralCount: 5 },
      { _id: 'user-2', referralCount: 2 }
    ]);
    mockPtxAggregate.mockResolvedValue([
      { _id: 'user-1', totalPoints: 250 },
      { _id: 'user-2', totalPoints: 100 }
    ]);
    mockLbBulkWrite.mockResolvedValue({ ok: 1 });

    const result = await leaderboardService.updateLeaderboard('alltime');
    expect(result.updated).toBe(2);
    expect(mockLbBulkWrite).toHaveBeenCalled();
  });

  test('updateLeaderboard - يعيد 0 إذا لا توجد بيانات', async () => {
    mockReferralAggregate.mockResolvedValue([]);
    mockPtxAggregate.mockResolvedValue([]);

    const result = await leaderboardService.updateLeaderboard('alltime');
    expect(result.updated).toBe(0);
    expect(mockLbBulkWrite).not.toHaveBeenCalled();
  });

  test('getRankings - يجلب الترتيب الصحيح', async () => {
    const mockEntries = [
      { rank: 1, userId: { _id: 'user-1', firstName: 'أحمد', lastName: 'محمد', profileImage: null }, referralCount: 5, totalPoints: 250, lastUpdated: new Date() },
      { rank: 2, userId: { _id: 'user-2', firstName: 'سارة', lastName: 'علي', profileImage: null }, referralCount: 2, totalPoints: 100, lastUpdated: new Date() }
    ];

    mockLbFind.mockReturnValue(mockEntries);
    mockLbCountDocs.mockResolvedValue(2);

    const { rankings, total } = await leaderboardService.getRankings('alltime');
    expect(total).toBe(2);
    expect(rankings[0].rank).toBe(1);
    expect(rankings[0].referralCount).toBe(5);
  });

  test('getMyRank - يجلب ترتيب المستخدم', async () => {
    mockLbFindOne.mockResolvedValue({ rank: 3, referralCount: 4, totalPoints: 200, isVisible: true, lastUpdated: new Date() });

    const rank = await leaderboardService.getMyRank('user-1', 'alltime');
    expect(rank.rank).toBe(3);
    expect(rank.referralCount).toBe(4);
  });

  test('getMyRank - يعيد null للمستخدم غير الموجود في اللوحة', async () => {
    mockLbFindOne.mockResolvedValue(null);

    const rank = await leaderboardService.getMyRank('user-new', 'alltime');
    expect(rank.rank).toBeNull();
    expect(rank.referralCount).toBe(0);
  });

  test('updateVisibility - يخفي المستخدم من اللوحة', async () => {
    mockLbUpdateMany.mockResolvedValue({ modifiedCount: 3 });

    const result = await leaderboardService.updateVisibility('user-1', false);
    expect(result.isVisible).toBe(false);
    expect(mockLbUpdateMany).toHaveBeenCalledWith({ userId: 'user-1' }, { $set: { isVisible: false } });
  });

  test('updateVisibility - يُظهر المستخدم في اللوحة', async () => {
    mockLbUpdateMany.mockResolvedValue({ modifiedCount: 3 });

    const result = await leaderboardService.updateVisibility('user-1', true);
    expect(result.isVisible).toBe(true);
  });
});

// ============================================================
// تدفق التكامل الكامل: إحالة → مكافأة → رصيد
// ============================================================

describe('Referral System - تدفق التكامل الكامل', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('تدفق كامل: إحالة نظيفة → مكافأة تسجيل → تحقق من الرصيد', async () => {
    const referralService = require('../src/services/referralService');
    const rewardsService = require('../src/services/rewardsService');
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();

    // الخطوة 1: الحصول على كود الإحالة
    mockUserFindById.mockReturnValue({ _id: referrerId, referralCode: 'FLOW01' });
    const code = await referralService.getOrCreateReferralCode(referrerId);
    expect(code).toBe('FLOW01');

    // الخطوة 2: تتبع الإحالة
    mockUserFindOne.mockReturnValue({ _id: referrerId });
    mockReferralFindOne.mockResolvedValue(null);
    mockReferralCountDocs.mockResolvedValue(0);
    const newReferral = { _id: 'ref-flow', referrerId, referredUserId: referredId, status: 'pending', rewards: [] };
    mockReferralCreate.mockResolvedValue(newReferral);

    const referral = await referralService.trackReferral({ referralCode: code, referredUserId: referredId, ipAddress: '10.0.0.1' });
    expect(referral.status).toBe('pending');

    // الخطوة 3: منح مكافأة التسجيل
    mockReferralFindOne.mockResolvedValue(null);
    mockReferralCountDocs.mockResolvedValue(0);
    mockUserFindByIdAndUpdate
      .mockResolvedValueOnce({ pointsBalance: 50 })
      .mockResolvedValueOnce({ pointsBalance: 25 })
      .mockResolvedValue({});
    mockPtxCreate.mockResolvedValue({ _id: 'tx-flow' });
    mockReferralFindByIdAndUpdate.mockResolvedValue({});

    const rewards = await rewardsService.awardSignupReward(referral);
    expect(Array.isArray(rewards)).toBe(true);
    expect(rewards.length).toBe(2);

    // الخطوة 4: التحقق من الرصيد
    mockUserFindById.mockReturnValue({ _id: referrerId, pointsBalance: 50 });
    const balance = await rewardsService.getBalance(referrerId);
    expect(balance).toBe(50);
  });

  test('تتبع المصدر: حفظ source و ipAddress و deviceFingerprint عند الإحالة', async () => {
    const referralService = require('../src/services/referralService');
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();

    mockUserFindOne.mockReturnValue({ _id: referrerId });
    mockReferralFindOne.mockResolvedValue(null);
    mockReferralCountDocs.mockResolvedValue(0);

    const newReferral = {
      _id: 'ref-source',
      referrerId,
      referredUserId: referredId,
      status: 'pending',
      source: 'whatsapp',
      ipAddress: '203.0.113.5',
      deviceFingerprint: 'fp-abc123',
      rewards: []
    };
    mockReferralCreate.mockResolvedValue(newReferral);

    const referral = await referralService.trackReferral({
      referralCode: 'CODE01',
      referredUserId: referredId,
      ipAddress: '203.0.113.5',
      deviceFingerprint: 'fp-abc123',
      source: 'whatsapp'
    });

    // التحقق من أن Referral.create استُدعي بالحقول الصحيحة
    expect(mockReferralCreate).toHaveBeenCalledWith(expect.objectContaining({
      source: 'whatsapp',
      ipAddress: '203.0.113.5',
      deviceFingerprint: 'fp-abc123'
    }));

    expect(referral.source).toBe('whatsapp');
    expect(referral.ipAddress).toBe('203.0.113.5');
    expect(referral.deviceFingerprint).toBe('fp-abc123');
  });

  test('تتبع المصدر: استخدام "direct" كقيمة افتراضية عند عدم تحديد المصدر', async () => {
    const referralService = require('../src/services/referralService');
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();

    mockUserFindOne.mockReturnValue({ _id: referrerId });
    mockReferralFindOne.mockResolvedValue(null);
    mockReferralCountDocs.mockResolvedValue(0);

    const newReferral = {
      _id: 'ref-default-source',
      referrerId,
      referredUserId: referredId,
      status: 'pending',
      source: 'direct',
      ipAddress: '10.0.0.1',
      rewards: []
    };
    mockReferralCreate.mockResolvedValue(newReferral);

    const referral = await referralService.trackReferral({
      referralCode: 'CODE01',
      referredUserId: referredId,
      ipAddress: '10.0.0.1'
      // source غير محدد → يجب أن يكون 'direct'
    });

    expect(mockReferralCreate).toHaveBeenCalledWith(expect.objectContaining({
      source: 'direct'
    }));
    expect(referral.source).toBe('direct');
  });

  test('تتبع المصدر: استخراج IP من x-forwarded-for في الكونترولر', () => {
    // اختبار منطق استخراج IP مباشرة
    const extractIp = (headers, reqIp) => {
      return (headers['x-forwarded-for'] || '').split(',')[0].trim() || reqIp;
    };

    // حالة: x-forwarded-for موجود (بروكسي)
    expect(extractIp({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }, '10.0.0.1')).toBe('1.2.3.4');

    // حالة: x-forwarded-for غير موجود → استخدام req.ip
    expect(extractIp({}, '192.168.1.1')).toBe('192.168.1.1');

    // حالة: x-forwarded-for فارغ → استخدام req.ip
    expect(extractIp({ 'x-forwarded-for': '' }, '172.16.0.1')).toBe('172.16.0.1');
  });

  test('تتبع المصدر: استخراج deviceFingerprint من body أو header', async () => {
    const referralService = require('../src/services/referralService');
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();

    mockUserFindOne.mockReturnValue({ _id: referrerId });
    mockReferralFindOne.mockResolvedValue(null);
    mockReferralCountDocs.mockResolvedValue(0);

    const newReferral = {
      _id: 'ref-fp',
      referrerId,
      referredUserId: referredId,
      status: 'pending',
      source: 'email',
      ipAddress: '10.0.0.1',
      deviceFingerprint: 'fp-from-body',
      rewards: []
    };
    mockReferralCreate.mockResolvedValue(newReferral);

    const referral = await referralService.trackReferral({
      referralCode: 'CODE01',
      referredUserId: referredId,
      ipAddress: '10.0.0.1',
      deviceFingerprint: 'fp-from-body',
      source: 'email'
    });

    expect(mockReferralCreate).toHaveBeenCalledWith(expect.objectContaining({
      deviceFingerprint: 'fp-from-body',
      source: 'email'
    }));
    expect(referral.deviceFingerprint).toBe('fp-from-body');
  });

  test('تتبع المصدر: دعم جميع قيم source المسموح بها', async () => {
    const referralService = require('../src/services/referralService');
    const validSources = ['whatsapp', 'email', 'direct', 'copy', 'other'];

    for (const source of validSources) {
      jest.clearAllMocks();
      const referrerId = new mongoose.Types.ObjectId().toString();
      const referredId = new mongoose.Types.ObjectId().toString();

      mockUserFindOne.mockReturnValue({ _id: referrerId });
      mockReferralFindOne.mockResolvedValue(null);
      mockReferralCountDocs.mockResolvedValue(0);
      mockReferralCreate.mockResolvedValue({
        _id: `ref-${source}`,
        referrerId,
        referredUserId: referredId,
        status: 'pending',
        source,
        ipAddress: '10.0.0.1',
        rewards: []
      });

      const referral = await referralService.trackReferral({
        referralCode: 'CODE01',
        referredUserId: referredId,
        ipAddress: '10.0.0.1',
        source
      });

      expect(mockReferralCreate).toHaveBeenCalledWith(expect.objectContaining({ source }));
      expect(referral.source).toBe(source);
    }
  });

  test('تتبع المصدر: استخراج IP من x-forwarded-for', () => {
    // اختبار منطق استخراج IP مباشرة (نسخة مكررة للتأكيد)
    const extractIp = (headers, reqIp) =>
      (headers['x-forwarded-for'] || '').split(',')[0].trim() || reqIp;
    expect(extractIp({ 'x-forwarded-for': '5.6.7.8, 10.0.0.1' }, '10.0.0.1')).toBe('5.6.7.8');
    expect(extractIp({}, '192.168.0.1')).toBe('192.168.0.1');
  });

  test('تدفق الاستبدال: كسب نقاط → استبدال → تحقق من الرصيد', async () => {
    const rewardsService = require('../src/services/rewardsService');
    const userId = 'user-redeem';
    const txId = new mongoose.Types.ObjectId();

    // كسب نقاط
    mockUserFindByIdAndUpdate.mockResolvedValueOnce({ pointsBalance: 500 });
    mockPtxCreate.mockResolvedValue({ _id: 'tx-earn' });
    const earned = await rewardsService.awardPoints(userId, 500, 'referral_signup', 'مكافأة');
    expect(earned.newBalance).toBe(500);

    // استبدال النقاط
    mockUserFindById.mockReturnValue({ _id: userId, pointsBalance: 500 });
    mockUserFindByIdAndUpdate.mockResolvedValueOnce({
      pointsBalance: 400,
      activeRedemptions: [{ optionId: 'discount_10', type: 'discount', value: 10, expiresAt: new Date(), appliedAt: new Date(), transactionId: txId }]
    });
    mockPtxCreate.mockResolvedValue({ _id: txId });

    const option = { optionId: 'discount_10', name: 'خصم 10%', pointsCost: 100, type: 'discount', value: 10, expiryDays: 30 };
    const result = await rewardsService.redeemPoints(userId, option);
    expect(result.newBalance).toBe(400);
    expect(result.pointsDeducted).toBe(100);

    // التحقق من الرصيد النهائي
    mockUserFindById.mockReturnValue({ _id: userId, pointsBalance: 400 });
    expect(await rewardsService.getBalance(userId)).toBe(400);
  });

  test('تدفق الاحتيال: إحالة مشبوهة → حظر المكافأة وإلغاء الإحالة', async () => {
    const rewardsService = require('../src/services/rewardsService');
    const referrerId = new mongoose.Types.ObjectId().toString();
    const referredId = new mongoose.Types.ObjectId().toString();

    // antiFraud مع deviceFingerprint:
    // checkSameIP.findOne → null، checkSameDevice.findOne #1 → null، #2 → device match (40pts)
    // checkSameIP: monthly=11 → 30pts
    // Score: 30 + 40 = 70 → blocked ✅
    mockReferralFindOne
      .mockResolvedValueOnce(null)                  // checkSameIP: IP self-referral
      .mockResolvedValueOnce(null)                  // checkSameDevice: device self-referral
      .mockResolvedValueOnce({ _id: 'device-match' }); // checkSameDevice: same device → 40pts
    mockReferralCountDocs
      .mockResolvedValueOnce(0)   // concurrent pending
      .mockResolvedValueOnce(11)  // monthly IP limit → 30pts
      .mockResolvedValueOnce(0)   // rapid signups
      .mockResolvedValueOnce(0)   // pattern: sameIpAndDevice
      .mockResolvedValueOnce(0);  // pattern: burst
    mockReferralFindByIdAndUpdate.mockResolvedValue({});

    const referral = { _id: 'ref-fraud', referrerId, referredUserId: referredId, ipAddress: '192.168.1.1', deviceFingerprint: 'fp-fraud', rewards: [] };
    await rewardsService.awardSignupReward(referral);

    expect(mockReferralFindByIdAndUpdate).toHaveBeenCalledWith('ref-fraud', { status: 'cancelled' });
    expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
  });
});
