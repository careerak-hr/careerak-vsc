/**
 * Verification Public Access Tests
 * اختبارات الوصول العام للتحقق من الشهادات
 * 
 * Tests that certificate verification works without authentication
 * اختبار أن التحقق من الشهادات يعمل بدون مصادقة
 * 
 * Requirements: 2.4 - التحقق يعمل بدون تسجيل دخول
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Certificate = require('../src/models/Certificate');
const User = require('../src/models/User');
const Course = require('../src/models/Course');

describe('Certificate Verification - Public Access', () => {
  let testUser;
  let testCourse;
  let testCertificate;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak-test');
    }
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await Certificate.deleteMany({});
    await User.deleteMany({});
    await Course.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف البيانات قبل كل اختبار
    await Certificate.deleteMany({});
    await User.deleteMany({});
    await Course.deleteMany({});

    // إنشاء مستخدم اختبار
    testUser = await User.create({
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@test.com',
      password: 'password123',
      role: 'jobSeeker'
    });

    // إنشاء دورة اختبار
    testCourse = await Course.create({
      title: 'دورة تطوير الويب',
      description: 'دورة شاملة لتطوير الويب',
      category: 'programming',
      level: 'intermediate',
      instructor: testUser._id
    });

    // إنشاء شهادة اختبار
    testCertificate = await Certificate.create({
      certificateId: 'TEST-CERT-' + Date.now(),
      userId: testUser._id,
      courseId: testCourse._id,
      courseName: testCourse.title,
      issueDate: new Date(),
      status: 'active',
      qrCode: 'data:image/png;base64,test',
      verificationUrl: `https://careerak.com/verify/TEST-CERT-${Date.now()}`,
      pdfUrl: 'https://careerak.com/certificates/test.pdf'
    });
  });

  describe('GET /verify/:certificateId - Verify Certificate', () => {
    it('should verify certificate WITHOUT authentication', async () => {
      const response = await request(app)
        .get(`/verify/${testCertificate.certificateId}`)
        // لا نرسل Authorization header
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);
      expect(response.body.found).toBe(true);
      expect(response.body.certificate).toBeDefined();
      expect(response.body.certificate.certificateId).toBe(testCertificate.certificateId);
      expect(response.body.certificate.holder.name).toContain('أحمد');
      expect(response.body.certificate.course.name).toBe('دورة تطوير الويب');
    });

    it('should return 404 for non-existent certificate WITHOUT authentication', async () => {
      const response = await request(app)
        .get('/verify/NON-EXISTENT-CERT-ID')
        // لا نرسل Authorization header
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.valid).toBe(false);
      expect(response.body.found).toBe(false);
    });

    it('should show revoked certificate details WITHOUT authentication', async () => {
      // إلغاء الشهادة
      testCertificate.status = 'revoked';
      testCertificate.revocation = {
        revokedAt: new Date(),
        revokedBy: testUser._id,
        reason: 'Test revocation'
      };
      await testCertificate.save();

      const response = await request(app)
        .get(`/verify/${testCertificate.certificateId}`)
        // لا نرسل Authorization header
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(false); // غير صالحة لأنها ملغاة
      expect(response.body.found).toBe(true);
      expect(response.body.certificate.status.code).toBe('revoked');
      expect(response.body.certificate.revocation).toBeDefined();
      expect(response.body.certificate.revocation.reason).toBe('Test revocation');
    });

    it('should show expired certificate details WITHOUT authentication', async () => {
      // جعل الشهادة منتهية
      testCertificate.expiryDate = new Date(Date.now() - 86400000); // منذ يوم
      await testCertificate.save();

      const response = await request(app)
        .get(`/verify/${testCertificate.certificateId}`)
        // لا نرسل Authorization header
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(false); // غير صالحة لأنها منتهية
      expect(response.body.found).toBe(true);
      expect(response.body.certificate.dates.expiry).toBeDefined();
    });
  });

  describe('GET /verify/search - Search Certificates', () => {
    it('should search certificates WITHOUT authentication', async () => {
      const response = await request(app)
        .get('/verify/search?q=تطوير')
        // لا نرسل Authorization header
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.certificates).toBeDefined();
      expect(Array.isArray(response.body.certificates)).toBe(true);
    });

    it('should return 400 for short search query WITHOUT authentication', async () => {
      const response = await request(app)
        .get('/verify/search?q=ab')
        // لا نرسل Authorization header
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /verify/bulk - Verify Multiple Certificates', () => {
    let certificate2;

    beforeEach(async () => {
      // إنشاء شهادة ثانية
      certificate2 = await Certificate.create({
        certificateId: 'TEST-CERT-2-' + Date.now(),
        userId: testUser._id,
        courseId: testCourse._id,
        courseName: 'دورة JavaScript المتقدمة',
        issueDate: new Date(),
        status: 'active',
        qrCode: 'data:image/png;base64,test2',
        verificationUrl: `https://careerak.com/verify/TEST-CERT-2-${Date.now()}`,
        pdfUrl: 'https://careerak.com/certificates/test2.pdf'
      });
    });

    it('should verify multiple certificates WITHOUT authentication', async () => {
      const response = await request(app)
        .post('/verify/bulk')
        // لا نرسل Authorization header
        .send({
          certificateIds: [
            testCertificate.certificateId,
            certificate2.certificateId
          ]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.total).toBe(2);
      expect(response.body.summary.valid).toBe(2);
      expect(response.body.results).toHaveLength(2);
    });

    it('should return 400 for empty array WITHOUT authentication', async () => {
      const response = await request(app)
        .post('/verify/bulk')
        // لا نرسل Authorization header
        .send({
          certificateIds: []
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for more than 50 certificates WITHOUT authentication', async () => {
      const manyIds = Array(51).fill('TEST-CERT-ID');

      const response = await request(app)
        .post('/verify/bulk')
        // لا نرسل Authorization header
        .send({
          certificateIds: manyIds
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /verify/stats - Verification Statistics', () => {
    it('should get verification stats WITHOUT authentication', async () => {
      const response = await request(app)
        .get('/verify/stats')
        // لا نرسل Authorization header
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBeGreaterThanOrEqual(1);
      expect(response.body.stats.active).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Security - Ensure No Authentication Required', () => {
    it('should NOT require Authorization header for verification', async () => {
      // محاولة التحقق بدون Authorization header
      const response = await request(app)
        .get(`/verify/${testCertificate.certificateId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should work even with invalid Authorization header', async () => {
      // محاولة التحقق مع Authorization header غير صالح
      const response = await request(app)
        .get(`/verify/${testCertificate.certificateId}`)
        .set('Authorization', 'Bearer INVALID_TOKEN')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should NOT expose sensitive user data in verification response', async () => {
      const response = await request(app)
        .get(`/verify/${testCertificate.certificateId}`)
        .expect(200);

      // يجب أن يحتوي على الاسم والبريد فقط
      expect(response.body.certificate.holder.name).toBeDefined();
      expect(response.body.certificate.holder.email).toBeDefined();
      
      // يجب ألا يحتوي على معلومات حساسة
      expect(response.body.certificate.holder.password).toBeUndefined();
      expect(response.body.certificate.holder.phone).toBeUndefined();
      expect(response.body.certificate.holder._id).toBeUndefined();
    });
  });

  describe('QR Code Verification Flow', () => {
    it('should verify certificate from QR code URL WITHOUT authentication', async () => {
      // محاكاة مسح QR Code الذي يحتوي على رابط التحقق
      const qrCodeUrl = testCertificate.verificationUrl;
      const certificateId = qrCodeUrl.split('/verify/')[1];

      const response = await request(app)
        .get(`/verify/${certificateId}`)
        // لا نرسل Authorization header (كما لو أن شخص مسح QR Code)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.valid).toBe(true);
      expect(response.body.certificate.certificateId).toBe(testCertificate.certificateId);
    });
  });

  describe('Multi-language Support', () => {
    it('should return messages in multiple languages WITHOUT authentication', async () => {
      const response = await request(app)
        .get(`/verify/${testCertificate.certificateId}`)
        .expect(200);

      expect(response.body.messageAr).toBeDefined();
      expect(response.body.messageEn).toBeDefined();
      expect(response.body.messageFr).toBeDefined();
      expect(response.body.certificate.status.messageAr).toBeDefined();
      expect(response.body.certificate.status.messageEn).toBeDefined();
      expect(response.body.certificate.status.messageFr).toBeDefined();
    });
  });
});
