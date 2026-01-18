const express = require('express');
const router = express.Router();
const trainingCourseController = require('../controllers/trainingCourseController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/', auth, checkRole('Admin', 'HR', 'Manager'), trainingCourseController.createTrainingCourse);
router.get('/', trainingCourseController.getAllTrainingCourses);
router.get('/:id', trainingCourseController.getTrainingCourseById);
router.post('/:id/enroll', auth, checkRole('Admin', 'HR', 'Manager'), trainingCourseController.enrollTrainee);
router.put('/:id/status', auth, checkRole('Admin', 'HR', 'Manager'), trainingCourseController.updateCourseStatus);

module.exports = router;
