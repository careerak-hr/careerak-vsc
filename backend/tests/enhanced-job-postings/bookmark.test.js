/**
 * Bookmark System Tests
 * Tests for bookmark functionality including toggle, list, and count consistency
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Job = require('../../src/models/Job');
const JobBookmark = require('../../src/models/JobBookmark');

describe('Bookmark System Tests', () => {
  let authToken;
  let userId;
  let jobId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'bookmark@test.com',
      password: 'password123',
      role: 'jobseeker'
    });
    userId = user._id;

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bookmark@test.com', password: 'password123' });
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
    await JobBookmark.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await JobBookmark.deleteMany({});
    await Job.updateMany({}, { bookmarkCount: 0 });
  });

  describe('POST /api/jobs/:id/bookmark - Toggle Bookmark', () => {
    test('should bookmark a job successfully', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.bookmarked).toBe(true);
      expect(res.body.message).toContain('تم حفظ الوظيفة');

      // Verify bookmark was created
      const bookmark = await JobBookmark.findOne({ userId, jobId });
      expect(bookmark).toBeTruthy();

      // Verify bookmarkCount was incremented
      const job = await Job.findById(jobId);
      expect(job.bookmarkCount).toBe(1);
    });

    test('should unbookmark a job successfully', async () => {
      // First bookmark
      await JobBookmark.create({ userId, jobId });
      await Job.findByIdAndUpdate(jobId, { bookmarkCount: 1 });

      const res = await request(app)
        .post(`/api/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.bookmarked).toBe(false);
      expect(res.body.message).toContain('تم إزالة الوظيفة');

      // Verify bookmark was deleted
      const bookmark = await JobBookmark.findOne({ userId, jobId });
      expect(bookmark).toBeFalsy();

      // Verify bookmarkCount was decremented
      const job = await Job.findById(jobId);
      expect(job.bookmarkCount).toBe(0);
    });

    test('should enforce bookmark uniqueness', async () => {
      // Create bookmark
      await request(app)
        .post(`/api/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify only one bookmark exists
      const bookmarks = await JobBookmark.find({ userId, jobId });
      expect(bookmarks).toHaveLength(1);
    });

    test('should return 401 without authentication', async () => {
      const res = await request(app)
        .post(`/api/jobs/${jobId}/bookmark`);

      expect(res.status).toBe(401);
    });

    test('should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/jobs/${fakeId}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/jobs/bookmarked - Get Bookmarked Jobs', () => {
    test('should return bookmarked jobs', async () => {
      // Create multiple bookmarks
      const job2 = await Job.create({
        title: 'Test Job 2',
        company: { name: 'Test Company 2' },
        description: 'Test description 2',
        field: 'IT',
        location: { city: 'Test City', country: 'Test Country' },
        salary: 6000,
        status: 'active'
      });

      await JobBookmark.create({ userId, jobId });
      await JobBookmark.create({ userId, jobId: job2._id });

      const res = await request(app)
        .get('/api/jobs/bookmarked')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.jobs).toHaveLength(2);
      expect(res.body.total).toBe(2);
    });

    test('should return empty array when no bookmarks', async () => {
      const res = await request(app)
        .get('/api/jobs/bookmarked')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.jobs).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    test('should filter out inactive jobs', async () => {
      await JobBookmark.create({ userId, jobId });
      await Job.findByIdAndUpdate(jobId, { status: 'closed' });

      const res = await request(app)
        .get('/api/jobs/bookmarked')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.jobs).toHaveLength(0);
    });
  });

  describe('Bookmark Count Consistency', () => {
    test('bookmarkCount should match actual bookmarks', async () => {
      // Create multiple bookmarks from different users
      const user2 = await User.create({
        name: 'Test User 2',
        email: 'bookmark2@test.com',
        password: 'password123',
        role: 'jobseeker'
      });

      await JobBookmark.create({ userId, jobId });
      await JobBookmark.create({ userId: user2._id, jobId });
      await Job.findByIdAndUpdate(jobId, { bookmarkCount: 2 });

      const job = await Job.findById(jobId);
      const actualCount = await JobBookmark.countDocuments({ jobId });

      expect(job.bookmarkCount).toBe(actualCount);
      expect(job.bookmarkCount).toBe(2);
    });

    test('bookmarkCount should update correctly on toggle', async () => {
      // Bookmark
      await request(app)
        .post(`/api/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`);

      let job = await Job.findById(jobId);
      expect(job.bookmarkCount).toBe(1);

      // Unbookmark
      await request(app)
        .post(`/api/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`);

      job = await Job.findById(jobId);
      expect(job.bookmarkCount).toBe(0);
    });
  });
});
