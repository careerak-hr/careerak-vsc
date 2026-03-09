const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

/**
 * PDF Generator Service
 * يولد شهادات PDF احترافية بجودة 300 DPI
 */
class PDFGenerator {
  constructor() {
    // الألوان الرسمية من PROJECT_STANDARDS.md
    this.colors = {
      primary: '#304B60',    // كحلي
      secondary: '#E3DAD1',  // بيج
      accent: '#D48161',     // نحاسي
      white: '#FFFFFF',
      black: '#000000',
      text: '#2C3E50'
    };

    // الخطوط (سيتم تحميلها من ملفات)
    this.fonts = {
      arabic: 'Amiri',
      english: 'Cormorant Garamond'
    };

    // إعدادات الصفحة (A4 landscape بجودة 300 DPI)
    this.pageSettings = {
      size: 'A4',
      layout: 'landscape',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    };
  }

  /**
   * توليد شهادة PDF
   * @param {Object} certificateData - بيانات الشهادة
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateCertificate(certificateData) {
    const {
      certificateId,
      userName,
      courseName,
      issueDate,
      qrCodeData,
      verificationUrl,
      instructorName,
      instructorSignature
    } = certificateData;

    return new Promise(async (resolve, reject) => {
      try {
        // إنشاء مستند PDF
        const doc = new PDFDocument({
          ...this.pageSettings,
          info: {
            Title: `Certificate - ${userName}`,
            Author: 'Careerak',
            Subject: `Certificate of Completion - ${courseName}`,
            Keywords: 'certificate, careerak, course, completion'
          }
        });

        // تجميع البيانات في buffer
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        // رسم الشهادة
        await this.drawCertificate(doc, certificateData);

        // إنهاء المستند
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * رسم تصميم الشهادة
   */
  async drawCertificate(doc, data) {
    const { userName, courseName, issueDate, certificateId, qrCodeData, verificationUrl } = data;

    // 1. رسم الإطار الخارجي
    this.drawBorder(doc);

    // 2. رسم الزخارف الجانبية
    this.drawDecorations(doc);

    // 3. إضافة شعار Careerak
    await this.drawLogo(doc);

    // 4. العنوان الرئيسي
    this.drawTitle(doc);

    // 5. نص "شهادة إتمام"
    this.drawSubtitle(doc);

    // 6. نص "يُشهد بأن"
    this.drawCertificationText(doc);

    // 7. اسم المتدرب
    this.drawUserName(doc, userName);

    // 8. نص "قد أتم بنجاح دورة"
    this.drawCompletionText(doc);

    // 9. اسم الدورة
    this.drawCourseName(doc, courseName);

    // 10. التاريخ
    this.drawDate(doc, issueDate);

    // 11. رقم الشهادة
    this.drawCertificateId(doc, certificateId);

    // 12. QR Code
    await this.drawQRCode(doc, qrCodeData, verificationUrl);

    // 13. التوقيع (إذا كان متوفراً)
    if (data.instructorSignature) {
      await this.drawSignature(doc, data.instructorName, data.instructorSignature);
    }

    // 14. Footer
    this.drawFooter(doc);
  }

  /**
   * رسم الإطار الخارجي
   */
  drawBorder(doc) {
    const margin = 30;
    const width = doc.page.width - (margin * 2);
    const height = doc.page.height - (margin * 2);

    // إطار خارجي (كحلي)
    doc
      .rect(margin, margin, width, height)
      .lineWidth(3)
      .stroke(this.colors.primary);

    // إطار داخلي (نحاسي)
    doc
      .rect(margin + 10, margin + 10, width - 20, height - 20)
      .lineWidth(1)
      .stroke(this.colors.accent);
  }

  /**
   * رسم الزخارف الجانبية
   */
  drawDecorations(doc) {
    const centerX = doc.page.width / 2;
    const topY = 60;

    // زخرفة علوية (دوائر متداخلة)
    for (let i = 0; i < 3; i++) {
      doc
        .circle(centerX, topY, 15 - (i * 3))
        .lineWidth(1)
        .stroke(this.colors.accent);
    }

    // خطوط زخرفية جانبية
    const leftX = 80;
    const rightX = doc.page.width - 80;
    const middleY = doc.page.height / 2;

    // خط أيسر
    doc
      .moveTo(leftX, middleY - 50)
      .lineTo(leftX, middleY + 50)
      .lineWidth(2)
      .stroke(this.colors.accent);

    // خط أيمن
    doc
      .moveTo(rightX, middleY - 50)
      .lineTo(rightX, middleY + 50)
      .lineWidth(2)
      .stroke(this.colors.accent);
  }

  /**
   * إضافة شعار Careerak
   */
  async drawLogo(doc) {
    const logoPath = path.join(__dirname, '../../assets/logo.png');
    const centerX = doc.page.width / 2;
    const logoY = 80;
    const logoSize = 60;

    try {
      // محاولة تحميل الشعار
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, centerX - (logoSize / 2), logoY, {
          width: logoSize,
          height: logoSize
        });
      } else {
        // إذا لم يكن الشعار موجوداً، نرسم placeholder
        doc
          .circle(centerX, logoY + (logoSize / 2), logoSize / 2)
          .fill(this.colors.primary);
        
        doc
          .fontSize(20)
          .fillColor(this.colors.white)
          .text('C', centerX - 8, logoY + (logoSize / 2) - 10);
      }
    } catch (error) {
      console.error('Error loading logo:', error);
      // رسم placeholder في حالة الخطأ
      doc
        .circle(centerX, logoY + (logoSize / 2), logoSize / 2)
        .fill(this.colors.primary);
    }
  }

  /**
   * رسم العنوان الرئيسي
   */
  drawTitle(doc) {
    const centerX = doc.page.width / 2;
    const titleY = 160;

    doc
      .fontSize(32)
      .fillColor(this.colors.primary)
      .font('Helvetica-Bold')
      .text('CAREERAK', centerX - 80, titleY, {
        width: 160,
        align: 'center'
      });
  }

  /**
   * رسم "شهادة إتمام"
   */
  drawSubtitle(doc) {
    const centerX = doc.page.width / 2;
    const subtitleY = 200;

    doc
      .fontSize(24)
      .fillColor(this.colors.accent)
      .font('Helvetica')
      .text('شهادة إتمام', centerX - 100, subtitleY, {
        width: 200,
        align: 'center'
      });

    doc
      .fontSize(18)
      .fillColor(this.colors.text)
      .font('Helvetica')
      .text('Certificate of Completion', centerX - 120, subtitleY + 30, {
        width: 240,
        align: 'center'
      });
  }

  /**
   * رسم "يُشهد بأن"
   */
  drawCertificationText(doc) {
    const centerX = doc.page.width / 2;
    const textY = 260;

    doc
      .fontSize(14)
      .fillColor(this.colors.text)
      .font('Helvetica')
      .text('يُشهد بأن', centerX - 50, textY, {
        width: 100,
        align: 'center'
      });
  }

  /**
   * رسم اسم المتدرب
   */
  drawUserName(doc, userName) {
    const centerX = doc.page.width / 2;
    const nameY = 290;

    // خط تحت الاسم
    doc
      .moveTo(centerX - 150, nameY + 35)
      .lineTo(centerX + 150, nameY + 35)
      .lineWidth(2)
      .stroke(this.colors.accent);

    // الاسم
    doc
      .fontSize(28)
      .fillColor(this.colors.primary)
      .font('Helvetica-Bold')
      .text(userName, centerX - 200, nameY, {
        width: 400,
        align: 'center'
      });
  }

  /**
   * رسم "قد أتم بنجاح دورة"
   */
  drawCompletionText(doc) {
    const centerX = doc.page.width / 2;
    const textY = 340;

    doc
      .fontSize(14)
      .fillColor(this.colors.text)
      .font('Helvetica')
      .text('قد أتم بنجاح دورة', centerX - 80, textY, {
        width: 160,
        align: 'center'
      });
  }

  /**
   * رسم اسم الدورة
   */
  drawCourseName(doc, courseName) {
    const centerX = doc.page.width / 2;
    const courseY = 370;

    doc
      .fontSize(20)
      .fillColor(this.colors.primary)
      .font('Helvetica-Bold')
      .text(courseName, centerX - 250, courseY, {
        width: 500,
        align: 'center'
      });
  }

  /**
   * رسم التاريخ
   */
  drawDate(doc, issueDate) {
    const centerX = doc.page.width / 2;
    const dateY = 420;

    const formattedDate = new Date(issueDate).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc
      .fontSize(12)
      .fillColor(this.colors.text)
      .font('Helvetica')
      .text(`تاريخ الإصدار: ${formattedDate}`, centerX - 100, dateY, {
        width: 200,
        align: 'center'
      });
  }

  /**
   * رسم رقم الشهادة
   */
  drawCertificateId(doc, certificateId) {
    const leftX = 60;
    const bottomY = doc.page.height - 70;

    doc
      .fontSize(10)
      .fillColor(this.colors.text)
      .font('Helvetica')
      .text(`رقم الشهادة: ${certificateId}`, leftX, bottomY, {
        width: 200,
        align: 'left'
      });
  }

  /**
   * رسم QR Code
   */
  async drawQRCode(doc, qrCodeData, verificationUrl) {
    const rightX = doc.page.width - 120;
    const bottomY = doc.page.height - 120;
    const qrSize = 80;

    try {
      // توليد QR Code كـ buffer
      const qrBuffer = await QRCode.toBuffer(qrCodeData || verificationUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: qrSize * 3, // 3x للجودة العالية
        margin: 1
      });

      // إضافة QR Code للمستند
      doc.image(qrBuffer, rightX, bottomY, {
        width: qrSize,
        height: qrSize
      });

      // نص "للتحقق"
      doc
        .fontSize(8)
        .fillColor(this.colors.text)
        .font('Helvetica')
        .text('امسح للتحقق', rightX, bottomY + qrSize + 5, {
          width: qrSize,
          align: 'center'
        });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  /**
   * رسم التوقيع
   */
  async drawSignature(doc, instructorName, signaturePath) {
    const centerX = doc.page.width / 2;
    const signatureY = doc.page.height - 140;

    try {
      if (fs.existsSync(signaturePath)) {
        // إضافة صورة التوقيع
        doc.image(signaturePath, centerX - 50, signatureY, {
          width: 100,
          height: 40
        });
      }

      // خط التوقيع
      doc
        .moveTo(centerX - 80, signatureY + 50)
        .lineTo(centerX + 80, signatureY + 50)
        .lineWidth(1)
        .stroke(this.colors.text);

      // اسم المدرب
      doc
        .fontSize(10)
        .fillColor(this.colors.text)
        .font('Helvetica')
        .text(instructorName || 'المدرب', centerX - 80, signatureY + 55, {
          width: 160,
          align: 'center'
        });
    } catch (error) {
      console.error('Error adding signature:', error);
    }
  }

  /**
   * رسم Footer
   */
  drawFooter(doc) {
    const centerX = doc.page.width / 2;
    const footerY = doc.page.height - 40;

    doc
      .fontSize(8)
      .fillColor(this.colors.text)
      .font('Helvetica')
      .text('www.careerak.com | careerak.hr@gmail.com', centerX - 150, footerY, {
        width: 300,
        align: 'center'
      });
  }
}

module.exports = PDFGenerator;
