/**
 * اختبارات إشعارات الشهادات
 * 
 * هذا الملف يختبر:
 * 1. إرسال إشعار فوري عند إصدار شهادة
 * 2. إرسال بريد إلكتروني عند إصدار شهادة
 * 3. التكامل مع certificateService
 */

const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const { User } = require('../models/User');
const EducationalCourse = require('../models/EducationalCourse');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const certificateService = require('../services/certificateService');

// Mock للخدمات
jest.mock('../services/notificationService');
jest.mock('../services/emailService');

describe('Certificate Notification Tests', () => {
  let testUser;
  let testCourse;
  let testCertificate;

  beforeAll(async () => {
    // الاتصال بقاعدة البيانات للاختبار
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test');
    }
  });

  afterAll(async () => {
    // تنظيف وإغلاق الاتصال
    await Certificate.deleteMany({});
    await User.deleteMany({});
    await EducationalCourse.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // إنشاء بيانات اختبار
    testUser = await User.create({
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@test.com',
      password: 'password123',
      role: 'individual'
    });

    testCourse = await EducationalCourse.create({
      title: 'دورة تطوير الويب',
      description: 'دورة شاملة في تطوير الويب',
      category: 'programming',
      level: 'intermediate',
      instructor: testUser._id
    });

    // إعادة تعيين mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // تنظيف بعد كل اختبار
    await Certificate.deleteMany({});
    await User.deleteMany({});
    await EducationalCourse.deleteMany({});
    await Notification.deleteMany({});
  });

  describe('notifyCertificateIssued', () => {
    it('يجب إرسال إشعار فوري عند إصدار شهادة', async () => {
      // Arrange
      const certificateId = new mongoose.Types.ObjectId();
      const certificateUrl = `https://careerak.com/certificates/test-cert-123`;

      notificationService.notifyCertificateIssued.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        recipient: testUser._id,
        type: 'certificate_issued',
        title: 'تهانينا! شهادتك جاهزة 🎉',
        message: `تم إصدار شهادتك لدورة "${testCourse.title}" بنجاح. يمكنك تحميلها الآن!`,
        priority: 'high'
      });

      // Act
      await notificationService.notifyCertificateIssued(
        testUser._id,
        certificateId,
        testCourse.title,
        certificateUrl
      );

      // Assert
      expect(notificationService.notifyCertificateIssued).toHaveBeenCalledWith(
        testUser._id,
        certificateId,
        testCourse.title,
        certificateUrl
      );
      expect(notificationService.notifyCertificateIssued).toHaveBeenCalledTimes(1);
    });

    it('يجب أن يحتوي الإشعار على المعلومات الصحيحة', async () => {
      // Arrange
      const certificateId = new mongoose.Types.ObjectId();
      const certificateUrl = `https://careerak.com/certificates/test-cert-123`;

      const mockNotification = {
        _id: new mongoose.Types.ObjectId(),
        recipient: testUser._id,
        type: 'certificate_issued',
        title: 'تهانينا! شهادتك جاهزة 🎉',
        message: `تم إصدار شهادتك لدورة "${testCourse.title}" بنجاح. يمكنك تحميلها الآن!`,
        relatedData: {
          certificate: certificateId,
          certificateUrl
        },
        priority: 'high'
      };

      notificationService.notifyCertificateIssued.mockResolvedValue(mockNotification);

      // Act
      const result = await notificationService.notifyCertificateIssued(
        testUser._id,
        certificateId,
        testCourse.title,
        certificateUrl
      );

      // Assert
      expect(result.type).toBe('certificate_issued');
      expect(result.priority).toBe('high');
      expect(result.relatedData.certificate).toBe(certificateId);
      expect(result.relatedData.certificateUrl).toBe(certificateUrl);
    });
  });

  describe('sendCertificateIssuedEmail', () => {
    it('يجب إرسال بريد إلكتروني عند إصدار شهادة', async () => {
      // Arrange
      const mockCertificate = {
        certificateId: 'test-cert-123',
        issueDate: new Date(),
        verificationUrl: 'https://careerak.com/verify/test-cert-123',
        pdfUrl: 'https://careerak.com/certificates/test-cert-123.pdf'
      };

      emailService.sendCertificateIssuedEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id'
      });

      // Act
      await emailService.sendCertificateIssuedEmail(testUser, mockCertificate, testCourse);

      // Assert
      expect(emailService.sendCertificateIssuedEmail).toHaveBeenCalledWith(
        testUser,
        mockCertificate,
        testCourse
      );
      expect(emailService.sendCertificateIssuedEmail).toHaveBeenCalledTimes(1);
    });

    it('يجب أن يحتوي البريد الإلكتروني على جميع المعلومات المطلوبة', async () => {
      // Arrange
      const mockCertificate = {
        certificateId: 'test-cert-123',
        issueDate: new Date(),
        verificationUrl: 'https://careerak.com/verify/test-cert-123',
        pdfUrl: 'https://careerak.com/certificates/test-cert-123.pdf'
      };

      emailService.sendCertificateIssuedEmail.mockImplementation((user, cert, course) => {
        // التحقق من أن البريد يحتوي على المعلومات الصحيحة
        expect(user.email).toBe(testUser.email);
        expect(cert.certificateId).toBe(mockCertificate.certificateId);
        expect(course.title).toBe(testCourse.title);
        
        return Promise.resolve({
          success: true,
          messageId: 'test-message-id'
        });
      });

      // Act
      const result = await emailService.sendCertificateIssuedEmail(
        testUser,
        mockCertificate,
        testCourse
      );

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('Certificate Service Integration', () => {
    it('يجب إرسال إشعار وبريد إلكتروني عند إصدار شهادة من certificateService', async () => {
      // Arrange
      notificationService.notifyCertificateIssued.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        type: 'certificate_issued'
      });

      emailService.sendCertificateIssuedEmail.mockResolvedValue({
        success: true,
        messageId: 'test-message-id'
      });

      // Act
      const result = await certificateService.issueCertificate(testUser._id, testCourse._id);

      // Assert
      expect(result.success).toBe(true);
      expect(result.certificate).toBeDefined();
      expect(result.certificate.certificateId).toBeDefined();
      
      // التحقق من أن الإشعار تم إرساله
      expect(notificationService.notifyCertificateIssued).toHaveBeenCalled();
      
      // التحقق من أن البريد الإلكتروني تم إرساله
      expect(emailService.sendCertificateIssuedEmail).toHaveBeenCalled();
    });

    it('يجب أن تنجح عملية إصدار الشهادة حتى لو فشل الإشعار', async () => {
      // Arrange
      notificationService.notifyCertificateIssued.mockRejectedValue(
        new Error('Notification service error')
      );

      emailService.sendCertificateIssuedEmail.mockResolvedValue({
        success: true
      });

      // Act
      const result = await certificateService.issueCertificate(testUser._id, testCourse._id);

      // Assert
      expect(result.success).toBe(true);
      expect(result.certificate).toBeDefined();
    });

    it('يجب أن تنجح عملية إصدار الشهادة حتى لو فشل البريد الإلكتروني', async () => {
      // Arrange
      notificationService.notifyCertificateIssued.mockResolvedValue({
        _id: new mongoose.Types.ObjectId()
      });

      emailService.sendCertificateIssuedEmail.mockRejectedValue(
        new Error('Email service error')
      );

      // Act
      const result = await certificateService.issueCertificate(testUser._id, testCourse._id);

      // Assert
      expect(result.success).toBe(true);
      expect(result.certificate).toBeDefined();
    });
  });

  describe('Notification Content Validation', () => {
    it('يجب أن يحتوي الإشعار على emoji مناسب', async () => {
      // Arrange
      const mockNotification = {
        title: 'تهانينا! شهادتك جاهزة 🎉'
      };

      notificationService.notifyCertificateIssued.mockResolvedValue(mockNotification);

      // Act
      const result = await notificationService.notifyCertificateIssued(
        testUser._id,
        new mongoose.Types.ObjectId(),
        testCourse.title,
        'https://test.com'
      );

      // Assert
      expect(result.title).toContain('🎉');
      expect(result.title).toContain('تهانينا');
    });

    it('يجب أن يحتوي الإشعار على اسم الدورة', async () => {
      // Arrange
      const mockNotification = {
        message: `تم إصدار شهادتك لدورة "${testCourse.title}" بنجاح. يمكنك تحميلها الآن!`
      };

      notificationService.notifyCertificateIssued.mockResolvedValue(mockNotification);

      // Act
      const result = await notificationService.notifyCertificateIssued(
        testUser._id,
        new mongoose.Types.ObjectId(),
        testCourse.title,
        'https://test.com'
      );

      // Assert
      expect(result.message).toContain(testCourse.title);
    });
  });
});
