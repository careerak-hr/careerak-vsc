# SEO Redirects - Quick Start Guide

## What Are SEO Redirects?
Redirects automatically send users and search engines from one URL to another. They're essential for:
- Preventing duplicate content
- Consolidating link equity
- Maintaining SEO value when URLs change
- Providing better user experience

## Quick Reference

### 301 Redirect (Permanent)
```json
{
  "source": "/old-url",
  "destination": "/new-url",
  "permanent": true
}
```
**Use when**: URL permanently changed

### 302 Redirect (Temporary)
```json
{
  "source": "/old-url",
  "destination": "/new-url",
  "permanent": false
}
```
**Use when**: URL temporarily changed

## Current Redirects Summary

| Old URL | New URL | Type | Purpose |
|---------|---------|------|---------|
| `/jobs` | `/job-postings` | 301 | Consolidate job URLs |
| `/training` | `/courses` | 301 | Consolidate course URLs |
| `/register` | `/auth` | 301 | Standardize auth |
| `/signin` | `/login` | 301 | Standardize login |
| `/dashboard` | `/profile` | 301 | Consolidate profile |
| `/privacy` | `/policy` | 301 | Consolidate policies |
| `/home` | `/` | 301 | Clean homepage URL |
| `/about` | `/` | 302 | Temporary (page coming) |
| `/contact` | `/` | 302 | Temporary (page coming) |

## How to Add a New Redirect

### Step 1: Edit vercel.json
```bash
# Open the file
code vercel.json
```

### Step 2: Add Redirect
```json
{
  "redirects": [
    // ... existing redirects ...
    {
      "source": "/your-old-url",
      "destination": "/your-new-url",
      "permanent": true  // or false for temporary
    }
  ]
}
```

### Step 3: Test Locally (Optional)
```bash
# If you have Vercel CLI
vercel dev
```

### Step 4: Deploy
```bash
# Commit and push
git add vercel.json
git commit -m "Add redirect from /old to /new"
git push

# Or deploy directly
vercel --prod
```

### Step 5: Verify
```bash
# Test with curl
curl -I https://careerak.com/your-old-url

# Should see:
# HTTP/2 301 (or 302)
# location: https://careerak.com/your-new-url
```

## Common Redirect Patterns

### Pattern 1: Simple Redirect
```json
{
  "source": "/old",
  "destination": "/new",
  "permanent": true
}
```

### Pattern 2: Wildcard Redirect
```json
{
  "source": "/old/:path*",
  "destination": "/new/:path*",
  "permanent": true
}
```
Redirects `/old/anything` → `/new/anything`

### Pattern 3: Multiple Sources to One Destination
```json
{
  "source": "/jobs",
  "destination": "/job-postings",
  "permanent": true
},
{
  "source": "/careers",
  "destination": "/job-postings",
  "permanent": true
},
{
  "source": "/vacancies",
  "destination": "/job-postings",
  "permanent": true
}
```

## Testing Checklist

- [ ] Redirect returns correct status code (301 or 302)
- [ ] Destination URL is correct
- [ ] Destination page exists and loads
- [ ] No redirect loops
- [ ] No redirect chains (A→B→C)
- [ ] Works in incognito/private mode
- [ ] Works on mobile
- [ ] Google Search Console shows no errors

## Quick Troubleshooting

### Problem: Redirect not working
**Solutions**:
1. Clear browser cache
2. Test in incognito mode
3. Check vercel.json syntax
4. Verify deployment succeeded
5. Check Vercel dashboard logs

### Problem: Redirect loop
**Solutions**:
1. Check for circular redirects
2. Verify source ≠ destination
3. Check for conflicting redirects

### Problem: 404 after redirect
**Solutions**:
1. Verify destination page exists
2. Check destination URL spelling
3. Test destination URL directly

## Best Practices

### ✅ Do
- Use 301 for permanent changes
- Use 302 for temporary changes
- Redirect to existing pages
- Test before deploying
- Update internal links
- Document all redirects

### ❌ Don't
- Create redirect chains
- Redirect to redirects
- Use 302 for permanent changes
- Forget to test
- Leave broken redirects
- Redirect to 404 pages

## Performance Tips

1. **Minimize Redirects**: Each redirect adds latency
2. **Update Internal Links**: Avoid redirects when possible
3. **Use Edge Redirects**: Vercel handles this automatically
4. **Monitor Performance**: Check redirect speed in Vercel analytics

## SEO Impact

### 301 Redirects
- ✅ Pass 90-99% of link equity
- ✅ Signal permanent move to search engines
- ✅ Consolidate ranking signals
- ⚠️ May take weeks for search engines to process

### 302 Redirects
- ⚠️ Pass less link equity
- ⚠️ Signal temporary move
- ⚠️ Original URL may stay in search results
- ✅ Good for A/B testing

## Monitoring

### Google Search Console
1. Go to Coverage → Redirects
2. Check for redirect errors
3. Monitor redirect traffic
4. Verify 301s are recognized

### Vercel Analytics
1. Check redirect logs
2. Monitor redirect performance
3. Track redirect usage
4. Identify unused redirects

## Quick Commands

```bash
# Test redirect
curl -I https://careerak.com/old-url

# Test with follow redirects
curl -L https://careerak.com/old-url

# Check redirect chain
curl -sI https://careerak.com/old-url | grep -i location

# Deploy to Vercel
vercel --prod

# Check deployment status
vercel ls
```

## Examples

### Example 1: Rename a Page
**Scenario**: Renamed "dashboard" to "profile"

```json
{
  "source": "/dashboard",
  "destination": "/profile",
  "permanent": true
}
```

### Example 2: Consolidate Similar Pages
**Scenario**: Multiple job pages → one page

```json
{
  "source": "/jobs",
  "destination": "/job-postings",
  "permanent": true
},
{
  "source": "/careers",
  "destination": "/job-postings",
  "permanent": true
}
```

### Example 3: Temporary Redirect
**Scenario**: About page coming soon

```json
{
  "source": "/about",
  "destination": "/",
  "permanent": false
}
```

## Need Help?

### Documentation
- 📄 `docs/SEO_REDIRECTS_CONFIGURATION.md` - Complete guide
- 📄 `docs/SEO_IMPLEMENTATION.md` - Full SEO guide
- 📄 `vercel.json` - Configuration file

### External Resources
- [Vercel Redirects Docs](https://vercel.com/docs/project-configuration#project-configuration/redirects)
- [Google Redirects Guide](https://developers.google.com/search/docs/advanced/crawling/301-redirects)
- [Moz Redirect Guide](https://moz.com/learn/seo/redirection)

---

**Last Updated**: 2026-02-22  
**Status**: ✅ Active  
**Total Redirects**: 40+
