/**
 * SEO Helper for generating Open Graph and Meta tags
 * Requirements: 3.4 (Open Graph Tags)
 */
exports.generateJobMetaTags = (job) => {
  if (!job) return '';

  const title = `${job.title} | ${job.company?.name || 'Careerak'}`;
  const description = job.description?.substring(0, 160) || 'تصفح أحدث الوظائف المتاحة على منصة كاريرك.';
  const url = `${process.env.FRONTEND_URL || 'https://careerak.com'}/job-postings/${job._id || job.id}`;
  const image = job.company?.logo || 'https://careerak.com/og-default.jpg';

  return `
    <title>${title}</title>
    <meta name="description" content="${description}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${image}">
  `;
};
