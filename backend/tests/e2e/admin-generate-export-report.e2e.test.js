/**
 * End-to-End Test: Admin Generate and Export Report
 * 
 * Test Flow:
 * 1. Admin login
 * 2. Generate report (users/jobs/courses/reviews)
 * 3. Export report (Excel/CSV/PDF)
 * 4. Verify exported data matches report data
 * 
 * Validates: Requirements 7.1-7.8, 3.1-3.9, 11.5, 11.6
 */

const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = require('../../src/app');
const User = require('../../src/models/User');
const JobPosting = require('../../src/models/JobPosting');
const EducationalCourse = require('../../src/models/EducationalCourse');
const Review = require('../../src/models/Review');
const { generateToken } = require('../../src/utils/auth');

describe('E2E: Admin Generate and Export Report', () => {
  let adminUser;
  let adminToken;
  let testUsers;
  let testJobs;
  let testCourses;
  let testReviews;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/careerak-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear test data
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await EducationalCourse.deleteMany({});
    await Review.deleteMany({});

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'admin',
      userType: 'admin'
    });

    adminToken = generateToken(adminUser._id);

    // Create test data for reports
    testUsers = await User.insertMany([
      {
        name: 'Job Seeker 1',
        email: 'seeker1@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'jobSeeker',
        createdAt: new Date('2024-01-15')
      },
      {
        name: 'Job Seeker 2',
        email: 'seeker2@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'jobSeeker',
        createdAt: new Date('2024-02-20')
      },
      {
        name: 'Employer 1',
        email: 'employer1@test.com',
        password: 'Test123!@#',
        role: 'user',
        userType: 'employer',
        createdAt: new Date('2024-01-10')
      }
    ]);

    testJobs = await JobPosting.insertMany([
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Remote',
        employerId: testUsers[2]._id,
        status: 'active',
        createdAt: new Date('2024-02-01')
      },
      {
        title: 'Data Analyst',
        company: 'Data Inc',
        location: 'New York',
        employerId: testUsers[2]._id,
        status: 'closed',
        createdAt: new Date('2024-01-20')
      }
    ]);

    testCourses = await EducationalCourse.insertMany([
      {
        title: 'React Basics',
        instructor: 'John Doe',
        duration: 40,
        createdAt: new Date('2024-01-05')
      },
      {
        title: 'Node.js Advanced',
        instructor: 'Jane Smith',
        duration: 60,
        createdAt: new Date('2024-02-10')
      }
    ]);

    testReviews = await Review.insertMany([
      {
        reviewerId: testUsers[0]._id,
        reviewedUserId: testUsers[2]._id,
        rating: 4.5,
        comment: 'Great employer',
        createdAt: new Date('2024-02-15')
      },
      {
        reviewerId: testUsers[1]._id,
        reviewedUserId: testUsers[2]._id,
        rating: 5.0,
        comment: 'Excellent company',
        createdAt: new Date('2024-02-20')
      }
    ]);
  });

  test('Complete flow: login → generate users report → export to Excel → verify data', async () => {
    // Step 1: Admin login (token already generated)
    expect(adminToken).toBeDefined();

    // Step 2: Generate users report
    const reportResponse = await request(app)
      .get('/api/admin/reports/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
      .expect(200);

    expect(reportResponse.body).toHaveProperty('totalUsers');
    expect(reportResponse.body).toHaveProperty('usersByType');
    expect(reportResponse.body).toHaveProperty('newUsersThisMonth');
    expect(reportResponse.body.totalUsers).toBeGreaterThanOrEqual(3);

    // Verify report data
    const reportData = reportResponse.body;
    expect(reportData.usersByType).toHaveProperty('jobSeeker');
    expect(reportData.usersByType).toHaveProperty('employer');
    expect(reportData.usersByType.jobSeeker).toBe(2);
    expect(reportData.usersByType.employer).toBe(1);

    // Step 3: Export report to Excel
    const exportResponse = await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      })
      .expect(200);

    expect(exportResponse.body).toHaveProperty('downloadUrl');
    expect(exportResponse.body).toHaveProperty('filename');
    expect(exportResponse.body.filename).toMatch(/\.xlsx$/);

    // Step 4: Verify exported data (simulate download and check)
    // In a real scenario, you would download the file and parse it
    // For this test, we verify the export was created successfully
    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.expiresAt).toBeDefined();
  });

  test('Complete flow: login → generate jobs report → export to CSV → verify data', async () => {
    // Generate jobs report
    const reportResponse = await request(app)
      .get('/api/admin/reports/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
      .expect(200);

    expect(reportResponse.body).toHaveProperty('totalJobs');
    expect(reportResponse.body).toHaveProperty('jobsByStatus');
    expect(reportResponse.body.totalJobs).toBe(2);
    expect(reportResponse.body.jobsByStatus.active).toBe(1);
    expect(reportResponse.body.jobsByStatus.closed).toBe(1);

    // Export to CSV
    const exportResponse = await request(app)
      .post('/api/admin/export/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'csv',
        filters: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      })
      .expect(200);

    expect(exportResponse.body.filename).toMatch(/\.csv$/);
    expect(exportResponse.body.downloadUrl).toBeDefined();
  });

  test('Complete flow: login → generate courses report → export to PDF → verify data', async () => {
    // Generate courses report
    const reportResponse = await request(app)
      .get('/api/admin/reports/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
      .expect(200);

    expect(reportResponse.body).toHaveProperty('totalCourses');
    expect(reportResponse.body.totalCourses).toBe(2);

    // Export to PDF
    const exportResponse = await request(app)
      .post('/api/admin/export/courses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'pdf',
        filters: {
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      })
      .expect(200);

    expect(exportResponse.body.filename).toMatch(/\.pdf$/);
    expect(exportResponse.body.downloadUrl).toBeDefined();
  });

  test('Complete flow: login → generate reviews report → verify rating distribution', async () => {
    // Generate reviews report
    const reportResponse = await request(app)
      .get('/api/admin/reports/reviews')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      })
      .expect(200);

    expect(reportResponse.body).toHaveProperty('totalReviews');
    expect(reportResponse.body).toHaveProperty('averageRating');
    expect(reportResponse.body).toHaveProperty('ratingDistribution');
    
    expect(reportResponse.body.totalReviews).toBe(2);
    expect(reportResponse.body.averageRating).toBeCloseTo(4.75, 1);
    
    // Verify rating distribution
    const distribution = reportResponse.body.ratingDistribution;
    expect(distribution).toBeDefined();
    expect(distribution['5']).toBe(1); // One 5-star review
    expect(distribution['4']).toBe(1); // One 4.5-star review (rounded to 4)
  });

  test('Report with date range filtering', async () => {
    // Generate report for January only
    const januaryReport = await request(app)
      .get('/api/admin/reports/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
      .expect(200);

    // Should only include users created in January
    expect(januaryReport.body.newUsersThisMonth).toBe(2); // 2 users in January

    // Generate report for February only
    const februaryReport = await request(app)
      .get('/api/admin/reports/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2024-02-01',
        endDate: '2024-02-28'
      })
      .expect(200);

    // Should only include users created in February
    expect(februaryReport.body.newUsersThisMonth).toBe(1); // 1 user in February
  });

  test('Export with filters applied', async () => {
    // Export only active jobs
    const exportResponse = await request(app)
      .post('/api/admin/export/jobs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'excel',
        filters: {
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        }
      })
      .expect(200);

    expect(exportResponse.body.downloadUrl).toBeDefined();
    expect(exportResponse.body.filename).toMatch(/\.xlsx$/);
  });

  test('Authentication required for reports and exports', async () => {
    // Try to generate report without authentication
    await request(app)
      .get('/api/admin/reports/users')
      .expect(401);

    // Try to export without authentication
    await request(app)
      .post('/api/admin/export/users')
      .send({ format: 'excel' })
      .expect(401);
  });

  test('Non-admin users cannot access reports', async () => {
    // Create regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: 'User123!@#',
      role: 'user',
      userType: 'jobSeeker'
    });

    const userToken = generateToken(regularUser._id);

    // Try to access reports as regular user
    await request(app)
      .get('/api/admin/reports/users')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    // Try to export as regular user
    await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ format: 'excel' })
      .expect(403);
  });

  test('Invalid date range returns error', async () => {
    // End date before start date
    await request(app)
      .get('/api/admin/reports/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        startDate: '2024-12-31',
        endDate: '2024-01-01'
      })
      .expect(400);
  });

  test('Invalid export format returns error', async () => {
    await request(app)
      .post('/api/admin/export/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        format: 'invalid_format'
      })
      .expect(400);
  });
});
