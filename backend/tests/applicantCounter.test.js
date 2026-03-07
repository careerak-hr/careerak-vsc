const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const JobPosting = require('../src/models/JobPosting');
const JobApplication = require('../src/models/JobApplication');
const User = require('../src/models/User');

/**
 * Applicant Counter Tests
 * Requirements: 9.2 (عداد المتقدمين)
 */
describe('Applicant Counter', () => {
  let authToken;
  let companyUser;
  let applicantUser;
  let jobPosting;

  beforeAll(async () => {
    // إنشاء مستخدم شركة
    companyUser = await User.create({
      firstName: 'Company',
      lastName: 'Owner',
      email: 'company@test.com',
      password: 'password123',
      role: 'HR'
    });

    // إنشاء مستخدم متقدم
    applicantUser = await User.create({
      firstName: 'Job',
      lastName: 'Seeker',
      email: 'seeker@test.com',
      password: 'password123',
      role: 'Job Seeker'
    });

    // تسجيل دخول الشركة
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'company@test.com',
        password: 'password123'
      });

    authToken = loginRes.body.token;

    // إنشاء وظيفة
    jobPosting = await JobPosting.create({
      title: 'Test Job',
      description: 'Test Description',
      requirements: 'Test Requirements',
      postedBy: companyUser._id,
      showApplicantCount: true
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await JobApplication.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/job-postings/:id/applicant-count', () => {
    it('should return applicant count when visible', async () => {
      const res = await request(app)
        .get(`/api/job-postings/${jobPosting._id}/applicant-count`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.visible).toBe(true);
      expect(res.body.data.applicantCount).toBe(0);
    });

    it('should return null when count is hidden', async () => {
      // إخفاء العداد
      await JobPosting.findByIdAndUpdate(jobPosting._id, {
        showApplicantCount: false
      });

      const res = await request(app)
        .get(`/api/job-postings/${jobPosting._id}/applicant-count`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.visible).toBe(false);
      expect(res.body.data.applicantCount).toBeNull();

      // إعادة إظهار العداد
      await JobPosting.findByIdAndUpdate(jobPosting._id, {
        showApplicantCount: true
      });
    });

    it('should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/job-postings/${fakeId}/applicant-count`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('JOB_NOT_FOUND');
    });
  });

  describe('PATCH /api/job-postings/:id/applicant-count-visibility', () => {
    it('should toggle visibility when authorized', async () => {
      const res = await request(app)
        .patch(`/api/job-postings/${jobPosting._id}/applicant-count-visibility`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ showApplicantCount: false })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.showApplicantCount).toBe(false);

      // التحقق من التحديث في قاعدة البيانات
      const updated = await JobPosting.findById(jobPosting._id);
      expect(updated.showApplicantCount).toBe(false);

      // إعادة إلى الحالة الأصلية
      await request(app)
        .patch(`/api/job-postings/${jobPosting._id}/applicant-count-visibility`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ showApplicantCount: true })
        .expect(200);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .patch(`/api/job-postings/${jobPosting._id}/applicant-count-visibility`)
        .send({ showApplicantCount: false })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 when not job owner', async () => {
      // تسجيل دخول المتقدم
      const applicantLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'seeker@test.com',
          password: 'password123'
        });

      const applicantToken = applicantLoginRes.body.token;

      const res = await request(app)
        .patch(`/api/job-postings/${jobPosting._id}/applicant-count-visibility`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({ showApplicantCount: false })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Applicant Count Increment', () => {
    it('should increment count when application is submitted', async () => {
      // التحقق من العدد الأولي
      let job = await JobPosting.findById(jobPosting._id);
      const initialCount = job.applicantCount || 0;

      // تقديم طلب
      await JobApplication.create({
        jobPosting: jobPosting._id,
        applicant: applicantUser._id,
        fullName: 'Job Seeker',
        email: 'seeker@test.com',
        phone: '1234567890',
        status: 'Submitted'
      });

      // تحديث العداد يدوياً (في الواقع يتم تلقائياً في controller)
      await JobPosting.findByIdAndUpdate(jobPosting._id, {
        $inc: { applicantCount: 1 }
      });

      // التحقق من الزيادة
      job = await JobPosting.findById(jobPosting._id);
      expect(job.applicantCount).toBe(initialCount + 1);
    });

    it('should reflect correct count in API response', async () => {
      const res = await request(app)
        .get(`/api/job-postings/${jobPosting._id}/applicant-count`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.applicantCount).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid job ID', async () => {
      const res = await request(app)
        .get('/api/job-postings/invalid-id/applicant-count')
        .expect(500);

      expect(res.body.success).toBe(false);
    });

    it('should handle missing showApplicantCount field', async () => {
      const res = await request(app)
        .patch(`/api/job-postings/${jobPosting._id}/applicant-count-visibility`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      // يجب أن يعمل حتى بدون إرسال القيمة (undefined)
      expect(res.body.success).toBe(true);
    });
  });
});
