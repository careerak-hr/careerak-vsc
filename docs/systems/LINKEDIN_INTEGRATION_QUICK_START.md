# تكامل LinkedIn - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. الإعداد (دقيقة واحدة)

**Backend (.env)**:
```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=https://careerak.com/linkedin/callback
FRONTEND_URL=https://careerak.com
```

**الحصول على المفاتيح**:
1. [LinkedIn Developers](https://www.linkedin.com/developers/) → Create App
2. أضف Redirect URL: `https://careerak.com/linkedin/callback`
3. انسخ Client ID و Client Secret

---

### 2. ربط حساب LinkedIn (دقيقتان)

```javascript
// Frontend - زر الربط
const handleConnect = async () => {
  const response = await fetch('/api/linkedin/auth-url', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { authUrl } = await response.json();
  window.location.href = authUrl;
};

// صفحة Callback
// LinkedIn يعيد التوجيه إلى: /linkedin/callback?code=xxx&state=xxx
const handleCallback = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  
  await fetch(`/api/linkedin/callback?code=${code}&state=${state}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // تم الربط بنجاح!
};
```

---

### 3. مشاركة الشهادة (دقيقة واحدة)

```javascript
// Frontend - زر المشاركة
const handleShare = async (certificateId) => {
  const response = await fetch('/api/linkedin/share-certificate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ certificateId })
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('تم مشاركة الشهادة بنجاح على LinkedIn!');
  } else if (data.requiresAuth) {
    alert('يرجى ربط حساب LinkedIn أولاً');
  }
};
```

---

### 4. التحقق من الحالة (30 ثانية)

```javascript
// Frontend - فحص الربط
const checkStatus = async () => {
  const response = await fetch('/api/linkedin/status', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { isConnected } = await response.json();
  
  if (isConnected) {
    // الحساب مربوط ✓
  } else {
    // الحساب غير مربوط
  }
};
```

---

## 📡 API Endpoints السريعة

| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/api/linkedin/auth-url` | GET | رابط OAuth |
| `/api/linkedin/callback` | GET | معالجة callback |
| `/api/linkedin/share-certificate` | POST | مشاركة شهادة |
| `/api/linkedin/status` | GET | حالة الربط |
| `/api/linkedin/unlink` | DELETE | إلغاء الربط |

---

## 🎨 مكونات UI جاهزة

### زر الربط
```jsx
function LinkedInButton() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <button onClick={isConnected ? handleDisconnect : handleConnect}>
      {isConnected ? 'إلغاء ربط LinkedIn' : 'ربط حساب LinkedIn'}
    </button>
  );
}
```

### زر المشاركة
```jsx
function ShareButton({ certificateId }) {
  return (
    <button onClick={() => handleShare(certificateId)}>
      مشاركة على LinkedIn
    </button>
  );
}
```

---

## 🐛 استكشاف الأخطاء السريع

| المشكلة | الحل |
|---------|------|
| "LinkedIn account not connected" | ربط الحساب أولاً |
| "Token expired" | إعادة ربط الحساب |
| "Invalid state parameter" | تحقق من session middleware |
| "Failed to share" | تحقق من صلاحية الشهادة |

---

## ✅ قائمة التحقق السريعة

- [ ] إضافة LINKEDIN_CLIENT_ID و LINKEDIN_CLIENT_SECRET في .env
- [ ] إضافة Redirect URL في LinkedIn App
- [ ] تشغيل السيرفر
- [ ] اختبار OAuth flow
- [ ] اختبار مشاركة الشهادة

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/LINKEDIN_INTEGRATION.md` - دليل شامل (500+ سطر)

---

**تاريخ الإنشاء**: 2026-03-13  
**الحالة**: ✅ جاهز للاستخدام
