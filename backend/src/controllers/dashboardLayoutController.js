const {
  getLayout,
  saveLayout,
  resetLayout,
  getDefaultWidgets
} = require('../services/dashboardLayoutService');
const logger = require('../utils/logger');

/**
 * Dashboard Layout Controller
 * Handles HTTP requests for dashboard layout operations
 * Requirements: 4.3, 4.8, 4.9
 */

/**
 * GET /api/admin/dashboard/layout
 * Get dashboard layout for the authenticated admin
 * Requirements: 4.8
 */
const getLayoutHandler = async (req, res) => {
  try {
    // Get admin ID from authenticated user
    const adminId = req.user._id || req.user.id;

    // Fetch layout
    const layout = await getLayout(adminId);

    res.status(200).json({
      success: true,
      data: layout
    });
  } catch (error) {
    logger.error('Error in getLayoutHandler', {
      error: error.message,
      adminId: req.user?._id || req.user?.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard layout',
      message: error.message
    });
  }
};

/**
 * PUT /api/admin/dashboard/layout
 * Save dashboard layout for the authenticated admin
 * Requirements: 4.3, 4.7
 */
const saveLayoutHandler = async (req, res) => {
  try {
    // Get admin ID from authenticated user
    const adminId = req.user._id || req.user.id;

    // Get layout data from request body
    const { widgets, theme, sidebarCollapsed } = req.body;

    // Validate that at least one field is provided
    if (!widgets && !theme && typeof sidebarCollapsed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'No layout data provided',
        message: 'Please provide at least one of: widgets, theme, or sidebarCollapsed'
      });
    }

    // Save layout
    const layout = await saveLayout(adminId, {
      widgets,
      theme,
      sidebarCollapsed
    });

    res.status(200).json({
      success: true,
      data: layout,
      message: 'Dashboard layout saved successfully'
    });
  } catch (error) {
    logger.error('Error in saveLayoutHandler', {
      error: error.message,
      adminId: req.user?._id || req.user?.id,
      body: req.body
    });

    // Handle validation errors with 400 status
    if (error.message.startsWith('Invalid')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to save dashboard layout',
      message: error.message
    });
  }
};

/**
 * POST /api/admin/dashboard/layout/reset
 * Reset dashboard layout to default for the authenticated admin
 * Requirements: 4.9
 */
const resetLayoutHandler = async (req, res) => {
  try {
    // Get admin ID from authenticated user
    const adminId = req.user._id || req.user.id;

    // Reset layout
    const layout = await resetLayout(adminId);

    res.status(200).json({
      success: true,
      data: layout,
      message: 'Dashboard layout reset to default successfully'
    });
  } catch (error) {
    logger.error('Error in resetLayoutHandler', {
      error: error.message,
      adminId: req.user?._id || req.user?.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to reset dashboard layout',
      message: error.message
    });
  }
};

/**
 * GET /api/admin/dashboard/layout/defaults
 * Get default widget configurations
 * Useful for frontend to know available widget types and default layout
 */
const getDefaultWidgetsHandler = async (req, res) => {
  try {
    const defaultWidgets = getDefaultWidgets();

    res.status(200).json({
      success: true,
      data: {
        widgets: defaultWidgets,
        theme: 'light',
        sidebarCollapsed: false
      }
    });
  } catch (error) {
    logger.error('Error in getDefaultWidgetsHandler', {
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch default widgets',
      message: error.message
    });
  }
};

module.exports = {
  getLayoutHandler,
  saveLayoutHandler,
  resetLayoutHandler,
  getDefaultWidgetsHandler
};
