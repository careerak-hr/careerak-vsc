# Route-Level Suspense Fallback

## Overview
Full-page skeleton loader displayed while lazy-loaded route components are loading. This component provides a smooth loading experience that matches the general page layout to prevent layout shifts.

## Features
- ✅ Full-page skeleton matching typical page structure (navbar, content, footer)
- ✅ Dark mode support with automatic theme detection
- ✅ Smooth fade-in animation (200ms transition)
- ✅ No layout shifts (CLS < 0.1)
- ✅ Accessible with ARIA attributes and screen reader announcements
- ✅ Pulse animation on skeleton elements
- ✅ Responsive design (mobile, tablet, desktop)

## Requirements Met
- **FR-LOAD-1**: Display skeleton loaders matching content layout
- **FR-LOAD-7**: Apply smooth transitions (200ms fade)
- **FR-LOAD-8**: Prevent layout shifts
- **NFR-PERF-5**: Achieve CLS < 0.1
- **Design Section 9.3**: Route level uses full-page skeleton

## Usage

### Direct Import
```jsx
import { RouteSuspenseFallback } from '@/components/Loading';

<React.Suspense fallback={<RouteSuspenseFallback />}>
  <LazyLoadedComponent />
</React.Suspense>
```

### Via SuspenseWrapper (Recommended)
```jsx
import { SuspenseWrapper } from '@/components/GlobalLoaders';

<SuspenseWrapper skeleton="route">
  <LazyLoadedComponent />
</SuspenseWrapper>
```

The `SuspenseWrapper` now defaults to `RouteSuspenseFallback` when no skeleton type is specified, providing a better user experience for route-level loading.

## Component Structure

### Navbar Skeleton
- Height: 64px (h-16)
- Logo placeholder: 32px height
- Navigation items: 3 placeholders

### Main Content Skeleton
- Page title placeholder
- 6 content cards in responsive grid:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
- Each card includes:
  - Image placeholder (160px height)
  - Title placeholder
  - Description placeholders (2 lines)
  - Button placeholder

### Footer Skeleton
- 3-column grid (responsive)
- Section titles and content placeholders

## Accessibility

### ARIA Attributes
- `role="status"` - Indicates loading status
- `aria-live="polite"` - Announces changes to screen readers
- `aria-label="Loading page"` - Descriptive label

### Screen Reader Support
- Hidden text announcement: "Loading page content, please wait..."
- Semantic HTML structure
- Proper landmark roles

## Dark Mode Support
The component automatically adapts to the current theme:

**Light Mode:**
- Background: #E3DAD1
- Surface: white
- Skeleton: gray-300

**Dark Mode:**
- Background: #1a1a1a
- Surface: #2d2d2d
- Skeleton: gray-700

## Performance
- **No Layout Shifts**: Skeleton matches actual content dimensions
- **GPU Accelerated**: Uses transform and opacity for animations
- **Smooth Transitions**: 200ms duration for theme changes
- **Minimal Re-renders**: Uses theme context efficiently

## Testing
Comprehensive test suite with 10 tests covering:
- ✅ Component rendering
- ✅ Accessibility attributes
- ✅ Screen reader announcements
- ✅ Light/dark mode styles
- ✅ Skeleton structure (navbar, content, footer)
- ✅ Animation classes
- ✅ Responsive grid

Run tests:
```bash
npm test -- RouteSuspenseFallback.test.jsx --run
```

## Integration
The component is automatically used in `AppRoutes.jsx` via `SuspenseWrapper` for all lazy-loaded routes, providing a consistent loading experience across the entire application.

## Files
- **Component**: `frontend/src/components/Loading/RouteSuspenseFallback.jsx`
- **Tests**: `frontend/src/components/Loading/__tests__/RouteSuspenseFallback.test.jsx`
- **Export**: `frontend/src/components/Loading/index.js`
- **Integration**: `frontend/src/components/GlobalLoaders.jsx`

## Related Components
- `GlobalLoader` - Simple spinner for app initialization
- `SuspenseWrapper` - Wrapper component with multiple skeleton options
- `SkeletonLoaders` - Component-specific skeleton loaders
- `PageTransition` - Page transition animations

## Future Enhancements
- [ ] Add more skeleton variants (list, table, form)
- [ ] Support custom skeleton configurations
- [ ] Add shimmer effect option
- [ ] Progressive skeleton loading (fade in sections)
