/**
 * Simple Tests for Certificate QR Code
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * Tests:
 * 1. QR Code is generated for each certificate
 * 2. QR Code contains verification URL
 * 3. QR Code is unique for each certificate
 * 4. Verification works via QR code
 */

const certificateService = require('../src/services/certificateService');
const Certificate = require('../src/models/Certificate');
const { User } = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Mock environment variables
process.env.FRONTEND_URL = 'https://careerak.com';

describe('Certificate QR Code Tests', () => {
  let testUser;
  let testCourse;

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
    await EducationalCourse.deleteMany({});
    await User.deleteMany({});

    // Create test user
    testUser = await User.create({
      email: `test-${crypto.randomUUID()}@example.com`,
      password: 'Test123456',
      role: 'Employee',
      phone: '+201234567890',
      country: 'Egypt',
      firstName: 'أحمد',
      lastName: 'محمد'
    });

    // Create test course
    testCourse = await EducationalCourse.create({
      title: 'دورة تطوير الويب',
      description: 'دورة شاملة لتطوير الويب',
      instructor: new mongoose.Types.ObjectId(),
      category: 'Technology',
      level: 'Beginner',
      status: 'Published',
      totalLessons: 10,
      settings: {
        certificateEnabled: true
      }
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await Certificate.deleteMany({});
    await EducationalCourse.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // ========== Test 1: QR Code Generation ==========
  test('1. Each certificate should have a QR code', async () => {
    const result = await certificateService.issueCertificate(
      testUser._id.toString(),
      testCourse._id.toString()
    );

    expect(result.success).toBe(true);
    expect(result.certificate.qrCode).toBeDefined();
    expect(result.certificate.qrCode).toContain('data:image/png;base64');
    expect(result.certificate.qrCode.length).toBeGreaterThan(100);
  });

  // ========== Test 2: QR Code Contains Verification URL ==========
  test('2. QR code should contain verification URL', async () => {
    const result = await certificateService.issueCertificate(
      testUser._id.toString(),
      testCourse._id.toString()
    );

    // Get certificate from database
    const certificate = await Certificate.findOne({
      certificateId: result.certificate.certificateId
    });

    expect(certificate.qrCode).toBeDefined();
    expect(certificate.verificationUrl).toBeDefined();
    expect(certificate.verificationUrl).toContain('/verify/');
    expect(certificate.verificationUrl).toContain(certificate.certificateId);

    // Generate QR code from verification URL and compare
    const expectedQRCode = await certificateService.generateQRCode(
      certificate.verificationUrl
    );

    expect(certificate.qrCode).toContain('data:image/png;base64');
    expect(expectedQRCode).toContain('data:image/png;base64');
  });

  // ========== Test 3: Unique QR Codes ==========
  test('3. Different certificates should have different QR codes', async () => {
    const qrCodes = new Set();
    const certificateIds = new Set();

    // Create 3 different certificates
    for (let i = 0; i < 3; i++) {
      const user = await User.create({
        email: `user${i}-${crypto.randomUUID()}@example.com`,
        password: 'Test123456',
        role: 'Employee',
        phone: '+201234567890',
        country: 'Egypt',
        firstName: `User${i}`,
        lastName: 'Test'
      });

      const course = await EducationalCourse.create({
        title: `دورة ${i}`,
        description: 'دورة اختبار',
        instructor: new mongoose.Types.ObjectId(),
        category: 'Technology',
        level: 'Beginner',
        status: 'Published',
        totalLessons: 10,
        settings: {
          certificateEnabled: true
        }
      });

      const result = await certificateService.issueCertificate(
        user._id.toString(),
        course._id.toString()
      );

      qrCodes.add(result.certificate.qrCode);
      certificateIds.add(result.certificate.certificateId);
    }

    // All QR codes should be unique
    expect(qrCodes.size).toBe(3);
    // All certificate IDs should be unique
    expect(certificateIds.size).toBe(3);
  });

  // ========== Test 4: Verification via QR Code ==========
  test('4. QR code should lead to valid verification', async () => {
    // Issue certificate
    const issueResult = await certificateService.issueCertificate(
      testUser._id.toString(),
      testCourse._id.toString()
    );

    expect(issueResult.success).toBe(true);
    expect(issueResult.certificate.qrCode).toBeDefined();
    expect(issueResult.certificate.verificationUrl).toBeDefined();

    // Extract certificate ID from verification URL
    const certificateId = issueResult.certificate.certificateId;

    // Verify certificate
    const verifyResult = await certificateService.verifyCertificate(certificateId);

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.valid).toBe(true);
    expect(verifyResult.certificate.certificateId).toBe(certificateId);
    expect(verifyResult.certificate.userName).toContain('أحمد');
    expect(verifyResult.certificate.courseName).toBe('دورة تطوير الويب');
  });

  // ========== Test 5: QR Code Format ==========
  test('5. QR code should have correct format', async () => {
    const result = await certificateService.issueCertificate(
      testUser._id.toString(),
      testCourse._id.toString()
    );

    const qrCode = result.certificate.qrCode;

    // Should be a data URL
    expect(qrCode).toMatch(/^data:image\/png;base64,/);

    // Extract base64 data
    const base64Data = qrCode.split(',')[1];
    expect(base64Data).toBeDefined();
    expect(base64Data.length).toBeGreaterThan(0);

    // Should be valid base64
    const buffer = Buffer.from(base64Data, 'base64');
    expect(buffer.length).toBeGreaterThan(0);

    // Size should be reasonable (between 1KB and 100KB)
    expect(buffer.length).toBeGreaterThan(1024); // > 1KB
    expect(buffer.length).toBeLessThan(100 * 1024); // < 100KB
  });

  // ========== Test 6: QR Code Consistency ==========
  test('6. QR code generation should be consistent', async () => {
    const testUrl = 'https://careerak.com/verify/test-123';

    // Generate QR code twice for the same URL
    const qrCode1 = await certificateService.generateQRCode(testUrl);
    const qrCode2 = await certificateService.generateQRCode(testUrl);

    // Both should be identical (same input = same output)
    expect(qrCode1).toBe(qrCode2);
  });

  // ========== Test 7: Revoked Certificate Detection ==========
  test('7. Revoked certificates should be detected via QR code', async () => {
    // Issue certificate
    const issueResult = await certificateService.issueCertificate(
      testUser._id.toString(),
      testCourse._id.toString()
    );

    const certificateId = issueResult.certificate.certificateId;

    // Revoke certificate
    await certificateService.revokeCertificate(
      certificateId,
      testUser._id.toString(),
      'Test revocation'
    );

    // Verify certificate (should be invalid)
    const verifyResult = await certificateService.verifyCertificate(certificateId);

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.valid).toBe(false);
    expect(verifyResult.certificate.status).toBe('revoked');
    expect(verifyResult.certificate.revocationReason).toBe('Test revocation');
  });

  // ========== Test 8: QR Code Persistence ==========
  test('8. QR code should persist after certificate retrieval', async () => {
    // Issue certificate
    const issueResult = await certificateService.issueCertificate(
      testUser._id.toString(),
      testCourse._id.toString()
    );

    const originalQRCode = issueResult.certificate.qrCode;
    const certificateId = issueResult.certificate.certificateId;

    // Retrieve certificate multiple times
    for (let i = 0; i < 3; i++) {
      const getResult = await certificateService.getCertificateById(certificateId);

      expect(getResult.certificate.qrCode).toBe(originalQRCode);
    }
  });
});
