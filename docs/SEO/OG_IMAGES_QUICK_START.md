# Social Media Preview Images - Quick Start Guide

## 🎯 What Are These Images?

Social media preview images (Open Graph images) are the images that appear when you share a link on:
- Facebook
- Twitter
- LinkedIn
- WhatsApp
- Telegram
- Slack

## 📐 Specifications

- **Dimensions**: 1200x630px
- **Format**: JPEG
- **Quality**: 90%
- **File Size**: 50-100KB each
- **Total Images**: 18

## 🚀 Quick Commands

### Generate All Images
```bash
cd frontend
npm run generate-og-images
```

### Verify Images
```bash
# Check if images exist
ls public/og-images/

# Should show 18 .jpg files
```

## 📁 Generated Images

| File | Page | Arabic Title |
|------|------|--------------|
| `language.jpg` | Language Selection | اختر لغتك |
| `entry.jpg` | Welcome Page | مرحباً بك في Careerak |
| `login.jpg` | Login | تسجيل الدخول |
| `register.jpg` | Registration | إنشاء حساب جديد |
| `otp.jpg` | OTP Verification | التحقق من الهوية |
| `profile.jpg` | User Profile | الملف الشخصي |
| `jobs.jpg` | Job Postings | فرص العمل |
| `post-job.jpg` | Post a Job | نشر وظيفة |
| `courses.jpg` | Training Courses | الدورات التدريبية |
| `post-course.jpg` | Post a Course | نشر دورة |
| `apply.jpg` | Job Application | التقديم على الوظيفة |
| `settings.jpg` | Settings | الإعدادات |
| `policy.jpg` | Privacy Policy | سياسة الخصوصية |
| `notifications.jpg` | Notifications | الإشعارات |
| `admin.jpg` | Admin Dashboard | لوحة التحكم |
| `onboarding-individuals.jpg` | Onboarding (Individuals) | للأفراد |
| `onboarding-companies.jpg` | Onboarding (Companies) | للشركات |
| `default.jpg` | Default Fallback | Careerak - منصة التوظيف |

## 🎨 Design Elements

### Colors (from project-standards.md)
- **Primary (Navy)**: #304B60
- **Secondary (Beige)**: #E3DAD1
- **Accent (Copper)**: #D48161

### Layout
- Gradient background (primary → accent)
- White content container
- Bold centered title
- "Careerak" branding
- Decorative circles
- Bottom accent line

## 🔗 How They're Used

### 1. In SEO Metadata
```javascript
// frontend/src/config/seoMetadata.js
jobPostings: {
  ar: {
    image: '/og-images/jobs.jpg',  // ← Generated image
    // ...
  }
}
```

### 2. In Meta Tags
```html
<meta property="og:image" content="https://careerak.com/og-images/jobs.jpg" />
<meta name="twitter:image" content="https://careerak.com/og-images/jobs.jpg" />
```

### 3. Automatic Resolution
The system automatically converts relative paths to absolute URLs.

## ✅ Testing

### Visual Check
1. Open `frontend/public/og-images/`
2. View each image
3. Verify text is readable
4. Check colors match brand

### Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your page URL
3. Click "Scrape Again"
4. Verify image preview

### Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter your page URL
3. Verify card preview

### LinkedIn Post Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter your page URL
3. Verify preview

## 🔧 Customization

### Change Colors
Edit `frontend/scripts/generate-og-images.js`:
```javascript
const COLORS = {
  primary: '#304B60',    // Your color
  secondary: '#E3DAD1',  // Your color
  accent: '#D48161',     // Your color
};
```

### Add New Page
Add to `PAGES` array:
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

### Change Language
In `main()` function:
```javascript
// English instead of Arabic
await generateImage(page, 'en');
```

## 🐛 Troubleshooting

### Images Not Showing
- Clear social media cache using debuggers
- Verify absolute URLs (https://...)
- Check file exists in `public/og-images/`

### Blurry Images
- Increase quality to 95%
- Ensure 1200x630px dimensions
- Consider using PNG instead of JPEG

### Script Fails
- Run `npm install` to install dependencies
- Check Node.js version (14+ required)
- Verify Sharp is installed correctly

## 📊 Performance

- **Generation time**: 2-3 seconds for all images
- **Total size**: ~1-2MB
- **Impact on page load**: None (only loaded by crawlers)
- **Build time**: Minimal

## 📚 Full Documentation

For detailed information, see:
- `docs/SOCIAL_MEDIA_PREVIEW_IMAGES.md` - Complete guide
- `docs/OPEN_GRAPH_IMPLEMENTATION.md` - OG tags implementation
- `frontend/scripts/generate-og-images.js` - Generation script

## ✨ Status

✅ **COMPLETED** - All 18 images generated and ready to use!

## 🎯 Next Steps

1. Test social sharing on Facebook
2. Test social sharing on Twitter
3. Validate with LinkedIn Post Inspector
4. Monitor engagement metrics

---

**Quick Reference**: Run `npm run generate-og-images` to regenerate all images.
