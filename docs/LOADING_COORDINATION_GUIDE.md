# Loading Coordination Guide

## Overview

The Loading Coordination system manages multiple loading states across different sections of a page to prevent layout shifts and provide a smooth user experience.

## Requirements

- **FR-LOAD-8**: Coordinate loading states to prevent layout shifts
- **NFR-PERF-5**: Achieve CLS < 0.1
- **NFR-USE-3**: Display loading states within 100ms

## Key Features

1. **Centralized State Management** - Single source of truth for all loading states
2. **Layout Shift Prevention** - Reserves space before content loads
3. **Progress Tracking** - Monitors loading progress across sections
4. **Screen Reader Support** - Announces loading progress
5. **Automatic Cleanup** - Handles component unmounting

## Components

### LoadingCoordinator

Main component that coordinates multiple loading sections.

```jsx
<LoadingCoordinator 
  onAllLoaded={() => console.log('Done!')}
  announceProgress={true}
>
  {/* Loading sections here */}
</LoadingCoordinator>
```

### LoadingSection

Individual section within a coordinator.

```jsx
<LoadingSection id="header" minHeight="100px">
  {(loading, setLoading) => (
    loading ? <Skeleton /> : <Content />
  )}
</LoadingSection>
```



## Usage Examples

### Basic Example

```jsx
import { LoadingCoordinator, LoadingSection } from './components/Loading/LoadingCoordinator';

function MyPage() {
  return (
    <LoadingCoordinator>
      <LoadingSection id="header" minHeight="100px">
        {(loading, setLoading) => {
          // Simulate data fetch
          useEffect(() => {
            fetchData().then(() => setLoading(false));
          }, []);
          
          return loading ? <HeaderSkeleton /> : <Header />;
        }}
      </LoadingSection>
      
      <LoadingSection id="content" minHeight="400px">
        {(loading, setLoading) => {
          useEffect(() => {
            fetchContent().then(() => setLoading(false));
          }, []);
          
          return loading ? <ContentSkeleton /> : <Content />;
        }}
      </LoadingSection>
    </LoadingCoordinator>
  );
}
```

### Simple Hook Example

```jsx
import { useSimpleCoordination } from './components/Loading/LoadingCoordinator';

function SimplePage() {
  const { sections, updateSection, loadingPercentage } = useSimpleCoordination([
    { id: 'header', minHeight: '100px', loading: true },
    { id: 'content', minHeight: '400px', loading: true },
  ]);
  
  return (
    <div>
      <ProgressBar progress={loadingPercentage} />
      {sections.map(section => (
        <div key={section.id} style={section.style}>
          {section.loading ? <Skeleton /> : <Content />}
        </div>
      ))}
    </div>
  );
}
```



## API Reference

### LoadingCoordinator Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Child components |
| `onAllLoaded` | Function | undefined | Callback when all sections loaded |
| `announceProgress` | boolean | true | Announce progress to screen readers |
| `className` | string | '' | Additional CSS classes |

### LoadingSection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | string | required | Unique section identifier |
| `minHeight` | string\|number | required | Minimum height to reserve |
| `children` | Function | required | Render function (loading, setLoading) => ReactNode |
| `className` | string | '' | Additional CSS classes |
| `onLoadingChange` | Function | undefined | Callback when loading state changes |

### useSimpleCoordination Hook

```jsx
const {
  sections,        // Array of coordinated sections
  updateSection,   // Function to update section loading state
  allLoaded,       // Boolean indicating all sections loaded
  loadingCount,    // Number of sections still loading
  totalMinHeight,  // Total reserved height
  loadingPercentage // Loading progress (0-100)
} = useSimpleCoordination(initialSections);
```



## Best Practices

### 1. Set Appropriate minHeight

Choose minHeight values that match your actual content:

```jsx
// ✅ Good - matches actual content height
<LoadingSection id="header" minHeight="100px">

// ❌ Bad - too small, will cause layout shift
<LoadingSection id="header" minHeight="20px">

// ❌ Bad - too large, wastes space
<LoadingSection id="header" minHeight="500px">
```

### 2. Use Unique IDs

Each section must have a unique ID:

```jsx
// ✅ Good
<LoadingSection id="header" minHeight="100px">
<LoadingSection id="content" minHeight="400px">

// ❌ Bad - duplicate IDs
<LoadingSection id="section" minHeight="100px">
<LoadingSection id="section" minHeight="400px">
```

### 3. Match Skeleton Dimensions

Ensure skeleton loaders match actual content dimensions:

```jsx
<LoadingSection id="card" minHeight="200px">
  {(loading) => loading ? (
    <SkeletonLoader type="card" height="200px" /> // ✅ Matches minHeight
  ) : (
    <Card /> // Actual height ~200px
  )}
</LoadingSection>
```

### 4. Handle Errors Gracefully

```jsx
<LoadingSection id="content" minHeight="400px">
  {(loading, setLoading) => {
    const [error, setError] = useState(null);
    
    useEffect(() => {
      fetchData()
        .then(() => setLoading(false))
        .catch(err => {
          setError(err);
          setLoading(false); // Stop loading on error
        });
    }, []);
    
    if (error) return <ErrorMessage error={error} />;
    return loading ? <Skeleton /> : <Content />;
  }}
</LoadingSection>
```



## Real-World Examples

### Job Listings Page

```jsx
function JobListingsPage() {
  return (
    <LoadingCoordinator className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Filters */}
        <LoadingSection id="filters" minHeight="300px" className="lg:col-span-1">
          {(loading, setLoading) => (
            <JobFilters loading={loading} onLoad={() => setLoading(false)} />
          )}
        </LoadingSection>

        {/* Job List */}
        <LoadingSection id="jobs" minHeight="600px" className="lg:col-span-2">
          {(loading, setLoading) => (
            <JobList loading={loading} onLoad={() => setLoading(false)} />
          )}
        </LoadingSection>
      </div>
    </LoadingCoordinator>
  );
}
```

### Dashboard with Multiple Widgets

```jsx
function Dashboard() {
  return (
    <LoadingCoordinator onAllLoaded={() => trackEvent('dashboard_loaded')}>
      <LoadingSection id="stats" minHeight="120px">
        {(loading, setLoading) => (
          <StatsWidget loading={loading} onLoad={() => setLoading(false)} />
        )}
      </LoadingSection>
      
      <LoadingSection id="chart" minHeight="400px">
        {(loading, setLoading) => (
          <ChartWidget loading={loading} onLoad={() => setLoading(false)} />
        )}
      </LoadingSection>
      
      <LoadingSection id="recent" minHeight="300px">
        {(loading, setLoading) => (
          <RecentActivity loading={loading} onLoad={() => setLoading(false)} />
        )}
      </LoadingSection>
    </LoadingCoordinator>
  );
}
```



## Performance Considerations

### CLS (Cumulative Layout Shift)

The coordination system helps achieve CLS < 0.1 by:

1. **Reserving Space** - Sets minHeight before content loads
2. **Smooth Transitions** - Uses 200ms fade transitions
3. **GPU Acceleration** - Uses transform/opacity for animations
4. **Dimension Matching** - Skeleton loaders match content dimensions

### Measuring CLS

```jsx
import { useCLSMeasurement } from '../hooks/useLayoutShiftPrevention';

function MyPage() {
  const { cls, isGood } = useCLSMeasurement();
  
  useEffect(() => {
    if (!isGood) {
      console.warn('CLS exceeds threshold:', cls);
    }
  }, [cls, isGood]);
  
  return <LoadingCoordinator>...</LoadingCoordinator>;
}
```

## Accessibility

### Screen Reader Announcements

The coordinator automatically announces loading progress:

```
"Loading: 33% complete. 2 sections remaining."
"Loading: 66% complete. 1 section remaining."
"Loading: 100% complete."
```

### ARIA Attributes

Each section includes proper ARIA attributes:

- `role="status"` for loading announcements
- `aria-live="polite"` for progress updates
- `data-loading` attribute for styling

## Troubleshooting

### Layout Shifts Still Occurring

1. Check minHeight matches actual content
2. Ensure skeleton dimensions match content
3. Verify no content inserted above existing content
4. Use browser DevTools to measure CLS

### Sections Not Updating

1. Verify unique section IDs
2. Check setLoading is called correctly
3. Ensure component is within LoadingCoordinator
4. Check console for errors

### Performance Issues

1. Reduce number of coordinated sections
2. Use useSimpleCoordination for simple cases
3. Optimize data fetching
4. Consider code splitting



## Testing

### Unit Tests

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import { LoadingCoordinator, LoadingSection } from './LoadingCoordinator';

test('coordinates multiple loading states', async () => {
  const onAllLoaded = jest.fn();
  
  render(
    <LoadingCoordinator onAllLoaded={onAllLoaded}>
      <LoadingSection id="section1" minHeight="100px">
        {(loading, setLoading) => {
          useEffect(() => {
            setTimeout(() => setLoading(false), 100);
          }, []);
          return loading ? 'Loading...' : 'Loaded!';
        }}
      </LoadingSection>
    </LoadingCoordinator>
  );
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Loaded!')).toBeInTheDocument();
    expect(onAllLoaded).toHaveBeenCalled();
  });
});
```

### Integration Tests

```jsx
test('prevents layout shifts during loading', async () => {
  const { container } = render(<CoordinatedPage />);
  
  const initialHeight = container.offsetHeight;
  
  // Wait for all sections to load
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
  
  const finalHeight = container.offsetHeight;
  
  // Height should not change significantly
  expect(Math.abs(finalHeight - initialHeight)).toBeLessThan(10);
});
```

## Migration Guide

### From Manual Loading States

Before:
```jsx
const [headerLoading, setHeaderLoading] = useState(true);
const [contentLoading, setContentLoading] = useState(true);

return (
  <div>
    {headerLoading ? <HeaderSkeleton /> : <Header />}
    {contentLoading ? <ContentSkeleton /> : <Content />}
  </div>
);
```

After:
```jsx
return (
  <LoadingCoordinator>
    <LoadingSection id="header" minHeight="100px">
      {(loading) => loading ? <HeaderSkeleton /> : <Header />}
    </LoadingSection>
    <LoadingSection id="content" minHeight="400px">
      {(loading) => loading ? <ContentSkeleton /> : <Content />}
    </LoadingSection>
  </LoadingCoordinator>
);
```

## Related Documentation

- [Layout Shift Prevention Guide](./LAYOUT_SHIFT_PREVENTION.md)
- [Loading States Guide](./LOADING_STATES_GUIDE.md)
- [Skeleton Loaders Guide](./SKELETON_LOADERS_GUIDE.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)

