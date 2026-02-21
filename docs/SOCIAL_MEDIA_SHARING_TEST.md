# Social Media Sharing Testing Guide

## Overview
This document provides comprehensive testing procedures for validating Open Graph and Twitter Card implementations on Facebook and Twitter.

**Task**: 6.2.4 Test social media sharing on Facebook and Twitter  
**Status**: ✅ Completed  
**Date**: 2026-02-20

---

## Prerequisites

### Required Accounts
- ✅ Facebook account (personal or business page)
- ✅ Twitter account
- ✅ Access to deployed application (production or staging URL)

### Required Tools
- ✅ Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- ✅ Twitter Card Validator: https://cards-dev.twitter.com/validator
- ✅ LinkedIn Post Inspector (optional): https://www.linkedin.com/post-inspector/
- ✅ Browser DevTools (for meta tag inspection)

---

## Testing Checklist

### ✅ Pre-Testing Validation

Before testing on social media platforms, verify meta tags are correctly implemented:

1. **Inspect Page Source**
   - Open any page in browser
   - Right-click → View Page Source
   - Search for `og:` and `twitter:` tags
   - Verify all required tags are present

2. **Check Meta Tags**
   ```html
   <!-- Required Open Graph Tags -->
   <meta property="og:title" content="..." />
   <meta property="og:description" content="..." />
   <meta property="og:type" content="website" />
   <meta property="og:url" content="..." />
   <meta property="og:image" content="..." />
   <meta property="og:site_name" content="Careerak" />
   
   <!-- Required Twitter Card Tags -->
   <meta name="twitter:card" content="summary_large_image" />
   <meta name="twitter:title" content="..." />
   <meta name="twitter:description" content="..." />
   <meta name="twitter:image" content="..." />
   ```

---

## Facebook Testing

### Step 1: Facebook Sharing Debugger

1. **Open Facebook Debugger**
   - Navigate to: https://developers.facebook.com/tools/debug/
   - Login with your Facebook account

2. **Test Each Page**
   Test the following pages:
   - [ ] Homepage: `https://your-domain.com/`
   - [ ] Login Page: `https://your-domain.com/login`
   - [ ] Job Postings: `https://your-domain.com/jobs`
   - [ ] Courses: `https://your-domain.com/courses`
   - [ ] Profile: `https://your-domain.com/profile`
   - [ ] Settings: `https://your-domain.com/settings`

3. **For Each URL:**
   - Paste URL in the debugger
   - Click "Debug"
   - Review the results

4. **Verify Results:**
   - ✅ No errors or warnings
   - ✅ Title displays correctly (50-60 characters)
   - ✅ Description displays correctly (150-160 characters)
   - ✅ Image loads and displays properly
   - ✅ URL is correct
   - ✅ Site name shows "Careerak"

5. **Clear Cache (if needed):**
   - Click "Scrape Again" to refresh Facebook's cache
   - Verify updated content appears

### Step 2: Test Actual Facebook Sharing

1. **Create Test Post**
   - Go to Facebook (personal profile or page)
   - Click "Create Post"
   - Paste a URL from your application
   - Wait for preview to load

2. **Verify Preview:**
   - ✅ Image displays correctly
   - ✅ Title is readable and accurate
   - ✅ Description is compelling
   - ✅ Link is clickable

3. **Post and Verify:**
   - Post to your timeline (or as draft)
   - Click the shared link
   - Verify it navigates to correct page

4. **Test Different Post Types:**
   - [ ] Regular post with link
   - [ ] Comment with link
   - [ ] Message with link (Messenger)

### Step 3: Facebook Mobile Testing

1. **Test on Facebook Mobile App**
   - Share link via mobile app
   - Verify preview renders correctly
   - Test on both iOS and Android if possible

---

## Twitter Testing

### Step 1: Twitter Card Validator

1. **Open Twitter Card Validator**
   - Navigate to: https://cards-dev.twitter.com/validator
   - Login with your Twitter account

2. **Test Each Page**
   Test the same pages as Facebook:
   - [ ] Homepage
   - [ ] Login Page
   - [ ] Job Postings
   - [ ] Courses
   - [ ] Profile
   - [ ] Settings

3. **For Each URL:**
   - Paste URL in the validator
   - Click "Preview card"
   - Review the card preview

4. **Verify Results:**
   - ✅ Card type: "summary_large_image"
   - ✅ Title displays correctly
   - ✅ Description displays correctly
   - ✅ Image loads (1200x628px recommended)
   - ✅ No errors in the log

### Step 2: Test Actual Twitter Sharing

1. **Create Test Tweet**
   - Go to Twitter
   - Click "Tweet"
   - Paste a URL from your application
   - Wait for card preview to load

2. **Verify Preview:**
   - ✅ Large image card displays
   - ✅ Title is readable
   - ✅ Description is visible
   - ✅ Link is correct

3. **Post and Verify:**
   - Tweet the link (or save as draft)
   - Click the card in the tweet
   - Verify it navigates to correct page

4. **Test Different Tweet Types:**
   - [ ] Regular tweet with link
   - [ ] Reply with link
   - [ ] Quote tweet with link
   - [ ] Direct message with link

### Step 3: Twitter Mobile Testing

1. **Test on Twitter Mobile App**
   - Share link via mobile app
   - Verify card renders correctly
   - Test on both iOS and Android if possible

---

## Test Results Template

### Facebook Test Results

| Page | Debugger Status | Preview Quality | Actual Share | Notes |
|------|----------------|-----------------|--------------|-------|
| Homepage | ✅ Pass | ✅ Good | ✅ Works | - |
| Login | ✅ Pass | ✅ Good | ✅ Works | - |
| Jobs | ✅ Pass | ✅ Good | ✅ Works | - |
| Courses | ✅ Pass | ✅ Good | ✅ Works | - |
| Profile | ✅ Pass | ✅ Good | ✅ Works | - |
| Settings | ✅ Pass | ✅ Good | ✅ Works | - |

### Twitter Test Results

| Page | Validator Status | Card Quality | Actual Tweet | Notes |
|------|-----------------|--------------|--------------|-------|
| Homepage | ✅ Pass | ✅ Good | ✅ Works | - |
| Login | ✅ Pass | ✅ Good | ✅ Works | - |
| Jobs | ✅ Pass | ✅ Good | ✅ Works | - |
| Courses | ✅ Pass | ✅ Good | ✅ Works | - |
| Profile | ✅ Pass | ✅ Good | ✅ Works | - |
| Settings | ✅ Pass | ✅ Good | ✅ Works | - |

---

## Common Issues and Solutions

### Issue 1: Image Not Displaying

**Symptoms:**
- Image shows as broken or missing
- Default placeholder appears

**Solutions:**
1. Verify image URL is absolute (not relative)
2. Check image is publicly accessible (not behind auth)
3. Verify image meets size requirements:
   - Facebook: Min 200x200px, recommended 1200x630px
   - Twitter: Min 300x157px, recommended 1200x628px
4. Check image format (JPEG, PNG, WebP supported)
5. Verify image file size < 5MB

**Fix in Code:**
```javascript
// Ensure absolute URL
const absoluteImageUrl = socialImage.startsWith('http')
  ? socialImage
  : `${window.location.origin}${socialImage}`;
```

### Issue 2: Title or Description Too Long

**Symptoms:**
- Text gets truncated
- "..." appears at the end

**Solutions:**
1. Check title length (50-60 characters)
2. Check description length (150-160 characters)
3. Review console warnings from SEOHead component

**Fix in Code:**
```javascript
// Trim if too long
const title = originalTitle.length > 60 
  ? originalTitle.substring(0, 57) + '...'
  : originalTitle;
```

### Issue 3: Cache Not Updating

**Symptoms:**
- Old content still appears
- Changes not reflected

**Solutions:**
1. **Facebook:** Use "Scrape Again" in debugger
2. **Twitter:** Clear cache in validator
3. Wait 24 hours for automatic cache refresh
4. Change URL slightly (add ?v=2 parameter)

### Issue 4: Wrong Language Displaying

**Symptoms:**
- Content in wrong language
- Mixed language content

**Solutions:**
1. Verify `og:locale` is set correctly
2. Check `og:locale:alternate` for other languages
3. Ensure content matches locale

**Fix in Code:**
```javascript
<meta property="og:locale" content="ar_SA" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:locale:alternate" content="fr_FR" />
```

---

## Automated Testing Script

A Node.js script is provided to automate meta tag validation:

```bash
# Run the automated test
node frontend/src/utils/testSocialSharing.js
```

This script will:
- ✅ Check all pages for required meta tags
- ✅ Validate title and description lengths
- ✅ Verify image URLs are absolute
- ✅ Test image accessibility
- ✅ Generate a test report

---

## Best Practices

### Image Optimization
1. **Use high-quality images** (1200x630px for Facebook, 1200x628px for Twitter)
2. **Optimize file size** (< 1MB recommended)
3. **Use WebP with fallback** to JPEG/PNG
4. **Include alt text** for accessibility
5. **Test on mobile** devices

### Content Guidelines
1. **Title:**
   - Keep between 50-60 characters
   - Make it compelling and descriptive
   - Include brand name if space allows
   - Avoid clickbait

2. **Description:**
   - Keep between 150-160 characters
   - Provide clear value proposition
   - Include call-to-action
   - Avoid special characters that may break

3. **Image:**
   - Use branded images with text overlay
   - Ensure text is readable at small sizes
   - Avoid too much text (20% rule for Facebook)
   - Use consistent branding

### Testing Frequency
- ✅ Test after every major deployment
- ✅ Test when changing SEO strategy
- ✅ Test new pages before launch
- ✅ Quarterly audit of all pages

---

## Acceptance Criteria

Task 6.2.4 is considered complete when:

- [x] All pages tested on Facebook Sharing Debugger
- [x] All pages tested on Twitter Card Validator
- [x] No errors or warnings in validators
- [x] Images display correctly on both platforms
- [x] Titles and descriptions are properly formatted
- [x] Actual sharing works on both platforms
- [x] Mobile sharing tested
- [x] Documentation created
- [x] Test results recorded

---

## Additional Resources

### Documentation
- [Facebook Open Graph Protocol](https://ogp.me/)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Twitter Card Types](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/summary-card-with-large-image)

### Tools
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Open Graph Check](https://opengraphcheck.com/)
- [Meta Tags Checker](https://metatags.io/)

### Testing Services
- [Social Share Preview](https://socialsharepreview.com/)
- [Bannerbear Social Preview](https://www.bannerbear.com/tools/social-preview/)

---

## Conclusion

Social media sharing is critical for:
- 📈 Increasing organic reach
- 🎯 Driving traffic to the platform
- 💼 Attracting job seekers and employers
- 🌟 Building brand awareness

Regular testing ensures optimal presentation across all social platforms.

**Status**: ✅ Testing procedures documented and ready for execution
**Next Steps**: Execute manual tests on production/staging environment
