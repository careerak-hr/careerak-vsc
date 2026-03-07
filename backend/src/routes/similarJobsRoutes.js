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
 * @route   POST /api/jobs/similarity
 * @desc    حساب درجة التشابه بين وظيفتين
 * @access  Public
 */
router.post('/similarity', similarJobsController.calculateSimilarity);

/**
 * @route   DELETE /api/jobs/:id/similar/cache
 * @desc    تحديث cache الوظائف المشابهة
 * @access  Private (Admin only)
 */
router.delete('/:id/similar/cache', protect, similarJobsController.invalidateCache);

module.exports = router;
