# SEO Maintenance Guide

**Purpose**: Quick reference for maintaining Lighthouse SEO score 95+  
**Last Updated**: 2026-02-22

## Daily Tasks

### None Required
SEO maintenance is primarily monthly/quarterly, not daily.

## Weekly Tasks

### 1. Monitor Search Console
- Check Google Search Console for crawl errors
- Review new search queries
- Check for manual actions or security issues

**Action**: Fix any critical issues immediately

## Monthly Tasks

### 1. Update Sitemap Dates
**File**: `frontend/public/sitemap.xml`

Update `<lastmod>` dates for frequently updated pages:
```xml
<lastmod>2026-03-22</lastmod>
```

### 2. Run Lighthouse Audit
```bash
cd frontend
npm run build
npm run audit:lighthouse
```

**Target**: SEO score 95+

### 3. Check for Broken Links
- Use Google Search Console
- Check internal links
- Fix any 404 errors

### 4. Review Meta Tags
- Ensure all new pages have SEOHead component
- Verify title lengths (50-60 chars)
- Verify description lengths (150-160 chars)

### 5. Update Structured Data
- Verify JobPosting schema on new jobs
- Verify Course schema on new courses
- Test with Google Rich Results Test

## Quarterly Tasks

### 1. Comprehensive SEO Audit
- Run full Lighthouse audit on all pages
- Check all meta tags
- Verify all structured data
- Test social media sharing
- Review robots.txt
- Review sitemap.xml

### 2. Competitor Analysis
- Check competitor SEO scores
- Review competitor meta tags
- Analyze competitor structured data
- Identify improvement opportunities

### 3. Content Review
- Review and update page titles
- Review and update meta descriptions
- Update keywords based on search trends
- Improve alt text on images

### 4. Technical SEO Review
- Check page load speeds
- Verify mobile-friendliness
- Check for duplicate content
- Review canonical URLs
- Verify hreflang tags

## When Adding New Pages

### Checklist:
- [ ] Add SEOHead component with unique title and description
- [ ] Add page to sitemap.xml
- [ ] Set appropriate priority and changefreq
- [ ] Add canonical URL
- [ ] Ensure proper heading hierarchy (one h1, then h2, h3)
- [ ] Add alt text to all images
- [ ] Add structured data if applicable
- [ ] Test with Lighthouse

### Example:
```jsx
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const NewPage = () => {
  const seo = useSEO('newPage', {
    title: 'New Page Title (50-60 chars)',
    description: 'New page description that is between 150-160 characters long and describes the page content accurately.',
    keywords: 'keyword1, keyword2, keyword3'
  });

  return (
    <>
      <SEOHead {...seo} />
      <main id="main-content" tabIndex="-1">
        <h1>New Page Title</h1>
        {/* Page content */}
      </main>
    </>
  );
};
```

## When Adding New Jobs

### Checklist:
- [ ] Ensure JobPosting structured data is generated
- [ ] Verify all required fields are present
- [ ] Test with Google Rich Results Test
- [ ] Check that job appears in sitemap (if individual job pages)

### Required Fields:
- title
- description
- datePosted
- hiringOrganization (name, logo)
- jobLocation (city, country)
- employmentType (Full-time, Part-time, etc.)

## When Adding New Courses

### Checklist:
- [ ] Ensure Course structured data is generated
- [ ] Verify all required fields are present
- [ ] Test with Google Rich Results Test
- [ ] Check that course appears in sitemap (if individual course pages)

### Required Fields:
- name
- description
- provider (name)
- courseMode (online, offline, blended)

## Common Issues and Fixes

### Issue: Lighthouse SEO score dropped below 95

**Possible Causes**:
1. Missing meta tags on new pages
2. Duplicate title tags
3. Missing alt text on images
4. Broken canonical URLs
5. Sitemap not updated

**Fix**:
1. Run Lighthouse audit to identify specific issues
2. Check all pages have SEOHead component
3. Verify all images have alt text
4. Check canonical URLs are correct
5. Update sitemap.xml

### Issue: Pages not appearing in search results

**Possible Causes**:
1. Not in sitemap.xml
2. Blocked by robots.txt
3. No meta description
4. Duplicate content

**Fix**:
1. Add page to sitemap.xml
2. Check robots.txt doesn't block page
3. Add SEOHead component with description
4. Add canonical URL

### Issue: Social media previews not working

**Possible Causes**:
1. Missing Open Graph tags
2. Missing Twitter Card tags
3. Image URL not absolute
4. Image too small

**Fix**:
1. Verify SEOHead component has all OG tags
2. Verify image URL is absolute (https://...)
3. Ensure image is at least 1200x630px
4. Test with Facebook Debugger and Twitter Validator

### Issue: Structured data errors

**Possible Causes**:
1. Missing required fields
2. Invalid data format
3. Incorrect schema type

**Fix**:
1. Check StructuredData component
2. Verify all required fields are present
3. Test with Google Rich Results Test
4. Check schema.org documentation

## Tools and Resources

### Testing Tools:
- **Lighthouse**: `npm run audit:lighthouse`
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster Tools**: https://www.bing.com/webmasters

### Documentation:
- **Schema.org**: https://schema.org/
- **Open Graph Protocol**: https://ogp.me/
- **Twitter Cards**: https://developer.twitter.com/en/docs/twitter-for-websites/cards
- **Google SEO Guide**: https://developers.google.com/search/docs

### Internal Documentation:
- `docs/SEO_IMPLEMENTATION_VERIFICATION.md` - Complete SEO verification
- `docs/SEO_SCORE_95_ACHIEVEMENT.md` - Achievement summary
- `docs/SEO/README.md` - SEO component documentation
- `frontend/src/components/SEO/SEOHead.jsx` - SEOHead component
- `frontend/src/components/SEO/StructuredData.jsx` - StructuredData component

## Monitoring Metrics

### Key Metrics to Track:
1. **Lighthouse SEO Score**: Target 95+
2. **Organic Traffic**: Track in Google Analytics
3. **Search Rankings**: Track for key terms
4. **Click-Through Rate (CTR)**: From search results
5. **Crawl Errors**: In Google Search Console
6. **Indexed Pages**: In Google Search Console
7. **Rich Results**: In Google Search Console

### Monthly Report Template:
```
SEO Monthly Report - [Month Year]

Lighthouse SEO Score: [Score]/100
Organic Traffic: [Number] visits ([+/-]% vs last month)
Top Search Queries: [List top 5]
Crawl Errors: [Number]
Indexed Pages: [Number]
Rich Results: [Number]

Issues Found: [List]
Actions Taken: [List]
Next Month Goals: [List]
```

## Emergency Procedures

### If SEO Score Drops Below 90:
1. **Immediate**: Run Lighthouse audit to identify issues
2. **Within 1 hour**: Fix critical issues (missing meta tags, broken canonical URLs)
3. **Within 24 hours**: Fix all identified issues
4. **Within 48 hours**: Re-run Lighthouse audit to verify fixes
5. **Document**: What went wrong and how to prevent it

### If Site Disappears from Search Results:
1. **Check Google Search Console** for manual actions
2. **Check robots.txt** - ensure not blocking all crawlers
3. **Check sitemap.xml** - ensure it's accessible
4. **Check for security issues** - malware, hacking
5. **Contact Google** if manual action is unclear
6. **Document** the incident and resolution

## Best Practices

### Do's:
- ✅ Always use SEOHead component on new pages
- ✅ Keep title tags between 50-60 characters
- ✅ Keep meta descriptions between 150-160 characters
- ✅ Use descriptive alt text on all images
- ✅ Maintain proper heading hierarchy (one h1 per page)
- ✅ Update sitemap.xml when adding pages
- ✅ Test with Lighthouse before deploying
- ✅ Use structured data for jobs and courses
- ✅ Keep robots.txt up to date

### Don'ts:
- ❌ Don't duplicate title tags across pages
- ❌ Don't use generic descriptions like "Welcome to our site"
- ❌ Don't forget alt text on images
- ❌ Don't use multiple h1 tags on one page
- ❌ Don't block important pages in robots.txt
- ❌ Don't forget to update sitemap.xml
- ❌ Don't deploy without testing SEO
- ❌ Don't use keyword stuffing
- ❌ Don't create duplicate content

## Contact

For SEO-related questions or issues:
- **Technical Lead**: [Name]
- **SEO Specialist**: [Name]
- **Documentation**: `docs/SEO_IMPLEMENTATION_VERIFICATION.md`

## Version History

- **2026-02-22**: Initial version - Lighthouse SEO score 95+ achieved
- **[Future Date]**: [Future updates]
