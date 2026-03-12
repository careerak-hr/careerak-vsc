/**
 * Simple Verification Public Access Test
 * اختبار بسيط للتحقق من الوصول العام
 * 
 * Tests that certificate verification works without authentication
 * اختبار أن التحقق من الشهادات يعمل بدون مصادقة
 * 
 * Requirements: 2.4 - التحقق يعمل بدون تسجيل دخول
 */

const verificationService = require('../src/services/verificationService');
const Certificate = require('../src/models/Certificate');
const { Individual } = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');
const mongoose = require('mongoose');

describe('Verification - No Authentication Required', () => {
  let testUser;
  let testCourse;
  let testCertificate;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak-test',
        { useNewUrlParser: true, useUnifiedTopology: true }
      );
    }
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await Certificate.deleteMany({});
    await Individual.deleteMany({});
    await EducationalCourse.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await Certificate.deleteMany({});
    await Individual.deleteMany({});
    await EducationalCourse.deleteMany({});

    // إنشاء مستخدم اختبار
    testUser = await Individual.create({
      firstName: 'أحمد',
      lastName: 'محمد',
      email: `ahmed-${Date.now()}@test.com`,
      password: 'password123',
      role: 'Employee',
      phone: `+2012345${Math.floor(Math.random() * 100000)}`
    });

    // إنشاء دورة اختبار
    testCourse = await EducationalCourse.create({
      title: 'دورة تطوير الويب',
      description: 'دورة شاملة لتطوير الويب',
      category: 'programming',
      level: 'Intermediate',
      instructor: testUser._id
    });

    // إنشاء شهادة اختبار
    const certId = `TEST-CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    testCertificate = await Certificate.create({
      certificateId: certId,
      userId: testUser._id,
      courseId: testCourse._id,
      courseName: testCourse.title,
      issueDate: new Date(),
      status: 'active',
      qrCode: 'data:image/png;base64,test',
      verificationUrl: `https://careerak.com/verify/${certId}`,
      pdfUrl: 'https://careerak.com/certificates/test.pdf'
    });
  });

  describe('VerificationService.verifyCertificate()', () => {
    it('✅ should verify valid certificate WITHOUT authentication', async () => {
      // استدعاء الخدمة مباشرة بدون أي مصادقة
      const result = await verificationService.verifyCertificate(
        testCertificate.certificateId
      );

      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
      expect(result.found).toBe(true);
      expect(result.certificate).toBeDefined();
      expect(result.certificate.certificateId).toBe(testCertificate.certificateId);
      expect(result.certificate.holder.name).toContain('أحمد');
      expect(result.certificate.course.name).toBe('دورة تطوير الويب');
    });

    it('✅ should return not found for non-existent certificate WITHOUT authentication', async () => {
      const result = await verificationService.verifyCertificate('NON-EXISTENT-ID');

      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.found).toBe(false);
      expect(result.messageAr).toContain('غير موجودة');
    });

    it('✅ should show revoked certificate details WITHOUT authentication', async () => {
      // إلغاء الشهادة
      testCertificate.status = 'revoked';
      testCertificate.revocation = {
        revokedAt: new Date(),
        revokedBy: testUser._id,
        reason: 'Test revocation'
      };
      await testCertificate.save();

      const result = await verificationService.verifyCertificate(
        testCertificate.certificateId
      );

      expect(result.success).toBe(true);
      expect(result.valid).toBe(false); // غير صالحة لأنها ملغاة
      expect(result.found).toBe(true);
      expect(result.certificate.status.code).toBe('revoked');
      expect(result.certificate.revocation).toBeDefined();
      expect(result.certificate.revocation.reason).toBe('Test revocation');
    });

    it('✅ should NOT expose sensitive user data', async () => {
      const result = await verificationService.verifyCertificate(
        testCertificate.certificateId
      );

      // يجب أن يحتوي على الاسم والبريد فقط
      expect(result.certificate.holder.name).toBeDefined();
      expect(result.certificate.holder.email).toBeDefined();
      
      // يجب ألا يحتوي على معلومات حساسة
      expect(result.certificate.holder.password).toBeUndefined();
      expect(result.certificate.holder.phone).toBeUndefined();
      expect(result.certificate.holder._id).toBeUndefined();
    });
  });

  describe('VerificationService.searchCertificates()', () => {
    it('✅ should search certificates WITHOUT authentication', async () => {
      const result = await verificationService.searchCertificates('تطوير');

      expect(result.success).toBe(true);
      expect(result.certificates).toBeDefined();
      expect(Array.isArray(result.certificates)).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('VerificationService.verifyBulk()', () => {
    it('✅ should verify multiple certificates WITHOUT authentication', async () => {
      // إنشاء دورة ثانية
      const testCourse2 = await EducationalCourse.create({
        title: 'دورة JavaScript المتقدمة',
        description: 'دورة شاملة لـ JavaScript',
        category: 'programming',
        level: 'Advanced',
        instructor: testUser._id,
        referrals: {
          token: `ref-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      // إنشاء شهادة ثانية
      const certId2 = `TEST-CERT-2-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const certificate2 = await Certificate.create({
        certificateId: certId2,
        userId: testUser._id,
        courseId: testCourse2._id,
        courseName: testCourse2.title,
        issueDate: new Date(),
        status: 'active',
        qrCode: 'data:image/png;base64,test2',
        verificationUrl: `https://careerak.com/verify/${certId2}`,
        pdfUrl: 'https://careerak.com/certificates/test2.pdf'
      });

      const result = await verificationService.verifyBulk([
        testCertificate.certificateId,
        certificate2.certificateId
      ]);

      expect(result.success).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.summary.total).toBe(2);
      expect(result.summary.valid).toBe(2);
      expect(result.results).toHaveLength(2);
    });
  });

  describe('VerificationService.getVerificationStats()', () => {
    it('✅ should get verification stats WITHOUT authentication', async () => {
      const result = await verificationService.getVerificationStats();

      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.stats.total).toBeGreaterThanOrEqual(1);
      expect(result.stats.active).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Multi-language Support', () => {
    it('✅ should return messages in multiple languages', async () => {
      const result = await verificationService.verifyCertificate(
        testCertificate.certificateId
      );

      expect(result.messageAr).toBeDefined();
      expect(result.messageEn).toBeDefined();
      expect(result.messageFr).toBeDefined();
      expect(result.certificate.status.messageAr).toBeDefined();
      expect(result.certificate.status.messageEn).toBeDefined();
      expect(result.certificate.status.messageFr).toBeDefined();
    });
  });
});
