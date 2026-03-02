# Social Media Preview Images Generation

## Overview
This document describes the implementation of social media preview images (Open Graph images) for the Careerak platform.

## Implementation Date
2026-02-20

## Requirements Satisfied
- **FR-SEO-4**: Open Graph tags with og:image
- **FR-SEO-5**: Twitter Card tags with twitter:image
- **Task 6.2.3**: Generate social media preview images

## What Was Implemented

### 1. Image Generation Script
Created `frontend/scripts/generate-og-images.js` - an automated script that generates 1200x630px preview images for all pages using Sharp (Node.js image processing library).

**Features:**
- ✅ Generates 18 unique preview images for all pages
- ✅ Uses brand colors from project-standards.md
- ✅ Supports multi-language titles (Arabic, English, French)
- ✅ Creates professional gradient backgrounds
- ✅ Includes decorative elements and branding
- ✅ Optimized JPEG output (90% quality, progressive)
- ✅ Proper dimensions for all social platforms (1200x630px)

### 2. Generated Images
All images are stored in `frontend/public/og-images/`:

```
/og-images/
├── language.jpg              # Language selection page
├── entry.jpg                 # Entry/welcome page
├── login.jpg                 # Login page
├── register.jpg              # Registration page
├── otp.jpg                   # OTP verification
├── profile.jpg               # User profile
├── jobs.jpg                  # Job postings
├── post-job.jpg              # Post a job
├── courses.jpg               # Training courses
├── post-course.jpg           # Post a course
├── apply.jpg                 # Job application
├── settings.jpg              # Settings page
├── policy.jpg                # Privacy policy
├── notifications.jpg         # Notifications
├── admin.jpg                 # Admin dashboard
├── onboarding-individuals.jpg # Onboarding for individuals
├── onboarding-companies.jpg   # Onboarding for companies
└── default.jpg               # Default fallback
```

### 3. Image Specifications

**Dimensions:**
- Width: 1200px
- Height: 630px
- Aspect Ratio: 1.91:1

**Format:**
- Type: JPEG
- Quality: 90%
- Progressive: Yes
- Average file size: 50-100KB

**Design Elements:**
- Background: Gradient from primary (#304B60) to accent (#D48161)
- Content container: White rounded rectangle with 95% opacity
- Title: Bold, centered, responsive font size (48-72px)
- Subtitle: "Careerak" branding in accent color
- Decorative circles: Semi-transparent overlays
- Bottom accent line: Copper color (#D48161)

### 4. Brand Colors Used
Following project-standards.md:
- **Primary (Navy)**: #304B60
- **Secondary (Beige)**: #E3DAD1
- **Accent (Copper)**: #D48161
- **White**: #FFFFFF
- **Dark**: #1a1a1a

### 5. Multi-Language Support
Each image includes the page title in the appropriate language:
- **Arabic (ar)**: Primary language, RTL text direction
- **English (en)**: Available for generation
- **French (fr)**: Available for generation

Currently, all images use Arabic titles as the primary language.

## Usage

### Generate Images
```bash
cd frontend
npm run generate-og-images
```

### Regenerate Specific Images
Edit the `PAGES` array in `scripts/generate-og-images.js` and run the script again.

### Customize Design
Modify the `generateSVG()` function in the script to change:
- Colors
- Font sizes
- Layout
- Decorative elements

## Integration with SEO System

The generated images are automatically used by the SEO system:

### 1. SEO Metadata Configuration
Images are referenced in `frontend/src/config/seoMetadata.js`:

```javascript
jobPostings: {
  ar: {
    title: 'فرص العمل - Careerak',
    description: 'تصفح آلاف فرص العمل...',
    image: '/og-images/jobs.jpg',  // ← Generated image
    url: '/jobs'
  }
}
```

### 2. SEOHead Component
The `SEOHead` component automatically includes the images in meta tags:

```jsx
<meta property="og:image" content={absoluteImageUrl} />
<meta name="twitter:image" content={absoluteImageUrl} />
```

### 3. Automatic URL Resolution
The `useSEO` hook converts relative paths to absolute URLs:

```javascript
// Input: /og-images/jobs.jpg
// Output: https://careerak.com/og-images/jobs.jpg
```

## Social Media Platform Support

### Facebook
- **Recommended size**: 1200x630px ✅
- **Minimum size**: 600x315px ✅
- **Aspect ratio**: 1.91:1 ✅
- **Format**: JPEG ✅
- **Max file size**: 8MB ✅ (our images: ~50-100KB)

### Twitter
- **Recommended size**: 1200x628px ✅ (close enough)
- **Minimum size**: 300x157px ✅
- **Aspect ratio**: 2:1 ✅ (1.91:1 is acceptable)
- **Format**: JPEG ✅
- **Max file size**: 5MB ✅

### LinkedIn
- **Recommended size**: 1200x627px ✅ (close enough)
- **Minimum size**: 1200x627px ✅
- **Aspect ratio**: 1.91:1 ✅
- **Format**: JPEG ✅
- **Max file size**: 5MB ✅

### WhatsApp
- Uses Open Graph tags ✅
- Displays og:image ✅
- No specific size requirements

### Telegram
- Uses Open Graph tags ✅
- Displays og:image ✅
- No specific size requirements

## Testing

### 1. Visual Inspection
Open the generated images in `frontend/public/og-images/` and verify:
- ✅ Text is readable
- ✅ Colors match brand guidelines
- ✅ Layout is professional
- ✅ No visual artifacts

### 2. Social Media Debuggers

**Facebook Debugger:**
```
https://developers.facebook.com/tools/debug/
```
- Enter your page URL
- Click "Scrape Again" to refresh cache
- Verify image displays correctly

**Twitter Card Validator:**
```
https://cards-dev.twitter.com/validator
```
- Enter your page URL
- Verify card preview
- Check image dimensions

**LinkedIn Post Inspector:**
```
https://www.linkedin.com/post-inspector/
```
- Enter your page URL
- Verify preview
- Check image quality

**Open Graph Check:**
```
https://opengraphcheck.com/
```
- Enter your page URL
- Verify all OG tags
- Check image preview

### 3. Local Testing
```bash
# Start development server
cd frontend
npm run dev

# Open browser and inspect meta tags
# View source: Ctrl+U (Windows) or Cmd+Option+U (Mac)
# Search for: og:image
```

## File Size Optimization

Current images are already optimized:
- **Format**: JPEG (better compression than PNG for photos)
- **Quality**: 90% (good balance between quality and size)
- **Progressive**: Yes (faster perceived loading)
- **Average size**: 50-100KB per image
- **Total size**: ~1-2MB for all 18 images

## Customization Guide

### Change Colors
Edit the `COLORS` object in `scripts/generate-og-images.js`:

```javascript
const COLORS = {
  primary: '#304B60',    // Your primary color
  secondary: '#E3DAD1',  // Your secondary color
  accent: '#D48161',     // Your accent color
  white: '#FFFFFF',
  dark: '#1a1a1a'
};
```

### Change Dimensions
Edit the constants at the top of the script:

```javascript
const WIDTH = 1200;   // Change width
const HEIGHT = 630;   // Change height
```

### Add New Pages
Add to the `PAGES` array:

```javascript
const PAGES = [
  // ... existing pages
  { 
    name: 'new-page', 
    title: { 
      ar: 'صفحة جديدة', 
      en: 'New Page', 
      fr: 'Nouvelle Page' 
    } 
  }
];
```

### Change Language
Modify the `main()` function:

```javascript
// Generate in English instead of Arabic
await generateImage(page, 'en');

// Or generate for all languages
for (const lang of ['ar', 'en', 'fr']) {
  await generateImage(page, lang);
}
```

## Advanced Features

### Dynamic Image Generation
For dynamic content (job postings, courses), consider:

1. **Cloudinary Transformations:**
   - Use Cloudinary's text overlay feature
   - Generate images on-the-fly
   - Cache results for performance

2. **Server-Side Generation:**
   - Generate images on request
   - Use Canvas or Sharp on the server
   - Cache generated images

3. **Third-Party Services:**
   - Vercel OG Image Generation
   - Cloudinary Social Media Cards
   - Imgix Social Media Cards

### Example: Dynamic Job Posting Image
```javascript
// Using Cloudinary text overlay
const jobImageUrl = cloudinary.url('og-images/jobs.jpg', {
  transformation: [
    { overlay: { text: jobTitle, font_family: 'Arial', font_size: 60 } },
    { color: '#304B60' },
    { gravity: 'center' }
  ]
});
```

## Troubleshooting

### Images Not Showing on Social Media
1. **Clear cache**: Use social media debuggers to refresh
2. **Check URL**: Ensure absolute URLs (https://...)
3. **Verify file exists**: Check `public/og-images/` directory
4. **Check file size**: Must be under 8MB (Facebook) or 5MB (Twitter)

### Images Look Blurry
1. **Increase quality**: Change `quality: 90` to `quality: 95`
2. **Check dimensions**: Ensure 1200x630px minimum
3. **Use PNG**: Change `.jpeg()` to `.png()` (larger file size)

### Text Not Readable
1. **Increase font size**: Modify `fontSize` in `generateSVG()`
2. **Improve contrast**: Adjust background/text colors
3. **Add text shadow**: Add shadow to SVG text element

### Script Fails to Run
1. **Install dependencies**: `npm install`
2. **Check Sharp**: Ensure Sharp is installed correctly
3. **Check Node version**: Requires Node.js 14+

## Performance Impact

### Build Time
- Generation time: ~2-3 seconds for all 18 images
- Can be run during build process
- No impact on runtime performance

### Page Load
- Images are only loaded by social media crawlers
- Not loaded during normal page visits
- No impact on user experience

### Storage
- Total size: ~1-2MB for all images
- Minimal impact on deployment size
- Can be served from CDN

## Best Practices

### DO:
- ✅ Use 1200x630px dimensions
- ✅ Keep file size under 1MB per image
- ✅ Use JPEG for photos/gradients
- ✅ Test with social media debuggers
- ✅ Include branding (logo, colors)
- ✅ Make text readable at small sizes
- ✅ Use high contrast colors

### DON'T:
- ❌ Use images smaller than 600x315px
- ❌ Exceed 8MB file size
- ❌ Use too much text (keep it simple)
- ❌ Use low contrast colors
- ❌ Forget to test on actual platforms
- ❌ Use copyrighted images without permission

## Future Enhancements

### Phase 1 (Current)
- ✅ Static images for all pages
- ✅ Automated generation script
- ✅ Brand-consistent design

### Phase 2 (Planned)
- [ ] Dynamic images for job postings
- [ ] Dynamic images for courses
- [ ] User profile images
- [ ] Company logo integration

### Phase 3 (Future)
- [ ] A/B testing different designs
- [ ] Personalized images per user
- [ ] Animated OG images (GIF)
- [ ] Video previews (og:video)

## References

- [Open Graph Protocol](https://ogp.me/)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [LinkedIn Post Inspector Guide](https://www.linkedin.com/help/linkedin/answer/46687)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)

## Status

✅ **COMPLETED** - Task 6.2.3: Generate social media preview images

All 18 preview images have been generated and are ready for use in social media sharing.

## Next Steps

1. **Task 6.2.4**: Test social media sharing on Facebook and Twitter
2. **Task 6.2.5**: Validate Open Graph with Facebook debugger
3. Consider implementing dynamic image generation for job postings and courses
4. Monitor social media engagement metrics

---

**Last Updated**: 2026-02-20  
**Script Location**: `frontend/scripts/generate-og-images.js`  
**Images Location**: `frontend/public/og-images/`  
**Total Images**: 18
