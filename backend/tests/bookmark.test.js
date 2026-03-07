const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const JobBookmark = require('../src/models/JobBookmark');
const jwt = require('jsonwebtoken');

describe('Bookmark API Tests', () => {
  let token;
  let userId;
  let jobId;

  beforeAll(async () => {
    // الاتصال بقاعدة بيانات الاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }

    // إنشاء مستخدم للاختبار
    const user = await User.create({
      name: 'Test User',
      email: 'bookmark@test.com',
      password: 'password123',
      role: 'Job Seeker'
    });
    userId = user._id;

    // إنشاء token
    token = jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'test_secret');

    // إنشاء وظيفة للاختبار
    const job = await JobPosting.create({
      title: 'Test Job',
      description: 'Test Description',
      requirements: 'Test Requirements',
      postingType: 'Permanent Job',
      location: { type: 'Cairo, Egypt' },
      postedBy: userId,
      status: 'Open'
    });
    jobId = job._id;
  });

  afterAll(async () => {
    // تنظيف البيانات
    await User.deleteMany({ email: 'bookmark@test.com' });
    await JobPosting.deleteMany({ title: 'Test Job' });
    await JobBookmark.deleteMany({ userId });
    await mongoose.connection.close();
  });

  describe('POST /jobs/:id/bookmark - Toggle Bookmark', () => {
    it('should add job to bookmarks', async () => {
      const res = await request(app)
        .post(`/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.bookmarked).toBe(true);
      expect(res.body.message).toContain('إضافة');
    });

    it('should remove job from bookmarks', async () => {
      const res = await request(app)
        .post(`/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.bookmarked).toBe(false);
      expect(res.body.message).toContain('إزالة');
    });

    it('should require authentication', async () => {
      await request(app)
        .post(`/jobs/${jobId}/bookmark`)
        .expect(401);
    });
  });

  describe('GET /jobs/bookmarked - Get Bookmarked Jobs', () => {
    beforeEach(async () => {
      // إضافة وظيفة للمفضلة
      await JobBookmark.create({
        userId,
        jobId,
        bookmarkedAt: new Date()
      });
    });

    afterEach(async () => {
      await JobBookmark.deleteMany({ userId });
    });

    it('should get all bookmarked jobs', async () => {
      const res = await request(app)
        .get('/jobs/bookmarked')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
      expect(Array.isArray(res.body.jobs)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/jobs/bookmarked')
        .expect(401);
    });
  });

  describe('GET /jobs/:id/bookmark/status - Check Bookmark Status', () => {
    it('should return false when not bookmarked', async () => {
      const res = await request(app)
        .get(`/jobs/${jobId}/bookmark/status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.isBookmarked).toBe(false);
    });

    it('should return true when bookmarked', async () => {
      await JobBookmark.create({ userId, jobId });

      const res = await request(app)
        .get(`/jobs/${jobId}/bookmark/status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.isBookmarked).toBe(true);

      await JobBookmark.deleteMany({ userId });
    });
  });

  describe('PATCH /jobs/:id/bookmark - Update Bookmark', () => {
    beforeEach(async () => {
      await JobBookmark.create({ userId, jobId });
    });

    afterEach(async () => {
      await JobBookmark.deleteMany({ userId });
    });

    it('should update bookmark notes', async () => {
      const res = await request(app)
        .patch(`/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Test notes' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.bookmark.notes).toBe('Test notes');
    });

    it('should update bookmark tags', async () => {
      const res = await request(app)
        .patch(`/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${token}`)
        .send({ tags: ['urgent', 'favorite'] })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.bookmark.tags).toEqual(['urgent', 'favorite']);
    });
  });

  describe('GET /jobs/bookmarks/stats - Get Bookmark Stats', () => {
    beforeEach(async () => {
      await JobBookmark.create({ userId, jobId });
    });

    afterEach(async () => {
      await JobBookmark.deleteMany({ userId });
    });

    it('should get bookmark statistics', async () => {
      const res = await request(app)
        .get('/jobs/bookmarks/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.stats).toHaveProperty('total');
      expect(res.body.stats.total).toBeGreaterThan(0);
    });
  });
});
