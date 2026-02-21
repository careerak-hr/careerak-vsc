# Open Graph Validation Guide

## Overview
This guide provides step-by-step instructions for validating Open Graph (OG) tags using Facebook's Sharing Debugger and other validation tools.

**Task**: 6.2.5 Validate Open Graph with Facebook debugger  
**Status**: ✅ Implementation Complete - Ready for Validation  
**Requirements**: FR-SEO-4, FR-SEO-5

---

## What is Open Graph?

Open Graph is a protocol that enables web pages to become rich objects in social networks. When you share a link on Facebook, Twitter, LinkedIn, or other platforms, Open Graph tags control:
- The title displayed
- The description shown
- The image preview
- The URL structure
- Additional metadata

---

## Current Implementation

### SEOHead Component
Location: `frontend/src/components/SEO/SEOHead.jsx`

**Open Graph Tags Implemented**:
```jsx
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content={type} />
<meta property="og:url" content={currentUrl} />
<meta property="og:image" content={absoluteImageUrl} />
<meta property="og:site_name" content={siteName} />
<meta property="og:locale" content={locale} />
<meta property="og:locale:alternate" content={alternateLocales} />
```

**Twitter Card Tags Implemented**:
```jsx
<meta name="twitter:card" content={twitterCard} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={absoluteImageUrl} />
<meta name="twitter:site" content={twitterSite} />
```

### Pages with SEO Implementation
All major pages have SEO metadata configured:
- ✅ Language Selection (`/language`)
- ✅ Entry Page (`/entry`)
- ✅ Login Page (`/login`)
- ✅ Registration Page (`/auth`)
- ✅ OTP Verification (`/otp`)
- ✅ Profile Page (`/profile`)
- ✅ Job Postings (`/jobs`)
- ✅ Post Job (`/post-job`)
- ✅ Courses (`/courses`)
- ✅ Post Course (`/post-course`)
- ✅ Apply Page (`/apply`)
- ✅ Settings (`/settings`)
- ✅ Privacy Policy (`/policy`)
- ✅ Notifications (`/notifications`)
- ✅ Admin Dashboard (`/admin`)
- ✅ Onboarding Pages

---

## Validation Tools

### 1. Facebook Sharing Debugger (Primary Tool)
**URL**: https://developers.facebook.com/tools/debug/

**Features**:
- Validates Open Graph tags
- Shows preview of how link appears on Facebook
- Identifies errors and warnings
- Allows cache clearing (scrape again)
- Shows raw HTML tags

**How to Use**:
1. Go to https://developers.facebook.com/tools/debug/
2. Enter your page URL (e.g., `https://careerak.com/jobs`)
3. Click "Debug" button
4. Review the results:
   - ✅ Green checkmarks = Valid tags
   - ⚠️ Yellow warnings = Suggestions
   - ❌ Red errors = Must fix
5. Click "Scrape Again" to refresh cache after changes

### 2. LinkedIn Post Inspector
**URL**: https://www.linkedin.com/post-inspector/

**Features**:
- Validates Open Graph tags for LinkedIn
- Shows LinkedIn-specific preview
- Identifies issues

**How to Use**:
1. Go to https://www.linkedin.com/post-inspector/
2. Enter your page URL
3. Click "Inspect"
4. Review the preview and any errors

### 3. Twitter Card Validator
**URL**: https://cards-dev.twitter.com/validator

**Features**:
- Validates Twitter Card tags
- Shows Twitter-specific preview
- Identifies card type issues

**How to Use**:
1. Go to https://cards-dev.twitter.com/validator
2. Enter your page URL
3. Click "Preview card"
4. Review the preview

### 4. Open Graph Check (Third-Party)
**URL**: https://opengraphcheck.com/

**Features**:
- Quick validation without login
- Shows all OG tags
- Multi-platform preview
- No rate limits

**How to Use**:
1. Go to https://opengraphcheck.com/
2. Enter your page URL
3. View results instantly

### 5. Meta Tags (Browser Extension)
**Chrome Extension**: Meta Tags

**Features**:
- View OG tags on any page
- No need to leave the page
- Quick debugging

---

## Validation Checklist

### Required Open Graph Tags
- [ ] `og:title` - Present and 50-60 characters
- [ ] `og:description` - Present and 150-160 characters
- [ ] `og:type` - Present (usually "website")
- [ ] `og:url` - Present and absolute URL
- [ ] `og:image` - Present and absolute URL
- [ ] `og:site_name` - Present ("Careerak")
- [ ] `og:locale` - Present (ar_SA, en_US, or fr_FR)
- [ ] `og:locale:alternate` - Present for other languages

### Required Twitter Card Tags
- [ ] `twitter:card` - Present (summary_large_image)
- [ ] `twitter:title` - Present and matches og:title
- [ ] `twitter:description` - Present and matches og:description
- [ ] `twitter:image` - Present and matches og:image

### Image Requirements
- [ ] Image is at least 1200x630 pixels (recommended)
- [ ] Image is less than 8MB
- [ ] Image URL is absolute (starts with http:// or https://)
- [ ] Image is accessible (not behind authentication)
- [ ] Image format is JPG, PNG, or WebP

### URL Requirements
- [ ] URL is absolute (includes domain)
- [ ] URL is canonical (no duplicates)
- [ ] URL is accessible (returns 200 status)
- [ ] URL has no redirects (or minimal redirects)

---

## Step-by-Step Validation Process

### Step 1: Prepare Your Environment
1. Ensure the site is deployed and accessible
2. Ensure all pages are publicly accessible (no auth required for OG tags)
3. Ensure images are uploaded and accessible

### Step 2: Validate Each Page

For each page in the checklist:

1. **Open Facebook Debugger**
   - Go to https://developers.facebook.com/tools/debug/
   - Enter page URL
   - Click "Debug"

2. **Check for Errors**
   - Look for red error messages
   - Fix any critical issues
   - Note warnings for improvement

3. **Verify Preview**
   - Check title displays correctly
   - Check description displays correctly
   - Check image displays correctly
   - Check URL is correct

4. **Clear Cache if Needed**
   - Click "Scrape Again" to refresh
   - Wait for new results
   - Verify changes applied

5. **Test on Other Platforms**
   - Validate on LinkedIn Post Inspector
   - Validate on Twitter Card Validator
   - Verify consistency across platforms

### Step 3: Document Results

Create a validation report with:
- Page URL
- Validation date
- Tool used
- Status (✅ Pass / ⚠️ Warning / ❌ Fail)
- Issues found
- Actions taken
- Screenshots (optional)

---

## Common Issues and Solutions

### Issue 1: Image Not Displaying
**Symptoms**: No image preview in Facebook debugger

**Possible Causes**:
- Image URL is relative (not absolute)
- Image is behind authentication
- Image is too small (<200x200)
- Image format not supported

**Solutions**:
```javascript
// ❌ Wrong - Relative URL
<meta property="og:image" content="/logo.png" />

// ✅ Correct - Absolute URL
<meta property="og:image" content="https://careerak.com/logo.png" />
```

### Issue 2: Title/Description Too Long
**Symptoms**: Text is truncated in preview

**Possible Causes**:
- Title exceeds 60 characters
- Description exceeds 160 characters

**Solutions**:
- Keep title between 50-60 characters
- Keep description between 150-160 characters
- Use SEOHead validation warnings

### Issue 3: Wrong Locale
**Symptoms**: Content displays in wrong language

**Possible Causes**:
- Locale not set correctly
- Alternate locales missing

**Solutions**:
```javascript
// Set correct locale based on language
const localeMap = {
  ar: 'ar_SA',
  en: 'en_US',
  fr: 'fr_FR'
};
```

### Issue 4: Cached Old Data
**Symptoms**: Changes not reflected in preview

**Possible Causes**:
- Facebook cache not cleared
- Browser cache not cleared

**Solutions**:
1. Click "Scrape Again" in Facebook debugger
2. Clear browser cache
3. Wait 24 hours for automatic cache refresh
4. Use cache-busting query parameters (last resort)

### Issue 5: Multiple og:image Tags
**Symptoms**: Wrong image displayed

**Possible Causes**:
- Multiple og:image tags in HTML
- Conflicting meta tags

**Solutions**:
- Ensure only one og:image tag per page
- Remove duplicate tags
- Use React Helmet to manage tags

---

## Testing Scenarios

### Scenario 1: Share on Facebook
1. Copy page URL
2. Go to Facebook
3. Create new post
4. Paste URL
5. Wait for preview to load
6. Verify:
   - ✅ Correct title
   - ✅ Correct description
   - ✅ Correct image
   - ✅ Correct URL

### Scenario 2: Share on Twitter
1. Copy page URL
2. Go to Twitter
3. Create new tweet
4. Paste URL
5. Wait for card to load
6. Verify:
   - ✅ Correct title
   - ✅ Correct description
   - ✅ Correct image
   - ✅ Card type (summary_large_image)

### Scenario 3: Share on LinkedIn
1. Copy page URL
2. Go to LinkedIn
3. Create new post
4. Paste URL
5. Wait for preview to load
6. Verify:
   - ✅ Correct title
   - ✅ Correct description
   - ✅ Correct image

### Scenario 4: Share on WhatsApp
1. Copy page URL
2. Open WhatsApp
3. Paste URL in chat
4. Wait for preview to load
5. Verify:
   - ✅ Correct title
   - ✅ Correct description
   - ✅ Correct image

---

## Validation Report Template

```markdown
# Open Graph Validation Report

**Date**: [Date]
**Validator**: [Your Name]
**Environment**: [Production/Staging]

## Pages Validated

### 1. Job Postings Page
- **URL**: https://careerak.com/jobs
- **Status**: ✅ Pass
- **Facebook**: ✅ Valid
- **Twitter**: ✅ Valid
- **LinkedIn**: ✅ Valid
- **Issues**: None
- **Notes**: All tags present and correct

### 2. Courses Page
- **URL**: https://careerak.com/courses
- **Status**: ⚠️ Warning
- **Facebook**: ✅ Valid
- **Twitter**: ⚠️ Image too small
- **LinkedIn**: ✅ Valid
- **Issues**: Twitter image should be 1200x630
- **Actions**: Updated image size
- **Notes**: Re-validated after fix

[Continue for all pages...]

## Summary
- **Total Pages**: 15
- **Passed**: 13
- **Warnings**: 2
- **Failed**: 0

## Recommendations
1. Update Twitter images to 1200x630
2. Add more alternate locales
3. Consider adding og:video for future content
```

---

## Best Practices

### 1. Image Optimization
- Use 1200x630 pixels (Facebook recommended)
- Use JPG for photos, PNG for graphics
- Keep file size under 1MB
- Use descriptive filenames
- Store images on CDN (Cloudinary)

### 2. Title Optimization
- Keep between 50-60 characters
- Include brand name (Careerak)
- Make it descriptive and compelling
- Avoid special characters
- Use proper capitalization

### 3. Description Optimization
- Keep between 150-160 characters
- Include relevant keywords
- Make it actionable
- Avoid duplicate content
- Use proper grammar

### 4. URL Structure
- Use clean, readable URLs
- Avoid query parameters when possible
- Use hyphens, not underscores
- Keep URLs short
- Use HTTPS always

### 5. Multi-Language Support
- Set correct locale for each language
- Provide alternate locales
- Use language-specific images when needed
- Test in all supported languages

---

## Automation (Future Enhancement)

### Automated Testing Script
```javascript
// Example: Automated OG validation
const validateOpenGraph = async (url) => {
  const response = await fetch(url);
  const html = await response.text();
  
  const ogTags = {
    title: extractTag(html, 'og:title'),
    description: extractTag(html, 'og:description'),
    image: extractTag(html, 'og:image'),
    url: extractTag(html, 'og:url'),
  };
  
  // Validate each tag
  const errors = [];
  if (!ogTags.title) errors.push('Missing og:title');
  if (!ogTags.description) errors.push('Missing og:description');
  if (!ogTags.image) errors.push('Missing og:image');
  if (!ogTags.url) errors.push('Missing og:url');
  
  return { valid: errors.length === 0, errors, tags: ogTags };
};
```

### CI/CD Integration
```yaml
# Example: GitHub Actions workflow
name: Validate Open Graph
on: [push, pull_request]
jobs:
  validate-og:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate OG Tags
        run: npm run validate:og
```

---

## Resources

### Official Documentation
- [Open Graph Protocol](https://ogp.me/)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [LinkedIn Post Inspector](https://www.linkedin.com/help/linkedin/answer/46687)

### Tools
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Open Graph Check](https://opengraphcheck.com/)

### Articles
- [The Essential Meta Tags for Social Media](https://css-tricks.com/essential-meta-tags-social-media/)
- [Open Graph Image Best Practices](https://www.kapwing.com/resources/open-graph-image-size/)

---

## Completion Criteria

Task 6.2.5 is considered complete when:

1. ✅ All pages validated with Facebook Sharing Debugger
2. ✅ No critical errors found
3. ✅ All required OG tags present
4. ✅ Images display correctly
5. ✅ Titles and descriptions within character limits
6. ✅ URLs are absolute and accessible
7. ✅ Multi-language support verified
8. ✅ Validation report created
9. ✅ Screenshots captured (optional)
10. ✅ Issues documented and resolved

---

## Next Steps

After validation:

1. **Document Results**
   - Create validation report
   - Save screenshots
   - Note any issues

2. **Fix Issues**
   - Address critical errors
   - Improve warnings
   - Re-validate after fixes

3. **Monitor**
   - Set up regular validation schedule
   - Monitor social media shares
   - Track engagement metrics

4. **Optimize**
   - A/B test different images
   - Optimize titles and descriptions
   - Improve click-through rates

---

## Contact

For questions or issues:
- **Email**: careerak.hr@gmail.com
- **Documentation**: `docs/OPEN_GRAPH_VALIDATION_GUIDE.md`

---

**Last Updated**: 2026-02-20
**Version**: 1.0.0
**Status**: ✅ Ready for Validation
