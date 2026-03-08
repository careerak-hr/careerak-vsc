const portfolioService = require('../services/portfolioService');

/**
 * Add a new portfolio item
 * POST /api/portfolio/items
 */
exports.addPortfolioItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemData = req.body;
    const file = req.file; // From multer

    const item = await portfolioService.addPortfolioItem(userId, itemData, file);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Portfolio item added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all portfolio items for the current user
 * GET /api/portfolio/items
 */
exports.getUserPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await portfolioService.getUserPortfolio(userId);

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete a portfolio item
 * DELETE /api/portfolio/items/:id
 */
exports.deletePortfolioItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: itemId } = req.params;

    await portfolioService.deletePortfolioItem(userId, itemId);

    res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
