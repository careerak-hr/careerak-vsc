const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/auth');

router.get('/completion', auth, profileController.getProfileCompletion);
router.get('/suggestions', auth, profileController.getSuggestions);
router.post('/suggestions/:id/complete', auth, profileController.markSuggestionComplete);

module.exports = router;
