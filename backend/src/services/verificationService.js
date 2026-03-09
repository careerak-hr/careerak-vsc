const Certificate = require('../models/Certificate');

/**
 * Verification Service
 * خدمة التحقق من الشهادات
 * 
 * Handles certificate verification for public access
 * يتعامل مع التحقق من الشهادات للوصول العام
 */
class VerificationService {
  /**
   * Verify certificate by ID
   * التحقق من الشهادة بواسطة المعرف
   * 
   * @param {string} certificateId - Certificate ID (UUID)
   * @returns {Promise<Object>} Verification result
   */
  async verifyCertificate(certificateId) {
    try {
      // البحث عن الشهادة مع بيانات المستخدم والدورة
      const certificate = await Certificate.getByCertificateId(certificateId);

      if (!certificate) {
        return {
          success: false,
          valid: false,
          found: false,
          message: 'Certificate not found',
          messageAr: 'الشهادة غير موجودة',
          messageEn: 'Certificate not found',
          messageFr: 'Certificat introuvable'
        };
      }

      // فحص صلاحية الشهادة
      const isValid = certificate.isValid();
      const status = certificate.status;

      // تحضير رسائل الحالة
      let statusMessage = '';
      let statusMessageAr = '';
      let statusMessageEn = '';
      let statusMessageFr = '';

      if (status === 'active' && isValid) {
        statusMessage = 'Certificate is valid and active';
        statusMessageAr = 'الشهادة صالحة ونشطة';
        statusMessageEn = 'Certificate is valid and active';
        statusMessageFr = 'Le certificat est valide et actif';
      } else if (status === 'revoked') {
        statusMessage = 'Certificate has been revoked';
        statusMessageAr = 'تم إلغاء الشهادة';
        statusMessageEn = 'Certificate has been revoked';
        statusMessageFr = 'Le certificat a été révoqué';
      } else if (status === 'expired') {
        statusMessage = 'Certificate has expired';
        statusMessageAr = 'انتهت صلاحية الشهادة';
        statusMessageEn = 'Certificate has expired';
        statusMessageFr = 'Le certificat a expiré';
      } else {
        statusMessage = 'Certificate is not valid';
        statusMessageAr = 'الشهادة غير صالحة';
        statusMessageEn = 'Certificate is not valid';
        statusMessageFr = 'Le certificat n\'est pas valide';
      }

      // تحضير بيانات الشهادة للعرض
      const certificateData = {
        certificateId: certificate.certificateId,
        
        // بيانات المستخدم
        holder: {
          name: `${certificate.userId.firstName} ${certificate.userId.lastName}`,
          email: certificate.userId.email,
          profileImage: certificate.userId.profileImage || null
        },
        
        // بيانات الدورة
        course: {
          name: certificate.courseName,
          category: certificate.courseId?.category || null,
          level: certificate.courseId?.level || null,
          instructor: certificate.courseId?.instructor?.name || null
        },
        
        // تواريخ
        dates: {
          issued: certificate.issueDate,
          expiry: certificate.expiryDate || null,
          ageInDays: certificate.ageInDays,
          daysUntilExpiry: certificate.daysUntilExpiry
        },
        
        // الحالة
        status: {
          code: status,
          isValid: isValid,
          message: statusMessage,
          messageAr: statusMessageAr,
          messageEn: statusMessageEn,
          messageFr: statusMessageFr
        },
        
        // معلومات الإلغاء (إذا كانت ملغاة)
        revocation: status === 'revoked' ? {
          revokedAt: certificate.revocation?.revokedAt || null,
          reason: certificate.revocation?.reason || null
        } : null,
        
        // معلومات إعادة الإصدار (إذا كانت معاد إصدارها)
        reissue: certificate.reissue?.isReissued ? {
          originalCertificateId: certificate.reissue.originalCertificateId,
          reissuedAt: certificate.reissue.reissuedAt,
          reason: certificate.reissue.reason
        } : null,
        
        // روابط
        links: {
          verification: certificate.verificationUrl,
          pdf: certificate.pdfUrl || null,
          qrCode: certificate.qrCode
        }
      };

      return {
        success: true,
        valid: isValid,
        found: true,
        message: statusMessage,
        messageAr: statusMessageAr,
        messageEn: statusMessageEn,
        messageFr: statusMessageFr,
        certificate: certificateData
      };

    } catch (error) {
      console.error('Error in verifyCertificate:', error);
      throw error;
    }
  }

  /**
   * Search certificates by holder name or course name
   * البحث عن الشهادات بواسطة اسم الحامل أو اسم الدورة
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchCertificates(query, options = {}) {
    try {
      const limit = options.limit || 10;
      const skip = options.skip || 0;

      // البحث في اسم الدورة
      const certificates = await Certificate.find({
        courseName: { $regex: query, $options: 'i' },
        status: 'active' // فقط الشهادات النشطة
      })
        .populate('userId', 'firstName lastName email profileImage')
        .populate('courseId', 'title category level')
        .sort({ issueDate: -1 })
        .limit(limit)
        .skip(skip);

      return {
        success: true,
        count: certificates.length,
        certificates: certificates.map(cert => ({
          certificateId: cert.certificateId,
          holderName: `${cert.userId.firstName} ${cert.userId.lastName}`,
          courseName: cert.courseName,
          issueDate: cert.issueDate,
          status: cert.status,
          verificationUrl: cert.verificationUrl
        }))
      };

    } catch (error) {
      console.error('Error in searchCertificates:', error);
      throw error;
    }
  }

  /**
   * Verify multiple certificates at once
   * التحقق من عدة شهادات دفعة واحدة
   * 
   * @param {Array<string>} certificateIds - Array of certificate IDs
   * @returns {Promise<Object>} Bulk verification results
   */
  async verifyBulk(certificateIds) {
    try {
      const results = await Promise.all(
        certificateIds.map(id => this.verifyCertificate(id))
      );

      const summary = {
        total: results.length,
        valid: results.filter(r => r.valid).length,
        invalid: results.filter(r => !r.valid && r.found).length,
        notFound: results.filter(r => !r.found).length
      };

      return {
        success: true,
        summary,
        results
      };

    } catch (error) {
      console.error('Error in verifyBulk:', error);
      throw error;
    }
  }

  /**
   * Get verification statistics
   * الحصول على إحصائيات التحقق
   * 
   * @returns {Promise<Object>} Verification statistics
   */
  async getVerificationStats() {
    try {
      const stats = await Certificate.countByStatus();

      return {
        success: true,
        stats: {
          total: stats.total,
          active: stats.active,
          revoked: stats.revoked,
          expired: stats.expired,
          validPercentage: stats.total > 0 
            ? ((stats.active / stats.total) * 100).toFixed(2) 
            : 0
        }
      };

    } catch (error) {
      console.error('Error in getVerificationStats:', error);
      throw error;
    }
  }
}

module.exports = new VerificationService();
