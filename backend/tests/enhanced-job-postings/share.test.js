/**
 * Share System Tests
 * Tests for job sharing functionality and share count accuracy
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Job = require('../../src/models/Job');
const JobShare = require('../../src/models/JobShare');

describe('Share System Tests', () => {
  let authToken;
  let userId;
  let jobId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'share@test.com',
      password: 'password123',
      role: 'jobseeker'
    });
    userId = user._id;

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'share@test.com', password: 'password123' });
    authToken = loginRes.body.token;

    // Create test job
    const job = await Job.create({
      title: 'Test Job',
      company: { name: 'Test Company' },
      description: 'Test description',
      field: 'IT',
      location: { city: 'Test City', country: 'Test Country' },
      salary: 5000,
      status: 'active'
    });
    jobId = job._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
    await JobShare.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await JobShare.deleteMany({});
    await Job.updateMany({}, { shareCount: 0 });
  });

  describe('POST /api/jobs/:id/share - Track Share', () => {
    test('should track WhatsApp share successfully', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'whatsapp' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('تم تسجيل المشاركة');

      // Verify share was recorded
      const share = await JobShare.findOne({ userId, jobId, platform: 'whatsapp' });
      expect(share).toBeTruthy();

      // Verify shareCount was incremented
      const job = await Job.findById(jobId);
      expect(job.shareCount).toBe(1);
    });

    test('should track LinkedIn share successfully', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'linkedin' });

      expect(res.status).toBe(200);
      const job = await Job.findById(jobId);
      expect(job.shareCount).toBe(1);
    });

    test('should track copy link share successfully', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'copy' });

      expect(res.status).toBe(200);
      const job = await Job.findById(jobId);
      expect(job.shareCount).toBe(1);
    });

    test('should validate platform', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'invalid' });

      expect(res.status).toBe(400);
    });

    test('should return 401 without authentication', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .send({ platform: 'whatsapp' });

      expect(res.status).toBe(401);
    });

    test('should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/jobs/${fakeId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'whatsapp' });

      expect(res.status).toBe(404);
    });
  });

  describe('Share Count Accuracy', () => {
    test('shareCount should match actual shares', async () => {
      // Create multiple shares
      await JobShare.create({ userId, jobId, platform: 'whatsapp' });
      await JobShare.create({ userId, jobId, platform: 'linkedin' });
      await JobShare.create({ userId, jobId, platform: 'copy' });
      await Job.findByIdAndUpdate(jobId, { shareCount: 3 });

      const job = await Job.findById(jobId);
      const actualCount = await JobShare.countDocuments({ jobId });

      expect(job.shareCount).toBe(actualCount);
      expect(job.shareCount).toBe(3);
    });

    test('shareCount should increment correctly', async () => {
      // Share 1
      await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'whatsapp' });

      let job = await Job.findById(jobId);
      expect(job.shareCount).toBe(1);

      // Share 2
      await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'linkedin' });

      job = await Job.findById(jobId);
      expect(job.shareCount).toBe(2);
    });

    test('should track shares from multiple users', async () => {
      const user2 = await User.create({
        name: 'Test User 2',
        email: 'share2@test.com',
        password: 'password123',
        role: 'jobseeker'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'share2@test.com', password: 'password123' });
      const token2 = loginRes.body.token;

      // User 1 shares
      await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'whatsapp' });

      // User 2 shares
      await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ platform: 'linkedin' });

      const job = await Job.findById(jobId);
      expect(job.shareCount).toBe(2);
    });
  });

  describe('GET /api/jobs/:id/analytics - Share Analytics', () => {
    test('should return share analytics', async () => {
      // Create shares
      await JobShare.create({ userId, jobId, platform: 'whatsapp' });
      await JobShare.create({ userId, jobId, platform: 'whatsapp' });
      await JobShare.create({ userId, jobId, platform: 'linkedin' });

      const res = await request(app)
        .get(`/api/jobs/${jobId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalShares).toBe(3);
      expect(res.body.byPlatform).toBeDefined();
      expect(res.body.byPlatform.whatsapp).toBe(2);
      expect(res.body.byPlatform.linkedin).toBe(1);
    });
  });
});
