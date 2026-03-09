const express = require('express');
const router = express.Router();
const dataExportController = require('../controllers/dataExportController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Request data export
router.post('/export', dataExportController.requestExport);

// Get export status
router.get('/export/:id', dataExportController.getExportStatus);

// Get export history
router.get('/exports', dataExportController.getExportHistory);

// Cancel pending export
router.delete('/export/:id', dataExportController.cancelExport);

// Download export (public with token)
router.get('/download/:token', dataExportController.downloadExport);

module.exports = router;
