# تكامل LinkedIn - دليل البدء السريع

## ⚡ البدء في 5 دقائق

### 1. الحصول على مفاتيح LinkedIn (دقيقتان)

1. انتقل إلى [LinkedIn Developers](https://www.linkedin.com/developers/)
2. أنشئ تطبيق جديد → املأ المعلومات
3. في "Auth" → أضف Redirect URL: `http://localhost:3000/linkedin/callback`
4. احصل على Client ID و Client Secret

### 2. إعداد Backend (دقيقة)

**ملف `.env`**:
```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/linkedin/callback
FRONTEND_URL=http://localhost:3000
```

**في `app.js`**:
```javascript
const linkedInRoutes = require('./routes/linkedInRoutes');
app.use('/api/linkedin', linkedInRoutes);
```

### 3. استخدام المكون (دقيقة)

```jsx
import ShareOnLinkedIn from './components/certificates/ShareOnLinkedIn';

<ShareOnLinkedIn
  certificateId={certificate.certificateId}
  certificateData={certificate}
/>
```

### 4. اختبار (دقيقة)

1. افتح صفحة الشهادة
2. انقر "مشاركة على LinkedIn"
3. سجل دخول LinkedIn
4. اختر "مشاركة كمنشور"
5. ✅ تم!

---

## 🔧 API السريع

### ربط LinkedIn
```javascript
const response = await fetch('/api/linkedin/auth-url', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
window.location.href = data.authUrl;
```

### مشاركة الشهادة
```javascript
await fetch('/api/linkedin/share-certificate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ certificateId })
});
```

### التحقق من الحالة
```javascript
const response = await fetch('/api/linkedin/status', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
console.log('Connected:', data.isConnected);
```

---

## 🐛 حل المشاكل السريع

| المشكلة | الحل |
|---------|------|
| "Not connected" | انقر "ربط حساب LinkedIn" |
| "Token expired" | أعد المصادقة |
| "Invalid state" | امسح cookies وأعد المحاولة |
| "Share failed" | تحقق من صحة الشهادة |

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/LINKEDIN_INTEGRATION_IMPLEMENTATION.md` - دليل شامل
- 📄 `frontend/src/examples/ShareOnLinkedInExample.jsx` - مثال كامل

---

**الحالة**: جاهز للاستخدام ✅

**تاريخ الإنشاء**: 2026-03-10
