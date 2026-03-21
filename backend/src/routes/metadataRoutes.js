const express = require('express');
const router = express.Router();
const {
  getJobMetadata,
  getCourseMetadata,
  getProfileMetadata,
  getCompanyMetadata
} = require('../controllers/metadataController');

router.get('/job/:id', getJobMetadata);
router.get('/course/:id', getCourseMetadata);
router.get('/profile/:id', getProfileMetadata);
router.get('/company/:id', getCompanyMetadata);

module.exports = router;
