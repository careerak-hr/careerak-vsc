# SEO Components

## Overview

This directory contains SEO-related components for optimizing search engine visibility:

- **SEOHead** - Manages meta tags, Open Graph, Twitter Cards, and canonical URLs
- **StructuredData** - Generates JSON-LD structured data for rich search results

## Components

### SEOHead Component

The `SEOHead` component manages all SEO-related meta tags for each page using `react-helmet-async`. It provides a simple, consistent interface for setting page titles, descriptions, Open Graph tags, Twitter Cards, and canonical URLs.

## Requirements Fulfilled

### SEOHead Component

- **FR-SEO-1**: Unique, descriptive title tags (50-60 characters)
- **FR-SEO-2**: Unique meta descriptions (150-160 characters)
- **FR-SEO-3**: Relevant meta keywords
- **FR-SEO-4**: Open Graph tags (og:title, og:description, og:image, og:url)
- **FR-SEO-5**: Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
- **FR-SEO-10**: Canonical URLs

### StructuredData Component

- **FR-SEO-6**: JobPosting schema for job listings
- **FR-SEO-7**: Course schema for courses
- **NFR-SEO-3**: Include structured data for job postings and courses
- **Property SEO-4**: All jobs have structured data

## Installation

The component uses `react-helmet-async` which is already installed:

```bash
npm install react-helmet-async
```

The `HelmetProvider` is already configured in `src/index.jsx`.

## Basic Usage

```jsx
import SEOHead from './components/SEO/SEOHead';

function MyPage() {
  return (
    <div>
      <SEOHead
        title="Page Title - Careerak"
        description="Page description that explains what this page is about."
        keywords="keyword1, keyword2, keyword3"
        image="/images/page-image.jpg"
        url="https://careerak.com/page"
      />
      {/* Your page content */}
    </div>
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Page title (50-60 characters recommended) |
| `description` | `string` | Page description (150-160 characters recommended) |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `keywords` | `string` | - | Comma-separated keywords |
| `image` | `string` | `/logo.png` | Image URL for social media sharing |
| `url` | `string` | Current URL | Canonical URL for the page |
| `type` | `string` | `'website'` | Open Graph type (website, article, profile, etc.) |
| `siteName` | `string` | `'Careerak'` | Site name for Open Graph |
| `locale` | `string` | `'ar_SA'` | Locale for Open Graph |
| `alternateLocales` | `string[]` | `['en_US', 'fr_FR']` | Alternate locales |
| `twitterCard` | `string` | `'summary_large_image'` | Twitter card type |
| `twitterSite` | `string` | - | Twitter site handle (e.g., '@careerak') |
| `additionalMeta` | `object` | `{}` | Additional meta tags |

## Examples

### Homepage

```jsx
<SEOHead
  title="Careerak - منصة التوظيف والموارد البشرية"
  description="منصة Careerak الرائدة في التوظيف والموارد البشرية، تقدم فرص عمل متنوعة ودورات تدريبية واستشارات مهنية."
  keywords="توظيف, وظائف, موارد بشرية, دورات تدريبية"
  image="/images/og-homepage.jpg"
  url="https://careerak.com"
/>
```

### Job Posting Page

```jsx
<SEOHead
  title={`${jobTitle} | Careerak`}
  description={jobDescription}
  keywords="وظيفة, React, مطور برمجيات"
  image="/images/og-job.jpg"
  url={`https://careerak.com/jobs/${jobId}`}
  type="article"
/>
```

### Course Page

```jsx
<SEOHead
  title="دورة تطوير الويب الشاملة | Careerak"
  description="تعلم تطوير الويب من الصفر حتى الاحتراف. دورة شاملة تغطي HTML, CSS, JavaScript, React."
  keywords="دورة تطوير الويب, تعلم البرمجة, React"
  image="/images/og-course.jpg"
  url="https://careerak.com/courses/web-development"
  type="article"
/>
```

### With Twitter Handle

```jsx
<SEOHead
  title="Careerak - Career Platform"
  description="Leading career and HR platform in the Arab world"
  image="/images/og-homepage.jpg"
  url="https://careerak.com"
  twitterSite="@careerak"
/>
```

### With Additional Meta Tags

```jsx
<SEOHead
  title="Careerak Blog - Career Tips"
  description="Read the latest career tips and job market insights"
  image="/images/og-blog.jpg"
  url="https://careerak.com/blog"
  additionalMeta={{
    'article:author': 'Careerak Team',
    'article:published_time': '2024-02-20T10:00:00Z',
    'article:section': 'Career Advice'
  }}
/>
```

### Multi-language Support

```jsx
const currentLanguage = 'ar'; // or 'en', 'fr'

const titles = {
  ar: 'Careerak - منصة التوظيف',
  en: 'Careerak - Career Platform',
  fr: 'Careerak - Plateforme de Carrière'
};

const descriptions = {
  ar: 'منصة التوظيف الرائدة في العالم العربي',
  en: 'Leading career platform in the Arab world',
  fr: 'Plateforme de carrière leader dans le monde arabe'
};

const locales = {
  ar: 'ar_SA',
  en: 'en_US',
  fr: 'fr_FR'
};

<SEOHead
  title={titles[currentLanguage]}
  description={descriptions[currentLanguage]}
  locale={locales[currentLanguage]}
  alternateLocales={Object.values(locales).filter(l => l !== locales[currentLanguage])}
/>
```

## Best Practices

### Title Length (FR-SEO-1)
- Keep titles between 50-60 characters
- Include brand name (Careerak) at the end
- Make titles unique and descriptive
- Use separators like ` | ` or ` - `

```jsx
// ✅ Good
title="مطور React محترف | Careerak"

// ❌ Too long
title="مطور React محترف مع خبرة 5 سنوات في تطوير تطبيقات الويب والموبايل | Careerak"
```

### Description Length (FR-SEO-2)
- Keep descriptions between 150-160 characters
- Make them compelling and informative
- Include relevant keywords naturally
- Avoid duplicate descriptions

```jsx
// ✅ Good (155 characters)
description="نبحث عن مطور React محترف للانضمام إلى فريقنا. خبرة 3+ سنوات مطلوبة. رواتب تنافسية ومزايا ممتازة."

// ❌ Too short
description="وظيفة مطور React"
```

### Keywords (FR-SEO-3)
- Use 5-10 relevant keywords
- Separate with commas
- Include both Arabic and English if applicable
- Avoid keyword stuffing

```jsx
// ✅ Good
keywords="وظيفة, React, مطور برمجيات, توظيف, JavaScript"

// ❌ Keyword stuffing
keywords="وظيفة, وظائف, وظيفة React, وظيفة مطور, مطور React, مطور برمجيات, ..."
```

### Images
- Use high-quality images (1200x630px recommended)
- Provide absolute URLs for social sharing
- Use descriptive filenames
- Optimize image size (<200KB)

```jsx
// ✅ Good
image="https://careerak.com/images/og-job-posting.jpg"

// ✅ Also good (will be converted to absolute URL)
image="/images/og-job-posting.jpg"
```

### Canonical URLs (FR-SEO-10)
- Always provide canonical URLs
- Use absolute URLs
- Ensure consistency across pages
- Avoid duplicate content

```jsx
// ✅ Good
url="https://careerak.com/jobs/123"

// ❌ Avoid relative URLs
url="/jobs/123"
```

## Generated Meta Tags

The component generates the following meta tags:

### Basic Meta Tags
```html
<title>Page Title</title>
<meta name="description" content="Page description" />
<meta name="keywords" content="keyword1, keyword2" />
<link rel="canonical" href="https://careerak.com/page" />
```

### Open Graph Tags
```html
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://careerak.com/page" />
<meta property="og:image" content="https://careerak.com/image.jpg" />
<meta property="og:site_name" content="Careerak" />
<meta property="og:locale" content="ar_SA" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:locale:alternate" content="fr_FR" />
```

### Twitter Card Tags
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://careerak.com/image.jpg" />
<meta name="twitter:site" content="@careerak" />
```

## Testing

### Manual Testing
1. View page source and check meta tags
2. Use browser DevTools to inspect `<head>` section
3. Test social sharing on Facebook and Twitter
4. Validate with Google Rich Results Test

### Validation Tools
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Integration with Existing Pages

To add SEO to an existing page:

1. Import the component:
```jsx
import SEOHead from '../components/SEO/SEOHead';
```

2. Add it at the top of your page component:
```jsx
function MyPage() {
  return (
    <div>
      <SEOHead
        title="My Page Title | Careerak"
        description="My page description"
        keywords="relevant, keywords"
      />
      {/* Rest of your page */}
    </div>
  );
}
```

## Notes

- The component automatically converts relative image URLs to absolute URLs
- If no URL is provided, it uses the current window location
- The component respects the existing multi-language system (ar, en, fr)
- All meta tags are dynamically updated when props change
- The component is SSR-compatible (works with server-side rendering)

## Related Files

- `frontend/src/components/SEO/SEOHead.jsx` - Meta tags component
- `frontend/src/components/SEO/SEOHead.example.jsx` - SEOHead usage examples
- `frontend/src/components/SEO/StructuredData.jsx` - JSON-LD structured data component
- `frontend/src/components/SEO/StructuredData.example.jsx` - StructuredData usage examples
- `frontend/src/components/SEO/StructuredData.README.md` - StructuredData documentation
- `frontend/src/index.jsx` - HelmetProvider configuration
- `.kiro/specs/general-platform-enhancements/requirements.md` - Requirements
- `.kiro/specs/general-platform-enhancements/design.md` - Design document

## Documentation

- See `StructuredData.README.md` for detailed StructuredData component documentation
- See `SEOHead.example.jsx` for SEOHead usage examples
- See `StructuredData.example.jsx` for StructuredData usage examples

## Next Steps

After implementing this component, the next tasks are:

- **Task 6.1.2**: Add title prop (50-60 characters)
- **Task 6.1.3**: Add description prop (150-160 characters)
- **Task 6.1.4**: Add keywords prop
- **Task 6.1.5**: Add image and url props
- **Task 6.1.6**: Add SEOHead to all page components

These tasks are already completed in the current implementation! ✅
