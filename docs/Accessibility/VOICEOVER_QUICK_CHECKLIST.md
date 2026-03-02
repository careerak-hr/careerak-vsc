# VoiceOver Testing Quick Checklist

## Quick Start
1. **macOS**: Press `Cmd + F5` to enable VoiceOver
2. **iOS**: Triple-click home button (if configured)
3. **Browser**: Use Safari for best compatibility

---

## Essential Keyboard Shortcuts (macOS)

| Action | Shortcut |
|--------|----------|
| Toggle VoiceOver | `Cmd + F5` |
| Next item | `VO + Right Arrow` |
| Previous item | `VO + Left Arrow` |
| Activate item | `VO + Space` |
| Read all | `VO + A` |
| Open rotor | `VO + U` |
| Stop reading | `Control` |

**Note**: `VO` = `Control + Option`

---

## 10-Minute Test Procedure

### 1. Landmark Navigation (2 min)
- [ ] Press `VO + U` → Select "Landmarks"
- [ ] Verify: header, nav, main, footer present
- [ ] Navigate between landmarks
- [ ] Confirm each is announced correctly

### 2. Heading Structure (2 min)
- [ ] Press `VO + U` → Select "Headings"
- [ ] Verify H1 is present and unique
- [ ] Check hierarchy (no skipped levels)
- [ ] Navigate through all headings

### 3. Interactive Elements (2 min)
- [ ] Tab through all buttons
- [ ] Verify each button has clear label
- [ ] Test all links
- [ ] Confirm link purpose is clear

### 4. Forms (2 min)
- [ ] Navigate to a form
- [ ] Verify labels are announced
- [ ] Check required fields are indicated
- [ ] Test error announcements

### 5. Dynamic Content (2 min)
- [ ] Trigger a loading state
- [ ] Verify loading is announced
- [ ] Open a modal
- [ ] Confirm focus trap works
- [ ] Test live region updates

---

## Critical Checks

### ✅ Must Have
- [ ] All images have alt text
- [ ] All buttons have labels
- [ ] All forms have labels
- [ ] Headings are hierarchical
- [ ] Landmarks are present
- [ ] Focus is visible
- [ ] Modals trap focus
- [ ] Errors are announced

### ⚠️ Should Have
- [ ] Skip links work
- [ ] Live regions update
- [ ] Loading states announced
- [ ] Success messages announced
- [ ] Keyboard shortcuts work
- [ ] Tables have structure
- [ ] Lists are semantic
- [ ] Breadcrumbs are accessible

---

## Common Issues to Check

| Issue | How to Test | Expected Result |
|-------|-------------|-----------------|
| Missing alt text | Navigate to images | "Image, [description]" |
| Unlabeled buttons | Tab to buttons | "Button, [purpose]" |
| Broken forms | Tab through form | "Label, edit text" |
| No landmarks | Open rotor → Landmarks | At least 3 landmarks |
| Bad headings | Open rotor → Headings | Logical hierarchy |
| Focus trap | Open modal, press Tab | Focus stays in modal |
| No announcements | Trigger error | "Alert, [message]" |
| Unclear links | Navigate links | Descriptive text |

---

## Quick Test Pages

### Priority 1 (Must Test)
1. **Home Page** - Landmarks, headings, navigation
2. **Login Page** - Form labels, error announcements
3. **Job Listings** - List structure, filters
4. **Profile Page** - Form editing, image upload

### Priority 2 (Should Test)
5. **Admin Dashboard** - Tables, tabs, actions
6. **Notifications** - Live regions, updates
7. **Settings** - Toggles, dropdowns, checkboxes
8. **Modals** - Focus trap, escape key

---

## Pass/Fail Criteria

### ✅ PASS if:
- All landmarks are announced
- Headings are hierarchical
- All buttons have labels
- All images have alt text
- Forms have associated labels
- Modals trap focus
- Errors are announced
- Loading states are announced

### ❌ FAIL if:
- Missing landmarks
- Skipped heading levels
- Unlabeled buttons
- Images without alt text
- Forms without labels
- Focus escapes modals
- Silent errors
- No loading announcements

---

## Quick Fixes

### Fix 1: Add Alt Text
```jsx
// ❌ Bad
<img src="profile.jpg" />

// ✅ Good
<img src="profile.jpg" alt="User profile picture" />
```

### Fix 2: Label Buttons
```jsx
// ❌ Bad
<button><Icon /></button>

// ✅ Good
<button aria-label="Close dialog"><Icon /></button>
```

### Fix 3: Associate Labels
```jsx
// ❌ Bad
<label>Email</label>
<input type="email" />

// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Fix 4: Add Live Regions
```jsx
// ❌ Bad
<div>{errorMessage}</div>

// ✅ Good
<div role="alert" aria-live="assertive">{errorMessage}</div>
```

---

## Test Report Template

```
Date: _______________
Tester: _______________
Platform: macOS / iOS
Browser: Safari

✅ Landmarks: Pass / Fail
✅ Headings: Pass / Fail
✅ Buttons: Pass / Fail
✅ Forms: Pass / Fail
✅ Images: Pass / Fail
✅ Modals: Pass / Fail
✅ Errors: Pass / Fail
✅ Loading: Pass / Fail

Issues Found: _______________
Overall: Pass / Fail
```

---

## Resources

- **Full Guide**: `docs/VOICEOVER_TESTING_GUIDE.md`
- **Apple Docs**: https://support.apple.com/guide/voiceover/
- **WebAIM**: https://webaim.org/articles/voiceover/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Last Updated**: 2026-02-22
