# Settings API Endpoints Documentation

## Overview

تم تطوير API endpoints كاملة لصفحة الإعدادات في منصة Careerak. جميع المسارات محمية بـ authentication middleware.

**Base URL**: `/settings`

---

## Controllers

### 1. SettingsController
معالج طلبات الإعدادات الأساسية (Profile, Email, Phone, Password, Privacy, Notifications)

**الملف**: `backend/src/controllers/settingsController.js`

### 2. SecurityController
معالج طلبات الأمان (2FA, Sessions, Login History)

**الملف**: `backend/src/controllers/securityController.js`

### 3. DataController
معالج طلبات البيانات (Export, Account Deletion)

**الملف**: `backend/src/controllers/dataController.js`

---

## API Endpoints

### Profile Management

#### PUT /settings/profile
تحديث معلومات الملف الشخصي

**Request Body**:
```json
{
  "name": "string",
  "profilePicture": "string (URL)",
  "language": "ar | en | fr",
  "timezone": "string"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "profilePicture": "string",
      "language": "string",
      "timezone": "string"
    }
  },
  "message": "تم تحديث الملف الشخصي بنجاح"
}
```

---

### Email Change

#### POST /settings/email/change
بدء عملية تغيير البريد الإلكتروني

**Request Body**:
```json
{
  "newEmail": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم إرسال رموز التحقق إلى البريدين القديم والجديد"
}
```

#### POST /settings/email/verify
التحقق من OTPs وإتمام تغيير البريد

**Request Body**:
```json
{
  "oldEmailOTP": "string",
  "newEmailOTP": "string",
  "password": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم تغيير البريد الإلكتروني بنجاح"
}
```

---

### Phone Change

#### POST /settings/phone/change
تغيير رقم الهاتف

**Request Body**:
```json
{
  "newPhone": "string",
  "otp": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم تغيير رقم الهاتف بنجاح"
}
```

---

### Password Change

#### POST /settings/password/change
تغيير كلمة المرور

**Request Body**:
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

---

### Privacy Settings

#### GET /settings/privacy
الحصول على إعدادات الخصوصية

**Response**:
```json
{
  "success": true,
  "data": {
    "privacy": {
      "profileVisibility": "everyone | registered | none",
      "showEmail": "boolean",
      "showPhone": "boolean",
      "messagePermissions": "everyone | contacts | none",
      "showOnlineStatus": "boolean",
      "allowSearchEngineIndexing": "boolean"
    }
  }
}
```

#### PUT /settings/privacy
تحديث إعدادات الخصوصية

**Request Body**:
```json
{
  "profileVisibility": "everyone | registered | none",
  "showEmail": "boolean",
  "showPhone": "boolean",
  "messagePermissions": "everyone | contacts | none",
  "showOnlineStatus": "boolean",
  "allowSearchEngineIndexing": "boolean"
}
```

---

### Notification Preferences

#### GET /settings/notifications
الحصول على تفضيلات الإشعارات

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": {
      "job": { "enabled": "boolean", "inApp": "boolean", "email": "boolean", "push": "boolean" },
      "course": { "enabled": "boolean", "inApp": "boolean", "email": "boolean", "push": "boolean" },
      "chat": { "enabled": "boolean", "inApp": "boolean", "email": "boolean", "push": "boolean" },
      "review": { "enabled": "boolean", "inApp": "boolean", "email": "boolean", "push": "boolean" },
      "system": { "enabled": "boolean", "inApp": "boolean", "email": "boolean", "push": "boolean" },
      "quietHours": { "enabled": "boolean", "start": "string (HH:mm)", "end": "string (HH:mm)" },
      "frequency": "immediate | daily | weekly"
    }
  }
}
```

#### PUT /settings/notifications
تحديث تفضيلات الإشعارات

**Request Body**: نفس بنية الـ Response أعلاه

---

### Two-Factor Authentication

#### POST /settings/2fa/enable
تفعيل المصادقة الثنائية

**Response**:
```json
{
  "success": true,
  "data": {
    "qrCode": "string (data URL)",
    "secret": "string",
    "backupCodes": ["string", "string", ...]
  },
  "message": "تم تفعيل المصادقة الثنائية بنجاح"
}
```

#### POST /settings/2fa/disable
تعطيل المصادقة الثنائية

**Request Body**:
```json
{
  "otp": "string",
  "password": "string"
}
```

#### GET /settings/2fa/backup-codes
الحصول على أكواد الاحتياط

**Response**:
```json
{
  "success": true,
  "data": {
    "backupCodes": ["string", "string", ...]
  }
}
```

#### POST /settings/2fa/regenerate-codes
إعادة إنشاء أكواد الاحتياط

**Response**:
```json
{
  "success": true,
  "data": {
    "backupCodes": ["string", "string", ...]
  },
  "message": "تم إعادة إنشاء أكواد الاحتياط بنجاح"
}
```

---

### Session Management

#### GET /settings/sessions
الحصول على جميع الجلسات النشطة

**Response**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "_id": "string",
        "device": {
          "type": "desktop | mobile | tablet",
          "os": "string",
          "browser": "string"
        },
        "location": {
          "ipAddress": "string",
          "country": "string",
          "city": "string"
        },
        "loginTime": "date",
        "lastActivity": "date",
        "isCurrent": "boolean"
      }
    ]
  }
}
```

#### DELETE /settings/sessions/:id
تسجيل الخروج من جلسة محددة

**Response**:
```json
{
  "success": true,
  "message": "تم تسجيل الخروج من الجلسة بنجاح"
}
```

#### DELETE /settings/sessions/others
تسجيل الخروج من جميع الجلسات الأخرى

**Response**:
```json
{
  "success": true,
  "message": "تم تسجيل الخروج من جميع الجلسات الأخرى بنجاح"
}
```

---

### Login History

#### GET /settings/login-history
الحصول على سجل تسجيل الدخول

**Query Parameters**:
- `limit` (optional): عدد السجلات (default: 50)

**Response**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "timestamp": "date",
        "success": "boolean",
        "device": {
          "type": "string",
          "os": "string",
          "browser": "string"
        },
        "location": {
          "ipAddress": "string",
          "country": "string",
          "city": "string"
        }
      }
    ]
  }
}
```

---

### Data Export

#### POST /settings/data/export
طلب تصدير البيانات

**Request Body**:
```json
{
  "dataTypes": ["profile", "activity", "messages", "applications", "courses"],
  "format": "json | csv | pdf"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requestId": "string"
  },
  "message": "تم إنشاء طلب التصدير بنجاح. سيتم إشعارك عند اكتمال التصدير."
}
```

#### GET /settings/data/export/:id
التحقق من حالة التصدير

**Response**:
```json
{
  "success": true,
  "data": {
    "status": {
      "status": "pending | processing | completed | failed",
      "progress": "number (0-100)",
      "downloadUrl": "string (if completed)",
      "expiresAt": "date (if completed)"
    }
  }
}
```

#### GET /settings/data/download/:token
تحميل البيانات المصدرة

**Response**: File download (JSON, CSV, or PDF)

---

### Account Deletion

#### POST /settings/account/delete
طلب حذف الحساب

**Request Body**:
```json
{
  "type": "immediate | scheduled",
  "password": "string",
  "otp": "string (if 2FA enabled)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم حذف حسابك بنجاح" | "تم جدولة حذف حسابك. لديك 30 يوماً لإلغاء الحذف."
}
```

#### POST /settings/account/cancel-deletion
إلغاء طلب حذف الحساب

**Response**:
```json
{
  "success": true,
  "message": "تم إلغاء طلب حذف الحساب بنجاح"
}
```

#### GET /settings/account/deletion-status
التحقق من حالة حذف الحساب

**Response**:
```json
{
  "success": true,
  "data": {
    "status": {
      "type": "immediate | scheduled",
      "status": "pending | cancelled | completed",
      "scheduledDate": "date",
      "daysRemaining": "number"
    }
  }
}
```

---

## Error Responses

جميع الـ endpoints تُرجع أخطاء بالتنسيق التالي:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة الخطأ بالعربية",
    "field": "اسم الحقل (اختياري)"
  }
}
```

### Error Codes الشائعة

- `INVALID_NAME`: الاسم غير صحيح
- `INVALID_EMAIL`: البريد الإلكتروني غير صحيح
- `EMAIL_ALREADY_EXISTS`: البريد الإلكتروني مستخدم بالفعل
- `PHONE_ALREADY_EXISTS`: رقم الهاتف مستخدم بالفعل
- `INVALID_OTP`: رمز التحقق غير صحيح
- `INVALID_PASSWORD`: كلمة المرور غير صحيحة
- `WEAK_PASSWORD`: كلمة المرور ضعيفة
- `INVALID_TOKEN`: رابط التحميل غير صحيح أو منتهي الصلاحية
- `FORBIDDEN`: غير مصرح بالوصول
- `UPDATE_FAILED`: فشل التحديث
- `GET_FAILED`: فشل الحصول على البيانات

---

## Authentication

جميع المسارات تتطلب JWT token في الـ header:

```
Authorization: Bearer <token>
```

---

## Testing

تم إنشاء integration tests شاملة في:
`backend/src/tests/settingsApi.integration.test.js`

**تشغيل الاختبارات**:
```bash
npm test -- settingsApi.integration.test.js
```

**الاختبارات المغطاة**:
1. تدفق تغيير البريد الكامل
2. تدفق تفعيل 2FA
3. تدفق حذف الحساب
4. تحديث الملف الشخصي
5. إعدادات الخصوصية
6. تفضيلات الإشعارات
7. إدارة الجلسات
8. تصدير البيانات

---

## Integration

تم إضافة المسار في `backend/src/app.js`:

```javascript
app.use('/settings', require('./routes/settingsRoutes'));
```

---

## Next Steps

المهام القادمة:
- المهمة 15: تطبيق حماية الأمان (CSRF, Rate Limiting, Input Validation)
- المهمة 16: Checkpoint - التأكد من عمل جميع APIs والأمان
- المهمة 17-22: تطوير واجهة المستخدم (Frontend)

---

**تاريخ الإنشاء**: 2026-03-09  
**الحالة**: ✅ مكتمل
