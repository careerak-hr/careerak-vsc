# SEOHead Implementation Guide

## Overview
This document provides a complete guide for adding SEOHead component to all page components in the Careerak application.

## Requirements
- FR-SEO-1: Unique, descriptive title tags (50-60 characters)
- FR-SEO-2: Unique meta descriptions (150-160 characters)
- FR-SEO-3: Relevant meta keywords
- FR-SEO-4: Open Graph tags
- FR-SEO-5: Twitter Card tags
- FR-SEO-10: Canonical URLs

## Implementation Status

### ✅ Completed Pages
1. `00_LanguagePage.jsx` - Language selection page
2. `01_EntryPage.jsx` - Entry/welcome page
3. `02_LoginPage.jsx` - Login page
4. `03_AuthPage.jsx` - Registration page
5. `04_OTPVerification.jsx` - OTP verification page

### 🔄 Remaining Pages (28 pages)

#### Onboarding Pages (6 pages)
- `05_OnboardingIndividuals.jsx` → useSEO('onboardingIndividuals')
- `06_OnboardingCompanies.jsx` → useSEO('onboardingCompanies')
- `15_OnboardingIlliterate.jsx` → useSEO('onboardingIndividuals')
- `16_OnboardingVisual.jsx` → useSEO('onboardingIndividuals')
- `17_OnboardingUltimate.jsx` → useSEO('onboardingIndividuals')

#### Main Feature Pages (8 pages)
- `07_ProfilePage.jsx` → useSEO('profile')
- `08_ApplyPage.jsx` → useSEO('apply')
- `09_JobPostingsPage.jsx` → useSEO('jobPostings')
- `10_PostJobPage.jsx` → useSEO('postJob')
- `11_CoursesPage.jsx` → useSEO('courses')
- `12_PostCoursePage.jsx` → useSEO('postCourse')
- `13_PolicyPage.jsx` → useSEO('policy')
- `14_SettingsPage.jsx` → useSEO('settings')

#### Interface Pages (7 pages)
- `19_InterfaceIndividuals.jsx` → useSEO('profile')
- `20_InterfaceCompanies.jsx` → useSEO('profile')
- `21_InterfaceIlliterate.jsx` → useSEO('profile')
- `22_InterfaceVisual.jsx` → useSEO('profile')
- `23_InterfaceUltimate.jsx` → useSEO('profile')
- `24_InterfaceShops.jsx` → useSEO('profile')
- `25_InterfaceWorkshops.jsx` → useSEO('profile')

#### Admin Pages (6 pages)
- `18_AdminDashboard.jsx` → useSEO('adminDashboard')
- `26_AdminSubDashboard.jsx` → useSEO('adminDashboard')
- `27_AdminPagesNavigator.jsx` → useSEO('adminDashboard')
- `28_AdminSystemControl.jsx` → useSEO('adminDashboard')
- `29_AdminDatabaseManager.jsx` → useSEO('adminDashboard')
- `30_AdminCodeEditor.jsx` → useSEO('adminDashboard')

#### Other Pages (2 pages)
- `NotificationsPage.jsx` → useSEO('notifications')
- `OAuthCallback.jsx` → useSEO('login')

## Implementation Steps

For each page, follow these three steps:

### Step 1: Add Imports
Add these two imports at the top of the file (after other imports):

```javascript
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';
```

### Step 2: Add useSEO Hook
Inside the component function, add the useSEO hook (use the appropriate page key from the list above):

```javascript
const seo = useSEO('pageKey', {});
```

### Step 3: Wrap Return Statement
Wrap the return statement with a React Fragment and add SEOHead:

**Before:**
```javascript
return (
  <main>
    {/* page content */}
  </main>
);
```

**After:**
```javascript
return (
  <>
    <SEOHead {...seo} />
    <main>
      {/* page content */}
    </main>
  </>
);
```

## Example: Complete Implementation

Here's a complete example for ProfilePage:

```javascript
// Before
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './07_ProfilePage.css';

export default function ProfilePage() {
  const { user, language } = useApp();
  
  return (
    <main className="profile-container">
      {/* content */}
    </main>
  );
}

// After
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './07_ProfilePage.css';
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

export default function ProfilePage() {
  const { user, language } = useApp();
  const seo = useSEO('profile', {});
  
  return (
    <>
      <SEOHead {...seo} />
      <main className="profile-container">
        {/* content */}
      </main>
    </>
  );
}
```

## SEO Metadata Configuration

All SEO metadata is centralized in `frontend/src/config/seoMetadata.js`. Each page has:
- **Title**: 50-60 characters, unique per page
- **Description**: 150-160 characters, unique per page
- **Keywords**: Relevant keywords for the page
- **Multi-language support**: Arabic (ar), English (en), French (fr)

## Testing

After implementation, verify:
1. ✅ Page title appears in browser tab
2. ✅ Meta description is present in page source
3. ✅ Open Graph tags are present
4. ✅ Twitter Card tags are present
5. ✅ Canonical URL is set
6. ✅ Title length is 50-60 characters
7. ✅ Description length is 150-160 characters

Use browser DevTools → Elements → `<head>` to inspect meta tags.

## Validation Tools

- **Lighthouse SEO Audit**: Target score 95+
- **Facebook Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Google Rich Results Test**: https://search.google.com/test/rich-results

## Benefits

- 📈 Improved search engine rankings
- 🔍 Better visibility in search results
- 📱 Enhanced social media sharing
- 🌐 Multi-language SEO support
- ⚡ Consistent SEO across all pages

## Notes

- SEOHead uses react-helmet-async for dynamic meta tag management
- Metadata automatically adapts to current language
- Console warnings appear if title/description length is not optimal
- All pages should have unique titles and descriptions

## Related Files

- `frontend/src/components/SEO/SEOHead.jsx` - SEOHead component
- `frontend/src/config/seoMetadata.js` - SEO metadata configuration
- `frontend/src/hooks/useSEO.js` - useSEO custom hook
- `.kiro/specs/general-platform-enhancements/design.md` - SEO design document
- `.kiro/specs/general-platform-enhancements/requirements.md` - SEO requirements

## Completion Checklist

- [x] Create SEOHead component
- [x] Create seoMetadata configuration
- [x] Create useSEO hook
- [x] Add SEOHead to LanguagePage
- [x] Add SEOHead to EntryPage
- [x] Add SEOHead to LoginPage
- [x] Add SEOHead to AuthPage
- [x] Add SEOHead to OTPVerification
- [ ] Add SEOHead to remaining 28 pages
- [ ] Test all pages with Lighthouse
- [ ] Validate Open Graph tags
- [ ] Validate Twitter Cards
- [ ] Run property-based tests

---

**Last Updated**: 2026-02-20
**Status**: In Progress (5/33 pages completed)
