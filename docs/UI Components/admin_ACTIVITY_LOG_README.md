# Activity Log Widget Implementation

## Overview

The Activity Log Widget provides a comprehensive view of all platform activities with advanced filtering, search, and real-time updates. This implementation fulfills Requirements 5.11-5.14 from the admin dashboard enhancements specification.

## Components

### 1. ActivityLogWidget

A compact widget component for displaying recent activity entries.

**Features:**
- Display recent activity entries in a list format
- Filter by action type, user ID, and date range
- Text search functionality
- Pagination support (configurable entries per page)
- Real-time updates via Pusher
- Multi-language support (Arabic, English, French)
- Dark mode support
- RTL layout support

**Props:**
- `maxEntries` (number, default: 10) - Maximum entries to display per page
- `showFilters` (boolean, default: true) - Show/hide filter controls
- `showSearch` (boolean, default: true) - Show/hide search input

**Usage:**
```jsx
import { ActivityLogWidget } from '../components/admin';

<ActivityLogWidget 
  maxEntries={10}
  showFilters={true}
  showSearch={true}
/>
```

### 2. ActivityLogPage

A full-page component for comprehensive activity log management.

**Features:**
- All features of ActivityLogWidget
- Advanced filtering options (includes target type)
- Statistics dashboard (total logs, breakdown by type)
- Export functionality (Excel format)
- Sorting options (by timestamp, actor, action type)
- Configurable page size (25, 50, 100 entries)
- Table view with all activity details

**Usage:**
```jsx
import ActivityLogPage from '../pages/ActivityLogPage';

// In your router
<Route path="/activity-log" element={<ActivityLogPage />} />
```

## API Integration

### Endpoints Used

1. **GET /api/admin/activity-log**
   - Fetches activity logs with pagination and filtering
   - Query parameters: page, limit, actionType, actorId, targetType, startDate, endDate, sortBy, sortOrder

2. **GET /api/admin/activity-log/search**
   - Text search in activity logs
   - Query parameters: q (search term), page, limit, actionType, startDate, endDate

3. **GET /api/admin/activity-log/stats**
   - Fetches activity log statistics
   - Query parameters: startDate, endDate

4. **POST /api/admin/export/activity-log**
   - Exports activity log to Excel
   - Body: format, dateRange, filters

## Activity Types

The following activity types are supported:

| Type | Description | Color |
|------|-------------|-------|
| `user_registered` | New user registration | Green (#10B981) |
| `job_posted` | New job posting | Blue (#3B82F6) |
| `application_submitted` | Job application submitted | Purple (#8B5CF6) |
| `application_status_changed` | Application status updated | Orange (#F59E0B) |
| `course_published` | New course published | Cyan (#06B6D4) |
| `course_enrolled` | User enrolled in course | Teal (#14B8A6) |
| `review_posted` | New review posted | Pink (#EC4899) |
| `content_reported` | Content reported | Red (#EF4444) |
| `user_modified` | User data modified | Orange (#F97316) |
| `content_deleted` | Content deleted | Dark Red (#DC2626) |

## Real-time Updates

Both components support real-time updates via Pusher:

```javascript
// Pusher event: 'pusher-activity-log'
// Event data structure:
{
  _id: string,
  timestamp: Date,
  actorId: string,
  actorName: string,
  actionType: string,
  targetType: string,
  targetId: string,
  details: string,
  ipAddress: string
}
```

When a new activity is logged, it automatically appears in the widget without requiring a page refresh.

## Filtering

### Available Filters

1. **Action Type** - Filter by specific activity type
2. **User ID** - Filter by actor (user who performed the action)
3. **Target Type** - Filter by target entity type (ActivityLogPage only)
4. **Date Range** - Filter by start and end dates
5. **Search** - Text search across actor names and details

### Filter Combinations

All filters can be combined for precise results:

```javascript
// Example: Find all job postings by user 'user123' in January 2024
{
  actionType: 'job_posted',
  actorId: 'user123',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
}
```

## Pagination

- Default page size: 50 entries (ActivityLogWidget: 10)
- Configurable page sizes: 25, 50, 100 (ActivityLogPage only)
- Navigation: Previous/Next buttons
- Page indicator: "Page X of Y"
- Total entries count displayed

## Styling

### Color Palette

- Primary (Navy): #304B60
- Secondary (Beige): #E3DAD1
- Accent (Copper): #D48161
- Background: #F9FAFB
- Text: #4B5563

### Dark Mode

All components support dark mode with appropriate color adjustments:
- Background: #1F2937
- Text: #F9FAFB
- Borders: #374151

### Responsive Design

- Mobile (< 640px): Stacked layout, simplified filters
- Tablet (640px - 1023px): Adjusted grid layout
- Desktop (>= 1024px): Full layout with all features

## Testing

Comprehensive unit tests are provided in `__tests__/ActivityLogWidget.test.jsx`:

### Test Coverage

1. **Basic Rendering** (5 tests)
   - Widget title display
   - Loading state
   - Activity entries display
   - Total count display

2. **Filtering by Multiple Criteria** (6 tests)
   - Action type filter
   - User ID filter
   - Date range filter
   - Combined filters
   - Clear filters

3. **Search with Special Characters** (3 tests)
   - Special characters (@#$%)
   - Quotes
   - Unicode characters (Arabic, etc.)

4. **Pagination with Large Dataset** (6 tests)
   - Pagination controls display
   - Next page navigation
   - Previous page navigation
   - Button states (disabled/enabled)
   - Large datasets (1000+ entries)

5. **Error Handling** (3 tests)
   - Network errors
   - Retry functionality
   - Empty data state

6. **Real-time Updates** (2 tests)
   - Pusher event handling
   - Disconnected state

7. **Internationalization** (2 tests)
   - Arabic translation
   - French translation

### Running Tests

```bash
cd frontend
npm test -- ActivityLogWidget.test.jsx
```

## Performance Considerations

1. **Pagination** - Limits data fetched per request (default: 50 entries)
2. **Debouncing** - Search input changes trigger fetch after user stops typing
3. **Caching** - Backend uses caching for frequently accessed data
4. **Lazy Loading** - Only visible entries are rendered
5. **Real-time Updates** - Efficient Pusher integration with minimal overhead

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast colors (WCAG AA compliant)
- Focus indicators on all interactive elements

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Filters**
   - Filter by IP address range
   - Filter by metadata fields
   - Saved filter presets

2. **Visualizations**
   - Activity timeline chart
   - Heatmap of activity by hour/day
   - Top actors/targets charts

3. **Export Options**
   - CSV format
   - PDF format with charts
   - Scheduled exports

4. **Notifications**
   - Alert on specific activity types
   - Threshold-based notifications
   - Email digests

5. **Audit Trail**
   - Detailed change tracking
   - Before/after comparisons
   - Rollback capabilities

## Troubleshooting

### Common Issues

1. **No activities displayed**
   - Check API endpoint is accessible
   - Verify authentication token is valid
   - Check browser console for errors

2. **Real-time updates not working**
   - Verify Pusher credentials are configured
   - Check Pusher connection status
   - Ensure WebSocket is not blocked by firewall

3. **Filters not working**
   - Clear browser cache
   - Check API query parameters in network tab
   - Verify filter values are valid

4. **Export fails**
   - Check export endpoint is accessible
   - Verify sufficient permissions
   - Check date range is valid

## Support

For issues or questions:
- Check the main README.md
- Review the design document
- Contact the development team

## License

This component is part of the Careerak admin dashboard enhancements feature.
