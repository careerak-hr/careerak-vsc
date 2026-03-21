const express = require('express');
const router = express.Router();
const shareFeedbackController = require('../controllers/shareFeedbackController');
const { auth, checkRole } = require('../middleware/auth');

/**
 * @route   POST /api/share-feedback
 * @desc    Submit feedback after a share action
 * @access  Optional auth
 */
router.post('/', auth, shareFeedbackController.submitFeedback);

/**
 * @route   GET /api/share-feedback/summary
 * @desc    Get feedback summary (admin)
 * @access  Private (Admin)
 */
router.get('/summary', auth, checkRole('Admin', 'HR'), shareFeedbackController.getFeedbackSummary);

/**
 * @route   GET /api/share-feedback
 * @desc    Get all feedback (admin, paginated)
 * @access  Private (Admin)
 */
router.get('/', auth, checkRole('Admin', 'HR'), shareFeedbackController.getAllFeedback);

module.exports = router;
