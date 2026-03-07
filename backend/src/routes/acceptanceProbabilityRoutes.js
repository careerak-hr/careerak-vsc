/**
 * Acceptance Probability Routes
 * 
 * مسارات API لاحتمالية القبول
 */

const express = require('express');
const router = express.Router();
const acceptanceProbabilityController = require('../controllers/acceptanceProbabilityController');
const { protect } = require('../middleware/auth');

// جميع المسارات تحتاج authentication
router.use(protect);

/**
 * @route   GET /api/acceptance-probability/:jobId
 * @desc    حساب احتمالية القبول لوظيفة واحدة
 * @access  Private
 */
router.get('/:jobId', acceptanceProbabilityController.getJobAcceptanceProbability);

/**
 * @route   POST /api/acceptance-probability/bulk
 * @desc    حساب احتمالية القبول لعدة وظائف
 * @access  Private
 */
router.post('/bulk', acceptanceProbabilityController.getBulkAcceptanceProbabilities);

/**
 * @route   GET /api/acceptance-probability/all
 * @desc    حساب احتمالية القبول لجميع الوظائف المتاحة
 * @access  Private
 */
router.get('/all', acceptanceProbabilityController.getAllJobsProbabilities);

module.exports = router;
