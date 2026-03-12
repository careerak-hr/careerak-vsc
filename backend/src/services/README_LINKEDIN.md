# LinkedIn Service - دليل الاستخدام

## 📋 نظرة عامة

خدمة تكامل LinkedIn توفر:
- ✅ OAuth 2.0 authentication
- ✅ مشاركة الشهادات على LinkedIn
- ✅ إضافة الشهادات إلى الملف الشخصي
- ✅ إدارة access tokens

---

## 🚀 الاستخدام السريع

### 1. ربط حساب LinkedIn

```javascript
const linkedInService = require('./services/linkedInService');

// توليد رابط OAuth
const authUrl = linkedInService.getAuthorizationUrl(state);

// إعادة توجيه المستخدم
res.redirect(authUrl);
```

### 2. معالجة Callback

```javascript
// بعد عودة المستخدم من LinkedIn
const tokenData = await linkedInService.exchangeCodeForToken(code);

// حفظ التوكن
await linkedInService.saveAccessToken(
  userId,
  tokenData.accessToken,
  tokenData.expiresIn
);
```

### 3. مشاركة الشهادة

```javascript
// الحصول على التوكن
const accessToken = await linkedInService.getAccessToken(userId);

// مشاركة الشهادة
const result = await linkedInService.shareCertificateAsPost(
  accessToken,
  certificateId,
  userId
);

console.log('Post URL:', result.postUrl);
```

---

## 📚 الوظائف المتاحة

### getAuthorizationUrl(state)
توليد رابط OAuth للمصادقة

**Parameters**:
- `state` (string): State parameter للأمان

**Returns**: `string` - رابط OAuth

---

### exchangeCodeForToken(code)
تبديل authorization code بـ access token

**Parameters**:
- `code` (string): Authorization code من LinkedIn

**Returns**: `Promise<Object>`
```javascript
{
  success: true,
  accessToken: 'AQV...',
  expiresIn: 5184000,
  refreshToken: null
}
```

---

### getUserProfile(accessToken)
الحصول على معلومات المستخدم من LinkedIn

**Parameters**:
- `accessToken` (string): LinkedIn access token

**Returns**: `Promise<Object>`
```javascript
{
  success: true,
  profile: {
    id: 'linkedin_user_id',
    firstName: 'أحمد',
    lastName: 'محمد'
  }
}
```

---

### shareCertificateAsPost(accessToken, certificateId, userId)
مشاركة الشهادة على LinkedIn كمنشور

**Parameters**:
- `accessToken` (string): LinkedIn access token
- `certificateId` (string): معرف الشهادة
- `userId` (string): معرف المستخدم

**Returns**: `Promise<Object>`
```javascript
{
  success: true,
  message: 'Certificate shared successfully on LinkedIn',
  messageAr: 'تم مشاركة الشهادة بنجاح على LinkedIn',
  postId: 'urn:li:share:1234567890',
  postUrl: 'https://www.linkedin.com/feed/update/...'
}
```

---

### addToCertifications(accessToken, certificateId)
إضافة الشهادة إلى قسم Certifications

**Parameters**:
- `accessToken` (string): LinkedIn access token
- `certificateId` (string): معرف الشهادة

**Returns**: `Promise<Object>`

**ملاحظة**: LinkedIn API v2 لا يدعم إضافة certifications مباشرة. يتم مشاركة منشور مع تعليمات للإضافة اليدوية.

---

### validateAccessToken(accessToken)
التحقق من صلاحية access token

**Parameters**:
- `accessToken` (string): LinkedIn access token

**Returns**: `Promise<boolean>` - true إذا كان صالحاً

---

### saveAccessToken(userId, accessToken, expiresIn)
حفظ access token في قاعدة البيانات

**Parameters**:
- `userId` (string): معرف المستخدم
- `accessToken` (string): LinkedIn access token
- `expiresIn` (number): مدة الصلاحية بالثواني

**Returns**: `Promise<Object>`

---

### getAccessToken(userId)
الحصول على access token من قاعدة البيانات

**Parameters**:
- `userId` (string): معرف المستخدم

**Returns**: `Promise<string|null>` - Access token أو null

---

### unlinkAccount(userId)
إلغاء ربط حساب LinkedIn

**Parameters**:
- `userId` (string): معرف المستخدم

**Returns**: `Promise<Object>`

---

## 🔐 الأمان

### State Parameter
```javascript
const crypto = require('crypto');
const state = crypto.randomBytes(16).toString('hex');

// حفظ في session
req.session.linkedInState = state;

// التحقق عند Callback
if (req.query.state !== req.session.linkedInState) {
  throw new Error('Invalid state parameter');
}
```

### Access Token Storage
```javascript
// التوكن يُخزن في User model
user.linkedInProfile = {
  accessToken: 'encrypted_token',
  expiresAt: new Date(Date.now() + expiresIn * 1000),
  connectedAt: new Date()
};
```

---

## 🧪 الاختبار

```javascript
const linkedInService = require('./services/linkedInService');

// اختبار توليد رابط OAuth
const authUrl = linkedInService.getAuthorizationUrl('test_state');
console.log('Auth URL:', authUrl);

// اختبار التحقق من التوكن
const isValid = await linkedInService.validateAccessToken('test_token');
console.log('Token valid:', isValid);
```

---

## 📊 معدلات الاستخدام (Rate Limits)

LinkedIn API لديه حدود استخدام:
- **OAuth**: 100 طلب/يوم لكل تطبيق
- **Share API**: 100 منشور/يوم لكل مستخدم
- **Profile API**: 500 طلب/يوم لكل تطبيق

**التعامل مع Rate Limits**:
```javascript
try {
  await linkedInService.shareCertificateAsPost(...);
} catch (error) {
  if (error.response?.status === 429) {
    console.log('Rate limit exceeded. Try again later.');
  }
}
```

---

## 🐛 استكشاف الأخطاء

### "Failed to exchange authorization code"
- تحقق من Client ID و Client Secret
- تحقق من Redirect URI يطابق المسجل في LinkedIn

### "Failed to share certificate"
- تحقق من صلاحية access token
- تحقق من صحة الشهادة
- تحقق من rate limits

### "Invalid state parameter"
- تأكد من تفعيل sessions
- تأكد من عدم انتهاء صلاحية session

---

## 📚 المراجع

- [LinkedIn OAuth 2.0](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Share API](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [LinkedIn UGC Posts](https://docs.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api)

---

**تاريخ الإنشاء**: 2026-03-10  
**الإصدار**: 1.0.0
