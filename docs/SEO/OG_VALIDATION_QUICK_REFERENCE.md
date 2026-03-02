# Open Graph Validation - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### Step 1: Open Facebook Debugger
Go to: https://developers.facebook.com/tools/debug/

### Step 2: Test Your Pages
Enter each URL and click "Debug":
- ✅ https://careerak.com/jobs
- ✅ https://careerak.com/courses
- ✅ https://careerak.com/login
- ✅ https://careerak.com/auth
- ✅ https://careerak.com/profile

### Step 3: Check Results
Look for:
- ✅ Green checkmarks = Good
- ⚠️ Yellow warnings = Review
- ❌ Red errors = Must fix

### Step 4: Clear Cache
If changes don't show:
- Click "Scrape Again" button
- Wait 10 seconds
- Check again

---

## 📋 Validation Checklist

### Required Tags (Must Have)
- [ ] `og:title` - Page title (50-60 chars)
- [ ] `og:description` - Page description (150-160 chars)
- [ ] `og:image` - Image URL (absolute, 1200x630px)
- [ ] `og:url` - Page URL (absolute)
- [ ] `og:type` - Content type (usually "website")
- [ ] `og:site_name` - Site name ("Careerak")
- [ ] `og:locale` - Language (ar_SA, en_US, fr_FR)

### Twitter Tags (Must Have)
- [ ] `twitter:card` - Card type (summary_large_image)
- [ ] `twitter:title` - Same as og:title
- [ ] `twitter:description` - Same as og:description
- [ ] `twitter:image` - Same as og:image

---

## 🔧 Common Fixes

### Fix 1: Image Not Showing
```html
<!-- ❌ Wrong -->
<meta property="og:image" content="/logo.png" />

<!-- ✅ Correct -->
<meta property="og:image" content="https://careerak.com/logo.png" />
```

### Fix 2: Title Too Long
```javascript
// Keep between 50-60 characters
title: 'Job Opportunities - Careerak | Find Your Perfect Job' // ✅ 56 chars
```

### Fix 3: Description Too Long
```javascript
// Keep between 150-160 characters
description: 'Browse thousands of job opportunities across various fields...' // ✅ 155 chars
```

### Fix 4: Clear Facebook Cache
1. Go to Facebook Debugger
2. Enter URL
3. Click "Scrape Again"
4. Wait 10 seconds
5. Refresh page

---

## 🎯 Pages to Validate

### Priority 1 (Must Validate)
- [ ] Job Postings (`/jobs`)
- [ ] Courses (`/courses`)
- [ ] Login (`/login`)
- [ ] Registration (`/auth`)
- [ ] Profile (`/profile`)

### Priority 2 (Should Validate)
- [ ] Entry Page (`/entry`)
- [ ] Post Job (`/post-job`)
- [ ] Post Course (`/post-course`)
- [ ] Settings (`/settings`)
- [ ] Notifications (`/notifications`)

### Priority 3 (Nice to Have)
- [ ] Language Selection (`/language`)
- [ ] OTP Verification (`/otp`)
- [ ] Privacy Policy (`/policy`)
- [ ] Admin Dashboard (`/admin`)
- [ ] Onboarding Pages

---

## 🛠️ Validation Tools

### 1. Facebook Sharing Debugger ⭐
**URL**: https://developers.facebook.com/tools/debug/
**Use for**: Primary validation, cache clearing

### 2. Open Graph Check
**URL**: https://opengraphcheck.com/
**Use for**: Quick check without login

### 3. Twitter Card Validator
**URL**: https://cards-dev.twitter.com/validator
**Use for**: Twitter-specific validation

### 4. LinkedIn Post Inspector
**URL**: https://www.linkedin.com/post-inspector/
**Use for**: LinkedIn-specific validation

---

## ✅ Success Criteria

Task 6.2.5 is complete when:
1. ✅ All Priority 1 pages validated
2. ✅ No critical errors
3. ✅ All required tags present
4. ✅ Images display correctly
5. ✅ Titles/descriptions within limits

---

## 📞 Need Help?

**Full Guide**: `docs/OPEN_GRAPH_VALIDATION_GUIDE.md`
**Email**: careerak.hr@gmail.com

---

## 🎨 Image Requirements

### Size
- Recommended: 1200x630 pixels
- Minimum: 600x315 pixels
- Aspect ratio: 1.91:1

### Format
- ✅ JPG (photos)
- ✅ PNG (graphics)
- ✅ WebP (modern)
- ❌ GIF (not recommended)

### File Size
- Maximum: 8MB
- Recommended: < 1MB
- Optimized: < 300KB

### URL
- Must be absolute (https://...)
- Must be publicly accessible
- No authentication required
- No redirects

---

## 📊 Validation Report Template

```
# OG Validation Report

Date: [Date]
Validator: [Name]

## Results

### Job Postings (/jobs)
- Status: ✅ Pass
- Facebook: ✅ Valid
- Twitter: ✅ Valid
- Issues: None

### Courses (/courses)
- Status: ⚠️ Warning
- Facebook: ✅ Valid
- Twitter: ⚠️ Image size
- Issues: Image should be 1200x630
- Action: Updated image

[Continue for all pages...]

## Summary
- Total: 15 pages
- Passed: 13
- Warnings: 2
- Failed: 0
```

---

## 🚨 Red Flags

Watch out for:
- ❌ Missing og:image
- ❌ Relative URLs (not absolute)
- ❌ Images behind authentication
- ❌ Images too small (<200x200)
- ❌ Title/description too long
- ❌ Multiple og:image tags
- ❌ Wrong locale setting

---

## 💡 Pro Tips

1. **Test in Incognito**: Avoid cache issues
2. **Use Multiple Tools**: Cross-validate results
3. **Check Mobile**: Test on mobile devices
4. **Monitor Shares**: Track actual social shares
5. **Update Regularly**: Re-validate after changes
6. **Document Everything**: Keep validation reports
7. **Automate**: Use scripts for regular checks

---

## 📱 Test Sharing

### Facebook
1. Copy URL
2. Create new post
3. Paste URL
4. Verify preview

### Twitter
1. Copy URL
2. Create new tweet
3. Paste URL
4. Verify card

### WhatsApp
1. Copy URL
2. Open chat
3. Paste URL
4. Verify preview

---

## 🔄 After Validation

1. ✅ Document results
2. ✅ Fix any issues
3. ✅ Re-validate
4. ✅ Update task status
5. ✅ Notify team
6. ✅ Monitor shares

---

**Last Updated**: 2026-02-20
**Version**: 1.0.0
**Status**: ✅ Ready to Use
