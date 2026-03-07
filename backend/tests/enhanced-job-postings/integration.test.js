/**
 * Integration Tests
 * End-to-end tests for enhanced job postings features
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Job = require('../../src/models/Job');
const JobBookmark = require('../../src/models/JobBookmark');
const JobShare = require('../../src/models/JobShare');
const SalaryData = require('../../src/models/SalaryData');

describe('Enhanced Job Postings - Integration Tests', () => {
  let authToken;
  let userId;
  let jobId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      name: 'Integration Test User',
      email: 'integration@test.com',
      password: 'password123',
      role: 'jobseeker',
      skills: ['JavaScript', 'React', 'Node.js'],
      field: 'IT'
    });
    userId = user._id;

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'integration@test.com', password: 'password123' });
    authToken = loginRes.body.token;

    // Create salary data
    await SalaryData.create({
      jobTitle: 'JavaScript Developer',
      field: 'IT',
      location: 'Riyadh',
      experienceLevel: 'mid',
      statistics: {
        average: 8000,
        median: 7800,
        min: 6000,
        max: 10000,
        count: 50
      }
    });

    // Create test jobs
    const job = await Job.create({
      title: 'JavaScript Developer',
      company: { name: 'Tech Company' },
      description: 'Looking for JS developer',
      field: 'IT',
      location: { city: 'Riyadh', country: 'Saudi Arabia' },
      salary: 7500,
      requiredSkills: ['JavaScript', 'React'],
      experienceLevel: 'mid',
      status: 'active'
    });
    jobId = job._id;

    // Create similar jobs
    await Job.create({
      title: 'React Developer',
      company: { name: 'Tech Company 2' },
      description: 'React developer needed',
      field: 'IT',
      location: { city: 'Riyadh', country: 'Saudi Arabia' },
      salary: 7000,
      requiredSkills: ['React', 'JavaScript'],
      experienceLevel: 'mid',
      status: 'active'
    });

    await Job.create({
      title: 'Frontend Developer',
      company: { name: 'Tech Company 3' },
      description: 'Frontend developer',
      field: 'IT',
      location: { city: 'Jeddah', country: 'Saudi Arabia' },
      salary: 6500,
      requiredSkills: ['JavaScript', 'CSS', 'HTML'],
      experienceLevel: 'mid',
      status: 'active'
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
    await JobBookmark.deleteMany({});
    await JobShare.deleteMany({});
    await SalaryData.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Complete User Journey', () => {
    test('User browses jobs, bookmarks, shares, and views similar jobs', async () => {
      // 1. Browse jobs
      const browseRes = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(browseRes.status).toBe(200);
      expect(browseRes.body.jobs.length).toBeGreaterThan(0);

      // 2. View job details
      const detailsRes = await request(app)
        .get(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(detailsRes.status).toBe(200);
      expect(detailsRes.body.job._id).toBe(jobId.toString());

      // 3. Get salary estimate
      const salaryRes = await request(app)
        .get(`/api/jobs/${jobId}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(salaryRes.status).toBe(200);
      expect(salaryRes.body.estimate).toBeDefined();
      expect(salaryRes.body.estimate.comparison).toBeDefined();

      // 4. Bookmark the job
      const bookmarkRes = await request(app)
        .post(`/api/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(bookmarkRes.status).toBe(200);
      expect(bookmarkRes.body.bookmarked).toBe(true);

      // 5. Share the job
      const shareRes = await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'whatsapp' });
      
      expect(shareRes.status).toBe(200);

      // 6. View similar jobs
      const similarRes = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(similarRes.status).toBe(200);
      expect(similarRes.body.similar.length).toBeGreaterThan(0);

      // 7. View bookmarked jobs
      const bookmarkedRes = await request(app)
        .get('/api/jobs/bookmarked')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(bookmarkedRes.status).toBe(200);
      expect(bookmarkedRes.body.jobs.length).toBe(1);
      expect(bookmarkedRes.body.jobs[0]._id).toBe(jobId.toString());
    });
  });

  describe('Data Consistency', () => {
    test('bookmark and share counts should be accurate', async () => {
      // Clear previous data
      await JobBookmark.deleteMany({});
      await JobShare.deleteMany({});
      await Job.updateMany({}, { bookmarkCount: 0, shareCount: 0 });

      // Create 3 bookmarks
      await request(app)
        .post(`/api/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${authToken}`);

      const user2 = await User.create({
        name: 'User 2',
        email: 'user2@test.com',
        password: 'password123',
        role: 'jobseeker'
      });
      const login2 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user2@test.com', password: 'password123' });
      
      await request(app)
        .post(`/api/jobs/${jobId}/bookmark`)
        .set('Authorization', `Bearer ${login2.body.token}`);

      // Create 2 shares
      await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'whatsapp' });

      await request(app)
        .post(`/api/jobs/${jobId}/share`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ platform: 'linkedin' });

      // Verify counts
      const job = await Job.findById(jobId);
      const bookmarkCount = await JobBookmark.countDocuments({ jobId });
      const shareCount = await JobShare.countDocuments({ jobId });

      expect(job.bookmarkCount).toBe(bookmarkCount);
      expect(job.bookmarkCount).toBe(2);
      expect(job.shareCount).toBe(shareCount);
      expect(job.shareCount).toBe(2);
    });
  });

  describe('Similar Jobs Relevance', () => {
    test('similar jobs should be relevant and sorted by score', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.similar.length).toBeGreaterThan(0);

      // All should have score >= 40
      res.body.similar.forEach(job => {
        expect(job.similarityScore).toBeGreaterThanOrEqual(40);
      });

      // Should be sorted descending
      for (let i = 0; i < res.body.similar.length - 1; i++) {
        expect(res.body.similar[i].similarityScore)
          .toBeGreaterThanOrEqual(res.body.similar[i + 1].similarityScore);
      }

      // Should have common skills
      const referenceJob = await Job.findById(jobId);
      res.body.similar.forEach(job => {
        const commonSkills = job.requiredSkills.filter(skill =>
          referenceJob.requiredSkills.includes(skill)
        );
        expect(commonSkills.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Salary Estimation Accuracy', () => {
    test('salary comparison should be accurate', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      const { provided, market, comparison, percentageDiff } = res.body.estimate;

      // Verify comparison logic
      if (provided < market.average * 0.9) {
        expect(comparison).toBe('below');
        expect(percentageDiff).toBeGreaterThan(0);
      } else if (provided > market.average * 1.1) {
        expect(comparison).toBe('above');
        expect(percentageDiff).toBeGreaterThan(0);
      } else {
        expect(comparison).toBe('average');
        expect(percentageDiff).toBe(0);
      }

      // Verify percentage calculation
      if (comparison !== 'average') {
        const expectedDiff = Math.round(
          Math.abs((market.average - provided) / market.average) * 100
        );
        expect(percentageDiff).toBeCloseTo(expectedDiff, 0);
      }
    });
  });

  describe('Performance', () => {
    test('all endpoints should respond within 2 seconds', async () => {
      const endpoints = [
        { method: 'get', path: '/api/jobs' },
        { method: 'get', path: `/api/jobs/${jobId}` },
        { method: 'get', path: `/api/jobs/${jobId}/similar` },
        { method: 'get', path: `/api/jobs/${jobId}/salary-estimate` },
        { method: 'get', path: '/api/jobs/bookmarked' }
      ];

      for (const endpoint of endpoints) {
        const start = Date.now();
        
        await request(app)
          [endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${authToken}`);
        
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(2000);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid job IDs gracefully', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const endpoints = [
        `/api/jobs/${fakeId}`,
        `/api/jobs/${fakeId}/bookmark`,
        `/api/jobs/${fakeId}/share`,
        `/api/jobs/${fakeId}/similar`,
        `/api/jobs/${fakeId}/salary-estimate`
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.status).toBe(404);
      }
    });

    test('should require authentication', async () => {
      const endpoints = [
        { method: 'post', path: `/api/jobs/${jobId}/bookmark` },
        { method: 'post', path: `/api/jobs/${jobId}/share` },
        { method: 'get', path: '/api/jobs/bookmarked' }
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)
          [endpoint.method](endpoint.path);
        
        expect(res.status).toBe(401);
      }
    });
  });
});
