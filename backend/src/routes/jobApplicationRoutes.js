const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controllers/jobApplicationController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/', auth, jobApplicationController.applyForJob);
router.get('/job/:jobPostingId', auth, checkRole('Admin', 'HR', 'Manager'), jobApplicationController.getApplicationsForJob);
router.get('/my-applications', auth, jobApplicationController.getMyApplications);
router.put('/:id/status', auth, checkRole('Admin', 'HR', 'Manager'), jobApplicationController.updateApplicationStatus);

module.exports = router;
