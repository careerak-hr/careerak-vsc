# PWA + Pusher Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
cd frontend
npm install pusher-js
```

### 2. Configure Environment

Create `frontend/.env`:

```env
VITE_PUSHER_KEY=your_pusher_key_here
VITE_PUSHER_CLUSTER=eu
```

> Get these from your Pusher dashboard (same as backend)

### 3. Verify Backend

Ensure `backend/.env` has:

```env
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu
```

### 4. Start Services

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Test

1. Open http://localhost:5173
2. Login to the app
3. Allow notifications when prompted
4. Trigger a notification (e.g., create a job posting)
5. See the notification appear! 🎉

## 📱 How It Works

```
Backend → Pusher → Frontend → Service Worker → Browser Notification
```

1. **Backend** sends notification via Pusher
2. **Pusher** broadcasts to subscribed clients
3. **Frontend** receives event and forwards to service worker
4. **Service Worker** displays browser notification
5. **User** sees notification and can click to navigate

## 🔔 Notification Types

| Type | Description | Actions |
|------|-------------|---------|
| `job_match` | Job matches user skills | View Job, Apply |
| `application_accepted` | Application accepted | View Details, Message |
| `new_application` | New application received | Review, Later |
| `new_message` | New chat message | Reply, View Chat |
| `course_match` | Course recommendation | View Course, Enroll |

## 💻 Usage in Your Code

### Listen for Notifications

```javascript
// In any component
useEffect(() => {
  const handleNotification = (event) => {
    const notification = event.detail;
    console.log('Received:', notification);
    // Update UI, show toast, etc.
  };

  window.addEventListener('pusher-notification', handleNotification);
  
  return () => {
    window.removeEventListener('pusher-notification', handleNotification);
  };
}, []);
```

### Request Permission

```javascript
import pusherClient from '../utils/pusherClient';

const handleEnableNotifications = async () => {
  const granted = await pusherClient.requestNotificationPermission();
  if (granted) {
    console.log('Notifications enabled!');
  }
};
```

### Check Connection Status

```javascript
import pusherClient from '../utils/pusherClient';

const isConnected = pusherClient.isConnected();
console.log('Pusher connected:', isConnected);
```

## 🧪 Testing

### Manual Test

```javascript
// In browser console
const registration = await navigator.serviceWorker.ready;
registration.active.postMessage({
  type: 'PUSH_NOTIFICATION',
  notification: {
    title: 'Test Notification',
    body: 'This is a test!',
    type: 'system',
  }
});
```

### Backend Test

```javascript
// In backend code
const pusherService = require('./services/pusherService');

await pusherService.sendNotificationToUser(userId, {
  title: 'Test from Backend',
  message: 'Hello from Pusher!',
  type: 'system',
});
```

## 🐛 Troubleshooting

### Notifications Not Showing?

1. **Check Permission**:
   ```javascript
   console.log(Notification.permission); // Should be "granted"
   ```

2. **Check Pusher Connection**:
   ```javascript
   import pusherClient from './utils/pusherClient';
   console.log(pusherClient.isConnected()); // Should be true
   ```

3. **Check Service Worker**:
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     console.log('SW active:', reg.active !== null);
   });
   ```

4. **Check Browser Console** for errors

### Pusher Not Connecting?

1. Verify `VITE_PUSHER_KEY` in `.env`
2. Check backend Pusher service is initialized
3. Look for WebSocket connection in Network tab
4. Verify `/api/chat/pusher/auth` returns 200

### Still Not Working?

- Check you're logged in (Pusher needs authentication)
- Try in incognito mode (clear cache)
- Check HTTPS (required in production)
- Review full docs: `docs/PWA_PUSHER_INTEGRATION.md`

## 📚 Example Component

See `frontend/src/examples/PusherNotificationExample.jsx` for a complete working example.

## 🎯 Next Steps

1. ✅ Basic setup complete
2. 📖 Read full documentation: `docs/PWA_PUSHER_INTEGRATION.md`
3. 🧪 Run tests: `npm test -- pwa-push-integration`
4. 🎨 Customize notification UI
5. 🚀 Deploy to production

## 📞 Support

- Full docs: `docs/PWA_PUSHER_INTEGRATION.md`
- Pusher docs: https://pusher.com/docs
- Email: careerak.hr@gmail.com

---

**That's it!** You now have PWA push notifications integrated with Pusher. 🎉
