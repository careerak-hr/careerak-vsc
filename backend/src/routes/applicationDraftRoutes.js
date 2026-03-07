const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const applicationDraftController = require('../controllers/applicationDraftController');

/**
 * Application Draft Routes
 * All routes require authentication
 * Requirements: 2.1, 2.2, 2.3, 2.7, 11.1
 */

// Create or update draft
// POST /api/applications/drafts
router.post(
  '/drafts',
  auth,
  applicationDraftController.createOrUpdateDraft
);

// Get all drafts for authenticated user
// GET /api/applications/drafts
router.get(
  '/drafts',
  auth,
  applicationDraftController.getAllDrafts
);

// Get draft for specific job posting
// GET /api/applications/drafts/:jobPostingId
router.get(
  '/drafts/:jobPostingId',
  auth,
  applicationDraftController.getDraft
);

// Delete draft
// DELETE /api/applications/drafts/:draftId
router.delete(
  '/drafts/:draftId',
  auth,
  applicationDraftController.deleteDraft
);

module.exports = router;
