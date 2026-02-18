# Enhanced Auth API Documentation

## 📋 نظرة عامة

توثيق شامل لجميع endpoints الخاصة بنظام المصادقة المحسّن.

**Base URL**: `http://localhost:5000/auth` (Development)  
**Base URL**: `https://your-domain.com/auth` (Production)

---

## 🔐 المصادقة

جميع endpoints المحمية تتطلب JWT token في header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📡 Endpoints

### 1. التحقق من البريد الإلكتروني

**POST** `/auth/check-email`

التحقق من صحة البريد الإلكتروني وتوفره.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response - Success (200)

```json
{
  "success": true,
  "valid": true,
  "message": "البريد الإلكتروني متاح",
  "messageEn": "Email is available"
}
```

#### Response - Email Already Exists (200)

```json
{
  "success": true,
  "valid": false,
  "error": "هذا البريد مستخدم بالفعل",
  "errorEn": "This email is already in use",
  "action": "login"
}
```

#### Response - Invalid Format (200)

```json
{
  "success": true,
  "valid": false,
  "error": "البريد الإلكتروني غير صحيح",
  "errorEn": "Invalid email format"
}
```

#### Response - Typo Suggestion (200)

```json
{
  "success": true,
  "valid": false,
  "error": "هل تقصد",
  "errorEn": "Did you mean",
  "suggestion": "user@gmail.com"
}
```

---

### 2. التحقق من قوة كلمة المرور

**POST** `/auth/validate-password`

حساب قوة كلمة المرور وإرجاع التفاصيل.

#### Request Body

```json
{
  "password": "MyP@ssw0rd123"
}
```

#### Response - Success (200)

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
    "feedback": ["Add another word or two"],
    "feedbackAr": ["أضف كلمة أو اثنتين"],
    "crackTime": "centuries",
    "crackTimeAr": "قرون",
    "meetsRequirements": true,
    "isAcceptable": true
  }
}
```

---

### 3. توليد كلمة مرور قوية

**POST** `/auth/generate-password`

توليد كلمة مرور قوية عشوائية.

#### Request Body (Optional)

```json
{
  "length": 16
}
```

#### Response - Success (200)

```json
{
  "success": true,
  "data": {
    "password": "Kx9#mP2$vL4@nQ7!",
    "strength": {
      "score": 4,
      "label": "strong",
      "labelAr": "قوي",
      "color": "#10b981",
      "percentage": 100
    }
  }
}
```

---

### 4. تجديد Access Token

**POST** `/auth/refresh-token`

تجديد Access Token باستخدام Refresh Token.

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response - Success (200)

```json
{
  "success": true,
  "message": "تم تجديد Token بنجاح",
  "messageEn": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer"
  }
}
```

#### Response - Invalid Token (401)

```json
{
  "success": false,
  "message": "Refresh token غير صالح أو منتهي الصلاحية",
  "messageEn": "Invalid or expired refresh token",
  "error": "Token expired"
}
```

---

### 5. إرسال بريد تأكيد البريد الإلكتروني

**POST** `/auth/send-verification-email`

إرسال بريد إلكتروني لتأكيد البريد.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response - Success (200)

```json
{
  "success": true,
  "message": "تم إرسال بريد التأكيد بنجاح",
  "messageEn": "Verification email sent successfully"
}
```

#### Response - Already Verified (400)

```json
{
  "success": false,
  "message": "البريد الإلكتروني مؤكد بالفعل",
  "messageEn": "Email already verified"
}
```

---

### 6. تأكيد البريد الإلكتروني

**POST** `/auth/verify-email`

تأكيد البريد الإلكتروني باستخدام token.

#### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response - Success (200)

```json
{
  "success": true,
  "message": "تم تأكيد البريد الإلكتروني بنجاح",
  "messageEn": "Email verified successfully"
}
```

#### Response - Invalid Token (400)

```json
{
  "success": false,
  "message": "رابط التأكيد غير صالح أو منتهي الصلاحية",
  "messageEn": "Invalid or expired verification link",
  "error": "Token expired"
}
```

---

### 7. طلب إعادة تعيين كلمة المرور

**POST** `/auth/forgot-password`

إرسال رابط إعادة تعيين كلمة المرور.

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response - Success (200)

```json
{
  "success": true,
  "message": "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
  "messageEn": "Password reset link sent to your email"
}
```

**ملاحظة**: لأسباب أمنية، يتم إرجاع نفس الرسالة حتى لو لم يكن البريد موجوداً.

---

### 8. إعادة تعيين كلمة المرور

**POST** `/auth/reset-password`

إعادة تعيين كلمة المرور باستخدام token.

#### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewP@ssw0rd123",
  "confirmPassword": "NewP@ssw0rd123"
}
```

#### Response - Success (200)

```json
{
  "success": true,
  "message": "تم تغيير كلمة المرور بنجاح",
  "messageEn": "Password changed successfully"
}
```

#### Response - Passwords Don't Match (400)

```json
{
  "success": false,
  "message": "كلمات المرور غير متطابقة",
  "messageEn": "Passwords do not match"
}
```

#### Response - Weak Password (400)

```json
{
  "success": false,
  "message": "كلمة المرور لا تستوفي جميع المتطلبات",
  "messageEn": "Password does not meet all requirements"
}
```

---

## 🔒 متطلبات كلمة المرور

كلمة المرور يجب أن تحتوي على:

- ✅ 8 أحرف على الأقل
- ✅ حرف كبير واحد على الأقل (A-Z)
- ✅ حرف صغير واحد على الأقل (a-z)
- ✅ رقم واحد على الأقل (0-9)
- ✅ رمز خاص واحد على الأقل (!@#$%^&*)

---

## 📊 مستويات قوة كلمة المرور

| Score | Label | Label (AR) | Color | Description |
|-------|-------|------------|-------|-------------|
| 0 | weak | ضعيف | #ef4444 | Very weak |
| 1 | weak | ضعيف | #ef4444 | Weak |
| 2 | fair | متوسط | #f59e0b | Fair |
| 3 | good | جيد | #eab308 | Good |
| 4 | strong | قوي | #10b981 | Strong |

---

## ⏱️ انتهاء صلاحية Tokens

| Token Type | Expiry Time |
|------------|-------------|
| Access Token | 7 days |
| Refresh Token | 30 days |
| Email Verification Token | 24 hours |
| Password Reset Token | 1 hour |

---

## 🔐 الأمان

### Password Hashing

- **Algorithm**: bcrypt
- **Rounds**: 12
- **Format**: `$2a$12$...` or `$2b$12$...`

### JWT Tokens

- **Algorithm**: HS256
- **Issuer**: careerak
- **Audience**: careerak-users
- **Secret**: Stored in environment variable `JWT_SECRET`

### HTTPS

جميع endpoints يجب أن تستخدم HTTPS في Production.

---

## 🚨 معالجة الأخطاء

### Error Response Format

```json
{
  "success": false,
  "message": "رسالة الخطأ بالعربية",
  "messageEn": "Error message in English",
  "error": "Technical error details (development only)"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid token) |
| 404 | Not Found (user not found) |
| 500 | Internal Server Error |

---

## 📝 أمثلة الاستخدام

### JavaScript (Fetch API)

```javascript
// التحقق من البريد
const checkEmail = async (email) => {
  const response = await fetch('http://localhost:5000/auth/check-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  return data;
};

// التحقق من قوة كلمة المرور
const validatePassword = async (password) => {
  const response = await fetch('http://localhost:5000/auth/validate-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  });
  
  const data = await response.json();
  return data;
};

// تجديد Token
const refreshToken = async (refreshToken) => {
  const response = await fetch('http://localhost:5000/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  return data;
};
```

### cURL

```bash
# التحقق من البريد
curl -X POST http://localhost:5000/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# التحقق من قوة كلمة المرور
curl -X POST http://localhost:5000/auth/validate-password \
  -H "Content-Type: application/json" \
  -d '{"password":"MyP@ssw0rd123"}'

# توليد كلمة مرور
curl -X POST http://localhost:5000/auth/generate-password \
  -H "Content-Type: application/json" \
  -d '{"length":16}'
```

---

## 🔄 Rate Limiting

للحماية من الهجمات، يتم تطبيق rate limiting:

- **Email Check**: 10 requests / minute
- **Password Validation**: 20 requests / minute
- **Password Reset**: 3 requests / hour
- **Email Verification**: 5 requests / hour

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل:

- **Email**: careerak.hr@gmail.com
- **Documentation**: [GitHub Repository]

---

**آخر تحديث**: 2026-02-18  
**الإصدار**: 1.0.0
