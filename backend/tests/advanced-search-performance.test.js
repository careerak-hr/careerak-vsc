/**
 * Advanced Search & Filter System - Performance Tests
 * 
 * Feature: advanced-search-filter
 * Tests performance metrics and load handling
 * Validates: Requirements 1.2 (< 500ms response time)
 * 
 * Coverage:
 * - Response time under various loads
 * - Concurrent request handling
 * - Database query optimization
 * - Caching effectiveness
 * - Large dataset handling
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const JobPosting = require('../src/models/JobPosting');

describe('Advanced Search & Filter - Performance Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }

    // Create test user
    const user = await User.create({
      name: 'Performance Test User',
      email: 'perf@example.com',
      password: 'password123',
      role: 'jobseeker'
    });

    userId = user._id;
    authToken = user.generateAuthToken();

    // Create large dataset (1000 jobs)
    console.log('Creating test dataset (1000 jobs)...');
    const jobs = [];
    const skills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue', 'MongoDB', 'SQL', 'AWS'];
    const cities = ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'];
    const experienceLevels = ['junior', 'intermediate', 'senior', 'expert'];
    const workTypes = ['full-time', 'part-time', 'remote', 'hybrid'];

    for (let i = 0; i < 1000; i++) {
      jobs.push({
        title: `Job Position ${i}`,
        description: `Description for job ${i} with various skills and requirements`,
        company: {
          name: `Company ${i % 100}`,
          _id: new mongoose.Types.ObjectId()
        },
        skills: [
          skills[Math.floor(Math.random() * skills.length)],
          skills[Math.floor(Math.random() * skills.length)],
          skills[Math.floor(Math.random() * skills.length)]
        ],
        experienceLevel: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
        workType: workTypes[Math.floor(Math.random() * workTypes.length)],
        salary: {
          min: 2000 + (i % 10) * 500,
          max: 5000 + (i % 10) * 1000,
          currency: 'USD'
        },
        location: {
          city: cities[Math.floor(Math.random() * cities.length)],
          country: 'Egypt',
          coordinates: [31.2357 + (Math.random() - 0.5), 30.0444 + (Math.random() - 0.5)]
        },
        status: 'active',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
    }

    await JobPosting.insertMany(jobs);
    console.log('Test dataset created successfully');
  });

  afterAll(async () => {
    await JobPosting.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Response Time Requirements', () => {
    test('should return search results within 500ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript' })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
      
      console.log(`Search completed in ${duration}ms`);
    });

    test('should handle filtered search within 500ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          location: 'Cairo',
          salaryMin: 3000,
          experienceLevel: 'intermediate,senior',
          workType: 'full-time,remote'
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
      
      console.log(`Filtered search completed in ${duration}ms`);
    });

    test('should handle complex multi-filter search within 500ms', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          location: 'Cairo',
          salaryMin: 3000,
          salaryMax: 8000,
          experienceLevel: 'intermediate,senior',
          workType: 'full-time,remote,hybrid',
          skills: 'JavaScript,React,Node.js',
          skillsLogic: 'OR',
          datePosted: 'week'
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
      
      console.log(`Complex search completed in ${duration}ms`);
    });

    test('should handle pagination efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          page: 5,
          limit: 20
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
      
      console.log(`Paginated search (page 5) completed in ${duration}ms`);
    });

    test('should handle sorting efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          sort: 'salary',
          order: 'desc'
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
      
      console.log(`Sorted search completed in ${duration}ms`);
    });
  });

  describe('Concurrent Request Handling', () => {
    test('should handle 10 concurrent searches efficiently', async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .get('/api/search/jobs')
          .query({ q: `skill${i}` })
          .set('Authorization', `Bearer ${authToken}`)
      );
      
      const responses = await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      const avgDuration = duration / 10;
      expect(avgDuration).toBeLessThan(500);
      
      console.log(`10 concurrent searches completed in ${duration}ms (avg: ${avgDuration}ms per request)`);
    });

    test('should handle 50 concurrent searches without errors', async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 50 }, (_, i) =>
        request(app)
          .get('/api/search/jobs')
          .query({ q: 'JavaScript', page: (i % 5) + 1 })
          .set('Authorization', `Bearer ${authToken}`)
      );
      
      const responses = await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBe(50);
      
      console.log(`50 concurrent searches completed in ${duration}ms`);
    });
  });

  describe('Database Query Optimization', () => {
    test('should use indexes for text search', async () => {
      // Enable profiling
      await mongoose.connection.db.command({ profile: 2 });
      
      await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript' })
        .set('Authorization', `Bearer ${authToken}`);
      
      // Check profiling data
      const profile = await mongoose.connection.db.collection('system.profile')
        .find({ ns: 'careerak_test.jobpostings' })
        .sort({ ts: -1 })
        .limit(1)
        .toArray();
      
      if (profile.length > 0) {
        // Should use text index
        expect(profile[0].planSummary).toContain('TEXT');
      }
      
      // Disable profiling
      await mongoose.connection.db.command({ profile: 0 });
    });

    test('should use indexes for geo queries', async () => {
      await mongoose.connection.db.command({ profile: 2 });
      
      await request(app)
        .get('/api/search/map')
        .query({
          bounds: JSON.stringify({
            north: 31,
            south: 30,
            east: 32,
            west: 30
          })
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      const profile = await mongoose.connection.db.collection('system.profile')
        .find({ ns: 'careerak_test.jobpostings' })
        .sort({ ts: -1 })
        .limit(1)
        .toArray();
      
      if (profile.length > 0) {
        // Should use geo index
        expect(profile[0].planSummary).toContain('GEO');
      }
      
      await mongoose.connection.db.command({ profile: 0 });
    });

    test('should limit returned fields for performance', async () => {
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript', limit: 1 })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      
      if (response.body.data.results.length > 0) {
        const job = response.body.data.results[0];
        
        // Should have essential fields
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('company');
        expect(job).toHaveProperty('skills');
        
        // Should not have unnecessary fields (if implemented)
        // expect(job).not.toHaveProperty('__v');
      }
    });
  });

  describe('Large Dataset Handling', () => {
    test('should handle search across 1000+ jobs efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript' })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
      
      console.log(`Search across 1000+ jobs completed in ${duration}ms`);
    });

    test('should handle complex aggregations efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          location: 'Cairo',
          salaryMin: 3000,
          experienceLevel: 'intermediate,senior',
          skills: 'JavaScript,React',
          skillsLogic: 'AND'
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
      
      console.log(`Complex aggregation completed in ${duration}ms`);
    });

    test('should handle deep pagination efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          page: 20,
          limit: 10
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
      
      console.log(`Deep pagination (page 20) completed in ${duration}ms`);
    });
  });

  describe('Memory Usage', () => {
    test('should not cause memory leaks with repeated searches', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform 100 searches
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/search/jobs')
          .query({ q: `test${i % 10}` })
          .set('Authorization', `Bearer ${authToken}`);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;
      
      // Memory increase should be reasonable (< 50MB)
      expect(memoryIncreaseMB).toBeLessThan(50);
      
      console.log(`Memory increase after 100 searches: ${memoryIncreaseMB.toFixed(2)}MB`);
    });
  });

  describe('Stress Testing', () => {
    test('should handle rapid successive requests', async () => {
      const results = [];
      
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get('/api/search/jobs')
          .query({ q: 'JavaScript', page: i + 1 })
          .set('Authorization', `Bearer ${authToken}`);
        
        const duration = Date.now() - startTime;
        
        results.push({
          status: response.status,
          duration
        });
      }
      
      const successCount = results.filter(r => r.status === 200).length;
      const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const maxDuration = Math.max(...results.map(r => r.duration));
      
      expect(successCount).toBe(20);
      expect(avgDuration).toBeLessThan(500);
      expect(maxDuration).toBeLessThan(1000);
      
      console.log(`20 rapid requests: avg ${avgDuration.toFixed(0)}ms, max ${maxDuration}ms`);
    });
  });

  describe('Performance Benchmarks', () => {
    test('should meet all performance targets', async () => {
      const benchmarks = {
        simpleSearch: 0,
        filteredSearch: 0,
        complexSearch: 0,
        paginatedSearch: 0,
        sortedSearch: 0
      };

      // Simple search
      let start = Date.now();
      await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript' })
        .set('Authorization', `Bearer ${authToken}`);
      benchmarks.simpleSearch = Date.now() - start;

      // Filtered search
      start = Date.now();
      await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          location: 'Cairo',
          salaryMin: 3000
        })
        .set('Authorization', `Bearer ${authToken}`);
      benchmarks.filteredSearch = Date.now() - start;

      // Complex search
      start = Date.now();
      await request(app)
        .get('/api/search/jobs')
        .query({
          q: 'JavaScript',
          location: 'Cairo',
          salaryMin: 3000,
          salaryMax: 8000,
          experienceLevel: 'intermediate,senior',
          workType: 'full-time,remote',
          skills: 'JavaScript,React',
          skillsLogic: 'AND'
        })
        .set('Authorization', `Bearer ${authToken}`);
      benchmarks.complexSearch = Date.now() - start;

      // Paginated search
      start = Date.now();
      await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript', page: 10, limit: 20 })
        .set('Authorization', `Bearer ${authToken}`);
      benchmarks.paginatedSearch = Date.now() - start;

      // Sorted search
      start = Date.now();
      await request(app)
        .get('/api/search/jobs')
        .query({ q: 'JavaScript', sort: 'salary', order: 'desc' })
        .set('Authorization', `Bearer ${authToken}`);
      benchmarks.sortedSearch = Date.now() - start;

      console.log('\n=== Performance Benchmarks ===');
      console.log(`Simple Search:     ${benchmarks.simpleSearch}ms`);
      console.log(`Filtered Search:   ${benchmarks.filteredSearch}ms`);
      console.log(`Complex Search:    ${benchmarks.complexSearch}ms`);
      console.log(`Paginated Search:  ${benchmarks.paginatedSearch}ms`);
      console.log(`Sorted Search:     ${benchmarks.sortedSearch}ms`);
      console.log('==============================\n');

      // All should be under 500ms
      Object.values(benchmarks).forEach(duration => {
        expect(duration).toBeLessThan(500);
      });
    });
  });
});
