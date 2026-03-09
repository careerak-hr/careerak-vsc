const mongoose = require('mongoose');
const Certificate = require('../src/models/Certificate');
const CourseEnrollment = require('../src/models/CourseEnrollment');
const EducationalCourse = require('../src/models/EducationalCourse');
const { User } = require('../src/models/User');
const certificateService = require('../src/services/certificateService');

// Mock environment variables
process.env.FRONTEND_URL = 'https://careerak.com';

describe('Certificate Auto-Issuance Tests', () => {
  let testUser;
  let testCourse;
  let testEnrollment;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak-test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  beforeEach(async () => {
    // Clean up collections
    await Certificate.deleteMany({});
    await CourseEnrollment.deleteMany({});
    await EducationalCourse.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'Test123456',
      role: 'Employee',
      phone: '+201234567890',
      country: 'Egypt',
      firstName: 'Test',
      lastName: 'User'
    });

    // Create test course
    testCourse = await EducationalCourse.create({
      title: 'Test Course',
      description: 'Test course description',
      instructor: testUser._id,
      category: 'Technology',
      level: 'Beginner',
      status: 'Published',
      totalLessons: 10,
      settings: {
        certificateEnabled: true
      }
    });

    // Create test enrollment
    testEnrollment = await CourseEnrollment.create({
      course: testCourse._id,
      student: testUser._id,
      status: 'active',
      progress: {
        completedLessons: [],
        percentageComplete: 0
      }
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await Certificate.deleteMany({});
    await CourseEnrollment.deleteMany({});
    await EducationalCourse.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('1. Certificate Model', () => {
    test('should create certificate with unique ID', async () => {
      const certificate = new Certificate({
        userId: testUser._id,
        courseId: testCourse._id,
        courseName: testCourse.title,
        qrCode: 'test-qr-code'
      });

      await certificate.save();

      expect(certificate.certificateId).toBeDefined();
      expect(certificate.certificateId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    test('should generate verification URL automatically', async () => {
      const certificate = new Certificate({
        userId: testUser._id,
        courseId: testCourse._id,
        courseName: testCourse.title,
        qrCode: 'test-qr-code'
      });

      await certificate.save();

      expect(certificate.verificationUrl).toBeDefined();
      expect(certificate.verificationUrl).toContain('/verify/');
      expect(certificate.verificationUrl).toContain(certificate.certificateId);
    });

    test('should prevent duplicate certificates for same user and course', async () => {
      const certificate1 = new Certificate({
        userId: testUser._id,
        courseId: testCourse._id,
        courseName: testCourse.title,
        qrCode: 'test-qr-code-1'
      });

      await certificate1.save();

      const certificate2 = new Certificate({
        userId: testUser._id,
        courseId: testCourse._id,
        courseName: testCourse.title,
        qrCode: 'test-qr-code-2'
      });

      await expect(certificate2.save()).rejects.toThrow();
    });

    test('should validate certificate correctly', async () => {
      const certificate = new Certificate({
        userId: testUser._id,
        courseId: testCourse._id,
        courseName: testCourse.title,
        qrCode: 'test-qr-code',
        status: 'active'
      });

      await certificate.save();

      expect(certificate.isValid()).toBe(true);
    });

    test('should invalidate revoked certificate', async () => {
      const certificate = new Certificate({
        userId: testUser._id,
        courseId: testCourse._id,
        courseName: testCourse.title,
        qrCode: 'test-qr-code',
        status: 'revoked'
      });

      await certificate.save();

      expect(certificate.isValid()).toBe(false);
    });
  });

  describe('2. Certificate Service', () => {
    test('should generate QR code', async () => {
      const verificationUrl = 'https://careerak.com/verify/test-123';
      const qrCode = await certificateService.generateQRCode(verificationUrl);

      expect(qrCode).toBeDefined();
      expect(qrCode).toContain('data:image/png;base64');
    });

    test('should issue certificate when course is 100% complete', async () => {
      // Update enrollment to 100% complete
      testEnrollment.progress.percentageComplete = 100;
      testEnrollment.status = 'completed';
      testEnrollment.completedAt = new Date();
      await testEnrollment.save();

      // Issue certificate
      const certificate = await certificateService.issueCertificate(testUser._id, testCourse._id);

      expect(certificate).toBeDefined();
      expect(certificate.userId.toString()).toBe(testUser._id.toString());
      expect(certificate.courseId.toString()).toBe(testCourse._id.toString());
      expect(certificate.courseName).toBe(testCourse.title);
      expect(certificate.qrCode).toBeDefined();
      expect(certificate.verificationUrl).toBeDefined();
      expect(certificate.status).toBe('active');
    });

    test('should fail to issue certificate if course not 100% complete', async () => {
      // Enrollment is only 50% complete
      testEnrollment.progress.percentageComplete = 50;
      await testEnrollment.save();

      await expect(
        certificateService.issueCertificate(testUser._id, testCourse._id)
      ).rejects.toThrow('Course not completed');
    });

    test('should fail to issue duplicate certificate', async () => {
      // Complete the course
      testEnrollment.progress.percentageComplete = 100;
      testEnrollment.status = 'completed';
      await testEnrollment.save();

      // Issue first certificate
      await certificateService.issueCertificate(testUser._id, testCourse._id);

      // Try to issue second certificate
      await expect(
        certificateService.issueCertificate(testUser._id, testCourse._id)
      ).rejects.toThrow('Certificate already issued');
    });

    test('should verify valid certificate', async () => {
      // Complete course and issue certificate
      testEnrollment.progress.percentageComplete = 100;
      testEnrollment.status = 'completed';
      await testEnrollment.save();

      const certificate = await certificateService.issueCertificate(testUser._id, testCourse._id);

      // Verify certificate
      const result = await certificateService.verifyCertificate(certificate.certificateId);

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Certificate is valid');
      expect(result.certificate).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.course).toBeDefined();
    });

    test('should fail to verify non-existent certificate', async () => {
      const result = await certificateService.verifyCertificate('non-existent-id');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Certificate not found');
    });
  });

  describe('3. Auto-Issuance on Course Completion', () => {
    test('should trigger certificate issuance when enrollment reaches 100%', async (done) => {
      // Mock the certificate service to track if it was called
      const originalIssueCertificate = certificateService.issueCertificate;
      let certificateIssued = false;

      certificateService.issueCertificate = jest.fn(async (userId, courseId) => {
        certificateIssued = true;
        return originalIssueCertificate.call(certificateService, userId, courseId);
      });

      // Update enrollment to 100%
      testEnrollment.progress.completedLessons = Array(10).fill(new mongoose.Types.ObjectId());
      await testEnrollment.save();

      // Wait for async certificate issuance
      setTimeout(async () => {
        // Check if certificate was issued
        const certificate = await Certificate.findOne({
          userId: testUser._id,
          courseId: testCourse._id
        });

        expect(certificate).toBeDefined();
        expect(certificate.status).toBe('active');

        // Restore original function
        certificateService.issueCertificate = originalIssueCertificate;

        done();
      }, 2000); // Wait 2 seconds for async operation
    }, 5000); // Test timeout 5 seconds
  });

  describe('4. Certificate Operations', () => {
    let issuedCertificate;

    beforeEach(async () => {
      // Issue a certificate for testing
      testEnrollment.progress.percentageComplete = 100;
      testEnrollment.status = 'completed';
      await testEnrollment.save();

      issuedCertificate = await certificateService.issueCertificate(testUser._id, testCourse._id);
    });

    test('should revoke certificate', async () => {
      const revokedCertificate = await certificateService.revokeCertificate(
        issuedCertificate.certificateId,
        testUser._id,
        'Test revocation'
      );

      expect(revokedCertificate.status).toBe('revoked');
      expect(revokedCertificate.revocation.reason).toBe('Test revocation');
      expect(revokedCertificate.isValid()).toBe(false);
    });

    test('should reissue certificate', async () => {
      const reissuedCertificate = await certificateService.reissueCertificate(
        issuedCertificate.certificateId,
        testUser._id,
        'Test reissue'
      );

      expect(reissuedCertificate).toBeDefined();
      expect(reissuedCertificate.certificateId).not.toBe(issuedCertificate.certificateId);
      expect(reissuedCertificate.reissue.isReissued).toBe(true);
      expect(reissuedCertificate.reissue.originalCertificateId).toBe(issuedCertificate.certificateId);

      // Original certificate should be revoked
      const originalCertificate = await Certificate.findOne({ certificateId: issuedCertificate.certificateId });
      expect(originalCertificate.status).toBe('revoked');
    });

    test('should mark certificate as shared on LinkedIn', async () => {
      const updatedCertificate = await certificateService.markAsSharedOnLinkedIn(issuedCertificate.certificateId);

      expect(updatedCertificate.linkedInShared).toBe(true);
      expect(updatedCertificate.linkedInSharedAt).toBeDefined();
    });
  });
});
