# المصادقة الثنائية (2FA) - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. التثبيت (مكتمل ✅)

المكتبات مثبتة بالفعل:
```bash
# Backend
speakeasy, qrcode

# لا حاجة لتثبيت شيء في Frontend
```

---

### 2. الاستخدام الأساسي

#### في صفحة الإعدادات

```jsx
import { TwoFactorSettings } from '../components/auth';

function SettingsPage() {
  return (
    <div className="settings-container">
      <h1>إعدادات الأمان</h1>
      <TwoFactorSettings />
    </div>
  );
}
```

#### في صفحة تسجيل الدخول

```jsx
import { TwoFactorVerify } from '../components/auth';
import { useState } from 'react';

function LoginPage() {
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLogin = async (email, password) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.requires2FA) {
      setUserId(data.userId);
      setShow2FA(true);
    } else {
      // تسجيل دخول عادي
      localStorage.setItem('authToken', data.token);
      navigate('/dashboard');
    }
  };

  if (show2FA) {
    return (
      <TwoFactorVerify
        userId={userId}
        onSuccess={(data) => {
          localStorage.setItem('authToken', data.token);
          navigate('/dashboard');
        }}
        onCancel={() => setShow2FA(false)}
      />
    );
  }

  return <LoginForm onSubmit={handleLogin} />;
}
```

---

### 3. API Endpoints

#### إعداد 2FA
```javascript
POST /auth/2fa/setup
Headers: { Authorization: 'Bearer <token>' }

Response: {
  success: true,
  data: {
    secret: "JBSWY3DPEHPK3PXP",
    qrCode: "data:image/png;base64,...",
    manualEntryKey: "JBSWY3DPEHPK3PXP"
  }
}
```

#### تفعيل 2FA
```javascript
POST /auth/2fa/enable
Headers: { Authorization: 'Bearer <token>' }
Body: { token: "123456" }

Response: {
  success: true,
  data: {
    backupCodes: ["ABCD1234", "EFGH5678", ...]
  }
}
```

#### التحقق من 2FA
```javascript
POST /auth/2fa/verify
Body: {
  userId: "user_id",
  token: "123456",
  isBackupCode: false
}

Response: {
  success: true,
  data: {
    remainingBackupCodes: 9
  }
}
```

---

### 4. تدفق العمل

#### تفعيل 2FA
1. المستخدم يذهب إلى الإعدادات
2. ينقر "تفعيل 2FA"
3. يمسح QR code بتطبيق Google Authenticator
4. يدخل الرمز للتحقق
5. يحفظ الرموز الاحتياطية
6. تم! ✓

#### تسجيل الدخول مع 2FA
1. المستخدم يدخل البريد وكلمة المرور
2. يُطلب منه إدخال رمز 2FA
3. يدخل الرمز من التطبيق
4. تسجيل دخول ناجح ✓

---

### 5. الاختبار السريع

```bash
# 1. تشغيل Backend
cd backend
npm start

# 2. تشغيل Frontend
cd frontend
npm run dev

# 3. اختبار يدوي
# - سجل دخول
# - اذهب إلى الإعدادات
# - فعّل 2FA
# - امسح QR code
# - أدخل الرمز
# - احفظ الرموز الاحتياطية
# - سجل خروج وسجل دخول مرة أخرى
```

---

### 6. تطبيقات المصادقة

قم بتحميل أحد هذه التطبيقات:
- 📱 Google Authenticator (مجاني)
- 📱 Microsoft Authenticator (مجاني)
- 📱 Authy (مجاني)

---

### 7. استكشاف الأخطاء

**"الرمز غير صحيح"**
- تأكد من أن الوقت على الجهاز صحيح
- الرمز صالح لـ 30 ثانية فقط

**"QR code لا يظهر"**
- تحقق من اتصال الإنترنت
- افتح console للأخطاء

**"فقدت جهازي"**
- استخدم أحد الرموز الاحتياطية
- أو اتصل بالدعم

---

### 8. الملفات المهمة

**Backend:**
- `backend/src/services/twoFactorService.js`
- `backend/src/controllers/twoFactorController.js`
- `backend/src/routes/twoFactorRoutes.js`

**Frontend:**
- `frontend/src/components/auth/TwoFactorSetup.jsx`
- `frontend/src/components/auth/TwoFactorVerify.jsx`
- `frontend/src/components/auth/TwoFactorSettings.jsx`

---

### 9. الأمان

✅ الرموز الاحتياطية مشفرة بـ bcrypt  
✅ السر محفوظ بشكل آمن في قاعدة البيانات  
✅ الرموز صالحة لـ 30 ثانية فقط  
✅ دعم ±60 ثانية للتسامح مع فروق الوقت  

---

### 10. الدعم

📄 التوثيق الكامل: `docs/TWO_FACTOR_AUTHENTICATION.md`  
🐛 الإبلاغ عن مشكلة: GitHub Issues  
💬 الدعم: careerak.hr@gmail.com  

---

**تم الإنشاء**: 2026-02-23  
**الحالة**: ✅ جاهز للاستخدام
