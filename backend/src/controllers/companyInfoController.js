const companyInfoService = require('../services/companyInfoService');

/**
 * Get company information
 * GET /api/companies/:id/info
 */
exports.getCompanyInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyInfo = await companyInfoService.getCompanyInfo(id);
    
    res.status(200).json({
      success: true,
      data: companyInfo
    });
  } catch (error) {
    console.error('Error in getCompanyInfo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء جلب معلومات الشركة'
    });
  }
};

/**
 * Update company information
 * PUT /api/companies/:id/info
 * Auth: Company only
 */
exports.updateCompanyInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    
    // Check if user is the company owner
    if (userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتحديث معلومات هذه الشركة'
      });
    }
    
    const updateData = req.body;
    
    // Validate and sanitize update data
    const allowedFields = [
      'logo', 'name', 'size', 'employeeCount', 
      'website', 'description'
    ];
    
    const sanitizedData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    });
    
    // Auto-determine size if employeeCount is provided
    if (sanitizedData.employeeCount) {
      sanitizedData.size = companyInfoService.determineCompanySize(
        sanitizedData.employeeCount
      );
    }
    
    const companyInfo = await companyInfoService.updateCompanyInfo(id, sanitizedData);
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث معلومات الشركة بنجاح',
      data: companyInfo
    });
  } catch (error) {
    console.error('Error in updateCompanyInfo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تحديث معلومات الشركة'
    });
  }
};

/**
 * Get company statistics
 * GET /api/companies/:id/statistics
 */
exports.getCompanyStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const statistics = await companyInfoService.getCompanyStatistics(id);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error in getCompanyStatistics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء جلب إحصائيات الشركة'
    });
  }
};

/**
 * Get other jobs from the same company
 * GET /api/companies/:id/jobs
 */
exports.getCompanyJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentJobId, limit = 5 } = req.query;
    
    const jobs = await companyInfoService.getCompanyJobs(
      id, 
      currentJobId, 
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Error in getCompanyJobs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء جلب وظائف الشركة'
    });
  }
};

/**
 * Update company rating (called after review)
 * POST /api/companies/:id/update-rating
 * Internal use only
 */
exports.updateCompanyRating = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyInfo = await companyInfoService.updateCompanyRating(id);
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث تقييم الشركة بنجاح',
      data: companyInfo
    });
  } catch (error) {
    console.error('Error in updateCompanyRating:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تحديث تقييم الشركة'
    });
  }
};

/**
 * Update company response rate (called after application review)
 * POST /api/companies/:id/update-response-rate
 * Internal use only
 */
exports.updateCompanyResponseRate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyInfo = await companyInfoService.updateCompanyResponseRate(id);
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث معدل استجابة الشركة بنجاح',
      data: companyInfo
    });
  } catch (error) {
    console.error('Error in updateCompanyResponseRate:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تحديث معدل استجابة الشركة'
    });
  }
};

/**
 * Update all company metrics
 * POST /api/companies/:id/update-metrics
 * Internal use only
 */
exports.updateAllCompanyMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const companyInfo = await companyInfoService.updateAllCompanyMetrics(id);
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث جميع مقاييس الشركة بنجاح',
      data: companyInfo
    });
  } catch (error) {
    console.error('Error in updateAllCompanyMetrics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'حدث خطأ أثناء تحديث مقاييس الشركة'
    });
  }
};
