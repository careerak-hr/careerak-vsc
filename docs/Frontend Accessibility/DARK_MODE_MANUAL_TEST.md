# Dark Mode Manual Testing Guide

**Date**: 2026-02-22  
**Purpose**: Manual verification that all UI elements support dark mode

## Prerequisites

1. Start the development server: `npm run dev`
2. Open the application in a browser
3. Have browser DevTools open (F12)

## Test Procedure

### 1. Theme Toggle Verification

#### Test 1.1: Navbar Toggle
1. Navigate to any page in the application
2. Look for the theme toggle button in the Navbar (☀️/🌙/🌓 icon)
3. Click the toggle button
4. **Expected**: Theme should cycle through Light → Dark → System → Light
5. **Verify**: Icon changes to reflect current mode
6. **Verify**: All UI elements transition smoothly (300ms)

#### Test 1.2: Settings Panel Toggle
1. Click the settings button (⚙️) in the Navbar
2. Settings panel should open
3. Look for the "Theme" option
4. Click the theme button
5. **Expected**: Theme should toggle
6. **Verify**: Theme label updates (Light/Dark/System)
7. **Verify**: Icon changes appropriately

### 2. Color Verification

#### Test 2.1: Light Mode Colors
1. Set theme to Light mode
2. **Verify** the following colors:
   - Background: #E3DAD1 (بيج)
   - Text: #304B60 (كحلي)
   - Accent: #D48161 (نحاسي)
   - Input borders: #D4816180 (CRITICAL - must be this exact color)

#### Test 2.2: Dark Mode Colors
1. Set theme to Dark mode
2. **Verify** the following colors:
   - Background: #1A2332 (كحلي غامق)
   - Text: #E3DAD1 (بيج)
   - Accent: #E09A7A (نحاسي أفتح)
   - Input borders: #D4816180 (CRITICAL - must remain the same)

### 3. Component Verification

#### Test 3.1: Navigation Components
- [ ] Navbar background changes
- [ ] Navbar text color changes
- [ ] Footer background changes
- [ ] Footer icons remain visible
- [ ] Settings panel background changes
- [ ] Settings panel text color changes

#### Test 3.2: Page Components
Test on the following pages:
- [ ] Language Page (/)
- [ ] Entry Page (/entry)
- [ ] Login Page (/login)
- [ ] Auth Page (/auth)
- [ ] Profile Page (/profile)
- [ ] Job Postings Page (/job-postings)
- [ ] Courses Page (/courses)
- [ ] Settings Page (/settings)
- [ ] Admin Dashboard (/admin)
- [ ] 404 Page (any invalid URL)

For each page, verify:
- Background color changes appropriately
- Text remains readable
- Cards/containers change color
- Buttons remain visible and styled correctly

#### Test 3.3: Form Elements (CRITICAL)
1. Navigate to Login Page or Auth Page
2. Inspect input fields using DevTools
3. **CRITICAL VERIFICATION**:
   - Input border color MUST be #D4816180 in BOTH light and dark modes
   - Border color should NEVER change on focus, hover, or active states
   - Background color should change (light: #E8DFD6, dark: #243447)
   - Text color should change (light: #304B60, dark: #E3DAD1)

#### Test 3.4: Modal Components
1. Trigger any modal (e.g., logout confirmation)
2. **Verify**:
   - Modal background changes
   - Modal border changes
   - Modal text remains readable
   - Buttons remain visible
   - Backdrop opacity is appropriate

#### Test 3.5: Cards and Lists
1. Navigate to Job Postings or Courses page
2. **Verify**:
   - Card backgrounds change
   - Card borders change
   - Card text remains readable
   - Hover states work correctly
   - Card shadows are visible

### 4. Transition Verification

#### Test 4.1: Smooth Transitions
1. Toggle dark mode
2. **Verify**:
   - All color changes happen smoothly
   - Transition duration is approximately 300ms
   - No jarring or instant color changes
   - No flickering or flashing

#### Test 4.2: No Layout Shifts
1. Toggle dark mode multiple times
2. **Verify**:
   - No elements move or resize
   - No content reflows
   - Scrollbar position remains the same
   - No Cumulative Layout Shift (CLS)

### 5. Persistence Verification

#### Test 5.1: localStorage Persistence
1. Set theme to Dark mode
2. Open browser DevTools → Application → Local Storage
3. **Verify**: Key `careerak-theme` exists with value `dark`
4. Refresh the page
5. **Verify**: Theme remains Dark mode
6. Set theme to Light mode
7. **Verify**: localStorage updates to `light`

#### Test 5.2: System Preference
1. Set theme to System mode
2. Change your OS dark mode setting
3. **Verify**: Application theme follows OS setting
4. Toggle OS dark mode on/off
5. **Verify**: Application updates automatically

### 6. Accessibility Verification

#### Test 6.1: Keyboard Navigation
1. Use Tab key to navigate to theme toggle
2. Press Enter or Space to toggle theme
3. **Verify**: Theme changes
4. **Verify**: Focus indicator is visible

#### Test 6.2: Screen Reader
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate to theme toggle
3. **Verify**: Screen reader announces current theme
4. Toggle theme
5. **Verify**: Screen reader announces new theme

#### Test 6.3: Focus Indicators
1. Toggle dark mode
2. Tab through interactive elements
3. **Verify**: Focus indicators remain visible in both modes
4. **Verify**: Focus outline color is appropriate (#D48161)

### 7. Image and Icon Verification

#### Test 7.1: Images Remain Visible
1. Toggle dark mode
2. **Verify**: All images remain visible
3. **Verify**: No images become too dark or invisible
4. **Verify**: Image borders/shadows are appropriate

#### Test 7.2: Icons Remain Visible
1. Toggle dark mode
2. **Verify**: All icons (emoji and SVG) remain visible
3. **Verify**: Icon colors are appropriate
4. **Verify**: Icon contrast is sufficient

### 8. Status Messages Verification

#### Test 8.1: Error Messages
1. Trigger an error (e.g., invalid login)
2. Toggle dark mode
3. **Verify**: Error message remains visible
4. **Verify**: Error color is appropriate
5. **Verify**: Error background is visible

#### Test 8.2: Success Messages
1. Trigger a success message
2. Toggle dark mode
3. **Verify**: Success message remains visible
4. **Verify**: Success color is appropriate

### 9. Special Elements Verification

#### Test 9.1: Shadows
1. Toggle dark mode
2. **Verify**: Card shadows are visible in both modes
3. **Verify**: Shadow intensity is appropriate
4. **Verify**: Shadows don't look too harsh or too subtle

#### Test 9.2: Scrollbars
1. Navigate to a page with scrollable content
2. Toggle dark mode
3. **Verify**: Scrollbar track color changes
4. **Verify**: Scrollbar thumb color changes
5. **Verify**: Scrollbar remains visible and usable

### 10. Browser Compatibility

Test dark mode in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile
- [ ] Safari iOS

For each browser, verify:
- Theme toggle works
- Colors are correct
- Transitions are smooth
- localStorage persists
- System preference detection works

## Critical Verification Checklist

### MUST PASS (Critical Requirements)

- [ ] Input borders remain #D4816180 in BOTH modes (NEVER changes)
- [ ] All UI elements support dark mode
- [ ] Transitions are smooth (300ms)
- [ ] Theme persists in localStorage
- [ ] System preference detection works
- [ ] No layout shifts occur
- [ ] All text remains readable
- [ ] All interactive elements remain visible

### SHOULD PASS (Important Requirements)

- [ ] Images remain visible
- [ ] Icons remain visible
- [ ] Shadows are appropriate
- [ ] Scrollbars are visible
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works
- [ ] Screen reader support works

## DevTools Verification

### Check CSS Variables
1. Open DevTools → Elements
2. Select `<html>` or `<body>` element
3. Check Computed styles
4. **Verify** CSS variables are defined:
   - `--bg-primary`
   - `--text-primary`
   - `--accent-primary`
   - `--input-border`
   - etc.

### Check Dark Class
1. Toggle dark mode
2. Open DevTools → Elements
3. Check `<html>` element
4. **Verify**: `class="dark"` is added/removed

### Check Transitions
1. Toggle dark mode
2. Open DevTools → Elements → Computed
3. Select any element
4. **Verify**: `transition` property includes:
   - `background-color 300ms ease-in-out`
   - `color 300ms ease-in-out`
   - `border-color 300ms ease-in-out`

## Console Verification

Open browser console and run:

```javascript
// Check theme context
console.log('Theme:', localStorage.getItem('careerak-theme'));

// Check dark class
console.log('Dark mode active:', document.documentElement.classList.contains('dark'));

// Check CSS variables
const styles = getComputedStyle(document.documentElement);
console.log('Background:', styles.getPropertyValue('--bg-primary'));
console.log('Text:', styles.getPropertyValue('--text-primary'));
console.log('Input border:', styles.getPropertyValue('--input-border'));

// Verify input border color (CRITICAL)
const input = document.querySelector('input');
if (input) {
  const inputStyles = getComputedStyle(input);
  console.log('Input border color:', inputStyles.borderColor);
  // Should be: rgba(212, 129, 97, 0.5) or rgb(212, 129, 97)
}
```

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
OS: ___________

✅ PASSED / ❌ FAILED

1. Theme Toggle: ___
2. Color Verification: ___
3. Component Verification: ___
4. Transition Verification: ___
5. Persistence Verification: ___
6. Accessibility Verification: ___
7. Image/Icon Verification: ___
8. Status Messages: ___
9. Special Elements: ___
10. Browser Compatibility: ___

CRITICAL: Input borders remain #D4816180: ___

Notes:
_________________________________
_________________________________
_________________________________
```

## Troubleshooting

### Issue: Dark mode doesn't toggle
- Check if ThemeProvider is wrapping the app
- Check browser console for errors
- Verify localStorage is enabled

### Issue: Colors are wrong
- Check CSS files are imported in index.css
- Verify CSS variables are defined
- Check for conflicting styles

### Issue: Transitions are not smooth
- Check if `transition` property is applied
- Verify duration is 300ms
- Check for `transition: none` overrides

### Issue: Input borders change color
- **CRITICAL**: This is a bug and must be fixed
- Check formsDarkMode.css
- Verify input border color is #D4816180
- Check for conflicting styles

## Conclusion

After completing all tests, if all critical requirements pass, the dark mode implementation is verified and complete.

**Status**: ___________  
**Verified by**: ___________  
**Date**: ___________
