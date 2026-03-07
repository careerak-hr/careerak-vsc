/**
 * Similar Jobs Tests
 * Tests for similar jobs algorithm, relevance, and limit
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Job = require('../../src/models/Job');

describe('Similar Jobs Tests', () => {
  let authToken;
  let jobId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'similar@test.com',
      password: 'password123',
      role: 'jobseeker'
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'similar@test.com', password: 'password123' });
    authToken = loginRes.body.token;

    // Create reference job
    const job = await Job.create({
      title: 'Senior JavaScript Developer',
      company: { name: 'Tech Company' },
      description: 'Looking for experienced JS developer',
      field: 'IT',
      location: { city: 'Riyadh', country: 'Saudi Arabia' },
      salary: 8000,
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      status: 'active'
    });
    jobId = job._id;

    // Create similar jobs
    await Job.create({
      title: 'JavaScript Developer',
      company: { name: 'Tech Company 2' },
      description: 'JS developer needed',
      field: 'IT',
      location: { city: 'Riyadh', country: 'Saudi Arabia' },
      salary: 7500,
      requiredSkills: ['JavaScript', 'React'],
      status: 'active'
    });

    await Job.create({
      title: 'Frontend Developer',
      company: { name: 'Tech Company 3' },
      description: 'Frontend developer with React',
      field: 'IT',
      location: { city: 'Jeddah', country: 'Saudi Arabia' },
      salary: 7000,
      requiredSkills: ['React', 'CSS', 'HTML'],
      status: 'active'
    });

    await Job.create({
      title: 'Backend Developer',
      company: { name: 'Tech Company 4' },
      description: 'Backend developer with Node.js',
      field: 'IT',
      location: { city: 'Riyadh', country: 'Saudi Arabia' },
      salary: 8500,
      requiredSkills: ['Node.js', 'MongoDB', 'Express'],
      status: 'active'
    });

    // Create dissimilar job
    await Job.create({
      title: 'Marketing Manager',
      company: { name: 'Marketing Company' },
      description: 'Marketing manager needed',
      field: 'Marketing',
      location: { city: 'Dubai', country: 'UAE' },
      salary: 10000,
      requiredSkills: ['Marketing', 'Social Media'],
      status: 'active'
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Job.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/jobs/:id/similar - Get Similar Jobs', () => {
    test('should return similar jobs', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.similar).toBeDefined();
      expect(Array.isArray(res.body.similar)).toBe(true);
    });

    test('should limit results to 6 jobs', async () => {
      // Create more jobs
      for (let i = 0; i < 10; i++) {
        await Job.create({
          title: `Developer ${i}`,
          company: { name: `Company ${i}` },
          description: 'Developer needed',
          field: 'IT',
          location: { city: 'Riyadh', country: 'Saudi Arabia' },
          salary: 7000,
          requiredSkills: ['JavaScript'],
          status: 'active'
        });
      }

      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.similar.length).toBeLessThanOrEqual(6);
    });

    test('similar jobs should have relevance score >= 40%', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      res.body.similar.forEach(job => {
        expect(job.similarityScore).toBeGreaterThanOrEqual(40);
        expect(job.similarityScore).toBeLessThanOrEqual(100);
      });
    });

    test('should prioritize same field jobs', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      // Most similar jobs should be in IT field
      const itJobs = res.body.similar.filter(job => job.field === 'IT');
      expect(itJobs.length).toBeGreaterThan(0);
    });

    test('should prioritize jobs with common skills', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      // Check that similar jobs have at least one common skill
      const referenceJob = await Job.findById(jobId);
      res.body.similar.forEach(job => {
        const commonSkills = job.requiredSkills.filter(skill =>
          referenceJob.requiredSkills.includes(skill)
        );
        expect(commonSkills.length).toBeGreaterThan(0);
      });
    });

    test('should sort by similarity score descending', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      for (let i = 0; i < res.body.similar.length - 1; i++) {
        expect(res.body.similar[i].similarityScore)
          .toBeGreaterThanOrEqual(res.body.similar[i + 1].similarityScore);
      }
    });

    test('should exclude the reference job itself', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      const foundSelf = res.body.similar.find(job => job._id.toString() === jobId.toString());
      expect(foundSelf).toBeUndefined();
    });

    test('should only return active jobs', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      res.body.similar.forEach(job => {
        expect(job.status).toBe('active');
      });
    });

    test('should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/jobs/${fakeId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Similarity Algorithm', () => {
    test('should calculate similarity correctly', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      // Verify similarity scores are reasonable
      res.body.similar.forEach(job => {
        expect(job.similarityScore).toBeGreaterThanOrEqual(0);
        expect(job.similarityScore).toBeLessThanOrEqual(100);
        expect(Number.isInteger(job.similarityScore)).toBe(true);
      });
    });

    test('should consider location in similarity', async () => {
      const res = await request(app)
        .get(`/api/jobs/${jobId}/similar`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      // Jobs in same city should have higher scores
      const sameCity = res.body.similar.filter(job => job.location.city === 'Riyadh');
      const differentCity = res.body.similar.filter(job => job.location.city !== 'Riyadh');
      
      if (sameCity.length > 0 && differentCity.length > 0) {
        const avgSameCity = sameCity.reduce((sum, job) => sum + job.similarityScore, 0) / sameCity.length;
        const avgDifferentCity = differentCity.reduce((sum, job) => sum + job.similarityScore, 0) / differentCity.length;
        expect(avgSameCity).toBeGreaterThanOrEqual(avgDifferentCity);
      }
    });
  });
});
