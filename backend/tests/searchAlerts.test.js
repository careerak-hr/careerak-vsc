const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src/models/SearchAlert');
const jwt = require('jsonwebtoken');

describe('Search Alerts API', () => {
  let authToken;
  let userId;
  let savedSearchId;

  beforeAll(async () => {
    // إنشاء مستخدم للاختبار
    const user = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    });
    userId = user._id;
    authToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // إنشاء عملية بحث محفوظة للاختبار
    const savedSearch = await SavedSearch.create({
      userId,
      name: 'Test Search',
      searchType: 'jobs',
      searchParams: {
        query: 'developer',
        location: 'Cairo'
      }
    });
    savedSearchId = savedSearch._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: /test-.*@example\.com/ });
    await SavedSearch.deleteMany({ userId });
    await SearchAlert.deleteMany({ userId });
  });

  describe('POST /api/search/alerts', () => {
    it('should create a new alert successfully', async () => {
      const alertData = {
        savedSearchId,
        frequency: 'instant',
        notificationMethod: 'push'
      };

      const response = await request(app)
        .post('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(alertData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.frequency).toBe('instant');
      expect(response.body.data.isActive).toBe(true);
    });

    it('should return error when creating duplicate alert', async () => {
      const alertData = {
        savedSearchId,
        frequency: 'daily',
        notificationMethod: 'email'
      };

      const response = await request(app)
        .post('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(alertData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('يوجد تنبيه بالفعل');
    });

    it('should return error when saved search not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const alertData = {
        savedSearchId: fakeId,
        frequency: 'instant',
        notificationMethod: 'push'
      };

      const response = await request(app)
        .post('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(alertData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/search/alerts', () => {
    it('should return all alerts for user', async () => {
      const response = await request(app)
        .get('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/search/alerts/:id', () => {
    it('should return a specific alert', async () => {
      const alert = await SearchAlert.findOne({ userId });

      const response = await request(app)
        .get(`/api/search/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(alert._id.toString());
    });

    it('should return 404 when alert not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/search/alerts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/search/alerts/:id', () => {
    it('should update an alert successfully', async () => {
      const alert = await SearchAlert.findOne({ userId });
      const updateData = {
        frequency: 'weekly',
        notificationMethod: 'both',
        isActive: false
      };

      const response = await request(app)
        .put(`/api/search/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.frequency).toBe('weekly');
      expect(response.body.data.notificationMethod).toBe('both');
      expect(response.body.data.isActive).toBe(false);
    });

    it('should return 404 when alert not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/search/alerts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ frequency: 'daily' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/search/alerts/:id', () => {
    it('should delete an alert successfully', async () => {
      const alert = await SearchAlert.findOne({ userId });

      const response = await request(app)
        .delete(`/api/search/alerts/${alert._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // التحقق من الحذف
      const deletedAlert = await SearchAlert.findById(alert._id);
      expect(deletedAlert).toBeNull();
    });

    it('should return 404 when alert not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/search/alerts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
