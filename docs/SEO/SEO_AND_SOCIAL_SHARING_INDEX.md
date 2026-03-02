# SEO and Social Sharing Documentation Index

## Overview
This index provides quick access to all SEO and social media sharing documentation for the Careerak platform.

---

## 📚 Documentation Files

### 1. Social Media Sharing Test Guide
**File**: `SOCIAL_MEDIA_SHARING_TEST.md`  
**Purpose**: Comprehensive testing procedures for Facebook and Twitter sharing  
**Contents**:
- Pre-testing validation
- Facebook testing procedures
- Twitter testing procedures
- Test results templates
- Common issues and solutions
- Best practices

**When to use**: When performing manual testing on social media platforms

---

### 2. Social Sharing Quick Reference
**File**: `SOCIAL_SHARING_QUICK_REFERENCE.md`  
**Purpose**: Quick reference guide for developers  
**Contents**:
- Quick testing URLs
- Required meta tags checklist
- Image requirements
- Common issues & quick fixes
- Testing workflow
- SEOHead component usage

**When to use**: During development or quick troubleshooting

---

### 3. Task Completion Summary
**File**: `TASK_6.2.4_COMPLETION_SUMMARY.md`  
**Purpose**: Summary of task 6.2.4 implementation  
**Contents**:
- What was implemented
- Testing tools provided
- Testing checklist
- Implementation details
- Next steps

**When to use**: To understand what was delivered for task 6.2.4

---

## 🛠️ Tools and Scripts

### 1. Automated Testing Script
**File**: `frontend/src/utils/testSocialSharing.js`  
**Purpose**: Automated validation of meta tags  
**Usage**:
```bash
# Test local development
node frontend/src/utils/testSocialSharing.js

# Test production
TEST_URL=https://your-domain.com node frontend/src/utils/testSocialSharing.js
```

**Features**:
- Validates all required meta tags
- Checks title/description lengths
- Verifies image URLs
- Generates detailed reports

---

### 2. Test HTML Page
**File**: `frontend/public/test-social-sharing.html`  
**Purpose**: Visual test page for meta tags  
**Access**: `http://localhost:5173/test-social-sharing.html`

**Features**:
- Displays all meta tags
- Links to testing tools
- Copy URL functionality
- Console logging

---

## 🔗 External Testing Tools

### Facebook
- **Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Purpose**: Validate Open Graph tags and preview Facebook shares

### Twitter
- **Card Validator**: https://cards-dev.twitter.com/validator
- **Purpose**: Validate Twitter Card tags and preview tweets

### Additional Tools
- **Open Graph Check**: https://opengraphcheck.com/
- **Meta Tags Checker**: https://metatags.io/
- **Social Share Preview**: https://socialsharepreview.com/

---

## 📋 Quick Start Guide

### For Developers

1. **During Development**
   ```bash
   # Start dev server
   npm run dev
   
   # Run automated tests
   node frontend/src/utils/testSocialSharing.js
   ```

2. **Add SEOHead to New Pages**
   ```jsx
   import { SEOHead } from '../components/SEO';
   
   <SEOHead
     title="Page Title (50-60 chars)"
     description="Page description (150-160 chars)"
     keywords="keyword1, keyword2"
     image="https://domain.com/image.jpg"
     url="https://domain.com/page"
   />
   ```

3. **Validate Meta Tags**
   - Open browser console
   - Run: `document.querySelectorAll('meta[property^="og:"]')`
   - Check all required tags are present

### For Testers

1. **Pre-Deployment Testing**
   ```bash
   # Build and preview
   npm run build
   npm run preview
   
   # Test preview build
   TEST_URL=http://localhost:4173 node frontend/src/utils/testSocialSharing.js
   ```

2. **Post-Deployment Testing**
   - Run automated tests on production URL
   - Test each page on Facebook Debugger
   - Test each page on Twitter Card Validator
   - Perform actual sharing tests
   - Document results

---

## ✅ Testing Checklist

### Automated Testing
- [ ] Run `testSocialSharing.js` script
- [ ] All tests pass
- [ ] No console errors
- [ ] All meta tags present

### Facebook Testing
- [ ] Test all pages in Sharing Debugger
- [ ] No errors or warnings
- [ ] Images display correctly
- [ ] Test actual sharing
- [ ] Test on mobile

### Twitter Testing
- [ ] Test all pages in Card Validator
- [ ] Card type is "summary_large_image"
- [ ] Images display correctly
- [ ] Test actual tweeting
- [ ] Test on mobile

---

## 📊 Meta Tags Requirements

### Open Graph (Facebook)
```html
<meta property="og:title" content="..." />           <!-- 50-60 chars -->
<meta property="og:description" content="..." />     <!-- 150-160 chars -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://..." />     <!-- Absolute URL -->
<meta property="og:image" content="https://..." />   <!-- 1200x630px -->
<meta property="og:site_name" content="Careerak" />
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />          <!-- 50-60 chars -->
<meta name="twitter:description" content="..." />    <!-- 150-160 chars -->
<meta name="twitter:image" content="https://..." />  <!-- 1200x628px -->
```

---

## 🖼️ Image Requirements

### Facebook
- **Minimum**: 200x200px
- **Recommended**: 1200x630px
- **Aspect Ratio**: 1.91:1
- **Max Size**: 8MB

### Twitter
- **Minimum**: 300x157px
- **Recommended**: 1200x628px
- **Aspect Ratio**: 2:1
- **Max Size**: 5MB

---

## 🐛 Common Issues

### Issue: Image Not Showing
**Cause**: Relative URL instead of absolute  
**Fix**: Use `https://domain.com/image.jpg` not `/image.jpg`

### Issue: Title/Description Too Long
**Cause**: Exceeds character limits  
**Fix**: Keep title 50-60 chars, description 150-160 chars

### Issue: Cache Not Updating
**Cause**: Social media platforms cache meta tags  
**Fix**: Use "Scrape Again" in Facebook Debugger or add `?v=2` to URL

---

## 📖 Related Documentation

### Internal
- `frontend/src/components/SEO/SEOHead.jsx` - SEOHead component
- `frontend/src/components/SEO/__tests__/SEOHead.test.jsx` - Unit tests
- `.kiro/specs/general-platform-enhancements/design.md` - SEO design

### External
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)

---

## 🎯 Best Practices

1. **Always use absolute URLs** for images
2. **Keep titles between 50-60 characters**
3. **Keep descriptions between 150-160 characters**
4. **Use high-quality images** (1200x630px recommended)
5. **Test before deployment** using automated script
6. **Test after deployment** on actual platforms
7. **Monitor and update** regularly

---

## 📞 Support

For issues or questions:
1. Check the relevant documentation file
2. Run the automated testing script
3. Review console warnings from SEOHead component
4. Test with online validators
5. Refer to external documentation

---

## 📅 Maintenance

### Regular Tasks
- **Weekly**: Run automated tests on production
- **Monthly**: Manual testing on Facebook and Twitter
- **Quarterly**: Full audit of all pages
- **As Needed**: Update images and content

### After Changes
- Run automated tests
- Test affected pages on validators
- Verify actual sharing works
- Update documentation if needed

---

**Last Updated**: 2026-02-20  
**Status**: ✅ Complete and Ready for Use
