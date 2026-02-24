const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const oauthController = require('../controllers/oauthController');
const { auth } = require('../middleware/auth');
const { generateState, verifyState } = require('../utils/oauthState');

// ==================== Google OAuth ====================

/**
 * Initiate Google OAuth
 * GET /auth/google
 */
router.get('/google', (req, res, next) => {
  // Generate and store state parameter for CSRF protection
  const state = generateState(req.user?.id);
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
    state: state
  })(req, res, next);
});

/**
 * Google OAuth Callback
 * GET /auth/google/callback
 */
router.get('/google/callback', (req, res, next) => {
  // Verify state parameter
  const state = req.query.state;
  const stateData = verifyState(state);
  
  if (!stateData) {
    console.error('❌ OAuth State verification failed');
    return res.redirect('/auth/failure?error=invalid_state');
  }
  
  console.log('✅ OAuth State verified successfully');
  
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    session: false
  })(req, res, next);
}, oauthController.oauthSuccess);

// ==================== Facebook OAuth ====================

/**
 * Initiate Facebook OAuth
 * GET /auth/facebook
 */
router.get('/facebook', (req, res, next) => {
  // Generate and store state parameter for CSRF protection
  const state = generateState(req.user?.id);
  
  passport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
    state: state
  })(req, res, next);
});

/**
 * Facebook OAuth Callback
 * GET /auth/facebook/callback
 */
router.get('/facebook/callback', (req, res, next) => {
  // Verify state parameter
  const state = req.query.state;
  const stateData = verifyState(state);
  
  if (!stateData) {
    console.error('❌ OAuth State verification failed');
    return res.redirect('/auth/failure?error=invalid_state');
  }
  
  console.log('✅ OAuth State verified successfully');
  
  passport.authenticate('facebook', {
    failureRedirect: '/auth/failure',
    session: false
  })(req, res, next);
}, oauthController.oauthSuccess);

// ==================== LinkedIn OAuth ====================

/**
 * Initiate LinkedIn OAuth
 * GET /auth/linkedin
 */
router.get('/linkedin', (req, res, next) => {
  // Generate and store state parameter for CSRF protection
  const state = generateState(req.user?.id);
  
  passport.authenticate('linkedin', {
    scope: ['r_emailaddress', 'r_liteprofile'],
    state: state
  })(req, res, next);
});

/**
 * LinkedIn OAuth Callback
 * GET /auth/linkedin/callback
 */
router.get('/linkedin/callback', (req, res, next) => {
  // Verify state parameter
  const state = req.query.state;
  const stateData = verifyState(state);
  
  if (!stateData) {
    console.error('❌ OAuth State verification failed');
    return res.redirect('/auth/failure?error=invalid_state');
  }
  
  console.log('✅ OAuth State verified successfully');
  
  passport.authenticate('linkedin', {
    failureRedirect: '/auth/failure',
    session: false
  })(req, res, next);
}, oauthController.oauthSuccess);

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
