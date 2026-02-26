# End-to-End Tests for Admin Dashboard

This directory contains comprehensive end-to-end tests that validate complete user workflows in the admin dashboard.

## Test Files

### 1. admin-dashboard-layout-persistence.e2e.test.js
**Flow**: Admin login → view dashboard → customize layout → logout → login → verify layout

**Tests**:
- Complete layout persistence flow
- Widget operations (add, remove, resize, rearrange)
- Layout reset functionality
- Authentication and authorization

**Validates**: Requirements 4.1-4.10, 11.5, 11.6

---

### 2. admin-export-data.e2e.test.js
**Flow**: Admin login → apply filters → export data → verify export

**Tests**:
- Export users data (Excel, CSV, PDF)
- Export jobs data with filters
- Export applications data
- Export courses data
- Export activity log
- Date range filtering
- Format validation

**Validates**: Requirements 3.1-3.9, 11.5, 11.6

---

### 3. admin-notifications.e2e.test.js
**Flow**: Admin login → view notifications → click notification → verify navigation

**Tests**:
- View unread notifications
- Mark notification as read
- Mark all as read
- Navigate to action URL
- Real-time notification updates (Pusher)
- Notification preferences

**Validates**: Requirements 6.8-6.12, 11.5, 11.6

---

### 4. admin-activity-log.e2e.test.js
**Flow**: Admin login → view activity log → search and filter → verify results

**Tests**:
- View recent activity
- Search by keyword
- Filter by type, user, date
- Pagination
- Real-time activity updates (Pusher)
- Export activity log

**Validates**: Requirements 5.11-5.14, 11.5, 11.6

---

### 5. admin-generate-export-report.e2e.test.js (NEW)
**Flow**: Admin login → generate report → export report → verify data

**Tests**:
- Generate users report
- Generate jobs report
- Generate courses report
- Generate reviews report
- Export reports (Excel, CSV, PDF)
- Date range filtering
- Data accuracy verification

**Validates**: Requirements 7.1-7.8, 3.1-3.9, 11.5, 11.6

---

## Running E2E Tests

### Run all E2E tests:
```bash
cd backend
npm test -- tests/e2e
```

### Run specific E2E test:
```bash
npm test -- tests/e2e/admin-dashboard-layout-persistence.e2e.test.js
```

### Run with coverage:
```bash
npm test -- tests/e2e --coverage
```

## Test Environment

- **Database**: MongoDB test database (`careerak-test`)
- **Authentication**: JWT tokens generated for test users
- **Data**: Test data created in `beforeEach` hooks
- **Cleanup**: All test data cleared after each test

## Test Structure

Each E2E test follows this structure:

1. **Setup** (`beforeEach`):
   - Clear test database
   - Create admin user
   - Generate authentication token
   - Create test data

2. **Test Execution**:
   - Simulate complete user workflow
   - Make API requests in sequence
   - Verify responses at each step

3. **Assertions**:
   - Verify data persistence
   - Verify business logic
   - Verify authentication/authorization
   - Verify error handling

4. **Cleanup** (`afterEach`):
   - Clear test data
   - Close database connections

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Always clean up test data to avoid interference
3. **Realistic**: Tests simulate real user workflows
4. **Comprehensive**: Cover happy paths and error cases
5. **Fast**: Use test database and minimal data
6. **Maintainable**: Clear test names and comments

## Coverage Goals

- ✅ All critical user workflows
- ✅ Authentication and authorization
- ✅ Data persistence
- ✅ Error handling
- ✅ Business logic validation

## Notes

- E2E tests are slower than unit tests (use sparingly)
- Run E2E tests before deployment
- Keep E2E tests focused on critical workflows
- Use integration tests for API endpoint testing
- Use unit tests for business logic testing
