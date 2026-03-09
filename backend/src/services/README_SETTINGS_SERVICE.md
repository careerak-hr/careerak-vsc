# SettingsService Documentation

## Overview

خدمة شاملة لإدارة إعدادات المستخدم في منصة Careerak. تتعامل مع تحديث معلومات الملف الشخصي، إعدادات الخصوصية، وتفضيلات الإشعارات.

**Requirements**: 2.1, 2.2, 6.7, 7.6

## Features

- ✅ تحديث معلومات الملف الشخصي (الاسم، الهاتف، الصورة، اللغة، المنطقة الزمنية)
- ✅ إدارة إعدادات الخصوصية (رؤية الملف، أذونات الرسائل، إظهار البيانات)
- ✅ إدارة تفضيلات الإشعارات (أنواع الإشعارات، ساعات الهدوء، التكرار)
- ✅ التحقق الشامل من صحة المدخلات
- ✅ رفع الصور إلى Cloudinary مع تحسين تلقائي
- ✅ معالجة الأخطاء الشاملة
- ✅ تسجيل جميع العمليات (logging)

## Installation

```bash
# الخدمة موجودة في
backend/src/services/settingsService.js

# التبعيات المطلوبة
npm install mongoose
```

## Usage

### Import

```javascript
const settingsService = require('./services/settingsService');
```

### 1. Update Profile

```javascript
// تحديث الاسم
const result = await settingsService.updateProfile(userId, {
  name: 'أحمد محمد'
});

// تحديث رقم الهاتف
const result = await settingsService.updateProfile(userId, {
  phone: '+201234567890'
});

// تحديث الموقع
const result = await settingsService.updateProfile(userId, {
  country: 'Saudi Arabia',
  city: 'Riyadh'
});

// تحديث اللغة والمنطقة الزمنية
const result = await settingsService.updateProfile(userId, {
  language: 'en',
  timezone: 'America/New_York'
});

// رفع صورة الملف الشخصي
const photoBuffer = req.file.buffer; // من multer
const result = await settingsService.updateProfile(userId, {
  photoBuffer
});

// تحديث عدة حقول معاً
const result = await settingsService.updateProfile(userId, {
  name: 'أحمد محمد',
  country: 'UAE',
  city: 'Dubai',
  language: 'ar',
  timezone: 'Asia/Dubai'
});

// النتيجة
console.log(result.user); // المستخدم المحدث
console.log(result.settings); // الإعدادات المحدثة
```

### 2. Update Privacy Settings

```javascript
// تحديث رؤية الملف الشخصي
const settings = await settingsService.updatePrivacySettings(userId, {
  profileVisibility: 'registered' // everyone, registered, none
});

// إظهار/إخفاء البريد والهاتف
const settings = await settingsService.updatePrivacySettings(userId, {
  showEmail: true,
  showPhone: false
});

// تحديث أذونات الرسائل
const settings = await settingsService.updatePrivacySettings(userId, {
  messagePermissions: 'contacts' // everyone, contacts, none
});

// إظهار/إخفاء حالة النشاط
const settings = await settingsService.updatePrivacySettings(userId, {
  showOnlineStatus: false
});

// السماح/منع فهرسة محركات البحث
const settings = await settingsService.updatePrivacySettings(userId, {
  allowSearchEngineIndexing: false
});

// تحديث جميع إعدادات الخصوصية معاً
const settings = await settingsService.updatePrivacySettings(userId, {
  profileVisibility: 'none',
  showEmail: false,
  showPhone: false,
  messagePermissions: 'none',
  showOnlineStatus: false,
  allowSearchEngineIndexing: false
});

// النتيجة
console.log(settings.privacy); // إعدادات الخصوصية المحدثة
```

### 3. Update Notification Preferences

```javascript
// تحديث إشعارات الوظائف
const settings = await settingsService.updateNotificationPreferences(userId, {
  job: {
    enabled: true,
    inApp: true,
    email: true,
    push: false
  }
});

// تحديث عدة أنواع من الإشعارات
const settings = await settingsService.updateNotificationPreferences(userId, {
  job: { enabled: true, email: true },
  course: { enabled: true, push: true },
  chat: { enabled: true, inApp: true },
  review: { enabled: false },
  system: { enabled: true }
});

// تحديث ساعات الهدوء
const settings = await settingsService.updateNotificationPreferences(userId, {
  quietHours: {
    enabled: true,
    start: '22:00', // HH:mm format
    end: '08:00'
  }
});

// تحديث تكرار الإشعارات
const settings = await settingsService.updateNotificationPreferences(userId, {
  frequency: 'daily' // immediate, daily, weekly
});

// تحديث جميع تفضيلات الإشعارات معاً
const settings = await settingsService.updateNotificationPreferences(userId, {
  job: { enabled: true, email: true, push: true },
  course: { enabled: true },
  chat: { enabled: true },
  quietHours: {
    enabled: true,
    start: '23:00',
    end: '07:00'
  },
  frequency: 'weekly'
});

// النتيجة
console.log(settings.notifications); // تفضيلات الإشعارات المحدثة
```

### 4. Get User Settings

```javascript
// الحصول على جميع إعدادات المستخدم
const settings = await settingsService.getUserSettings(userId);

console.log(settings.privacy); // إعدادات الخصوصية
console.log(settings.notifications); // تفضيلات الإشعارات
console.log(settings.preferences); // التفضيلات العامة
```

## API Reference

### updateProfile(userId, updates)

تحديث معلومات الملف الشخصي للمستخدم.

**Parameters:**
- `userId` (string): معرف المستخدم
- `updates` (Object): التحديثات المطلوبة
  - `name` (string, optional): الاسم الجديد
  - `phone` (string, optional): رقم الهاتف الجديد
  - `country` (string, optional): البلد
  - `city` (string, optional): المدينة
  - `photoBuffer` (Buffer, optional): صورة الملف الشخصي
  - `language` (string, optional): اللغة المفضلة (ar, en, fr)
  - `timezone` (string, optional): المنطقة الزمنية

**Returns:** `Promise<Object>`
```javascript
{
  user: User,      // المستخدم المحدث
  settings: UserSettings  // الإعدادات المحدثة
}
```

**Throws:**
- `Error('المستخدم غير موجود')` - إذا لم يتم العثور على المستخدم
- `Error('الاسم لا يمكن أن يكون فارغاً')` - إذا كان الاسم فارغاً
- `Error('الاسم طويل جداً')` - إذا كان الاسم أطول من 100 حرف
- `Error('رقم الهاتف مستخدم بالفعل')` - إذا كان الرقم مكرراً
- `Error('صيغة رقم الهاتف غير صحيحة')` - إذا كانت صيغة الرقم خاطئة
- `Error('اللغة غير مدعومة')` - إذا كانت اللغة غير مدعومة
- `Error('حجم الصورة كبير جداً')` - إذا كانت الصورة أكبر من 5MB
- `Error('الصورة يجب أن تكون من نوع Buffer')` - إذا لم تكن الصورة Buffer

### updatePrivacySettings(userId, settings)

تحديث إعدادات الخصوصية للمستخدم.

**Parameters:**
- `userId` (string): معرف المستخدم
- `settings` (Object): إعدادات الخصوصية
  - `profileVisibility` (string, optional): رؤية الملف الشخصي (everyone, registered, none)
  - `showEmail` (boolean, optional): إظهار البريد الإلكتروني
  - `showPhone` (boolean, optional): إظهار رقم الهاتف
  - `messagePermissions` (string, optional): أذونات الرسائل (everyone, contacts, none)
  - `showOnlineStatus` (boolean, optional): إظهار حالة النشاط
  - `allowSearchEngineIndexing` (boolean, optional): السماح بفهرسة محركات البحث

**Returns:** `Promise<UserSettings>` - الإعدادات المحدثة

**Throws:**
- `Error('المستخدم غير موجود')` - إذا لم يتم العثور على المستخدم
- `Error('قيمة رؤية الملف الشخصي غير صحيحة')` - إذا كانت القيمة غير صحيحة
- `Error('قيمة أذونات الرسائل غير صحيحة')` - إذا كانت القيمة غير صحيحة
- `Error('{field} يجب أن يكون قيمة منطقية')` - إذا لم تكن القيمة boolean

### updateNotificationPreferences(userId, preferences)

تحديث تفضيلات الإشعارات للمستخدم.

**Parameters:**
- `userId` (string): معرف المستخدم
- `preferences` (Object): تفضيلات الإشعارات
  - `job` (Object, optional): إشعارات الوظائف
    - `enabled` (boolean): تفعيل/تعطيل
    - `inApp` (boolean): إشعارات داخل التطبيق
    - `email` (boolean): إشعارات البريد الإلكتروني
    - `push` (boolean): إشعارات Push
  - `course` (Object, optional): إشعارات الدورات (نفس الهيكل)
  - `chat` (Object, optional): إشعارات المحادثات (نفس الهيكل)
  - `review` (Object, optional): إشعارات التقييمات (نفس الهيكل)
  - `system` (Object, optional): إشعارات النظام (نفس الهيكل)
  - `quietHours` (Object, optional): ساعات الهدوء
    - `enabled` (boolean): تفعيل/تعطيل
    - `start` (string): وقت البداية (HH:mm)
    - `end` (string): وقت النهاية (HH:mm)
  - `frequency` (string, optional): تكرار الإشعارات (immediate, daily, weekly)

**Returns:** `Promise<UserSettings>` - الإعدادات المحدثة

**Throws:**
- `Error('المستخدم غير موجود')` - إذا لم يتم العثور على المستخدم
- `Error('قيمة تكرار الإشعارات غير صحيحة')` - إذا كانت القيمة غير صحيحة
- `Error('{type}.{field} يجب أن يكون قيمة منطقية')` - إذا لم تكن القيمة boolean
- `Error('صيغة وقت البداية غير صحيحة')` - إذا كانت صيغة الوقت خاطئة
- `Error('صيغة وقت النهاية غير صحيحة')` - إذا كانت صيغة الوقت خاطئة

### getUserSettings(userId)

الحصول على جميع إعدادات المستخدم.

**Parameters:**
- `userId` (string): معرف المستخدم

**Returns:** `Promise<UserSettings>` - إعدادات المستخدم

**Note:** إذا لم تكن الإعدادات موجودة، يتم إنشاء إعدادات افتراضية تلقائياً.

## Validation Rules

### Profile Updates

| Field | Type | Validation |
|-------|------|------------|
| name | string | غير فارغ، أقل من 100 حرف |
| phone | string | صيغة صحيحة (10-15 رقم)، غير مكرر |
| language | string | ar, en, أو fr فقط |
| photoBuffer | Buffer | حجم أقل من 5MB |

### Privacy Settings

| Field | Type | Allowed Values |
|-------|------|----------------|
| profileVisibility | string | everyone, registered, none |
| showEmail | boolean | true, false |
| showPhone | boolean | true, false |
| messagePermissions | string | everyone, contacts, none |
| showOnlineStatus | boolean | true, false |
| allowSearchEngineIndexing | boolean | true, false |

### Notification Preferences

| Field | Type | Allowed Values |
|-------|------|----------------|
| {type}.enabled | boolean | true, false |
| {type}.inApp | boolean | true, false |
| {type}.email | boolean | true, false |
| {type}.push | boolean | true, false |
| quietHours.start | string | HH:mm (00:00 - 23:59) |
| quietHours.end | string | HH:mm (00:00 - 23:59) |
| frequency | string | immediate, daily, weekly |

## Error Handling

جميع الدوال ترمي أخطاء واضحة باللغة العربية:

```javascript
try {
  await settingsService.updateProfile(userId, updates);
} catch (error) {
  console.error(error.message); // رسالة خطأ واضحة بالعربية
  
  // أمثلة على رسائل الأخطاء:
  // - "المستخدم غير موجود"
  // - "الاسم لا يمكن أن يكون فارغاً"
  // - "رقم الهاتف مستخدم بالفعل"
  // - "حجم الصورة كبير جداً (الحد الأقصى 5MB)"
}
```

## Integration with Other Services

### Cloudinary Integration

```javascript
// رفع الصور يتم تلقائياً مع:
// - تحسين الحجم (400x400)
// - تحسين الجودة (auto)
// - تحسين التنسيق (auto - WebP للمتصفحات الحديثة)
// - التركيز على الوجه (gravity: face)

const result = await settingsService.updateProfile(userId, {
  photoBuffer: req.file.buffer
});

console.log(result.user.profileImage); // URL من Cloudinary
```

### Notification Service Integration

```javascript
// يمكن دمج SettingsService مع NotificationService
const notificationService = require('./notificationService');
const settingsService = require('./settingsService');

// التحقق من تفضيلات الإشعارات قبل الإرسال
const settings = await settingsService.getUserSettings(userId);

if (settings.notifications.job.enabled) {
  await notificationService.notifyJobMatch(userId, jobId);
}
```

## Testing

```bash
# تشغيل الاختبارات
npm test -- settingsService.test.js

# تشغيل اختبارات محددة
npm test -- settingsService.test.js -t "updateProfile"

# تشغيل مع coverage
npm test -- settingsService.test.js --coverage
```

### Test Coverage

- ✅ 60+ unit tests
- ✅ جميع الدوال مغطاة
- ✅ جميع حالات الخطأ مغطاة
- ✅ جميع قواعد التحقق مغطاة

## Performance Considerations

1. **Database Queries**: استخدام indexes محسّنة على userId
2. **Image Upload**: معالجة غير متزامنة مع Cloudinary
3. **Validation**: التحقق من الصحة قبل الوصول للقاعدة
4. **Upsert**: استخدام upsert لإنشاء إعدادات افتراضية تلقائياً

## Security Considerations

1. **Input Validation**: التحقق الشامل من جميع المدخلات
2. **Phone Uniqueness**: منع تكرار أرقام الهاتف
3. **File Size Limit**: الحد الأقصى 5MB للصور
4. **User Verification**: التحقق من وجود المستخدم قبل أي عملية

## Future Enhancements

- [ ] دعم تحديث البريد الإلكتروني مع OTP verification
- [ ] دعم تغيير كلمة المرور
- [ ] دعم المصادقة الثنائية (2FA)
- [ ] سجل تغييرات الإعدادات (audit log)
- [ ] Undo/Redo للتغييرات الأخيرة

## Related Files

- `backend/src/models/User.js` - نموذج المستخدم
- `backend/src/models/UserSettings.js` - نموذج الإعدادات
- `backend/src/services/notificationService.js` - خدمة الإشعارات
- `backend/src/config/cloudinary.js` - إعدادات Cloudinary
- `backend/src/tests/settingsService.test.js` - الاختبارات

## Support

للأسئلة أو المشاكل، يرجى:
1. مراجعة التوثيق أعلاه
2. فحص الاختبارات للأمثلة
3. التحقق من logs للأخطاء

## Changelog

### Version 1.0.0 (2026-03-07)
- ✅ تنفيذ updateProfile
- ✅ تنفيذ updatePrivacySettings
- ✅ تنفيذ updateNotificationPreferences
- ✅ تنفيذ getUserSettings
- ✅ التحقق الشامل من المدخلات
- ✅ رفع الصور إلى Cloudinary
- ✅ 60+ unit tests
- ✅ توثيق شامل
