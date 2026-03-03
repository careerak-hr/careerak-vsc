# E2E Tests Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Setup Test Environment

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Set up test database connection
# Add to .env or .env.test:
MONGODB_TEST_URI=mongodb://localhost:27017/careerak-test
```

### 2. Run All E2E Tests

```bash
npm test -- tests/e2e
```

**Expected Output**:
```
PASS  tests/e2e/admin-dashboard-layout-persistence.e2e.test.js
PASS  tests/e2e/admin-export-data.e2e.test.js
PASS  tests/e2e/admin-notifications.e2e.test.js
PASS  tests/e2e/admin-activity-log.e2e.test.js
PASS  tests/e2e/admin-generate-export-report.e2e.test.js

Test Suites: 5 passed, 5 total
Tests:       80+ passed, 80+ total
```

### 3. Run Individual Test

```bash
# Test dashboard layout persistence
npm test -- tests/e2e/admin-dashboard-layout-persistence.e2e.test.js

# Test data export
npm test -- tests/e2e/admin-export-data.e2e.test.js

# Test notifications
npm test -- tests/e2e/admin-notifications.e2e.test.js

# Test activity log
npm test -- tests/e2e/admin-activity-log.e2e.test.js

# Test report generation
npm test -- tests/e2e/admin-generate-export-report.e2e.test.js
```

---

## 📋 What Each Test Does

### 1. Dashboard Layout Persistence
**Tests**: Layout customization, widget operations, persistence across sessions

**Key Scenarios**:
- Add/remove widgets
- Resize and rearrange widgets
- Save layout
- Logout and login
- Verify layout persisted

---

### 2. Data Export
**Tests**: Export data in multiple formats with filters

**Key Scenarios**:
- Export users (Excel, CSV, PDF)
- Export jobs with filters
- Export applications with date range
- Export courses
- Export activity log

---

### 3. Notifications
**Tests**: Notification management and preferences

**Key Scenarios**:
- View notifications
- Mark as read
- Filter by type/priority/status
- Update preferences
- Set quiet hours

---

### 4. Activity Log
**Tests**: Activity log search and filtering

**Key Scenarios**:
- View activity log
- Search by keyword
- Filter by action/type/date
- Pagination
- Export activity log

---

### 5. Report Generation
**Tests**: Generate and export reports

**Key Scenarios**:
- Generate users report
- Generate jobs report
- Generate courses report
- Generate reviews report
- Export reports in multiple formats

---

## 🔍 Troubleshooting

### Test Fails: "Cannot connect to MongoDB"
**Solution**: Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongosh

# Or start MongoDB service
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod
```

### Test Fails: "Authentication failed"
**Solution**: Check JWT_SECRET in .env
```bash
# Add to .env
JWT_SECRET=your_secret_key_here
```

### Test Timeout
**Solution**: Increase Jest timeout
```bash
# Run with longer timeout
npm test -- tests/e2e --testTimeout=30000
```

### Database Not Cleaned
**Solution**: Manually clear test database
```bash
mongosh careerak-test --eval "db.dropDatabase()"
```

---

## 📊 Test Coverage

Run tests with coverage report:
```bash
npm test -- tests/e2e --coverage
```

**Expected Coverage**:
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

---

## 🎯 Best Practices

1. **Run tests before committing**: Ensure all tests pass
2. **Run tests before deployment**: Verify critical flows work
3. **Check test output**: Review any warnings or errors
4. **Keep tests updated**: Update tests when features change
5. **Add new tests**: Add tests for new critical flows

---

## 📚 More Information

- **Detailed Guide**: See `README_E2E_TESTS.md`
- **Test Summary**: See `E2E_TESTS_SUMMARY.md`
- **Individual Tests**: Check inline comments in test files

---

## ✅ Success Criteria

All tests should pass with:
- ✅ No errors
- ✅ No warnings (except security warnings in test mode)
- ✅ All assertions passing
- ✅ Reasonable execution time (<5 minutes total)

---

**Need Help?** Check the detailed documentation in `README_E2E_TESTS.md`
