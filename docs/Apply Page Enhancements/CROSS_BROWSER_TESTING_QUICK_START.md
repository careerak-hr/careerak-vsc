# Cross-Browser Testing Quick Start Guide

## 5-Minute Testing Guide

### Prerequisites
- Chrome, Firefox, and Safari installed
- Application running locally or on staging
- Test user account with profile data

### Quick Test Steps

#### 1. Chrome Testing (2 minutes)
```bash
# Open Chrome
chrome http://localhost:3000/apply/[job-id]

# Test checklist:
✓ Form loads with auto-filled data
✓ Navigate through all 5 steps
✓ Upload a file (drag-and-drop)
✓ Save draft (wait 3 seconds)
✓ Preview and submit
```

#### 2. Firefox Testing (2 minutes)
```bash
# Open Firefox
firefox http://localhost:3000/apply/[job-id]

# Test checklist:
✓ Form loads with auto-filled data
✓ Navigate through all 5 steps
✓ Upload a file (use file dialog)
✓ Save draft (wait 3 seconds)
✓ Preview and submit
```

#### 3. Safari Testing (2 minutes)
```bash
# Open Safari
open -a Safari http://localhost:3000/apply/[job-id]

# Test checklist:
✓ Form loads with auto-filled data
✓ Navigate through all 5 steps
✓ Upload a file (use file dialog)
✓ Save draft (wait 3 seconds)
✓ Preview and submit
```

### Mobile Testing (iOS Safari)

```bash
# On iPhone/iPad:
1. Open Safari
2. Navigate to application URL
3. Test touch interactions
4. Test file upload from Photos
5. Test form submission
```

### Common Issues & Quick Fixes

#### Safari: File Upload Not Working
```html
<!-- Add to file input -->
<input type="file" accept=".pdf,.doc,.docx,.jpg,.png" />
```

#### Firefox: Drag-Drop Styling
```css
/* Add to CSS */
@-moz-document url-prefix() {
  .file-upload-zone {
    border-style: dashed !important;
  }
}
```

#### Safari: LocalStorage Error
```javascript
// Wrap in try-catch
try {
  localStorage.setItem('draft', data);
} catch (e) {
  console.warn('Storage not available');
}
```

### Automated Testing

```bash
# Install dependencies
npm install --save-dev @playwright/test

# Run cross-browser tests
npm run test:browsers

# Run specific browser
npm run test:chrome
npm run test:firefox
npm run test:safari
```

### Test Results

| Browser | Status | Issues |
|---------|--------|--------|
| Chrome | ✅ Pass | None |
| Firefox | ✅ Pass | Minor styling |
| Safari | ⚠️ Pass | Date input, file upload |

### Next Steps

1. ✅ Review full testing report: `CROSS_BROWSER_TESTING.md`
2. ✅ Apply recommended fixes
3. ✅ Test on mobile devices
4. ✅ Deploy to staging

---

**Quick Reference**: See `CROSS_BROWSER_TESTING.md` for detailed results and fixes.
