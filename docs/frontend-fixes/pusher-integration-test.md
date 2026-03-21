# Pusher Integration Testing Plan
## Apply Page Enhancements Feature

**Status**: ✅ Ready for Testing  
**Date**: 2026-03-04  
**Requirements**: 5.5 (Real-time status updates via Pusher)

---

## Overview

This document outlines the comprehensive testing plan for Pusher integration in the Apply Page Enhancements feature. The integration enables real-time status updates for job applications, ensuring applicants receive immediate notifications when their application status changes.

---

## Test Environment Setup

### Prerequisites

1. **Backend Configuration**:
   ```env
   PUSHER_APP_ID=your_app_id
   PUSHER_KEY=your_key
   PUSHER_SECRET=your_secret
   PUSHER_CLUSTER=eu
   ```

2. **Frontend Configuration**:
   ```env
   VITE_PUSHER_KEY=your_key
   VITE_PUSHER_CLUSTER=eu
   ```

3. **Dependencies Installed**:
   - Backend: `pusher` package
   - Frontend: `pusher-js` package

4. **Services Running**:
   - Backend API server
   - Frontend development server
   - MongoDB database

---

## Test Scenarios

### 1. Pusher Service Initialization

**Objective**: Verify Pusher service initializes correctly on backend

**Test Steps**:
```bash
# Backend test
cd backend
node -e "
const pusherService = require('./src/services/pusherService');
pusherService.initialize();
console.log('Pusher enabled:', pusherService.isEnabled());
console.log('Test passed:', pusherService.isEnabled() === true);
"
```

**Expected Result**:
- ✅ Pusher initializes successfully
- ✅ `isEnabled()` returns `true`
- ✅ No error messages in console
- ✅ Log shows: "✅ Pusher initialized successfully"

**Actual Result**: _[To be filled during testing]_

---

### 2. Pusher Client Initialization

**Objective**: Verify Pusher client initializes correctly on frontend

**Test Steps**:
1. Open browser console
2. Navigate to application page
3. Login as a user
4. Check console for Pusher initialization

**Expected Result**:
- ✅ Console shows: "✅ Pusher client initialized"
- ✅ Console shows: "✅ Subscribed to private-user-{userId}"
- ✅ No connection errors
- ✅ `pusherClient.isConnected()` returns `true`

**Actual Result**: _[To be filled during testing]_

---

### 3. Application Status Update - Real-time Notification

**Objective**: Verify applicant receives real-time notification when application status changes

**Test Steps**:

**Setup**:
1. User A (Employee) submits a job application
2. Note the application ID
3. Keep User A's browser open on the application details page

**Execution**:
1. User B (HR/Admin) logs in
2. Navigate to the application
3. Update status from "Submitted" to "Reviewed"
4. Observe User A's browser

**Expected Result**:
- ✅ User A receives notification within 1-2 seconds
- ✅ Status timeline updates automatically (no page refresh)
- ✅ Browser notification appears (if permission granted)
- ✅ In-app notification shows status change
- ✅ Console shows: "Received notification: {data}"

**Actual Result**: _[To be filled during testing]_

---

### 4. Multiple Status Changes

**Objective**: Verify multiple status updates are received correctly

**Test Steps**:
1. HR updates application status: Submitted → Reviewed
2. Wait 5 seconds
3. HR updates status: Reviewed → Shortlisted
4. Wait 5 seconds
5. HR updates status: Shortlisted → Interview Scheduled

**Expected Result**:
- ✅ All 3 status changes received in real-time
- ✅ Status timeline shows all transitions
- ✅ Timestamps are accurate
- ✅ No duplicate notifications
- ✅ Notifications arrive in correct order

**Actual Result**: _[To be filled during testing]_

---

### 5. Channel Subscription

**Objective**: Verify correct channel subscription for application notifications

**Test Steps**:
```javascript
// In browser console (after login)
console.log('Subscribed channels:', pusherClient.subscribedChannels);
console.log('User channel:', pusherClient.subscribedChannels.has('private-user-{userId}'));
```

**Expected Result**:
- ✅ User is subscribed to `private-user-{userId}` channel
- ✅ Channel subscription is authenticated
- ✅ No subscription errors in console

**Actual Result**: _[To be filled during testing]_

---

### 6. Notification Permission Handling

**Objective**: Verify notification permission request and handling

**Test Steps**:

**Test 6.1 - Permission Granted**:
1. Clear browser data (reset permission)
2. Login to application
3. Grant notification permission when prompted
4. Trigger a status update

**Expected Result**:
- ✅ Permission request appears
- ✅ After granting, browser notifications work
- ✅ Console shows: "✅ Notification permission granted"

**Test 6.2 - Permission Denied**:
1. Clear browser data
2. Login to application
3. Deny notification permission
4. Trigger a status update

**Expected Result**:
- ✅ In-app notification still appears (fallback)
- ✅ No browser notification (expected)
- ✅ Console shows: "Notification permission denied"
- ✅ Application continues to work normally

**Actual Result**: _[To be filled during testing]_

---

### 7. Offline/Online Behavior

**Objective**: Verify Pusher handles network disconnection gracefully

**Test Steps**:
1. User is logged in with active Pusher connection
2. Disconnect network (airplane mode or disable WiFi)
3. Wait 10 seconds
4. Reconnect network
5. Trigger a status update

**Expected Result**:
- ✅ Pusher detects disconnection
- ✅ Pusher automatically reconnects when network restored
- ✅ Notifications resume after reconnection
- ✅ No errors or crashes
- ✅ Console shows reconnection logs

**Actual Result**: _[To be filled during testing]_

---

### 8. Multiple Browser Tabs

**Objective**: Verify notifications work across multiple tabs

**Test Steps**:
1. Login as User A in Tab 1
2. Open Tab 2 with same user (same browser)
3. Navigate to application details in both tabs
4. HR updates application status
5. Observe both tabs

**Expected Result**:
- ✅ Both tabs receive notification
- ✅ Both tabs update status timeline
- ✅ No duplicate Pusher connections
- ✅ Both tabs stay in sync

**Actual Result**: _[To be filled during testing]_

---

### 9. Notification Content Validation

**Objective**: Verify notification contains correct information

**Test Steps**:
1. HR updates application status to "Interview Scheduled"
2. Capture notification data in console
3. Verify notification structure

**Expected Result**:
```javascript
{
  type: 'application_reviewed', // or appropriate type
  title: 'Application Status Updated',
  message: 'Your application status has been updated to Interview Scheduled',
  relatedData: {
    jobApplication: '{applicationId}',
    jobPosting: '{jobPostingId}',
    newStatus: 'Interview Scheduled',
    oldStatus: 'Shortlisted'
  },
  priority: 'high',
  timestamp: '2026-03-04T10:30:00.000Z'
}
```

**Actual Result**: _[To be filled during testing]_

---

### 10. Notification Click Action

**Objective**: Verify clicking notification navigates to correct page

**Test Steps**:
1. Close application details page
2. Navigate to a different page (e.g., home)
3. HR updates application status
4. Browser notification appears
5. Click the notification

**Expected Result**:
- ✅ Browser opens/focuses the application tab
- ✅ Navigates to application details page
- ✅ Correct application is displayed
- ✅ URL is correct: `/applications/{applicationId}`

**Actual Result**: _[To be filled during testing]_

---

### 11. Pusher Authentication

**Objective**: Verify Pusher channel authentication works correctly

**Test Steps**:
1. Login as User A
2. Check network tab for Pusher auth request
3. Verify auth endpoint is called
4. Check response

**Expected Result**:
- ✅ Auth request to `/api/chat/pusher/auth`
- ✅ Request includes Authorization header
- ✅ Response includes auth signature
- ✅ Channel subscription succeeds
- ✅ Status code: 200

**Actual Result**: _[To be filled during testing]_

---

### 12. Error Handling - Invalid Credentials

**Objective**: Verify graceful handling of invalid Pusher credentials

**Test Steps**:
1. Temporarily set invalid `VITE_PUSHER_KEY` in frontend
2. Reload application
3. Observe console and behavior

**Expected Result**:
- ✅ Console shows warning about invalid credentials
- ✅ Application continues to work (without real-time)
- ✅ No crashes or errors
- ✅ Fallback to polling or manual refresh

**Actual Result**: _[To be filled during testing]_

---

### 13. Performance - Message Latency

**Objective**: Measure notification delivery latency

**Test Steps**:
1. Note timestamp when HR clicks "Update Status"
2. Note timestamp when notification appears on applicant's screen
3. Calculate difference

**Expected Result**:
- ✅ Latency < 2 seconds (target: < 1 second)
- ✅ Consistent latency across multiple tests
- ✅ No significant delays

**Actual Result**: _[To be filled during testing]_

---

### 14. Concurrent Users

**Objective**: Verify Pusher handles multiple concurrent users

**Test Steps**:
1. Login as 5 different users (5 browsers/devices)
2. Each user submits an application
3. HR updates all 5 applications simultaneously
4. Observe all 5 user screens

**Expected Result**:
- ✅ All 5 users receive their respective notifications
- ✅ No cross-user notification leaks
- ✅ Each user sees only their application update
- ✅ No performance degradation

**Actual Result**: _[To be filled during testing]_

---

### 15. Unsubscribe on Logout

**Objective**: Verify Pusher unsubscribes when user logs out

**Test Steps**:
1. Login as User A
2. Verify Pusher connection in console
3. Logout
4. Check Pusher connection status

**Expected Result**:
- ✅ Pusher disconnects on logout
- ✅ Console shows: "Pusher disconnected"
- ✅ No active subscriptions remain
- ✅ No memory leaks

**Actual Result**: _[To be filled during testing]_

---

## Integration with Notification System

### Test 16: Dual Notification (Pusher + Database)

**Objective**: Verify both Pusher real-time and database notifications are created

**Test Steps**:
1. HR updates application status
2. Check applicant's notifications page
3. Check database for notification record

**Expected Result**:
- ✅ Real-time notification via Pusher (immediate)
- ✅ Database notification record created
- ✅ Notification appears in notifications list
- ✅ Both have same content and timestamp

**Actual Result**: _[To be filled during testing]_

---

## Browser Compatibility Testing

### Test 17: Cross-Browser Testing

**Browsers to Test**:
- ✅ Chrome (Desktop)
- ✅ Firefox (Desktop)
- ✅ Safari (Desktop)
- ✅ Edge (Desktop)
- ✅ Chrome (Mobile - Android)
- ✅ Safari (Mobile - iOS)

**Test Steps** (for each browser):
1. Login to application
2. Submit application
3. HR updates status
4. Verify notification received

**Expected Result**:
- ✅ Pusher works on all browsers
- ✅ Notifications display correctly
- ✅ No browser-specific errors

**Actual Result**: _[To be filled during testing]_

---

## Automated Testing

### Test 18: Unit Test - Pusher Service

**File**: `backend/tests/pusher-integration.test.js`

```javascript
const pusherService = require('../src/services/pusherService');

describe('Pusher Service', () => {
  beforeAll(() => {
    pusherService.initialize();
  });

  test('should initialize successfully', () => {
    expect(pusherService.isEnabled()).toBe(true);
  });

  test('should send notification to user', async () => {
    const userId = 'test-user-123';
    const notification = {
      type: 'application_reviewed',
      title: 'Test Notification',
      message: 'This is a test'
    };

    await expect(
      pusherService.sendNotificationToUser(userId, notification)
    ).resolves.not.toThrow();
  });

  test('should authenticate user for private channel', () => {
    const socketId = 'test-socket-123';
    const channelName = 'private-user-test-user-123';
    const userId = 'test-user-123';

    const auth = pusherService.authenticateUser(socketId, channelName, userId);
    expect(auth).toHaveProperty('auth');
  });
});
```

**Run Test**:
```bash
cd backend
npm test -- pusher-integration.test.js
```

**Expected Result**:
- ✅ All tests pass
- ✅ No errors or warnings

**Actual Result**: _[To be filled during testing]_

---

### Test 19: Integration Test - End-to-End

**File**: `backend/tests/application-status-update.integration.test.js`

```javascript
const request = require('supertest');
const app = require('../src/app');
const pusherService = require('../src/services/pusherService');

describe('Application Status Update with Pusher', () => {
  let authToken;
  let applicationId;

  beforeAll(async () => {
    // Login and get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    authToken = loginRes.body.token;

    // Create test application
    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ /* application data */ });
    
    applicationId = appRes.body.applicationId;
  });

  test('should send Pusher notification on status update', async () => {
    // Spy on Pusher service
    const spy = jest.spyOn(pusherService, 'sendNotificationToUser');

    // Update application status
    await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Reviewed' });

    // Verify Pusher was called
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        type: expect.any(String),
        title: expect.any(String),
        message: expect.any(String)
      })
    );

    spy.mockRestore();
  });
});
```

**Run Test**:
```bash
npm test -- application-status-update.integration.test.js
```

**Expected Result**:
- ✅ Test passes
- ✅ Pusher notification sent on status update

**Actual Result**: _[To be filled during testing]_

---

## Test Results Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Pusher Service Initialization | ⏳ Pending | |
| 2 | Pusher Client Initialization | ⏳ Pending | |
| 3 | Real-time Status Update | ⏳ Pending | |
| 4 | Multiple Status Changes | ⏳ Pending | |
| 5 | Channel Subscription | ⏳ Pending | |
| 6.1 | Permission Granted | ⏳ Pending | |
| 6.2 | Permission Denied | ⏳ Pending | |
| 7 | Offline/Online Behavior | ⏳ Pending | |
| 8 | Multiple Browser Tabs | ⏳ Pending | |
| 9 | Notification Content | ⏳ Pending | |
| 10 | Notification Click Action | ⏳ Pending | |
| 11 | Pusher Authentication | ⏳ Pending | |
| 12 | Invalid Credentials | ⏳ Pending | |
| 13 | Message Latency | ⏳ Pending | |
| 14 | Concurrent Users | ⏳ Pending | |
| 15 | Unsubscribe on Logout | ⏳ Pending | |
| 16 | Dual Notification | ⏳ Pending | |
| 17 | Cross-Browser | ⏳ Pending | |
| 18 | Unit Tests | ⏳ Pending | |
| 19 | Integration Tests | ⏳ Pending | |

**Legend**:
- ⏳ Pending - Not yet tested
- ✅ Passed - Test successful
- ❌ Failed - Test failed
- ⚠️ Warning - Test passed with issues

---

## Known Issues & Limitations

_[To be documented during testing]_

---

## Recommendations

1. **Before Testing**:
   - Ensure all environment variables are set correctly
   - Verify Pusher account is active and has sufficient quota
   - Test on staging environment first

2. **During Testing**:
   - Keep browser console open to monitor Pusher events
   - Use Pusher Debug Console for real-time monitoring
   - Document any unexpected behavior

3. **After Testing**:
   - Update this document with actual results
   - Create bug reports for any failures
   - Update design.md checklist

---

## Next Steps

After completing all tests:

1. ✅ Mark "Pusher integration tested" as complete in design.md
2. ✅ Update tasks.md with test results
3. ✅ Create bug tickets for any failures
4. ✅ Proceed to next testing phase (Notification system integration)

---

## References

- **Pusher Documentation**: https://pusher.com/docs
- **Pusher Debug Console**: https://dashboard.pusher.com/apps/{app_id}/debug_console
- **Backend Pusher Service**: `backend/src/services/pusherService.js`
- **Frontend Pusher Client**: `frontend/src/utils/pusherClient.js`
- **Design Document**: `.kiro/specs/apply-page-enhancements/design.md`
- **Requirements**: `.kiro/specs/apply-page-enhancements/requirements.md`

---

**Test Execution Date**: _[To be filled]_  
**Tester**: _[To be filled]_  
**Environment**: _[Development/Staging/Production]_  
**Overall Status**: ⏳ Pending
