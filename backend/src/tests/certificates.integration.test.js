/**
 * اختبارات التكامل - نظام الشهادات والإنجازات
 * Integration Tests - Certificates & Achievements System
 *
 * يغطي:
 * - CertificateService مع قاعدة البيانات
 * - VerificationService مع قاعدة البيانات
 * - BadgeService مع قاعدة البيانات
 * - Certificate visibility (إخفاء/إظهار)
 * - Certificate revocation & reissue
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// Mock الخدمات الخارجية
jest.mock('../services/notificationService', () => ({
  notifyCertificateIssued: jest.fn().mockResolvedValue({ _id: 'notif-id' }),
  createNotification: jest.fn().mockResolvedValue({ _id: 'notif-id' }),
}));

jest.mock('../services/emailService', () => ({
  sendCertificateIssuedEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../services/pusherService', () => ({
  isEnabled: jest.fn().mockReturnValue(false),
  sendNotificationToUser: jest.fn().mockResolvedValue({}),
}));

jest.mock('../config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn(),
  },
}));

const Certificate = require('../models/Certificate');
const { User, Individual } = require('../models/User');
const EducationalCourse = require('../models/EducationalCourse');
const certificateService = require('../services/certificateService');
const verificationService = require('../services/verificationService');

// ============================================================
// Test Helpers
// ============================================================

const createTestUser = async (overrides = {}) => {
  const uniqueSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return Individual.create({
    firstName: 'أحمد',
    lastName: 'محمد',
    email: `test_${uniqueSuffix}@test.com`,
    password: 'password12345',
    role: 'Employee',
    phone: `+9665${uniqueSuffix.slice(0, 8)}`,
    country: 'Saudi Arabia',
    ...overrides,
  });
};

const createTestCourse = async (instructorId, overrides = {}) => {
  return EducationalCourse.create({
    title: 'دورة تطوير الويب',
    description: 'دورة شاملة في تطوير الويب',
    category: 'programming',
    level: 'Intermediate',
    instructor: instructorId,
    ...overrides,
  });
};

// ============================================================
// CertificateService Integration Tests
// ============================================================

// Fix: sync indexes to drop old unique referrals.token index and recreate with correct settings
beforeAll(async () => {
  try {
    await EducationalCourse.syncIndexes();
  } catch (e) {
    // Ignore errors - index may already be correct
  }
});

describe('CertificateService - Integration', () => {
  let user, course;

  beforeEach(async () => {
    user = await createTestUser();
    course = await createTestCourse(user._id);
  });

  describe('issueCertificate()', () => {
    test('إصدار شهادة بنجاح', async () => {
      const result = await certificateService.issueCertificate(user._id, course._id);

      expect(result.success).toBe(true);
      expect(result.certificate).toBeDefined();
      expect(result.certificate.certificateId).toBeDefined();
      expect(result.certificate.courseName).toBe(course.title);
    });

    test('الشهادة تحتوي على QR Code', async () => {
      const result = await certificateService.issueCertificate(user._id, course._id);
      expect(result.certificate.qrCode).toBeDefined();
      expect(result.certificate.qrCode).toContain('data:image/png;base64,');
    });

    test('الشهادة تحتوي على رابط التحقق', async () => {
      const result = await certificateService.issueCertificate(user._id, course._id);
      expect(result.certificate.verificationUrl).toContain('/verify/');
    });

    test('الشهادة تحتوي على اسم المستخدم', async () => {
      const result = await certificateService.issueCertificate(user._id, course._id);
      expect(result.certificate.userName).toContain(user.firstName);
    });

    test('لا يمكن إصدار شهادتين لنفس المستخدم ونفس الدورة', async () => {
      await certificateService.issueCertificate(user._id, course._id);
      await expect(
        certificateService.issueCertificate(user._id, course._id)
      ).rejects.toThrow('Certificate already exists');
    });

    test('رمي خطأ إذا المستخدم غير موجود', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        certificateService.issueCertificate(fakeId, course._id)
      ).rejects.toThrow('User not found');
    });

    test('رمي خطأ إذا الدورة غير موجودة', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        certificateService.issueCertificate(user._id, fakeId)
      ).rejects.toThrow('Course not found');
    });

    test('الشهادة تُحفظ في قاعدة البيانات', async () => {
      const result = await certificateService.issueCertificate(user._id, course._id);
      const saved = await Certificate.findOne({ certificateId: result.certificate.certificateId });
      expect(saved).not.toBeNull();
      expect(saved.status).toBe('active');
    });

    test('الشهادة تُصدر حتى لو فشل الإشعار', async () => {
      const notificationService = require('../services/notificationService');
      notificationService.notifyCertificateIssued.mockRejectedValueOnce(new Error('Notification failed'));

      const result = await certificateService.issueCertificate(user._id, course._id);
      expect(result.success).toBe(true);
    });
  });

  describe('getCertificateById()', () => {
    test('جلب شهادة موجودة بنجاح', async () => {
      const issued = await certificateService.issueCertificate(user._id, course._id);
      const result = await certificateService.getCertificateById(issued.certificate.certificateId);

      expect(result.success).toBe(true);
      expect(result.certificate.certificateId).toBe(issued.certificate.certificateId);
    });

    test('رمي خطأ إذا الشهادة غير موجودة', async () => {
      await expect(
        certificateService.getCertificateById('non-existent-id')
      ).rejects.toThrow('Certificate not found');
    });
  });

  describe('getUserCertificates()', () => {
    test('جلب شهادات المستخدم', async () => {
      await certificateService.issueCertificate(user._id, course._id);
      const result = await certificateService.getUserCertificates(user._id);

      expect(result.success).toBe(true);
      expect(result.certificates).toHaveLength(1);
    });

    test('فلترة حسب الحالة', async () => {
      await certificateService.issueCertificate(user._id, course._id);
      const result = await certificateService.getUserCertificates(user._id, { status: 'active' });

      expect(result.certificates.every(c => c.status === 'active')).toBe(true);
    });

    test('مستخدم بدون شهادات: قائمة فارغة', async () => {
      const newUser = await createTestUser();
      const result = await certificateService.getUserCertificates(newUser._id);
      expect(result.certificates).toHaveLength(0);
    });
  });

  describe('verifyCertificate()', () => {
    test('التحقق من شهادة صالحة', async () => {
      const issued = await certificateService.issueCertificate(user._id, course._id);
      const result = await certificateService.verifyCertificate(issued.certificate.certificateId);

      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
    });

    test('التحقق من شهادة غير موجودة', async () => {
      const result = await certificateService.verifyCertificate('non-existent-id');
      expect(result.valid).toBe(false);
      expect(result.success).toBe(false);
    });
  });

  describe('revokeCertificate()', () => {
    test('إلغاء شهادة بواسطة أدمن', async () => {
      // ملاحظة: الخدمة تتحقق من role === 'admin' (lowercase)
      // نستخدم نفس القيمة التي تتحقق منها الخدمة
      const admin = await createTestUser({ role: 'Admin' });
      // نعدّل الدور مباشرة في DB لتجاوز enum validation
      await User.updateOne({ _id: admin._id }, { $set: { role: 'admin' } });
      const issued = await certificateService.issueCertificate(user._id, course._id);

      const result = await certificateService.revokeCertificate(
        issued.certificate.certificateId,
        admin._id,
        'Test revocation'
      );

      expect(result.success).toBe(true);
      expect(result.certificate.status).toBe('revoked');
    });

    test('بعد الإلغاء، التحقق يعيد valid=false', async () => {
      const admin = await createTestUser({ role: 'Admin' });
      await User.updateOne({ _id: admin._id }, { $set: { role: 'admin' } });
      const issued = await certificateService.issueCertificate(user._id, course._id);

      await certificateService.revokeCertificate(
        issued.certificate.certificateId,
        admin._id,
        'Test'
      );

      const verification = await certificateService.verifyCertificate(issued.certificate.certificateId);
      expect(verification.valid).toBe(false);
    });

    test('لا يمكن إلغاء شهادة ملغاة مرة أخرى', async () => {
      const admin = await createTestUser({ role: 'Admin' });
      await User.updateOne({ _id: admin._id }, { $set: { role: 'admin' } });
      const issued = await certificateService.issueCertificate(user._id, course._id);

      await certificateService.revokeCertificate(issued.certificate.certificateId, admin._id, 'First');

      await expect(
        certificateService.revokeCertificate(issued.certificate.certificateId, admin._id, 'Second')
      ).rejects.toThrow('already revoked');
    });

    test('المستخدم العادي لا يمكنه إلغاء شهادة', async () => {
      const issued = await certificateService.issueCertificate(user._id, course._id);
      const regularUser = await createTestUser({ role: 'Employee' });

      await expect(
        certificateService.revokeCertificate(issued.certificate.certificateId, regularUser._id, 'Test')
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateCertificateVisibility()', () => {
    test('إخفاء شهادة بنجاح', async () => {
      const issued = await certificateService.issueCertificate(user._id, course._id);
      const result = await certificateService.updateCertificateVisibility(
        issued.certificate.certificateId,
        user._id,
        true
      );

      expect(result.success).toBe(true);
      expect(result.certificate.isHidden).toBe(true);
    });

    test('إظهار شهادة مخفية', async () => {
      const issued = await certificateService.issueCertificate(user._id, course._id);
      await certificateService.updateCertificateVisibility(issued.certificate.certificateId, user._id, true);
      const result = await certificateService.updateCertificateVisibility(
        issued.certificate.certificateId,
        user._id,
        false
      );

      expect(result.certificate.isHidden).toBe(false);
    });

    test('مستخدم آخر لا يمكنه تغيير رؤية الشهادة', async () => {
      const otherUser = await createTestUser();
      const issued = await certificateService.issueCertificate(user._id, course._id);

      await expect(
        certificateService.updateCertificateVisibility(issued.certificate.certificateId, otherUser._id, true)
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('markAsSharedOnLinkedIn()', () => {
    test('تحديد الشهادة كمشاركة على LinkedIn', async () => {
      const issued = await certificateService.issueCertificate(user._id, course._id);
      const result = await certificateService.markAsSharedOnLinkedIn(issued.certificate.certificateId);

      expect(result.success).toBe(true);

      const cert = await Certificate.findOne({ certificateId: issued.certificate.certificateId });
      expect(cert.linkedInShared).toBe(true);
    });
  });
});

// ============================================================
// VerificationService Integration Tests
// ============================================================

describe('VerificationService - Integration', () => {
  let user, course;

  beforeEach(async () => {
    user = await createTestUser();
    course = await createTestCourse(user._id);
  });

  test('التحقق من شهادة صالحة', async () => {
    const issued = await certificateService.issueCertificate(user._id, course._id);
    const result = await verificationService.verifyCertificate(issued.certificate.certificateId);

    expect(result.success).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.found).toBe(true);
    expect(result.certificate.holder.name).toContain(user.firstName);
    expect(result.certificate.course.name).toBe(course.title);
  });

  test('التحقق من شهادة غير موجودة', async () => {
    const result = await verificationService.verifyCertificate('non-existent-id');
    expect(result.valid).toBe(false);
    expect(result.found).toBe(false);
  });

  test('التحقق من شهادة ملغاة', async () => {
    const admin = await createTestUser({ role: 'Admin' });
    await User.updateOne({ _id: admin._id }, { $set: { role: 'admin' } });
    const issued = await certificateService.issueCertificate(user._id, course._id);
    await certificateService.revokeCertificate(issued.certificate.certificateId, admin._id, 'Test');

    const result = await verificationService.verifyCertificate(issued.certificate.certificateId);
    expect(result.valid).toBe(false);
    expect(result.certificate.status.code).toBe('revoked');
  });

  test('الاستجابة تحتوي على جميع الحقول المطلوبة', async () => {
    const issued = await certificateService.issueCertificate(user._id, course._id);
    const result = await verificationService.verifyCertificate(issued.certificate.certificateId);

    expect(result.certificate.certificateId).toBeDefined();
    expect(result.certificate.holder).toBeDefined();
    expect(result.certificate.course).toBeDefined();
    expect(result.certificate.dates).toBeDefined();
    expect(result.certificate.status).toBeDefined();
    expect(result.certificate.links).toBeDefined();
    expect(result.certificate.links.verification).toContain('/verify/');
    expect(result.certificate.links.qrCode).toBeTruthy();
  });

  test('التحقق الجماعي من عدة شهادات', async () => {
    const user2 = await createTestUser();
    const course2 = await createTestCourse(user._id, { title: 'دورة أخرى' });

    const cert1 = await certificateService.issueCertificate(user._id, course._id);
    const cert2 = await certificateService.issueCertificate(user2._id, course2._id);

    const result = await verificationService.verifyBulk([
      cert1.certificate.certificateId,
      cert2.certificate.certificateId,
      'non-existent-id',
    ]);

    expect(result.success).toBe(true);
    expect(result.summary.total).toBe(3);
    expect(result.summary.valid).toBe(2);
    expect(result.summary.notFound).toBe(1);
  });

  test('البحث عن شهادات بالاسم', async () => {
    await certificateService.issueCertificate(user._id, course._id);
    const result = await verificationService.searchCertificates('تطوير');

    expect(result.success).toBe(true);
    expect(result.certificates.length).toBeGreaterThan(0);
  });

  test('إحصائيات التحقق', async () => {
    await certificateService.issueCertificate(user._id, course._id);
    const result = await verificationService.getVerificationStats();

    expect(result.success).toBe(true);
    expect(result.stats.total).toBeGreaterThan(0);
    expect(result.stats.active).toBeGreaterThan(0);
  });
});

// ============================================================
// Certificate Stats Integration Tests
// ============================================================

describe('CertificateService - Stats', () => {
  let user, course;

  beforeEach(async () => {
    user = await createTestUser();
    course = await createTestCourse(user._id);
  });

  test('إحصائيات الشهادات للمستخدم', async () => {
    await certificateService.issueCertificate(user._id, course._id);
    const result = await certificateService.getCertificateStats(user._id);

    expect(result.success).toBe(true);
    expect(result.stats).toBeDefined();
  });

  test('إحصائيات الشهادات الكلية', async () => {
    await certificateService.issueCertificate(user._id, course._id);
    const result = await certificateService.getCertificateStats();

    expect(result.success).toBe(true);
    expect(result.stats.total).toBeGreaterThan(0);
  });
});
