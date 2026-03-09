const certificateService = require('../src/services/certificateService');
const Certificate = require('../src/models/Certificate');
const User = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');

// Mock the models
jest.mock('../src/models/Certificate');
jest.mock('../src/models/User');
jest.mock('../src/models/EducationalCourse');

describe('Certificate Service', () => {
  describe('issueCertificate', () => {
    it('should issue a certificate with all required fields', async () => {
      // Mock data
      const mockUser = {
        _id: 'user123',
        firstName: 'أحمد',
        lastName: 'محمد'
      };

      const mockCourse = {
        _id: 'course123',
        title: 'دورة تطوير الويب'
      };

      const mockCertificate = {
        certificateId: 'cert-uuid-123',
        userId: mockUser._id,
        courseId: mockCourse._id,
        courseName: mockCourse.title,
        issueDate: new Date(),
        qrCode: 'data:image/png;base64,mockqrcode',
        verificationUrl: 'https://careerak.com/verify/cert-uuid-123',
        status: 'active',
        save: jest.fn().mockResolvedValue(true)
      };

      // Setup mocks
      User.findById = jest.fn().mockResolvedValue(mockUser);
      EducationalCourse.findById = jest.fn().mockResolvedValue(mockCourse);
      Certificate.hasCertificate = jest.fn().mockResolvedValue(false);
      Certificate.mockImplementation(() => mockCertificate);

      // Test
      const result = await certificateService.issueCertificate(mockUser._id, mockCourse._id);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.certificate).toHaveProperty('certificateId');
      expect(result.certificate).toHaveProperty('userName');
      expect(result.certificate).toHaveProperty('courseName');
      expect(result.certificate).toHaveProperty('issueDate');
      expect(result.certificate).toHaveProperty('verificationUrl');
      expect(result.certificate).toHaveProperty('qrCode');
      expect(result.certificate.userName).toBe('أحمد محمد');
      expect(result.certificate.courseName).toBe('دورة تطوير الويب');
    });

    it('should throw error if user not found', async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      await expect(
        certificateService.issueCertificate('invalid-user', 'course123')
      ).rejects.toThrow('User not found');
    });

    it('should throw error if course not found', async () => {
      const mockUser = { _id: 'user123', firstName: 'أحمد', lastName: 'محمد' };
      User.findById = jest.fn().mockResolvedValue(mockUser);
      EducationalCourse.findById = jest.fn().mockResolvedValue(null);

      await expect(
        certificateService.issueCertificate('user123', 'invalid-course')
      ).rejects.toThrow('Course not found');
    });

    it('should throw error if certificate already exists', async () => {
      const mockUser = { _id: 'user123', firstName: 'أحمد', lastName: 'محمد' };
      const mockCourse = { _id: 'course123', title: 'دورة تطوير الويب' };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      EducationalCourse.findById = jest.fn().mockResolvedValue(mockCourse);
      Certificate.hasCertificate = jest.fn().mockResolvedValue(true);

      await expect(
        certificateService.issueCertificate('user123', 'course123')
      ).rejects.toThrow('Certificate already exists for this user and course');
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code as data URL', async () => {
      const testUrl = 'https://careerak.com/verify/test-123';
      const qrCode = await certificateService.generateQRCode(testUrl);

      expect(qrCode).toBeDefined();
      expect(qrCode).toContain('data:image/png;base64');
    });
  });

  describe('verifyCertificate', () => {
    it('should return valid for active certificate', async () => {
      const mockCertificate = {
        certificateId: 'cert-123',
        userId: { firstName: 'أحمد', lastName: 'محمد' },
        courseName: 'دورة تطوير الويب',
        issueDate: new Date(),
        status: 'active',
        isValid: jest.fn().mockReturnValue(true)
      };

      Certificate.getByCertificateId = jest.fn().mockResolvedValue(mockCertificate);

      const result = await certificateService.verifyCertificate('cert-123');

      expect(result.success).toBe(true);
      expect(result.valid).toBe(true);
      expect(result.message).toBe('Certificate is valid');
    });

    it('should return invalid for revoked certificate', async () => {
      const mockCertificate = {
        certificateId: 'cert-123',
        userId: { firstName: 'أحمد', lastName: 'محمد' },
        courseName: 'دورة تطوير الويب',
        issueDate: new Date(),
        status: 'revoked',
        isValid: jest.fn().mockReturnValue(false),
        revocation: { reason: 'تم الإلغاء بسبب خطأ' }
      };

      Certificate.getByCertificateId = jest.fn().mockResolvedValue(mockCertificate);

      const result = await certificateService.verifyCertificate('cert-123');

      expect(result.success).toBe(true);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Certificate is not valid');
    });

    it('should return not found for non-existent certificate', async () => {
      Certificate.getByCertificateId = jest.fn().mockResolvedValue(null);

      const result = await certificateService.verifyCertificate('invalid-cert');

      expect(result.success).toBe(false);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Certificate not found');
    });
  });
});
