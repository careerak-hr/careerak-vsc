# Apply Page Integration Tests

## Overview

Comprehensive integration tests for the Apply Page Enhancements feature that verify complete end-to-end flows.

## Test Coverage

### 1. Complete Submission Flow
- ✅ Load user profile and verify auto-fill
- ✅ Create draft with auto-filled data
- ✅ Update draft through multiple steps
- ✅ Submit final application
- ✅ Verify draft deletion after submission
- ✅ Verify application saved correctly

### 2. Draft Save/Restore Flow
- ✅ Save draft with form data
- ✅ Restore draft and verify data preservation
- ✅ Update draft with modifications
- ✅ Handle concurrent draft updates

### 3. File Upload Flow
- ✅ Upload files and associate with draft
- ✅ Include files in final submission
- ✅ Handle file removal
- ✅ Enforce 10 file limit

### 4. Status Update Flow
- ✅ Update application status
- ✅ Maintain status history
- ✅ Send notifications on status change
- ✅ Verify timestamps

### 5. Withdrawal Flow
- ✅ Allow withdrawal for Submitted/Reviewed status
- ✅ Prevent withdrawal for Shortlisted status
- ✅ Prevent withdrawal for Accepted status
- ✅ Prevent withdrawal for Rejected status
- ✅ Update status history on withdrawal

### 6. Error Scenarios
- ✅ Handle invalid data gracefully
- ✅ Validate required fields
- ✅ Validate custom question answers

## Running the Tests

### Prerequisites
```bash
# Install dependencies
cd backend
npm install

# Set up test database
export MONGODB_TEST_URI="mongodb://localhost:27017/careerak-test"
```

### Run All Integration Tests
```bash
npm test -- apply-page-integration.test.js
```

### Run Specific Test Suite
```bash
# Complete submission flow
npm test -- apply-page-integration.test.js -t "Complete Submission Flow"

# Draft save/restore
npm test -- apply-page-integration.test.js -t "Draft Save/Restore Flow"

# File upload
npm test -- apply-page-integration.test.js -t "File Upload Flow"

# Status updates
npm test -- apply-page-integration.test.js -t "Status Update Flow"

# Withdrawal
npm test -- apply-page-integration.test.js -t "Withdrawal Flow"
```

### Run with Coverage
```bash
npm test -- apply-page-integration.test.js --coverage
```

## Test Data

### Test User
- Email: test@example.com
- Password: password123
- UserType: Employee
- Has education, experience, skills, and languages

### Test Job Posting
- Title: Test Job
- Company: Test Company
- Has 1 required custom question

## Mocking Requirements

### Cloudinary Service
The file upload tests assume Cloudinary integration is mocked or configured. In production:
- Mock `FileUploadService.uploadFile()`
- Mock `FileUploadService.deleteFile()`
- Return simulated file data

### Notification Service
The status update tests assume notification service is available. In production:
- Mock `NotificationService.send()`
- Verify notification calls

### Pusher Service
Real-time updates assume Pusher is configured. In production:
- Mock `PusherService.trigger()`
- Verify event emissions

## Expected Results

All tests should pass:
```
PASS  backend/tests/apply-page-integration.test.js
  Apply Page Integration Tests
    Complete Submission Flow
      ✓ should complete full application submission from start to finish
    Draft Save/Restore Flow
      ✓ should save draft, restore it, and preserve all data
      ✓ should handle concurrent draft updates correctly
    File Upload Flow
      ✓ should upload files, associate with draft, and include in submission
      ✓ should handle file removal correctly
      ✓ should enforce 10 file limit
    Status Update Flow
      ✓ should update status and maintain history
      ✓ should send notifications on status change
    Withdrawal Flow
      ✓ should allow withdrawal for Submitted status
      ✓ should prevent withdrawal for Shortlisted status
      ✓ should prevent withdrawal for Accepted status
      ✓ should prevent withdrawal for Rejected status
    Error Scenarios
      ✓ should handle network failure during draft save gracefully
      ✓ should validate required fields on submission
      ✓ should validate custom question answers

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

## Troubleshooting

### Database Connection Issues
```bash
# Ensure MongoDB is running
mongod --dbpath /path/to/test/db

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

### Authentication Errors
- Verify JWT_SECRET is set in test environment
- Check token generation in User model

### Validation Errors
- Review model schemas
- Check required fields match test data

## Next Steps

After integration tests pass:
1. Run property-based tests (tasks 2.2, 3.2, 3.3, etc.)
2. Run unit tests for individual components
3. Perform manual testing on staging environment
4. Run accessibility tests
5. Run performance tests

## Related Documentation

- Design Document: `.kiro/specs/apply-page-enhancements/design.md`
- Requirements: `.kiro/specs/apply-page-enhancements/requirements.md`
- Tasks: `.kiro/specs/apply-page-enhancements/tasks.md`
