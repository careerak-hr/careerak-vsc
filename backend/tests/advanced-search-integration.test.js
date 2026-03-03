/**
 * Advanced Search & Filter System - Integration Tests
 * 
 * Feature: advanced-search-filter
 * Tests complete workflows from search to save to alerts
 * Validates: All Requirements
 * 
 * Coverage:
 * - Complete search workflow (search → filter → save → alert)
 * - Multi-component interactions
 * - End-to-end user scenarios
 * - Data persistence and retrieval
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');
const SavedSearch = require('../src/models/SavedSearch');
const SearchAlert = require('../src/models/SearchAlert');
const Notification = require('../src/models/Notification');

describe('Advanced Search & Filter - Integration Tests', () => {
  let authToken;
  let userId;
  let testJobs = [];

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await SavedSearch.deleteMany({});
    await SearchAlert.deleteMany({});
    await Notification.deleteMany({});

    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'jobseeker',
      profile: {
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 'intermediate',
        location: { city: 'Cairo', country: 'Egypt' }
      }
    });

    userId = user._id;

    // Generate auth token
    authToken = user.generateAuthToken();

    // Create test jobs
    testJobs = await JobPosting.insertMany([
      {
        title: 'Senior JavaScript Developer',
        description: 'Looking for experienced JavaScript developer',
        company: { name: 'Tech Corp', _id: new mongoose.Types.ObjectId() },
        skills: ['JavaScript', 'React', 'Node.js'],
        experienceLevel: 'senior',
        workType: 'full-time',
        salary: { min: 5000, max: 8000, currency: 'USD' },
        location: { city: 'Cairo', country: 'Egypt', coordinates: [31.2357, 30.0444] },
        status: 'active',
        createdAt: new Date()
      },
      {
        title: 'React Frontend Developer',
        description: 'React specialist needed',
        company: { name: 'Web Solutions', _id: new mongoose.Types.ObjectId() },
        skills: ['React', 'JavaScript', 'CSS'],
        experienceLevel: 'intermediate',
        workType: 'remote',
        salary: { min: 3000, max: 5000, currency: 'USD' },
        location: { city: 'Alexandria', country: 'Egypt', coordinates: [29.9187, 31.2001] },
        status: 'active',
        createdAt: new Date()
      },
      {
        title: 'Full Stack Developer',
        description: 'Full stack position with Node.js',
        company: { name: 'Startup Inc', _id: new mongoose.Types.ObjectId() },
        skills: ['JavaScript', 'Node.js', 'MongoDB'],
        experienceLevel: 'intermediate',
        workType: 'hybrid',
        salary: { min: 4000, max: 6000, currency: 'USD' },
        location: { city: 'Cairo', country: 'Egypt', coordinates: [31.2357, 30.0444] },
        status: 'active',
        createdAt: new Date()
      }
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Complete Search Workflow', () => {
    test('should complete full workflow: search → filter → save → alert', async () => {
      // Step 1: Perform initial search
      const searchResponse = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript', location: 'Cairo' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data.results.length).toBeGreaterThan(0);

      // Step 2: Apply filters
      const filterResponse = await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          location: 'Cairo',
          salaryMin: 4000,
          experienceLevel: 'intermediate,senior',
          workType: 'full-time,hybrid'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(filterResponse.status).toBe(200);
      expect(filterResponse.body.data.results.length).toBeGreaterThan(0);

      // Step 3: Save the search
      const saveResponse = await request(app)
        .post('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Cairo JavaScript Jobs',
          searchParams: {
            query: 'JavaScript',
            location: 'Cairo',
            salaryMin: 4000,
            experienceLevel: ['intermediate', 'senior'],
            workType: ['full-time', 'hybrid']
          }
        });

      expect(saveResponse.status).toBe(201);
      expect(saveResponse.body.data.name).toBe('Cairo JavaScript Jobs');

      const savedSearchId = saveResponse.body.data._id;

      // Step 4: Enable alert for saved search
      const alertResponse = await request(app)
        .post('/api/search/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          savedSearchId,
          frequency: 'instant',
          notificationMethod: 'push'
        });

      expect(alertResponse.status).toBe(201);
      expect(alertResponse.body.data.isActive).toBe(true);

      // Step 5: Create a new matching job
      const newJob = await JobPosting.create({
        title: 'JavaScript Team Lead',
        description: 'Leading JavaScript team in Cairo',
        company: { name: 'New Company', _id: new mongoose.Types.ObjectId() },
        skills: ['JavaScript', 'Leadership'],
        experienceLevel: 'senior',
        workType: 'full-time',
        salary: { min: 6000, max: 9000, currency: 'USD' },
        location: { city: 'Cairo', country: 'Egypt' },
        status: 'active'
      });

      // Step 6: Verify alert was triggered (check notifications)
      const notifications = await Notification.find({
        userId,
        type: 'search_alert'
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].data.jobs[0]._id.toString()).toBe(newJob._id.toString());
    });

    test('should handle search with no results gracefully', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'NonExistentSkill12345' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.results).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });

    test('should handle invalid filter values', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          salaryMin: -1000,
          salaryMax: 500
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Multi-Filter Application', () => {
    test('should apply multiple filters simultaneously', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          location: 'Cairo',
          salaryMin: 4000,
          salaryMax: 7000,
          experienceLevel: 'intermediate,senior',
          workType: 'full-time,hybrid',
          skills: 'JavaScript,Node.js'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const results = response.body.data.results;
      results.forEach(job => {
        // Check salary range
        expect(job.salary.min).toBeGreaterThanOrEqual(4000);
        expect(job.salary.max).toBeLessThanOrEqual(7000);
        
        // Check location
        expect(job.location.city).toBe('Cairo');
        
        // Check experience level
        expect(['intermediate', 'senior']).toContain(job.experienceLevel);
        
        // Check work type
        expect(['full-time', 'hybrid']).toContain(job.workType);
        
        // Check skills
        const hasRequiredSkill = job.skills.some(skill => 
          ['JavaScript', 'Node.js'].includes(skill)
        );
        expect(hasRequiredSkill).toBe(true);
      });
    });

    test('should return accurate result count', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ location: 'Cairo' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(response.body.data.results.length);
    });
  });

  describe('Saved Search Management', () => {
    test('should enforce 10 saved searches limit', async () => {
      // Create 10 saved searches
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/search/saved')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Search ${i + 1}`,
            searchParams: { query: `test${i}` }
          });
      }

      // Try to create 11th
      const response = await request(app)
        .post('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Search 11',
          searchParams: { query: 'test11' }
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('LIMIT_EXCEEDED');
    });

    test('should preserve search parameters in round-trip', async () => {
      const originalParams = {
        query: 'JavaScript',
        location: 'Cairo',
        salaryMin: 4000,
        salaryMax: 8000,
        experienceLevel: ['intermediate', 'senior'],
        workType: ['full-time', 'remote'],
        skills: ['JavaScript', 'React'],
        skillsLogic: 'AND'
      };

      // Save search
      const saveResponse = await request(app)
        .post('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Search',
          searchParams: originalParams
        });

      expect(saveResponse.status).toBe(201);

      // Retrieve search
      const getResponse = await request(app)
        .get(`/api/search/saved/${saveResponse.body.data._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.searchParams).toMatchObject(originalParams);
    });

    test('should send notification on save/update/delete', async () => {
      // Save
      const saveResponse = await request(app)
        .post('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Search',
          searchParams: { query: 'test' }
        });

      let notifications = await Notification.find({ userId });
      expect(notifications.some(n => n.type === 'saved_search_created')).toBe(true);

      // Update
      await request(app)
        .put(`/api/search/saved/${saveResponse.body.data._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Search' });

      notifications = await Notification.find({ userId });
      expect(notifications.some(n => n.type === 'saved_search_updated')).toBe(true);

      // Delete
      await request(app)
        .delete(`/api/search/saved/${saveResponse.body.data._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      notifications = await Notification.find({ userId });
      expect(notifications.some(n => n.type === 'saved_search_deleted')).toBe(true);
    });
  });

  describe('Alert System', () => {
    test('should trigger alert on new matching job', async () => {
      // Create saved search
      const savedSearch = await SavedSearch.create({
        userId,
        name: 'React Jobs',
        searchType: 'jobs',
        searchParams: {
          query: 'React',
          skills: ['React']
        },
        alertEnabled: true,
        alertFrequency: 'instant'
      });

      // Create alert
      await SearchAlert.create({
        userId,
        savedSearchId: savedSearch._id,
        frequency: 'instant',
        notificationMethod: 'push',
        isActive: true
      });

      // Create matching job
      const newJob = await JobPosting.create({
        title: 'React Developer',
        description: 'React position',
        company: { name: 'Company', _id: new mongoose.Types.ObjectId() },
        skills: ['React', 'JavaScript'],
        experienceLevel: 'intermediate',
        workType: 'full-time',
        salary: { min: 3000, max: 5000, currency: 'USD' },
        location: { city: 'Cairo', country: 'Egypt' },
        status: 'active'
      });

      // Check notification was created
      const notifications = await Notification.find({
        userId,
        type: 'search_alert'
      });

      expect(notifications.length).toBeGreaterThan(0);
    });

    test('should not send duplicate alerts for same job', async () => {
      // Create saved search and alert
      const savedSearch = await SavedSearch.create({
        userId,
        name: 'Test Search',
        searchType: 'jobs',
        searchParams: { query: 'test' },
        alertEnabled: true
      });

      await SearchAlert.create({
        userId,
        savedSearchId: savedSearch._id,
        frequency: 'instant',
        isActive: true
      });

      // Create job
      const job = await JobPosting.create({
        title: 'Test Job',
        description: 'test',
        company: { name: 'Company', _id: new mongoose.Types.ObjectId() },
        skills: ['test'],
        status: 'active'
      });

      // Trigger alert twice
      const AlertService = require('../src/services/alertService');
      const alertService = new AlertService();
      
      await alertService.checkNewResults(savedSearch);
      await alertService.checkNewResults(savedSearch);

      // Should only have one notification
      const notifications = await Notification.find({
        userId,
        type: 'search_alert',
        'data.jobs._id': job._id
      });

      expect(notifications.length).toBe(1);
    });

    test('should respect alert toggle (enabled/disabled)', async () => {
      // Create saved search
      const savedSearch = await SavedSearch.create({
        userId,
        name: 'Test Search',
        searchType: 'jobs',
        searchParams: { query: 'test' },
        alertEnabled: false // Disabled
      });

      // Create job
      await JobPosting.create({
        title: 'Test Job',
        description: 'test',
        company: { name: 'Company', _id: new mongoose.Types.ObjectId() },
        skills: ['test'],
        status: 'active'
      });

      // No notification should be created
      const notifications = await Notification.find({
        userId,
        type: 'search_alert'
      });

      expect(notifications.length).toBe(0);
    });
  });

  describe('Skills Matching', () => {
    test('should apply AND logic for skills', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          skills: 'JavaScript,React',
          skillsLogic: 'AND'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      response.body.data.results.forEach(job => {
        expect(job.skills).toContain('JavaScript');
        expect(job.skills).toContain('React');
      });
    });

    test('should apply OR logic for skills', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          skills: 'JavaScript,Python',
          skillsLogic: 'OR'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      response.body.data.results.forEach(job => {
        const hasEitherSkill = job.skills.includes('JavaScript') || 
                               job.skills.includes('Python');
        expect(hasEitherSkill).toBe(true);
      });
    });

    test('should calculate match percentage correctly', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      response.body.data.results.forEach(job => {
        if (job.matchScore !== undefined) {
          expect(job.matchScore).toBeGreaterThanOrEqual(0);
          expect(job.matchScore).toBeLessThanOrEqual(100);
        }
      });
    });
  });

  describe('Performance', () => {
    test('should return results within 500ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript' })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500);
    });

    test('should handle pagination efficiently', async () => {
      // Create more jobs
      const moreJobs = Array.from({ length: 50 }, (_, i) => ({
        title: `Job ${i}`,
        description: 'test',
        company: { name: 'Company', _id: new mongoose.Types.ObjectId() },
        skills: ['JavaScript'],
        status: 'active'
      }));

      await JobPosting.insertMany(moreJobs);

      const response = await request(app)
        .get('/api/search/jobs')
        .query({ page: 2, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.results.length).toBeLessThanOrEqual(10);
      expect(response.body.data.page).toBe(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Close connection to simulate error
      await mongoose.connection.close();

      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'test' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);

      // Reconnect
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/search/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing name
          searchParams: { query: 'test' }
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/search/saved')
        // No auth token
        .send();

      expect(response.status).toBe(401);
    });
  });
});
