const certificateService = require('../services/certificateService');

exports.issueCertificate = async (req, res) => {
  try {
    const { userId, courseId, issueDate, expiryDate, templateId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'userId and courseId are required',
        messageAr: 'معرف المستخدم ومعرف الدورة مطلوبان'
      });
    }

    const result = await certificateService.issueCertificate(userId, courseId, {
      issueDate,
      expiryDate,
      templateId
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in issueCertificate controller:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء إصدار الشهادة'
    });
  }
};

exports.getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const result = await certificateService.getCertificateById(certificateId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getCertificateById controller:', error);
    res.status(404).json({
      success: false,
      message: error.message,
      messageAr: 'الشهادة غير موجودة'
    });
  }
};

exports.getUserCertificates = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit, skip } = req.query;

    const filters = {
      status,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined
    };

    const result = await certificateService.getUserCertificates(userId, filters);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getUserCertificates controller:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء جلب الشهادات'
    });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const result = await certificateService.verifyCertificate(certificateId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in verifyCertificate controller:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء التحقق من الشهادة'
    });
  }
};

exports.revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;
    const revokedBy = req.user._id;

    const result = await certificateService.revokeCertificate(certificateId, revokedBy, reason);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in revokeCertificate controller:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء إلغاء الشهادة'
    });
  }
};

exports.reissueCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { reason } = req.body;
    const reissuedBy = req.user._id;

    const result = await certificateService.reissueCertificate(certificateId, reissuedBy, reason);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in reissueCertificate controller:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء إعادة إصدار الشهادة'
    });
  }
};

exports.markAsSharedOnLinkedIn = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const result = await certificateService.markAsSharedOnLinkedIn(certificateId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in markAsSharedOnLinkedIn controller:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء تحديث حالة المشاركة'
    });
  }
};

exports.getCertificateStats = async (req, res) => {
  try {
    const { userId } = req.query;

    const result = await certificateService.getCertificateStats(userId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getCertificateStats controller:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء جلب الإحصائيات'
    });
  }
};

exports.downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    // توليد PDF بجودة عالية (300 DPI)
    const pdfBuffer = await certificateService.generatePDF(certificateId);

    // الحصول على بيانات الشهادة لاسم الملف
    const certificateData = await certificateService.getCertificateById(certificateId);
    
    // تنظيف اسم المستخدم واسم الدورة لاستخدامهما في اسم الملف
    const userName = certificateData.certificate.userName
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-');
    const courseName = certificateData.certificate.courseName
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-');
    
    const filename = `certificate-${userName}-${courseName}.pdf`;

    // إعداد headers للتحميل
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // إرسال PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in downloadCertificate controller:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      messageAr: 'حدث خطأ أثناء تحميل الشهادة'
    });
  }
};
