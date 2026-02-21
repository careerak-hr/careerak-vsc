# Error Boundary Components

This directory contains error boundary components for handling errors gracefully in the Careerak application.

## Components

### 1. RouteErrorBoundary
Full-page error boundary for route-level errors.

**Usage:**
```jsx
import { RouteErrorBoundary } from './components/ErrorBoundary';

<RouteErrorBoundary>
  <Router>
    <Routes>
      {/* Your routes */}
    </Routes>
  </Router>
</RouteErrorBoundary>
```

**Features:**
- Full-page error UI
- Retry button (reloads page)
- Go Home button (navigates to /)
- Multi-language support (ar, en, fr)
- Error logging to console
- Development-only error details

---

### 2. ComponentErrorBoundary
Inline error boundary for component-level errors.

**Usage:**

**Basic Usage:**
```jsx
import { ComponentErrorBoundary } from './components/ErrorBoundary';

<ComponentErrorBoundary componentName="JobCard">
  <JobCard job={job} />
</ComponentErrorBoundary>
```

**With Custom Fallback:**
```jsx
<ComponentErrorBoundary 
  componentName="ProfileImage"
  fallback={<div className="image-error">Failed to load image</div>}
>
  <ProfileImage src={user.profilePicture} />
</ComponentErrorBoundary>
```

**With Error Callback:**
```jsx
<ComponentErrorBoundary 
  componentName="PaymentForm"
  onError={(error, errorInfo, componentName) => {
    // Send to analytics or error tracking service
    analytics.trackError(error, componentName);
  }}
>
  <PaymentForm />
</ComponentErrorBoundary>
```

**Features:**
- Inline error UI (doesn't break the entire page)
- Retry button (re-renders component)
- Multi-language support (ar, en, fr)
- Error logging to console
- Development-only error details
- Custom fallback support
- Error callback support
- Retry count tracking

---

## Props

### ComponentErrorBoundary Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | ReactNode | Yes | - | The component(s) to wrap with error boundary |
| `componentName` | string | No | 'Unknown' | Name of the component for logging |
| `fallback` | ReactNode | No | null | Custom fallback UI to display on error |
| `onError` | function | No | null | Callback function called when error occurs |

### onError Callback Signature
```typescript
onError(error: Error, errorInfo: ErrorInfo, componentName: string): void
```

---

## Requirements Fulfilled

### FR-ERR-1: Error Catching
✅ Both components catch component errors using `componentDidCatch` lifecycle method.

### FR-ERR-2: Multi-language Support
✅ Error messages displayed in Arabic, English, or French based on user preference.

### FR-ERR-3: Error Logging
✅ All errors logged to console with:
- Timestamp
- Component name
- Error message
- Stack trace
- Component stack
- Retry count (ComponentErrorBoundary only)

### FR-ERR-4: Retry Button
✅ Both components provide a "Retry" button to attempt recovery.

### FR-ERR-5: Go Home Button
✅ RouteErrorBoundary provides "Go Home" button to navigate to homepage.

### FR-ERR-6: Full-page Error Boundary
✅ RouteErrorBoundary displays full-page error UI for route-level errors.

### FR-ERR-7: Inline Error Boundary
✅ ComponentErrorBoundary displays inline error UI without breaking the entire page.

### FR-ERR-8: Error Recovery
✅ Both components reset error boundary state on retry:
- RouteErrorBoundary: Reloads the page
- ComponentErrorBoundary: Re-renders the component

---

## Design Standards Compliance

### Colors
- Primary: #304B60 (كحلي)
- Secondary: #E3DAD1 (بيج)
- Accent: #D48161 (نحاسي)

### Typography
- Arabic: Amiri, Cairo, serif
- English: Cormorant Garamond, serif
- French: EB Garamond, serif

### Responsive Design
- Mobile: 320px - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+

### Accessibility
- ARIA roles and labels
- Keyboard navigation support
- Focus indicators
- Screen reader support
- RTL/LTR support

### Animations
- Framer Motion for smooth transitions
- Respects `prefers-reduced-motion`
- 300ms duration

---

## Best Practices

### When to Use ComponentErrorBoundary

1. **Critical Components**: Wrap components that might fail but shouldn't break the entire page
   ```jsx
   <ComponentErrorBoundary componentName="PaymentForm">
     <PaymentForm />
   </ComponentErrorBoundary>
   ```

2. **Third-party Components**: Wrap external components that might throw errors
   ```jsx
   <ComponentErrorBoundary componentName="MapWidget">
     <GoogleMap />
   </ComponentErrorBoundary>
   ```

3. **Data-dependent Components**: Wrap components that depend on external data
   ```jsx
   <ComponentErrorBoundary componentName="UserProfile">
     <UserProfile userId={userId} />
   </ComponentErrorBoundary>
   ```

4. **List Items**: Wrap individual list items to prevent one error from breaking the entire list
   ```jsx
   {jobs.map(job => (
     <ComponentErrorBoundary key={job.id} componentName="JobCard">
       <JobCard job={job} />
     </ComponentErrorBoundary>
   ))}
   ```

### When NOT to Use

- Don't wrap every single component (performance overhead)
- Don't use for event handlers (use try-catch instead)
- Don't use for async code (use try-catch instead)
- Don't use for server-side rendering errors

---

## Error Logging

### Console Output Format

```
=== ComponentErrorBoundary Error ===
Timestamp: 2026-02-21T10:30:45.123Z
Component: JobCard
Error: TypeError: Cannot read property 'title' of undefined
Stack Trace: [full stack trace]
Component Stack: [component hierarchy]
Retry Count: 0
====================================
```

### Future: Error Tracking Service

The components are prepared for integration with error tracking services (Sentry, LogRocket, etc.):

```jsx
componentDidCatch(error, errorInfo) {
  // Current: Console logging
  console.error('Error:', error);
  
  // Future: Send to error tracking service
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```

---

## Testing

### Manual Testing

1. **Trigger an error:**
   ```jsx
   const BrokenComponent = () => {
     throw new Error('Test error');
     return <div>This will never render</div>;
   };
   
   <ComponentErrorBoundary componentName="BrokenComponent">
     <BrokenComponent />
   </ComponentErrorBoundary>
   ```

2. **Test retry functionality:**
   - Click the "Retry" button
   - Verify component re-renders
   - Check console for retry count

3. **Test multi-language:**
   - Switch language to Arabic
   - Trigger error
   - Verify error message in Arabic
   - Repeat for English and French

### Property-Based Testing

See `tasks.md` section 7.6 for property-based test requirements.

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Chrome Mobile 90+
- iOS Safari 14+

---

## Performance Considerations

- Error boundaries have minimal performance overhead
- Only active when errors occur
- Use sparingly for critical components only
- Consider custom fallback for better UX

---

## Related Documentation

- [Requirements](../../.kiro/specs/general-platform-enhancements/requirements.md)
- [Design](../../.kiro/specs/general-platform-enhancements/design.md)
- [Tasks](../../.kiro/specs/general-platform-enhancements/tasks.md)

---

## Changelog

### 2026-02-21
- ✅ Created ComponentErrorBoundary component
- ✅ Added inline error UI
- ✅ Added retry functionality
- ✅ Added multi-language support
- ✅ Added error logging
- ✅ Added custom fallback support
- ✅ Added error callback support
- ✅ Added responsive design
- ✅ Added accessibility features
- ✅ Added dark mode support
