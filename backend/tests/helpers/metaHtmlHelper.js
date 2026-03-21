/**
 * Helper that replicates the buildMetaHtml logic from shareHtmlController
 * for use in tests — avoids importing the full controller with its side effects.
 */

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Build an HTML page with injected OG and Twitter Card meta tags.
 * Mirrors shareHtmlController.buildMetaHtml for test assertions.
 *
 * @param {object} openGraph
 * @param {object} twitterCard
 * @param {string} [redirectUrl]
 * @returns {string}
 */
function buildMetaHtmlForTest(openGraph, twitterCard, redirectUrl = 'https://careerak.com/') {
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

  <meta http-equiv="refresh" content="0;url=${escapeAttr(redirectUrl)}" />
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body>
  <p>Redirecting to <a href="${escapeAttr(redirectUrl)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

module.exports = { buildMetaHtmlForTest };
