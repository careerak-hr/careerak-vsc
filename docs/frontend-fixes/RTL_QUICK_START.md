# RTL Layout - Quick Start Guide

**5-Minute Setup Guide for Arabic Language Support**

---

## Step 1: Import RTL Styles (30 seconds)

```javascript
// In your main CSS file (e.g., index.css or App.css)
@import './styles/applyPageRTL.css';
```

---

## Step 2: Set Direction Attribute (1 minute)

```jsx
import React, { useState } from 'react';

function App() {
  const [language, setLanguage] = useState('ar'); // 'ar' for Arabic, 'en' for English
  const isRTL = language === 'ar';

  return (
    <div 
      dir={isRTL ? 'rtl' : 'ltr'} 
      lang={language}
      style={{ 
        fontFamily: isRTL ? 'Amiri, Cairo, serif' : 'Cormorant Garamond, serif' 
      }}
    >
      {/* Your app content */}
    </div>
  );
}
```

---

## Step 3: Test RTL Layout (2 minutes)

### Option A: Run Automated Tests
```bash
cd backend
npm test apply-page-rtl-simple.test.js
```

**Expected**: 47/47 tests pass ✅

### Option B: View Interactive Demo
```bash
cd frontend
npm start
# Navigate to /examples/rtl-layout
```

---

## Step 4: Verify Components (1.5 minutes)

### Checklist:
- [ ] Text aligns to right
- [ ] Buttons reversed (Next on left, Previous on right)
- [ ] Progress indicator flows right to left
- [ ] Icons mirrored correctly
- [ ] Forms work correctly

---

## Common Patterns

### Button Group
```jsx
<div className="button-group">
  <button className="btn-previous">السابق</button>
  <button className="btn-next">التالي</button>
</div>
```

### Form Field
```jsx
<div>
  <label className="form-field-label">الاسم الكامل</label>
  <input 
    type="text" 
    className="form-field"
    placeholder="أدخل اسمك الكامل"
  />
</div>
```

### Progress Indicator
```jsx
<div className="progress-indicator">
  {[1, 2, 3, 4, 5].map(step => (
    <div key={step} className="progress-step">{step}</div>
  ))}
</div>
```

---

## Language Toggle

```jsx
function LanguageToggle() {
  const [language, setLanguage] = useState('ar');
  
  return (
    <button onClick={() => setLanguage(prev => prev === 'ar' ? 'en' : 'ar')}>
      {language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
}
```

---

## Troubleshooting

### Issue: Text not aligning right
**Fix**: Ensure `dir="rtl"` is set on parent element

### Issue: Buttons not reversed
**Fix**: Add `className="button-group"` to button container

### Issue: Font not loading
**Fix**: Import fonts in your CSS:
```css
@import url('https://fonts.googleapis.com/css2?family=Amiri&family=Cairo&display=swap');
```

---

## That's It! 🎉

Your Apply Page now supports RTL layout for Arabic language.

**Next**: Test on real devices and get user feedback.

---

## Need More Help?

- **Full Documentation**: `RTL_LAYOUT_TESTING.md`
- **Test Results**: `RTL_TESTING_SUMMARY.md`
- **Interactive Demo**: `frontend/src/examples/RTLLayoutExample.jsx`
- **All Tests**: `backend/tests/apply-page-rtl-simple.test.js`
