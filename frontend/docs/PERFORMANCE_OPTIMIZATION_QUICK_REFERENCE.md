# Performance Optimization Quick Reference

## Quick Start

### 1. Use Lazy Loading for Charts

```jsx
import LazyChartWidget from './LazyChartWidget';

<LazyChartWidget 
  chartType="UsersChartWidget" 
  timeRange="daily" 
/>
```

### 2. Use Lazy Loading for Widgets

```jsx
import LazyWidget from './LazyWidget';

// Above the fold (load immediately)
<LazyWidget 
  widgetType="StatisticsWidget" 
  lazyLoad={false}
  {...props}
/>

// Below the fold (viewport-based loading)
<LazyWidget 
  widgetType="ActivityLogWidget" 
  lazyLoad={true}
  height="400px"
  {...props}
/>
```

### 3. Track Performance

```javascript
import { trackChartLoad, trackWidgetLoad } from './utils/performanceMonitoring';

const startTime = performance.now();
// ... load component ...
trackChartLoad('UsersChartWidget', startTime);
```

## Available Components

### Lazy Chart Widgets

- `UsersChartWidget` - User statistics chart
- `JobsChartWidget` - Jobs and applications chart
- `CoursesChartWidget` - Courses and enrollments chart
- `ReviewsChartWidget` - Reviews and ratings chart
- `RevenueChartWidget` - Revenue trends chart

### Lazy Widgets

- `StatisticsWidget` - Real-time statistics
- `ActivityLogWidget` - Activity log entries
- `NotificationCenter` - Admin notifications
- `RecentUsersWidget` - Recent users list
- `RecentJobsWidget` - Recent jobs list
- `RecentApplicationsWidget` - Recent applications list
- `FlaggedReviewsWidget` - Flagged reviews list
- `ExportModal` - Data export modal

## Performance Targets

| Metric | Target |
|--------|--------|
| Dashboard Load | < 2s |
| FCP | < 1.8s |
| LCP | < 2.5s |
| CLS | < 0.1 |
| TTI | < 3.8s |
| Chart Load | < 1s |
| Widget Load | < 500ms |

## Testing

```bash
# Build and analyze
npm run build
npm run measure:bundle

# Run Lighthouse
npm run lighthouse:local

# Preview production
npm run preview
```

## Troubleshooting

### Slow Dashboard Load

1. Check Network tab - parallel loading?
2. Check Performance tab - blocking JavaScript?
3. Check console - component warnings?

**Fix**: Enable lazy loading for all charts/widgets

### Large Bundle Size

1. Run `npm run measure:bundle`
2. Open `build/stats.html`
3. Identify large chunks

**Fix**: Move large libraries to vendor chunks

### Slow Chart Loading

1. Check console for load time warnings
2. Check Network tab for charts-vendor size
3. Check if Chart.js is in separate chunk

**Fix**: Use viewport-based loading for below-the-fold charts

## Best Practices

✅ **DO**:
- Use `LazyChartWidget` for all charts
- Use `LazyWidget` for all widgets
- Enable `lazyLoad={true}` for below-the-fold widgets
- Track performance with monitoring utility
- Run Lighthouse audits regularly

❌ **DON'T**:
- Import chart/widget components directly
- Load all widgets immediately
- Ignore performance warnings
- Skip bundle size analysis

## Checklist

- [ ] All charts use `LazyChartWidget`
- [ ] All widgets use `LazyWidget`
- [ ] Below-the-fold widgets have `lazyLoad={true}`
- [ ] Bundle size < 500KB
- [ ] Lighthouse Performance > 90
- [ ] Dashboard loads < 2s
- [ ] No console warnings

## More Information

See `ADMIN_DASHBOARD_PERFORMANCE_OPTIMIZATION.md` for detailed guide.

---

**Task**: 29.3 (Optimize frontend performance)  
**Requirements**: 11.1 (Dashboard load within 2 seconds)
