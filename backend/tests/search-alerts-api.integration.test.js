const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src/models/SearchAlert');
const Notification = require('../src/models/Notification');

/**
 * Integration Tests for Search Alerts API
 * Tests all endpoints: POST, GET, PUT, DELETE /api/search/alerts
 * 
 * Validates: Requirements 4.2
 */

describe('Search Alerts API Integration Tests', () => {
  let authToken;
  let testUser;
  let savedSearch;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // تنظيف قاعدة البيانات
    await User.deleteMany({});
    await SavedSearch.deleteMany({});
    await SearchAlert.deleteMany({});
    await Notification.deleteMany({});

    // إنشاء مستخدم اختبار
    testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      phone: '+201234567890',
      role: 'Employee',
      skills: ['JavaScript', 'React'],
      interests: ['Web Development']
    });

    // تسجيل الدخول للحصول على token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });

    authToken = loginRes.body.token;

    // إنشاء عملية بحث محفوظة
    savedSearch = await SavedSearch.create({
      userId: testUser._id,
      name: 'JavaScript Developer Jobs',
      searchType: 'jobs',
      searchParams: {
        query: 'JavaScript',
        skills: ['JavaScript', 'React'],
        location: 'Cairo'
      }
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await SavedSearch.deleteMany({});
    await SearchAlert.deleteMany({});
    await Notification.deleteMany({});
  });

  describe('POST /api/search/alerts', () => {
    it('should create a new alert successfully', async () => {
      const res = await request(app)
        .post('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          savedSearchId: savedSearch._id,
          frequency: 'instant',
          notificationMethod: 'push'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.frequency).toBe('instant');
      expect(res.body.data.notificationMethod).toBe('push');
      expect(res.body.data.isActive).toBe(true);

      // التحقق من تحديث SavedSearch
      const updatedSavedSearch = await SavedSearch.findById(savedSearch._id);
      expect(updatedSavedSearch.alertEnabled).toBe(true);
      expect(updatedSavedSearch.alertFrequency).toBe('instant');

      // التحقق من إرسال إشعار
      const notification = await Notification.findOne({
        userId: testUser._id,
        type: 'system'
      });
      expect(notification).toBeTruthy();
      expect(notification.title).toContain('تم تفعيل التنبيه');
    });

    it('should return 404 if saved search does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          savedSearchId: fakeId,
          frequency: 'daily'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('غير موجودة');
    });

    it('should return 400 if alert already exists', async () => {
      // إنشاء تنبيه أول
      await request(app)
        .post('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          savedSearchId: savedSearch._id,
          frequency: 'instant'
        });

      // محاولة إنشاء تنبيه ثاني لنفس عملية البحث
      const res = await request(app)
        .post('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          savedSearchId: savedSearch._id,
          frequency: 'daily'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('يوجد تنبيه بالفعل');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/search/alerts')
        .send({
          savedSearchId: savedSearch._id,
          frequency: 'instant'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/search/alerts', () => {
    beforeEach(async () => {
      // إنشاء عدة تنبيهات
      await SearchAlert.create([
        {
          userId: testUser._id,
          savedSearchId: savedSearch._id,
          frequency: 'instant',
          notificationMethod: 'push'
        },
        {
          userId: testUser._id,
          savedSearchId: savedSearch._id,
          frequency: 'daily',
          notificationMethod: 'email'
        }
      ]);
    });

    it('should get all user alerts', async () => {
      const res = await request(app)
        .get('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0]).toHaveProperty('savedSearchId');
      expect(res.body.data[0].savedSearchId).toHaveProperty('name');
    });

    it('should return empty array if no alerts', async () => {
      await SearchAlert.deleteMany({});

      const res = await request(app)
        .get('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/search/alerts');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/search/alerts/:id', () => {
    let alert;

    beforeEach(async () => {
      alert = await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'instant',
        notificationMethod: 'push'
      });
    });

    it('should get alert by id', async () => {
      const res = await request(app)
        .get(`/api/search/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(alert._id.toString());
      expect(res.body.data.frequency).toBe('instant');
    });

    it('should return 404 if alert not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/search/alerts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/search/alerts/${alert._id}`);

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/search/alerts/:id', () => {
    let alert;

    beforeEach(async () => {
      alert = await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'instant',
        notificationMethod: 'push',
        isActive: true
      });

      // تحديث SavedSearch
      savedSearch.alertEnabled = true;
      savedSearch.alertFrequency = 'instant';
      await savedSearch.save();
    });

    it('should update alert frequency', async () => {
      const res = await request(app)
        .put(`/api/search/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          frequency: 'daily'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.frequency).toBe('daily');

      // التحقق من تحديث SavedSearch
      const updatedSavedSearch = await SavedSearch.findById(savedSearch._id);
      expect(updatedSavedSearch.alertFrequency).toBe('daily');
    });

    it('should update alert notification method', async () => {
      const res = await request(app)
        .put(`/api/search/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notificationMethod: 'email'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.notificationMethod).toBe('email');
    });

    it('should disable alert', async () => {
      const res = await request(app)
        .put(`/api/search/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isActive: false
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);

      // التحقق من تحديث SavedSearch
      const updatedSavedSearch = await SavedSearch.findById(savedSearch._id);
      expect(updatedSavedSearch.alertEnabled).toBe(false);
    });

    it('should return 404 if alert not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/search/alerts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          frequency: 'weekly'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put(`/api/search/alerts/${alert._id}`)
        .send({
          frequency: 'daily'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/search/alerts/:id', () => {
    let alert;

    beforeEach(async () => {
      alert = await SearchAlert.create({
        userId: testUser._id,
        savedSearchId: savedSearch._id,
        frequency: 'instant',
        notificationMethod: 'push'
      });

      savedSearch.alertEnabled = true;
      await savedSearch.save();
    });

    it('should delete alert successfully', async () => {
      const res = await request(app)
        .delete(`/api/search/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('تم حذف التنبيه');

      // التحقق من الحذف
      const deletedAlert = await SearchAlert.findById(alert._id);
      expect(deletedAlert).toBeNull();

      // التحقق من تحديث SavedSearch
      const updatedSavedSearch = await SavedSearch.findById(savedSearch._id);
      expect(updatedSavedSearch.alertEnabled).toBe(false);

      // التحقق من إرسال إشعار
      const notification = await Notification.findOne({
        userId: testUser._id,
        type: 'system'
      });
      expect(notification).toBeTruthy();
      expect(notification.title).toContain('تم إلغاء التنبيه');
    });

    it('should return 404 if alert not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/search/alerts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .delete(`/api/search/alerts/${alert._id}`);

      expect(res.status).toBe(401);
    });
  });
});
