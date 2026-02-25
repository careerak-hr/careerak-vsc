# Chart Components - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (1 minute)

```bash
cd frontend
npm install chart.js@^4.4.0 react-chartjs-2@^5.2.0
```

### Step 2: Import Components (30 seconds)

```jsx
import {
  UsersChartWidget,
  JobsChartWidget,
  CoursesChartWidget,
  ReviewsChartWidget,
  RevenueChartWidget
} from './components/admin';
```

### Step 3: Use in Your Dashboard (1 minute)

```jsx
function AdminDashboard() {
  return (
    <div className="dashboard-grid">
      <UsersChartWidget timeRange="daily" />
      <JobsChartWidget timeRange="weekly" />
      <CoursesChartWidget timeRange="monthly" />
    </div>
  );
}
```

### Step 4: Run Tests (1 minute)

```bash
npm test -- ChartWidget
```

### Step 5: Build and Deploy (1 minute)

```bash
npm run build
```

---

## 📊 Available Charts

| Component | Type | Data | API Endpoint |
|-----------|------|------|--------------|
| UsersChartWidget | Line | New users, Total users | `/api/admin/statistics/users` |
| JobsChartWidget | Bar | Jobs posted, Applications | `/api/admin/statistics/jobs` |
| CoursesChartWidget | Line | Courses, Enrollments, Completions | `/api/admin/statistics/courses` |
| ReviewsChartWidget | Line | Review count, Average rating | `/api/admin/statistics/reviews` |
| RevenueChartWidget | Line | Revenue trends | `/api/admin/statistics/revenue` |

---

## 🎨 Customization

### Change Chart Type

```jsx
<ChartWidget
  type="bar"  // line, bar, pie, doughnut
  data={myData}
  title="My Chart"
/>
```

### Custom Time Range

```jsx
<UsersChartWidget 
  timeRange="monthly"  // daily, weekly, monthly
/>
```

### Custom Height

```jsx
<ChartWidget
  height={400}  // default: 300
  data={myData}
  title="Tall Chart"
/>
```

### Custom Options

```jsx
<ChartWidget
  data={myData}
  title="Custom Chart"
  options={{
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }}
/>
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test -- ChartWidget
```

### Run Property Tests Only

```bash
npm test -- ChartWidget.property.test
```

### Run Unit Tests Only

```bash
npm test -- ChartWidget.unit.test
```

---

## 🐛 Troubleshooting

### "Chart.js not found"

```bash
npm install chart.js react-chartjs-2
```

### "No data available"

Check that your API endpoint returns data in this format:

```json
{
  "labels": ["Jan", "Feb", "Mar"],
  "newUsers": [10, 20, 30],
  "totalUsers": [100, 120, 150]
}
```

### Charts not rendering

1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check authentication token is valid

---

## 📚 More Information

- **Full Documentation:** `docs/CHART_COMPONENTS_IMPLEMENTATION.md`
- **Component README:** `frontend/src/components/admin/CHARTS_README.md`
- **Design Spec:** `.kiro/specs/admin-dashboard-enhancements/design.md`

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Components imported
- [ ] Charts rendering correctly
- [ ] Tests passing
- [ ] API endpoints working
- [ ] Time range selector functional
- [ ] Tooltips showing on hover
- [ ] Legend toggles working

---

**Need Help?** Check the full documentation or run the tests to see examples.
