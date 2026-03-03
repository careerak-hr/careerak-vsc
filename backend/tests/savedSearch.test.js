const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const SavedSearch = require('../src/models/SavedSearch');
const { User } = require('../src/models/User');
const jwt = require('jsonwebtoken');

describe('Saved Search API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // إنشاء مستخدم للاختبار
    const user = await User.create({
      phone: '+201234567890',
      password: 'Test1234!',
      role: 'Employee',
      country: 'Egypt'
    });

    userId = user._id;
    authToken = jwt.sign({ id: userId, role: 'Employee' }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await SavedSearch.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await SavedSearch.deleteMany({ userId });
  });

  describe('POST /api/search/saved', () => {
    it('should create a saved search successfully', async () => {
      const searchData = {
        name: 'Developer Jobs in Cairo',
        searchType: 'jobs',
        searchParams: {
          query: 'developer',
          location: 'Cairo',
          salaryMin: 5000,
          salaryMax: 10000
        }
      };

      const response = await request(app)
        .post('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send(searchData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(searchData.name);
      expect(response.body.data.userId.toString()).toBe(userId.toString());
    });

    it('should reject when name is missing', async () => {
      const searchData = {
        searchType: 'jobs',
        searchParams: { query: 'developer' }
      };

      const response = await request(app)
        .post('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send(searchData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject when trying to save more than 10 searches', async () => {
      // إنشاء 10 عمليات بحث
      for (let i = 0; i < 10; i++) {
        await SavedSearch.create({
          userId,
          name: `Search ${i + 1}`,
          searchType: 'jobs',
          searchParams: { query: `query${i}` }
        });
      }

      // محاولة إضافة الحادية عشر
      const searchData = {
        name: 'Search 11',
        searchType: 'jobs',
        searchParams: { query: 'test' }
      };

      const response = await request(app)
        .post('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send(searchData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LIMIT_EXCEEDED');
      expect(response.body.error.message).toContain('Maximum 10');
    });
  });

  describe('GET /api/search/saved', () => {
    it('should return all saved searches for user', async () => {
      // إنشاء 3 عمليات بحث
      await SavedSearch.create([
        {
          userId,
          name: 'Search 1',
          searchType: 'jobs',
          searchParams: { query: 'developer' }
        },
        {
          userId,
          name: 'Search 2',
          searchType: 'courses',
          searchParams: { query: 'javascript' }
        },
        {
          userId,
          name: 'Search 3',
          searchType: 'jobs',
          searchParams: { query: 'designer' }
        }
      ]);

      const response = await request(app)
        .get('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedSearches).toHaveLength(3);
      expect(response.body.data.count).toBe(3);
      expect(response.body.data.limit).toBe(10);
    });

    it('should return empty array when no saved searches', async () => {
      const response = await request(app)
        .get('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedSearches).toHaveLength(0);
      expect(response.body.data.count).toBe(0);
    });
  });

  describe('GET /api/search/saved/:id', () => {
    it('should return a specific saved search', async () => {
      const savedSearch = await SavedSearch.create({
        userId,
        name: 'Test Search',
        searchType: 'jobs',
        searchParams: { query: 'developer' }
      });

      const response = await request(app)
        .get(`/api/search/saved/${savedSearch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Search');
    });

    it('should return 404 for non-existent search', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/search/saved/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/search/saved/:id', () => {
    it('should update a saved search successfully', async () => {
      const savedSearch = await SavedSearch.create({
        userId,
        name: 'Original Name',
        searchType: 'jobs',
        searchParams: { query: 'developer' }
      });

      const updateData = {
        name: 'Updated Name',
        alertEnabled: true,
        alertFrequency: 'daily'
      };

      const response = await request(app)
        .put(`/api/search/saved/${savedSearch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.alertEnabled).toBe(true);
      expect(response.body.data.alertFrequency).toBe('daily');
    });

    it('should return 404 when updating non-existent search', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/search/saved/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/search/saved/:id', () => {
    it('should delete a saved search successfully', async () => {
      const savedSearch = await SavedSearch.create({
        userId,
        name: 'To Delete',
        searchType: 'jobs',
        searchParams: { query: 'developer' }
      });

      const response = await request(app)
        .delete(`/api/search/saved/${savedSearch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // التحقق من الحذف
      const deleted = await SavedSearch.findById(savedSearch._id);
      expect(deleted).toBeNull();
    });

    it('should return 404 when deleting non-existent search', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/search/saved/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/search/saved/check-limit', () => {
    it('should return correct limit information', async () => {
      // إنشاء 3 عمليات بحث
      await SavedSearch.create([
        {
          userId,
          name: 'Search 1',
          searchType: 'jobs',
          searchParams: { query: 'test1' }
        },
        {
          userId,
          name: 'Search 2',
          searchType: 'jobs',
          searchParams: { query: 'test2' }
        },
        {
          userId,
          name: 'Search 3',
          searchType: 'jobs',
          searchParams: { query: 'test3' }
        }
      ]);

      const response = await request(app)
        .get('/api/search/saved/check-limit')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(3);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.canAdd).toBe(true);
      expect(response.body.data.remaining).toBe(7);
    });

    it('should indicate when limit is reached', async () => {
      // إنشاء 10 عمليات بحث
      const searches = [];
      for (let i = 0; i < 10; i++) {
        searches.push({
          userId,
          name: `Search ${i + 1}`,
          searchType: 'jobs',
          searchParams: { query: `query${i}` }
        });
      }
      await SavedSearch.create(searches);

      const response = await request(app)
        .get('/api/search/saved/check-limit')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(10);
      expect(response.body.data.canAdd).toBe(false);
      expect(response.body.data.remaining).toBe(0);
    });
  });

  describe('Model Validation', () => {
    it('should enforce 10 search limit at model level', async () => {
      // إنشاء 10 عمليات بحث
      for (let i = 0; i < 10; i++) {
        await SavedSearch.create({
          userId,
          name: `Search ${i + 1}`,
          searchType: 'jobs',
          searchParams: { query: `query${i}` }
        });
      }

      // محاولة إضافة الحادية عشر مباشرة
      try {
        await SavedSearch.create({
          userId,
          name: 'Search 11',
          searchType: 'jobs',
          searchParams: { query: 'test' }
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.message).toContain('Maximum 10');
      }
    });
  });
});
