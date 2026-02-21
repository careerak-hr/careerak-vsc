# Sitemap Submission Checklist

Use this checklist to ensure proper sitemap submission to Google Search Console.

## 📋 Pre-Submission Checklist

### Verify Sitemap Accessibility
- [ ] Visit https://careerak.com/sitemap.xml in browser
- [ ] Confirm XML displays correctly (no 404 error)
- [ ] Verify all 10 URLs are listed
- [ ] Check lastmod dates are current (2026-02-20)

### Validate Sitemap
- [ ] Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [ ] Confirm no XML syntax errors
- [ ] Verify proper UTF-8 encoding
- [ ] Check all URLs return 200 status code

### Verify robots.txt
- [ ] Visit https://careerak.com/robots.txt
- [ ] Confirm sitemap reference: `Sitemap: https://careerak.com/sitemap.xml`
- [ ] Verify crawling rules are correct
- [ ] Check no unintended Disallow rules

## 🔐 Google Search Console Setup

### Account Access
- [ ] Have Google account credentials ready
- [ ] Ensure account has appropriate permissions
- [ ] Confirm access to domain DNS settings (if using DNS verification)

### Property Setup
- [ ] Access https://search.google.com/search-console
- [ ] Click "Add Property"
- [ ] Choose verification method:
  - [ ] Domain (recommended): `careerak.com`
  - [ ] URL prefix: `https://careerak.com`

### Domain Verification
Choose ONE method and complete:

#### Option 1: DNS TXT Record (Recommended)
- [ ] Copy TXT record from Google
- [ ] Add to domain DNS settings
- [ ] Wait for DNS propagation (check with `nslookup -type=TXT careerak.com`)
- [ ] Click "Verify" in GSC
- [ ] Confirm verification success

#### Option 2: HTML File Upload
- [ ] Download verification file from Google
- [ ] Upload to `frontend/public/`
- [ ] Deploy to production
- [ ] Verify file accessible at `https://careerak.com/google[code].html`
- [ ] Click "Verify" in GSC
- [ ] Confirm verification success

#### Option 3: HTML Meta Tag
- [ ] Copy meta tag from Google
- [ ] Add to `frontend/public/index.html` in `<head>` section
- [ ] Deploy to production
- [ ] Click "Verify" in GSC
- [ ] Confirm verification success

#### Option 4: Google Analytics
- [ ] Confirm GA installed with same Google account
- [ ] Select this verification method
- [ ] Click "Verify"
- [ ] Confirm verification success

#### Option 5: Google Tag Manager
- [ ] Confirm GTM installed with same Google account
- [ ] Select this verification method
- [ ] Click "Verify"
- [ ] Confirm verification success

## 📤 Sitemap Submission

### Submit to Google Search Console
- [ ] Navigate to "Sitemaps" in left sidebar
- [ ] Enter `sitemap.xml` in the "Add a new sitemap" field
- [ ] Click "Submit"
- [ ] Confirm submission success message

### Verify Submission
- [ ] Wait 5-10 minutes
- [ ] Refresh the Sitemaps page
- [ ] Check status shows "Success" (green checkmark)
- [ ] Verify "Discovered URLs" shows 10
- [ ] Confirm "Last read" shows current date/time

## 🔍 Post-Submission Verification

### Initial Checks (Within 24 Hours)
- [ ] Check sitemap status remains "Success"
- [ ] Verify no errors in Coverage report
- [ ] Confirm URLs are being discovered
- [ ] Check for any warnings or issues

### Coverage Report (After 48 Hours)
- [ ] Navigate to "Coverage" in GSC
- [ ] Check "Valid" pages count
- [ ] Review any "Errors" (should be 0)
- [ ] Check "Warnings" (address if any)
- [ ] Review "Excluded" pages (expected for admin/api)

### URL Inspection (After 3-7 Days)
- [ ] Test homepage: `https://careerak.com/`
- [ ] Test job postings: `https://careerak.com/job-postings`
- [ ] Test courses: `https://careerak.com/courses`
- [ ] Verify "URL is on Google" status
- [ ] Check mobile usability
- [ ] Review Core Web Vitals

## 📊 Monitoring Setup

### Enable Notifications
- [ ] Go to "Settings" in GSC
- [ ] Enable email notifications for:
  - [ ] Critical issues
  - [ ] Manual actions
  - [ ] Security issues
  - [ ] New issues detected

### Set Up Regular Monitoring
- [ ] Add GSC to bookmarks
- [ ] Schedule weekly checks (recommended: Monday mornings)
- [ ] Set calendar reminder for monthly reviews
- [ ] Document monitoring process for team

## 🎯 Success Criteria

### Immediate (Day 1)
- [ ] Property verified successfully
- [ ] Sitemap submitted without errors
- [ ] Status shows "Success"
- [ ] Discovered URLs: 10

### Short-term (Week 1)
- [ ] No critical errors in Coverage report
- [ ] At least 50% of URLs indexed
- [ ] Mobile usability: No issues
- [ ] Core Web Vitals: Good

### Long-term (Month 1)
- [ ] 100% of public URLs indexed
- [ ] Search appearance data available
- [ ] Performance metrics showing impressions
- [ ] No manual actions or security issues

## 🐛 Troubleshooting

### If Sitemap Not Found
- [ ] Verify deployment completed successfully
- [ ] Check Vercel deployment logs
- [ ] Clear CDN cache
- [ ] Test sitemap URL in incognito browser
- [ ] Check for typos in sitemap URL

### If Verification Fails
- [ ] Double-check DNS record or meta tag
- [ ] Wait longer for DNS propagation (up to 48 hours)
- [ ] Try alternative verification method
- [ ] Clear browser cache
- [ ] Check for typos in verification code

### If URLs Not Indexing
- [ ] Use URL Inspection Tool
- [ ] Click "Request Indexing" for important pages
- [ ] Check robots.txt not blocking URLs
- [ ] Verify pages return 200 status
- [ ] Ensure sufficient content on pages
- [ ] Check for duplicate content issues

## 📝 Documentation

### Record Keeping
- [ ] Document verification method used
- [ ] Save verification code/file
- [ ] Note submission date and time
- [ ] Record initial discovered URLs count
- [ ] Screenshot success confirmation

### Team Communication
- [ ] Notify team of successful submission
- [ ] Share GSC access with relevant team members
- [ ] Document monitoring schedule
- [ ] Create process for handling GSC alerts

## 🔄 Ongoing Maintenance

### Weekly Tasks
- [ ] Check GSC for new errors
- [ ] Review coverage report
- [ ] Monitor search performance
- [ ] Address any warnings

### Monthly Tasks
- [ ] Review full coverage report
- [ ] Analyze search performance trends
- [ ] Check for new enhancement opportunities
- [ ] Update sitemap if new pages added

### Quarterly Tasks
- [ ] Run full Lighthouse audit
- [ ] Review and optimize meta descriptions
- [ ] Analyze search rankings
- [ ] Update SEO strategy based on data

## ✅ Completion Sign-off

**Submitted by**: ___________________  
**Date**: ___________________  
**Verification Method**: ___________________  
**GSC Property URL**: ___________________  
**Initial Discovered URLs**: ___________________  
**Notes**: ___________________

---

**Reference Documents**:
- Full Guide: `GOOGLE_SEARCH_CONSOLE_SETUP.md`
- Quick Guide: `SITEMAP_SUBMISSION_QUICK_GUIDE.md`
- SEO Overview: `README.md`

**Last Updated**: 2026-02-21
