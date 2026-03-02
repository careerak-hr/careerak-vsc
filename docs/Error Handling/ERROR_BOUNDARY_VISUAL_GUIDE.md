# Error Boundary Visual Testing Guide

## 🎨 What You Should See

This guide shows exactly what the error boundaries should look like when triggered.

---

## Component Error Boundary (Inline)

### Normal State
```
┌─────────────────────────────────────────┐
│  ✅ Component Working Correctly         │
│                                         │
│  No errors thrown. Error boundary is   │
│  ready to catch errors.                │
└─────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────┐
│  ⚠️  عذراً، حدث خطأ                     │  (Arabic)
│                                         │
│  حدث خطأ غير متوقع في هذا المكون       │
│                                         │
│  [ إعادة المحاولة ]                     │
│                                         │
│  ▼ تفاصيل الخطأ (Development)          │
└─────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────┐
│  ⚠️  Oops, Something Went Wrong         │  (English)
│                                         │
│  An unexpected error occurred in this  │
│  component.                             │
│                                         │
│  [ Retry ]                              │
│                                         │
│  ▼ Error Details (Development)         │
└─────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────┐
│  ⚠️  Oups, Une Erreur S'est Produite    │  (French)
│                                         │
│  Une erreur inattendue s'est produite  │
│  dans ce composant.                     │
│                                         │
│  [ Réessayer ]                          │
│                                         │
│  ▼ Détails de l'erreur (Development)   │
└─────────────────────────────────────────┘
```

### Key Visual Elements
- ⚠️ **Icon**: Warning/error icon (40x40px)
- **Title**: Bold, larger font
- **Description**: Regular font, gray color
- **Button**: Primary color (#D48161), rounded
- **Card**: Rounded corners, subtle shadow
- **Layout**: Inline, doesn't break page

---

## Route Error Boundary (Full-Page)

### Error State
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                      ⚠️                                 │
│                   (80x80px)                            │
│                                                         │
│              عذراً، حدث خطأ                             │  (Arabic)
│                                                         │
│     حدث خطأ غير متوقع. نعمل على حل المشكلة.           │
│                                                         │
│                                                         │
│     [ إعادة المحاولة ]  [ العودة للرئيسية ]           │
│                                                         │
│                                                         │
│     ▼ تفاصيل الخطأ (Development)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│                      ⚠️                                 │
│                   (80x80px)                            │
│                                                         │
│          Oops, Something Went Wrong                    │  (English)
│                                                         │
│   An unexpected error occurred. We're working on it.   │
│                                                         │
│                                                         │
│          [ Retry ]        [ Go Home ]                  │
│                                                         │
│                                                         │
│          ▼ Error Details (Development)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Visual Elements
- ⚠️ **Icon**: Large error icon (80x80px), centered
- **Title**: Large, bold, centered
- **Description**: Centered, gray color
- **Buttons**: Two buttons side by side
  - Primary button (Retry): #D48161
  - Secondary button (Go Home): Gray
- **Card**: Large centered card with shadow
- **Layout**: Full-page, centered vertically and horizontally

---

## Console Output

### What You Should See in DevTools Console

```
=== ComponentErrorBoundary Error ===
Timestamp: 2026-02-21T10:30:45.123Z
Component: ErrorThrowingComponent
User ID: 507f1f77bcf86cd799439011
Error: Error: Test render error from ErrorThrowingComponent
Stack Trace: Error: Test render error from ErrorThrowingComponent
    at ErrorThrowingComponent (http://localhost:5173/src/test/ErrorBoundaryTest.jsx:12:11)
    at ComponentErrorBoundary (http://localhost:5173/src/components/ErrorBoundary/ComponentErrorBoundary.jsx:45:23)
    ...
Component Stack:
    at ErrorThrowingComponent (http://localhost:5173/src/test/ErrorBoundaryTest.jsx:12:11)
    at ComponentErrorBoundary (http://localhost:5173/src/components/ErrorBoundary/ComponentErrorBoundary.jsx:45:23)
    ...
Retry Count: 0
====================================
```

### Key Console Elements
- ✅ Clear section headers (===)
- ✅ Timestamp in ISO format
- ✅ Component name
- ✅ User ID (if authenticated)
- ✅ Error message
- ✅ Full stack trace
- ✅ Component stack
- ✅ Retry count (for ComponentErrorBoundary)

---

## Multiple Components Test

### What You Should See

```
┌─────────────────────────────────────────────────────────┐
│  Multiple Components Test                               │
├─────────────────────────┬───────────────────────────────┤
│  Component 1            │  Component 2                  │
│                         │                               │
│  ⚠️  Oops, Something    │  ✅ Component Working         │
│  Went Wrong             │  Correctly                    │
│                         │                               │
│  An unexpected error    │  No errors thrown.            │
│  occurred in this       │  Error boundary is ready      │
│  component.             │  to catch errors.             │
│                         │                               │
│  [ Retry ]              │                               │
└─────────────────────────┴───────────────────────────────┘
```

### Key Visual Elements
- **Isolation**: Only Component 1 shows error
- **Independence**: Component 2 continues working
- **Layout**: Side by side, equal width
- **No Impact**: Error in one doesn't affect the other

---

## Animation Behavior

### Component Error Boundary Animation
```
Frame 1 (0ms):     opacity: 0, y: -10px
Frame 2 (150ms):   opacity: 0.5, y: -5px
Frame 3 (300ms):   opacity: 1, y: 0px
```

**Duration**: 300ms  
**Easing**: ease-out  
**Properties**: opacity, transform (y)

### Route Error Boundary Animation
```
Frame 1 (0ms):     opacity: 0, scale: 0.9
Frame 2 (150ms):   opacity: 0.5, scale: 0.95
Frame 3 (300ms):   opacity: 1, scale: 1
```

**Duration**: 300ms  
**Easing**: ease-out  
**Properties**: opacity, transform (scale)

---

## Color Scheme

### Light Mode
- **Background**: #E3DAD1 (Secondary)
- **Card Background**: #FFFFFF
- **Text**: #304B60 (Primary)
- **Error Icon**: #D48161 (Accent)
- **Primary Button**: #D48161 (Accent)
- **Secondary Button**: #304B60 (Primary)

### Dark Mode (if implemented)
- **Background**: #1a1a1a
- **Card Background**: #2d2d2d
- **Text**: #e0e0e0
- **Error Icon**: #D48161 (Accent)
- **Primary Button**: #D48161 (Accent)
- **Secondary Button**: #e0e0e0

---

## Responsive Behavior

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [Error Card]                         │
│                    (max-width: 600px)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌───────────────────────────────────────────┐
│                                           │
│          [Error Card]                     │
│          (max-width: 500px)               │
│                                           │
└───────────────────────────────────────────┘
```

### Mobile (320px - 767px)
```
┌─────────────────────────────┐
│                             │
│     [Error Card]            │
│     (full width - 32px)     │
│                             │
└─────────────────────────────┘
```

---

## Development vs Production

### Development Mode
```
┌─────────────────────────────────────────┐
│  ⚠️  Oops, Something Went Wrong         │
│                                         │
│  An unexpected error occurred.          │
│                                         │
│  [ Retry ]                              │
│                                         │
│  ▼ Error Details                        │  ← Visible
│  ├─ Component: ErrorThrowingComponent   │
│  ├─ Timestamp: 2026-02-21T10:30:45.123Z │
│  ├─ Retry Count: 0                      │
│  ├─ Error: Test render error...         │
│  └─ Stack: at ErrorThrowingComponent... │
└─────────────────────────────────────────┘
```

### Production Mode
```
┌─────────────────────────────────────────┐
│  ⚠️  Oops, Something Went Wrong         │
│                                         │
│  An unexpected error occurred.          │
│                                         │
│  [ Retry ]                              │
│                                         │
│  (No error details section)             │  ← Hidden
└─────────────────────────────────────────┘
```

---

## Accessibility Features

### Keyboard Navigation
```
Tab Order:
1. [Retry Button] ← Focus visible (outline)
2. [Go Home Button] (Route only)
3. [Error Details] (if expanded)
```

### Screen Reader Announcements
```
1. "Alert: Oops, Something Went Wrong"
2. "An unexpected error occurred in this component"
3. "Button: Retry"
4. "Button: Go Home" (Route only)
```

### ARIA Attributes
- `role="alert"` on error container
- `aria-live="assertive"` (Route) or `aria-live="polite"` (Component)
- `aria-label` on all buttons

---

## Testing Checklist

Use this visual checklist while testing:

### Component Error Boundary
- [ ] ⚠️ Icon visible (40x40px)
- [ ] Title in correct language
- [ ] Description in correct language
- [ ] Retry button visible and styled
- [ ] Card has rounded corners
- [ ] Card has subtle shadow
- [ ] Inline layout (doesn't break page)
- [ ] Other components still work
- [ ] Smooth fade-in animation (300ms)
- [ ] Details section visible in dev
- [ ] Details section hidden in prod

### Route Error Boundary
- [ ] ⚠️ Icon visible (80x80px)
- [ ] Title in correct language
- [ ] Description in correct language
- [ ] Retry button visible and styled
- [ ] Go Home button visible and styled
- [ ] Card centered on page
- [ ] Full-page layout
- [ ] Smooth scale-in animation (300ms)
- [ ] Details section visible in dev
- [ ] Details section hidden in prod

### Console Output
- [ ] Section header visible (===)
- [ ] Timestamp logged
- [ ] Component name logged
- [ ] User ID logged (if authenticated)
- [ ] Error message logged
- [ ] Stack trace logged
- [ ] Component stack logged
- [ ] Retry count logged (Component only)

---

## Quick Visual Test

### 30-Second Visual Check
1. ✅ Error UI appears smoothly
2. ✅ Icon is visible and correct size
3. ✅ Text is readable and in correct language
4. ✅ Buttons are clickable and styled
5. ✅ Layout matches design (inline or full-page)
6. ✅ Console shows complete error details

If all 6 checks pass, visual implementation is correct! ✅

---

## References

- **Full Testing Guide**: `docs/ERROR_BOUNDARY_MANUAL_TESTING_GUIDE.md`
- **Quick Reference**: `docs/ERROR_BOUNDARY_QUICK_TEST.md`
- **Summary**: `docs/ERROR_BOUNDARY_TESTING_SUMMARY.md`

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-21  
**Status**: ✅ Complete
