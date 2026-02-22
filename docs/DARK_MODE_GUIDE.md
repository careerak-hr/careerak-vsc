# Dark Mode Implementation Guide

## Overview

Careerak's dark mode feature provides a seamless theme switching experience with support for light mode, dark mode, and automatic system preference detection. The implementation follows WCAG 2.1 Level AA accessibility standards and integrates with the existing design system.

**Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: 2026-02-22

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Color System](#color-system)
4. [Usage Guide](#usage-guide)
5. [API Reference](#api-reference)
6. [Integration](#integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Features

### Core Features
- ✅ **Three Theme Modes**: Light, Dark, and System (auto-detect)
- ✅ **Smooth Transitions**: 300ms ease-in-out transitions for all color changes
- ✅ **Persistent Preferences**: Saved in localStorage and synced with backend
- ✅ **System Preference Detection**: Automatically detects OS dark mode setting
- ✅ **Backend Synchronization**: Theme preference synced across devices for authenticated users
- ✅ **Accessibility Compliant**: WCAG 2.1 Level AA color contrast ratios
- ✅ **CSS Variables**: Centralized color management with CSS custom properties
- ✅ **Constant Input Borders**: Input borders remain #D4816180 in both modes (design requirement)

### Technical Features
- Real-time system preference monitoring
- Automatic class application to document root
- Legacy browser support (addListener fallback)
- SSR-safe implementation
- No layout shifts during theme changes
- GPU-accelerated transitions

---

## Architecture

### Component Structure

```
frontend/src/
├── context/
│   └── ThemeContext.jsx              # Theme state management
├── styles/
│   └── darkMode.css                  # CSS variables and transitions
└── App.jsx                           # ThemeProvider wrapper
```

### Data Flow

```
User Action → toggleTheme() → Update State → localStorage → Backend API
                                    ↓
                            Apply .dark class → CSS Variables → UI Update
                                    ↓
                            System Preference Monitor → Auto Update
```

---

## Color System

### Light Mode (Default)

**Background Colors**:
- Primary: `#E3DAD1` (بيج ملكي - Main background)
- Secondary: `#E8DFD6` (بيج أفتح - Secondary background)
- Tertiary: `#F0EBE5` (بيج أفتح جداً - Tertiary background)
- Hover: `#DDD4CB` (بيج أغمق - Hover state)

**Text Colors**:
- Primary: `#304B60` (كحلي وقور - Primary text)
- Secondary: `#3D5A73` (كحلي أفتح - Secondary text, 4.5:1 contrast)
- Muted: `#3D5A73` (كحلي - Muted text, 4.5:1 contrast)
- Inverse: `#FFFFFF` (أبيض - Text on dark backgrounds)

**Accent Colors**:
- Primary: `#A04D2F` (نحاسي أغمق - 4.23:1 contrast)
- Secondary: `#B85A3A` (نحاسي)
- Hover: `#8A3F22` (نحاسي أغمق)

**Border Colors**:
- Primary: `#D4816180` (نحاسي باهت - **CONSTANT**)
- Secondary: `#304B6040` (كحلي شفاف)
- Light: `#E3DAD180` (بيج شفاف)

### Dark Mode

**Background Colors**:
- Primary: `#1A2332` (كحلي غامق جداً - Main background)
- Secondary: `#243447` (كحلي غامق - Secondary background)
- Tertiary: `#2E3F54` (كحلي متوسط - Tertiary background)
- Hover: `#384A61` (كحلي أفتح - Hover state)

**Text Colors**:
- Primary: `#E3DAD1` (بيج - Primary text)
- Secondary: `#D4CCC3` (بيج أغمق - Secondary text)
- Tertiary: `#C5BDB4` (بيج أغمق جداً - Tertiary text)
- Muted: `#A39A91` (بيج باهت - Muted text)
- Inverse: `#1A2332` (كحلي غامق - Text on light backgrounds)

**Accent Colors**:
- Primary: `#E09A7A` (نحاسي أفتح - Improved contrast)
- Secondary: `#EAA88A` (نحاسي أفتح جداً)
- Hover: `#D48161` (نحاسي)

**Border Colors**:
- Primary: `#D4816180` (نحاسي باهت - **CONSTANT**)
- Secondary: `#E3DAD140` (بيج شفاف)
- Light: `#304B6080` (كحلي شفاف)

### Critical Design Rule

**⚠️ IMPORTANT**: Input borders MUST remain `#D4816180` (نحاسي باهت) in both light and dark modes. This is a core design requirement and must never be changed.

```css
/* ✅ CORRECT - Border color is constant */
input {
  border: 2px solid #D4816180;
}

input:focus {
  border: 2px solid #D4816180; /* Same color on focus */
}

/* ❌ WRONG - Never change border color */
input:focus {
  border: 2px solid #304B60; /* Don't do this! */
}
```

### Accessibility Guidelines

**Accent Color Usage**:
- `--accent-primary` (#A04D2F in light mode) has 4.23:1 contrast ratio
- ✅ **USE FOR**: Buttons, borders, icons, UI components (meets 3:1 for UI)
- ✅ **USE FOR**: Large text ≥18pt or ≥14pt bold (meets 3:1 for large text)
- ❌ **DO NOT USE FOR**: Normal body text <18pt (requires 4.5:1)
- For normal text, use `--text-primary` or `--text-secondary` instead

---

## Usage Guide

### Basic Setup

The ThemeProvider is already integrated in `App.jsx`. No additional setup is required.

```jsx
// App.jsx (already configured)
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### Using the Theme Hook

```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { 
    isDark,           // Boolean: true if dark mode is active
    themeMode,        // String: 'light' | 'dark' | 'system'
    systemPreference, // Boolean: OS dark mode preference
    toggleTheme,      // Function: Cycle through themes
    setTheme          // Function: Set specific theme
  } = useTheme();

  return (
    <div>
      <p>Current mode: {themeMode}</p>
      <p>Dark mode active: {isDark ? 'Yes' : 'No'}</p>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Theme Toggle Button Example

```jsx
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

function ThemeToggle() {
  const { themeMode, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'system':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-secondary hover:bg-hover transition-colors"
      aria-label="Toggle theme"
    >
      {getIcon()}
    </button>
  );
}
```

### Using CSS Variables

```jsx
// In your components
function Card() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-secondary)'
    }}>
      Card content
    </div>
  );
}

// Or with Tailwind classes
function Card() {
  return (
    <div className="bg-secondary text-primary border border-secondary">
      Card content
    </div>
  );
}
```

### Programmatic Theme Setting

```jsx
import { useTheme } from '../context/ThemeContext';

function SettingsPage() {
  const { setTheme } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
      <button onClick={() => setTheme('system')}>System Preference</button>
    </div>
  );
}
```

---

## API Reference

### ThemeContext

#### State Properties

**`isDark`** (boolean)
- Current theme state
- `true` if dark mode is active, `false` for light mode
- Automatically calculated based on `themeMode` and `systemPreference`

**`themeMode`** (string)
- Current theme mode: `'light'` | `'dark'` | `'system'`
- Persisted in localStorage as `'careerak-theme'`
- Synced with backend for authenticated users

**`systemPreference`** (boolean)
- OS-level dark mode preference
- Detected using `window.matchMedia('(prefers-color-scheme: dark)')`
- Updates automatically when system preference changes

**`isAuthenticated`** (boolean)
- Whether user is currently authenticated
- Used for backend synchronization

#### Methods

**`toggleTheme()`**
- Cycles through theme modes: light → dark → system → light
- Persists to localStorage
- Syncs with backend if authenticated
- Returns: void

```jsx
const { toggleTheme } = useTheme();
toggleTheme(); // Switches to next theme mode
```

**`setTheme(mode)`**
- Sets theme to a specific mode
- Parameters:
  - `mode` (string): `'light'` | `'dark'` | `'system'`
- Persists to localStorage
- Syncs with backend if authenticated
- Returns: void

```jsx
const { setTheme } = useTheme();
setTheme('dark'); // Switches to dark mode
```

**`setIsAuthenticated(value)`**
- Updates authentication state
- Parameters:
  - `value` (boolean): Authentication status
- Triggers backend sync if becoming authenticated
- Returns: void

```jsx
const { setIsAuthenticated } = useTheme();
setIsAuthenticated(true); // Mark user as authenticated
```

### CSS Variables

All CSS variables are defined in `frontend/src/styles/darkMode.css` and automatically update when theme changes.

#### Background Variables
- `--bg-primary`: Main background color
- `--bg-secondary`: Secondary background color
- `--bg-tertiary`: Tertiary background color
- `--bg-hover`: Hover state background

#### Text Variables
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color
- `--text-tertiary`: Tertiary text color
- `--text-muted`: Muted text color
- `--text-inverse`: Inverse text color (for contrasting backgrounds)

#### Accent Variables
- `--accent-primary`: Primary accent color
- `--accent-secondary`: Secondary accent color
- `--accent-hover`: Hover state accent color

#### Border Variables
- `--border-primary`: Primary border color (**CONSTANT**: #D4816180)
- `--border-secondary`: Secondary border color
- `--border-light`: Light border color

#### Input Variables
- `--input-border`: Input border color (**CONSTANT**: #D4816180)
- `--input-bg`: Input background color
- `--input-focus-bg`: Input focus background color
- `--input-text`: Input text color

#### Shadow Variables
- `--shadow-sm`: Small shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow

#### Modal Variables
- `--modal-bg`: Modal background color
- `--modal-border`: Modal border color
- `--modal-overlay`: Modal overlay color

#### Status Variables
- `--success`, `--success-light`: Success colors
- `--warning`, `--warning-light`: Warning colors
- `--error`, `--error-light`: Error colors
- `--info`, `--info-light`: Info colors

---

## Integration

### Backend API Integration

The theme preference is automatically synced with the backend for authenticated users.

#### API Endpoints

**GET `/api/users/preferences`**
- Retrieves user preferences including theme
- Response:
```json
{
  "preferences": {
    "theme": "dark",
    "language": "ar"
  }
}
```

**PUT `/api/users/preferences`**
- Updates user preferences
- Request body:
```json
{
  "theme": "dark"
}
```

#### Synchronization Flow

1. **On Mount**: If authenticated, fetch theme from backend
2. **On Theme Change**: If authenticated, update backend
3. **On Login**: Fetch theme from backend and apply
4. **On Logout**: Keep local theme, stop syncing

### localStorage Integration

Theme preference is stored in localStorage with key `'careerak-theme'`.

```javascript
// Read theme
const theme = localStorage.getItem('careerak-theme'); // 'light' | 'dark' | 'system'

// Write theme (handled automatically by ThemeContext)
localStorage.setItem('careerak-theme', 'dark');
```

### System Preference Detection

The implementation uses `matchMedia` to detect and monitor system dark mode preference:

```javascript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Check current preference
const isDarkMode = mediaQuery.matches;

// Listen for changes
mediaQuery.addEventListener('change', (e) => {
  console.log('System preference changed:', e.matches);
});
```

---

## Testing

### Property-Based Tests

Located in `frontend/src/context/__tests__/ThemeContext.property.test.jsx`

**Test Coverage**:
- ✅ Theme toggle idempotence (100 iterations)
- ✅ Theme persistence (100 iterations)
- ✅ System preference detection (100 iterations)
- ✅ Color consistency (100 iterations)
- ✅ Input border invariant (100 iterations)

### Unit Tests

Located in `frontend/src/context/__tests__/ThemeContext.unit.test.jsx`

**Test Coverage**:
- ✅ Theme toggle functionality
- ✅ Theme mode setting
- ✅ localStorage persistence
- ✅ System preference detection
- ✅ Backend synchronization
- ✅ Class application to document

### Running Tests

```bash
cd frontend

# Run all theme tests
npm test -- ThemeContext

# Run property-based tests only
npm test -- ThemeContext.property.test.jsx --run

# Run unit tests only
npm test -- ThemeContext.unit.test.jsx --run
```

### Manual Testing Checklist

- [ ] Toggle theme button cycles through all modes
- [ ] Theme persists after page reload
- [ ] System preference is detected correctly
- [ ] Theme syncs with backend for authenticated users
- [ ] All UI elements update colors smoothly
- [ ] Input borders remain constant (#D4816180)
- [ ] Transitions are smooth (300ms)
- [ ] No layout shifts during theme change
- [ ] Works in all supported browsers
- [ ] Respects prefers-reduced-motion

---

## Troubleshooting

### Theme Not Persisting

**Problem**: Theme resets to default after page reload

**Solutions**:
1. Check localStorage is enabled in browser
2. Verify `'careerak-theme'` key exists in localStorage
3. Check browser console for errors
4. Clear localStorage and try again

```javascript
// Debug localStorage
console.log(localStorage.getItem('careerak-theme'));

// Clear and reset
localStorage.removeItem('careerak-theme');
window.location.reload();
```

### System Preference Not Detected

**Problem**: System theme mode doesn't work

**Solutions**:
1. Verify browser supports `matchMedia`
2. Check OS dark mode is enabled
3. Try toggling OS dark mode while app is open
4. Check browser console for errors

```javascript
// Debug system preference
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
console.log('System prefers dark:', mediaQuery.matches);
```

### Backend Sync Not Working

**Problem**: Theme doesn't sync across devices

**Solutions**:
1. Verify user is authenticated
2. Check network tab for API calls
3. Verify backend endpoint is working
4. Check authentication token is valid

```javascript
// Debug backend sync
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Test API manually
fetch('/api/users/preferences', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => console.log('Backend theme:', data.preferences?.theme));
```

### Colors Not Updating

**Problem**: Some elements don't change color

**Solutions**:
1. Verify CSS variables are used
2. Check for hardcoded colors in styles
3. Ensure `darkMode.css` is imported
4. Check for `!important` overrides

```css
/* ❌ Wrong - hardcoded color */
.my-element {
  background-color: #E3DAD1;
}

/* ✅ Correct - CSS variable */
.my-element {
  background-color: var(--bg-primary);
}
```

### Transitions Too Slow/Fast

**Problem**: Theme transitions feel wrong

**Solutions**:
1. Check transition duration in `darkMode.css` (should be 300ms)
2. Verify no conflicting transitions
3. Test on different devices
4. Consider user's `prefers-reduced-motion` setting

```css
/* Adjust transition duration if needed */
* {
  transition: background-color 300ms ease-in-out,
              color 300ms ease-in-out;
}
```

### Input Borders Changing Color

**Problem**: Input borders change color (violates design requirement)

**Solutions**:
1. Verify `--input-border` is set to `#D4816180`
2. Check for overrides in component styles
3. Ensure focus state uses same border color
4. Remove any dynamic border color logic

```css
/* ✅ Correct - constant border color */
input {
  border: 2px solid var(--input-border); /* #D4816180 */
}

input:focus {
  border: 2px solid var(--input-border); /* Same color */
}
```

---

## Best Practices

### Do's ✅

1. **Use CSS Variables**: Always use CSS variables for colors
2. **Test Both Modes**: Test all UI changes in both light and dark modes
3. **Respect System Preference**: Default to system preference when possible
4. **Smooth Transitions**: Keep transitions at 300ms for consistency
5. **Accessibility First**: Maintain WCAG 2.1 Level AA contrast ratios
6. **Persist Preferences**: Always save user's theme choice
7. **Sync with Backend**: Keep theme synced for authenticated users

### Don'ts ❌

1. **Don't Hardcode Colors**: Avoid hardcoded color values
2. **Don't Change Input Borders**: Never change `#D4816180` border color
3. **Don't Skip Testing**: Always test theme changes thoroughly
4. **Don't Ignore System Preference**: Respect user's OS settings
5. **Don't Use Long Transitions**: Keep transitions under 500ms
6. **Don't Forget Accessibility**: Always check contrast ratios
7. **Don't Override Variables**: Avoid overriding CSS variables unnecessarily

---

## Performance Considerations

### Optimization Techniques

1. **CSS Variables**: Single source of truth, no JavaScript color calculations
2. **GPU Acceleration**: Transitions use `transform` and `opacity` when possible
3. **Debounced Updates**: System preference changes are debounced
4. **Lazy Backend Sync**: Backend updates are non-blocking
5. **Minimal Reflows**: No layout changes during theme switch
6. **Efficient Selectors**: CSS variables applied at root level

### Performance Metrics

- **Theme Toggle Time**: < 50ms
- **Transition Duration**: 300ms
- **Layout Shift (CLS)**: 0 (no layout changes)
- **Backend Sync Time**: < 200ms (non-blocking)
- **localStorage Write**: < 5ms

---

## Browser Support

### Supported Browsers

- ✅ Chrome 76+ (CSS variables, matchMedia)
- ✅ Firefox 68+ (CSS variables, matchMedia)
- ✅ Safari 12.1+ (CSS variables, matchMedia)
- ✅ Edge 79+ (CSS variables, matchMedia)
- ✅ Chrome Mobile 90+
- ✅ iOS Safari 14+

### Legacy Browser Support

For older browsers that don't support `matchMedia.addEventListener`:

```javascript
// Fallback to addListener (deprecated but supported)
if (mediaQuery.addEventListener) {
  mediaQuery.addEventListener('change', handleChange);
} else if (mediaQuery.addListener) {
  mediaQuery.addListener(handleChange); // Legacy support
}
```

---

## Future Enhancements

### Planned Features

1. **Custom Themes**: Allow users to create custom color schemes
2. **Scheduled Themes**: Auto-switch based on time of day
3. **Per-Page Themes**: Different themes for different sections
4. **Theme Presets**: Pre-defined theme combinations
5. **Contrast Modes**: High contrast mode for accessibility
6. **Color Blind Modes**: Specialized color schemes for color blindness

### Potential Improvements

1. **Animation Preferences**: More granular animation controls
2. **Theme Preview**: Preview themes before applying
3. **Theme Sharing**: Share custom themes with other users
4. **Theme Analytics**: Track theme usage and preferences
5. **A/B Testing**: Test different color schemes

---

## Related Documentation

- 📄 `project-standards.md` - Project design standards and color palette
- 📄 `RESPONSIVE_DESIGN_FIX.md` - Responsive design implementation
- 📄 `PAGE_TRANSITIONS_IMPLEMENTATION.md` - Animation system
- 📄 `.kiro/specs/general-platform-enhancements/requirements.md` - Dark mode requirements
- 📄 `.kiro/specs/general-platform-enhancements/design.md` - Dark mode design document

---

## Support

For issues or questions about dark mode:

1. Check this documentation first
2. Review the troubleshooting section
3. Check existing tests for examples
4. Contact the development team

**Last Updated**: 2026-02-22  
**Maintained By**: Careerak Development Team  
**Version**: 1.0.0
