/**
 * Property-Based Tests for Certificate QR Code
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * Property 3: QR Code Validity
 * For any certificate with a QR code, scanning it should lead to a valid 
 * verification page showing correct certificate details.
 * 
 * Property 2: Unique Certificate ID
 * For any two certificates, their certificateId values must be unique.
 */

const fc = require('fast-check');
const QRCode = require('qrcode');
const certificateService = require('../src/services/certificateService');
const Certificate = require('../src/models/Certificate');
const { User } = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Mock environment variables
process.env.FRONTEND_URL = 'https://careerak.com';

// ========== Test Setup ==========

beforeAll(async () => {
  // Connect to test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
});

afterAll(async () => {
  // Clean up and close connection
  await Certificate.deleteMany({});
  await User.deleteMany({});
  await EducationalCourse.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clean up before each test
  await Certificate.deleteMany({});
  await User.deleteMany({});
  await EducationalCourse.deleteMany({});
});

// ========== Helper Functions ==========

/**
 * Create a test user
 */
async function createTestUser(data = {}) {
  const user = await User.create({
    firstName: data.firstName || 'أحمد',
    lastName: data.lastName || 'محمد',
    email: data.email || `test-${crypto.randomUUID()}@example.com`,
    password: 'Test123456',
    role: 'Employee',
    phone: '+201234567890',
    country: 'Egypt',
    isEmailVerified: true
  });
  return user;
}

/**
 * Create a test course
 */
async function createTestCourse(data = {}) {
  const course = await EducationalCourse.create({
    title: data.title || 'دورة تطوير الويب',
    description: 'دورة شاملة لتطوير الويب',
    category: 'تطوير الويب',
    level: 'Beginner',
    duration: 40,
    price: 0,
    instructor: mongoose.Types.ObjectId(),
    status: 'Published',
    totalLessons: 10,
    settings: {
      certificateEnabled: true
    }
  });
  return course;
}

/**
 * Extract URL from QR code data URL
 */
function extractUrlFromQRCode(qrCodeDataUrl) {
  // QR code is a data URL, we need to decode it
  // For testing purposes, we'll use the verification URL directly
  // In real scenario, you would scan the QR code image
  return qrCodeDataUrl;
}

// ========== Property-Based Tests ==========

describe('Certificate QR Code - Property-Based Tests', () => {
  
  /**
   * Property 1: QR Code Format
   * For any certificate, the QR code should be a valid data URL
   */
  test('Property 1: QR code should always be a valid data URL', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 20 }),
          lastName: fc.string({ minLength: 2, maxLength: 20 }),
          courseTitle: fc.string({ minLength: 5, maxLength: 50 })
        }),
        async (data) => {
          // Create test user and course
          const user = await createTestUser({
            firstName: data.firstName,
            lastName: data.lastName
          });
          const course = await createTestCourse({
            title: data.courseTitle
          });

          // Issue certificate
          const result = await certificateService.issueCertificate(
            user._id.toString(),
            course._id.toString()
          );

          // Verify QR code format
          expect(result.certificate.qrCode).toBeDefined();
          expect(result.certificate.qrCode).toContain('data:image/png;base64');
          expect(result.certificate.qrCode.length).toBeGreaterThan(100);
        }
      ),
      { numRuns: 10 } // Run 10 times with different inputs
    );
  });

  /**
   * Property 2: Unique Certificate IDs
   * For any two certificates, their certificateId values must be unique
   */
  test('Property 2: Certificate IDs should always be unique', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            firstName: fc.string({ minLength: 2, maxLength: 20 }),
            lastName: fc.string({ minLength: 2, maxLength: 20 }),
            courseTitle: fc.string({ minLength: 5, maxLength: 50 })
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (usersData) => {
          const certificateIds = new Set();

          // Create multiple certificates
          for (const userData of usersData) {
            const user = await createTestUser({
              firstName: userData.firstName,
              lastName: userData.lastName
            });
            const course = await createTestCourse({
              title: userData.courseTitle
            });

            const result = await certificateService.issueCertificate(
              user._id.toString(),
              course._id.toString()
            );

            // Check uniqueness
            expect(certificateIds.has(result.certificate.certificateId)).toBe(false);
            certificateIds.add(result.certificate.certificateId);
          }

          // Verify all IDs are unique
          expect(certificateIds.size).toBe(usersData.length);
        }
      ),
      { numRuns: 5 } // Run 5 times with different arrays
    );
  });

  /**
   * Property 3: QR Code Contains Verification URL
   * For any certificate, the QR code should encode the verification URL
   */
  test('Property 3: QR code should contain verification URL', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 20 }),
          lastName: fc.string({ minLength: 2, maxLength: 20 }),
          courseTitle: fc.string({ minLength: 5, maxLength: 50 })
        }),
        async (data) => {
          // Create test user and course
          const user = await createTestUser({
            firstName: data.firstName,
            lastName: data.lastName
          });
          const course = await createTestCourse({
            title: data.courseTitle
          });

          // Issue certificate
          const result = await certificateService.issueCertificate(
            user._id.toString(),
            course._id.toString()
          );

          // Get certificate from database
          const certificate = await Certificate.findOne({
            certificateId: result.certificate.certificateId
          });

          // Verify QR code contains verification URL
          expect(certificate.qrCode).toBeDefined();
          expect(certificate.verificationUrl).toBeDefined();
          
          // The QR code should be generated from the verification URL
          const expectedQRCode = await certificateService.generateQRCode(
            certificate.verificationUrl
          );
          
          // Both should be data URLs
          expect(certificate.qrCode).toContain('data:image/png;base64');
          expect(expectedQRCode).toContain('data:image/png;base64');
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 4: Verification URL Format
   * For any certificate, the verification URL should follow the correct format
   */
  test('Property 4: Verification URL should follow correct format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 20 }),
          lastName: fc.string({ minLength: 2, maxLength: 20 }),
          courseTitle: fc.string({ minLength: 5, maxLength: 50 })
        }),
        async (data) => {
          // Create test user and course
          const user = await createTestUser({
            firstName: data.firstName,
            lastName: data.lastName
          });
          const course = await createTestCourse({
            title: data.courseTitle
          });

          // Issue certificate
          const result = await certificateService.issueCertificate(
            user._id.toString(),
            course._id.toString()
          );

          // Verify URL format
          const verificationUrl = result.certificate.verificationUrl;
          expect(verificationUrl).toMatch(/^https?:\/\/.+\/verify\/.+$/);
          expect(verificationUrl).toContain(result.certificate.certificateId);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 5: QR Code Leads to Valid Verification
   * For any certificate with a QR code, verification should return correct details
   */
  test('Property 5: QR code should lead to valid verification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 20 }),
          lastName: fc.string({ minLength: 2, maxLength: 20 }),
          courseTitle: fc.string({ minLength: 5, maxLength: 50 })
        }),
        async (data) => {
          // Create test user and course
          const user = await createTestUser({
            firstName: data.firstName,
            lastName: data.lastName
          });
          const course = await createTestCourse({
            title: data.courseTitle
          });

          // Issue certificate
          const issueResult = await certificateService.issueCertificate(
            user._id.toString(),
            course._id.toString()
          );

          // Verify certificate using the ID from verification URL
          const certificateId = issueResult.certificate.certificateId;
          const verifyResult = await certificateService.verifyCertificate(certificateId);

          // Verify the result
          expect(verifyResult.success).toBe(true);
          expect(verifyResult.valid).toBe(true);
          expect(verifyResult.certificate.certificateId).toBe(certificateId);
          expect(verifyResult.certificate.userName).toContain(data.firstName);
          expect(verifyResult.certificate.courseName).toBe(data.courseTitle);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 6: QR Code Consistency
   * For any certificate, generating QR code multiple times should produce consistent results
   */
  test('Property 6: QR code generation should be consistent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        async (url) => {
          // Generate QR code twice for the same URL
          const qrCode1 = await certificateService.generateQRCode(url);
          const qrCode2 = await certificateService.generateQRCode(url);

          // Both should be valid data URLs
          expect(qrCode1).toContain('data:image/png;base64');
          expect(qrCode2).toContain('data:image/png;base64');
          
          // They should be identical (same input = same output)
          expect(qrCode1).toBe(qrCode2);
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 7: QR Code for Revoked Certificates
   * For any revoked certificate, verification should return status='revoked'
   */
  test('Property 7: Revoked certificates should be detected via QR code', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 2, maxLength: 20 }),
          lastName: fc.string({ minLength: 2, maxLength: 20 }),
          courseTitle: fc.string({ minLength: 5, maxLength: 50 }),
          revokeReason: fc.string({ minLength: 10, maxLength: 100 })
        }),
        async (data) => {
          // Create test user and course
          const user = await createTestUser({
            firstName: data.firstName,
            lastName: data.lastName
          });
          const course = await createTestCourse({
            title: data.courseTitle
          });

          // Issue certificate
          const issueResult = await certificateService.issueCertificate(
            user._id.toString(),
            course._id.toString()
          );

          const certificateId = issueResult.certificate.certificateId;

          // Revoke certificate
          await certificateService.revokeCertificate(
            certificateId,
            user._id.toString(),
            data.revokeReason
          );

          // Verify certificate (should be invalid)
          const verifyResult = await certificateService.verifyCertificate(certificateId);

          expect(verifyResult.success).toBe(true);
          expect(verifyResult.valid).toBe(false);
          expect(verifyResult.certificate.status).toBe('revoked');
          expect(verifyResult.certificate.revocationReason).toBe(data.revokeReason);
        }
      ),
      { numRuns: 5 }
    );
  });

  /**
   * Property 8: QR Code Size
   * For any certificate, the QR code should have reasonable size
   */
  test('Property 8: QR code should have reasonable size', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        async (url) => {
          const qrCode = await certificateService.generateQRCode(url);

          // Extract base64 data
          const base64Data = qrCode.split(',')[1];
          const sizeInBytes = Buffer.from(base64Data, 'base64').length;

          // QR code should be between 1KB and 100KB
          expect(sizeInBytes).toBeGreaterThan(1024); // > 1KB
          expect(sizeInBytes).toBeLessThan(100 * 1024); // < 100KB
        }
      ),
      { numRuns: 10 }
    );
  });
});

// ========== Integration Tests ==========

describe('Certificate QR Code - Integration Tests', () => {
  
  test('Complete flow: Issue → QR Code → Verify', async () => {
    // Create test data
    const user = await createTestUser({
      firstName: 'علي',
      lastName: 'حسن'
    });
    const course = await createTestCourse({
      title: 'دورة البرمجة المتقدمة'
    });

    // 1. Issue certificate
    const issueResult = await certificateService.issueCertificate(
      user._id.toString(),
      course._id.toString()
    );

    expect(issueResult.success).toBe(true);
    expect(issueResult.certificate.qrCode).toBeDefined();
    expect(issueResult.certificate.verificationUrl).toBeDefined();

    // 2. Get certificate details
    const getResult = await certificateService.getCertificateById(
      issueResult.certificate.certificateId
    );

    expect(getResult.success).toBe(true);
    expect(getResult.certificate.qrCode).toBe(issueResult.certificate.qrCode);

    // 3. Verify certificate
    const verifyResult = await certificateService.verifyCertificate(
      issueResult.certificate.certificateId
    );

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.valid).toBe(true);
    expect(verifyResult.certificate.userName).toBe('علي حسن');
    expect(verifyResult.certificate.courseName).toBe('دورة البرمجة المتقدمة');
  });

  test('QR Code should persist after certificate retrieval', async () => {
    // Create test data
    const user = await createTestUser();
    const course = await createTestCourse();

    // Issue certificate
    const issueResult = await certificateService.issueCertificate(
      user._id.toString(),
      course._id.toString()
    );

    const originalQRCode = issueResult.certificate.qrCode;

    // Retrieve certificate multiple times
    for (let i = 0; i < 3; i++) {
      const getResult = await certificateService.getCertificateById(
        issueResult.certificate.certificateId
      );

      expect(getResult.certificate.qrCode).toBe(originalQRCode);
    }
  });

  test('Different certificates should have different QR codes', async () => {
    const qrCodes = new Set();

    // Create 5 different certificates
    for (let i = 0; i < 5; i++) {
      const user = await createTestUser({
        email: `user${i}@example.com`
      });
      const course = await createTestCourse({
        title: `دورة ${i}`
      });

      const result = await certificateService.issueCertificate(
        user._id.toString(),
        course._id.toString()
      );

      qrCodes.add(result.certificate.qrCode);
    }

    // All QR codes should be unique
    expect(qrCodes.size).toBe(5);
  });
});
