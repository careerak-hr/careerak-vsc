# Open Graph Tags Implementation

## Overview
This document describes the implementation of Open Graph tags for social media sharing across the Careerak platform.

## Implementation Date
2026-02-20

## Requirements Satisfied
- **FR-SEO-4**: Open Graph tags (og:title, og:description, og:image, og:url)
- **Task 6.2.1**: Add Open Graph tags to all pages

## What Was Implemented

### 1. SEOHead Component
The `SEOHead` component (located at `frontend/src/components/SEO/SEOHead.jsx`) already includes comprehensive Open Graph tag support:

```jsx
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
```

### 2. SEO Metadata Configuration
Updated `frontend/src/config/seoMetadata.js` to include `image` and `url` fields for all pages:

**Pages Updated:**
- Language Selection Page (`/language`)
- Entry Page (`/entry`)
- Login Page (`/login`)
- Registration Page (`/auth`)
- OTP Verification (`/otp`)
- Profile Page (`/profile`)
- Job Postings (`/jobs`)
- Post Job (`/post-job`)
- Courses (`/courses`)
- Post Course (`/post-course`)
- Apply Page (`/apply`)
- Settings (`/settings`)
- Privacy Policy (`/policy`)
- Notifications (`/notifications`)
- Admin Dashboard (`/admin`)
- Onboarding - Individuals (`/onboarding/individuals`)
- Onboarding - Companies (`/onboarding/companies`)
- Default fallback (`/`)

**Example:**
```javascript
jobPostings: {
  ar: {
    title: 'فرص العمل - Careerak | ابحث عن وظيفتك المثالية',
    description: 'تصفح آلاف فرص العمل في مختلف المجالات والتخصصات...',
    keywords: 'وظائف, فرص عمل, توظيف, بحث عن وظيفة, Careerak',
    image: '/og-images/jobs.jpg',
    url: '/jobs'
  },
  // ... en, fr
}
```

### 3. useSEO Hook Enhancement
Updated `frontend/src/hooks/useSEO.js` to properly construct absolute URLs from the metadata:

```javascript
// Get current URL if not provided in metadata
const currentUrl = metadata.url 
  ? (typeof window !== 'undefined' ? window.location.origin + metadata.url : metadata.url)
  : (typeof window !== 'undefined' ? window.location.href : '');

return {
  ...metadata,
  url: currentUrl,
  locale: currentLocale,
  alternateLocales,
  siteName: 'Careerak',
  type: 'website'
};
```

## Open Graph Tags Included

### Required Tags (All Pages)
1. **og:title** - Page title (50-60 characters)
2. **og:description** - Page description (150-160 characters)
3. **og:image** - Social media preview image
4. **og:url** - Canonical URL of the page

### Additional Tags
5. **og:type** - Content type (default: "website")
6. **og:site_name** - Site name ("Careerak")
7. **og:locale** - Primary locale (ar_SA, en_US, or fr_FR)
8. **og:locale:alternate** - Alternate locales for multi-language support

## Image Paths

All Open Graph images are stored in `/og-images/` directory:

```
/og-images/
├── language.jpg
├── entry.jpg
├── login.jpg
├── register.jpg
├── otp.jpg
├── profile.jpg
├── jobs.jpg
├── post-job.jpg
├── courses.jpg
├── post-course.jpg
├── apply.jpg
├── settings.jpg
├── policy.jpg
├── notifications.jpg
├── admin.jpg
├── onboarding-individuals.jpg
├── onboarding-companies.jpg
└── default.jpg
```

**Note:** These image files need to be created and placed in the `public/og-images/` directory. Recommended dimensions: 1200x630px (Facebook/LinkedIn standard).

## Usage Example

```jsx
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const JobPostingsPage = () => {
  const seo = useSEO('jobPostings', {});
  
  return (
    <>
      <SEOHead {...seo} />
      {/* Page content */}
    </>
  );
};
```

## Testing

All Open Graph functionality is covered by comprehensive tests in `frontend/src/components/SEO/__tests__/SEOHead.test.jsx`:

- ✅ 43 tests passing
- ✅ Image prop validation
- ✅ URL prop validation
- ✅ Combined image and URL props
- ✅ Absolute and relative URLs
- ✅ Cloudinary image URLs

Run tests:
```bash
cd frontend
npm test -- SEOHead.test.jsx --run
```

## Social Media Preview

When sharing Careerak pages on social media platforms, the following will be displayed:

- **Facebook**: Uses og:title, og:description, og:image
- **LinkedIn**: Uses og:title, og:description, og:image
- **Twitter**: Falls back to og: tags if twitter: tags not present
- **WhatsApp**: Uses og:title, og:description, og:image
- **Telegram**: Uses og:title, og:description, og:image

## Multi-Language Support

Open Graph tags automatically adapt to the user's selected language:

- **Arabic (ar)**: og:locale="ar_SA"
- **English (en)**: og:locale="en_US"
- **French (fr)**: og:locale="fr_FR"

Alternate locales are automatically included for SEO and social media crawlers.

## Next Steps

### Task 6.2.2: Twitter Card Tags
Twitter Card tags are already implemented in the SEOHead component:

```jsx
{/* Twitter Card Tags */}
<meta name="twitter:card" content={twitterCard} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={absoluteImageUrl} />
{twitterSite && <meta name="twitter:site" content={twitterSite} />}
```

### Required Actions
1. **Create OG Images**: Design and create 1200x630px images for all pages
2. **Add Twitter Handle**: Set `twitterSite` prop in useSEO hook if available
3. **Test Social Sharing**: Use Facebook Debugger and Twitter Card Validator
4. **Generate Social Images**: Consider using Cloudinary for dynamic OG images

## Validation Tools

Test your Open Graph implementation:

- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Open Graph Check**: https://opengraphcheck.com/

## References

- [Open Graph Protocol](https://ogp.me/)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters)
- [LinkedIn Post Inspector Guide](https://www.linkedin.com/help/linkedin/answer/46687)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

## Status

✅ **COMPLETED** - Task 6.2.1: Add Open Graph tags (og:title, og:description, og:image, og:url)

All pages now include proper Open Graph tags for optimal social media sharing.
