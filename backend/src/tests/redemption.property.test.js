/**
 * Property-Based Tests - نظام استبدال النقاط
 * Redemption System Property Tests
 *
 * Property 4: Redemption Deduction
 *   - لأي استبدال ناجح، يجب خصم النقاط بالضبط من رصيد المستخدم فوراً
 *   - Validates: Requirements 3.4
 *
 * Property 9: Redemption Availability
 *   - خيار الاستبدال يجب أن يكون متاحاً فقط إذا كان رصيد المستخدم كافياً
 *   - Validates: Requirements 3.1, 3.2
 */

const fc = require('fast-check');

// ============================================================
// Pure logic helpers (mirror of rewardsService logic)
// ============================================================

/**
 * يحاكي منطق redeemPoints في rewardsService
 * يُرجع الرصيد الجديد أو يرمي خطأ إذا كان الرصيد غير كافٍ
 */
function simulateRedeem(currentBalance, pointsCost) {
  if (currentBalance < pointsCost) {
    const err = new Error('رصيد النقاط غير كافٍ');
    err.code = 'INSUFFICIENT_POINTS';
    err.required = pointsCost;
    err.available = currentBalance;
    throw err;
  }
  return currentBalance - pointsCost;
}

/**
 * يحدد ما إذا كان خيار الاستبدال متاحاً للمستخدم
 */
function isOptionAvailable(userBalance, option) {
  return option.isActive === true && userBalance >= option.pointsCost;
}

/**
 * يُصفّي قائمة الخيارات المتاحة للمستخدم
 */
function getAvailableOptions(userBalance, options) {
  return options.filter(opt => isOptionAvailable(userBalance, opt));
}

// ============================================================
// Arbitraries
// ============================================================

/** رصيد نقاط عشوائي (0 - 5000) */
const balanceArb = fc.integer({ min: 0, max: 5000 });

/** تكلفة استبدال عشوائية (1 - 2000) */
const costArb = fc.integer({ min: 1, max: 2000 });

/** خيار استبدال عشوائي */
const redemptionOptionArb = fc.record({
  optionId: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-z_]+$/.test(s)),
  pointsCost: fc.integer({ min: 1, max: 2000 }),
  type: fc.constantFrom('discount', 'feature', 'subscription'),
  value: fc.integer({ min: 1, max: 100 }),
  isActive: fc.boolean(),
  expiryDays: fc.integer({ min: 1, max: 365 })
});

/** قائمة خيارات استبدال عشوائية (1-10 خيارات) */
const optionsListArb = fc.array(redemptionOptionArb, { minLength: 1, maxLength: 10 });

// ============================================================
// Property 4: Redemption Deduction
// Validates: Requirements 3.4
// ============================================================

describe('Property 4: Redemption Deduction - خصم النقاط عند الاستبدال', () => {
  /**
   * لأي استبدال ناجح، الرصيد الجديد = الرصيد القديم - تكلفة الاستبدال بالضبط
   */
  test('الرصيد الجديد يساوي الرصيد القديم ناقص التكلفة بالضبط', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }), // رصيد موجب
        fc.integer({ min: 1, max: 1000 }),  // تكلفة
        (balance, cost) => {
          // نضمن أن الرصيد كافٍ
          const sufficientBalance = balance + cost;
          const newBalance = simulateRedeem(sufficientBalance, cost);
          return newBalance === sufficientBalance - cost;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الخصم يجب أن يكون فورياً - الرصيد بعد الاستبدال لا يساوي الرصيد قبله
   */
  test('الرصيد يتغير فوراً بعد الاستبدال الناجح', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        fc.integer({ min: 1, max: 1000 }),
        (balance, cost) => {
          const sufficientBalance = balance + cost;
          const newBalance = simulateRedeem(sufficientBalance, cost);
          return newBalance !== sufficientBalance;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الرصيد بعد الاستبدال لا يمكن أن يكون سالباً
   */
  test('الرصيد بعد الاستبدال لا يكون سالباً أبداً', () => {
    fc.assert(
      fc.property(
        balanceArb,
        costArb,
        (balance, cost) => {
          if (balance < cost) {
            // يجب أن يرمي خطأ
            let threw = false;
            try {
              simulateRedeem(balance, cost);
            } catch (e) {
              threw = true;
            }
            return threw;
          }
          const newBalance = simulateRedeem(balance, cost);
          return newBalance >= 0;
        }
      ),
      { numRuns: 300 }
    );
  });

  /**
   * استبدال كل النقاط يُعطي رصيداً صفرياً
   */
  test('استبدال كل النقاط يُعطي رصيداً صفرياً', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5000 }),
        (balance) => {
          const newBalance = simulateRedeem(balance, balance);
          return newBalance === 0;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الاستبدال يرفض عندما تكون التكلفة أكبر من الرصيد بمقدار 1
   */
  test('يرفض الاستبدال عندما تكون التكلفة أكبر من الرصيد بمقدار 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4999 }),
        (balance) => {
          let threw = false;
          let errorCode = null;
          try {
            simulateRedeem(balance, balance + 1);
          } catch (e) {
            threw = true;
            errorCode = e.code;
          }
          return threw && errorCode === 'INSUFFICIENT_POINTS';
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الخطأ يحتوي على معلومات الرصيد المطلوب والمتاح
   */
  test('خطأ الرصيد غير الكافي يحتوي على المعلومات الصحيحة', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 101, max: 500 }),
        (balance, cost) => {
          try {
            simulateRedeem(balance, cost);
            return false; // يجب أن يرمي خطأ
          } catch (e) {
            return (
              e.code === 'INSUFFICIENT_POINTS' &&
              e.required === cost &&
              e.available === balance
            );
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الاستبدالات المتعددة المتتالية تخصم النقاط بشكل تراكمي صحيح
   */
  test('الاستبدالات المتتالية تخصم النقاط بشكل تراكمي صحيح', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 5000 }),
        fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 2, maxLength: 10 }),
        (initialBalance, costs) => {
          const totalCost = costs.reduce((s, c) => s + c, 0);
          if (totalCost > initialBalance) return true; // تخطي هذه الحالة

          let balance = initialBalance;
          for (const cost of costs) {
            balance = simulateRedeem(balance, cost);
          }
          return balance === initialBalance - totalCost;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ============================================================
// Property 9: Redemption Availability
// Validates: Requirements 3.1, 3.2
// ============================================================

describe('Property 9: Redemption Availability - توفر خيارات الاستبدال', () => {
  /**
   * خيار الاستبدال متاح فقط إذا كان الرصيد >= التكلفة والخيار نشط
   */
  test('الخيار متاح فقط عند توفر رصيد كافٍ والخيار نشط', () => {
    fc.assert(
      fc.property(
        balanceArb,
        redemptionOptionArb,
        (balance, option) => {
          const available = isOptionAvailable(balance, option);
          const shouldBeAvailable = option.isActive && balance >= option.pointsCost;
          return available === shouldBeAvailable;
        }
      ),
      { numRuns: 300 }
    );
  });

  /**
   * خيار غير نشط لا يكون متاحاً حتى لو كان الرصيد كافياً
   */
  test('الخيار غير النشط لا يكون متاحاً حتى مع رصيد كافٍ', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: 1, max: 1000 }),
        (balance, cost) => {
          const inactiveOption = { pointsCost: cost, isActive: false };
          const sufficientBalance = balance + cost; // رصيد كافٍ دائماً
          return isOptionAvailable(sufficientBalance, inactiveOption) === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * خيار نشط مع رصيد غير كافٍ لا يكون متاحاً
   */
  test('الخيار النشط لا يكون متاحاً مع رصيد غير كافٍ', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        fc.integer({ min: 1000, max: 2000 }),
        (balance, cost) => {
          const activeOption = { pointsCost: cost, isActive: true };
          return isOptionAvailable(balance, activeOption) === false;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * خيار نشط مع رصيد مساوٍ للتكلفة بالضبط يكون متاحاً
   */
  test('الخيار متاح عندما يكون الرصيد مساوياً للتكلفة بالضبط', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2000 }),
        (cost) => {
          const activeOption = { pointsCost: cost, isActive: true };
          return isOptionAvailable(cost, activeOption) === true;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * قائمة الخيارات المتاحة تحتوي فقط على خيارات يمكن للمستخدم استبدالها
   */
  test('جميع الخيارات في القائمة المتاحة قابلة للاستبدال فعلاً', () => {
    fc.assert(
      fc.property(
        balanceArb,
        optionsListArb,
        (balance, options) => {
          const available = getAvailableOptions(balance, options);
          return available.every(opt => opt.isActive && balance >= opt.pointsCost);
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * لا يوجد خيار متاح عندما يكون الرصيد صفراً
   */
  test('لا يوجد خيار متاح عندما يكون الرصيد صفراً', () => {
    fc.assert(
      fc.property(
        optionsListArb,
        (options) => {
          const available = getAvailableOptions(0, options);
          return available.length === 0;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * زيادة الرصيد لا تُقلل عدد الخيارات المتاحة (monotonicity)
   */
  test('زيادة الرصيد لا تُقلل عدد الخيارات المتاحة', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2000 }),
        fc.integer({ min: 1, max: 2000 }),
        optionsListArb,
        (lowerBalance, extra, options) => {
          const higherBalance = lowerBalance + extra;
          const availableAtLower = getAvailableOptions(lowerBalance, options).length;
          const availableAtHigher = getAvailableOptions(higherBalance, options).length;
          return availableAtHigher >= availableAtLower;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * الخيارات المتاحة هي مجموعة فرعية من جميع الخيارات
   */
  test('الخيارات المتاحة هي مجموعة فرعية من جميع الخيارات', () => {
    fc.assert(
      fc.property(
        balanceArb,
        optionsListArb,
        (balance, options) => {
          const available = getAvailableOptions(balance, options);
          return available.every(opt =>
            options.some(o => o.optionId === opt.optionId)
          );
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * مستخدم برصيد كافٍ لجميع الخيارات النشطة يرى جميعها
   */
  test('مستخدم برصيد كافٍ لجميع الخيارات النشطة يرى جميعها', () => {
    fc.assert(
      fc.property(
        optionsListArb,
        (options) => {
          const activeOptions = options.filter(o => o.isActive);
          if (activeOptions.length === 0) return true;

          const maxCost = Math.max(...activeOptions.map(o => o.pointsCost));
          const available = getAvailableOptions(maxCost, options);
          return available.length === activeOptions.length;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ============================================================
// Integration: Deduction + Availability together
// ============================================================

describe('تكامل: الخصم والتوفر معاً', () => {
  /**
   * بعد استبدال ناجح، قد تتغير الخيارات المتاحة (إذا انخفض الرصيد)
   */
  test('بعد الاستبدال، الخيارات المتاحة تعكس الرصيد الجديد', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 5000 }),
        fc.integer({ min: 1, max: 100 }),
        optionsListArb,
        (balance, cost, options) => {
          if (balance < cost) return true; // تخطي

          const newBalance = simulateRedeem(balance, cost);
          const availableBefore = getAvailableOptions(balance, options);
          const availableAfter = getAvailableOptions(newBalance, options);

          // الخيارات المتاحة بعد الاستبدال يجب أن تكون <= قبله
          return availableAfter.length <= availableBefore.length;
        }
      ),
      { numRuns: 200 }
    );
  });

  /**
   * خيار لا يمكن استبداله (رصيد غير كافٍ) يجب أن يرمي خطأ
   */
  test('محاولة استبدال خيار غير متاح ترمي خطأ INSUFFICIENT_POINTS', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 100, max: 500 }),
        (balance, cost) => {
          const option = { pointsCost: cost, isActive: true };
          const available = isOptionAvailable(balance, option);
          expect(available).toBe(false);

          let threw = false;
          try {
            simulateRedeem(balance, cost);
          } catch (e) {
            threw = true;
            expect(e.code).toBe('INSUFFICIENT_POINTS');
          }
          return threw;
        }
      ),
      { numRuns: 200 }
    );
  });
});
