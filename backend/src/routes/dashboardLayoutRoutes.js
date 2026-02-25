const express = require('express');
const router = express.Router();
const {
  getLayoutHandler,
  saveLayoutHandler,
  resetLayoutHandler,
  getDefaultWidgetsHandler
} = require('../controllers/dashboardLayoutController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Dashboard Layout Routes
 * All routes require authentication and admin/moderator authorization
 * Requirements: 4.3, 4.8, 4.9
 */

// Apply authentication and authorization to all routes
router.use(protect);
router.use(authorize('admin', 'moderator'));

/**
 * @route   GET /api/admin/dashboard/layout
 * @desc    Get dashboard layout for the authenticated admin
 * @access  Admin, Moderator
 * @returns {object} Layout object with widgets, theme, and sidebarCollapsed
 * 
 * Requirements: 4.8 - Load saved layout on login
 */
router.get('/', getLayoutHandler);

/**
 * @route   PUT /api/admin/dashboard/layout
 * @desc    Save dashboard layout for the authenticated admin
 * @access  Admin, Moderator
 * @body    {array} widgets - Array of widget configurations (optional)
 * @body    {string} theme - Theme: 'light' or 'dark' (optional)
 * @body    {boolean} sidebarCollapsed - Sidebar state (optional)
 * @returns {object} Saved layout object
 * 
 * Requirements: 4.3 - Save layout automatically
 * Requirements: 4.7 - Save widget resize
 */
router.put('/', saveLayoutHandler);

/**
 * @route   POST /api/admin/dashboard/layout/reset
 * @desc    Reset dashboard layout to default for the authenticated admin
 * @access  Admin, Moderator
 * @returns {object} Default layout object
 * 
 * Requirements: 4.9 - Reset to default layout
 */
router.post('/reset', resetLayoutHandler);

/**
 * @route   GET /api/admin/dashboard/layout/defaults
 * @desc    Get default widget configurations
 * @access  Admin, Moderator
 * @returns {object} Default layout with widgets, theme, and sidebarCollapsed
 * 
 * Useful for frontend to know available widget types and default layout
 */
router.get('/defaults', getDefaultWidgetsHandler);

module.exports = router;
