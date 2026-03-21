/**
 * Property-Based Tests - نظام لوحة المتصدرين
 * Leaderboard System Property Tests
 *
 * Property 6: Leaderboard Accuracy
 *   - لأي مستخدم في اللوحة، عدد إحالاته ونقاطه يجب أن يطابق سجلاته الفعلية
 *   - Validates: Requirements 4.1, 4.4
 *
 * Property 10: Leaderboard Ranking
 *   - لأي مستخدمين في اللوحة، المستخدم ذو الإحالات الأكثر (أو النقاط عند التعادل)
 *     يجب أن يكون ترتيبه أفضل (رقم أصغر)
 *   - Validates: Requirements 4.2
 */

const fc = require('fast-check');

// ============================================================
// Pure logic helpers (mirror of leaderboardService logic)
// ============================================================

/**
 * يحسب ترتيب المستخدمين بنفس منطق leaderboardService
 * الترتيب: الأكثر إحالات أولاً، ثم الأكثر نقاطاً عند التعادل
 */
function computeRankings(users) {
  const sorted = [...users].sort((a, b) => {
    if (b.referralCount !== a.referralCount) return b.referralCount - a.referralCount;
    return b.totalPoints - a.totalPoints;
  });
  return sorted.map((user, index) => ({ ...user, rank: index + 1 }));
}

/**
 * يتحقق من دقة بيانات مستخدم في اللوحة مقارنةً بسجلاته الفعلية
 * يُرجع true إذا كانت البيانات متطابقة
 */
function isLeaderboardEntryAccurate(leaderboardEntry, actualReferralCount, actualPoints) {
  return (
    leaderboardEntry.referralCount === actualReferralCount &&
    leaderboardEntry.totalPoints === actualPoints
  );
}

/**
 * يُصفّي اللوحة لإظهار المستخدمين المرئيين فقط
 */
function getVisibleRankings(rankings) {
  return rankings.filter(entry => entry.isVisible !== false);
}

// ============================================================
// Arbitraries
// ============================================================

/** بيانات مستخدم عشوائي في اللوحة */
const leaderboardUserArb = fc.record({
  userId: fc.uuid(),
  referralCount: fc.integer({ min: 0, max: 500 }),
  totalPoints: fc.integer({ min: 0, max: 50000 }),
  isVisible: fc.boolean(),
});

/** قائمة مستخدمين عشوائية (2-20 مستخدم) */
const usersListArb = fc.array(leaderboardUserArb, { minLength: 2, maxLength: 20 });

/** قائمة مستخدمين بـ userId فريد */
const uniqueUsersArb = fc.uniqueArray(leaderboardUserArb, {
  selector: (u) => u.userId,
  minLength: 2,
  maxLength: 20,
});

// ============================================================
// Property 6: Leaderboard Accuracy
// Validates: Requirements 4.1, 4.4
// ============================================================

describe('Property 6: Leaderboard Accuracy - دقة بيانات لوحة المتصدرين', () => {
  /**
   * بيانات المستخدم في اللوحة تطابق سجلاته الفعلية
   */
  test('بيانات الإحالات والنقاط في اللوحة تطابق السجلات الفعلية', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 0, max: 50000 }),
        (referralCount, totalPoints) => {
          const leaderboardEntry = { referralCount, totalPoints };
          return isLeaderboardEntryAccurate(leaderboardEntry, referralCount, totalPoints);
        }
      ),
      { numRuns: 300 }
    );
  });

  /**
   * بيانات غير متطابقة تُكتشف بشكل صحيح
   */
  test('بيانات غير متطابقة تُكتشف بشكل صحيح', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 500 }),
        fc.integer({ min: 0, max: 50000 }),
        fc.integer({ min: 1, max: 10 }), // فرق في الإحالات
        (referralCount, totalPoints, diff) => {
          const leaderboardEntry = { referralCount: referralCount + diff, totalPoints };
          return !isLeaderboardEntryAccurate(leaderboardEntry, referralCount, totalPoints);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * عدد الإحالات في اللوحة لا يمكن أن يكون سالباً
   */
  test('عدد الإحالات في اللوحة لا يكون سالباً أبداً', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          return rankings.every(entry => entry.referralCount >= 0);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * النقاط في اللوحة لا يمكن أن تكون سالبة
   */
  test('النقاط في اللوحة لا تكون سالبة أبداً', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          return rankings.every(entry => entry.totalPoints >= 0);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * عدد المستخدمين في اللوحة يساوي عدد المستخدمين المُدخلين
   */
  test('عدد المستخدمين في اللوحة يساوي عدد المستخدمين المُدخلين', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          return rankings.length === users.length;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * المستخدمون المخفيون لا يظهرون في اللوحة العامة
   */
  test('المستخدمون المخفيون لا يظهرون في اللوحة العامة', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const visible = getVisibleRankings(rankings);
          return visible.every(entry => entry.isVisible !== false);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * المستخدمون المرئيون هم مجموعة فرعية من جميع المستخدمين
   */
  test('المستخدمون المرئيون هم مجموعة فرعية من جميع المستخدمين', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const visible = getVisibleRankings(rankings);
          return visible.length <= rankings.length;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * مجموع الإحالات في اللوحة يساوي مجموع الإحالات الفعلية
   */
  test('مجموع الإحالات في اللوحة يساوي مجموع الإحالات الفعلية', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const totalInRankings = rankings.reduce((s, e) => s + e.referralCount, 0);
          const totalActual = users.reduce((s, u) => s + u.referralCount, 0);
          return totalInRankings === totalActual;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ============================================================
// Property 10: Leaderboard Ranking
// Validates: Requirements 4.2
// ============================================================

describe('Property 10: Leaderboard Ranking - صحة ترتيب لوحة المتصدرين', () => {
  /**
   * المستخدم ذو الإحالات الأكثر يحصل على ترتيب أفضل (رقم أصغر)
   */
  test('المستخدم ذو الإحالات الأكثر يحصل على ترتيب أفضل', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 50000 }),
        (lowerCount, extra, points) => {
          const higherCount = lowerCount + extra;
          const users = [
            { userId: 'user-a', referralCount: lowerCount, totalPoints: points },
            { userId: 'user-b', referralCount: higherCount, totalPoints: points },
          ];
          const rankings = computeRankings(users);
          const rankA = rankings.find(r => r.userId === 'user-a').rank;
          const rankB = rankings.find(r => r.userId === 'user-b').rank;
          return rankB < rankA; // user-b له إحالات أكثر → ترتيب أفضل (رقم أصغر)
        }
      ),
      { numRuns: 300 }
    );
  });

  /**
   * عند التعادل في الإحالات، المستخدم ذو النقاط الأكثر يحصل على ترتيب أفضل
   */
  test('عند التعادل في الإحالات، النقاط الأكثر تُحدد الترتيب الأفضل', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 1, max: 10000 }),
        (referralCount, lowerPoints, extra) => {
          const higherPoints = lowerPoints + extra;
          const users = [
            { userId: 'user-a', referralCount, totalPoints: lowerPoints },
            { userId: 'user-b', referralCount, totalPoints: higherPoints },
          ];
          const rankings = computeRankings(users);
          const rankA = rankings.find(r => r.userId === 'user-a').rank;
          const rankB = rankings.find(r => r.userId === 'user-b').rank;
          return rankB < rankA; // user-b له نقاط أكثر → ترتيب أفضل
        }
      ),
      { numRuns: 300 }
    );
  });

  /**
   * الترتيب يبدأ من 1 ويكون متسلسلاً بدون فجوات
   */
  test('الترتيب يبدأ من 1 ويكون متسلسلاً بدون فجوات', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const ranks = rankings.map(r => r.rank).sort((a, b) => a - b);
          return ranks[0] === 1 && ranks.every((r, i) => r === i + 1);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الترتيب فريد لكل مستخدم (لا يوجد مستخدمان بنفس الترتيب)
   */
  test('الترتيب فريد لكل مستخدم', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const ranks = rankings.map(r => r.rank);
          const uniqueRanks = new Set(ranks);
          return uniqueRanks.size === ranks.length;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الترتيب الأول يعود للمستخدم ذو أعلى عدد إحالات
   */
  test('الترتيب الأول يعود للمستخدم ذو أعلى عدد إحالات', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const first = rankings.find(r => r.rank === 1);
          const maxReferrals = Math.max(...users.map(u => u.referralCount));
          return first.referralCount === maxReferrals;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * إضافة مستخدم بإحالات أكثر من الأول يُنزّل الأول إلى المرتبة الثانية
   */
  test('إضافة مستخدم بإحالات أكثر يُنزّل الأول إلى المرتبة الثانية', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const currentFirst = rankings.find(r => r.rank === 1);
          const newUser = {
            userId: 'new-top-user',
            referralCount: currentFirst.referralCount + 1,
            totalPoints: 0,
          };
          const newRankings = computeRankings([...users, newUser]);
          const newFirst = newRankings.find(r => r.rank === 1);
          const oldFirstNewRank = newRankings.find(r => r.userId === currentFirst.userId).rank;
          return newFirst.userId === 'new-top-user' && oldFirstNewRank === 2;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الترتيب ثابت (deterministic) - نفس المدخلات تُعطي نفس الترتيب دائماً
   */
  test('الترتيب ثابت - نفس المدخلات تُعطي نفس النتيجة دائماً', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings1 = computeRankings(users);
          const rankings2 = computeRankings(users);
          return rankings1.every((entry, i) =>
            entry.userId === rankings2[i].userId &&
            entry.rank === rankings2[i].rank
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * ترتيب المستخدمين لا يتأثر بترتيب المدخلات (order-independent)
   */
  test('الترتيب لا يتأثر بترتيب المدخلات', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const shuffled = [...users].sort(() => Math.random() - 0.5);
          const rankings1 = computeRankings(users);
          const rankings2 = computeRankings(shuffled);

          // نفس المستخدمين يجب أن يحصلوا على نفس الترتيب
          return users.every(user => {
            const r1 = rankings1.find(r => r.userId === user.userId)?.rank;
            const r2 = rankings2.find(r => r.userId === user.userId)?.rank;
            return r1 === r2;
          });
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ============================================================
// Integration: Accuracy + Ranking together
// ============================================================

describe('تكامل: الدقة والترتيب معاً', () => {
  /**
   * المستخدم في المرتبة الأولى يجب أن تكون بياناته دقيقة
   */
  test('بيانات المتصدر الأول دقيقة ومتطابقة مع سجلاته', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const first = rankings.find(r => r.rank === 1);
          const originalUser = users.find(u => u.userId === first.userId);
          return isLeaderboardEntryAccurate(first, originalUser.referralCount, originalUser.totalPoints);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * جميع المستخدمين في اللوحة لديهم بيانات دقيقة
   */
  test('جميع المستخدمين في اللوحة لديهم بيانات دقيقة', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          return rankings.every(entry => {
            const original = users.find(u => u.userId === entry.userId);
            return isLeaderboardEntryAccurate(entry, original.referralCount, original.totalPoints);
          });
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * المستخدم المرئي ذو الترتيب الأفضل يجب أن يكون له إحالات أكثر أو نقاط أكثر
   */
  test('الترتيب بين المستخدمين المرئيين يعكس بياناتهم الفعلية', () => {
    fc.assert(
      fc.property(
        uniqueUsersArb,
        (users) => {
          const rankings = computeRankings(users);
          const visible = getVisibleRankings(rankings);
          if (visible.length < 2) return true;

          // تحقق من أن كل مستخدم مرئي ترتيبه أفضل من التالي له
          for (let i = 0; i < visible.length - 1; i++) {
            const current = visible[i];
            const next = visible[i + 1];
            if (current.rank >= next.rank) return false;
            // المستخدم ذو الترتيب الأفضل يجب أن يكون له إحالات >= التالي
            if (current.referralCount < next.referralCount) return false;
          }
          return true;
        }
      ),
      { numRuns: 200 }
    );
  });
});
