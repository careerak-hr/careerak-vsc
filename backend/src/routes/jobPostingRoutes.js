const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const similarJobsController = require('../controllers/similarJobsController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/', auth, checkRole('Admin', 'HR', 'Manager'), jobPostingController.createJobPosting);
router.get('/', jobPostingController.getAllJobPostings);
router.get('/filter-options', jobPostingController.getFilterOptions);
router.get('/:id', jobPostingController.getJobPostingById);
router.get('/:id/applicant-count', jobPostingController.getApplicantCount);
router.put('/:id', auth, checkRole('Admin', 'HR', 'Manager'), jobPostingController.updateJobPosting);
router.patch('/:id/applicant-count-visibility', auth, checkRole('Admin', 'HR', 'Manager'), jobPostingController.toggleApplicantCountVisibility);
router.delete('/:id', auth, checkRole('Admin', 'HR'), jobPostingController.deleteJobPosting);

// Similar Jobs Routes
router.get('/:id/similar', similarJobsController.getSimilarJobs);
router.post('/:id/similar/refresh', auth, checkRole('Admin'), similarJobsController.refreshSimilarJobs);

module.exports = router;
