# تنبيه تسجيل الدخول من جهاز جديد - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. التثبيت

```bash
# Backend
cd backend
npm install ua-parser-js

# Frontend - لا يحتاج تثبيت إضافي
```

### 2. تفعيل Device Tracking

#### في Backend (تلقائي)
تم إضافة routes تلقائياً في `app.js`:
```javascript
app.use('/devices', require('./routes/deviceRoutes'));
```

#### في أي Route يحتاج تتبع
```javascript
const { protect } = require('../middleware/auth');
const { trackLoginDevice } = require('../middleware/deviceTracking');

router.post('/login',
  authController.login,
  protect,
  trackLoginDevice,  // ← إضافة هذا السطر
  (req, res) => {
    // الآن لديك:
    // req.loginDevice - معلومات الجهاز
    // req.isNewDevice - هل الجهاز جديد؟
  }
);
```

### 3. استخدام في Frontend

#### عرض قائمة الأجهزة
```jsx
import DeviceList from '../components/devices/DeviceList';

function SettingsPage() {
  return (
    <div>
      <h1>الإعدادات</h1>
      <DeviceList />
    </div>
  );
}
```

#### التعامل مع تنبيهات الأجهزة الجديدة
```jsx
import NewDeviceAlert from '../components/devices/NewDeviceAlert';
import { useState, useEffect } from 'react';

function App() {
  const [notification, setNotification] = useState(null);

  // استقبال الإشعارات (من WebSocket أو Polling)
  useEffect(() => {
    // مثال: polling كل 30 ثانية
    const interval = setInterval(async () => {
      const response = await fetch('/notifications');
      const data = await response.json();
      
      const newDeviceNotif = data.notifications.find(
        n => n.type === 'new_device_login' && !n.isRead
      );
      
      if (newDeviceNotif) {
        setNotification(newDeviceNotif);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTrustDevice = async (deviceId) => {
    await fetch(`/devices/${deviceId}/trust`, { method: 'POST' });
  };

  return (
    <>
      {notification?.type === 'new_device_login' && (
        <NewDeviceAlert
          notification={notification}
          onClose={() => setNotification(null)}
          onTrust={handleTrustDevice}
        />
      )}
      
      {/* باقي التطبيق */}
    </>
  );
}
```

## 📋 API Endpoints

### الحصول على جميع الأجهزة
```bash
GET /devices
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "...",
        "deviceType": "mobile",
        "browser": { "name": "Chrome", "version": "120" },
        "os": { "name": "Android", "version": "14" },
        "location": { "city": "Cairo", "country": "Egypt" },
        "isTrusted": false,
        "isCurrentDevice": true,
        "lastLoginAt": "2026-02-23T10:30:00Z",
        "loginCount": 5
      }
    ]
  }
}
```

### تحديد جهاز كموثوق
```bash
POST /devices/:deviceId/trust
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "message": "تم تحديد الجهاز كموثوق بنجاح"
}
```

### حذف جهاز
```bash
DELETE /devices/:deviceId
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "message": "تم حذف الجهاز بنجاح"
}
```

### حذف جميع الأجهزة الأخرى
```bash
DELETE /devices/others/all
Authorization: Bearer YOUR_TOKEN

Response:
{
  "success": true,
  "message": "تم حذف 3 جهاز بنجاح",
  "data": { "removedCount": 3 }
}
```

## 🧪 الاختبار السريع

### 1. اختبار Backend
```bash
# تشغيل السيرفر
cd backend
npm start

# اختبار API
curl -X GET http://localhost:5000/devices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. اختبار Frontend
```bash
# تشغيل التطبيق
cd frontend
npm run dev

# افتح في المتصفح
http://localhost:3000/devices
```

### 3. اختبار التنبيه
1. سجل دخول من متصفح عادي
2. افتح متصفح آخر (أو وضع incognito)
3. سجل دخول من المتصفح الجديد
4. يجب أن يظهر تنبيه "تسجيل دخول من جهاز جديد"

## 🔧 التخصيص

### تغيير Device Fingerprinting
```javascript
// في deviceTrackingService.js
generateDeviceId(req) {
  // أضف معلومات إضافية
  const userAgent = req.get('user-agent') || '';
  const acceptLanguage = req.get('accept-language') || '';
  const screenResolution = req.get('x-screen-resolution') || '';  // مخصص
  
  const fingerprint = `${userAgent}|${acceptLanguage}|${screenResolution}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}
```

### تخصيص رسالة التنبيه
```javascript
// في notificationService.js
async notifyNewDeviceLogin(userId, device) {
  const deviceDescription = device.getDeviceDescription();
  
  return await this.createNotification({
    recipient: userId,
    type: 'new_device_login',
    title: 'تنبيه أمني مهم! 🔐',  // ← غيّر هنا
    message: `رسالتك المخصصة: ${deviceDescription}`,  // ← غيّر هنا
    priority: 'urgent'
  });
}
```

### إضافة GeoIP
```javascript
// تثبيت
npm install geoip-lite

// في deviceTrackingService.js
const geoip = require('geoip-lite');

async getLocationFromIp(ipAddress) {
  const geo = geoip.lookup(ipAddress);
  
  if (!geo) {
    return { country: null, city: null };
  }
  
  return {
    country: geo.country,
    city: geo.city,
    coordinates: {
      latitude: geo.ll[0],
      longitude: geo.ll[1]
    }
  };
}
```

## 🐛 استكشاف الأخطاء الشائعة

### المشكلة: "Cannot find module 'ua-parser-js'"
```bash
cd backend
npm install ua-parser-js
```

### المشكلة: التنبيه يظهر في كل مرة
```javascript
// تحقق من أن الجهاز يُحفظ
console.log('Device saved:', device);

// حدد الجهاز كموثوق
await device.markAsTrusted();
```

### المشكلة: لا يظهر التنبيه
```javascript
// تحقق من middleware
router.use(trackLoginDevice);  // ← تأكد من إضافته

// تحقق من الإشعارات
const notif = await Notification.find({ 
  recipient: userId, 
  type: 'new_device_login' 
});
console.log('Notifications:', notif);
```

## 📚 المزيد من المعلومات

- 📄 التوثيق الكامل: `docs/NEW_DEVICE_LOGIN_ALERT.md`
- 📄 مثال الاستخدام: `frontend/src/examples/DeviceManagementExample.jsx`
- 📄 الكود المصدري: `backend/src/services/deviceTrackingService.js`

## ✅ Checklist

- [ ] تثبيت ua-parser-js
- [ ] إضافة trackLoginDevice middleware
- [ ] اختبار تسجيل دخول من جهاز جديد
- [ ] التحقق من ظهور التنبيه
- [ ] اختبار تحديد جهاز كموثوق
- [ ] اختبار حذف جهاز
- [ ] مراجعة قائمة الأجهزة

---

**وقت الإعداد**: 5 دقائق  
**المستوى**: متوسط  
**التبعيات**: ua-parser-js

تم إنشاء هذا الدليل في 2026-02-23
