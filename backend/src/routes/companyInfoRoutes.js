const express = require('express');
const router = express.Router();
const companyInfoController = require('../controllers/companyInfoController');
const { protect } = require('../middleware/auth');

/**
 * Public routes
 */

// Get company information
router.get('/:id/info', companyInfoController.getCompanyInfo);

// Get company statistics
router.get('/:id/statistics', companyInfoController.getCompanyStatistics);

// Get other jobs from the same company
router.get('/:id/jobs', companyInfoController.getCompanyJobs);

/**
 * Protected routes (require authentication)
 */

// Update company information (company owner only)
router.put('/:id/info', protect, companyInfoController.updateCompanyInfo);

/**
 * Internal routes (for system use)
 */

// Update company rating (called after review)
router.post('/:id/update-rating', companyInfoController.updateCompanyRating);

// Update company response rate (called after application review)
router.post('/:id/update-response-rate', companyInfoController.updateCompanyResponseRate);

// Update all company metrics
router.post('/:id/update-metrics', companyInfoController.updateAllCompanyMetrics);

module.exports = router;
