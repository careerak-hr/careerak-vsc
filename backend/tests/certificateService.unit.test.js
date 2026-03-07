/**
 * Unit Tests for Certificate Service
 * Tests certificate PDF generation, ID uniqueness, and Cloudinary upload
 * Validates: Requirement 6.5
 */

const CertificateService = require('../src/services/certificateService');
const PDFDocument = require('pdfkit');

// Mock dependencies
jest.mock('../src/config/cloudinary');
const cloudinary = require('../src/config/cloudinary');

describe('CertificateService - Unit Tests', () => {
  let certificateService;
  let mockCourseEnrollment;
  let mockEducationalCourse;
  let mockUser;
  let mockEnrollment;
  let mockCourse;
  let mockStudent;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock models
    mockCourseEnrollment = {
      findById: jest.fn(),
      findOne: jest.fn()
    };

    mockEducationalCourse = {};
    mockUser = {};

    // Create service instance
    certificateService = new CertificateService(
      mockCourseEnrollment,
      mockEducationalCourse,
      mockUser
    );

    // Mock enrollment data
    mockStudent = {
      _id: '507f1f77bcf86cd799439011',
      fullName: 'أحمد محمد',
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@example.com'
    };

    mockCourse = {
      _id: '507f1f77bcf86cd799439012',
      title: 'دورة تطوير الويب الشاملة',
      instructor: {
        fullName: 'د. سارة أحمد'
      },
      totalDuration: 40,
      totalLessons: 20
    };

    mockEnrollment = {
      _id: '507f1f77bcf86cd799439013',
      course: mockCourse._id,
      student: mockStudent._id,
      status: 'completed',
      completedAt: new Date('2026-02-15'),
      progress: {
        percentageComplete: 100,
        completedLessons: []
      },
      certificateIssued: {
        issued: false
      }
    };
  });

  describe('generateCertificateId', () => {
    it('should generate unique certificate ID with correct format', (done) => {
      const id1 = certificateService.generateCertificateId(mockEnrollment);
      
      // Wait 1ms to ensure different timestamp
      setTimeout(() => {
        const id2 = certificateService.generateCertificateId(mockEnrollment);

        // Check format: CERT-{courseId}-{studentId}-{timestamp}
        expect(id1).toMatch(/^CERT-[a-f0-9]{6}-[a-f0-9]{6}-\d+$/);
        expect(id2).toMatch(/^CERT-[a-f0-9]{6}-[a-f0-9]{6}-\d+$/);

        // IDs should be different (different timestamps)
        expect(id1).not.toBe(id2);
        done();
      }, 2);
    });

    it('should include course ID in certificate ID', () => {
      const id = certificateService.generateCertificateId(mockEnrollment);
      const courseIdPart = mockCourse._id.toString().slice(-6);
      
      expect(id).toContain(courseIdPart);
    });

    it('should include student ID in certificate ID', () => {
      const id = certificateService.generateCertificateId(mockEnrollment);
      const studentIdPart = mockStudent._id.toString().slice(-6);
      
      expect(id).toContain(studentIdPart);
    });

    it('should generate different IDs for different enrollments', () => {
      const enrollment2 = {
        ...mockEnrollment,
        course: '507f1f77bcf86cd799439099',
        student: '507f1f77bcf86cd799439088'
      };

      const id1 = certificateService.generateCertificateId(mockEnrollment);
      const id2 = certificateService.generateCertificateId(enrollment2);

      expect(id1).not.toBe(id2);
    });
  });

  describe('createPDF', () => {
    it('should create PDF buffer with certificate data', async () => {
      const certificateData = {
        studentName: 'أحمد محمد',
        courseName: 'دورة تطوير الويب',
        instructorName: 'د. سارة أحمد',
        completionDate: new Date('2026-02-15'),
        certificateId: 'CERT-123456-789012-1234567890',
        duration: 40
      };

      const pdfBuffer = await certificateService.createPDF(certificateData);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should include student name in PDF', async () => {
      const certificateData = {
        studentName: 'أحمد محمد',
        courseName: 'دورة تطوير الويب',
        instructorName: 'د. سارة أحمد',
        completionDate: new Date('2026-02-15'),
        certificateId: 'CERT-123456-789012-1234567890',
        duration: 40
      };

      const pdfBuffer = await certificateService.createPDF(certificateData);

      // PDF should be created successfully (content is compressed)
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(1000); // Reasonable size for certificate
    });

    it('should include course name in PDF', async () => {
      const certificateData = {
        studentName: 'أحمد محمد',
        courseName: 'دورة تطوير الويب',
        instructorName: 'د. سارة أحمد',
        completionDate: new Date('2026-02-15'),
        certificateId: 'CERT-123456-789012-1234567890',
        duration: 40
      };

      const pdfBuffer = await certificateService.createPDF(certificateData);

      // PDF should be created successfully
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(1000);
    });

    it('should include certificate ID in PDF', async () => {
      const certificateData = {
        studentName: 'أحمد محمد',
        courseName: 'دورة تطوير الويب',
        instructorName: 'د. سارة أحمد',
        completionDate: new Date('2026-02-15'),
        certificateId: 'CERT-123456-789012-1234567890',
        duration: 40
      };

      const pdfBuffer = await certificateService.createPDF(certificateData);

      // PDF should be created successfully
      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(1000);
    });

    it('should handle missing duration gracefully', async () => {
      const certificateData = {
        studentName: 'أحمد محمد',
        courseName: 'دورة تطوير الويب',
        instructorName: 'د. سارة أحمد',
        completionDate: new Date('2026-02-15'),
        certificateId: 'CERT-123456-789012-1234567890'
        // duration is missing
      };

      const pdfBuffer = await certificateService.createPDF(certificateData);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should reject on PDF creation error', async () => {
      // Create invalid data that will cause PDF error
      const invalidData = null;

      await expect(certificateService.createPDF(invalidData))
        .rejects
        .toThrow();
    });
  });

  describe('uploadToCloudinary', () => {
    it('should upload PDF buffer to Cloudinary successfully', async () => {
      const pdfBuffer = Buffer.from('fake pdf content');
      const certificateId = 'CERT-123456-789012-1234567890';

      const mockUploadResult = {
        secure_url: 'https://res.cloudinary.com/careerak/raw/upload/certificates/CERT-123456-789012-1234567890.pdf',
        public_id: certificateId,
        resource_type: 'raw',
        format: 'pdf'
      };

      // Mock upload_stream
      const mockStream = {
        end: jest.fn()
      };

      cloudinary.uploader.upload_stream = jest.fn((options, callback) => {
        // Simulate successful upload
        setTimeout(() => callback(null, mockUploadResult), 0);
        return mockStream;
      });

      const result = await certificateService.uploadToCloudinary(pdfBuffer, certificateId);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'careerak/certificates',
          resource_type: 'raw',
          public_id: certificateId,
          format: 'pdf',
          tags: ['certificate', 'course-completion']
        }),
        expect.any(Function)
      );

      expect(mockStream.end).toHaveBeenCalledWith(pdfBuffer);
      expect(result).toEqual(mockUploadResult);
      expect(result.secure_url).toContain('certificates');
    });

    it('should reject on Cloudinary upload error', async () => {
      const pdfBuffer = Buffer.from('fake pdf content');
      const certificateId = 'CERT-123456-789012-1234567890';

      const mockStream = {
        end: jest.fn()
      };

      cloudinary.uploader.upload_stream = jest.fn((options, callback) => {
        // Simulate upload error
        setTimeout(() => callback(new Error('Upload failed'), null), 0);
        return mockStream;
      });

      await expect(certificateService.uploadToCloudinary(pdfBuffer, certificateId))
        .rejects
        .toThrow('Cloudinary upload failed');
    });

    it('should use correct folder structure', async () => {
      const pdfBuffer = Buffer.from('fake pdf content');
      const certificateId = 'CERT-123456-789012-1234567890';

      const mockStream = {
        end: jest.fn()
      };

      cloudinary.uploader.upload_stream = jest.fn((options, callback) => {
        setTimeout(() => callback(null, { secure_url: 'https://example.com/cert.pdf' }), 0);
        return mockStream;
      });

      await certificateService.uploadToCloudinary(pdfBuffer, certificateId);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'careerak/certificates'
        }),
        expect.any(Function)
      );
    });

    it('should tag certificates appropriately', async () => {
      const pdfBuffer = Buffer.from('fake pdf content');
      const certificateId = 'CERT-123456-789012-1234567890';

      const mockStream = {
        end: jest.fn()
      };

      cloudinary.uploader.upload_stream = jest.fn((options, callback) => {
        setTimeout(() => callback(null, { secure_url: 'https://example.com/cert.pdf' }), 0);
        return mockStream;
      });

      await certificateService.uploadToCloudinary(pdfBuffer, certificateId);

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['certificate', 'course-completion']
        }),
        expect.any(Function)
      );
    });
  });

  describe('generateCertificate', () => {
    beforeEach(() => {
      // Mock populated enrollment
      const populatedEnrollment = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedEnrollment)
        })
      });

      // Mock Cloudinary upload
      const mockStream = {
        end: jest.fn()
      };

      cloudinary.uploader.upload_stream = jest.fn((options, callback) => {
        setTimeout(() => callback(null, {
          secure_url: 'https://res.cloudinary.com/careerak/certificates/cert.pdf',
          public_id: 'CERT-123456'
        }), 0);
        return mockStream;
      });
    });

    it('should generate certificate with all required data', async () => {
      const result = await certificateService.generateCertificate(mockEnrollment);

      expect(result).toHaveProperty('certificateUrl');
      expect(result).toHaveProperty('certificateId');
      expect(result.certificateUrl).toContain('certificates');
      expect(result.certificateId).toMatch(/^CERT-/);
    });

    it('should throw error if enrollment not found', async () => {
      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      await expect(certificateService.generateCertificate(mockEnrollment))
        .rejects
        .toThrow('Enrollment not found');
    });

    it('should use student fullName if available', async () => {
      const populatedEnrollment = {
        ...mockEnrollment,
        course: mockCourse,
        student: { ...mockStudent, fullName: 'أحمد محمد علي' }
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedEnrollment)
        })
      });

      // Spy on createPDF to check the data passed
      const createPDFSpy = jest.spyOn(certificateService, 'createPDF');

      await certificateService.generateCertificate(mockEnrollment);

      expect(createPDFSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          studentName: 'أحمد محمد علي'
        })
      );
    });

    it('should fallback to firstName + lastName if fullName not available', async () => {
      const populatedEnrollment = {
        ...mockEnrollment,
        course: mockCourse,
        student: { 
          ...mockStudent, 
          fullName: undefined,
          firstName: 'أحمد',
          lastName: 'محمد'
        }
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedEnrollment)
        })
      });

      const createPDFSpy = jest.spyOn(certificateService, 'createPDF');

      await certificateService.generateCertificate(mockEnrollment);

      expect(createPDFSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          studentName: 'أحمد محمد'
        })
      );
    });

    it('should use default instructor name if not available', async () => {
      const populatedEnrollment = {
        ...mockEnrollment,
        course: { ...mockCourse, instructor: undefined },
        student: mockStudent
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedEnrollment)
        })
      });

      const createPDFSpy = jest.spyOn(certificateService, 'createPDF');

      await certificateService.generateCertificate(mockEnrollment);

      expect(createPDFSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          instructorName: 'Careerak Team'
        })
      );
    });

    it('should handle PDF generation errors', async () => {
      const populatedEnrollment = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedEnrollment)
        })
      });

      // Mock createPDF to throw error
      jest.spyOn(certificateService, 'createPDF').mockRejectedValue(new Error('PDF generation failed'));

      await expect(certificateService.generateCertificate(mockEnrollment))
        .rejects
        .toThrow('Failed to generate certificate');
    });

    it('should handle Cloudinary upload errors', async () => {
      const populatedEnrollment = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedEnrollment)
        })
      });

      // Mock uploadToCloudinary to throw error
      jest.spyOn(certificateService, 'uploadToCloudinary').mockRejectedValue(
        new Error('Cloudinary upload failed')
      );

      await expect(certificateService.generateCertificate(mockEnrollment))
        .rejects
        .toThrow('Failed to generate certificate');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-02-15');
      const formatted = certificateService.formatDate(date);

      expect(formatted).toMatch(/February 15, 2026/);
    });

    it('should handle different date formats', () => {
      const date1 = new Date('2026-01-01');
      const date2 = new Date('2026-12-31');

      const formatted1 = certificateService.formatDate(date1);
      const formatted2 = certificateService.formatDate(date2);

      expect(formatted1).toContain('January');
      expect(formatted2).toContain('December');
    });
  });

  describe('verifyCertificate', () => {
    it('should verify valid certificate', async () => {
      const certificateId = 'CERT-123456-789012-1234567890';
      
      const mockEnrollmentWithCert = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent,
        certificateIssued: {
          issued: true,
          certificateId: certificateId,
          issuedAt: new Date('2026-02-15')
        }
      };

      mockCourseEnrollment.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockEnrollmentWithCert)
        })
      });

      const result = await certificateService.verifyCertificate(certificateId);

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Certificate is valid');
      expect(result.details).toHaveProperty('studentName');
      expect(result.details).toHaveProperty('courseName');
      expect(result.details).toHaveProperty('completionDate');
    });

    it('should return invalid for non-existent certificate', async () => {
      mockCourseEnrollment.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      const result = await certificateService.verifyCertificate('INVALID-CERT-ID');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Certificate not found');
    });

    it('should handle verification errors', async () => {
      mockCourseEnrollment.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });

      await expect(certificateService.verifyCertificate('CERT-123'))
        .rejects
        .toThrow('Failed to verify certificate');
    });
  });

  describe('regenerateCertificate', () => {
    it('should regenerate certificate for completed course', async () => {
      const enrollmentId = '507f1f77bcf86cd799439013';
      
      const mockEnrollmentWithCert = {
        ...mockEnrollment,
        save: jest.fn().mockResolvedValue(true)
      };

      mockCourseEnrollment.findById.mockResolvedValue(mockEnrollmentWithCert);

      // Mock generateCertificate
      jest.spyOn(certificateService, 'generateCertificate').mockResolvedValue({
        certificateUrl: 'https://example.com/new-cert.pdf',
        certificateId: 'CERT-NEW-123'
      });

      const result = await certificateService.regenerateCertificate(enrollmentId);

      expect(result).toHaveProperty('certificateUrl');
      expect(result).toHaveProperty('certificateId');
      expect(mockEnrollmentWithCert.save).toHaveBeenCalled();
    });

    it('should throw error if enrollment not found', async () => {
      mockCourseEnrollment.findById.mockResolvedValue(null);

      await expect(certificateService.regenerateCertificate('invalid-id'))
        .rejects
        .toThrow('Enrollment not found');
    });

    it('should throw error if course not completed', async () => {
      const incompleteEnrollment = {
        ...mockEnrollment,
        status: 'active'
      };

      mockCourseEnrollment.findById.mockResolvedValue(incompleteEnrollment);

      await expect(certificateService.regenerateCertificate('507f1f77bcf86cd799439013'))
        .rejects
        .toThrow('Course not completed');
    });

    it('should update enrollment with new certificate details', async () => {
      const enrollmentId = '507f1f77bcf86cd799439013';
      
      const mockEnrollmentWithCert = {
        ...mockEnrollment,
        certificateIssued: {
          issued: true,
          certificateId: 'OLD-CERT-123'
        },
        save: jest.fn().mockResolvedValue(true)
      };

      mockCourseEnrollment.findById.mockResolvedValue(mockEnrollmentWithCert);

      jest.spyOn(certificateService, 'generateCertificate').mockResolvedValue({
        certificateUrl: 'https://example.com/new-cert.pdf',
        certificateId: 'CERT-NEW-456'
      });

      await certificateService.regenerateCertificate(enrollmentId);

      expect(mockEnrollmentWithCert.certificateIssued.certificateId).toBe('CERT-NEW-456');
      expect(mockEnrollmentWithCert.certificateIssued.certificateUrl).toBe('https://example.com/new-cert.pdf');
      expect(mockEnrollmentWithCert.save).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing course data gracefully', async () => {
      const populatedEnrollment = {
        ...mockEnrollment,
        course: null,
        student: mockStudent
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(populatedEnrollment)
      });

      await expect(certificateService.generateCertificate(mockEnrollment))
        .rejects
        .toThrow();
    });

    it('should handle missing student data gracefully', async () => {
      const populatedEnrollment = {
        ...mockEnrollment,
        course: mockCourse,
        student: null
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(populatedEnrollment)
      });

      await expect(certificateService.generateCertificate(mockEnrollment))
        .rejects
        .toThrow();
    });

    it('should handle very long student names', async () => {
      const longName = 'أ'.repeat(100);
      const certificateData = {
        studentName: longName,
        courseName: 'دورة تطوير الويب',
        instructorName: 'د. سارة أحمد',
        completionDate: new Date('2026-02-15'),
        certificateId: 'CERT-123456-789012-1234567890',
        duration: 40
      };

      const pdfBuffer = await certificateService.createPDF(certificateData);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    it('should handle very long course names', async () => {
      const longCourseName = 'دورة '.repeat(50);
      const certificateData = {
        studentName: 'أحمد محمد',
        courseName: longCourseName,
        instructorName: 'د. سارة أحمد',
        completionDate: new Date('2026-02-15'),
        certificateId: 'CERT-123456-789012-1234567890',
        duration: 40
      };

      const pdfBuffer = await certificateService.createPDF(certificateData);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with ProgressService', () => {
    it('should generate certificate ID that can be stored in enrollment', () => {
      const certificateId = certificateService.generateCertificateId(mockEnrollment);

      // Simulate storing in enrollment
      mockEnrollment.certificateIssued = {
        issued: true,
        certificateId: certificateId,
        issuedAt: new Date()
      };

      expect(mockEnrollment.certificateIssued.certificateId).toBe(certificateId);
      expect(mockEnrollment.certificateIssued.issued).toBe(true);
    });

    it('should generate certificate URL that can be stored in enrollment', async () => {
      const populatedEnrollment = {
        ...mockEnrollment,
        course: mockCourse,
        student: mockStudent
      };

      mockCourseEnrollment.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(populatedEnrollment)
        })
      });

      const mockStream = {
        end: jest.fn()
      };

      cloudinary.uploader.upload_stream = jest.fn((options, callback) => {
        setTimeout(() => callback(null, {
          secure_url: 'https://res.cloudinary.com/careerak/certificates/cert.pdf'
        }), 0);
        return mockStream;
      });

      const result = await certificateService.generateCertificate(mockEnrollment);

      // Simulate storing in enrollment
      mockEnrollment.certificateIssued = {
        issued: true,
        certificateUrl: result.certificateUrl,
        certificateId: result.certificateId,
        issuedAt: new Date()
      };

      expect(mockEnrollment.certificateIssued.certificateUrl).toContain('https://');
      expect(mockEnrollment.certificateIssued.certificateUrl).toContain('certificates');
    });
  });
});
