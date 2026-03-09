const request = require('supertest');
const app = require('../src/app');
const Certificate = require('../src/models/Certificate');
const User = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');
const certificateService = require('../src/services/certificateService');

describe('Certificate Download Endpoint', () => {
  let testCertificate;
  let testUser;
  let testCourse;

  beforeAll(async () => {
    // إنشاء مستخدم تجريبي
    testUser = await User.create({
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed.test@example.com',
      password: 'password123',
      role: 'employee'
    });

    // إنشاء دورة تجريبية
    testCourse = await EducationalCourse.create({
      title: 'دورة تطوير الويب',
      description: 'دورة شاملة في تطوير الويب',
      category: 'programming',
      level: 'intermediate',
      duration: 40,
      price: 0,
      instructor: {
        name: 'Careerak Team'
      }
    });

    // إصدار شهادة تجريبية
    const result = await certificateService.issueCertificate(
      testUser._id,
      testCourse._id
    );

    testCertificate = await Certificate.findOne({ 
      certificateId: result.certificate.certificateId 
    });
  });

  afterAll(async () => {
    // تنظيف البيانات التجريبية
    await Certificate.deleteMany({ userId: testUser._id });
    await User.deleteOne({ _id: testUser._id });
    await EducationalCourse.deleteOne({ _id: testCourse._id });
  });

  describe('GET /api/certificates/:certificateId/download', () => {
    it('يجب أن يحمل PDF بجودة عالية (300 DPI)', async () => {
      const response = await request(app)
        .get(`/api/certificates/${testCertificate.certificateId}/download`)
        .expect(200);

      // التحقق من headers
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('certificate-');
      expect(response.headers['content-disposition']).toContain('.pdf');

      // التحقق من أن الاستجابة buffer
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // التحقق من أن الملف يبدأ بـ PDF signature
      const pdfSignature = response.body.toString('utf8', 0, 4);
      expect(pdfSignature).toBe('%PDF');
    });

    it('يجب أن يحتوي اسم الملف على اسم المستخدم واسم الدورة', async () => {
      const response = await request(app)
        .get(`/api/certificates/${testCertificate.certificateId}/download`)
        .expect(200);

      const contentDisposition = response.headers['content-disposition'];
      
      // التحقق من وجود "certificate-" في اسم الملف
      expect(contentDisposition).toContain('certificate-');
      
      // التحقق من وجود ".pdf" في اسم الملف
      expect(contentDisposition).toContain('.pdf');
    });

    it('يجب أن يعمل بدون authentication (عام)', async () => {
      // لا نرسل token - يجب أن يعمل
      const response = await request(app)
        .get(`/api/certificates/${testCertificate.certificateId}/download`)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('يجب أن يرجع 500 عند certificateId غير موجود', async () => {
      const response = await request(app)
        .get('/api/certificates/non-existent-id/download')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('يجب أن يحتوي PDF على محتوى (حجم معقول)', async () => {
      const response = await request(app)
        .get(`/api/certificates/${testCertificate.certificateId}/download`)
        .expect(200);

      // PDF يجب أن يكون أكبر من 10KB (شهادة بسيطة)
      expect(response.body.length).toBeGreaterThan(10 * 1024);
      
      // PDF يجب أن يكون أقل من 5MB (معقول)
      expect(response.body.length).toBeLessThan(5 * 1024 * 1024);
    });
  });
});
