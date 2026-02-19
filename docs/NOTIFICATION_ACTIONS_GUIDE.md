# Notification Actions Guide

**Task**: 3.5.4 Display notifications with actions  
**Date**: 2026-02-19  
**Status**: ✅ Complete

## Overview

This guide explains how to use the notification actions feature in Careerak. Notifications now include interactive action buttons that allow users to respond directly from the notification without opening the app.

## Features

### Supported Notification Types

1. **Job Match** (`job_match`)
   - Actions: View Job, Apply Now
   - Use case: When a job matches user's skills

2. **Application Accepted** (`application_accepted`)
   - Actions: View Details, Send Message
   - Use case: When employer accepts application

3. **Application Rejected** (`application_rejected`)
   - Actions: View Feedback, Dismiss
   - Use case: When application is not successful

4. **Application Reviewed** (`application_reviewed`)
   - Actions: View Status, Dismiss
   - Use case: When application status changes

5. **New Application** (`new_application`)
   - Actions: Review Now, Review Later
   - Use case: When employer receives new application

6. **Job Closed** (`job_closed`)
   - Actions: View Details, Dismiss
   - Use case: When job posting is closed

7. **Course Match** (`course_match`)
   - Actions: View Course, Enroll Now
   - Use case: When a course matches user interests

8. **New Message** (`new_message`)
   - Actions: Reply, View Chat
   - Use case: When user receives a message

9. **System** (`system`)
   - Actions: View, Dismiss
   - Use case: General system notifications

## Implementation

### Service Worker

The service worker (`frontend/public/service-worker.js`) handles:
- Displaying notifications with actions
- Handling action clicks
- Navigation based on action type
- Integration with Pusher

### Utility Functions

**File**: `frontend/src/utils/notificationActions.js`

```javascript
import { sendNotificationWithActions, NotificationTemplates } from '../utils/notificationActions';

// Send a job match notification
await sendNotificationWithActions(
  NotificationTemplates.jobMatch('Senior Developer', 'job123', '/jobs/job123')
);

// Send a custom notification
await sendNotificationWithActions({
  title: 'Custom Notification',
  body: 'This is a custom notification',
  type: 'system',
  data: { customData: 'value' },
  url: '/custom-page',
  actions: [
    { action: 'custom1', title: 'Action 1', icon: '/icons/action1.png' },
    { action: 'custom2', title: 'Action 2', icon: '/icons/action2.png' },
  ],
});
```

### React Hook

**File**: `frontend/src/hooks/useNotificationActions.js`

```javascript
import { useNotificationActions } from '../hooks/useNotificationActions';

function MyComponent() {
  const {
    permission,
    isEnabled,
    requestPermission,
    notifyJobMatch,
    notifyNewMessage,
  } = useNotificationActions();

  const handleJobMatch = async () => {
    if (!isEnabled) {
      await requestPermission();
    }
    await notifyJobMatch('Senior Developer', 'job123', '/jobs/job123');
  };

  return (
    <div>
      <p>Permission: {permission}</p>
      <button onClick={requestPermission}>Enable Notifications</button>
      <button onClick={handleJobMatch}>Test Notification</button>
    </div>
  );
}
```

## Action Handling

### Action Types

Each notification type has predefined actions:

```javascript
// Job Match
actions: [
  { action: 'view', title: 'View Job', icon: '/icons/view.png' },
  { action: 'apply', title: 'Apply Now', icon: '/icons/apply.png' },
]

// Application Accepted
actions: [
  { action: 'view', title: 'View Details', icon: '/icons/view.png' },
  { action: 'message', title: 'Send Message', icon: '/icons/message.png' },
]

// New Message
actions: [
  { action: 'reply', title: 'Reply', icon: '/icons/reply.png' },
  { action: 'view', title: 'View Chat', icon: '/icons/message.png' },
]
```

### Navigation Behavior

When a user clicks an action:

1. **view**: Opens the notification's URL or default URL for type
2. **apply**: Navigates to job application page
3. **message/reply**: Opens chat/messaging page
4. **review**: Opens application review page
5. **enroll**: Opens course enrollment page
6. **later**: Marks notification for later (no navigation)
7. **dismiss**: Closes notification (no navigation)

### URL Resolution

The service worker determines the URL based on:
1. Notification data URL (highest priority)
2. Action-specific URL
3. Default URL for notification type

```javascript
// Default URLs by type
{
  job_match: '/jobs',
  application_accepted: '/applications',
  new_application: '/admin/applications',
  course_match: '/courses',
  new_message: '/chat',
  system: '/notifications',
}
```

## Integration with Backend

### Pusher Integration

The notification system integrates with the existing Pusher notification system:

```javascript
// Backend sends notification via Pusher
pusher.trigger(`private-user-${userId}`, 'notification', {
  title: 'New Job Match',
  body: 'A job matching your skills',
  type: 'job_match',
  data: { jobId: 'job123', jobUrl: '/jobs/job123' },
  url: '/jobs/job123',
});

// Frontend receives and displays with actions
pusher.subscribe(`private-user-${userId}`);
pusher.bind('notification', async (notification) => {
  await sendNotificationWithActions(notification);
});
```

### Backend Notification Service

Update `backend/src/services/notificationService.js`:

```javascript
async function sendPushNotification(userId, notification) {
  // Send via Pusher
  await pusherService.trigger(`private-user-${userId}`, 'notification', {
    title: notification.title,
    body: notification.body,
    type: notification.type,
    data: notification.data,
    url: notification.url,
  });
}
```

## Demo Component

**File**: `frontend/src/components/NotificationActionsDemo.jsx`

A demo component is provided to test all notification types:

```javascript
import NotificationActionsDemo from './components/NotificationActionsDemo';

function App() {
  return (
    <div>
      <NotificationActionsDemo />
    </div>
  );
}
```

## Browser Support

### Supported Browsers

- ✅ Chrome 50+ (Desktop & Mobile)
- ✅ Firefox 44+ (Desktop & Mobile)
- ✅ Edge 17+
- ✅ Safari 16+ (macOS & iOS)
- ✅ Opera 37+

### Feature Detection

```javascript
// Check if notifications are supported
if ('Notification' in window && 'serviceWorker' in navigator) {
  // Notifications supported
}

// Check permission
if (Notification.permission === 'granted') {
  // Can send notifications
}
```

## Testing

### Manual Testing

1. Open the demo component
2. Click "Enable Notifications"
3. Grant permission when prompted
4. Click any notification button
5. Verify notification appears with actions
6. Click an action button
7. Verify correct navigation

### Test Scenarios

1. **Permission Request**
   - First visit: Should prompt for permission
   - Permission granted: Should show notifications
   - Permission denied: Should show warning

2. **Action Clicks**
   - Click "View": Should navigate to detail page
   - Click "Apply": Should navigate to application page
   - Click "Message": Should open chat
   - Click "Dismiss": Should close notification

3. **Offline Behavior**
   - Send notification while offline
   - Should queue for later sync
   - Should display when back online

4. **Multiple Windows**
   - Open multiple tabs
   - Click notification action
   - Should focus existing tab or open new one

## Troubleshooting

### Notifications Not Appearing

1. Check permission status:
   ```javascript
   console.log(Notification.permission);
   ```

2. Check service worker registration:
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     console.log('Service Worker ready:', reg);
   });
   ```

3. Check browser console for errors

### Actions Not Working

1. Verify service worker is active:
   ```javascript
   navigator.serviceWorker.controller
   ```

2. Check notification data structure:
   ```javascript
   console.log(event.notification.data);
   ```

3. Verify action handlers in service worker

### Permission Issues

1. Reset permission in browser settings
2. Clear site data and try again
3. Check if notifications are blocked system-wide

## Best Practices

### Do's ✅

- Always request permission before sending notifications
- Use appropriate notification types
- Provide meaningful action labels
- Include relevant data in notification
- Test on multiple browsers
- Handle permission denial gracefully

### Don'ts ❌

- Don't spam users with notifications
- Don't send notifications without permission
- Don't use generic action labels
- Don't forget to handle offline scenarios
- Don't assume notifications are supported

## Future Enhancements

### Planned Features

1. **Inline Reply**: Reply to messages directly from notification
2. **Custom Actions**: Allow custom actions per notification
3. **Action Icons**: Support for custom action icons
4. **Rich Media**: Support for images and videos in notifications
5. **Notification Groups**: Group related notifications
6. **Priority Levels**: Different notification priorities
7. **Scheduled Notifications**: Schedule notifications for later
8. **Analytics**: Track notification engagement

### Integration Opportunities

1. **Email Fallback**: Send email if notification fails
2. **SMS Fallback**: Send SMS for critical notifications
3. **In-App Notifications**: Show in-app when user is active
4. **Desktop Notifications**: Native desktop notifications
5. **Mobile Push**: Native mobile push notifications

## References

- [Web Push Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Pusher Documentation](https://pusher.com/docs)

## Support

For issues or questions:
- Email: careerak.hr@gmail.com
- Check browser console for errors
- Review service worker logs
- Test in incognito mode

---

**Last Updated**: 2026-02-19  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
