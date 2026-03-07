/**
 * Certificate Service for Course Completion
 * Handles PDF certificate generation and Cloudinary upload
 */

const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');

class CertificateService {
  constructor(CourseEnrollment, EducationalCourse, User) {
    this.CourseEnrollment = CourseEnrollment;
    this.EducationalCourse = EducationalCourse;
    this.User = User;
  }

  /**
   * Generate certificate for completed course
   * @param {Object} enrollment - Course enrollment
   * @returns {Object} Certificate details { certificateUrl, certificateId }
   */
  async generateCertificate(enrollment) {
    try {
      // Populate enrollment with course and student details
      const populatedEnrollment = await this.CourseEnrollment.findById(enrollment._id)
        .populate('course')
        .populate('student');

      if (!populatedEnrollment) {
        throw new Error('Enrollment not found');
      }

      const course = populatedEnrollment.course;
      const student = populatedEnrollment.student;

      // Generate unique certificate ID
      const certificateId = this.generateCertificateId(enrollment);

      // Prepare certificate data
      const certificateData = {
        studentName: student.fullName || `${student.firstName} ${student.lastName}`,
        courseName: course.title,
        instructorName: course.instructor?.fullName || 'Careerak Team',
        completionDate: enrollment.completedAt || new Date(),
        certificateId: certificateId,
        duration: course.totalDuration,
        issueDate: new Date()
      };

      // Generate PDF
      const pdfBuffer = await this.createPDF(certificateData);

      // Upload to Cloudinary
      const uploadResult = await this.uploadToCloudinary(pdfBuffer, certificateId);

      return {
        certificateUrl: uploadResult.secure_url,
        certificateId: certificateId
      };
    } catch (error) {
      throw new Error(`Failed to generate certificate: ${error.message}`);
    }
  }

  /**
   * Generate unique certificate ID
   * @param {Object} enrollment - Course enrollment
   * @returns {String} Certificate ID
   */
  generateCertificateId(enrollment) {
    const timestamp = Date.now();
    const courseId = enrollment.course.toString().slice(-6);
    const studentId = enrollment.student.toString().slice(-6);
    
    return `CERT-${courseId}-${studentId}-${timestamp}`;
  }

  /**
   * Create PDF certificate
   * @param {Object} data - Certificate data
   * @returns {Promise<Buffer>} PDF buffer
   */
  async createPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Certificate design
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Border
        doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
           .lineWidth(3)
           .stroke('#304B60');

        doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
           .lineWidth(1)
           .stroke('#D48161');

        // Header
        doc.fontSize(40)
           .font('Helvetica-Bold')
           .fillColor('#304B60')
           .text('Certificate of Completion', 0, 100, { align: 'center' });

        // Decorative line
        doc.moveTo(pageWidth / 2 - 150, 160)
           .lineTo(pageWidth / 2 + 150, 160)
           .lineWidth(2)
           .stroke('#D48161');

        // Body text
        doc.fontSize(16)
           .font('Helvetica')
           .fillColor('#000000')
           .text('This is to certify that', 0, 200, { align: 'center' });

        // Student name
        doc.fontSize(32)
           .font('Helvetica-Bold')
           .fillColor('#304B60')
           .text(data.studentName, 0, 240, { align: 'center' });

        // Course completion text
        doc.fontSize(16)
           .font('Helvetica')
           .fillColor('#000000')
           .text('has successfully completed the course', 0, 300, { align: 'center' });

        // Course name
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#D48161')
           .text(data.courseName, 0, 340, { align: 'center', width: pageWidth });

        // Duration
        if (data.duration) {
          doc.fontSize(14)
             .font('Helvetica')
             .fillColor('#666666')
             .text(`Duration: ${data.duration} hours`, 0, 390, { align: 'center' });
        }

        // Footer section
        const footerY = pageHeight - 150;

        // Completion date
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#000000')
           .text(`Completion Date: ${this.formatDate(data.completionDate)}`, 100, footerY);

        // Instructor signature
        doc.fontSize(12)
           .text(`Instructor: ${data.instructorName}`, pageWidth - 300, footerY);

        // Certificate ID
        doc.fontSize(10)
           .fillColor('#666666')
           .text(`Certificate ID: ${data.certificateId}`, 0, footerY + 40, { align: 'center' });

        // Careerak branding
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#304B60')
           .text('Careerak', 0, footerY + 70, { align: 'center' });

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Professional Learning Platform', 0, footerY + 90, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Upload PDF to Cloudinary
   * @param {Buffer} pdfBuffer - PDF buffer
   * @param {String} certificateId - Certificate ID
   * @returns {Promise<Object>} Cloudinary upload result
   */
  async uploadToCloudinary(pdfBuffer, certificateId) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'careerak/certificates',
          resource_type: 'raw',
          public_id: certificateId,
          format: 'pdf',
          tags: ['certificate', 'course-completion']
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(pdfBuffer);
    });
  }

  /**
   * Format date for certificate
   * @param {Date} date - Date to format
   * @returns {String} Formatted date
   */
  formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  }

  /**
   * Verify certificate authenticity
   * @param {String} certificateId - Certificate ID
   * @returns {Object} Certificate verification result
   */
  async verifyCertificate(certificateId) {
    try {
      const enrollment = await this.CourseEnrollment.findOne({
        'certificateIssued.certificateId': certificateId,
        'certificateIssued.issued': true
      })
      .populate('course')
      .populate('student');

      if (!enrollment) {
        return {
          valid: false,
          message: 'Certificate not found'
        };
      }

      return {
        valid: true,
        message: 'Certificate is valid',
        details: {
          studentName: enrollment.student.fullName,
          courseName: enrollment.course.title,
          completionDate: enrollment.completedAt,
          issuedAt: enrollment.certificateIssued.issuedAt
        }
      };
    } catch (error) {
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  /**
   * Regenerate certificate (if needed)
   * @param {String} enrollmentId - Enrollment ID
   * @returns {Object} New certificate details
   */
  async regenerateCertificate(enrollmentId) {
    try {
      const enrollment = await this.CourseEnrollment.findById(enrollmentId);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      if (enrollment.status !== 'completed') {
        throw new Error('Course not completed');
      }

      // Generate new certificate
      const certificate = await this.generateCertificate(enrollment);

      // Update enrollment
      enrollment.certificateIssued = {
        issued: true,
        issuedAt: new Date(),
        certificateUrl: certificate.certificateUrl,
        certificateId: certificate.certificateId
      };

      await enrollment.save();

      return certificate;
    } catch (error) {
      throw new Error(`Failed to regenerate certificate: ${error.message}`);
    }
  }
}

module.exports = CertificateService;
