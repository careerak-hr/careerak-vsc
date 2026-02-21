# Google Search Console Setup Guide

## Overview
This guide provides step-by-step instructions for submitting the Careerak sitemap to Google Search Console to improve search engine visibility and indexing.

## Prerequisites
- ✅ Sitemap.xml generated at `frontend/public/sitemap.xml`
- ✅ Website deployed and accessible at https://careerak.com
- ✅ Google account with appropriate permissions
- ✅ Domain ownership verification capability

## What is Google Search Console?
Google Search Console (GSC) is a free service that helps you monitor, maintain, and troubleshoot your site's presence in Google Search results. Submitting your sitemap helps Google:
- Discover all pages on your site
- Understand your site structure
- Crawl your site more efficiently
- Index new and updated content faster

## Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. If this is your first time, you'll see a welcome screen

## Step 2: Add Your Property

### Option A: Domain Property (Recommended)
This covers all subdomains and protocols (http/https).

1. Click **"Add Property"**
2. Select **"Domain"**
3. Enter: `careerak.com`
4. Click **"Continue"**

### Option B: URL Prefix Property
This covers only the specific URL you enter.

1. Click **"Add Property"**
2. Select **"URL prefix"**
3. Enter: `https://careerak.com`
4. Click **"Continue"**

## Step 3: Verify Domain Ownership

Google will provide several verification methods. Choose the one that works best for you:

### Method 1: DNS Verification (Recommended for Domain Property)
1. Google will provide a TXT record
2. Add this TXT record to your domain's DNS settings
3. Wait for DNS propagation (can take up to 48 hours, usually faster)
4. Click **"Verify"** in Google Search Console

**Example TXT Record:**
```
Name: @
Type: TXT
Value: google-site-verification=abc123xyz456...
```

### Method 2: HTML File Upload
1. Download the verification HTML file from Google
2. Upload it to `frontend/public/` directory
3. Deploy your site
4. Verify the file is accessible at: `https://careerak.com/google[verification-code].html`
5. Click **"Verify"** in Google Search Console

### Method 3: HTML Meta Tag
1. Copy the meta tag provided by Google
2. Add it to the `<head>` section of your `index.html`
3. Deploy your site
4. Click **"Verify"** in Google Search Console

**Example Meta Tag:**
```html
<meta name="google-site-verification" content="abc123xyz456..." />
```

### Method 4: Google Analytics (If Already Using)
1. Ensure you have Google Analytics installed with the same Google account
2. Select this verification method
3. Click **"Verify"**

### Method 5: Google Tag Manager (If Already Using)
1. Ensure you have Google Tag Manager installed with the same Google account
2. Select this verification method
3. Click **"Verify"**

## Step 4: Submit Your Sitemap

Once your property is verified:

1. In the left sidebar, click **"Sitemaps"**
2. In the "Add a new sitemap" field, enter: `sitemap.xml`
3. Click **"Submit"**

**Full Sitemap URL:** `https://careerak.com/sitemap.xml`

### Expected Result
- Status: **Success** (green checkmark)
- Discovered URLs: Should show the number of URLs in your sitemap
- Last read: Current date/time

## Step 5: Verify Sitemap Submission

1. Wait 24-48 hours for Google to process the sitemap
2. Check the "Sitemaps" section for:
   - **Status**: Should be "Success"
   - **Discovered URLs**: Should match the number of URLs in your sitemap (currently 10)
   - **Last read**: Should show a recent date

## Step 6: Monitor Indexing Status

### Coverage Report
1. Go to **"Coverage"** in the left sidebar
2. Check for:
   - **Valid pages**: Pages successfully indexed
   - **Errors**: Pages with indexing issues
   - **Warnings**: Pages with potential issues
   - **Excluded**: Pages intentionally not indexed

### URL Inspection Tool
1. Click the search bar at the top
2. Enter any URL from your site (e.g., `https://careerak.com/job-postings`)
3. Click **"Test Live URL"** to see how Google sees your page
4. If not indexed, click **"Request Indexing"** to expedite

## Troubleshooting

### Sitemap Not Found (404 Error)
**Problem**: Google can't access your sitemap.

**Solutions**:
- Verify sitemap is deployed: Visit `https://careerak.com/sitemap.xml` in your browser
- Check Vercel deployment logs
- Ensure `sitemap.xml` is in the `public` folder
- Clear CDN cache if using one

### Sitemap Couldn't Be Read
**Problem**: Sitemap has XML errors.

**Solutions**:
- Validate sitemap: Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- Check for special characters that need escaping
- Ensure proper XML formatting
- Verify UTF-8 encoding

### Some URLs Not Indexed
**Problem**: Google discovered URLs but didn't index them.

**Solutions**:
- Check robots.txt isn't blocking URLs
- Ensure pages return 200 status code
- Verify pages have sufficient content
- Check for duplicate content issues
- Use URL Inspection Tool to request indexing

### Verification Failed
**Problem**: Can't verify domain ownership.

**Solutions**:
- Double-check DNS record or meta tag
- Wait longer for DNS propagation (up to 48 hours)
- Try alternative verification method
- Clear browser cache and try again

## Best Practices

### 1. Keep Sitemap Updated
- Regenerate sitemap when adding new pages
- Update `lastmod` dates when content changes
- Remove deleted pages from sitemap

### 2. Monitor Regularly
- Check GSC weekly for errors
- Review coverage reports monthly
- Monitor search performance trends

### 3. Submit Sitemap Updates
- After major site changes, resubmit sitemap
- Google will automatically check for updates, but manual submission helps

### 4. Use robots.txt
Ensure your `robots.txt` references the sitemap:
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://careerak.com/sitemap.xml
```

### 5. Set Up Email Notifications
1. Go to **"Settings"** in GSC
2. Enable email notifications for:
   - Critical issues
   - Manual actions
   - Security issues

## Expected Timeline

- **Verification**: Immediate to 48 hours (DNS method)
- **Sitemap Processing**: 24-48 hours
- **Initial Indexing**: 3-7 days
- **Full Indexing**: 1-4 weeks

## Verification Checklist

- [ ] Google Search Console account created
- [ ] Property added (careerak.com)
- [ ] Domain ownership verified
- [ ] Sitemap submitted (sitemap.xml)
- [ ] Sitemap status shows "Success"
- [ ] URLs discovered matches sitemap count
- [ ] robots.txt includes sitemap reference
- [ ] Email notifications enabled
- [ ] Coverage report reviewed
- [ ] No critical errors found

## Additional Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Search Central](https://developers.google.com/search)
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)

## Current Sitemap Details

**Location**: `frontend/public/sitemap.xml`  
**URL**: `https://careerak.com/sitemap.xml`  
**Total URLs**: 10  
**Last Updated**: 2026-02-20

### Included Pages:
1. Homepage (/) - Priority: 1.0, Daily updates
2. Entry (/entry) - Priority: 0.9, Weekly updates
3. Language (/language) - Priority: 0.8, Monthly updates
4. Login (/login) - Priority: 0.7, Monthly updates
5. Auth (/auth) - Priority: 0.7, Monthly updates
6. OTP Verify (/otp-verify) - Priority: 0.6, Monthly updates
7. Auth Callback (/auth/callback) - Priority: 0.6, Monthly updates
8. Job Postings (/job-postings) - Priority: 0.8, Daily updates
9. Courses (/courses) - Priority: 0.7, Weekly updates
10. Policy (/policy) - Priority: 0.5, Monthly updates

## Next Steps After Submission

1. **Wait 24-48 hours** for initial processing
2. **Check Coverage Report** for indexing status
3. **Monitor Search Performance** in GSC
4. **Fix any errors** reported by Google
5. **Request indexing** for important pages using URL Inspection Tool
6. **Set up regular monitoring** (weekly checks recommended)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google Search Console Help documentation
3. Contact the development team
4. Email: careerak.hr@gmail.com

---

**Note**: This is a manual process that requires access to the Google account and domain settings. The actual submission must be performed by someone with the appropriate credentials and permissions.
