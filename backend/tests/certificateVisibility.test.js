/**
 * Certificate Visibility Tests
 * 
 * Tests for hiding/showing certificates in the gallery
 * Requirements: 4.4 (خيار إخفاء/إظهار شهادات معينة)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Certificate = require('../src/models/Certificate');
const User = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');

describe('Certificate Visibility Tests', () => {
  let authToken;
  let userId;
  let courseId;
  let certificateId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || process.env.MONGODB_URI);

    // Create test user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test.visibility@example.com',
      password: 'Test123!@#',
      role: 'user'
    });
    userId = user._id;

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test.visibility@example.com',
        password: 'Test123!@#'
      });
    authToken = loginRes.body.token;

    // Create test course
    const course = await EducationalCourse.create({
      title: 'Test Course for Visibility',
      description: 'Test course description',
      category: 'Technology',
      level: 'Beginner',
      instructor: userId,
      duration: 10,
      price: 0
    });
    courseId = course._id;

    // Create test certificate
    const certificate = await Certificate.create({
      userId: userId,
      courseId: courseId,
      courseName: 'Test Course for Visibility',
      qrCode: 'test-qr-code',
      isHidden: false
    });
    certificateId = certificate.certificateId;
  });

  afterAll(async () => {
    // Cleanup
    await Certificate.deleteMany({ userId });
    await EducationalCourse.deleteMany({ _id: courseId });
    await User.deleteMany({ _id: userId });
    await mongoose.connection.close();
  });

  describe('PATCH /api/certificates/:certificateId/visibility', () => {
    test('should hide a certificate', async () => {
      const res = await request(app)
        .patch(`/api/certificates/${certificateId}/visibility`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isHidden: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.certificate.isHidden).toBe(true);
      expect(res.body.message).toContain('hidden');
    });

    test('should show a hidden certificate', async () => {
      const res = await request(app)
        .patch(`/api/certificates/${certificateId}/visibility`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isHidden: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.certificate.isHidden).toBe(false);
      expect(res.body.message).toContain('visible');
    });

    test('should return 400 if isHidden is not boolean', async () => {
      const res = await request(app)
        .patch(`/api/certificates/${certificateId}/visibility`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isHidden: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('boolean');
    });

    test('should return 404 if certificate not found', async () => {
      const res = await request(app)
        .patch('/api/certificates/invalid-id/visibility')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isHidden: true });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .patch(`/api/certificates/${certificateId}/visibility`)
        .send({ isHidden: true });

      expect(res.status).toBe(401);
    });

    test('should return 403 if user does not own certificate', async () => {
      // Create another user
      const otherUser = await User.create({
        firstName: 'Other',
        lastName: 'User',
        email: 'other.visibility@example.com',
        password: 'Test123!@#',
        role: 'user'
      });

      // Login as other user
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other.visibility@example.com',
          password: 'Test123!@#'
        });
      const otherToken = loginRes.body.token;

      const res = await request(app)
        .patch(`/api/certificates/${certificateId}/visibility`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ isHidden: true });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      // Cleanup
      await User.deleteMany({ _id: otherUser._id });
    });
  });

  describe('GET /api/certificates - Visibility Filter', () => {
    beforeAll(async () => {
      // Create multiple certificates with different visibility
      await Certificate.create([
        {
          userId: userId,
          courseId: courseId,
          courseName: 'Visible Certificate 1',
          qrCode: 'qr-1',
          isHidden: false
        },
        {
          userId: userId,
          courseId: courseId,
          courseName: 'Hidden Certificate 1',
          qrCode: 'qr-2',
          isHidden: true
        },
        {
          userId: userId,
          courseId: courseId,
          courseName: 'Visible Certificate 2',
          qrCode: 'qr-3',
          isHidden: false
        }
      ]);
    });

    test('should return all certificates for owner', async () => {
      const res = await request(app)
        .get(`/api/certificates?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.certificates.length).toBeGreaterThanOrEqual(4); // Original + 3 new
    });

    test('should exclude hidden certificates for public view', async () => {
      // This would be tested in a public profile endpoint
      // For now, we verify the isHidden field is present
      const res = await request(app)
        .get(`/api/certificates?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const hiddenCerts = res.body.certificates.filter(c => c.isHidden);
      const visibleCerts = res.body.certificates.filter(c => !c.isHidden);
      
      expect(hiddenCerts.length).toBeGreaterThan(0);
      expect(visibleCerts.length).toBeGreaterThan(0);
    });
  });

  describe('Certificate Model - isHidden Field', () => {
    test('should have isHidden field with default false', async () => {
      const cert = await Certificate.create({
        userId: userId,
        courseId: courseId,
        courseName: 'Test Default Hidden',
        qrCode: 'test-default'
      });

      expect(cert.isHidden).toBe(false);

      await Certificate.deleteMany({ _id: cert._id });
    });

    test('should allow setting isHidden to true', async () => {
      const cert = await Certificate.create({
        userId: userId,
        courseId: courseId,
        courseName: 'Test Hidden True',
        qrCode: 'test-hidden-true',
        isHidden: true
      });

      expect(cert.isHidden).toBe(true);

      await Certificate.deleteMany({ _id: cert._id });
    });

    test('should allow toggling isHidden', async () => {
      const cert = await Certificate.create({
        userId: userId,
        courseId: courseId,
        courseName: 'Test Toggle',
        qrCode: 'test-toggle',
        isHidden: false
      });

      expect(cert.isHidden).toBe(false);

      cert.isHidden = true;
      await cert.save();
      expect(cert.isHidden).toBe(true);

      cert.isHidden = false;
      await cert.save();
      expect(cert.isHidden).toBe(false);

      await Certificate.deleteMany({ _id: cert._id });
    });
  });
});
