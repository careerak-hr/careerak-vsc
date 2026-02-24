# 📚 Enhanced Auth API Documentation

## 📋 معلومات الوثيقة

- **اسم الميزة**: Enhanced Authentication System
- **الإصدار**: v1.0.0
- **تاريخ الإنشاء**: 2026-02-23
- **آخر تحديث**: 2026-02-23
- **الحالة**: ✅ مكتمل ومفعّل

---

## 📖 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [Base URL والإعدادات](#base-url-والإعدادات)
3. [Authentication & Authorization](#authentication--authorization)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Authentication Endpoints](#authentication-endpoints)
7. [Email Verification Endpoints](#email-verification-endpoints)
8. [Password Reset Endpoints](#password-reset-endpoints)
9. [OAuth Endpoints](#oauth-endpoints)
10. [2FA Endpoints](#2fa-endpoints)
11. [User Endpoints](#user-endpoints)
12. [Device Tracking Endpoints](#device-tracking-endpoints)
13. [Security Score Endpoints](#security-score-endpoints)
14. [Common Workflows](#common-workflows)
15. [Testing Guide](#testing-guide)
16. [Troubleshooting](#troubleshooting)

---

## 🌟 نظرة عامة

نظام المصادقة المحسّن (Enhanced Auth) يوفر مجموعة شاملة من APIs للتعامل مع:

- ✅ **التسجيل وتسجيل الدخول** - نظام كامل مع validation
- ✅ **OAuth Integration** - Google, Facebook, LinkedIn
- ✅ **Password Security** - قوة كلمة المرور، توليد، تحقق
- ✅ **Email Verification** - تأكيد البريد الإلكتروني
- ✅ **Password Reset** - إعادة تعيين كلمة المرور
- ✅ **Two-Factor Authentication (2FA)** - مصادقة ثنائية
- ✅ **Device Tracking** - تتبع الأجهزة
- ✅ **Security Score** - تقييم أمان الحساب

### الميزات الرئيسية

| الميزة | الوصف | الحالة |
|-------|-------|--------|
| OAuth | Google, Facebook, LinkedIn | ✅ |
| Password Strength | تحليل قوة كلمة المرور | ✅ |
| Email Validation | التحقق الفوري من البريد | ✅ |
| 2FA | TOTP + Backup Codes | ✅ |
| Device Tracking | تتبع الأجهزة المستخدمة | ✅ |
| Security Score | تقييم أمان الحساب | ✅ |

---

## 🔧 Base URL والإعدادات

### Base URLs

| البيئة | Base URL | الوصف |
|--------|----------|--------|
| **Development** | `http://localhost:5000/api` | التطوير المحلي |
| **Staging** | `https://staging-api.careerak.com/api` | بيئة الاختبار |
| **Production** | `https://api.careerak.com/api` | الإنتاج |

### Request Headers

جميع الطلبات يجب أن تتضمن:

```http
Content-Type: application/json
Accept: application/json
Accept-Language: ar  # أو en, fr
```

للطلبات المحمية (Protected):

```http
Authorization: Bearer <access_token>
```

### Response Format

جميع الردود تتبع هذا التنسيق:

```json
{
  "success": true,
  "message": "رسالة بالعربية",
  "messageEn": "Message in English",
  "data": {
    // البيانات المطلوبة
  }
}
```

في حالة الخطأ:

```json
{
  "success": false,
  "message": "رسالة الخطأ بالعربية",
  "messageEn": "Error message in English",
  "error": "error_code",
  "details": {} // اختياري - في Development فقط
}
```

---

## 🔐 Authentication & Authorization

### Access Token

- **النوع**: JWT (JSON Web Token)
- **المدة**: 7 أيام
- **التخزين**: localStorage أو httpOnly cookie
- **الاستخدام**: في header `Authorization: Bearer <token>`

### Refresh Token

- **النوع**: JWT
- **المدة**: 30 يوم
- **التخزين**: httpOnly cookie (آمن)
- **الاستخدام**: لتجديد Access Token

### Token Payload

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "iat": 1708704000,
  "exp": 1709308800
}
```

### Protected Routes

الطلبات المحمية تتطلب:

1. Access Token صالح في header
2. المستخدم موجود ونشط
3. الصلاحيات المناسبة (إذا لزم الأمر)

---

## ❌ Error Handling

### HTTP Status Codes

| الكود | المعنى | الاستخدام |
|------|--------|-----------|
| **200** | OK | نجاح الطلب |
| **201** | Created | تم إنشاء مورد جديد |
| **400** | Bad Request | بيانات غير صحيحة |
| **401** | Unauthorized | غير مصرح (token غير صالح) |
| **403** | Forbidden | ممنوع (لا صلاحيات) |
| **404** | Not Found | المورد غير موجود |
| **409** | Conflict | تعارض (مثل: بريد موجود) |
| **429** | Too Many Requests | تجاوز الحد المسموح |
| **500** | Internal Server Error | خطأ في الخادم |

### Error Codes

| الكود | الوصف (عربي) | الوصف (English) |
|------|--------------|-----------------|
| `INVALID_EMAIL` | البريد الإلكتروني غير صحيح | Invalid email format |
| `EMAIL_EXISTS` | البريد مستخدم بالفعل | Email already exists |
| `WEAK_PASSWORD` | كلمة المرور ضعيفة | Password is too weak |
| `INVALID_CREDENTIALS` | بيانات الدخول غير صحيحة | Invalid credentials |
| `TOKEN_EXPIRED` | انتهت صلاحية الرمز | Token has expired |
| `TOKEN_INVALID` | الرمز غير صالح | Invalid token |
| `USER_NOT_FOUND` | المستخدم غير موجود | User not found |
| `EMAIL_NOT_VERIFIED` | البريد غير مؤكد | Email not verified |
| `2FA_REQUIRED` | المصادقة الثنائية مطلوبة | 2FA required |
| `2FA_INVALID` | رمز المصادقة غير صحيح | Invalid 2FA code |
| `DEVICE_NOT_TRUSTED` | الجهاز غير موثوق | Device not trusted |
| `RATE_LIMIT_EXCEEDED` | تجاوز الحد المسموح | Rate limit exceeded |

### Error Response Example

```json
{
  "success": false,
  "message": "البريد الإلكتروني مستخدم بالفعل",
  "messageEn": "Email already exists",
  "error": "EMAIL_EXISTS",
  "statusCode": 409,
  "timestamp": "2026-02-23T10:30:00.000Z",
  "path": "/api/auth/register"
}
```

---

## ⏱️ Rate Limiting

### الحدود العامة

| Endpoint | الحد | الفترة | الوصف |
|----------|------|--------|-------|
| `/auth/login` | 5 محاولات | 15 دقيقة | تسجيل الدخول |
| `/auth/register` | 3 محاولات | ساعة | التسجيل |
| `/auth/check-email` | 20 طلب | دقيقة | التحقق من البريد |
| `/auth/forgot-password` | 3 محاولات | ساعة | نسيان كلمة المرور |
| `/auth/2fa/verify` | 5 محاولات | 15 دقيقة | التحقق من 2FA |
| **عام** | 100 طلب | دقيقة | جميع الطلبات |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708704060
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "message": "تجاوزت الحد المسموح من الطلبات. حاول مرة أخرى بعد 15 دقيقة",
  "messageEn": "Rate limit exceeded. Try again in 15 minutes",
  "error": "RATE_LIMIT_EXCEEDED",
  "statusCode": 429,
  "retryAfter": 900
}
```

---

## 🔑 Authentication Endpoints

### 1. Check Email Availability

**التحقق من صحة وتوفر البريد الإلكتروني**

```http
POST /auth/check-email
```

#### Description

- **عربي**: يتحقق من صحة صيغة البريد الإلكتروني، يقترح تصحيحات للأخطاء الشائعة، ويتحقق من عدم وجود البريد في قاعدة البيانات
- **English**: Validates email format, suggests corrections for common typos, and checks if email is already registered

#### Authentication Required

❌ No

#### Request Body

```json
{
  "email": "user@example.com"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | البريد الإلكتروني للتحقق منه |

#### Success Response (200 OK)

**البريد متاح:**

```json
{
  "success": true,
  "valid": true,
  "message": "البريد الإلكتروني متاح",
  "messageEn": "Email is available"
}
```

**البريد موجود:**

```json
{
  "success": true,
  "valid": false,
  "error": "هذا البريد مستخدم بالفعل",
  "errorEn": "This email is already in use",
  "action": "login"
}
```

**اقتراح تصحيح:**

```json
{
  "success": true,
  "valid": false,
  "error": "هل تقصد",
  "errorEn": "Did you mean",
  "suggestion": "user@gmail.com"
}
```

#### Error Responses

**400 Bad Request** - بريد غير صحيح:

```json
{
  "success": false,
  "valid": false,
  "error": "البريد الإلكتروني غير صحيح",
  "errorEn": "Invalid email format"
}
```

**500 Internal Server Error**:

```json
{
  "success": false,
  "valid": false,
  "error": "حدث خطأ أثناء التحقق من البريد الإلكتروني",
  "errorEn": "Error checking email"
}
```

#### Example cURL

```bash
curl -X POST https://api.careerak.com/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

#### Example JavaScript

```javascript
const checkEmail = async (email) => {
  const response = await fetch('/api/auth/check-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  return data;
};

// Usage
const result = await checkEmail('user@example.com');
if (result.valid) {
  console.log('Email is available!');
} else if (result.suggestion) {
  console.log(`Did you mean: ${result.suggestion}?`);
} else if (result.action === 'login') {
  console.log('Email exists. Redirect to login.');
}
```

#### Notes

- ✅ يستخدم `validator.js` للتحقق من الصيغة
- ✅ يستخدم `mailcheck` لاقتراح التصحيحات
- ✅ يدعم الأخطاء الشائعة (gmial.com → gmail.com)
- ⚠️ Rate limit: 20 طلب/دقيقة

---

### 2. Validate Password Strength

**التحقق من قوة كلمة المرور**

```http
POST /auth/validate-password
```

#### Description

- **عربي**: يحلل قوة كلمة المرور ويعطي تقييم من 0-4 مع نصائح للتحسين
- **English**: Analyzes password strength and provides a score from 0-4 with improvement suggestions

#### Authentication Required

❌ No

#### Request Body

```json
{
  "password": "MyP@ssw0rd123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | ✅ Yes | كلمة المرور للتحقق منها |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "score": 3,
    "label": "good",
    "labelAr": "جيد",
    "color": "#eab308",
    "percentage": 75,
    "requirements": {
      "length": true,
      "uppercase": true,
      "lowercase": true,
      "number": true,
      "special": true
    },
    "meetsRequirements": true,
    "isAcceptable": true,
    "feedback": [
      "Add another word or two. Uncommon words are better."
    ],
    "crackTime": "3 hours"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `score` | number | التقييم (0-4): 0=ضعيف جداً، 4=قوي جداً |
| `label` | string | التصنيف: weak, fair, good, strong |
| `labelAr` | string | التصنيف بالعربية |
| `color` | string | اللون المقترح للمؤشر |
| `percentage` | number | النسبة المئوية (0-100) |
| `requirements` | object | المتطلبات المستوفاة |
| `meetsRequirements` | boolean | هل تستوفي جميع المتطلبات؟ |
| `isAcceptable` | boolean | هل مقبولة؟ (sco