const companyInfoService = require('../services/companyInfoService');

/**
 * Get company info
 * GET /api/companies/:id/info
 */
exports.getCompanyInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const info = await companyInfoService.getCompanyInfo(id);
    
    if (!info) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: info
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
    const stats = await companyInfoService.getCompanyStatistics(id);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get company jobs
 * GET /api/companies/:id/jobs
 */
exports.getCompanyJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const jobs = await companyInfoService.getCompanyJobs(id, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update company information
 * PUT /api/companies/:id/info
 */
exports.updateCompanyInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const updated = await companyInfoService.updateCompanyInfo(id, req.body, userId);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Company not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update company rating
 * POST /api/companies/:id/update-rating
 */
exports.updateCompanyRating = async (req, res) => {
  try {
    const { id } = req.params;
    await companyInfoService.updateCompanyRating(id);
    
    res.status(200).json({
      success: true,
      message: 'Company rating updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update company response rate
 * POST /api/companies/:id/update-response-rate
 */
exports.updateCompanyResponseRate = async (req, res) => {
  try {
    const { id } = req.params;
    await companyInfoService.updateCompanyResponseRate(id);
    
    res.status(200).json({
      success: true,
      message: 'Company response rate updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update all company metrics
 * POST /api/companies/:id/update-metrics
 */
exports.updateAllCompanyMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    await companyInfoService.updateAllCompanyMetrics(id);
    
    res.status(200).json({
      success: true,
      message: 'All company metrics updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
