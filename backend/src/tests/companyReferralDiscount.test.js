/**
 * اختبارات خصومات باقات التوظيف
 * Requirement 5.4 - خصومات على باقات التوظيف
 */

const { applyJobPackageDiscount, COMPANY_REWARD_CONFIG } = require('../services/companyReferralService');

// Mock النماذج
jest.mock('../models/User', () => ({
  User: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));
jest.mock('../models/PointsTransaction', () => ({
  create: jest.fn()
}));
jest.mock('../models/CompanyReferral', () => ({
  findOne: jest.fn()
}));

const { User } = require('../models/User');
const PointsTransaction = require('../models/PointsTransaction');
const CompanyReferral = require('../models/CompanyReferral');

// مساعد: User.findById يُرجع كائناً مع .select()
function mockFindById(value) {
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(value) });
}

// مساعد: User.findByIdAndUpdate يُرجع مباشرة (select كـ option)
function mockFindByIdAndUpdate(value) {
  User.findByIdAndUpdate.mockResolvedValue(value);
}

describe('applyJobPackageDiscount - خصومات باقات التوظيف', () => {
  const companyId = 'company123';

  beforeEach(() => {
    jest.clearAllMocks();
    CompanyReferral.findOne.mockResolvedValue(null);
    PointsTransaction.create.mockResolvedValue({});
  });

  test('يحسب خصم 10% عند استخدام 100 نقطة', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 500 }) });
    User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 400 }) });

    const result = await applyJobPackageDiscount(companyId, 100, 100);

    expect(result.discountPercent).toBe(10);
    expect(result.discountAmount).toBe(10);
    expect(result.finalPrice).toBe(90);
    expect(result.pointsUsed).toBe(100);
  });

  test('يحسب خصم 30% عند استخدام 300 نقطة', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 500 }) });
    User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 200 }) });

    const result = await applyJobPackageDiscount(companyId, 200, 300);

    expect(result.discountPercent).toBe(30);
    expect(result.discountAmount).toBe(60);
    expect(result.finalPrice).toBe(140);
  });

  test('لا يتجاوز الخصم 50% حتى مع نقاط كثيرة', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 2000 }) });
    User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 0 }) });

    const result = await applyJobPackageDiscount(companyId, 100, 2000);

    expect(result.discountPercent).toBe(50);
    expect(result.discountAmount).toBe(50);
    expect(result.finalPrice).toBe(50);
  });

  test('يرفض إذا كان الرصيد غير كافٍ', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 50 }) });

    await expect(applyJobPackageDiscount(companyId, 100, 100))
      .rejects.toThrow('رصيد النقاط غير كافٍ');
  });

  test('يرجع خطأ إذا كانت النقاط ليست مضاعفاً لـ 100', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 500 }) });

    await expect(applyJobPackageDiscount(companyId, 100, 150))
      .rejects.toThrow('مضاعفاً للعدد 100');
  });

  test('يخصم النقاط من رصيد الشركة بعد تطبيق الخصم', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 500 }) });
    // findByIdAndUpdate يُستدعى مع options { new: true, select: 'pointsBalance' } ويُرجع الكائن مباشرة
    User.findByIdAndUpdate.mockResolvedValue({ pointsBalance: 300 });

    const result = await applyJobPackageDiscount(companyId, 100, 200);

    expect(result.newBalance).toBe(300);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      companyId,
      { $inc: { pointsBalance: -200 } },
      { new: true, select: 'pointsBalance' }
    );
  });

  test('يسجل معاملة استخدام النقاط في PointsTransaction', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 500 }) });
    User.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockResolvedValue({ pointsBalance: 400 }) });

    await applyJobPackageDiscount(companyId, 100, 100);

    expect(PointsTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: companyId,
        type: 'redeem',
        amount: -100,
        source: 'redemption'
      })
    );
  });

  test('يرجع خطأ إذا كانت الشركة غير موجودة', async () => {
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(applyJobPackageDiscount(companyId, 100, 100))
      .rejects.toThrow('الشركة غير موجودة');
  });
});
