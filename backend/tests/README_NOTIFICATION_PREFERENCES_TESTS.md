# Notification Preferences Property Tests

## Overview

This document describes the property-based tests for notification preferences (Property 18), which validate Requirement 6.12 of the admin dashboard enhancements specification.

## Test File

`backend/tests/notification-preferences.property.test.js`

## Property 18: Notification Preferences

**Property Statement:**
> For any notification type that an admin has disabled in their preferences, the system should not create notifications of that type for that admin, even when the triggering event occurs.

**Validates:** Requirements 6.12

## Test Coverage

### 1. Disabled Notification Types (Requirement 6.12)
- **Admin Notifications**: Tests that disabled admin notification types return `false` when checked
- **User Notifications**: Tests that disabled user notification types return `false` when checked
- **Test Runs**: 50 iterations each
- **Validates**: Preference enforcement for both admin and regular user notification types

### 2. Quiet Hours Enforcement (Requirement 6.12)
- **Time Detection**: Tests that the system correctly identifies when current time is within quiet hours
- **Enabled/Disabled**: Tests that quiet hours only apply when enabled
- **Test Runs**: 30 iterations
- **Validates**: Quiet hours logic including midnight-spanning periods

### 3. Preference Persistence (Requirement 6.12)
- **Cross-Session**: Tests that preferences persist across sessions
- **Multiple Types**: Tests disabling multiple notification types simultaneously
- **Test Runs**: 30 iterations
- **Validates**: Database persistence and retrieval

### 4. Enable/Disable All Notifications (Requirement 6.12)
- **Disable All**: Tests that all admin notifications can be disabled at once
- **Enable All**: Tests that all admin notifications can be enabled at once
- **Test Runs**: 20 iterations each
- **Validates**: Bulk preference updates

### 5. Push and Email Preferences (Requirement 6.12)
- **Independent Control**: Tests that push and email can be controlled independently
- **Per Type**: Tests that each notification type has separate push/email settings
- **Test Runs**: 40 iterations
- **Validates**: Granular preference control

### 6. Default Preferences (Requirement 6.12)
- **Auto-Creation**: Tests that default preferences are created for new users
- **Structure**: Tests that all required preference structures exist
- **Test Runs**: 20 iterations
- **Validates**: Default preference initialization

### 7. Notification Summary (Requirement 6.12)
- **Statistics**: Tests that summary correctly calculates enabled/disabled counts
- **Percentage**: Tests that percentage calculation is accurate
- **Test Runs**: 30 iterations
- **Validates**: Summary calculation logic

### 8. Quiet Hours Time Validation (Requirement 6.12)
- **Format Validation**: Tests that invalid time formats are rejected
- **Valid Formats**: Tests that valid HH:MM formats are accepted
- **Test Runs**: 10 iterations
- **Validates**: Input validation for time strings

### 9. Push Subscription Management (Requirement 6.12)
- **Add Subscription**: Tests that push subscriptions can be added
- **Remove Subscription**: Tests that push subscriptions can be removed
- **No Duplicates**: Tests that duplicate subscriptions are not added
- **Test Runs**: 20 iterations
- **Validates**: Push subscription lifecycle

### 10. Preference Isolation
- **User Separation**: Tests that preferences are isolated between different users
- **Independent Changes**: Tests that changing one user's preferences doesn't affect others
- **Test Runs**: 30 iterations
- **Validates**: Data isolation and security

## Test Data Generators (Arbitraries)

### Notification Types
- **Admin Types**: `user_registered`, `job_posted`, `course_published`, `review_flagged`, `content_reported`, `suspicious_activity`, `system_error`
- **User Types**: `job_match`, `application_accepted`, `application_rejected`, `application_reviewed`, `new_application`, `job_closed`, `course_match`, `system`

### User Data
- **Admin Users**: Name (3-50 chars), email, role (admin/moderator)
- **Regular Users**: Name (3-50 chars), email, role (jobSeeker/company/freelancer)

### Quiet Hours
- **Start Times**: 22:00, 23:00, 00:00, 01:00
- **End Times**: 06:00, 07:00, 08:00, 09:00
- **Enabled**: Boolean

### Push Subscriptions
- **Endpoint**: Valid web URL
- **Keys**: p256dh (20-100 chars), auth (20-100 chars)
- **Device Info**: String

## Running the Tests

### Prerequisites
- MongoDB must be running on `localhost:27017`
- Or set `MONGODB_URI` environment variable to your MongoDB instance

### Run All Tests
```bash
cd backend
npm test -- notification-preferences.property.test.js
```

### Expected Behavior
- If MongoDB is available: All tests should pass
- If MongoDB is not available: Tests will be skipped with message "Skipping test: MongoDB not available"

## Test Statistics

- **Total Test Suites**: 10
- **Total Test Cases**: 12
- **Total Property Iterations**: 390+
- **Estimated Runtime**: 60-120 seconds (with MongoDB)

## Dependencies

- `fast-check`: Property-based testing framework
- `mongoose`: MongoDB ODM
- `jest`: Test runner

## Integration with CI/CD

These tests are designed to:
1. Run automatically in CI/CD pipelines
2. Skip gracefully when MongoDB is not available
3. Provide detailed error messages on failure
4. Clean up test data after each run

## Maintenance Notes

### Adding New Notification Types
When adding new notification types:
1. Add to `adminNotificationTypeArbitrary` or `userNotificationTypeArbitrary`
2. Update the NotificationPreference model
3. Tests will automatically cover the new types

### Modifying Preference Structure
When modifying the preference structure:
1. Update the model schema
2. Update the service methods
3. Update test assertions to match new structure

## Related Files

- Model: `backend/src/models/NotificationPreference.js`
- Service: `backend/src/services/notificationPreferenceService.js`
- Design: `.kiro/specs/admin-dashboard-enhancements/design.md`
- Requirements: `.kiro/specs/admin-dashboard-enhancements/requirements.md`

## Success Criteria

All tests pass, validating that:
- ✅ Disabled notification types are not created
- ✅ Quiet hours are correctly enforced
- ✅ Preferences persist across sessions
- ✅ Bulk enable/disable operations work
- ✅ Push and email preferences are independent
- ✅ Default preferences are created automatically
- ✅ Summary statistics are accurate
- ✅ Time format validation works
- ✅ Push subscriptions are managed correctly
- ✅ Preferences are isolated between users
