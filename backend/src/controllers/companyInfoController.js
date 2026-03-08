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
