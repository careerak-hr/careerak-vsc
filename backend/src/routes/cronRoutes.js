const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Cron Routes
 * All routes require admin authentication
 */

// Get cron status
router.get('/status', protect, authorize('admin'), cronController.getStatus);

// Get available jobs
router.get('/jobs', protect, authorize('admin'), cronController.getJobs);

// Run a specific job manually
router.post('/run/:jobName', protect, authorize('admin'), cronController.runJob);

// Start cron scheduler
router.post('/start', protect, authorize('admin'), cronController.start);

// Stop cron scheduler
router.post('/stop', protect, authorize('admin'), cronController.stop);

module.exports = router;
