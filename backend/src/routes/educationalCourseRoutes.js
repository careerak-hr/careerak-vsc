const express = require('express');
const router = express.Router();
const educationalCourseController = require('../controllers/educationalCourseController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/', auth, checkRole('Admin', 'HR'), educationalCourseController.createCourse);
router.get('/', educationalCourseController.getAllCourses);
router.get('/:id', educationalCourseController.getCourseById);
router.post('/:id/enroll', auth, educationalCourseController.enrollInCourse);
router.put('/:id', auth, checkRole('Admin', 'HR'), educationalCourseController.updateCourse);

module.exports = router;
