const Certificate = require('../models/Certificate');
const { User } = require('../models/User');
const EducationalCourse = require('../models/EducationalCourse');
const QRCode = require('qrcode');
const crypto = require('crypto');
const PDFGenerator = require('./pdfGenerator');
const cloudinary = require('../config/cloudinary');

class CertificateService {
  constructor() {
    this.pdfGenerator = new PDFGenerator();
  }

  async issueCertificate(userId, courseId, options = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const course = await EducationalCourse.findById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      const existingCertificate = await Certificate.hasCertificate(userId, courseId);
      if (existingCertificate) {
        throw new Error('Certificate already exists for this user and course');
      }

      const certificateId = crypto.randomUUID();
      const verificationUrl = `${process.env.FRONTEND_URL || 'https://careerak.com'}/verify/${certificateId}`;
      const qrCodeData = await this.generateQRCode(verificationUrl);

      const certificate = new Certificate({
        certificateId,
        userId,
        courseId,
        courseName: course.title,
        issueDate: options.issueDate || new Date(),
        expiryDate: options.expiryDate || null,
        qrCode: qrCodeData,
        verificationUrl,
        template: options.templateId || null
      });

      await certificate.save();

      // إرسال إشعار فوري للمستخدم
      try {
        const notificationService = require('./notificationService');
        const certificateUrl = `${process.env.FRONTEND_URL || 'https://careerak.com'}/certificates/${certificate.certificateId}`;
        
        await notificationService.notifyCertificateIssued(
          userId,
          certificate._id,
          course.title,
          certificateUrl
        );
        
        console.log(`✅ Notification sent for certificate ${certificate.certificateId}`);
      } catch (notifError) {
        console.error('Error sending certificate notification:', notifError);
        // لا نفشل العملية إذا فشل الإشعار
      }

      // إرسال بريد إلكتروني
      try {
        const emailService = require('./emailService');
        
        await emailService.sendCertificateIssuedEmail(user, certificate, course);
        
        console.log(`✅ Email sent for certificate ${certificate.certificateId}`);
      } catch (emailError) {
        console.error('Error sending certificate email:', emailError);
        // لا نفشل العملية إذا فشل البريد الإلكتروني
      }

      return {
        success: true,
        certificate: {
          certificateId: certificate.certificateId,
          userName: `${user.firstName} ${user.lastName}`,
          courseName: course.title,
          issueDate: certificate.issueDate,
          verificationUrl: certificate.verificationUrl,
          qrCode: certificate.qrCode,
          status: certificate.status
        }
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  }


  async generateQRCode(data) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 1,
        margin: 1,
        width: 300,
        color: {
          dark: '#304B60',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  async getCertificateById(certificateId) {
    try {
      const certificate = await Certificate.getByCertificateId(certificateId);
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      return {
        success: true,
        certificate: {
          certificateId: certificate.certificateId,
          userName: `${certificate.userId.firstName} ${certificate.userId.lastName}`,
          userEmail: certificate.userId.email,
          userImage: certificate.userId.profileImage,
          courseName: certificate.courseName,
          courseCategory: certificate.courseId?.category,
          courseLevel: certificate.courseId?.level,
          issueDate: certificate.issueDate,
          expiryDate: certificate.expiryDate,
          status: certificate.status,
          verificationUrl: certificate.verificationUrl,
          qrCode: certificate.qrCode,
          pdfUrl: certificate.pdfUrl,
          isValid: certificate.isValid(),
          linkedInShared: certificate.linkedInShared
        }
      };
    } catch (error) {
      console.error('Error getting certificate:', error);
      throw error;
    }
  }

  async getUserCertificates(userId, filters = {}) {
    try {
      const query = { userId };

      // Filter by status
      if (filters.status) {
        query.status = filters.status;
      }

      // Filter by year
      if (filters.year) {
        const startOfYear = new Date(filters.year, 0, 1);
        const endOfYear = new Date(filters.year, 11, 31, 23, 59, 59, 999);
        query.issueDate = {
          $gte: startOfYear,
          $lte: endOfYear
        };
      }

      let certificates = await Certificate.find(query)
        .populate('courseId', 'title category level thumbnail')
        .sort({ issueDate: -1 })
        .exec();

      // Filter by type (course category)
      if (filters.type) {
        certificates = certificates.filter(cert => 
          cert.courseId?.category === filters.type
        );
      }

      // Apply pagination
      const total = certificates.length;
      if (filters.skip) {
        certificates = certificates.slice(filters.skip);
      }
      if (filters.limit) {
        certificates = certificates.slice(0, filters.limit);
      }

      return {
        success: true,
        count: certificates.length,
        total,
        certificates: certificates.map(cert => ({
          certificateId: cert.certificateId,
          courseName: cert.courseName,
          courseTitle: cert.courseId?.title,
          courseThumbnail: cert.courseId?.thumbnail,
          courseCategory: cert.courseId?.category,
          courseLevel: cert.courseId?.level,
          issueDate: cert.issueDate,
          status: cert.status,
          verificationUrl: cert.verificationUrl,
          pdfUrl: cert.pdfUrl,
          isValid: cert.isValid(),
          isHidden: cert.isHidden
        }))
      };
    } catch (error) {
      console.error('Error getting user certificates:', error);
      throw error;
    }
  }

  async verifyCertificate(certificateId) {
    try {
      const certificate = await Certificate.getByCertificateId(certificateId);

      if (!certificate) {
        return {
          success: false,
          valid: false,
          message: 'Certificate not found',
          messageAr: 'الشهادة غير موجودة'
        };
      }

      const isValid = certificate.isValid();

      return {
        success: true,
        valid: isValid,
        message: isValid ? 'Certificate is valid' : 'Certificate is not valid',
        messageAr: isValid ? 'الشهادة صالحة' : 'الشهادة غير صالحة',
        certificate: {
          certificateId: certificate.certificateId,
          userName: `${certificate.userId.firstName} ${certificate.userId.lastName}`,
          courseName: certificate.courseName,
          issueDate: certificate.issueDate,
          expiryDate: certificate.expiryDate,
          status: certificate.status,
          revocationReason: certificate.revocation?.reason || null
        }
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }

  async revokeCertificate(certificateId, revokedBy, reason) {
    try {
      const certificate = await Certificate.findOne({ certificateId });

      if (!certificate) {
        throw new Error('Certificate not found | الشهادة غير موجودة');
      }

      if (certificate.status === 'revoked') {
        throw new Error('Certificate is already revoked | الشهادة ملغاة بالفعل');
      }

      // التحقق من صلاحية المستخدم (المدرب أو الأدمن)
      const { User } = require('../models/User');
      const revoker = await User.findById(revokedBy);
      if (!revoker) {
        throw new Error('Revoker user not found | المستخدم غير موجود');
      }

      const isAdmin = revoker.role === 'admin';
      const isInstructor = revoker.role === 'instructor';

      if (!isAdmin && !isInstructor) {
        throw new Error('Unauthorized: Only instructors or admins can revoke certificates | غير مصرح: فقط المدربون والمسؤولون يمكنهم إلغاء الشهادات');
      }

      // إذا كان مدرباً، تحقق أنه مدرب الدورة
      if (isInstructor && !isAdmin) {
        const EducationalCourse = require('../models/EducationalCourse');
        const course = await EducationalCourse.findById(certificate.courseId);
        if (!course) {
          throw new Error('Course not found | الدورة غير موجودة');
        }
        const courseInstructorId = course.instructor?._id?.toString() || course.instructor?.toString();
        if (courseInstructorId !== revokedBy.toString()) {
          throw new Error('Unauthorized: You can only revoke certificates for your own courses | غير مصرح: يمكنك فقط إلغاء شهادات دوراتك');
        }
      }

      // تنفيذ الإلغاء
      certificate.revoke(revokedBy, reason);

      // إضافة سجل في auditLog
      certificate.addAuditEntry(
        'revoked',
        revokedBy,
        `Revoked by ${revoker.firstName} ${revoker.lastName}. Reason: ${reason || 'No reason provided'}`
      );

      await certificate.save();

      // إرسال إشعار للمتدرب
      try {
        const notificationService = require('./notificationService');
        await notificationService.createNotification({
          recipient: certificate.userId,
          type: 'system',
          title: `تم إلغاء شهادتك | Your Certificate Has Been Revoked`,
          message: `تم إلغاء شهادة "${certificate.courseName}". السبب: ${reason || 'لم يُذكر سبب'} | Your certificate for "${certificate.courseName}" has been revoked. Reason: ${reason || 'No reason provided'}`,
          priority: 'high'
        });
      } catch (notifError) {
        console.error('Error sending revocation notification:', notifError);
        // لا نفشل العملية إذا فشل الإشعار
      }

      return {
        success: true,
        message: 'Certificate revoked successfully',
        messageAr: 'تم إلغاء الشهادة بنجاح',
        certificate: {
          certificateId: certificate.certificateId,
          status: certificate.status,
          revokedAt: certificate.revocation.revokedAt,
          reason: certificate.revocation.reason
        }
      };
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw error;
    }
  }

  async reissueCertificate(originalCertificateId, reissuedBy, reason) {
    try {
      const originalCertificate = await Certificate.findOne({ certificateId: originalCertificateId });

      if (!originalCertificate) {
        throw new Error('Original certificate not found | الشهادة الأصلية غير موجودة');
      }

      // التحقق من صلاحية المستخدم (المدرب أو الأدمن)
      const { User } = require('../models/User');
      const reissuer = await User.findById(reissuedBy);
      if (!reissuer) {
        throw new Error('Reissuer user not found | المستخدم غير موجود');
      }

      const isAdmin = reissuer.role === 'admin';
      const isInstructor = reissuer.role === 'instructor';

      if (!isAdmin && !isInstructor) {
        throw new Error('Unauthorized: Only instructors or admins can reissue certificates | غير مصرح: فقط المدربون والمسؤولون يمكنهم إعادة إصدار الشهادات');
      }

      // إذا كان مدرباً، تحقق أنه مدرب الدورة
      if (isInstructor && !isAdmin) {
        const EducationalCourse = require('../models/EducationalCourse');
        const course = await EducationalCourse.findById(originalCertificate.courseId);
        if (!course) {
          throw new Error('Course not found | الدورة غير موجودة');
        }
        const courseInstructorId = course.instructor?._id?.toString() || course.instructor?.toString();
        if (courseInstructorId !== reissuedBy.toString()) {
          throw new Error('Unauthorized: You can only reissue certificates for your own courses | غير مصرح: يمكنك فقط إعادة إصدار شهادات دوراتك');
        }
      }

      // إلغاء الشهادة الأصلية مع سبب إعادة الإصدار
      originalCertificate.revoke(reissuedBy, 'Reissued - replaced by new certificate');
      originalCertificate.addAuditEntry(
        'reissued',
        reissuedBy,
        `Original certificate revoked for reissue by ${reissuer.firstName} ${reissuer.lastName}. Reason: ${reason || 'No reason provided'}`
      );
      await originalCertificate.save();

      // إنشاء شهادة جديدة
      const newCertificateId = crypto.randomUUID();
      const verificationUrl = `${process.env.FRONTEND_URL || 'https://careerak.com'}/verify/${newCertificateId}`;
      const qrCodeData = await this.generateQRCode(verificationUrl);

      const newCertificate = new Certificate({
        certificateId: newCertificateId,
        userId: originalCertificate.userId,
        courseId: originalCertificate.courseId,
        courseName: originalCertificate.courseName,
        issueDate: new Date(),
        qrCode: qrCodeData,
        verificationUrl,
        template: originalCertificate.template,
        reissue: {
          isReissued: true,
          originalCertificateId: originalCertificateId,
          reissuedAt: new Date(),
          reissuedBy: reissuedBy,
          reason: reason || 'No reason provided'
        },
        auditLog: [
          {
            action: 'issued',
            performedBy: reissuedBy,
            performedAt: new Date(),
            details: `Reissued from certificate ${originalCertificateId} by ${reissuer.firstName} ${reissuer.lastName}. Reason: ${reason || 'No reason provided'}`
          }
        ]
      });

      await newCertificate.save();

      // إرسال إشعار للمتدرب
      try {
        const notificationService = require('./notificationService');
        await notificationService.createNotification({
          recipient: originalCertificate.userId,
          type: 'system',
          title: `تم إعادة إصدار شهادتك | Your Certificate Has Been Reissued`,
          message: `تم إعادة إصدار شهادة "${originalCertificate.courseName}" برقم جديد: ${newCertificateId} | Your certificate for "${originalCertificate.courseName}" has been reissued with new ID: ${newCertificateId}`,
          priority: 'high'
        });
      } catch (notifError) {
        console.error('Error sending reissue notification:', notifError);
        // لا نفشل العملية إذا فشل الإشعار
      }

      return {
        success: true,
        message: 'Certificate reissued successfully',
        messageAr: 'تم إعادة إصدار الشهادة بنجاح',
        certificate: {
          certificateId: newCertificate.certificateId,
          originalCertificateId: originalCertificateId,
          verificationUrl: newCertificate.verificationUrl,
          qrCode: newCertificate.qrCode,
          issueDate: newCertificate.issueDate,
          status: newCertificate.status
        }
      };
    } catch (error) {
      console.error('Error reissuing certificate:', error);
      throw error;
    }
  }

  async markAsSharedOnLinkedIn(certificateId) {
    try {
      const certificate = await Certificate.findOne({ certificateId });

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      certificate.markAsShared();
      await certificate.save();

      return {
        success: true,
        message: 'Certificate marked as shared on LinkedIn',
        messageAr: 'تم تحديد الشهادة كمشاركة على LinkedIn'
      };
    } catch (error) {
      console.error('Error marking certificate as shared:', error);
      throw error;
    }
  }

  async getCertificateStats(userId = null) {
    try {
      const counts = await Certificate.countByStatus(userId);

      return {
        success: true,
        stats: counts
      };
    } catch (error) {
      console.error('Error getting certificate stats:', error);
      throw error;
    }
  }

  /**
   * توليد PDF للشهادة
   * @param {string} certificateId - معرف الشهادة
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generatePDF(certificateId) {
    try {
      const certificate = await Certificate.getByCertificateId(certificateId);
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      const user = certificate.userId;
      const course = certificate.courseId;

      // تحضير بيانات الشهادة
      const certificateData = {
        certificateId: certificate.certificateId,
        userName: `${user.firstName} ${user.lastName}`,
        courseName: certificate.courseName || course?.title,
        issueDate: certificate.issueDate,
        qrCodeData: certificate.verificationUrl,
        verificationUrl: certificate.verificationUrl,
        instructorName: course?.instructor?.name || 'Careerak Team',
        instructorSignature: course?.instructor?.signature || null,
        language: user.language || user.preferredLanguage || 'ar'
      };

      // توليد PDF
      const pdfBuffer = await this.pdfGenerator.generateCertificate(certificateData);

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * توليد وحفظ PDF في Cloudinary
   * @param {string} certificateId - معرف الشهادة
   * @returns {Promise<string>} - رابط PDF في Cloudinary
   */
  async generateAndUploadPDF(certificateId) {
    try {
      // توليد PDF
      const pdfBuffer = await this.generatePDF(certificateId);

      // رفع إلى Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'careerak/certificates',
            resource_type: 'raw',
            format: 'pdf',
            public_id: `certificate-${certificateId}`,
            tags: ['certificate', 'pdf']
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(pdfBuffer);
      });

      // تحديث الشهادة بـ PDF URL
      const certificate = await Certificate.findOne({ certificateId });
      certificate.pdfUrl = uploadResult.secure_url;
      await certificate.save();

      return {
        success: true,
        pdfUrl: uploadResult.secure_url,
        message: 'PDF generated and uploaded successfully',
        messageAr: 'تم توليد ورفع PDF بنجاح'
      };
    } catch (error) {
      console.error('Error generating and uploading PDF:', error);
      throw error;
    }
  }

  async updateCertificateVisibility(certificateId, userId, isHidden) {
    try {
      const certificate = await Certificate.findOne({ certificateId });
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // التحقق من أن المستخدم هو صاحب الشهادة
      if (certificate.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only update your own certificates');
      }

      certificate.isHidden = isHidden;
      await certificate.save();

      return {
        success: true,
        certificate,
        message: `Certificate visibility updated to ${isHidden ? 'hidden' : 'visible'}`,
        messageAr: `تم تحديث رؤية الشهادة إلى ${isHidden ? 'مخفية' : 'مرئية'}`
      };
    } catch (error) {
      console.error('Error updating certificate visibility:', error);
      throw error;
    }
  }
}

module.exports = new CertificateService();
