const metadataService = require('../services/metadataService');

const BASE_URL = 'https://careerak.com';

/**
 * Build an HTML page with injected OG and Twitter Card meta tags.
 * This is served to social media crawlers so they can read the metadata.
 * Regular users are immediately redirected to the SPA route via JS.
 *
 * @param {object} openGraph - Open Graph tags object
 * @param {object} twitterCard - Twitter Card tags object
 * @param {string} redirectUrl - The SPA URL to redirect human visitors to
 * @returns {string} Full HTML string
 */
function buildMetaHtml(openGraph, twitterCard, redirectUrl) {
  const ogTags = Object.entries(openGraph || {})
    .map(([property, content]) => `  <meta property="${escapeAttr(property)}" content="${escapeAttr(content)}" />`)
    .join('\n');

  const twitterTags = Object.entries(twitterCard || {})
    .map(([name, content]) => `  <meta name="${escapeAttr(name)}" content="${escapeAttr(content)}" />`)
    .join('\n');

  const title = openGraph?.['og:title'] || 'Careerak';
  const description = openGraph?.['og:description'] || '';
  const canonicalUrl = openGraph?.['og:url'] || redirectUrl;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | Careerak</title>
  <meta name="description" content="${escapeAttr(description)}" />
  <link rel="canonical" href="${escapeAttr(canonicalUrl)}" />

  <!-- Open Graph / Facebook -->
${ogTags}

  <!-- Twitter Card -->
${twitterTags}

  <!-- Redirect human visitors to the SPA immediately -->
  <meta http-equiv="refresh" content="0;url=${escapeAttr(redirectUrl)}" />
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body>
  <p>Redirecting to <a href="${escapeAttr(redirectUrl)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * GET /share/job/:id
 * Serves HTML with OG/Twitter meta tags for a job posting.
 * Social media crawlers read the meta tags; human visitors are redirected to the SPA.
 */
async function serveJobSharePage(req, res) {
  try {
    const { id } = req.params;
    const metadata = await metadataService.generateAllMetaTags('job', id);

    if (!metadata) {
      return res.status(404).send('<html><body>Job not found</body></html>');
    }

    const redirectUrl = `${BASE_URL}/job-postings/${id}`;
    const html = buildMetaHtml(metadata.openGraph, metadata.twitterCard, redirectUrl);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
    res.send(html);
  } catch (error) {
    res.status(500).send('<html><body>Server error</body></html>');
  }
}

/**
 * GET /share/course/:id
 * Serves HTML with OG/Twitter meta tags for a course.
 */
async function serveCourseSharePage(req, res) {
  try {
    const { id } = req.params;
    const metadata = await metadataService.generateAllMetaTags('course', id);

    if (!metadata) {
      return res.status(404).send('<html><body>Course not found</body></html>');
    }

    const redirectUrl = `${BASE_URL}/courses/${id}`;
    const html = buildMetaHtml(metadata.openGraph, metadata.twitterCard, redirectUrl);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(html);
  } catch (error) {
    res.status(500).send('<html><body>Server error</body></html>');
  }
}

/**
 * GET /share/profile/:id
 * Serves HTML with OG/Twitter meta tags for a user profile.
 */
async function serveProfileSharePage(req, res) {
  try {
    const { id } = req.params;
    const metadata = await metadataService.generateAllMetaTags('profile', id);

    if (!metadata) {
      return res.status(404).send('<html><body>Profile not found or private</body></html>');
    }

    const redirectUrl = `${BASE_URL}/profile/${id}`;
    const html = buildMetaHtml(metadata.openGraph, metadata.twitterCard, redirectUrl);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(html);
  } catch (error) {
    res.status(500).send('<html><body>Server error</body></html>');
  }
}

/**
 * GET /share/company/:id
 * Serves HTML with OG/Twitter meta tags for a company profile.
 */
async function serveCompanySharePage(req, res) {
  try {
    const { id } = req.params;
    const metadata = await metadataService.generateAllMetaTags('company', id);

    if (!metadata) {
      return res.status(404).send('<html><body>Company not found</body></html>');
    }

    const redirectUrl = `${BASE_URL}/companies/${id}`;
    const html = buildMetaHtml(metadata.openGraph, metadata.twitterCard, redirectUrl);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(html);
  } catch (error) {
    res.status(500).send('<html><body>Server error</body></html>');
  }
}

module.exports = {
  serveJobSharePage,
  serveCourseSharePage,
  serveProfileSharePage,
  serveCompanySharePage
};
