# SEO 301 Redirects Configuration

## Overview
This document describes the 301 redirects configured for Careerak to improve SEO and maintain URL consistency.

**Date Added**: 2026-02-21  
**Status**: ✅ Implemented  
**Requirements**: FR-SEO-10 (Canonical URLs)

## What are 301 Redirects?

301 redirects are permanent redirects that tell search engines and browsers that a page has permanently moved to a new location. They:
- Preserve SEO value (link juice) from old URLs
- Prevent duplicate content issues
- Improve user experience by directing to correct URLs
- Help consolidate page authority

## Configured Redirects

### Job-Related Redirects
```
/jobs → /job-postings (permanent)
/jobs/* → /job-postings/* (permanent)
```
**Reason**: Standardize job listing URLs to `/job-postings`

### Training/Course Redirects
```
/training → /courses (permanent)
/training/* → /courses/* (permanent)
```
**Reason**: Standardize course URLs to `/courses`

### Authentication Redirects
```
/register → /auth (permanent)
/signup → /auth (permanent)
/signin → /login (permanent)
```
**Reason**: Consolidate authentication URLs

### User Profile Redirects
```
/dashboard → /profile (permanent)
/user/* → /profile/* (permanent)
```
**Reason**: Standardize user profile URLs

### Admin Redirects
```
/admin → /admin-dashboard (permanent)
```
**Reason**: Explicit admin dashboard URL

### Onboarding Redirects
```
/onboarding → /onboarding-individuals (permanent)
```
**Reason**: Default onboarding flow

### Interface Redirects
```
/interface → /interface-individuals (permanent)
```
**Reason**: Default interface type

### Policy Redirects
```
/privacy → /policy (permanent)
/privacy-policy → /policy (permanent)
/terms → /policy (permanent)
```
**Reason**: Consolidate policy-related URLs

## Implementation

### Vercel Configuration
Redirects are configured in `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/old-url",
      "destination": "/new-url",
      "permanent": true
    }
  ]
}
```

### Key Properties
- **source**: The old URL pattern to match
- **destination**: The new URL to redirect to
- **permanent**: `true` for 301 (permanent), `false` for 302 (temporary)

## SEO Benefits

1. **Preserve Link Equity**: Old backlinks maintain their SEO value
2. **Prevent 404 Errors**: Users and bots find the correct page
3. **Consolidate Authority**: Multiple URLs point to canonical version
4. **Improve Crawl Efficiency**: Search engines don't waste time on old URLs
5. **Better User Experience**: Users always reach the intended content

## Testing Redirects

### Manual Testing
1. Visit old URL (e.g., `https://careerak.com/jobs`)
2. Verify redirect to new URL (e.g., `https://careerak.com/job-postings`)
3. Check browser network tab for 301 status code

### Automated Testing
```bash
# Test with curl
curl -I https://careerak.com/jobs

# Expected response:
# HTTP/1.1 301 Moved Permanently
# Location: https://careerak.com/job-postings
```

### SEO Tools
- Google Search Console: Monitor redirect chains
- Screaming Frog: Audit all redirects
- Lighthouse: Check for redirect issues

## Best Practices

### ✅ Do
- Use 301 for permanent redirects
- Keep redirect chains short (max 2 hops)
- Update internal links to point directly to new URLs
- Monitor redirect performance
- Document all redirects

### ❌ Don't
- Create redirect loops
- Use 302 for permanent changes
- Redirect to unrelated content
- Create long redirect chains
- Forget to update sitemaps

## Maintenance

### Adding New Redirects
1. Identify old URL pattern
2. Determine canonical new URL
3. Add to `vercel.json` redirects array
4. Test locally with Vercel CLI
5. Deploy and verify
6. Update this documentation

### Removing Redirects
Only remove redirects after:
- Old URLs have no traffic for 6+ months
- No backlinks point to old URLs
- Search engines have fully updated their index

## Monitoring

### Metrics to Track
- Redirect hit count
- 404 error rate
- Redirect response time
- Search engine crawl errors

### Tools
- Vercel Analytics
- Google Search Console
- Google Analytics
- Server logs

## Related Documentation
- 📄 `docs/SEO_IMPLEMENTATION.md` - Complete SEO guide
- 📄 `vercel.json` - Redirect configuration
- 📄 `.kiro/specs/general-platform-enhancements/design.md` - SEO design

## Future Enhancements

### Phase 2
- Implement redirect tracking analytics
- Add A/B testing for URL patterns
- Create redirect management UI
- Automated redirect suggestions

### Phase 3
- Machine learning for redirect optimization
- Automatic redirect cleanup
- Advanced redirect rules (geo, device, etc.)
- Redirect performance optimization

## Troubleshooting

### Redirect Not Working
1. Check `vercel.json` syntax
2. Verify deployment succeeded
3. Clear browser cache
4. Test in incognito mode
5. Check Vercel logs

### Redirect Loop
1. Check for circular redirects
2. Verify source ≠ destination
3. Review redirect chain
4. Test with curl to see full chain

### Wrong Status Code
1. Verify `permanent: true` for 301
2. Check Vercel configuration
3. Test with curl -I
4. Review Vercel documentation

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs/configuration#redirects
- Review this documentation
- Contact development team

---

**Last Updated**: 2026-02-21  
**Maintained By**: Development Team
