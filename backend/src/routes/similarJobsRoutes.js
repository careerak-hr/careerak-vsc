const express = require('express');
const router = express.Router();
const similarJobsController = require('../controllers/similarJobsController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/jobs/:id/similar
 * @desc    الحصول على الوظائف المشابهة
 * @access  Public
 */
router.get('/:id/similar', similarJobsController.getSimilarJobs);

/**
 * @route   POST /api/jobs/:id/similar/refresh
 * @desc    تحديث cache الوظائف المشابهة
 * @access  Private (Admin only)
 */
router.post('/:id/similar/refresh', protect, similarJobsController.refreshSimilarJobs);

module.exports = router;
