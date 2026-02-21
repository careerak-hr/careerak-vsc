# Sitemap Submission Quick Guide

## 🚀 Quick Steps to Submit Sitemap to Google Search Console

### 1️⃣ Access Google Search Console
- Go to: https://search.google.com/search-console
- Sign in with Google account

### 2️⃣ Add Property
- Click **"Add Property"**
- Choose **"Domain"**: `careerak.com` (recommended)
- OR choose **"URL prefix"**: `https://careerak.com`

### 3️⃣ Verify Ownership
Choose one method:
- **DNS TXT Record** (recommended)
- **HTML File Upload**
- **Meta Tag** in `<head>`
- **Google Analytics** (if installed)
- **Google Tag Manager** (if installed)

### 4️⃣ Submit Sitemap
1. Go to **"Sitemaps"** in left sidebar
2. Enter: `sitemap.xml`
3. Click **"Submit"**

### 5️⃣ Verify Success
- Wait 24-48 hours
- Check status shows **"Success"**
- Verify discovered URLs count

## 📋 Sitemap Details

**URL**: `https://careerak.com/sitemap.xml`  
**Location**: `frontend/public/sitemap.xml`  
**Total Pages**: 10  
**Format**: XML

## ✅ Verification Methods Comparison

| Method | Difficulty | Time | Recommended For |
|--------|-----------|------|-----------------|
| DNS TXT | Medium | 1-48 hours | Domain property |
| HTML File | Easy | 5 minutes | Quick setup |
| Meta Tag | Easy | 5 minutes | Quick setup |
| Google Analytics | Easy | Instant | If already using GA |
| Google Tag Manager | Easy | Instant | If already using GTM |

## 🔍 Quick Troubleshooting

### Sitemap Not Found?
```bash
# Check if accessible
curl https://careerak.com/sitemap.xml
```

### XML Errors?
- Validate at: https://www.xml-sitemaps.com/validate-xml-sitemap.html

### Not Indexing?
- Use URL Inspection Tool
- Click "Request Indexing"

## 📊 What to Monitor

- **Coverage**: Valid pages vs errors
- **Performance**: Clicks, impressions, CTR
- **Enhancements**: Mobile usability, Core Web Vitals
- **Security**: Manual actions, security issues

## ⏱️ Expected Timeline

| Action | Time |
|--------|------|
| Verification | Instant - 48 hours |
| Sitemap Processing | 24-48 hours |
| Initial Indexing | 3-7 days |
| Full Indexing | 1-4 weeks |

## 🎯 Success Criteria

- ✅ Property verified
- ✅ Sitemap submitted
- ✅ Status: "Success"
- ✅ URLs discovered: 10
- ✅ No critical errors
- ✅ Pages appearing in search

## 📞 Need Help?

- **Full Guide**: See `GOOGLE_SEARCH_CONSOLE_SETUP.md`
- **Google Help**: https://support.google.com/webmasters
- **Email**: careerak.hr@gmail.com

---

**Last Updated**: 2026-02-21  
**Sitemap Version**: 2026-02-20
