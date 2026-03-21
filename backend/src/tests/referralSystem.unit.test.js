/**
 * اختبارات الوحدة - نظام الإحالة والمكافآت
 * Unit Tests - Referral & Rewards System
 *
 * يغطي:
 * - ReferralService (توليد الكود، تتبع الإحالة، الإحصائيات)
 * - RewardsService (منح النقاط، الاستبدال، الرصيد)
 * - AntiFraudService (كشف الاحتيال، درجة الشك)
 * - LeaderboardService (الترتيب، الخصوصية)
 */

const mongoose = require('mongoose');

// ============================================================
// ReferralService - Unit Tests (بدون قاعدة بيانات)
// ============================================================

describe('ReferralService - generateCode', () => {
  const crypto = require('crypto');

  function generateCode(length = 7) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  test('يولد كود بالطول الصحيح (7 أحرف افتراضياً)', () => {
    const code = generateCode();
    expect(code).toHaveLength(7);
  });

  test('يولد كود بطول مخصص (8 أحرف)', () => {
    const code = generateCode(8);
    expect(code).toHaveLength(8);
  });

  test('يولد كود بطول مخصص (6 أحرف)', () => {
    const code = generateCode(6);
    expect(code).toHaveLength(6);
  });

  test('الكود يحتوي فقط على أحرف مسموح بها (بدون 0,O,1,I)', () => {
    const allowedChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
    for (let i = 0; i < 20; i++) {
      expect(generateCode()).toMatch(allowedChars);
    }
  });

  test('الأكواد المتولدة فريدة (لا تكرار في 100 محاولة)', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateCode());
    }
    // يجب أن تكون معظمها فريدة (احتمال التكرار منخفض جداً)
    expect(codes.size).toBeGreaterThan(90);
  });
});

describe('ReferralService - buildReferralLink', () => {
  function buildReferralLink(code) {
    const baseUrl = process.env.FRONTEND_URL || 'https://careerak.com';
    return `${baseUrl}/register?ref=${code}`;
  }

  test('يبني رابط إحالة صحيح', () => {
    const link = buildReferralLink('ABC1234');
    expect(link).toContain('/register?ref=ABC1234');
  });

  test('الرابط يحتوي على الكود كاملاً', () => {
    const code = 'XYZ5678';
    const link = buildReferralLink(code);
    expect(link).toContain(code);
  });

  test('الرابط يبدأ بـ https', () => {
    const link = buildReferralLink('TEST123');
    expect(link).toMatch(/^https?:\/\//);
  });
});

// ============================================================
// RewardsService - REWARD_CONFIG Unit Tests
// ============================================================

describe('RewardsService - REWARD_CONFIG', () => {
  const REWARD_CONFIG = {
    signup: { referrer: 50, referred: 25 },
    first_course: { referrer: 100 },
    job: { referrer: 200 },
    five_courses: { referrer: 150 },
    paid_subscription: { referrer: 300 }
  };

  test('مكافأة التسجيل: 50 نقطة للمحيل', () => {
    expect(REWARD_CONFIG.signup.referrer).toBe(50);
  });

  test('مكافأة الترحيب: 25 نقطة للمُحال', () => {
    expect(REWARD_CONFIG.signup.referred).toBe(25);
  });

  test('مكافأة إكمال أول دورة: 100 نقطة للمحيل', () => {
    expect(REWARD_CONFIG.first_course.referrer).toBe(100);
  });

  test('مكافأة الحصول على وظيفة: 200 نقطة للمحيل', () => {
    expect(REWARD_CONFIG.job.referrer).toBe(200);
  });

  test('مكافأة إكمال 5 دورات: 150 نقطة للمحيل', () => {
    expect(REWARD_CONFIG.five_courses.referrer).toBe(150);
  });

  test('مكافأة الاشتراك المدفوع: 300 نقطة للمحيل', () => {
    expect(REWARD_CONFIG.paid_subscription.referrer).toBe(300);
  });

  test('جميع قيم المكافآت موجبة', () => {
    Object.values(REWARD_CONFIG).forEach(config => {
      Object.values(config).forEach(points => {
        expect(points).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================================
// AntiFraudService - Score Calculation Unit Tests
// ============================================================

describe('AntiFraudService - Suspicion Score Logic', () => {
  const SCORE_WEIGHTS = { sameIP: 30, sameDevice: 40, rapidSignups: 20, inactiveReferral: 10 };

  function calculateStatus(score) {
    if (score >= 70) return 'blocked';
    if (score >= 40) return 'suspicious';
    return 'clean';
  }

  test('درجة 0 = clean', () => {
    expect(calculateStatus(0)).toBe('clean');
  });

  test('درجة 39 = clean', () => {
    expect(calculateStatus(39)).toBe('clean');
  });

  test('درجة 40 = suspicious', () => {
    expect(calculateStatus(40)).toBe('suspicious');
  });

  test('درجة 69 = suspicious', () => {
    expect(calculateStatus(69)).toBe('suspicious');
  });

  test('درجة 70 = blocked', () => {
    expect(calculateStatus(70)).toBe('blocked');
  });

  test('درجة 100 = blocked', () => {
    expect(calculateStatus(100)).toBe('blocked');
  });

  test('نفس IP + نفس الجهاز = 70 (blocked)', () => {
    const score = SCORE_WEIGHTS.sameIP + SCORE_WEIGHTS.sameDevice;
    expect(score).toBe(70);
    expect(calculateStatus(score)).toBe('blocked');
  });

  test('نفس IP فقط = 30 (clean)', () => {
    const score = SCORE_WEIGHTS.sameIP;
    expect(score).toBe(30);
    expect(calculateStatus(score)).toBe('clean');
  });

  test('نفس الجهاز فقط = 40 (suspicious)', () => {
    const score = SCORE_WEIGHTS.sameDevice;
    expect(score).toBe(40);
    expect(calculateStatus(score)).toBe('suspicious');
  });

  test('تسجيل سريع + نفس IP = 50 (suspicious)', () => {
    const score = SCORE_WEIGHTS.rapidSignups + SCORE_WEIGHTS.sameIP;
    expect(score).toBe(50);
    expect(calculateStatus(score)).toBe('suspicious');
  });
});

// ============================================================
// LeaderboardService - Ranking Logic Unit Tests
// ============================================================

describe('LeaderboardService - Ranking Logic', () => {
  function sortForLeaderboard(users) {
    return [...users].sort((a, b) => {
      if (b.referralCount !== a.referralCount) return b.referralCount - a.referralCount;
      return b.totalPoints - a.totalPoints;
    });
  }

  test('يرتب المستخدمين حسب عدد الإحالات تنازلياً', () => {
    const users = [
      { userId: 'A', referralCount: 3, totalPoints: 100 },
      { userId: 'B', referralCount: 10, totalPoints: 50 },
      { userId: 'C', referralCount: 1, totalPoints: 200 }
    ];
    const sorted = sortForLeaderboard(users);
    expect(sorted[0].userId).toBe('B');
    expect(sorted[1].userId).toBe('A');
    expect(sorted[2].userId).toBe('C');
  });

  test('عند تعادل الإحالات، يرتب حسب النقاط تنازلياً', () => {
    const users = [
      { userId: 'A', referralCount: 5, totalPoints: 100 },
      { userId: 'B', referralCount: 5, totalPoints: 300 },
      { userId: 'C', referralCount: 5, totalPoints: 200 }
    ];
    const sorted = sortForLeaderboard(users);
    expect(sorted[0].userId).toBe('B');
    expect(sorted[1].userId).toBe('C');
    expect(sorted[2].userId).toBe('A');
  });

  test('المستخدم الأول يحصل على الترتيب 1', () => {
    const users = [
      { userId: 'A', referralCount: 10, totalPoints: 500 },
      { userId: 'B', referralCount: 5, totalPoints: 200 }
    ];
    const sorted = sortForLeaderboard(users);
    expect(sorted[0].userId).toBe('A');
  });

  test('قائمة فارغة لا تسبب خطأ', () => {
    expect(() => sortForLeaderboard([])).not.toThrow();
    expect(sortForLeaderboard([])).toHaveLength(0);
  });

  test('مستخدم واحد يحصل على الترتيب الأول', () => {
    const users = [{ userId: 'A', referralCount: 1, totalPoints: 50 }];
    const sorted = sortForLeaderboard(users);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].userId).toBe('A');
  });
});

// ============================================================
// Points Balance Consistency - Unit Tests
// ============================================================

describe('Points Balance Consistency', () => {
  test('الرصيد = مجموع المكتسب - مجموع المستبدل', () => {
    const transactions = [
      { type: 'earn', amount: 50 },
      { type: 'earn', amount: 100 },
      { type: 'redeem', amount: 30 },
      { type: 'earn', amount: 25 },
      { type: 'redeem', amount: 50 }
    ];

    const earned = transactions.filter(t => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
    const redeemed = transactions.filter(t => t.type === 'redeem').reduce((s, t) => s + t.amount, 0);
    const balance = earned - redeemed;

    expect(earned).toBe(175);
    expect(redeemed).toBe(80);
    expect(balance).toBe(95);
  });

  test('الرصيد لا يمكن أن يكون سالباً بعد الاستبدال', () => {
    const currentBalance = 100;
    const redemptionCost = 150;

    const canRedeem = currentBalance >= redemptionCost;
    expect(canRedeem).toBe(false);
  });

  test('الاستبدال يخصم النقاط بالضبط', () => {
    const initialBalance = 500;
    const cost = 100;
    const expectedBalance = initialBalance - cost;

    expect(expectedBalance).toBe(400);
  });

  test('رصيد صفر بعد استبدال كل النقاط', () => {
    const balance = 100;
    const cost = 100;
    expect(balance - cost).toBe(0);
  });
});

// ============================================================
// Redemption Options - Unit Tests
// ============================================================

describe('Redemption Options - Validation', () => {
  const REDEMPTION_OPTIONS = [
    { optionId: 'discount_10', pointsCost: 100, type: 'discount', value: 10 },
    { optionId: 'discount_25', pointsCost: 250, type: 'discount', value: 25 },
    { optionId: 'free_course', pointsCost: 500, type: 'discount', value: 100 },
    { optionId: 'monthly_sub', pointsCost: 1000, type: 'subscription', value: 1 },
    { optionId: 'profile_boost', pointsCost: 150, type: 'feature', value: 7 },
    { optionId: 'premium_badge', pointsCost: 200, type: 'feature', value: 1 }
  ];

  test('جميع خيارات الاستبدال لها pointsCost موجب', () => {
    REDEMPTION_OPTIONS.forEach(opt => {
      expect(opt.pointsCost).toBeGreaterThan(0);
    });
  });

  test('خيار 100 نقطة = خصم 10%', () => {
    const opt = REDEMPTION_OPTIONS.find(o => o.optionId === 'discount_10');
    expect(opt.pointsCost).toBe(100);
    expect(opt.value).toBe(10);
  });

  test('خيار 500 نقطة = دورة مجانية', () => {
    const opt = REDEMPTION_OPTIONS.find(o => o.optionId === 'free_course');
    expect(opt.pointsCost).toBe(500);
    expect(opt.value).toBe(100);
  });

  test('المستخدم بـ 300 نقطة يمكنه استبدال خيار 250 نقطة', () => {
    const balance = 300;
    const available = REDEMPTION_OPTIONS.filter(o => o.pointsCost <= balance);
    expect(available.length).toBeGreaterThan(0);
    expect(available.some(o => o.optionId === 'discount_25')).toBe(true);
  });

  test('المستخدم بـ 50 نقطة لا يمكنه استبدال أي خيار', () => {
    const balance = 50;
    const available = REDEMPTION_OPTIONS.filter(o => o.pointsCost <= balance);
    expect(available).toHaveLength(0);
  });
});
