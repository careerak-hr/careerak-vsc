# SEO Quick Start Guide

## Overview

Quick reference guide for implementing SEO on new pages in the Careerak platform.

**Date**: 2026-02-22  
**Full Documentation**: `docs/SEO_IMPLEMENTATION.md`

---

## 1. Add SEO to a New Page (5 minutes)

### Step 1: Import SEOHead

```jsx
import SEOHead from '../components/SEO/SEOHead';
```

### Step 2: Add SEOHead Component

```jsx
function YourPage() {
  return (
    <>
      <SEOHead
        title="Your Page Title - Value Proposition | Careerak"
        description="Compelling description 150-160 characters that includes primary keyword and call-to-action."
        keywords="keyword1, keyword2, keyword3"
        image="https://careerak.com/images/your-page-og.jpg"
        url="https://careerak.com/your-page"
      />
      
      {/* Your page content */}
    </>
  );
}
```

### Step 3: Verify

1. Open page in browser
2. View page source (Ctrl+U)
3. Check for meta tags in `<head>`

---

## 2. Add Structured Data (3 minutes)

### For Job Postings

```jsx
import StructuredData from '../components/SEO/StructuredData';

<StructuredData
  type="JobPosting"
  data={{
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    validThrough: job.expiresAt,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      name: job.company.name,
      logo: job.company.logo
    },
    jobLocation: {
      address: {
        addressCountry: job.country,
        addressLocality: job.city
      }
    }
  }}
/>
```

### For Courses

```jsx
<StructuredData
  type="Course"
  data={{
    name: course.title,
    description: course.description,
    provider: {
      name: "Careerak Academy",
      url: "https://careerak.com"
    },
    courseMode: "online"
  }}
/>
```

---

## 3. SEO Checklist for New Pages

### Required (Must Have)

- [ ] Unique title tag (50-60 characters)
- [ ] Unique meta description (150-160 characters)
- [ ] Canonical URL
- [ ] H1 heading (one per page)
- [ ] Alt text on all images
- [ ] Open Graph tags (title, description, image, url)
- [ ] Twitter Card tags

### Recommended (Should Have)

- [ ] Keywords meta tag
- [ ] Structured data (if applicable)
- [ ] Internal links to related pages
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Descriptive URLs
- [ ] Mobile-responsive

### Optional (Nice to Have)

- [ ] FAQ schema
- [ ] Breadcrumb schema
- [ ] Video schema
- [ ] Review schema

---

## 4. Common SEO Patterns

### Homepage

```jsx
<SEOHead
  title="Careerak - Your Career Platform in the Arab World"
  description="Connect with employers, find jobs, take courses, and advance your career. Join thousands of professionals across the Arab world."
  keywords="career, jobs, courses, employment, Arab world"
  image="https://careerak.com/images/home-og.jpg"
  url="https://careerak.com"
/>
```

### Listing Page (Jobs, Courses)

```jsx
<SEOHead
  title="Job Postings - Find Your Dream Job | Careerak"
  description="Browse thousands of job opportunities in technology, healthcare, education, and more. Apply directly and connect with top employers."
  keywords="jobs, employment, job search, career opportunities"
  image="https://careerak.com/images/jobs-og.jpg"
  url="https://careerak.com/jobs"
/>
```

### Detail Page (Job, Course, Profile)

```jsx
<SEOHead
  title={`${job.title} at ${job.company.name} | Careerak`}
  description={job.description.substring(0, 160)}
  keywords={job.skills.join(', ')}
  image={job.company.logo}
  url={`https://careerak.com/jobs/${job._id}`}
/>

<StructuredData type="JobPosting" data={jobData} />
```

### Static Page (About, Contact)

```jsx
<SEOHead
  title="About Us - Connecting Talent with Opportunity | Careerak"
  description="Learn about Careerak's mission to connect job seekers with employers across the Arab world. Discover our story and values."
  keywords="about careerak, company info, mission, values"
  image="https://careerak.com/images/about-og.jpg"
  url="https://careerak.com/about"
/>
```

---

## 5. Title Tag Formula

### Format
```
[Page Name] - [Value Proposition] | Careerak
```

### Examples
- `Senior Software Engineer at Tech Co | Careerak`
- `Web Development Bootcamp - Learn Full Stack | Careerak`
- `Ahmed Hassan - Professional Profile | Careerak`
- `Job Postings - Find Your Dream Job | Careerak`

### Rules
- ✅ 50-60 characters
- ✅ Include primary keyword
- ✅ Unique for every page
- ✅ Brand at the end
- ❌ No keyword stuffing
- ❌ No all caps

---

## 6. Meta Description Formula

### Format
```
[What] + [Benefit] + [Call-to-Action]
```

### Examples
- `Browse thousands of job opportunities in technology and healthcare. Apply directly and connect with top employers. Start your job search now.`
- `Learn full-stack web development from industry experts. Build real projects and launch your tech career. Enroll today and get certified.`

### Rules
- ✅ 150-160 characters
- ✅ Include primary keyword
- ✅ Include CTA
- ✅ Unique for every page
- ❌ No duplicate of title
- ❌ No generic text

---

## 7. Image Alt Text Formula

### Format
```
[Subject] + [Action/Context] + [Location/Platform]
```

### Examples
- `Professional using laptop to search for jobs on Careerak platform`
- `Ahmed Hassan - Senior Software Engineer profile on Careerak`
- `Web development course curriculum on Careerak Academy`

### Rules
- ✅ Descriptive and specific
- ✅ Include keywords naturally
- ✅ Under 125 characters
- ❌ No "image of" or "picture of"
- ❌ No keyword stuffing

---

## 8. Testing Your SEO

### Quick Tests

1. **View Source** (Ctrl+U):
   - Check title tag
   - Check meta description
   - Check Open Graph tags

2. **Google Rich Results Test**:
   - Go to: https://search.google.com/test/rich-results
   - Enter your URL
   - Verify no errors

3. **Facebook Debugger**:
   - Go to: https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Check preview

4. **Lighthouse Audit**:
   ```bash
   lighthouse https://careerak.com/your-page --only-categories=seo
   ```
   - Target: 95+ score

---

## 9. Common Mistakes to Avoid

### ❌ Don't Do This

```jsx
// Missing SEO
function BadPage() {
  return <div>Content</div>;
}

// Duplicate titles
<SEOHead title="Careerak" />  // Same on every page

// Generic descriptions
<SEOHead description="Welcome to our website" />

// Missing alt text
<img src="/image.jpg" />

// Keyword stuffing
<SEOHead 
  title="Jobs Jobs Employment Career Jobs Careerak Jobs"
  keywords="jobs, jobs, jobs, jobs, jobs, jobs"
/>
```

### ✅ Do This Instead

```jsx
// Complete SEO
function GoodPage() {
  return (
    <>
      <SEOHead
        title="Unique Page Title | Careerak"
        description="Specific description for this page"
        keywords="relevant, keywords, only"
        image="https://careerak.com/images/page-og.jpg"
        url="https://careerak.com/page"
      />
      <h1>Page Heading</h1>
      <img src="/image.jpg" alt="Descriptive alt text" />
      <div>Content</div>
    </>
  );
}
```

---

## 10. SEO Maintenance

### Weekly
- [ ] Check Google Search Console for errors
- [ ] Monitor keyword rankings
- [ ] Review top-performing pages

### Monthly
- [ ] Update sitemap
- [ ] Audit meta tags for duplicates
- [ ] Check for broken links
- [ ] Review structured data

### Quarterly
- [ ] Full Lighthouse audit
- [ ] Competitor analysis
- [ ] Content refresh
- [ ] Backlink analysis

---

## 11. Resources

### Tools
- [Google Search Console](https://search.google.com/search-console)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Documentation
- Full Guide: `docs/SEO_IMPLEMENTATION.md`
- Schema.org: https://schema.org
- Open Graph: https://ogp.me
- Google SEO Guide: https://developers.google.com/search

### Support
- Email: careerak.hr@gmail.com
- Check existing pages for examples
- Review `frontend/src/components/SEO/` for components

---

## 12. Quick Reference

### SEOHead Props

| Prop | Required | Example |
|------|----------|---------|
| title | ✅ Yes | "Page Title \| Careerak" |
| description | ✅ Yes | "Page description 150-160 chars" |
| keywords | ⚠️ Optional | "keyword1, keyword2, keyword3" |
| image | ⚠️ Optional | "https://careerak.com/og.jpg" |
| url | ✅ Yes | "https://careerak.com/page" |

### StructuredData Types

| Type | Use For | Required Props |
|------|---------|----------------|
| JobPosting | Job listings | title, description, datePosted |
| Course | Training courses | name, description, provider |
| Organization | Company info | name, url, logo |

### Character Limits

| Element | Optimal | Maximum |
|---------|---------|---------|
| Title | 50-60 | 70 |
| Description | 150-160 | 320 |
| Alt Text | 80-100 | 125 |
| Keywords | 10-15 words | 255 chars |

---

## Summary

1. **Always add SEOHead** to new pages
2. **Use unique titles and descriptions** for every page
3. **Add structured data** for jobs and courses
4. **Include alt text** on all images
5. **Test with Lighthouse** before deploying
6. **Monitor Search Console** weekly

**Need help?** Check `docs/SEO_IMPLEMENTATION.md` for detailed guide.

