# Component-Level Suspense Fallback

## Overview

`ComponentSuspenseFallback` is a lightweight skeleton loader designed for individual lazy-loaded components. It provides a more focused loading experience compared to the full-page `RouteSuspenseFallback`.

## Features

- ✅ **Multiple Variants**: minimal, card, list, form
- ✅ **Dark Mode Support**: Automatically adapts to theme
- ✅ **Smooth Animations**: 200ms fade-in transition
- ✅ **Respects Reduced Motion**: Honors user preferences
- ✅ **Accessible**: ARIA live regions and screen reader support
- ✅ **Minimal Layout Impact**: Prevents layout shifts (CLS < 0.1)
- ✅ **Customizable**: Height and className props

## Requirements

- **FR-LOAD-1**: Display skeleton loaders matching content layout
- **FR-LOAD-7**: Apply smooth transitions (200ms fade)
- **FR-LOAD-8**: Prevent layout shifts
- **NFR-PERF-5**: Achieve CLS < 0.1

## Usage

### Basic Usage

```jsx
import React, { Suspense, lazy } from 'react';
import { ComponentSuspenseFallback } from '@/components/Loading';

const LazyComponent = lazy(() => import('./MyComponent'));

function App() {
  return (
    <Suspense fallback={<ComponentSuspenseFallback />}>
      <LazyComponent />
    </Suspense>
  );
}
```

### With Variants

```jsx
// Minimal spinner (default)
<Suspense fallback={<ComponentSuspenseFallback variant="minimal" />}>
  <LazyWidget />
</Suspense>

// Card layout
<Suspense fallback={<ComponentSuspenseFallback variant="card" />}>
  <LazyCard />
</Suspense>

// List layout
<Suspense fallback={<ComponentSuspenseFallback variant="list" />}>
  <LazyList />
</Suspense>

// Form layout
<Suspense fallback={<ComponentSuspenseFallback variant="form" />}>
  <LazyForm />
</Suspense>
```

### Custom Height

```jsx
<Suspense fallback={<ComponentSuspenseFallback variant="card" height="h-96" />}>
  <LazyComponent />
</Suspense>
```

### Additional Classes

```jsx
<Suspense fallback={
  <ComponentSuspenseFallback 
    variant="minimal" 
    className="shadow-lg border border-gray-200"
  />
}>
  <LazyComponent />
</Suspense>
```

## Variants

### 1. Minimal (Default)

A simple centered spinner. Best for small components or widgets.

```jsx
<ComponentSuspenseFallback variant="minimal" />
```

**Default Height**: `h-20`

### 2. Card

Skeleton matching a typical card layout with image, title, and text.

```jsx
<ComponentSuspenseFallback variant="card" />
```

**Default Height**: `h-64`

**Layout**:
- Image skeleton (h-32)
- Title skeleton (h-6)
- Text lines (2x h-4)

### 3. List

Skeleton for list items with avatars and text.

```jsx
<ComponentSuspenseFallback variant="list" />
```

**Default Height**: `h-auto`

**Layout**:
- 3 list items
- Each with avatar (12x12) and text lines

### 4. Form

Skeleton for form layouts with labels and inputs.

```jsx
<ComponentSuspenseFallback variant="form" />
```

**Default Height**: `h-auto`

**Layout**:
- 3 form fields
- Each with label and input skeleton
- Submit button skeleton

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'minimal' \| 'card' \| 'list' \| 'form'` | `'minimal'` | Loading skeleton variant |
| `height` | `string` | Auto (based on variant) | Custom height (Tailwind class) |
| `className` | `string` | `''` | Additional CSS classes |

## Comparison with RouteSuspenseFallback

| Feature | ComponentSuspenseFallback | RouteSuspenseFallback |
|---------|---------------------------|------------------------|
| **Use Case** | Individual components | Full page routes |
| **Size** | Compact, focused | Full-page layout |
| **Layout** | Component-specific | Navbar + Content + Footer |
| **Height** | Minimal (20px - auto) | Full viewport (100vh) |
| **Complexity** | Simple skeleton | Complete page structure |

## When to Use

### Use ComponentSuspenseFallback for:

- ✅ Lazy-loaded widgets or cards
- ✅ Modal content that loads dynamically
- ✅ Sections within a page
- ✅ Individual form components
- ✅ List items or data tables

### Use RouteSuspenseFallback for:

- ✅ Lazy-loaded route components
- ✅ Full page transitions
- ✅ Initial app load

## Examples

### Lazy Modal Content

```jsx
const LazyModalContent = lazy(() => import('./ModalContent'));

function Modal({ isOpen }) {
  return (
    <Dialog open={isOpen}>
      <Suspense fallback={<ComponentSuspenseFallback variant="form" />}>
        <LazyModalContent />
      </Suspense>
    </Dialog>
  );
}
```

### Lazy Dashboard Widget

```jsx
const LazyChart = lazy(() => import('./Chart'));

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Suspense fallback={<ComponentSuspenseFallback variant="card" />}>
        <LazyChart />
      </Suspense>
    </div>
  );
}
```

### Lazy List Items

```jsx
const LazyUserList = lazy(() => import('./UserList'));

function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      <Suspense fallback={<ComponentSuspenseFallback variant="list" />}>
        <LazyUserList />
      </Suspense>
    </div>
  );
}
```

## Accessibility

The component includes:

- ✅ `role="status"` for loading state
- ✅ `aria-live="polite"` for screen reader announcements
- ✅ `aria-label="Loading component"` for context
- ✅ Hidden text for screen readers: "Loading component, please wait..."

## Dark Mode

The component automatically adapts to the current theme:

- **Light Mode**: White background, gray skeletons
- **Dark Mode**: Dark background (#2d2d2d), darker gray skeletons

## Animation

- **Duration**: 200ms fade-in
- **Easing**: Default Framer Motion easing
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **GPU Accelerated**: Uses opacity for smooth performance

## Performance

- ✅ **Lightweight**: Minimal DOM elements
- ✅ **No Layout Shifts**: Fixed heights prevent CLS
- ✅ **Fast Render**: Simple skeleton structure
- ✅ **Optimized Animations**: GPU-accelerated properties only

## Testing

```jsx
import { render, screen } from '@testing-library/react';
import ComponentSuspenseFallback from './ComponentSuspenseFallback';

test('renders loading state', () => {
  render(<ComponentSuspenseFallback />);
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.getByText(/loading component/i)).toBeInTheDocument();
});

test('renders card variant', () => {
  const { container } = render(<ComponentSuspenseFallback variant="card" />);
  expect(container.querySelector('.h-64')).toBeInTheDocument();
});
```

## Best Practices

1. **Match the Layout**: Choose a variant that matches your component's layout
2. **Set Appropriate Height**: Use the height prop to prevent layout shifts
3. **Use Consistently**: Use the same fallback for similar components
4. **Test Loading States**: Always test with slow network throttling
5. **Consider Accessibility**: Ensure screen reader users understand the loading state

## Related Components

- `RouteSuspenseFallback` - Full-page loading for routes
- `SkeletonCard` - Customizable card skeleton
- `SkeletonTable` - Table skeleton with responsive design
- `Spinner` - Simple rotating spinner
- `OverlaySpinner` - Full-screen overlay with spinner

## References

- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
