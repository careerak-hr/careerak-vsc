const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { auth, checkRole } = require('../middleware/auth');

// New enhanced endpoints
router.post('/', auth, jobApplicationController.submitApplication);
router.get('/:applicationId', auth, jobApplicationController.getApplicationDetails);
router.patch('/:applicationId/withdraw', auth, jobApplicationController.withdrawApplication);
router.patch('/:applicationId/status', auth, checkRole('Admin', 'HR', 'Manager', 'company'), jobApplicationController.updateApplicationStatus);

// Legacy endpoints (kept for backward compatibility)
router.post('/apply', auth, jobApplicationController.applyForJob);
router.get('/job/:jobPostingId', auth, checkRole('Admin', 'HR', 'Manager'), jobApplicationController.getApplicationsForJob);
router.get('/my-applications', auth, jobApplicationController.getMyApplications);
router.put('/:id/status', auth, checkRole('Admin', 'HR', 'Manager'), jobApplicationController.updateApplicationStatusLegacy);

module.exports = router;
