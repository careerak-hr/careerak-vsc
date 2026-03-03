/**
 * اختبارات لوحة إدارة المقابلات
 * Requirements: 8.1, 8.2, 8.3
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const VideoInterview = require('../src/models/VideoInterview');
const { v4: uuidv4 } = require('uuid');

describe('Interview Dashboard API Tests', () => {
  let authToken;
  let userId;
  let hostId;
  let pastInterview1;
  let pastInterview2;
  let upcomingInterview;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);
    }

    // إنشاء مستخدم للاختبار
    const testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!@#',
      role: 'company',
      isVerified: true
    });

    userId = testUser._id;

    // إنشاء مضيف آخر
    const hostUser = await User.create({
      name: 'Host User',
      email: `host-${Date.now()}@example.com`,
      password: 'Test123!@#',
      role: 'company',
      isVerified: true
    });

    hostId = hostUser._id;

    // تسجيل الدخول للحصول على token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'Test123!@#'
      });

    authToken = loginResponse.body.token;

    // إنشاء مقابلات سابقة
    pastInterview1 = await VideoInterview.create({
      roomId: uuidv4(),
      hostId: userId,
      participants: [
        { userId: hostId, role: 'participant' }
      ],
      status: 'ended',
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // قبل 7 أيام
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000), // ساعة واحدة
      duration: 3600,
      notes: 'مقابلة ممتازة',
      rating: 5,
      recording: {
        status: 'ready',
        videoUrl: 'https://example.com/recording1.mp4',
        duration: 3600
      }
    });

    pastInterview2 = await VideoInterview.create({
      roomId: uuidv4(),
      hostId: hostId,
      participants: [
        { userId: userId, role: 'participant' }
      ],
      status: 'ended',
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // قبل 3 أيام
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1800000), // 30 دقيقة
      duration: 1800,
      recording: {
        status: 'processing'
      }
    });

    // إنشاء مقابلة قادمة
    upcomingInterview = await VideoInterview.create({
      roomId: uuidv4(),
      hostId: userId,
      participants: [
        { userId: hostId, role: 'participant' }
      ],
      status: 'scheduled',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // بعد يومين
    });
  });

  afterAll(async () => {
    // تنظيف البيانات
    await VideoInterview.deleteMany({
      _id: { $in: [pastInterview1._id, pastInterview2._id, upcomingInterview._id] }
    });
    await User.deleteMany({ _id: { $in: [userId, hostId] } });
    
    // إغلاق الاتصال
    await mongoose.connection.close();
  });

  describe('GET /interviews/past', () => {
    it('يجب أن يجلب المقابلات السابقة بنجاح', async () => {
      const response = await request(app)
        .get('/interviews/past')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toBeDefined();
      expect(Array.isArray(response.body.interviews)).toBe(true);
      expect(response.body.interviews.length).toBeGreaterThanOrEqual(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
    });

    it('يجب أن يدعم pagination', async () => {
      const response = await request(app)
        .get('/interviews/past?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.interviews.length).toBe(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.pages).toBeGreaterThanOrEqual(2);
    });

    it('يجب أن يدعم التصفية حسب الحالة', async () => {
      const response = await request(app)
        .get('/interviews/past?status=ended')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toBeDefined();
      response.body.interviews.forEach(interview => {
        expect(interview.status).toBe('ended');
      });
    });

    it('يجب أن يعرض معلومات المضيف والمشاركين', async () => {
      const response = await request(app)
        .get('/interviews/past')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const interview = response.body.interviews[0];
      expect(interview.hostId).toBeDefined();
      expect(interview.hostId.name).toBeDefined();
      expect(interview.participants).toBeDefined();
      expect(interview.participants[0].userId).toBeDefined();
      expect(interview.participants[0].userId.name).toBeDefined();
    });

    it('يجب أن يعرض معلومات التسجيل', async () => {
      const response = await request(app)
        .get('/interviews/past')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const interviewWithRecording = response.body.interviews.find(
        i => i._id.toString() === pastInterview1._id.toString()
      );
      
      expect(interviewWithRecording).toBeDefined();
      expect(interviewWithRecording.recording).toBeDefined();
      expect(interviewWithRecording.recording.status).toBe('ready');
      expect(interviewWithRecording.recording.videoUrl).toBeDefined();
    });

    it('يجب أن يعرض الملاحظات والتقييم', async () => {
      const response = await request(app)
        .get('/interviews/past')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const interviewWithNotes = response.body.interviews.find(
        i => i._id.toString() === pastInterview1._id.toString()
      );
      
      expect(interviewWithNotes).toBeDefined();
      expect(interviewWithNotes.notes).toBe('مقابلة ممتازة');
      expect(interviewWithNotes.rating).toBe(5);
    });

    it('يجب أن يرفض الطلب بدون authentication', async () => {
      const response = await request(app)
        .get('/interviews/past')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('يجب أن يرتب المقابلات حسب التاريخ (الأحدث أولاً)', async () => {
      const response = await request(app)
        .get('/interviews/past')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const interviews = response.body.interviews;
      
      if (interviews.length >= 2) {
        const date1 = new Date(interviews[0].endedAt || interviews[0].scheduledAt);
        const date2 = new Date(interviews[1].endedAt || interviews[1].scheduledAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });
  });

  describe('GET /interviews/upcoming', () => {
    it('يجب أن يجلب المقابلات القادمة بنجاح', async () => {
      const response = await request(app)
        .get('/interviews/upcoming')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toBeDefined();
      expect(Array.isArray(response.body.interviews)).toBe(true);
      expect(response.body.interviews.length).toBeGreaterThanOrEqual(1);
    });

    it('يجب ألا يعرض المقابلات السابقة', async () => {
      const response = await request(app)
        .get('/interviews/upcoming')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.interviews.forEach(interview => {
        expect(['scheduled', 'waiting', 'active']).toContain(interview.status);
      });
    });
  });

  describe('GET /interviews/stats', () => {
    it('يجب أن يجلب إحصائيات المقابلات بنجاح', async () => {
      const response = await request(app)
        .get('/interviews/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.upcoming).toBeGreaterThanOrEqual(1);
      expect(response.body.stats.completed).toBeGreaterThanOrEqual(2);
      expect(response.body.stats.withRecordings).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /interviews/search', () => {
    it('يجب أن يبحث في المقابلات بنجاح', async () => {
      const response = await request(app)
        .get('/interviews/search?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toBeDefined();
    });

    it('يجب أن يدعم التصفية حسب التاريخ', async () => {
      const startDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/interviews/search?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toBeDefined();
    });
  });

  describe('GET /interviews/:interviewId', () => {
    it('يجب أن يجلب تفاصيل مقابلة واحدة بنجاح', async () => {
      const response = await request(app)
        .get(`/interviews/${pastInterview1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.interview).toBeDefined();
      expect(response.body.interview._id).toBe(pastInterview1._id.toString());
      expect(response.body.interview.notes).toBe('مقابلة ممتازة');
      expect(response.body.interview.rating).toBe(5);
    });

    it('يجب أن يرفض الوصول لمقابلة غير موجودة', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/interviews/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
