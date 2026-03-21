# Notification Integration Testing - Quick Start Guide

## 🚀 5-Minute Quick Start

This guide helps you quickly test the notification system integration with the Apply Page Enhancements feature.

---

## Prerequisites

- ✅ Backend server running (`npm run pm2:start` in backend/)
- ✅ Frontend server running (`npm run dev` in frontend/)
- ✅ MongoDB connected
- ✅ Pusher configured (check `.env` files)
- ✅ Two browser windows or incognito mode

---

## Quick Test Scenarios

### Test 1: Application Submission Notification (2 minutes)

**Setup**:
1. Window 1: Login as Employee (applicant)
2. Window 2: Login as Employer

**Steps**:
1. **Window 1**: Navigate to a job posting
2. **Window 1**: Fill out application form (all 5 steps)
3. **Window 1**: Submit application
4. **Window 2**: Check notifications panel (top-right bell icon)

**Expected Result**:
- ✅ Notification appears in Window 2 immediately
- ✅ Notification says "طلب توظيف جديد"
- ✅ Unread count badge shows "1"
- ✅ Clicking notification navigates to application details

---

### Test 2: Status Change Notification (1 minute)

**Setup**:
- Use the application from Test 1

**Steps**:
1. **Window 2** (Employer): Open application details
2. **Window 2**: Change status to "Reviewed"
3. **Window 1** (Applicant): Check notifications panel

**Expected Result**:
- ✅ Notification appears in Window 1 immediately
- ✅ Notification says "تم مراجعة طلبك"
- ✅ Unread count increments

**Repeat for other statuses**:
- Shortlisted → "تم اختيارك في القائمة المختصرة"
- Accepted → "تم قبول طلبك" (urgent priority)
- Rejected → "تم رفض طلبك"

---

### Test 3: Withdrawal Notification (1 minute)

**Setup**:
- Use an application with status "Submitted" or "Reviewed"

**Steps**:
1. **Window 1** (Applicant): Open application details
2. **Window 1**: Click "Withdraw" button
3. **Window 1**: Confirm withdrawal
4. **Window 2** (Employer): Check notifications panel

**Expected Result**:
- ✅ Notification appears in Window 2
- ✅ Notification says "قام [Name] بسحب طلبه"
- ✅ Application status shows "Withdrawn"

---

### Test 4: Notification Actions (1 minute)

**Steps**:
1. Click on any unread notification
2. Verify it marks as read (background color changes)
3. Verify unread count decrements
4. Click "Mark all as read" button
5. Verify all notifications marked as read
6. Delete a notification
7. Verify it's removed from list

**Expected Results**:
- ✅ All actions work smoothly
- ✅ UI updates immediately
- ✅ No page refresh needed

---

## Running Automated Tests

### Backend Tests
```bash
cd backend
npm test -- applicationNotifications.test.js
```

**Expected Output**:
```
✓ should send notification to employer when application submitted
✓ should send notification when status changed to Reviewed
✓ should send notification when status changed to Accepted
✓ should send notification when status changed to Rejected
✓ should send notification to employer when application withdrawn
✓ should not send notification if type is disabled
✓ should trigger Pusher event when notification created

Tests: 7 passed, 7 total
```

### Frontend Tests
```bash
cd frontend
npm test -- applicationNotifications.test.jsx
```

---

## Troubleshooting

### Notifications Not Appearing?

**Check 1: Pusher Connection**
```javascript
// In browser console
console.log(pusherClient.connection.state);
// Should be: "connected"
```

**Check 2: Backend Logs**
```bash
cd backend
npm run pm2:logs
# Look for "Notification created" messages
```

**Check 3: Database**
```javascript
// In MongoDB
db.notifications.find().sort({createdAt: -1}).limit(5)
// Should show recent notifications
```

### Pusher Not Working?

**Verify Environment Variables**:
```bash
# Backend .env
echo $PUSHER_APP_ID
echo $PUSHER_KEY
echo $PUSHER_SECRET

# Frontend .env
echo $VITE_PUSHER_KEY
echo $VITE_PUSHER_CLUSTER
```

**Test Pusher Connection**:
```bash
cd backend
node test-pusher.js
```

### Notifications Delayed?

**Check Quiet Hours**:
1. Go to Settings → Notifications
2. Verify "Quiet Hours" is disabled
3. Or verify current time is outside quiet hours

---

## Quick Verification Checklist

- [ ] Application submission → Employer notified ✅
- [ ] Status change → Applicant notified ✅
- [ ] Withdrawal → Employer notified ✅
- [ ] Real-time updates (no refresh) ✅
- [ ] Mark as read works ✅
- [ ] Delete notification works ✅
- [ ] Unread count accurate ✅
- [ ] Navigation from notification works ✅

---

## Test Data

### Test Users

**Applicant**:
- Email: `test.applicant@example.com`
- Password: `Test123!`

**Employer**:
- Email: `test.employer@example.com`
- Password: `Test123!`

### Test Job Posting
- Title: "مطور واجهات أمامية"
- Company: "شركة التقنية"
- Status: "Active"

---

## Next Steps

After completing quick tests:
1. ✅ Run full automated test suite
2. ✅ Test notification preferences
3. ✅ Test quiet hours
4. ✅ Test error scenarios
5. ✅ Update test report

---

## Full Documentation

For comprehensive testing:
- 📄 `NOTIFICATION_INTEGRATION_TEST.md` - Complete test plan
- 📄 `docs/systems/NOTIFICATION_SYSTEM.md` - System documentation
- 📄 `docs/PUSHER_SETUP_GUIDE.md` - Pusher setup

---

**Time Required**: 5-10 minutes  
**Difficulty**: Easy  
**Status**: Ready to Test
