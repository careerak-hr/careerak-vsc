const verificationService = require('../services/verificationService');

/**
 * Verification Controller
 * معالج التحقق من الشهادات
 * 
 * Handles public certificate verification requests
 * يتعامل مع طلبات التحقق العامة من الشهادات
 */

/**
 * Verify certificate by ID
 * التحقق من الشهادة بواسطة المعرف
 * 
 * GET /api/verify/:certificateId
 * Public endpoint - no authentication required
 */
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID is required',
        messageAr: 'معرف الشهادة مطلوب',
        messageEn: 'Certificate ID is required',
        messageFr: 'L\'ID du certificat est requis'
      });
    }

    const result = await verificationService.verifyCertificate(certificateId);

    // إذا لم يتم العثور على الشهادة، نرجع 404
    if (!result.found) {
      return res.status(404).json(result);
    }

    // نرجع 200 حتى لو كانت الشهادة غير صالحة (ملغاة أو منتهية)
    // لأننا وجدنا الشهادة ونريد عرض تفاصيلها
    res.status(200).json(result);

  } catch (error) {
    console.error('Error in verifyCertificate controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageAr: 'حدث خطأ في الخادم',
      messageEn: 'Internal server error',
      messageFr: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search certificates
 * البحث عن الشهادات
 * 
 * GET /api/verify/search?q=query&limit=10&skip=0
 * Public endpoint - no authentication required
 */
exports.searchCertificates = async (req, res) => {
  try {
    const { q, limit, skip } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters',
        messageAr: 'يجب أن يكون استعلام البحث 3 أحرف على الأقل',
        messageEn: 'Search query must be at least 3 characters',
        messageFr: 'La requête de recherche doit contenir au moins 3 caractères'
      });
    }

    const options = {
      limit: limit ? parseInt(limit) : 10,
      skip: skip ? parseInt(skip) : 0
    };

    const result = await verificationService.searchCertificates(q.trim(), options);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in searchCertificates controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageAr: 'حدث خطأ في الخادم',
      messageEn: 'Internal server error',
      messageFr: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verify multiple certificates
 * التحقق من عدة شهادات
 * 
 * POST /api/verify/bulk
 * Public endpoint - no authentication required
 * Body: { certificateIds: ['id1', 'id2', ...] }
 */
exports.verifyBulk = async (req, res) => {
  try {
    const { certificateIds } = req.body;

    if (!certificateIds || !Array.isArray(certificateIds) || certificateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Certificate IDs array is required',
        messageAr: 'مصفوفة معرفات الشهادات مطلوبة',
        messageEn: 'Certificate IDs array is required',
        messageFr: 'Le tableau des ID de certificats est requis'
      });
    }

    // حد أقصى 50 شهادة في المرة الواحدة
    if (certificateIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 certificates can be verified at once',
        messageAr: 'يمكن التحقق من 50 شهادة كحد أقصى في المرة الواحدة',
        messageEn: 'Maximum 50 certificates can be verified at once',
        messageFr: 'Maximum 50 certificats peuvent être vérifiés à la fois'
      });
    }

    const result = await verificationService.verifyBulk(certificateIds);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in verifyBulk controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageAr: 'حدث خطأ في الخادم',
      messageEn: 'Internal server error',
      messageFr: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Download verification report as PDF
 * تحميل تقرير التحقق كـ PDF
 * 
 * GET /api/verify/:certificateId/report
 * Public endpoint - no authentication required
 */
exports.downloadVerificationReport = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!certificateId) {
      return res.status(400).json({
        success: false,
        message: 'Certificate ID is required',
        messageAr: 'معرف الشهادة مطلوب'
      });
    }

    const result = await verificationService.verifyCertificate(certificateId);

    if (!result.found) {
      return res.status(404).json(result);
    }

    const cert = result.certificate;
    const isValid = cert.status.isValid;
    const statusLabel = isValid ? 'VALID' : cert.status.code.toUpperCase();
    const statusColor = isValid ? '#10B981' : '#DC2626';
    const issueDate = new Date(cert.dates.issued).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    const expiryDate = cert.dates.expiry
      ? new Date(cert.dates.expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'No Expiry';
    const verifiedAt = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });

    // Build a simple HTML-based PDF report using PDFKit or return HTML for printing
    // Since puppeteer may not be available, we return a structured JSON report
    // that the frontend can use to generate a printable page
    const reportData = {
      reportTitle: 'Certificate Verification Report',
      reportTitleAr: 'تقرير التحقق من الشهادة',
      generatedAt: verifiedAt,
      certificate: {
        id: cert.certificateId,
        holderName: cert.holder.name,
        holderEmail: cert.holder.email,
        courseName: cert.course.name,
        courseCategory: cert.course.category,
        courseLevel: cert.course.level,
        instructor: cert.course.instructor,
        issueDate,
        expiryDate,
        status: statusLabel,
        statusColor,
        isValid,
        verificationUrl: cert.links.verification,
        revocationReason: cert.revocation?.reason || null,
        revokedAt: cert.revocation?.revokedAt
          ? new Date(cert.revocation.revokedAt).toLocaleDateString('en-US')
          : null
      },
      platform: 'Careerak',
      disclaimer: 'This report was generated automatically by the Careerak platform. The information is accurate as of the generation date.'
    };

    // Return as JSON with a header indicating it's a report
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="verification-report-${certificateId}.json"`);
    res.status(200).json({ success: true, report: reportData });

  } catch (error) {
    console.error('Error in downloadVerificationReport controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageAr: 'حدث خطأ في الخادم'
    });
  }
};

/**
 * Get verification statistics
 * الحصول على إحصائيات التحقق
 * 
 * GET /api/verify/stats
 * Public endpoint - no authentication required
 */
exports.getVerificationStats = async (req, res) => {
  try {
    const result = await verificationService.getVerificationStats();

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in getVerificationStats controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      messageAr: 'حدث خطأ في الخادم',
      messageEn: 'Internal server error',
      messageFr: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
