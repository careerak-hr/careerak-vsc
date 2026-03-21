const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models/User');
const Certificate = require('../src/models/Certificate');
const jwt = require('jsonwebtoken');

/**
 * اختبارات معاينة منشور LinkedIn
 */
describe('LinkedIn Post Preview', () => {
  let token;
  let userId;
  let certificateId;

  beforeAll(async () => {
    // إنشاء مستخدم تجريبي
    const user = await User.create({
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@test.com',
      password: 'password123',
      role: 'user'
    });

    userId = user._id;
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

    // إنشاء شهادة تجريبية
    const certificate = await Certificate.create({
      certificateId: 'CERT-TEST-001',
      userId: userId,
      courseName: 'دورة تطوير الويب',
      issueDate: new Date(),
      verificationUrl: 'https://careerak.com/verify/CERT-TEST-001',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      status: 'active'
    });

    certificateId = certificate._id;
  });

  afterAll(async () => {
    // تنظيف البيانات
    await User.deleteMany({});
    await Certificate.deleteMany({});
  });

  describe('POST /api/linkedin/preview-post', () => {
    it('يجب أن يولد معاينة صحيحة للمنشور', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: certificateId.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.preview).toBeDefined();
      
      // التحقق من بنية المعاينة
      const { preview } = response.body;
      expect(preview.text).toBeDefined();
      expect(preview.certificate).toBeDefined();
      expect(preview.user).toBeDefined();
      expect(preview.metadata).toBeDefined();
    });

    it('يجب أن يتضمن نص المنشور معلومات الشهادة', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: certificateId.toString() });

      const { preview } = response.body;
      
      expect(preview.text).toContain('دورة تطوير الويب');
      expect(preview.text).toContain('Careerak');
      expect(preview.text).toContain(preview.certificate.verificationUrl);
    });

    it('يجب أن يتضمن معلومات المستخدم', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: certificateId.toString() });

      const { preview } = response.body;
      
      expect(preview.user.name).toBe('أحمد محمد');
    });

    it('يجب أن يتضمن بيانات الشهادة', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: certificateId.toString() });

      const { preview } = response.body;
      
      expect(preview.certificate.id).toBe('CERT-TEST-001');
      expect(preview.certificate.courseName).toBe('دورة تطوير الويب');
      expect(preview.certificate.verificationUrl).toBeDefined();
      expect(preview.certificate.qrCode).toBeDefined();
    });

    it('يجب أن يتضمن metadata صحيحة', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: certificateId.toString() });

      const { preview } = response.body;
      
      expect(preview.metadata.characterCount).toBeGreaterThan(0);
      expect(preview.metadata.hasVerificationUrl).toBe(true);
      expect(preview.metadata.hasQRCode).toBe(true);
      expect(preview.metadata.estimatedReach).toBeDefined();
    });

    it('يجب أن يقدر مدى الوصول بشكل صحيح', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: certificateId.toString() });

      const { preview } = response.body;
      const { estimatedReach } = preview.metadata;
      
      expect(estimatedReach.level).toMatch(/^(low|medium|high)$/);
      expect(estimatedReach.hashtags).toBeGreaterThanOrEqual(0);
      expect(estimatedReach.links).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(estimatedReach.tips)).toBe(true);
    });

    it('يجب أن يوفر نصائح عندما يكون عدد الهاشتاجات قليل', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: certificateId.toString() });

      const { preview } = response.body;
      const { estimatedReach } = preview.metadata;
      
      if (estimatedReach.hashtags < 3) {
        expect(estimatedReach.tips.length).toBeGreaterThan(0);
        expect(estimatedReach.tips.some(tip => 
          tip.includes('hashtag') || tip.includes('هاشتاج')
        )).toBe(true);
      }
    });

    it('يجب أن يرفض الطلب بدون certificateId', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.messageAr).toContain('معرف الشهادة مطلوب');
    });

    it('يجب أن يرفض الطلب بدون authentication', async () => {
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .send({ certificateId: certificateId.toString() });

      expect(response.status).toBe(401);
    });

    it('يجب أن يرفض الطلب لشهادة غير موجودة', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: fakeId });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it('يجب أن يرفض الطلب لشهادة لا تخص المستخدم', async () => {
      // إنشاء مستخدم آخر
      const otherUser = await User.create({
        firstName: 'محمد',
        lastName: 'علي',
        email: 'mohamed@test.com',
        password: 'password123',
        role: 'user'
      });

      // إنشاء شهادة للمستخدم الآخر
      const otherCertificate = await Certificate.create({
        certificateId: 'CERT-TEST-002',
        userId: otherUser._id,
        courseName: 'دورة أخرى',
        issueDate: new Date(),
        verificationUrl: 'https://careerak.com/verify/CERT-TEST-002',
        status: 'active'
      });

      const response = await request(app)
        .post('/api/linkedin/preview-post')
        .set('Authorization', `Bearer ${token}`)
        .send({ certificateId: otherCertificate._id.toString() });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);

      // تنظيف
      await User.findByIdAndDelete(otherUser._id);
      await Certificate.findByIdAndDelete(otherCertificate._id);
    });
  });
});
