# Admin Dashboard Components

This directory contains the base components for the admin dashboard enhancements feature.

## Components

### DashboardContainer

Main container component that manages the overall dashboard state and layout.

**Features:**
- Layout state management
- Edit mode toggle
- Theme switching (light/dark)
- Pusher client connection for real-time updates
- RTL support for Arabic

**Props:**
- `adminId` (string, required): The admin user ID
- `role` (string, optional): Admin role ('admin' or 'moderator'), defaults to 'admin'
- `children` (ReactNode): Child components to render

**Requirements:** 4.1-4.10, 10.2, 10.3, 10.9

**Usage:**
```jsx
import { DashboardContainer } from './components/admin';

<DashboardContainer adminId="admin-123" role="admin">
  <WidgetContainer dashboardContext={dashboardContext}>
    {/* Your widgets here */}
  </WidgetContainer>
</DashboardContainer>
```

### WidgetContainer

Container for draggable and resizable dashboard widgets using react-grid-layout.

**Features:**
- Drag-and-drop with react-grid-layout
- Resize handling
- Add/remove widget functionality
- Widget configuration modal

**Props:**
- `dashboardContext` (object, required): Context from DashboardContainer
- `availableWidgets` (array, optional): Array of available widget types
- `onLayoutChange` (function, optional): Callback when layout changes
- `children` (ReactNode): Widget components to render

**Requirements:** 4.1-4.7

**Usage:**
```jsx
import { WidgetContainer } from './components/admin';

<WidgetContainer 
  dashboardContext={dashboardContext}
  onLayoutChange={(newLayout) => console.log('Layout changed:', newLayout)}
>
  {/* Your widget components */}
</WidgetContainer>
```

## Available Widget Types

The following widget types are supported:

1. `quick_stats` - Quick statistics overview
2. `user_chart` - User statistics chart
3. `job_chart` - Job postings chart
4. `course_chart` - Course statistics chart
5. `review_chart` - Review statistics chart
6. `recent_users` - Recent users list
7. `recent_jobs` - Recent job postings
8. `recent_applications` - Recent applications
9. `activity_log` - Activity log widget
10. `flagged_reviews` - Flagged reviews list
11. `notifications` - Notifications widget

## Theme Support

Both components support light and dark themes:

- **Light Theme**: Uses project color palette (#304B60, #E3DAD1, #D48161)
- **Dark Theme**: Adapted colors for dark mode

Theme is automatically applied to all child components.

## RTL Support

Full RTL (Right-to-Left) support for Arabic language:

- Direction is automatically set based on language
- All layouts are mirrored appropriately
- Text alignment is adjusted

## Real-Time Updates

DashboardContainer integrates with Pusher for real-time updates:

- Statistics updates every 30 seconds
- Notifications in real-time
- Activity log updates in real-time

## Testing

Unit tests are provided in `__tests__/DashboardContainer.test.jsx`:

- Theme switching tests
- Edit mode toggle tests
- RTL layout tests
- Loading and error state tests

Run tests with:
```bash
npm test -- DashboardContainer.test.jsx
```

## Dependencies

- `react` ^18.0.0
- `react-grid-layout` ^1.3.4
- `react-resizable` ^3.0.4
- `pusher-js` (via utils/pusherClient)

## API Integration

Components integrate with the following API endpoints:

- `GET /api/admin/dashboard/layout` - Load dashboard layout
- `PUT /api/admin/dashboard/layout` - Save dashboard layout
- `POST /api/admin/dashboard/layout/reset` - Reset to default layout

## Styling

CSS files use CSS variables for theming:

- `--dashboard-bg`: Background color
- `--dashboard-text`: Text color
- `--dashboard-header-bg`: Header background
- `--dashboard-accent`: Accent color (#D48161)
- `--dashboard-border`: Border color
- `--dashboard-card-bg`: Card background

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

After implementing these base components, you can:

1. Create specific widget components (ChartWidget, StatisticsWidget, etc.)
2. Implement chart components with Chart.js
3. Add export functionality
4. Implement notification center
5. Add user management pages

## Related Files

- Design Document: `.kiro/specs/admin-dashboard-enhancements/design.md`
- Requirements: `.kiro/specs/admin-dashboard-enhancements/requirements.md`
- Tasks: `.kiro/specs/admin-dashboard-enhancements/tasks.md`
