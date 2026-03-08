# Settings Page Models Documentation

هذا الملف يوثق جميع نماذج MongoDB المستخدمة في صفحة الإعدادات المحسّنة.

## النماذج المنشأة

### 1. UserSettings
**الملف**: `UserSettings.js`  
**الوصف**: يخزن جميع إعدادات المستخدم (الخصوصية، الإشعارات، الأمان، التفضيلات)

**الحقول الرئيسية**:
- `userId`: مرجع للمستخدم (فريد)
- `privacy`: إعدادات الخصوصية (رؤية الملف، إظهار البريد/الهاتف، أذونات الرسائل)
- `notifications`: تفضيلات الإشعارات (5 أنواع، ساعات الهدوء، التكرار)
- `security`: إعدادات الأمان (2FA، أكواد احتياطية، أجهزة موثوقة)
- `preferences`: تفضيلات عامة (اللغة، المنطقة الزمنية)

**Indexes**:
- `userId`: unique index
- `updatedAt`: ascending index

**Methods**:
- `isInQuietHours()`: يتحقق إذا كان الوقت الحالي ضمن ساعات الهدوء

---

### 2. ActiveSession
**الملف**: `ActiveSession.js`  
**الوصف**: يتتبع جميع الجلسات النشطة للمستخدمين

**الحقول الرئيسية**:
- `userId`: مرجع للمستخدم
- `token`: hash لـ JWT token (فريد)
- `device`: معلومات الجهاز (النوع، OS، المتصفح، fingerprint)
- `location`: معلومات الموقع (IP، الدولة، المدينة، الإحداثيات)
- `loginTime`: وقت تسجيل الدخول
- `lastActivity`: آخر نشاط
- `expiresAt`: وقت انتهاء الصلاحية
- `isTrusted`: علامة للأجهزة الموثوقة

**Indexes**:
- `userId`: index
- `token`: unique index
- `expiresAt`: index
- `userId + expiresAt`: compound index
- `expiresAt`: TTL index (expireAfterSeconds: 0)

**Methods**:
- `updateActivity()`: يحدث آخر نشاط
- `isExpired()`: يتحقق إذا انتهت صلاحية الجلسة

**Statics**:
- `findByUserId(userId)`: يجلب جميع الجلسات النشطة للمستخدم
- `findByToken(tokenHash)`: يجلب جلسة بواسطة token
- `invalidateUserSessions(userId, exceptSessionId)`: يلغي جميع جلسات المستخدم

---

### 3. LoginHistory
**الملف**: `LoginHistory.js`  
**الوصف**: يسجل جميع محاولات تسجيل الدخول (ناجحة وفاشلة)

**الحقول الرئيسية**:
- `userId`: مرجع للمستخدم
- `timestamp`: وقت المحاولة
- `success`: نجاح/فشل المحاولة
- `failureReason`: سبب الفشل (إن وجد)
- `device`: معلومات الجهاز
- `location`: معلومات الموقع

**Indexes**:
- `userId`: index
- `timestamp`: index
- `userId + timestamp`: compound index (descending)
- `timestamp`: TTL index (90 days)

**Statics**:
- `logAttempt(data)`: يسجل محاولة تسجيل دخول
- `getUserHistory(userId, limit)`: يجلب سجل المستخدم
- `getFailedAttempts(userId, since)`: يحسب المحاولات الفاشلة منذ وقت معين

---

### 4. DataExportRequest
**الملف**: `DataExportRequest.js`  
**الوصف**: يدير طلبات تصدير البيانات الشخصية (GDPR)

**الحقول الرئيسية**:
- `userId`: مرجع للمستخدم
- `dataTypes`: أنواع البيانات المطلوبة (profile, activity, messages, applications, courses)
- `format`: تنسيق التصدير (json, csv, pdf)
- `status`: حالة الطلب (pending, processing, completed, failed)
- `progress`: نسبة الإنجاز (0-100)
- `fileUrl`: رابط الملف المصدّر
- `fileSize`: حجم الملف
- `downloadToken`: token للتحميل (فريد)
- `downloadCount`: عدد مرات التحميل
- `requestedAt`: وقت الطلب
- `completedAt`: وقت الإنجاز
- `expiresAt`: وقت انتهاء الصلاحية (7 أيام بعد الإنجاز)

**Indexes**:
- `userId`: index
- `status`: index
- `downloadToken`: unique sparse index
- `userId + requestedAt`: compound index (descending)
- `expiresAt`: TTL index

**Methods**:
- `markAsProcessing()`: يحدد الحالة كـ processing
- `updateProgress(progress)`: يحدث نسبة الإنجاز
- `markAsCompleted(fileUrl, fileSize)`: يحدد الحالة كـ completed
- `markAsFailed()`: يحدد الحالة كـ failed
- `generateDownloadToken()`: ينشئ token للتحميل
- `incrementDownloadCount()`: يزيد عداد التحميل
- `isExpired()`: يتحقق إذا انتهت صلاحية الرابط

**Statics**:
- `findByToken(token)`: يجلب طلب بواسطة download token
- `getUserRequests(userId)`: يجلب طلبات المستخدم

---

### 5. AccountDeletionRequest
**الملف**: `AccountDeletionRequest.js`  
**الوصف**: يدير طلبات حذف الحسابات مع فترة السماح

**الحقول الرئيسية**:
- `userId`: مرجع للمستخدم (فريد)
- `type`: نوع الحذف (immediate, scheduled)
- `reason`: سبب الحذف (اختياري)
- `status`: حالة الطلب (pending, cancelled, completed)
- `requestedAt`: وقت الطلب
- `scheduledDate`: تاريخ الحذف المجدول (30 يوم بعد الطلب)
- `completedAt`: وقت إتمام الحذف
- `cancelledAt`: وقت إلغاء الطلب
- `reminderSent`: علامة إرسال التذكير

**Indexes**:
- `userId`: unique index
- `status`: index
- `scheduledDate`: index
- `status + scheduledDate`: compound index

**Pre-save Hook**:
- يضبط `scheduledDate` تلقائياً لـ 30 يوم من الآن للحذف المجدول

**Methods**:
- `cancel()`: يلغي طلب الحذف
- `complete()`: يكمل الحذف
- `markReminderSent()`: يحدد أن التذكير تم إرساله
- `getDaysRemaining()`: يحسب الأيام المتبقية
- `shouldSendReminder()`: يتحقق إذا يجب إرسال تذكير (7 أيام قبل الحذف)
- `isReadyForDeletion()`: يتحقق إذا الطلب جاهز للتنفيذ

**Statics**:
- `findPendingDeletions()`: يجلب الطلبات الجاهزة للحذف
- `findDeletionsNeedingReminder()`: يجلب الطلبات التي تحتاج تذكير

---

### 6. EmailChangeRequest
**الملف**: `EmailChangeRequest.js`  
**الوصف**: يدير طلبات تغيير البريد الإلكتروني مع التحقق المزدوج

**الحقول الرئيسية**:
- `userId`: مرجع للمستخدم
- `oldEmail`: البريد القديم
- `newEmail`: البريد الجديد
- `oldEmailOTP`: OTP للبريد القديم (مشفر، مخفي)
- `newEmailOTP`: OTP للبريد الجديد (مشفر، مخفي)
- `oldEmailVerified`: علامة التحقق من البريد القديم
- `newEmailVerified`: علامة التحقق من البريد الجديد
- `status`: حالة الطلب (pending, completed, expired)
- `createdAt`: وقت الإنشاء
- `expiresAt`: وقت انتهاء الصلاحية (15 دقيقة)
- `completedAt`: وقت الإنجاز

**Indexes**:
- `userId`: index
- `status`: index
- `expiresAt`: TTL index

**Pre-save Hook**:
- يضبط `expiresAt` تلقائياً لـ 15 دقيقة من الآن

**Methods**:
- `verifyOldEmail()`: يحدد البريد القديم كمحقق
- `verifyNewEmail()`: يحدد البريد الجديد كمحقق
- `complete()`: يكمل الطلب
- `isExpired()`: يتحقق إذا انتهت صلاحية الطلب
- `isBothEmailsVerified()`: يتحقق إذا تم التحقق من كلا البريدين
- `verifyOTP(email, otp)`: يتحقق من OTP لبريد معين

**Statics**:
- `createRequest(userId, oldEmail, newEmail, oldOTP, newOTP)`: ينشئ طلب جديد
- `findPendingRequest(userId)`: يجلب طلب معلق للمستخدم

---

### 7. PhoneChangeRequest
**الملف**: `PhoneChangeRequest.js`  
**الوصف**: يدير طلبات تغيير رقم الهاتف مع التحقق

**الحقول الرئيسية**:
- `userId`: مرجع للمستخدم
- `oldPhone`: الرقم القديم
- `newPhone`: الرقم الجديد
- `otp`: OTP للتحقق (مشفر، مخفي)
- `verified`: علامة التحقق
- `status`: حالة الطلب (pending, completed, expired)
- `createdAt`: وقت الإنشاء
- `expiresAt`: وقت انتهاء الصلاحية (10 دقائق)
- `completedAt`: وقت الإنجاز

**Indexes**:
- `userId`: index
- `status`: index
- `expiresAt`: TTL index

**Pre-save Hook**:
- يضبط `expiresAt` تلقائياً لـ 10 دقائق من الآن

**Methods**:
- `verify()`: يحدد الطلب كمحقق
- `complete()`: يكمل الطلب
- `isExpired()`: يتحقق إذا انتهت صلاحية الطلب
- `verifyOTP(otp)`: يتحقق من OTP

**Statics**:
- `createRequest(userId, oldPhone, newPhone, otp)`: ينشئ طلب جديد
- `findPendingRequest(userId)`: يجلب طلب معلق للمستخدم

---

## TTL Indexes (التنظيف التلقائي)

النماذج التالية تستخدم TTL indexes للتنظيف التلقائي:

1. **ActiveSession**: تُحذف تلقائياً عند `expiresAt`
2. **LoginHistory**: تُحذف تلقائياً بعد 90 يوم من `timestamp`
3. **DataExportRequest**: تُحذف تلقائياً عند `expiresAt` (7 أيام بعد الإنجاز)
4. **EmailChangeRequest**: تُحذف تلقائياً عند `expiresAt` (15 دقيقة)
5. **PhoneChangeRequest**: تُحذف تلقائياً عند `expiresAt` (10 دقائق)

## الاستخدام

### مثال: إنشاء إعدادات مستخدم جديد
```javascript
const UserSettings = require('./models/UserSettings');

const settings = await UserSettings.create({
  userId: user._id,
  privacy: {
    profileVisibility: 'everyone',
    showEmail: false,
    showPhone: false
  },
  notifications: {
    job: { enabled: true, inApp: true, email: true, push: false },
    quietHours: { enabled: true, start: '22:00', end: '08:00' }
  }
});
```

### مثال: تسجيل جلسة نشطة
```javascript
const ActiveSession = require('./models/ActiveSession');

const session = await ActiveSession.create({
  userId: user._id,
  token: hashedToken,
  device: {
    type: 'mobile',
    os: 'Android 12',
    browser: 'Chrome 98',
    fingerprint: deviceFingerprint
  },
  location: {
    ipAddress: req.ip,
    country: 'Egypt',
    city: 'Cairo'
  },
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
});
```

### مثال: طلب تصدير بيانات
```javascript
const DataExportRequest = require('./models/DataExportRequest');

const exportRequest = await DataExportRequest.create({
  userId: user._id,
  dataTypes: ['profile', 'activity', 'messages'],
  format: 'json'
});

// بعد المعالجة
await exportRequest.markAsCompleted(fileUrl, fileSize);
await exportRequest.generateDownloadToken();
```

### مثال: طلب حذف حساب مجدول
```javascript
const AccountDeletionRequest = require('./models/AccountDeletionRequest');

const deletionRequest = await AccountDeletionRequest.create({
  userId: user._id,
  type: 'scheduled',
  reason: 'لم أعد بحاجة للحساب'
});

// سيتم ضبط scheduledDate تلقائياً لـ 30 يوم من الآن
console.log(`Days remaining: ${deletionRequest.getDaysRemaining()}`);
```

## ملاحظات مهمة

1. **الأمان**: جميع OTPs وأكواد الاحتياط مشفرة باستخدام bcrypt
2. **الخصوصية**: الحقول الحساسة مخفية افتراضياً (`select: false`)
3. **الأداء**: جميع الـ indexes محسّنة للاستعلامات الشائعة
4. **التنظيف**: TTL indexes تضمن حذف البيانات المؤقتة تلقائياً
5. **التكامل**: النماذج تتبع نفس نمط المشروع الموجود

## المتطلبات المحققة

هذه النماذج تحقق المتطلبات التالية:
- **15.1**: التكامل مع الأنظمة الموجودة
- **15.2**: اتباع معايير المشروع

## الخطوات التالية

بعد إنشاء النماذج، الخطوات التالية هي:
1. تطوير الخدمات (Services) التي تستخدم هذه النماذج
2. إنشاء Controllers للـ API endpoints
3. كتابة الاختبارات (Unit tests و Property-based tests)
4. تطوير واجهة المستخدم (Frontend components)
