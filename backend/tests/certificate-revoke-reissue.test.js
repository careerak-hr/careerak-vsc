/**
 * Unit Tests for Certificate Revocation and Reissue
 * Tests: revokeCertificate, reissueCertificate, audit log
 * Validates: Requirements 6.4, 6.5
 */

const certificateService = require('../src/services/certificateService');
const Certificate = require('../src/models/Certificate');

// Mock dependencies
jest.mock('../src/models/Certificate');
jest.mock('../src/models/User');
jest.mock('../src/models/EducationalCourse');
jest.mock('../src/services/notificationService', () => ({
  createNotification: jest.fn().mockResolvedValue(true)
}));

const { User } = require('../src/models/User');
const EducationalCourse = require('../src/models/EducationalCourse');

describe('Certificate Revocation and Reissue', () => {
  const mockAdminId = 'admin123';
  const mockInstructorId = 'instructor123';
  const mockStudentId = 'student123';
  const mockCertificateId = 'cert-uuid-123';
  const mockCourseId = 'course123';

  const mockAdmin = {
    _id: mockAdminId,
    firstName: 'أدمن',
    lastName: 'النظام',
    role: 'admin'
  };

  const mockInstructor = {
    _id: mockInstructorId,
    firstName: 'محمد',
    lastName: 'المدرب',
    role: 'instructor'
  };

  const mockCourse = {
    _id: mockCourseId,
    title: 'دورة تطوير الويب',
    instructor: { _id: mockInstructorId, toString: () => mockInstructorId }
  };

  const createMockCertificate = (overrides = {}) => ({
    _id: 'cert_doc_id',
    certificateId: mockCertificateId,
    userId: mockStudentId,
    courseId: mockCourseId,
    courseName: 'دورة تطوير الويب',
    status: 'active',
    template: null,
    revocation: {},
    auditLog: [],
    revoke: jest.fn(function(userId, reason) {
      this.status = 'revoked';
      this.revocation = { revokedAt: new Date(), revokedBy: userId, reason };
    }),
    addAuditEntry: jest.fn(function(action, performedBy, details) {
      this.auditLog.push({ action, performedBy, details, performedAt: new Date() });
    }),
    save: jest.fn().mockResolvedValue(true),
    ...overrides
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================================
  // revokeCertificate Tests
  // =============================================

  describe('revokeCertificate', () => {
    it('should revoke certificate successfully as admin', async () => {
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);

      const result = await certificateService.revokeCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب الإلغاء'
      );

      expect(result.success).toBe(true);
      expect(result.certificate.status).toBe('revoked');
      expect(mockCert.revoke).toHaveBeenCalledWith(mockAdminId, 'سبب الإلغاء');
      expect(mockCert.save).toHaveBeenCalled();
    });

    it('should revoke certificate successfully as instructor of the course', async () => {
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(mockInstructor);
      EducationalCourse.findById = jest.fn().mockResolvedValue(mockCourse);

      const result = await certificateService.revokeCertificate(
        mockCertificateId,
        mockInstructorId,
        'سبب الإلغاء'
      );

      expect(result.success).toBe(true);
      expect(mockCert.revoke).toHaveBeenCalled();
    });

    it('should add audit log entry on revocation', async () => {
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);

      await certificateService.revokeCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب الإلغاء'
      );

      expect(mockCert.addAuditEntry).toHaveBeenCalledWith(
        'revoked',
        mockAdminId,
        expect.stringContaining('سبب الإلغاء')
      );
    });

    it('should throw error if certificate not found', async () => {
      Certificate.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        certificateService.revokeCertificate(mockCertificateId, mockAdminId, 'سبب')
      ).rejects.toThrow('Certificate not found');
    });

    it('should throw error if certificate already revoked', async () => {
      const mockCert = createMockCertificate({ status: 'revoked' });
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);

      await expect(
        certificateService.revokeCertificate(mockCertificateId, mockAdminId, 'سبب')
      ).rejects.toThrow('already revoked');
    });

    it('should throw error if user is not admin or instructor', async () => {
      const mockStudent = { _id: mockStudentId, firstName: 'طالب', lastName: 'عادي', role: 'user' };
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(mockStudent);

      await expect(
        certificateService.revokeCertificate(mockCertificateId, mockStudentId, 'سبب')
      ).rejects.toThrow('Unauthorized');
    });

    it('should throw error if instructor tries to revoke certificate from another course', async () => {
      const otherInstructor = { ...mockInstructor, _id: 'other_instructor' };
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(otherInstructor);
      EducationalCourse.findById = jest.fn().mockResolvedValue(mockCourse);

      await expect(
        certificateService.revokeCertificate(mockCertificateId, 'other_instructor', 'سبب')
      ).rejects.toThrow('Unauthorized');
    });

    it('should return revocation details in response', async () => {
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);

      const result = await certificateService.revokeCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب الإلغاء'
      );

      expect(result.certificate).toHaveProperty('certificateId');
      expect(result.certificate).toHaveProperty('status');
      expect(result.certificate).toHaveProperty('reason');
    });
  });

  // =============================================
  // reissueCertificate Tests
  // =============================================

  describe('reissueCertificate', () => {
    it('should reissue certificate successfully as admin', async () => {
      const mockOriginalCert = createMockCertificate();
      const mockNewCert = {
        certificateId: 'new-cert-uuid',
        verificationUrl: 'https://careerak.com/verify/new-cert-uuid',
        qrCode: 'data:image/png;base64,newqrcode',
        issueDate: new Date(),
        status: 'active',
        reissue: {},
        auditLog: [],
        save: jest.fn().mockResolvedValue(true)
      };

      Certificate.findOne = jest.fn().mockResolvedValue(mockOriginalCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);
      Certificate.mockImplementation(() => mockNewCert);

      const result = await certificateService.reissueCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب إعادة الإصدار'
      );

      expect(result.success).toBe(true);
      expect(result.certificate).toHaveProperty('certificateId');
      expect(result.certificate).toHaveProperty('originalCertificateId', mockCertificateId);
    });

    it('should revoke original certificate when reissuing', async () => {
      const mockOriginalCert = createMockCertificate();
      const mockNewCert = {
        certificateId: 'new-cert-uuid',
        verificationUrl: 'https://careerak.com/verify/new-cert-uuid',
        qrCode: 'data:image/png;base64,newqrcode',
        issueDate: new Date(),
        status: 'active',
        reissue: {},
        auditLog: [],
        save: jest.fn().mockResolvedValue(true)
      };

      Certificate.findOne = jest.fn().mockResolvedValue(mockOriginalCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);
      Certificate.mockImplementation(() => mockNewCert);

      await certificateService.reissueCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب إعادة الإصدار'
      );

      // Original certificate should be revoked
      expect(mockOriginalCert.revoke).toHaveBeenCalled();
      expect(mockOriginalCert.save).toHaveBeenCalled();
    });

    it('should add audit log entry to original certificate', async () => {
      const mockOriginalCert = createMockCertificate();
      const mockNewCert = {
        certificateId: 'new-cert-uuid',
        verificationUrl: 'https://careerak.com/verify/new-cert-uuid',
        qrCode: 'data:image/png;base64,newqrcode',
        issueDate: new Date(),
        status: 'active',
        reissue: {},
        auditLog: [],
        save: jest.fn().mockResolvedValue(true)
      };

      Certificate.findOne = jest.fn().mockResolvedValue(mockOriginalCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);
      Certificate.mockImplementation(() => mockNewCert);

      await certificateService.reissueCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب إعادة الإصدار'
      );

      expect(mockOriginalCert.addAuditEntry).toHaveBeenCalledWith(
        'reissued',
        mockAdminId,
        expect.any(String)
      );
    });

    it('should create new certificate with new UUID', async () => {
      const mockOriginalCert = createMockCertificate();
      let capturedCertData = null;

      Certificate.findOne = jest.fn().mockResolvedValue(mockOriginalCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);
      Certificate.mockImplementation((data) => {
        capturedCertData = data;
        return {
          ...data,
          save: jest.fn().mockResolvedValue(true)
        };
      });

      await certificateService.reissueCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب'
      );

      // New certificate should have a different ID
      expect(capturedCertData.certificateId).toBeDefined();
      expect(capturedCertData.certificateId).not.toBe(mockCertificateId);
    });

    it('should link new certificate to original via reissue.originalCertificateId', async () => {
      const mockOriginalCert = createMockCertificate();
      let capturedCertData = null;

      Certificate.findOne = jest.fn().mockResolvedValue(mockOriginalCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);
      Certificate.mockImplementation((data) => {
        capturedCertData = data;
        return {
          ...data,
          save: jest.fn().mockResolvedValue(true)
        };
      });

      await certificateService.reissueCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب'
      );

      expect(capturedCertData.reissue.isReissued).toBe(true);
      expect(capturedCertData.reissue.originalCertificateId).toBe(mockCertificateId);
    });

    it('should throw error if original certificate not found', async () => {
      Certificate.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        certificateService.reissueCertificate(mockCertificateId, mockAdminId, 'سبب')
      ).rejects.toThrow('Original certificate not found');
    });

    it('should throw error if user is not admin or instructor', async () => {
      const mockStudent = { _id: mockStudentId, firstName: 'طالب', lastName: 'عادي', role: 'user' };
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(mockStudent);

      await expect(
        certificateService.reissueCertificate(mockCertificateId, mockStudentId, 'سبب')
      ).rejects.toThrow('Unauthorized');
    });

    it('should reissue as instructor of the course', async () => {
      const mockOriginalCert = createMockCertificate();
      const mockNewCert = {
        certificateId: 'new-cert-uuid',
        verificationUrl: 'https://careerak.com/verify/new-cert-uuid',
        qrCode: 'data:image/png;base64,newqrcode',
        issueDate: new Date(),
        status: 'active',
        reissue: {},
        auditLog: [],
        save: jest.fn().mockResolvedValue(true)
      };

      Certificate.findOne = jest.fn().mockResolvedValue(mockOriginalCert);
      User.findById = jest.fn().mockResolvedValue(mockInstructor);
      EducationalCourse.findById = jest.fn().mockResolvedValue(mockCourse);
      Certificate.mockImplementation(() => mockNewCert);

      const result = await certificateService.reissueCertificate(
        mockCertificateId,
        mockInstructorId,
        'سبب'
      );

      expect(result.success).toBe(true);
    });
  });

  // =============================================
  // Audit Log Tests
  // =============================================

  describe('Audit Log', () => {
    it('should record revocation in audit log with correct action', async () => {
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);

      await certificateService.revokeCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب الإلغاء'
      );

      const auditCall = mockCert.addAuditEntry.mock.calls[0];
      expect(auditCall[0]).toBe('revoked');
      expect(auditCall[1]).toBe(mockAdminId);
    });

    it('should record reissue in audit log with correct action', async () => {
      const mockOriginalCert = createMockCertificate();
      const mockNewCert = {
        certificateId: 'new-cert-uuid',
        verificationUrl: 'https://careerak.com/verify/new-cert-uuid',
        qrCode: 'data:image/png;base64,newqrcode',
        issueDate: new Date(),
        status: 'active',
        reissue: {},
        auditLog: [],
        save: jest.fn().mockResolvedValue(true)
      };

      Certificate.findOne = jest.fn().mockResolvedValue(mockOriginalCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);
      Certificate.mockImplementation(() => mockNewCert);

      await certificateService.reissueCertificate(
        mockCertificateId,
        mockAdminId,
        'سبب إعادة الإصدار'
      );

      const auditCall = mockOriginalCert.addAuditEntry.mock.calls[0];
      expect(auditCall[0]).toBe('reissued');
    });

    it('should include reason in audit log details', async () => {
      const mockCert = createMockCertificate();
      Certificate.findOne = jest.fn().mockResolvedValue(mockCert);
      User.findById = jest.fn().mockResolvedValue(mockAdmin);

      const reason = 'شهادة مزورة';
      await certificateService.revokeCertificate(mockCertificateId, mockAdminId, reason);

      const auditCall = mockCert.addAuditEntry.mock.calls[0];
      expect(auditCall[2]).toContain(reason);
    });
  });

  // =============================================
  // Verification after Revocation
  // =============================================

  describe('Verification after Revocation', () => {
    it('should return invalid status for revoked certificate', async () => {
      const mockRevokedCert = {
        certificateId: mockCertificateId,
        userId: { firstName: 'أحمد', lastName: 'محمد' },
        courseName: 'دورة تطوير الويب',
        issueDate: new Date(),
        status: 'revoked',
        isValid: jest.fn().mockReturnValue(false),
        revocation: { reason: 'سبب الإلغاء' }
      };

      Certificate.getByCertificateId = jest.fn().mockResolvedValue(mockRevokedCert);

      const result = await certificateService.verifyCertificate(mockCertificateId);

      expect(result.valid).toBe(false);
      expect(result.certificate.status).toBe('revoked');
    });

    it('should include revocation reason in verification response', async () => {
      const revokeReason = 'تم الإلغاء بسبب خطأ في البيانات';
      const mockRevokedCert = {
        certificateId: mockCertificateId,
        userId: { firstName: 'أحمد', lastName: 'محمد' },
        courseName: 'دورة تطوير الويب',
        issueDate: new Date(),
        status: 'revoked',
        isValid: jest.fn().mockReturnValue(false),
        revocation: { reason: revokeReason }
      };

      Certificate.getByCertificateId = jest.fn().mockResolvedValue(mockRevokedCert);

      const result = await certificateService.verifyCertificate(mockCertificateId);

      expect(result.certificate.revocationReason).toBe(revokeReason);
    });
  });
});
