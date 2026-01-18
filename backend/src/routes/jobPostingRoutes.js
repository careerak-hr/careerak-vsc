const express = require('express');
const router = express.Router();
const jobPostingController = require('../controllers/jobPostingController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/', auth, checkRole('Admin', 'HR', 'Manager'), jobPostingController.createJobPosting);
router.get('/', jobPostingController.getAllJobPostings);
router.get('/:id', jobPostingController.getJobPostingById);
router.put('/:id', auth, checkRole('Admin', 'HR', 'Manager'), jobPostingController.updateJobPosting);
router.delete('/:id', auth, checkRole('Admin', 'HR'), jobPostingController.deleteJobPosting);

module.exports = router;
