# LinkedIn Service - دليل الاستخدام السريع

## 🚀 الاستخدام

### 1. الحصول على رابط OAuth
```javascript
const linkedInService = require('./services/linkedInService');

const state = 'random_state_string';
const authUrl = linkedInService.getAuthorizationUrl(state);

// إعادة توجيه المستخدم
res.redirect(authUrl);
```

### 2. تبديل Code بـ Token
```javascript
const { accessToken, expiresIn } = await linkedInService.exchangeCodeForToken(code);

// حفظ التوكن
await linkedInService.saveAccessToken(userId, accessToken, expiresIn);
```

### 3. مشاركة الشهادة
```javascript
const result = await linkedInService.shareCertificateAsPost(
  accessToken,
  certificateId,
  userId
);

console.log(result.postUrl); // رابط المنشور على LinkedIn
```

### 4. التحقق من الحالة
```javascript
const accessToken = await linkedInService.getAccessToken(userId);

if (accessToken) {
  const isValid = await linkedInService.validateAccessToken(accessToken);
  console.log('Connected:', isValid);
}
```

### 5. إلغاء الربط
```javascript
await linkedInService.unlinkAccount(userId);
```

---

## 📡 الوظائف المتاحة

| الوظيفة | الوصف | المعاملات | الإرجاع |
|---------|-------|-----------|---------|
| `getAuthorizationUrl(state)` | توليد رابط OAuth | state: string | string |
| `exchangeCodeForToken(code)` | تبديل code بـ token | code: string | Promise<Object> |
| `getUserProfile(accessToken)` | الحصول على الملف الشخصي | accessToken: string | Promise<Object> |
| `shareCertificateAsPost(...)` | مشاركة شهادة | accessToken, certificateId, userId | Promise<Object> |
| `addToCertifications(...)` | إضافة لـ Certifications | accessToken, certificateId | Promise<Object> |
| `validateAccessToken(...)` | التحقق من صلاحية التوكن | accessToken: string | Promise<boolean> |
| `saveAccessToken(...)` | حفظ التوكن | userId, accessToken, expiresIn | Promise<Object> |
| `getAccessToken(userId)` | جلب التوكن | userId: string | Promise<string\|null> |
| `unlinkAccount(userId)` | إلغاء الربط | userId: string | Promise<Object> |

---

## 🔑 المتغيرات المطلوبة

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=https://careerak.com/linkedin/callback
FRONTEND_URL=https://careerak.com
```

---

## 📚 المراجع

- [LinkedIn OAuth 2.0](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Share API](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)

---

**تاريخ الإنشاء**: 2026-03-13
