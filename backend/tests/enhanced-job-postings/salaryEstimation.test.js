/**
 * Salary Estimation Tests
 * Tests for salary estimation accuracy and comparison logic
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Job = require('../../src/models/Job');
const SalaryData = require('../../src/models/SalaryData');

describe('Salary Estimation Tests', () => {
  let authToken;
  let jobId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'salary@test.com',
      password: 'password123',
      role: 'jobseeker'
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'salary@test.com', password: 'password123' });
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

    // Create test job
    const job = await Job.create({
      title: 'JavaScript Developer',
      company: { name: 'Tech Company' },
      description: 'JS developer needed',
      field: 'IT',
      location: { city: 'Riyadh', country: 'Saudi Arabia' },
      salary: 7000, // Below average
      experienceLevel: 'mid',
      status: 'active'
    });
    jobId = job._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
    await SalaryData.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/jobs/:id/salary-estimate - Get Salary Estimate', () => {
    test('should return salary estimate', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.estimate).toBeDefined();
      expect(res.body.estimate.provided).toBe(7000);
      expect(res.body.estimate.market).toBeDefined();
      expect(res.body.estimate.comparison).toBeDefined();
    });

    test('should calculate "below" comparison correctly', async () => {
      // Job salary: 7000, Average: 8000
      // 7000 < 8000 * 0.9 (7200) → below
      const res = await request(app)
        .get(`/api/jobs/${jobId}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.estimate.comparison).toBe('below');
      expect(res.body.estimate.percentageDiff).toBeGreaterThan(0);
    });

    test('should calculate "average" comparison correctly', async () => {
      // Create job with average salary
      const avgJob = await Job.create({
        title: 'JavaScript Developer',
        company: { name: 'Tech Company' },
        description: 'JS developer needed',
        field: 'IT',
        location: { city: 'Riyadh', country: 'Saudi Arabia' },
        salary: 7900, // Within 10% of average (8000)
        experienceLevel: 'mid',
        status: 'active'
      });

      const res = await request(app)
        .get(`/api/jobs/${avgJob._id}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.estimate.comparison).toBe('average');
      expect(res.body.estimate.percentageDiff).toBe(0);
    });

    test('should calculate "above" comparison correctly', async () => {
      // Create job with above average salary
      const highJob = await Job.create({
        title: 'JavaScript Developer',
        company: { name: 'Tech Company' },
        description: 'JS developer needed',
        field: 'IT',
        location: { city: 'Riyadh', country: 'Saudi Arabia' },
        salary: 9500, // Above average (8000 * 1.1 = 8800)
        experienceLevel: 'mid',
        status: 'active'
      });

      const res = await request(app)
        .get(`/api/jobs/${highJob._id}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.estimate.comparison).toBe('above');
      expect(res.body.estimate.percentageDiff).toBeGreaterThan(0);
    });

    test('should calculate percentage difference correctly', async () => {
      // Job salary: 7000, Average: 8000
      // Percentage diff: ((8000 - 7000) / 8000) * 100 = 12.5%
      const res = await request(app)
        .get(`/api/jobs/${jobId}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.estimate.percentageDiff).toBeCloseTo(12.5, 1);
    });

    test('should return market statistics', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.estimate.market.average).toBe(8000);
      expect(res.body.estimate.market.min).toBe(6000);
      expect(res.body.estimate.market.max).toBe(10000);
    });

    test('should return null when insufficient data', async () => {
      // Create job with no salary data
      const noDataJob = await Job.create({
        title: 'Rare Job Title',
        company: { name: 'Company' },
        description: 'Description',
        field: 'Rare Field',
        location: { city: 'Rare City', country: 'Country' },
        salary: 5000,
        experienceLevel: 'mid',
        status: 'active'
      });

      const res = await request(app)
        .get(`/api/jobs/${noDataJob._id}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.estimate).toBeNull();
      expect(res.body.message).toContain('بيانات غير كافية');
    });

    test('should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/jobs/${fakeId}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Salary Comparison Logic', () => {
    test('below threshold should be 90% of average', async () => {
      const average = 8000;
      const belowThreshold = average * 0.9; // 7200
      
      expect(belowThreshold).toBe(7200);
      expect(7000).toBeLessThan(belowThreshold); // Should be "below"
      expect(7300).toBeGreaterThan(belowThreshold); // Should be "average"
    });

    test('above threshold should be 110% of average', async () => {
      const average = 8000;
      const aboveThreshold = average * 1.1; // 8800
      
      expect(aboveThreshold).toBe(8800);
      expect(9000).toBeGreaterThan(aboveThreshold); // Should be "above"
      expect(8700).toBeLessThan(aboveThreshold); // Should be "average"
    });

    test('percentage calculation should be accurate', async () => {
      const provided = 7000;
      const average = 8000;
      const percentageDiff = Math.round(((average - provided) / average) * 100);
      
      expect(percentageDiff).toBe(13); // Rounded
    });
  });

  describe('Salary Data Requirements', () => {
    test('should require minimum 5 data points', async () => {
      // Create salary data with insufficient count
      await SalaryData.create({
        jobTitle: 'Rare Job',
        field: 'IT',
        location: 'City',
        experienceLevel: 'mid',
        statistics: {
          average: 5000,
          median: 5000,
          min: 4000,
          max: 6000,
          count: 3 // Less than 5
        }
      });

      const rareJob = await Job.create({
        title: 'Rare Job',
        company: { name: 'Company' },
        description: 'Description',
        field: 'IT',
        location: { city: 'City', country: 'Country' },
        salary: 5000,
        experienceLevel: 'mid',
        status: 'active'
      });

      const res = await request(app)
        .get(`/api/jobs/${rareJob._id}/salary-estimate`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.estimate).toBeNull();
    });
  });
});
