const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { auth } = require('../middleware/auth');

/**
 * Export Routes
 * All routes require admin authentication
 */

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
};

/**
 * @route   POST /api/admin/export/users
 * @desc    Export users data
 * @access  Admin only
 * @body    { format: 'excel'|'csv'|'pdf', dateRange: { start, end }, filters: {} }
 */
router.post('/users', auth, isAdmin, exportController.exportUsers);

/**
 * @route   POST /api/admin/export/jobs
 * @desc    Export jobs data
 * @access  Admin only
 * @body    { format: 'excel'|'csv'|'pdf', dateRange: { start, end }, filters: {} }
 */
router.post('/jobs', auth, isAdmin, exportController.exportJobs);

/**
 * @route   POST /api/admin/export/applications
 * @desc    Export applications data
 * @access  Admin only
 * @body    { format: 'excel'|'csv'|'pdf', dateRange: { start, end }, filters: {} }
 */
router.post('/applications', auth, isAdmin, exportController.exportApplications);

/**
 * @route   POST /api/admin/export/courses
 * @desc    Export courses data
 * @access  Admin only
 * @body    { format: 'excel'|'csv'|'pdf', dateRange: { start, end }, filters: {} }
 */
router.post('/courses', auth, isAdmin, exportController.exportCourses);

/**
 * @route   POST /api/admin/export/activity-log
 * @desc    Export activity log data
 * @access  Admin only
 * @body    { format: 'excel'|'csv'|'pdf', dateRange: { start, end }, filters: {} }
 */
router.post('/activity-log', auth, isAdmin, exportController.exportActivityLog);

/**
 * @route   GET /api/admin/export/download/:filename
 * @desc    Download exported file
 * @access  Admin only
 */
router.get('/download/:filename', auth, isAdmin, exportController.downloadExport);

module.exports = router;
