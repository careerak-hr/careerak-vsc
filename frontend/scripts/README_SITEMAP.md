# Sitemap Generation Script

## Overview
Automated sitemap generation script for SEO optimization. Generates `sitemap.xml` with all public routes, proper priorities, and update frequencies.

## Requirements
- **Spec**: General Platform Enhancements
- **Task**: 6.4.1 - Create sitemap generation script
- **Requirement**: FR-SEO-8

## Features
✅ Automatic sitemap.xml generation  
✅ Configurable priorities and update frequencies  
✅ Public/protected route filtering  
✅ XML validation  
✅ Statistics and reporting  
✅ Environment variable support  

## Usage

### Generate Sitemap
```bash
npm run generate-sitemap
```

### With Custom Base URL
```bash
VITE_APP_URL=https://your-domain.com npm run generate-sitemap
```

### Include Protected Routes
```bash
SITEMAP_INCLUDE_PROTECTED=true npm run generate-sitemap
```

## Output
- **Location**: `frontend/public/sitemap.xml`
- **Format**: XML (Sitemap Protocol 0.9)
- **Encoding**: UTF-8

## Route Configuration

### Priority Levels
- **1.0** - Homepage (highest priority)
- **0.8-0.9** - Important public pages (entry, job postings)
- **0.5-0.7** - Secondary pages (courses, auth, profile)
- **<0.5** - Low priority pages

### Update Frequencies
- **daily** - Homepage, job postings, notifications
- **weekly** - Entry page, courses, interfaces
- **monthly** - Auth pages, policy, settings

### Public vs Protected Routes
By default, only **public routes** are included in the sitemap:
- `/` - Homepage
- `/entry` - Entry page
- `/language` - Language selection
- `/login` - Login page
- `/auth` - Registration page
- `/job-postings` - Job listings
- `/courses` - Course listings
- `/policy` - Privacy policy

Protected routes (require authentication) are excluded by default but can be included with `SITEMAP_INCLUDE_PROTECTED=true`.

## Validation

The script performs automatic validation:
- ✅ XML declaration
- ✅ URLset element
- ✅ Location elements
- ✅ Priority elements
- ✅ Change frequency elements

## Statistics

The script provides detailed statistics:
- Total routes
- Public vs protected routes
- Priority distribution
- Update frequency distribution

## Integration

### Build Process
Add to your build script in `package.json`:
```json
{
  "scripts": {
    "build": "npm run generate-sitemap && vite build"
  }
}
```

### Robots.txt
Add sitemap reference to `public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://careerak.com/sitemap.xml
```

### Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Navigate to Sitemaps
4. Submit: `https://careerak.com/sitemap.xml`

## Environment Variables

### VITE_APP_URL
Base URL for the application (default: `https://careerak.com`)
```bash
VITE_APP_URL=https://your-domain.com
```

### SITEMAP_INCLUDE_PROTECTED
Include protected routes in sitemap (default: `false`)
```bash
SITEMAP_INCLUDE_PROTECTED=true
```

## Adding New Routes

To add a new route to the sitemap, edit `scripts/generate-sitemap.js`:

```javascript
const routes = [
  // ... existing routes
  {
    path: '/new-page',
    priority: 0.7,
    changefreq: 'weekly',
    public: true,
    description: 'Description of the page'
  }
];
```

### Route Properties
- **path** (required) - URL path
- **priority** (required) - SEO priority (0.0-1.0)
- **changefreq** (required) - Update frequency (daily/weekly/monthly)
- **public** (required) - Is the route public? (true/false)
- **description** (optional) - Route description for documentation

## Validation Tools

### Online Validators
- [XML Sitemaps Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [Google Search Console](https://search.google.com/search-console)

### Manual Validation
```bash
# Check if sitemap exists
ls -la frontend/public/sitemap.xml

# View sitemap content
cat frontend/public/sitemap.xml

# Validate XML syntax
xmllint --noout frontend/public/sitemap.xml
```

## Troubleshooting

### Sitemap not generated
- Check if `frontend/public/` directory exists
- Verify Node.js is installed
- Check for script errors in console

### Wrong base URL
- Set `VITE_APP_URL` environment variable
- Check `.env` file configuration

### Missing routes
- Verify route is marked as `public: true`
- Check if `SITEMAP_INCLUDE_PROTECTED` is needed
- Review route configuration in script

### XML validation errors
- Check for special characters in URLs
- Verify XML structure
- Use online validators

## Best Practices

### SEO Optimization
1. **Homepage priority 1.0** - Always highest
2. **Job postings 0.8** - High priority for content
3. **Update frequency** - Match actual content changes
4. **Public routes only** - Don't include auth-required pages

### Maintenance
1. **Regenerate on deploy** - Keep sitemap current
2. **Update on route changes** - Add new public routes
3. **Monitor in GSC** - Check for crawl errors
4. **Validate regularly** - Ensure XML is valid

### Performance
1. **Static generation** - Generate at build time
2. **Cache sitemap** - Set proper cache headers
3. **Compress** - Enable gzip/brotli compression

## Related Files
- `frontend/scripts/generate-sitemap.js` - Main script
- `frontend/public/sitemap.xml` - Generated sitemap
- `frontend/public/robots.txt` - Robots configuration
- `frontend/package.json` - NPM scripts

## Next Steps
1. ✅ Generate sitemap
2. ⏳ Create robots.txt (Task 6.4.4)
3. ⏳ Submit to Google Search Console (Task 6.4.5)
4. ⏳ Add to build process
5. ⏳ Monitor crawl statistics

## References
- [Sitemaps Protocol](https://www.sitemaps.org/protocol.html)
- [Google Sitemap Guidelines](https://developers.google.com/search/docs/advanced/sitemaps/overview)
- [Sitemap Best Practices](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap)

---

**Last Updated**: 2026-02-20  
**Status**: ✅ Complete  
**Task**: 6.4.1
