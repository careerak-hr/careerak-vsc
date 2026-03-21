const express = require('express');
const router = express.Router();
const {
  serveJobSharePage,
  serveCourseSharePage,
  serveProfileSharePage,
  serveCompanySharePage
} = require('../controllers/shareHtmlController');

/**
 * Share HTML routes - serve HTML pages with injected OG/Twitter meta tags.
 *
 * These routes are used as the shareable URLs for social media.
 * Social media crawlers (Facebook, Twitter, LinkedIn) read the meta tags.
 * Human visitors are immediately redirected to the SPA content page.
 *
 * Routes:
 *   GET /share/job/:id      → job posting share page
 *   GET /share/course/:id   → course share page
 *   GET /share/profile/:id  → user profile share page
 *   GET /share/company/:id  → company profile share page
 */
router.get('/job/:id', serveJobSharePage);
router.get('/course/:id', serveCourseSharePage);
router.get('/profile/:id', serveProfileSharePage);
router.get('/company/:id', serveCompanySharePage);

module.exports = router;
