/**
 * A/B Testing Controller
 * 
 * معالج طلبات A/B Testing
 */

const ABTestingService = require('../services/abTestingService');

const abTestingService = new ABTestingService();

/**
 * إنشاء تجربة A/B جديدة
 * POST /api/ab-testing/experiments
 */
exports.createExperiment = async (req, res) => {
  try {
    const { name, description, modelA, modelB, splitRatio, duration, metrics } = req.body;

    // التحقق من الصلاحيات (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بإنشاء تجارب'
      });
    }

    const experiment = await abTestingService.createExperiment({
      name,
      description,
      modelA,
      modelB,
      splitRatio,
      duration,
      metrics
    });

    res.status(201).json({
      success: true,
      experiment
    });

  } catch (error) {
    console.error('خطأ في إنشاء تجربة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إنشاء التجربة',
      error: error.message
    });
  }
};

/**
 * الحصول على جميع التجارب
 * GET /api/ab-testing/experiments
 */
exports.getAllExperiments = async (req, res) => {
  try {
    // التحقق من الصلاحيات (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بعرض التجارب'
      });
    }

    const experiments = abTestingService.getAllExperiments();

    res.json({
      success: true,
      count: experiments.length,
      experiments
    });

  } catch (error) {
    console.error('خطأ في جلب التجارب:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب التجارب',
      error: error.message
    });
  }
};

/**
 * الحصول على تجربة محددة
 * GET /api/ab-testing/experiments/:id
 */
exports.getExperiment = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من الصلاحيات (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بعرض التجربة'
      });
    }

    const experiment = abTestingService.getExperiment(id);

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'تجربة غير موجودة'
      });
    }

    res.json({
      success: true,
      experiment
    });

  } catch (error) {
    console.error('خطأ في جلب التجربة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب التجربة',
      error: error.message
    });
  }
};

/**
 * تحليل نتائج تجربة
 * GET /api/ab-testing/experiments/:id/analysis
 */
exports.analyzeExperiment = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من الصلاحيات (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتحليل التجربة'
      });
    }

    const analysis = await abTestingService.analyzeExperiment(id);

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('خطأ في تحليل التجربة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحليل التجربة',
      error: error.message
    });
  }
};

/**
 * إيقاف تجربة
 * POST /api/ab-testing/experiments/:id/stop
 */
exports.stopExperiment = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من الصلاحيات (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بإيقاف التجربة'
      });
    }

    const experiment = await abTestingService.stopExperiment(id);

    res.json({
      success: true,
      message: 'تم إيقاف التجربة بنجاح',
      experiment
    });

  } catch (error) {
    console.error('خطأ في إيقاف التجربة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إيقاف التجربة',
      error: error.message
    });
  }
};

/**
 * حذف تجربة
 * DELETE /api/ab-testing/experiments/:id
 */
exports.deleteExperiment = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من الصلاحيات (admin only)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف التجربة'
      });
    }

    await abTestingService.deleteExperiment(id);

    res.json({
      success: true,
      message: 'تم حذف التجربة بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف التجربة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف التجربة',
      error: error.message
    });
  }
};

/**
 * تسجيل impression
 * POST /api/ab-testing/track/impression
 */
exports.trackImpression = async (req, res) => {
  try {
    const { experimentId, recommendationId } = req.body;
    const userId = req.user._id;

    await abTestingService.trackImpression(userId, experimentId, recommendationId);

    res.json({
      success: true,
      message: 'تم تسجيل العرض'
    });

  } catch (error) {
    console.error('خطأ في تسجيل العرض:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تسجيل العرض',
      error: error.message
    });
  }
};

/**
 * تسجيل click
 * POST /api/ab-testing/track/click
 */
exports.trackClick = async (req, res) => {
  try {
    const { experimentId, recommendationId } = req.body;
    const userId = req.user._id;

    await abTestingService.trackClick(userId, experimentId, recommendationId);

    res.json({
      success: true,
      message: 'تم تسجيل النقر'
    });

  } catch (error) {
    console.error('خطأ في تسجيل النقر:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تسجيل النقر',
      error: error.message
    });
  }
};

/**
 * تسجيل conversion
 * POST /api/ab-testing/track/conversion
 */
exports.trackConversion = async (req, res) => {
  try {
    const { experimentId, recommendationId } = req.body;
    const userId = req.user._id;

    await abTestingService.trackConversion(userId, experimentId, recommendationId);

    res.json({
      success: true,
      message: 'تم تسجيل التحويل'
    });

  } catch (error) {
    console.error('خطأ في تسجيل التحويل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تسجيل التحويل',
      error: error.message
    });
  }
};

/**
 * تسجيل engagement
 * POST /api/ab-testing/track/engagement
 */
exports.trackEngagement = async (req, res) => {
  try {
    const { experimentId, duration } = req.body;
    const userId = req.user._id;

    await abTestingService.trackEngagement(userId, experimentId, duration);

    res.json({
      success: true,
      message: 'تم تسجيل التفاعل'
    });

  } catch (error) {
    console.error('خطأ في تسجيل التفاعل:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تسجيل التفاعل',
      error: error.message
    });
  }
};
