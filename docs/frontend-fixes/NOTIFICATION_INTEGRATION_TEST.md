# Notification System Integration Testing - Apply Page Enhancements

## 📋 Overview

This document outlines the comprehensive testing plan for the Notification System integration with the Apply Page Enhancements feature. The notification system must properly notify users about application status changes, withdrawals, and other application-related events.

**Status**: ✅ Ready for Testing  
**Date**: 2026-03-04  
**Requirements**: 5.4, 6.4

---

## 🎯 Test Objectives

1. Verify notifications are sent for all application status changes
2. Verify notifications are sent when applications are withdrawn
3. Verify notifications respect user preferences
4. Verify notifications include correct data and links
5. Verify notification timing and delivery
6. Verify integration with Pusher for real-time updates

---

## 🧪 Test Scenarios

### Scenario 1: Application Submission Notification

**Requirement**: When an employee submits an application, the employer should receive a notification.

**Test Steps**:
1. Employee logs in and navigates to a job posting
2. Employee completes the application form (all 5 steps)
3. Employee submits the application
4. Verify employer receives notification

**Expected Results**:
- ✅ Notification created in database with type `new_application`
- ✅ Notification appears in employer's notification list
- ✅ Notification includes applicant name and job title
- ✅ Notification has priority `high`
- ✅ Notification link navigates to application details
- ✅ Pusher event sent to employer's channel
- ✅ Unread count incremented for employer

**Test Data**:
```javascript
{
  type: 'new_application',
  recipient: employerId,
  title: 'طلب توظيف جديد',
  message: 'تقدم {applicantName} لوظيفة {jobTitle}',
  relatedData: {
    jobApplication: applicationId,
    jobPosting: jobPostingId
  },
  priority: 'high'
}
```

---

### Scenario 2: Application Status Change Notifications

**Requirement**: When an employer updates application status, the applicant should receive a notification.

**Test Steps for Each Status**:

#### 2.1 Status: Reviewed
1. Employer logs in and views application
2. Employer changes status to "Reviewed"
3. Verify applicant receives notification

**Expected Results**:
- ✅ Notification type: `application_reviewed`
- ✅ Priority: `medium`
- ✅ Message includes job title
- ✅ Link to application details

#### 2.2 Status: Shortlisted
1. Employer changes status to "Shortlisted"
2. Verify applicant receives notification

**Expected Results**:
- ✅ Notification type: `application_accepted` (or custom type)
- ✅ Priority: `high`
- ✅ Congratulatory message
- ✅ Link to application details

#### 2.3 Status: Interview Scheduled
1. Employer changes status to "Interview Scheduled"
2. Verify applicant receives notification

**Expected Results**:
- ✅ Notification type: `application_accepted`
- ✅ Priority: `urgent`
- ✅ Message includes interview details (if available)
- ✅ Link to application details

#### 2.4 Status: Accepted
1. Employer changes status to "Accepted"
2. Verify applicant receives notification

**Expected Results**:
- ✅ Notification type: `application_accepted`
- ✅ Priority: `urgent`
- ✅ Congratulatory message
- ✅ Link to application details

#### 2.5 Status: Rejected
1. Employer changes status to "Rejected"
2. Verify applicant receives notification

**Expected Results**:
- ✅ Notification type: `application_rejected`
- ✅ Priority: `medium`
- ✅ Polite rejection message
- ✅ Link to application details

---

### Scenario 3: Application Withdrawal Notification

**Requirement**: When an employee withdraws an application, the employer should receive a notification.

**Test Steps**:
1. Employee logs in and views submitted application
2. Employee clicks "Withdraw" button
3. Employee confirms withdrawal in dialog
4. Verify employer receives notification

**Expected Results**:
- ✅ Notification created with type `system` or custom type
- ✅ Notification includes applicant name and job title
- ✅ Notification message: "قام {applicantName} بسحب طلبه لوظيفة {jobTitle}"
- ✅ Priority: `medium`
- ✅ Link to application details (now withdrawn)
- ✅ Pusher event sent to employer's channel

**Test Data**:
```javascript
{
  type: 'system',
  recipient: employerId,
  title: 'تم سحب طلب توظيف',
  message: 'قام {applicantName} بسحب طلبه لوظيفة {jobTitle}',
  relatedData: {
    jobApplication: applicationId,
    jobPosting: jobPostingId
  },
  priority: 'medium'
}
```

---

### Scenario 4: Notification Preferences

**Requirement**: Notifications should respect user preferences.

**Test Steps**:

#### 4.1 Disabled Notification Type
1. User disables `application_accepted` notifications in settings
2. Employer accepts user's application
3. Verify NO notification is sent

**Expected Results**:
- ✅ No notification created in database
- ✅ No Pusher event sent
- ✅ No email sent (if email notifications were enabled)

#### 4.2 Push Notification Disabled
1. User disables push notifications for `new_application`
2. User submits application
3. Verify notification created but push not sent

**Expected Results**:
- ✅ Notification created in database
- ✅ Notification appears in notification list
- ✅ No push notification sent (`pushSent: false`)

#### 4.3 Quiet Hours
1. User enables quiet hours (22:00 - 08:00)
2. Status change occurs during quiet hours
3. Verify notification is scheduled, not sent immediately

**Expected Results**:
- ✅ Notification created with `scheduledFor` timestamp
- ✅ Notification not sent immediately
- ✅ Notification sent after quiet hours end

---

### Scenario 5: Notification Content and Links

**Requirement**: Notifications should include correct data and working links.

**Test Steps**:
1. Trigger various notification types
2. Click on each notification
3. Verify navigation to correct page

**Expected Results**:

| Notification Type | Expected Link | Expected Data |
|-------------------|---------------|---------------|
| `new_application` | `/applications/:id` | Applicant name, job title |
| `application_accepted` | `/my-applications/:id` | Job title, company name |
| `application_rejected` | `/my-applications/:id` | Job title, company name |
| `application_reviewed` | `/my-applications/:id` | Job title |
| Withdrawal | `/applications/:id` | Applicant name, job title |

---

### Scenario 6: Real-time Updates with Pusher

**Requirement**: Notifications should appear in real-time without page refresh.

**Test Steps**:
1. User A (applicant) is logged in with notifications panel open
2. User B (employer) changes application status
3. Verify User A sees notification immediately

**Expected Results**:
- ✅ Notification appears in panel within 1 second
- ✅ Unread count badge updates
- ✅ Notification sound plays (if enabled)
- ✅ Browser notification shown (if permission granted)
- ✅ No page refresh required

**Pusher Events to Verify**:
```javascript
// Channel: private-user-{userId}
{
  event: 'notification',
  data: {
    id: notificationId,
    type: 'application_accepted',
    title: 'تم قبول طلبك',
    message: 'تم قبول طلبك لوظيفة {jobTitle}',
    priority: 'urgent',
    createdAt: timestamp
  }
}
```

---

### Scenario 7: Multiple Notifications

**Requirement**: System should handle multiple notifications correctly.

**Test Steps**:
1. Employer reviews 5 applications in quick succession
2. Verify all 5 applicants receive notifications
3. Verify no duplicate notifications
4. Verify correct order (newest first)

**Expected Results**:
- ✅ 5 separate notifications created
- ✅ Each notification has unique ID
- ✅ No duplicates
- ✅ Notifications ordered by `createdAt` DESC
- ✅ All Pusher events sent successfully

---

### Scenario 8: Notification Actions

**Requirement**: Users should be able to mark notifications as read and delete them.

**Test Steps**:

#### 8.1 Mark as Read
1. User receives notification
2. User clicks on notification
3. Verify notification marked as read

**Expected Results**:
- ✅ `isRead: true`
- ✅ `readAt` timestamp set
- ✅ Unread count decremented
- ✅ Visual indicator changes (e.g., background color)

#### 8.2 Mark All as Read
1. User has 10 unread notifications
2. User clicks "Mark all as read"
3. Verify all notifications marked as read

**Expected Results**:
- ✅ All notifications have `isRead: true`
- ✅ Unread count becomes 0
- ✅ Visual indicators update

#### 8.3 Delete Notification
1. User clicks delete on notification
2. Verify notification removed

**Expected Results**:
- ✅ Notification removed from database
- ✅ Notification removed from UI
- ✅ Unread count updated (if was unread)

---

### Scenario 9: Error Handling

**Requirement**: System should handle errors gracefully.

**Test Steps**:

#### 9.1 Network Failure
1. Disconnect network
2. Trigger notification event
3. Reconnect network
4. Verify notification delivered

**Expected Results**:
- ✅ Notification queued during offline
- ✅ Notification sent when online
- ✅ No data loss

#### 9.2 Invalid Recipient
1. Attempt to send notification to deleted user
2. Verify error handled gracefully

**Expected Results**:
- ✅ Error logged
- ✅ No crash
- ✅ Other notifications continue working

#### 9.3 Pusher Connection Lost
1. Simulate Pusher disconnection
2. Trigger notification
3. Verify fallback mechanism

**Expected Results**:
- ✅ Notification still created in database
- ✅ User sees notification on next page load
- ✅ Pusher reconnects automatically

---

## 🔧 Test Implementation

### Backend Tests

**File**: `backend/tests/applicationNotifications.test.js`

```javascript
const request = require('supertest');
const app = require('../src/app');
const { Notification } = require('../src/models/Notification');
const { JobApplication } = require('../src/models/JobApplication');
const { User } = require('../src/models/User');

describe('Application Notifications Integration', () => {
  let applicant, employer, jobPosting, application;
  let applicantToken, employerToken;

  beforeEach(async () => {
    // Setup test data
    applicant = await User.create({ /* ... */ });
    employer = await User.create({ /* ... */ });
    jobPosting = await JobPosting.create({ /* ... */ });
    
    applicantToken = generateToken(applicant._id);
    employerToken = generateToken(employer._id);
  });

  describe('Application Submission', () => {
    it('should send notification to employer when application submitted', async () => {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id,
          formData: { /* ... */ }
        });

      expect(response.status).toBe(201);

      const notification = await Notification.findOne({
        recipient: employer._id,
        type: 'new_application'
      });

      expect(notification).toBeDefined();
      expect(notification.title).toContain('طلب توظيف جديد');
      expect(notification.priority).toBe('high');
      expect(notification.relatedData.jobApplication).toEqual(response.body.data._id);
    });
  });

  describe('Status Change Notifications', () => {
    beforeEach(async () => {
      application = await JobApplication.create({
        jobPosting: jobPosting._id,
        applicant: applicant._id,
        status: 'Submitted'
      });
    });

    it('should send notification when status changed to Reviewed', async () => {
      await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'Reviewed' });

      const notification = await Notification.findOne({
        recipient: applicant._id,
        type: 'application_reviewed'
      });

      expect(notification).toBeDefined();
      expect(notification.priority).toBe('medium');
    });

    it('should send notification when status changed to Accepted', async () => {
      await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'Accepted' });

      const notification = await Notification.findOne({
        recipient: applicant._id,
        type: 'application_accepted'
      });

      expect(notification).toBeDefined();
      expect(notification.priority).toBe('urgent');
    });

    it('should send notification when status changed to Rejected', async () => {
      await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'Rejected' });

      const notification = await Notification.findOne({
        recipient: applicant._id,
        type: 'application_rejected'
      });

      expect(notification).toBeDefined();
      expect(notification.priority).toBe('medium');
    });
  });

  describe('Withdrawal Notifications', () => {
    beforeEach(async () => {
      application = await JobApplication.create({
        jobPosting: jobPosting._id,
        applicant: applicant._id,
        status: 'Submitted'
      });
    });

    it('should send notification to employer when application withdrawn', async () => {
      await request(app)
        .patch(`/api/applications/${application._id}/withdraw`)
        .set('Authorization', `Bearer ${applicantToken}`);

      const notification = await Notification.findOne({
        recipient: employer._id,
        'relatedData.jobApplication': application._id
      });

      expect(notification).toBeDefined();
      expect(notification.message).toContain('سحب طلبه');
    });
  });

  describe('Notification Preferences', () => {
    it('should not send notification if type is disabled', async () => {
      await NotificationPreference.findOneAndUpdate(
        { user: applicant._id },
        { 'preferences.application_accepted.enabled': false }
      );

      await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({ status: 'Accepted' });

      const notification = await Notification.findOne({
        recipient: applicant._id,
        type: 'application_accepted'
      });

      expect(notification).toBeNull();
    });
  });

  describe('Real-time Updates', () => {
    it('should trigger Pusher event when notification created', async () => {
      const pusherSpy = jest.spyOn(pusherService, 'trigger');

      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          jobPostingId: jobPosting._id,
          formData: { /* ... */ }
        });

      expect(pusherSpy).toHaveBeenCalledWith(
        `private-user-${employer._id}`,
        'notification',
        expect.objectContaining({
          type: 'new_application'
        })
      );
    });
  });
});
```

---

### Frontend Tests

**File**: `frontend/src/tests/applicationNotifications.test.jsx`

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationForm } from '../components/ApplicationForm';
import { NotificationPanel } from '../components/NotificationPanel';
import pusherClient from '../utils/pusherClient';

describe('Application Notifications - Frontend', () => {
  describe('Notification Display', () => {
    it('should display notification when received via Pusher', async () => {
      render(<NotificationPanel />);

      // Simulate Pusher event
      const event = new CustomEvent('pusher-notification', {
        detail: {
          type: 'application_accepted',
          title: 'تم قبول طلبك',
          message: 'تم قبول طلبك لوظيفة مطور واجهات أمامية',
          priority: 'urgent'
        }
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(screen.getByText('تم قبول طلبك')).toBeInTheDocument();
      });
    });

    it('should update unread count when notification received', async () => {
      render(<NotificationPanel />);

      const initialCount = screen.getByTestId('unread-count').textContent;

      // Simulate notification
      const event = new CustomEvent('pusher-notification', {
        detail: { /* ... */ }
      });
      window.dispatchEvent(event);

      await waitFor(() => {
        const newCount = screen.getByTestId('unread-count').textContent;
        expect(parseInt(newCount)).toBe(parseInt(initialCount) + 1);
      });
    });
  });

  describe('Notification Actions', () => {
    it('should mark notification as read when clicked', async () => {
      const user = userEvent.setup();
      render(<NotificationPanel />);

      const notification = screen.getByTestId('notification-1');
      await user.click(notification);

      await waitFor(() => {
        expect(notification).toHaveClass('read');
      });
    });

    it('should navigate to application when notification clicked', async () => {
      const user = userEvent.setup();
      const mockNavigate = jest.fn();
      
      render(<NotificationPanel navigate={mockNavigate} />);

      const notification = screen.getByTestId('notification-1');
      await user.click(notification);

      expect(mockNavigate).toHaveBeenCalledWith('/my-applications/123');
    });
  });
});
```

---

## ✅ Test Checklist

### Backend Integration
- [ ] Notification created on application submission
- [ ] Notification created on status change (all statuses)
- [ ] Notification created on withdrawal
- [ ] Notification includes correct data
- [ ] Notification respects user preferences
- [ ] Notification respects quiet hours
- [ ] Pusher events triggered correctly
- [ ] Multiple notifications handled correctly
- [ ] Error handling works

### Frontend Integration
- [ ] Notifications displayed in real-time
- [ ] Unread count updates correctly
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Navigation from notification works
- [ ] Notification sound plays (if enabled)
- [ ] Browser notifications work (if permission granted)

### End-to-End
- [ ] Complete application flow with notifications
- [ ] Status change flow with notifications
- [ ] Withdrawal flow with notifications
- [ ] Multiple users receiving notifications simultaneously
- [ ] Offline/online notification delivery

---

## 🚀 Running the Tests

### Backend Tests
```bash
cd backend
npm test -- applicationNotifications.test.js
```

### Frontend Tests
```bash
cd frontend
npm test -- applicationNotifications.test.jsx
```

### Manual Testing
1. Open two browser windows (applicant and employer)
2. Submit application in applicant window
3. Verify notification appears in employer window
4. Change status in employer window
5. Verify notification appears in applicant window
6. Test withdrawal flow
7. Test notification preferences

---

## 📊 Expected Results

### Success Criteria
- ✅ All automated tests pass (100%)
- ✅ Notifications delivered within 1 second
- ✅ No duplicate notifications
- ✅ Preferences respected 100%
- ✅ Real-time updates work consistently
- ✅ Error handling prevents crashes

### Performance Metrics
- Notification creation time: < 100ms
- Pusher delivery time: < 500ms
- UI update time: < 100ms
- Total end-to-end time: < 1 second

---

## 🐛 Known Issues and Workarounds

### Issue 1: Pusher Connection Drops
**Workaround**: Implement automatic reconnection with exponential backoff

### Issue 2: Notification Spam
**Workaround**: Implement rate limiting (max 10 notifications per minute)

### Issue 3: Browser Notification Permission
**Workaround**: Gracefully handle denied permission, show in-app notifications only

---

## 📝 Test Report Template

```markdown
# Notification Integration Test Report

**Date**: YYYY-MM-DD
**Tester**: [Name]
**Environment**: [Development/Staging/Production]

## Test Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Application Submission | ✅/❌ | |
| Status Change - Reviewed | ✅/❌ | |
| Status Change - Accepted | ✅/❌ | |
| Status Change - Rejected | ✅/❌ | |
| Withdrawal | ✅/❌ | |
| Preferences | ✅/❌ | |
| Real-time Updates | ✅/❌ | |
| Multiple Notifications | ✅/❌ | |
| Error Handling | ✅/❌ | |

## Issues Found
1. [Issue description]
2. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## 🎯 Next Steps

After completing these tests:
1. ✅ Update tasks.md with test results
2. ✅ Create bug tickets for any failures
3. ✅ Document any edge cases discovered
4. ✅ Update design.md testing checklist
5. ✅ Proceed to final integration testing

---

**Status**: Ready for Testing  
**Last Updated**: 2026-03-04
