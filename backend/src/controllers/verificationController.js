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
