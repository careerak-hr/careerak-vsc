const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const oauthController = require('../controllers/oauthController');
const { auth } = require('../middleware/auth');

// ==================== Google OAuth ====================

/**
 * Initiate Google OAuth
 * GET /auth/google
 */
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

/**
 * Google OAuth Callback
 * GET /auth/google/callback
 */
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthController.oauthSuccess
);

// ==================== Facebook OAuth ====================

/**
 * Initiate Facebook OAuth
 * GET /auth/facebook
 */
router.get('/facebook',
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
  })
);

/**
 * Facebook OAuth Callback
 * GET /auth/facebook/callback
 */
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthController.oauthSuccess
);

// ==================== LinkedIn OAuth ====================

/**
 * Initiate LinkedIn OAuth
 * GET /auth/linkedin
 */
router.get('/linkedin',
  passport.authenticate('linkedin', {
    scope: ['r_emailaddress', 'r_liteprofile']
  })
);

/**
 * LinkedIn OAuth Callback
 * GET /auth/linkedin/callback
 */
router.get('/linkedin/callback',
  passport.authenticate('linkedin', {
    failureRedirect: '/auth/failure',
    session: false
  }),
  oauthController.oauthSuccess
);

// ==================== OAuth Management ====================

/**
 * OAuth Failure Handler
 * GET /auth/failure
 */
router.get('/failure', oauthController.oauthFailure);

/**
 * Get user's OAuth accounts
 * GET /auth/oauth/accounts
 * Protected route - requires authentication
 */
router.get('/oauth/accounts', auth, oauthController.getOAuthAccounts);

/**
 * Unlink OAuth account
 * DELETE /auth/oauth/:provider
 * Protected route - requires authentication
 */
router.delete('/oauth/:provider', auth, oauthController.unlinkOAuthAccount);

module.exports = router;
