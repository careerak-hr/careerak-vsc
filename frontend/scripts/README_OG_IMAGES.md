# Social Media Preview Images Scripts

## Overview
This directory contains scripts for generating and verifying social media preview images (Open Graph images) for the Careerak platform.

## Scripts

### 1. generate-og-images.js
Generates 1200x630px preview images for all pages.

**Usage:**
```bash
npm run generate-og-images
```

**What it does:**
- Creates 18 unique preview images
- Uses brand colors from project-standards.md
- Supports multi-language titles (Arabic, English, French)
- Outputs to `public/og-images/`
- Optimized JPEG format (90% quality)

**Output:**
- 18 images in `public/og-images/`
- Total size: ~480KB
- Average size: ~27KB per image

### 2. verify-og-images.js
Verifies that all OG images are properly generated and configured.

**Usage:**
```bash
npm run verify-og-images
```

**What it checks:**
- ✅ All 18 images exist
- ✅ Correct dimensions (1200x630px)
- ✅ Reasonable file sizes (<500KB each)
- ✅ Referenced in seoMetadata.js
- ✅ Total size is acceptable (<2MB)

**Exit codes:**
- `0`: All checks passed
- `1`: Errors found

## Generated Images

| File | Page | Size |
|------|------|------|
| `language.jpg` | Language Selection | ~25KB |
| `entry.jpg` | Welcome Page | ~33KB |
| `login.jpg` | Login | ~27KB |
| `register.jpg` | Registration | ~28KB |
| `otp.jpg` | OTP Verification | ~29KB |
| `profile.jpg` | User Profile | ~27KB |
| `jobs.jpg` | Job Postings | ~26KB |
| `post-job.jpg` | Post a Job | ~26KB |
| `courses.jpg` | Training Courses | ~28KB |
| `post-course.jpg` | Post a Course | ~25KB |
| `apply.jpg` | Job Application | ~30KB |
| `settings.jpg` | Settings | ~25KB |
| `policy.jpg` | Privacy Policy | ~28KB |
| `notifications.jpg` | Notifications | ~25KB |
| `admin.jpg` | Admin Dashboard | ~26KB |
| `onboarding-individuals.jpg` | Onboarding (Individuals) | ~24KB |
| `onboarding-companies.jpg` | Onboarding (Companies) | ~25KB |
| `default.jpg` | Default Fallback | ~34KB |

## Workflow

### Initial Setup
```bash
# Generate all images
npm run generate-og-images

# Verify generation
npm run verify-og-images
```

### After Changes
```bash
# Regenerate images
npm run generate-og-images

# Verify changes
npm run verify-og-images
```

### Before Deployment
```bash
# Final verification
npm run verify-og-images
```

## Customization

### Change Colors
Edit `generate-og-images.js`:
```javascript
const COLORS = {
  primary: '#304B60',    // Your primary color
  secondary: '#E3DAD1',  // Your secondary color
  accent: '#D48161',     // Your accent color
};
```

### Change Dimensions
Edit `generate-og-images.js`:
```javascript
const WIDTH = 1200;   // Change width
const HEIGHT = 630;   // Change height
```

### Add New Page
Add to `PAGES` array in `generate-og-images.js`:
```javascript
{ 
  name: 'new-page', 
  title: { 
    ar: 'صفحة جديدة', 
    en: 'New Page', 
    fr: 'Nouvelle Page' 
  } 
}
```

Then update `EXPECTED_IMAGES` in `verify-og-images.js`:
```javascript
const EXPECTED_IMAGES = [
  // ... existing images
  'new-page.jpg'
];
```

### Change Language
Edit `main()` function in `generate-og-images.js`:
```javascript
// Generate in English instead of Arabic
await generateImage(page, 'en');

// Or generate for all languages
for (const lang of ['ar', 'en', 'fr']) {
  await generateImage(page, lang);
}
```

## Technical Details

### Dependencies
- **sharp**: Image processing library
- **fs**: File system operations
- **path**: Path manipulation

### Image Specifications
- **Format**: JPEG
- **Dimensions**: 1200x630px
- **Quality**: 90%
- **Progressive**: Yes
- **Color Space**: sRGB

### Design Elements
- Gradient background (primary → accent)
- White content container (95% opacity)
- Bold centered title (48-72px)
- "Careerak" branding (32px)
- Decorative circles
- Bottom accent line

## Troubleshooting

### Script Fails to Run
```bash
# Install dependencies
npm install

# Check Node.js version (14+ required)
node --version

# Verify Sharp installation
npm list sharp
```

### Images Not Generated
```bash
# Check output directory exists
ls public/og-images/

# Create directory manually if needed
mkdir -p public/og-images

# Run with verbose output
node scripts/generate-og-images.js
```

### Verification Fails
```bash
# Check which images are missing
npm run verify-og-images

# Regenerate all images
npm run generate-og-images

# Verify again
npm run verify-og-images
```

## Integration

### SEO Metadata
Images are automatically referenced in `src/config/seoMetadata.js`:
```javascript
jobPostings: {
  ar: {
    image: '/og-images/jobs.jpg',  // ← Generated image
    // ...
  }
}
```

### Meta Tags
The `SEOHead` component includes the images:
```jsx
<meta property="og:image" content={absoluteImageUrl} />
<meta name="twitter:image" content={absoluteImageUrl} />
```

## Testing

### Visual Inspection
```bash
# Open images directory
cd public/og-images/
# View images in file explorer or image viewer
```

### Social Media Debuggers
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

## Performance

- **Generation time**: 2-3 seconds for all 18 images
- **Total size**: ~480KB (0.48MB)
- **Average size**: ~27KB per image
- **Build impact**: Minimal
- **Runtime impact**: None (only loaded by crawlers)

## Documentation

- **Full Guide**: `docs/SOCIAL_MEDIA_PREVIEW_IMAGES.md`
- **Quick Start**: `docs/OG_IMAGES_QUICK_START.md`
- **Summary**: `docs/SEO/OG_IMAGES_SUMMARY.md`

## Status

✅ **COMPLETED** - All images generated and verified

## Next Steps

1. Test social sharing on Facebook
2. Test social sharing on Twitter
3. Validate with LinkedIn Post Inspector
4. Monitor engagement metrics

---

**Last Updated**: 2026-02-20  
**Total Images**: 18  
**Total Size**: ~480KB
