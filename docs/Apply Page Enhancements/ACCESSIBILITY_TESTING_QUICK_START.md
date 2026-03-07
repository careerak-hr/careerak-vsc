# Accessibility Testing Quick Start Guide

## 5-Minute Setup

### 1. Install Tools (2 minutes)

```bash
# Browser extensions
# - axe DevTools (Chrome/Firefox)
# - WAVE (Chrome/Firefox)

# Screen reader (Windows)
# Download NVDA: https://www.nvaccess.org/download/

# Automated testing
npm install --save-dev jest-axe @axe-core/react
```

### 2. Run Automated Tests (1 minute)

```bash
# Lighthouse accessibility audit
lighthouse https://localhost:3000/apply --only-categories=accessibility

# Jest-axe tests
npm test -- --testPathPattern=accessibility
```

### 3. Quick Keyboard Test (2 minutes)

1. **Tab through the form**
   - Press `Tab` repeatedly
   - Verify you can reach all interactive elements
   - Check focus indicators are visible

2. **Test form submission**
   - Fill out form using only keyboard
   - Use `Enter` to submit
   - Verify errors are announced

3. **Test modal**
   - Open confirmation dialog
   - Press `Escape` to close
   - Verify focus returns

---

## Essential Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Navigate forward | `Tab` |
| Navigate backward | `Shift + Tab` |
| Activate button/link | `Enter` or `Space` |
| Close modal | `Escape` |
| Navigate radio buttons | `Arrow keys` |
| Navigate dropdown | `Arrow keys` |

---

## Quick Screen Reader Test (NVDA)

### Setup (30 seconds)
1. Install NVDA
2. Start NVDA: `Ctrl + Alt + N`
3. Open application in browser

### Test (2 minutes)
1. **Navigate to form**: `H` (jump to headings)
2. **Read form fields**: `F` (jump to form fields)
3. **Fill out field**: Type normally
4. **Trigger error**: Submit with invalid data
5. **Listen for announcement**: Error should be read aloud

### NVDA Shortcuts
| Action | Shortcut |
|--------|----------|
| Start/Stop NVDA | `Ctrl + Alt + N` |
| Read next item | `Down Arrow` |
| Read previous item | `Up Arrow` |
| Jump to heading | `H` |
| Jump to form field | `F` |
| Jump to button | `B` |
| Read all | `Insert + Down Arrow` |

---

## Quick Checklist

### Must-Have (Critical)
- [ ] All form fields have labels
- [ ] Error messages are announced
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works
- [ ] No keyboard traps

### Should-Have (Important)
- [ ] ARIA labels on custom controls
- [ ] Live regions for dynamic content
- [ ] Color contrast ≥ 4.5:1
- [ ] Touch targets ≥ 44x44px
- [ ] Zoom to 200% works

### Nice-to-Have (Enhancement)
- [ ] Skip links
- [ ] Keyboard shortcuts
- [ ] High contrast mode support
- [ ] Reduced motion support

---

## Common Quick Fixes

### 1. Missing Label (30 seconds)
```jsx
// Before
<input type="text" />

// After
<label htmlFor="name">Full Name</label>
<input type="text" id="name" />
```

### 2. Error Not Announced (1 minute)
```jsx
// Before
<div className="error">{error}</div>

// After
<div role="alert" aria-live="assertive" className="error">
  {error}
</div>
```

### 3. Focus Not Visible (1 minute)
```css
/* Add to CSS */
*:focus-visible {
  outline: 2px solid #D48161;
  outline-offset: 2px;
}
```

### 4. Button Not Keyboard Accessible (30 seconds)
```jsx
// Before
<div onClick={handleClick}>Submit</div>

// After
<button onClick={handleClick}>Submit</button>
```

---

## Quick Test Script

Run this in 5 minutes to catch 80% of issues:

```bash
#!/bin/bash

echo "🔍 Running accessibility tests..."

# 1. Automated scan
echo "1️⃣ Running axe scan..."
npm run test:a11y

# 2. Lighthouse
echo "2️⃣ Running Lighthouse..."
lighthouse http://localhost:3000/apply --only-categories=accessibility --quiet

# 3. Check for common issues
echo "3️⃣ Checking for common issues..."
grep -r "onClick" src/ | grep -v "button\|a href" && echo "⚠️  Found onClick on non-button elements"
grep -r "<input" src/ | grep -v "aria-label\|id=" && echo "⚠️  Found inputs without labels"

echo "✅ Quick tests complete!"
```

---

## Priority Order

Test in this order for maximum impact:

1. **Keyboard navigation** (5 min) - Catches 40% of issues
2. **Automated tools** (5 min) - Catches 30% of issues
3. **Screen reader** (10 min) - Catches 20% of issues
4. **Manual review** (10 min) - Catches remaining 10%

---

## When to Test

- ✅ **Before commit**: Run automated tests
- ✅ **Before PR**: Quick keyboard test
- ✅ **Before release**: Full screen reader test
- ✅ **After major changes**: Complete accessibility audit

---

## Getting Help

### Quick References
- **WCAG Quick Ref**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Patterns**: https://www.w3.org/WAI/ARIA/apg/patterns/
- **WebAIM Checklist**: https://webaim.org/standards/wcag/checklist

### Common Questions

**Q: Do I need to test with multiple screen readers?**  
A: Minimum NVDA (Windows) + VoiceOver (Mac). JAWS is optional.

**Q: What's the minimum accessibility score?**  
A: Lighthouse score ≥ 95, zero critical axe violations.

**Q: How often should I test?**  
A: Automated tests on every commit, manual tests before release.

**Q: What if I find an issue?**  
A: Fix critical issues immediately, document others for backlog.

---

## Next Steps

1. ✅ Run automated tests
2. ✅ Fix critical issues
3. ✅ Test with keyboard
4. ✅ Test with screen reader
5. ✅ Document results
6. ✅ Update checklist in design.md

**Full Guide**: See `ACCESSIBILITY_TESTING_GUIDE.md` for comprehensive testing procedures.

---

**Last Updated**: 2026-03-04  
**Estimated Time**: 30 minutes for complete testing  
**Priority**: High (WCAG 2.1 Level AA compliance required)
