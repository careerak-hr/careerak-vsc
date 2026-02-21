import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEOHead Component
 * 
 * Manages all SEO-related meta tags for each page using react-helmet-async.
 * Supports Open Graph, Twitter Cards, and standard meta tags.
 * 
 * Requirements:
 * - FR-SEO-1: Unique, descriptive title tags (50-60 characters)
 * - FR-SEO-2: Unique meta descriptions (150-160 characters)
 * - FR-SEO-3: Relevant meta keywords
 * - FR-SEO-4: Open Graph tags
 * - FR-SEO-5: Twitter Card tags
 * - FR-SEO-10: Canonical URLs
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title (50-60 characters recommended)
 * @param {string} props.description - Page description (150-160 characters recommended)
 * @param {string} [props.keywords] - Comma-separated keywords
 * @param {string} [props.image] - Image URL for social media sharing
 * @param {string} [props.url] - Canonical URL for the page
 * @param {string} [props.type='website'] - Open Graph type (website, article, etc.)
 * @param {string} [props.siteName='Careerak'] - Site name for Open Graph
 * @param {string} [props.locale='ar_SA'] - Locale for Open Graph
 * @param {Array<string>} [props.alternateLocales] - Alternate locales
 * @param {string} [props.twitterCard='summary_large_image'] - Twitter card type
 * @param {string} [props.twitterSite] - Twitter site handle
 * @param {Object} [props.additionalMeta] - Additional meta tags
 */
const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = 'Careerak',
  locale = 'ar_SA',
  alternateLocales = ['en_US', 'fr_FR'],
  twitterCard = 'summary_large_image',
  twitterSite,
  additionalMeta = {}
}) => {
  // Validate title length (50-60 characters as per FR-SEO-1 and Property SEO-2)
  React.useEffect(() => {
    if (title) {
      const titleLength = title.length;
      if (titleLength < 50 || titleLength > 60) {
        console.warn(
          `SEO Warning: Title length is ${titleLength} characters. ` +
          `Recommended length is 50-60 characters for optimal SEO. ` +
          `Title: "${title}"`
        );
      }
    }
  }, [title]);

  // Validate description length (150-160 characters as per FR-SEO-2 and Property SEO-3)
  React.useEffect(() => {
    if (description) {
      const descriptionLength = description.length;
      if (descriptionLength < 150 || descriptionLength > 160) {
        console.warn(
          `SEO Warning: Description length is ${descriptionLength} characters. ` +
          `Recommended length is 150-160 characters for optimal SEO. ` +
          `Description: "${description}"`
        );
      }
    }
  }, [description]);

  // Get current URL if not provided
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  // Default image if not provided
  const defaultImage = '/logo.png';
  const socialImage = image || defaultImage;

  // Ensure absolute URL for image
  const absoluteImageUrl = socialImage.startsWith('http')
    ? socialImage
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${socialImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Canonical URL */}
      {currentUrl && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map((altLocale) => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}

      {/* Additional Meta Tags */}
      {Object.entries(additionalMeta).map(([key, value]) => (
        <meta key={key} name={key} content={value} />
      ))}
    </Helmet>
  );
}

SEOHead.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  siteName: PropTypes.string,
  locale: PropTypes.string,
  alternateLocales: PropTypes.arrayOf(PropTypes.string),
  twitterCard: PropTypes.string,
  twitterSite: PropTypes.string,
  additionalMeta: PropTypes.object
};

export default SEOHead;
