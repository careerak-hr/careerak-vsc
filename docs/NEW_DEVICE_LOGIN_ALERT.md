# تنبيه تسجيل الدخول من جهاز جديد

## 📋 معلومات الميزة
- **تاريخ الإضافة**: 2026-02-23
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 7.5 (Enhanced Auth)

## 🎯 الهدف
تحسين أمان الحسابات من خلال تنبيه المستخدمين عند تسجيل الدخول من أجهزة جديدة، مما يساعد في اكتشاف الوصول غير المصرح به مبكراً.

## 🏗️ البنية التقنية

### Backend Components

#### 1. LoginDevice Model
**الموقع**: `backend/src/models/LoginDevice.js`

**الحقول الرئيسية**:
- `userId` - معرف المستخدم
- `deviceInfo` - معلومات الجهاز (نوع، متصفح، نظام تشغيل، User Agent)
- `location` - معلومات الموقع (IP، دولة، مدينة)
- `status` - حالة الجهاز (موثوق، تم إرسال تنبيه)
- `firstLoginAt` - تاريخ أول تسجيل دخول
- `lastLoginAt` - تاريخ آخر تسجيل دخول
- `loginCount` - عدد مرات تسجيل الدخول

**Methods**:
- `updateLastLogin()` - تحديث آخر تسجيل دخول
- `markAsTrusted()` - تحديد الجهاز كموثوق
- `markAlertSent()` - تحديد أن التنبيه تم إرساله
- `isNewDevice()` - التحقق من أن الجهاز جديد
- `getDeviceDescription()` - الحصول على وصف مختصر للجهاز

#### 2. Device Tracking Service
**الموقع**: `backend/src/services/deviceTrackingService.js`

**الوظائف الرئيسية**:
- `generateDeviceId(req)` - توليد معرف فريد للجهاز (fingerprint)
- `parseDeviceInfo(userAgent)` - استخراج معلومات الجهاز من User Agent
- `getIpAddress(req)` - الحصول على عنوان IP
- `trackDevice(userId, req)` - تسجيل جهاز جديد أو تحديث موجود
- `getUserDevices(userId)` - الحصول على جميع أجهزة المستخدم
- `removeDevice(userId, deviceId)` - حذف جهاز
- `trustDevice(userId, deviceId)` - تحديد جهاز كموثوق
- `isDeviceTrusted(userId, req)` - التحقق من أن الجهاز موثوق

#### 3. Notification Service (محدّث)
**الموقع**: `backend/src/services/notificationService.js`

**وظيفة جديدة**:
```javascript
async notifyNewDeviceLogin(userId, device)
```
- إرسال إشعار للمستخدم عند تسجيل دخول من جهاز جديد
- يتضمن وصف الجهاز والموقع والوقت

#### 4. Device Tracking Middleware
**الموقع**: `backend/src/middleware/deviceTracking.js`

**Middlewares**:
- `trackLoginDevice` - تتبع تلقائي للأجهزة عند تسجيل الدخول
- `requireTrustedDevice` - التحقق من أن الجهاز موثوق (للعمليات الحساسة)

#### 5. Device Controller
**الموقع**: `backend/src/controllers/deviceController.js`

**Endpoints**:
- `getUserDevices()` - GET /devices
- `getCurrentDevice()` - GET /devices/current
- `trustDevice()` - POST /devices/:deviceId/trust
- `removeDevice()` - DELETE /devices/:deviceId
- `removeOtherDevices()` - DELETE /devices/others/all

#### 6. Device Routes
**الموقع**: `backend/src/routes/deviceRoutes.js`

جميع المسارات محمية بـ authentication و device tracking middleware.

### Frontend Components

#### 1. DeviceList Component
**الموقع**: `frontend/src/components/devices/DeviceList.jsx`

**الميزات**:
- عرض قائمة جميع الأجهزة المسجلة
- تمييز الجهاز الحالي
- عرض معلومات تفصيلية لكل جهاز
- تحديد جهاز كموثوق
- حذف جهاز واحد
- حذف جميع الأجهزة الأخرى

#### 2. DevicesPage
**الموقع**: `frontend/src/pages/DevicesPage.jsx`

صفحة كاملة لإدارة الأجهزة مع نصائح أمان.

#### 3. NewDeviceAlert Component
**الموقع**: `frontend/src/components/devices/NewDeviceAlert.jsx`

**الميزات**:
- تنبيه منبثق عند اكتشاف جهاز جديد
- عرض معلومات الجهاز والموقع
- خيارات: تحديد كموثوق، تغيير كلمة المرور، عرض الأجهزة

## 🔄 التدفق (Flow)

### 1. تسجيل الدخول
```
User Login
    ↓
Authentication Middleware (protect)
    ↓
Device Tracking Middleware (trackLoginDevice)
    ↓
Generate Device Fingerprint
    ↓
Check if Device Exists in DB
    ↓
┌─────────────────┬─────────────────┐
│  Device Exists  │  New Device     │
│  ↓              │  ↓              │
│  Update Login   │  Create Record  │
│  Count & Time   │  ↓              │
│                 │  Send Alert     │
│                 │  Notification   │
└─────────────────┴─────────────────┘
    ↓
Continue to Protected Route
```

### 2. إدارة الأجهزة
```
User → Devices Page
    ↓
Fetch All Devices (GET /devices)
    ↓
Display Device List
    ↓
User Actions:
├─ Trust Device (POST /devices/:id/trust)
├─ Remove Device (DELETE /devices/:id)
└─ Remove Others (DELETE /devices/others/all)
```

## 📊 Device Fingerprinting

### كيف يعمل؟
يتم توليد معرف فريد للجهاز (fingerprint) بناءً على:
- User Agent
- Accept-Language header
- Accept-Encoding header

```javascript
const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
const deviceId = crypto.createHash('sha256').update(fingerprint).digest('hex');
```

### لماذا هذه الطريقة؟
- ✅ لا تتطلب cookies أو localStorage
- ✅ تعمل عبر المتصفحات المختلفة
- ✅ مستقرة نسبياً (لا تتغير بسهولة)
- ⚠️ ليست دقيقة 100% (قد تتغير مع تحديثات المتصفح)

## 🔐 الأمان

### 1. حماية البيانات
- ✅ جميع endpoints محمية بـ authentication
- ✅ المستخدم يمكنه فقط الوصول لأجهزته
- ✅ لا يمكن حذف الجهاز الحالي

### 2. الخصوصية
- ✅ لا يتم حفظ معلومات حساسة
- ✅ IP address يُحفظ لأغراض الأمان فقط
- ✅ يمكن للمستخدم حذف أي جهاز

### 3. التنبيهات
- ✅ تنبيه فوري عند جهاز جديد
- ✅ أولوية urgent للإشعار
- ✅ يتم إرسال التنبيه مرة واحدة فقط

## 📱 الاستخدام

### Backend

#### تفعيل Device Tracking في Route
```javascript
const { protect } = require('../middleware/auth');
const { trackLoginDevice } = require('../middleware/deviceTracking');

router.post('/login', 
  authController.login,
  protect,
  trackLoginDevice,
  (req, res) => {
    // req.loginDevice - معلومات الجهاز
    // req.isNewDevice - هل الجهاز جديد؟
  }
);
```

#### استخدام requireTrustedDevice للعمليات الحساسة
```javascript
const { requireTrustedDevice } = require('../middleware/deviceTracking');

router.post('/sensitive-operation',
  protect,
  trackLoginDevice,
  requireTrustedDevice,
  controller.sensitiveOperation
);
```

### Frontend

#### استخدام DeviceList Component
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

#### استخدام NewDeviceAlert Component
```jsx
import NewDeviceAlert from '../components/devices/NewDeviceAlert';

function App() {
  const [showAlert, setShowAlert] = useState(false);
  const [notification, setNotification] = useState(null);

  // عند استقبال إشعار جهاز جديد
  useEffect(() => {
    if (notification?.type === 'new_device_login') {
      setShowAlert(true);
    }
  }, [notification]);

  return (
    <>
      {showAlert && (
        <NewDeviceAlert
          notification={notification}
          onClose={() => setShowAlert(false)}
          onTrust={handleTrustDevice}
        />
      )}
    </>
  );
}
```

## 🧪 الاختبار

### اختبار Backend
```bash
# تثبيت التبعيات
cd backend
npm install

# تشغيل السيرفر
npm start

# اختبار Endpoints
curl -X GET http://localhost:5000/devices \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### اختبار Frontend
```bash
# تثبيت التبعيات
cd frontend
npm install

# تشغيل التطبيق
npm run dev

# الوصول للصفحة
http://localhost:3000/devices
```

### سيناريوهات الاختبار

#### 1. تسجيل دخول من جهاز جديد
1. سجل دخول من متصفح جديد
2. يجب أن يظهر إشعار "تسجيل دخول من جهاز جديد"
3. تحقق من ظهور الجهاز في قائمة الأجهزة

#### 2. تحديد جهاز كموثوق
1. افتح قائمة الأجهزة
2. اضغط "تحديد كموثوق" على جهاز
3. سجل دخول مرة أخرى من نفس الجهاز
4. يجب ألا يظهر تنبيه

#### 3. حذف جهاز
1. افتح قائمة الأجهزة
2. اضغط "حذف" على جهاز (ليس الحالي)
3. يجب أن يختفي الجهاز من القائمة

## 📈 التحسينات المستقبلية

### 1. GeoIP Integration
- استخدام خدمة GeoIP حقيقية (MaxMind)
- عرض موقع دقيق على الخريطة

### 2. Device Fingerprinting المتقدم
- استخدام Canvas fingerprinting
- WebGL fingerprinting
- Audio fingerprinting

### 3. Machine Learning
- اكتشاف أنماط تسجيل الدخول المشبوهة
- تنبيهات ذكية بناءً على السلوك

### 4. Multi-Factor Authentication
- طلب 2FA عند تسجيل دخول من جهاز جديد
- إرسال رمز تأكيد عبر SMS/Email

### 5. Session Management
- عرض الجلسات النشطة
- إنهاء جلسة من جهاز معين
- إنهاء جميع الجلسات

## 🐛 استكشاف الأخطاء

### المشكلة: لا يتم اكتشاف الجهاز الجديد
**الحل**:
- تحقق من أن middleware `trackLoginDevice` مفعّل
- تحقق من أن `ua-parser-js` مثبت
- راجع logs السيرفر

### المشكلة: التنبيه يظهر في كل مرة
**الحل**:
- تحقق من أن الجهاز يُحفظ في قاعدة البيانات
- تحقق من أن device fingerprint ثابت
- حدد الجهاز كموثوق

### المشكلة: لا يمكن حذف جهاز
**الحل**:
- تحقق من أنه ليس الجهاز الحالي
- تحقق من صلاحيات المستخدم
- راجع error logs

## 📚 المراجع

### التبعيات
- `ua-parser-js` - تحليل User Agent
- `crypto` (Node.js built-in) - توليد device fingerprint

### المصادر
- [Device Fingerprinting Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [User Agent Parser](https://github.com/faisalman/ua-parser-js)
- [Security Best Practices](https://owasp.org/www-project-web-security-testing-guide/)

## ✅ Checklist

- [x] إنشاء LoginDevice Model
- [x] إنشاء Device Tracking Service
- [x] إنشاء Device Tracking Middleware
- [x] إنشاء Device Controller
- [x] إنشاء Device Routes
- [x] تحديث Notification Service
- [x] تحديث Notification Model
- [x] إنشاء DeviceList Component
- [x] إنشاء DevicesPage
- [x] إنشاء NewDeviceAlert Component
- [x] تثبيت ua-parser-js
- [x] تحديث app.js
- [x] كتابة التوثيق

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل ومفعّل
