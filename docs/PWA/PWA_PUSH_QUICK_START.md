# 🚀 PWA Push Notifications - Quick Start Guide

## 5-Minute Setup

### Step 1: Environment Variables

Add to `frontend/.env`:
```env
REACT_APP_PUSHER_KEY=your_pusher_key
REACT_APP_PUSHER_CLUSTER=eu
```

### Step 2: Add to Your Component

```javascript
import { usePusherPush } from '../hooks/usePusherPush';

function MyComponent() {
  const { userId } = useAuth(); // Get current user ID
  
  const { 
    isInitialized, 
    canNotify, 
    requestPermission,
    subscribe 
  } = usePusherPush(userId, {
    autoInitialize: true
  });

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) await subscribe();
  };

  return (
    <button onClick={handleEnable} disabled={!isInitialized || canNotify}>
      {canNotify ? '✅ Notifications Enabled' : '🔔 Enable Notifications'}
    </button>
  );
}
```

### Step 3: Send Notification from Backend

```javascript
const pusherService = require('../services/pusherService');

await pusherService.sendNotificationToUser(userId, {
  type: 'job_match',
  title: '💼 New Job Match',
  body: 'A new job matches your skills',
  url: '/jobs/123'
});
```

That's it! 🎉

---

## Common Use Cases

### 1. Settings Page Integration

```javascript
import PushNotificationManager from '../components/PushNotificationManager';

function SettingsPage() {
  const { userId } = useAuth();
  
  return (
    <div>
      <h2>Notification Settings</h2>
      <PushNotificationManager userId={userId} />
    </div>
  );
}
```

### 2. Chat Notifications

```javascript
import { useConversationSubscription } from '../hooks/usePusherPush';

function ChatPage({ conversationId }) {
  useConversationSubscription(
    conversationId,
    (data) => {
      console.log('New message:', data.message);
      // Update UI
    },
    true // enabled
  );

  return <div>Chat UI</div>;
}
```

### 3. Unread Badge

```javascript
import { useUnreadCount } from '../hooks/usePusherPush';

function NotificationBadge() {
  const [count, setCount] = useState(0);
  
  useUnreadCount(setCount);
  
  return count > 0 && <span className="badge">{count}</span>;
}
```

---

## Testing

### Test in Browser Console

```javascript
// 1. Initialize
const service = window.pusherPushService;
await service.initialize('user123', 'your_pusher_key', 'eu');

// 2. Request permission
await service.requestPermission();

// 3. Test notification
await service.testPushNotification();
```

### Test from Backend

```bash
# In backend directory
node -e "
const pusherService = require('./src/services/pusherService');
pusherService.initialize();
pusherService.sendNotificationToUser('user123', {
  type: 'job_match',
  title: 'Test',
  body: 'This is a test notification'
});
"
```

---

## Troubleshooting

### Notifications not showing?

1. Check permission:
```javascript
console.log(Notification.permission); // Should be 'granted'
```

2. Check Pusher connection:
```javascript
console.log(pusherPushService.isReady()); // Should be true
```

3. Check service worker:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW active:', reg?.active);
});
```

### Enable debug mode:

```javascript
localStorage.setItem('pusher:log', 'debug');
```

---

## Next Steps

- Read full documentation: `docs/PWA_PUSHER_PUSH_INTEGRATION.md`
- Customize notification types
- Add notification preferences
- Implement quiet hours

---

**Need Help?** Check the troubleshooting section in the full documentation.
