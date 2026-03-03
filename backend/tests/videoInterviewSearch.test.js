/**
 * اختبارات البحث والفلترة في المقابلات
 * Requirements: 8.6
 */

const request = require('supertest');
const app = require('../src/app');
const VideoInterview = require('../src/models/VideoInterview');
const { User, Company, Individual } = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Video Interview Search & Filter Tests', () => {
  let token;
  let userId;
  let hostId;
  let interviews = [];

  beforeAll(async () => {
    // تنظيف البيانات
    await VideoInterview.deleteMany({});
    await User.deleteMany({});

    // إنشاء مستخدمين
    const host = await Company.create({
      name: 'مسؤول التوظيف',
      email: 'host@test.com',
      password: 'password123',
      phone: '+966501234567',
      companyName: 'شركة الاختبار',
      companyIndustry: 'تقنية المعلومات'
    });
    hostId = host._id;

    const participant = await Individual.create({
      name: 'المرشح',
      email: 'participant@test.com',
      password: 'password123',
      phone: '+966507654321'
    });
    userId = participant._id;

    // توليد token
    token = jwt.sign({ _id: userId }, process.env.JWT_SECRET);

    // إنشاء مقابلات متنوعة للاختبار
    const now = new Date();
    
    // مقابلة مجدولة (قادمة)
    interviews.push(await VideoInterview.create({
      roomId: 'room-1',
      hostId: hostId,
      participants: [{ userId: userId, role: 'participant' }],
      status: 'scheduled',
      scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // غداً
      notes: 'مقابلة مهمة للوظيفة'
    }));

    // مقابلة نشطة
    interviews.push(await VideoInterview.create({
      roomId: 'room-2',
      hostId: hostId,
      participants: [{ userId: userId, role: 'participant' }],
      status: 'active',
      scheduledAt: now,
      startedAt: now
    }));

    // مقابلة انتهت
    interviews.push(await VideoInterview.create({
      roomId: 'room-3',
      hostId: hostId,
      participants: [{ userId: userId, role: 'participant' }],
      status: 'ended',
      scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // قبل أسبوع
      startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3600000),
      duration: 3600,
      notes: 'مقابلة ممتازة'
    }));

    // مقابلة ملغاة
    interviews.push(await VideoInterview.create({
      roomId: 'room-4',
      hostId: hostId,
      participants: [{ userId: userId, role: 'participant' }],
      status: 'cancelled',
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // قبل يومين
      notes: 'تم الإلغاء بسبب ظروف طارئة'
    }));

    // مقابلة في الانتظار
    interviews.push(await VideoInterview.create({
      roomId: 'room-5',
      hostId: hostId,
      participants: [{ userId: userId, role: 'participant' }],
      status: 'waiting',
      scheduledAt: now
    }));
  });

  afterAll(async () => {
    await VideoInterview.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/video-interviews/search', () => {
    test('يجب أن يجلب جميع المقابلات بدون فلاتر', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toHaveLength(5);
      expect(response.body.pagination.total).toBe(5);
    });

    test('يجب أن يفلتر حسب الحالة (scheduled)', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?status=scheduled')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toHaveLength(1);
      expect(response.body.interviews[0].status).toBe('scheduled');
    });

    test('يجب أن يفلتر حسب الحالة (ended)', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?status=ended')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toHaveLength(1);
      expect(response.body.interviews[0].status).toBe('ended');
    });

    test('يجب أن يفلتر حسب الحالة (cancelled)', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?status=cancelled')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toHaveLength(1);
      expect(response.body.interviews[0].status).toBe('cancelled');
    });

    test('يجب أن يفلتر حسب تاريخ البداية', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const response = await request(app)
        .get(`/api/video-interviews/search?startDate=${yesterday.toISOString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // يجب أن يجلب المقابلات من أمس وما بعد
      expect(response.body.interviews.length).toBeGreaterThan(0);
    });

    test('يجب أن يفلتر حسب تاريخ النهاية', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const response = await request(app)
        .get(`/api/video-interviews/search?endDate=${tomorrow.toISOString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // يجب أن يجلب المقابلات حتى غداً
      expect(response.body.interviews.length).toBeGreaterThan(0);
    });

    test('يجب أن يفلتر حسب نطاق تاريخ', async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const response = await request(app)
        .get(`/api/video-interviews/search?startDate=${weekAgo.toISOString()}&endDate=${tomorrow.toISOString()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews.length).toBeGreaterThan(0);
    });

    test('يجب أن يبحث في الملاحظات', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?search=ممتازة')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews.length).toBeGreaterThan(0);
      expect(response.body.interviews[0].notes).toContain('ممتازة');
    });

    test('يجب أن يبحث في اسم المضيف', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?search=مسؤول')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews.length).toBeGreaterThan(0);
    });

    test('يجب أن يبحث في اسم المشارك', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?search=المرشح')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews.length).toBeGreaterThan(0);
    });

    test('يجب أن يدمج الفلاتر المتعددة', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?status=ended&search=ممتازة')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toHaveLength(1);
      expect(response.body.interviews[0].status).toBe('ended');
      expect(response.body.interviews[0].notes).toContain('ممتازة');
    });

    test('يجب أن يدعم Pagination', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(5);
      expect(response.body.pagination.pages).toBe(3);
    });

    test('يجب أن يجلب الصفحة الثانية', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?page=2&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toHaveLength(2);
      expect(response.body.pagination.page).toBe(2);
    });

    test('يجب أن يرجع مصفوفة فارغة للبحث بدون نتائج', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search?search=نص_غير_موجود_xyz123')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews).toHaveLength(0);
    });

    test('يجب أن يرفض الطلب بدون authentication', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search');

      expect(response.status).toBe(401);
    });

    test('يجب أن يرتب النتائج حسب التاريخ (الأحدث أولاً)', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const dates = response.body.interviews.map(i => new Date(i.scheduledAt));
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].getTime()).toBeGreaterThanOrEqual(dates[i + 1].getTime());
      }
    });

    test('يجب أن يعيد معلومات المضيف والمشاركين', async () => {
      const response = await request(app)
        .get('/api/video-interviews/search')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.interviews[0].hostId).toBeDefined();
      expect(response.body.interviews[0].hostId.name).toBeDefined();
      expect(response.body.interviews[0].participants).toBeDefined();
      expect(response.body.interviews[0].participants[0].userId).toBeDefined();
    });
  });
});
