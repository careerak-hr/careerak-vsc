/**
 * اختبارات خصومات باقات التوظيف للشركات
 * المهمة 9.2: خصومات على باقات التوظيف
 * Validates: Requirements 5.4
 */

// Mock النماذج
jest.mock('../src/models/CompanyReferral', () => {
  const mockModel = {
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn()
  };
  return mockModel;
});

jest.mock('../src/models/User', () => ({
  User: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

jest.mock('../src/models/PointsTransaction', () => ({
  create: jest.fn()
}));

const CompanyReferral = require('../src/models/CompanyReferral');
const { User } = require('../src/models/User');
const PointsTransaction = require('../src/models/PointsTransaction');
const companyReferralService = require('../src/services/companyReferralService');

describe('خصومات باقات التوظيف - المهمة 9.2', () => {
  const companyId = 'company-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== اختبارات getCompanyDiscountRate =====
  describe('getCompanyDiscountRate - حساب نسبة الخصم', () => {
    test('لا خصم عند عدم وجود إحالات مكتملة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(0);

      const result = await companyReferralService.getCompanyDiscountRate(companyId);

      expect(result.discountPercent).toBe(0);
      expect(result.tier).toBe('none');
      expect(result.completedReferrals).toBe(0);
    });

    test('خصم 10% عند إحالة واحدة مكتملة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(1);

      const result = await companyReferralService.getCompanyDiscountRate(companyId);

      expect(result.discountPercent).toBe(10);
      expect(result.tier).toBe('bronze');
    });

    test('خصم 10% عند إحالتين مكتملتين', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(2);

      const result = await companyReferralService.getCompanyDiscountRate(companyId);

      expect(result.discountPercent).toBe(10);
      expect(result.tier).toBe('bronze');
    });

    test('خصم 20% عند 3 إحالات مكتملة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(3);

      const result = await companyReferralService.getCompanyDiscountRate(companyId);

      expect(result.discountPercent).toBe(20);
      expect(result.tier).toBe('silver');
    });

    test('خصم 20% عند 5 إحالات مكتملة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(5);

      const result = await companyReferralService.getCompanyDiscountRate(companyId);

      expect(result.discountPercent).toBe(20);
      expect(result.tier).toBe('silver');
    });

    test('خصم 30% عند 6 إحالات مكتملة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(6);

      const result = await companyReferralService.getCompanyDiscountRate(companyId);

      expect(result.discountPercent).toBe(30);
      expect(result.tier).toBe('gold');
    });

    test('خصم 30% عند 10 إحالات مكتملة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(10);

      const result = await companyReferralService.getCompanyDiscountRate(companyId);

      expect(result.discountPercent).toBe(30);
      expect(result.tier).toBe('gold');
    });

    test('يجب أن يُرجع عدد الإحالات المكتملة الصحيح', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(4);

      const result = await companyReferralService.getCompanyDiscountRate(companyId);

      expect(result.completedReferrals).toBe(4);
    });
  });

  // ===== اختبارات applyJobPackageDiscountByReferrals =====
  describe('applyJobPackageDiscountByReferrals - تطبيق الخصم التلقائي', () => {
    beforeEach(() => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: companyId })
      });
    });

    test('يطبق خصم 10% على باقة بسعر 100 عند إحالة واحدة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(1);

      const result = await companyReferralService.applyJobPackageDiscountByReferrals(companyId, 100);

      expect(result.discountPercent).toBe(10);
      expect(result.discountAmount).toBe(10);
      expect(result.finalPrice).toBe(90);
      expect(result.originalPrice).toBe(100);
    });

    test('يطبق خصم 20% على باقة بسعر 200 عند 3 إحالات', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(3);

      const result = await companyReferralService.applyJobPackageDiscountByReferrals(companyId, 200);

      expect(result.discountPercent).toBe(20);
      expect(result.discountAmount).toBe(40);
      expect(result.finalPrice).toBe(160);
    });

    test('يطبق خصم 30% على باقة بسعر 500 عند 6 إحالات', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(6);

      const result = await companyReferralService.applyJobPackageDiscountByReferrals(companyId, 500);

      expect(result.discountPercent).toBe(30);
      expect(result.discountAmount).toBe(150);
      expect(result.finalPrice).toBe(350);
    });

    test('يرفع خطأ عند عدم وجود إحالات مكتملة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(0);

      await expect(
        companyReferralService.applyJobPackageDiscountByReferrals(companyId, 100)
      ).rejects.toThrow('لا يوجد خصم متاح');
    });

    test('يرفع خطأ إذا كانت الشركة غير موجودة', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(
        companyReferralService.applyJobPackageDiscountByReferrals(companyId, 100)
      ).rejects.toThrow('الشركة غير موجودة');
    });

    test('يُرجع tier الصحيح مع النتيجة', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(4);

      const result = await companyReferralService.applyJobPackageDiscountByReferrals(companyId, 100);

      expect(result.tier).toBe('silver');
    });

    test('السعر النهائي لا يكون سالباً', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(10);

      const result = await companyReferralService.applyJobPackageDiscountByReferrals(companyId, 50);

      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });

    test('مبلغ الخصم يساوي السعر الأصلي ناقص السعر النهائي', async () => {
      CompanyReferral.countDocuments.mockResolvedValue(3);

      const result = await companyReferralService.applyJobPackageDiscountByReferrals(companyId, 300);

      expect(result.discountAmount).toBeCloseTo(result.originalPrice - result.finalPrice, 2);
    });
  });
});
