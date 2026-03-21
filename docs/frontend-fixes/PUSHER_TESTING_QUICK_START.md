# Pusher Integration Testing - Quick Start Guide
## Apply Page Enhancements Feature

**Time Required**: 15-20 minutes  
**Difficulty**: Easy  
**Prerequisites**: Backend and Frontend running

---

## Quick Setup (2 minutes)

### 1. Verify Environment Variables

**Backend** (`.env`):
```bash
cd backend
cat .env | grep PUSHER
```

Should show:
```
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu
```

**Frontend** (`.env`):
```bash
cd frontend
cat .env | grep PUSHER
```

Should show:
```
VITE_PUSHER_KEY=your_key
VITE_PUSHER_CLUSTER=eu
```

### 2. Install Dependencies (if needed)

```bash
# Backend
cd backend
npm install pusher

# Frontend
cd frontend
npm install pusher-js
```

---

## Quick Tests (10 minutes)

### Test 1: Backend Pusher Service (1 minute)

```bash
cd backend
node -e "
const pusherService = require('./src/services/pusherService');
pusherService.initialize();
console.log('✅ Pusher enabled:', pusherService.isEnabled());
"
```

**Expected**: `✅ Pusher enabled: true`

---

### Test 2: Run Automated Tests (2 minutes)

```bash
cd backend
npm test -- pusher-integration.test.js
```

**Expected**: All tests pass (17/17 ✅)

---

### Test 3: Manual Real-time Test (5 minutes)

**Setup**:
1. Open 2 browser windows side-by-side
2. Window 1: Login as Employee (applicant)
3. Window 2: Login as HR/Admin

**Steps**:
1. **Window 1** (Employee):
   - Submit a job application
   - Stay on application details page
   - Open browser console (F12)

2. **Window 2** (HR):
   - Navigate to the application
   - Update status: Submitted → Reviewed
   - Click "Save"

3. **Window 1** (Employee):
   - Watch for notification (should appear within 1-2 seconds)
   - Check console for: "Received notification: {data}"
   - Verify status timeline updates automatically

**Expected**:
- ✅ Notification appears in Window 1 within 1-2 seconds
- ✅ Status timeline updates without page refresh
- ✅ Console shows Pusher event

---

### Test 4: Browser Notification (2 minutes)

**Steps**:
1. Login as Employee
2. When prompted, **Allow** notifications
3. Navigate away from application page
4. HR updates application status
5. Check for browser notification

**Expected**:
- ✅ Browser notification appears
- ✅ Clicking notification opens application page

---

## Troubleshooting (5 minutes)

### Issue: "Pusher not initialized"

**Solution**:
```bash
# Check environment variables
cd backend
echo $PUSHER_KEY
echo $PUSHER_SECRET

# If empty, add to .env:
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu
```

---

### Issue: "Connection failed"

**Solution**:
1. Check Pusher Dashboard: https://dashboard.pusher.com
2. Verify app is active
3. Check quota (free tier: 200K messages/day)
4. Verify cluster is correct (usually 'eu')

---

### Issue: "No notification received"

**Solution**:
```javascript
// In browser console (Employee window):
console.log('Pusher connected:', pusherClient.isConnected());
console.log('Subscribed channels:', pusherClient.subscribedChannels);

// Should show:
// Pusher connected: true
// Subscribed channels: Map { 'private-user-{userId}' => Channel }
```

---

### Issue: "Authentication failed"

**Solution**:
1. Check auth endpoint: `/api/chat/pusher/auth`
2. Verify JWT token is valid
3. Check backend logs for auth errors

---

## Quick Verification Checklist

- [ ] Backend Pusher service initializes (Test 1)
- [ ] All automated tests pass (Test 2)
- [ ] Real-time notification works (Test 3)
- [ ] Browser notification works (Test 4)
- [ ] Status timeline updates automatically
- [ ] Multiple status changes work
- [ ] Works on Chrome, Firefox, Safari

---

## Next Steps

After all quick tests pass:

1. ✅ Run full test suite: See `pusher-integration-test.md`
2. ✅ Test on staging environment
3. ✅ Test on mobile devices
4. ✅ Update test results in `pusher-integration-test.md`
5. ✅ Mark task as complete in `tasks.md`

---

## Useful Commands

```bash
# Check Pusher connection in browser console
pusherClient.isConnected()

# Check subscribed channels
pusherClient.subscribedChannels

# Manually trigger test notification
pusherClient.handleNotification({
  type: 'test',
  title: 'Test Notification',
  message: 'This is a test'
})

# Backend: Send test notification
const pusherService = require('./src/services/pusherService');
pusherService.sendNotificationToUser('user-id', {
  type: 'test',
  title: 'Test',
  message: 'Test message'
});
```

---

## Resources

- **Full Test Plan**: `pusher-integration-test.md`
- **Pusher Service**: `backend/src/services/pusherService.js`
- **Pusher Client**: `frontend/src/utils/pusherClient.js`
- **Pusher Dashboard**: https://dashboard.pusher.com
- **Pusher Docs**: https://pusher.com/docs

---

**Total Time**: ~15-20 minutes  
**Success Rate**: Should be 100% if environment is configured correctly

✅ **Ready to test!**
