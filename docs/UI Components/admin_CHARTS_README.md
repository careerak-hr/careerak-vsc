# Admin Dashboard Chart Components

## Overview

This directory contains chart components for the admin dashboard enhancements feature. All charts are built using Chart.js and provide interactive, real-time data visualization.

## Components

### ChartWidget (Base Component)

The base reusable chart component that supports multiple chart types.

**Features:**
- Support for line, bar, pie, and doughnut charts
- Time range selector (daily, weekly, monthly)
- Interactive tooltips with detailed information
- Legend click to toggle data series visibility
- Responsive design
- RTL support
- Dark mode support

**Usage:**
```jsx
import { ChartWidget } from './components/admin';

<ChartWidget
  type="line"
  data={chartData}
  title="Chart Title"
  timeRange="daily"
  onTimeRangeChange={handleTimeRangeChange}
  height={350}
/>
```

### UsersChartWidget

Displays user statistics over time with new users and total users trends.

**Requirements:** 1.1, 1.4

**Usage:**
```jsx
import { UsersChartWidget } from './components/admin';

<UsersChartWidget timeRange="daily" />
```

### JobsChartWidget

Displays job postings and applications over time as a bar chart.

**Requirements:** 1.2

**Usage:**
```jsx
import { JobsChartWidget } from './components/admin';

<JobsChartWidget timeRange="weekly" />
```

### CoursesChartWidget

Displays courses published, enrollments, and completions over time.

**Requirements:** 1.3

**Usage:**
```jsx
import { CoursesChartWidget } from './components/admin';

<CoursesChartWidget timeRange="monthly" />
```

### ReviewsChartWidget

Displays review count and average rating trends with dual Y-axes.

**Requirements:** 1.5

**Usage:**
```jsx
import { ReviewsChartWidget } from './components/admin';

<ReviewsChartWidget timeRange="daily" />
```

### RevenueChartWidget (Conditional)

Displays revenue trends. Only renders if revenue tracking is enabled.

**Requirements:** 1.9

**Usage:**
```jsx
import { RevenueChartWidget } from './components/admin';

<RevenueChartWidget timeRange="monthly" />
```

## Installation

Install required dependencies:

```bash
npm install chart.js react-chartjs-2
```

## Chart Data Format

All chart widgets expect data in the following format:

```javascript
{
  labels: ['Jan', 'Feb', 'Mar', ...],
  datasets: [
    {
      label: 'Dataset 1',
      data: [10, 20, 30, ...],
      borderColor: '#D48161',
      backgroundColor: 'rgba(212, 129, 97, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }
  ]
}
```

## API Integration

All specific chart widgets fetch data from the backend API:

- **Users:** `GET /api/admin/statistics/users?timeRange={daily|weekly|monthly}`
- **Jobs:** `GET /api/admin/statistics/jobs?timeRange={daily|weekly|monthly}`
- **Courses:** `GET /api/admin/statistics/courses?timeRange={daily|weekly|monthly}`
- **Reviews:** `GET /api/admin/statistics/reviews?timeRange={daily|weekly|monthly}`
- **Revenue:** `GET /api/admin/statistics/revenue?timeRange={daily|weekly|monthly}`

## Styling

All chart components use the approved color palette:
- Primary (كحلي): #304B60
- Secondary (بيج): #E3DAD1
- Accent (نحاسي): #D48161

## Accessibility

- All charts have proper ARIA labels
- Keyboard navigation support
- High contrast colors
- Screen reader friendly tooltips

## Testing

Run tests:
```bash
npm test -- ChartWidget.test.jsx
```

## Properties Validated

- **Property 1:** Chart Data Completeness (Requirements 1.1-1.7, 12.3)
- **Property 2:** Chart Interactivity (Requirements 1.6, 1.7)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lazy loading support
- Optimized re-renders
- Efficient data updates
- GPU-accelerated animations

## Future Enhancements

- Export chart as image
- Custom color themes
- More chart types (scatter, radar)
- Real-time data streaming
- Advanced filtering options
