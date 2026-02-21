# Social Media Sharing - Quick Reference

## Quick Testing URLs

### Facebook Sharing Debugger
```
https://developers.facebook.com/tools/debug/
```

### Twitter Card Validator
```
https://cards-dev.twitter.com/validator
```

### LinkedIn Post Inspector
```
https://www.linkedin.com/post-inspector/
```

---

## Quick Test Commands

### Run Automated Tests
```bash
# Test local development
node frontend/src/utils/testSocialSharing.js

# Test production
TEST_URL=https://your-domain.com node frontend/src/utils/testSocialSharing.js
```

### Check Meta Tags in Browser
```javascript
// Open browser console and run:
document.querySelectorAll('meta[property^="og:"]').forEach(tag => {
  console.log(tag.getAttribute('property'), ':', tag.getAttribute('content'));
});

document.querySelectorAll('meta[name^="twitter:"]').forEach(tag => {
  console.log(tag.getAttribute('name'), ':', tag.getAttribute('content'));
});
```

---

## Required Meta Tags Checklist

### Open Graph (Facebook)
- [ ] `og:title` - Page title (50-60 chars)
- [ ] `og:description` - Page description (150-160 chars)
- [ ] `og:type` - Content type (usually "website")
- [ ] `og:url` - Canonical URL
- [ ] `og:image` - Image URL (1200x630px recommended)
- [ ] `og:site_name` - Site name ("Careerak")

### Twitter Cards
- [ ] `twitter:card` - Card type ("summary_large_image")
- [ ] `twitter:title` - Page title
- [ ] `twitter:description` - Page description
- [ ] `twitter:image` - Image URL (1200x628px recommended)

---

## Image Requirements

### Facebook
- **Minimum**: 200x200px
- **Recommended**: 1200x630px
- **Aspect Ratio**: 1.91:1
- **Format**: JPEG, PNG, WebP
- **Max Size**: 8MB

### Twitter
- **Minimum**: 300x157px
- **Recommended**: 1200x628px
- **Aspect Ratio**: 2:1
- **Format**: JPEG, PNG, WebP, GIF
- **Max Size**: 5MB

---

## Common Issues & Quick Fixes

### Issue: Image Not Showing
```javascript
// ❌ Wrong - Relative URL
<meta property="og:image" content="/logo.png" />

// ✅ Correct - Absolute URL
<meta property="og:image" content="https://your-domain.com/logo.png" />
```

### Issue: Title Too Long
```javascript
// ❌ Wrong - 75 characters
const title = "This is a very long title that exceeds the recommended character limit";

// ✅ Correct - 58 characters
const title = "Careerak - Find Your Dream Job in the Arab World Today";
```

### Issue: Description Too Short
```javascript
// ❌ Wrong - 80 characters
const description = "Find jobs and courses on Careerak platform for career development.";

// ✅ Correct - 155 characters
const description = "Discover thousands of job opportunities and professional courses on Careerak. Connect with top employers and advance your career in the Arab world.";
```

### Issue: Cache Not Updating
```bash
# Facebook: Add version parameter
https://your-domain.com/page?v=2

# Or use "Scrape Again" in Facebook Debugger
```

---

## Testing Workflow

### 1. Development Testing
```bash
# Start dev server
npm run dev

# Run automated tests
node frontend/src/utils/testSocialSharing.js

# Fix any errors
# Re-run tests
```

### 2. Pre-Deployment Testing
```bash
# Build production
npm run build

# Preview production build
npm run preview

# Test production build
TEST_URL=http://localhost:4173 node frontend/src/utils/testSocialSharing.js
```

### 3. Post-Deployment Testing
```bash
# Test live site
TEST_URL=https://your-domain.com node frontend/src/utils/testSocialSharing.js

# Test on Facebook Debugger
# Test on Twitter Card Validator
# Test actual sharing
```

---

## SEOHead Component Usage

### Basic Usage
```jsx
import { SEOHead } from '../components/SEO';

<SEOHead
  title="Careerak - Find Your Dream Job in the Arab World"
  description="Discover thousands of job opportunities and professional courses on Careerak. Connect with top employers and advance your career in the Arab world today."
  keywords="jobs, careers, courses, training, Arab world"
  image="https://your-domain.com/social-preview.jpg"
  url="https://your-domain.com/jobs"
/>
```

### With Custom Settings
```jsx
<SEOHead
  title="Job Postings - Careerak"
  description="Browse thousands of job opportunities from top employers across the Arab world. Find your perfect role and apply today on Careerak."
  keywords="job postings, job search, employment, careers"
  image="https://your-domain.com/jobs-preview.jpg"
  url="https://your-domain.com/jobs"
  type="website"
  locale="ar_SA"
  alternateLocales={['en_US', 'fr_FR']}
  twitterCard="summary_large_image"
/>
```

---

## Validation Checklist

Before marking task as complete:

- [ ] All pages have SEOHead component
- [ ] All required meta tags present
- [ ] Title length: 50-60 characters
- [ ] Description length: 150-160 characters
- [ ] Images are absolute URLs
- [ ] Images are publicly accessible
- [ ] Automated tests pass
- [ ] Facebook Debugger shows no errors
- [ ] Twitter Card Validator shows no errors
- [ ] Actual sharing works on Facebook
- [ ] Actual sharing works on Twitter
- [ ] Mobile sharing tested
- [ ] Documentation complete

---

## Resources

### Tools
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Open Graph Check](https://opengraphcheck.com/)
- [Meta Tags Checker](https://metatags.io/)

### Documentation
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)

### Internal Docs
- [Full Testing Guide](./SOCIAL_MEDIA_SHARING_TEST.md)
- [SEO Implementation](./SEO_IMPLEMENTATION.md)

---

## Support

For issues or questions:
1. Check [SOCIAL_MEDIA_SHARING_TEST.md](./SOCIAL_MEDIA_SHARING_TEST.md)
2. Review console warnings from SEOHead component
3. Test with automated script
4. Validate with online tools

**Status**: ✅ Ready for testing
**Last Updated**: 2026-02-20
