# مكونات المصادقة الثنائية (2FA)

## 📦 المكونات المتاحة

### 1. TwoFactorSetup
مكون إعداد المصادقة الثنائية - يستخدم في صفحة الإعدادات

**الاستخدام:**
```jsx
import { TwoFactorSetup } from './components/auth';

<TwoFactorSetup
  onComplete={() => {
    // تم التفعيل بنجاح
    console.log('2FA enabled!');
  }}
  onCancel={() => {
    // المستخدم ألغى العملية
    console.log('Setup cancelled');
  }}
/>
```

**الخطوات:**
1. توليد QR code
2. التحقق من الرمز
3. عرض الرموز الاحتياطية

---

### 2. TwoFactorVerify
مكون التحقق من 2FA - يستخدم أثناء تسجيل الدخول

**الاستخدام:**
```jsx
import { TwoFactorVerify } from './components/auth';

<TwoFactorVerify
  userId={userId}
  onSuccess={(data) => {
    // تم التحقق بنجاح
    localStorage.setItem('authToken', data.token);
    navigate('/dashboard');
  }}
  onCancel={() => {
    // المستخدم ألغى التحقق
    setShow2FA(false);
  }}
/>
```

**الميزات:**
- إدخال رمز OTP (6 أرقام)
- إدخال رمز احتياطي (8 أحرف)
- التبديل بين الطريقتين

---

### 3. TwoFactorSettings
مكون إدارة 2FA - يستخدم في صفحة الإعدادات

**الاستخدام:**
```jsx
import { TwoFactorSettings } from './components/auth';

<TwoFactorSettings />
```

**الميزات:**
- عرض حالة 2FA (مفعّل/معطّل)
- تفعيل 2FA
- تعطيل 2FA
- توليد رموز احتياطية جديدة
- عرض عدد الرموز الاحتياطية المتبقية

---

## 🎨 التخصيص

### الألوان
يمكن تخصيص الألوان عبر CSS:

```css
/* Primary Color */
.btn-primary {
  background: #304B60;
}

/* Accent Color */
.token-input:focus {
  border-color: #D48161;
}
```

### اللغات
المكونات تدعم 3 لغات:
- العربية (ar)
- الإنجليزية (en)
- الفرنسية (fr)

يتم اختيار اللغة تلقائياً من `AppContext`.

---

## 🔌 API Integration

### المتطلبات
```javascript
// في .env
VITE_API_URL=http://localhost:5000
```

### Endpoints المستخدمة
- `POST /auth/2fa/setup` - إعداد 2FA
- `POST /auth/2fa/enable` - تفعيل 2FA
- `POST /auth/2fa/disable` - تعطيل 2FA
- `POST /auth/2fa/verify` - التحقق من الرمز
- `GET /auth/2fa/status` - حالة 2FA
- `POST /auth/2fa/regenerate-backup-codes` - توليد رموز جديدة

---

## 📱 Responsive Design

جميع المكونات متجاوبة وتعمل على:
- 📱 الهواتف (< 640px)
- 📱 الأجهزة اللوحية (640px - 1024px)
- 💻 الحواسيب (> 1024px)

---

## ♿ Accessibility

- ✅ دعم لوحة المفاتيح
- ✅ ARIA labels
- ✅ Focus management
- ✅ Screen reader friendly

---

## 🧪 الاختبار

```bash
# اختبار المكونات
npm test -- TwoFactor

# اختبار يدوي
npm run dev
```

---

## 📚 أمثلة

### مثال كامل - صفحة الإعدادات

```jsx
import React from 'react';
import { TwoFactorSettings } from '../components/auth';

function SecuritySettingsPage() {
  return (
    <div className="settings-page">
      <h1>إعدادات الأمان</h1>
      
      <section className="security-section">
        <h2>المصادقة الثنائية</h2>
        <p>أضف طبقة أمان إضافية لحسابك</p>
        <TwoFactorSettings />
      </section>
    </div>
  );
}

export default SecuritySettingsPage;
```

### مثال كامل - تسجيل الدخول

```jsx
import React, { useState } from 'react';
import { TwoFactorVerify } from '../components/auth';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      if (data.requires2FA) {
        setUserId(data.userId);
        setShow2FA(true);
      } else {
        localStorage.setItem('authToken', data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (show2FA) {
    return (
      <div className="login-container">
        <TwoFactorVerify
          userId={userId}
          onSuccess={(data) => {
            localStorage.setItem('authToken', data.token);
            navigate('/dashboard');
          }}
          onCancel={() => {
            setShow2FA(false);
            setUserId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h1>تسجيل الدخول</h1>
        
        {error && <div className="error">{error}</div>}
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          required
        />
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
```

---

## 🔒 الأمان

### أفضل الممارسات
1. ✅ لا تحفظ الرموز في localStorage
2. ✅ استخدم HTTPS في الإنتاج
3. ✅ احفظ الرموز الاحتياطية بشكل آمن
4. ✅ لا تشارك QR code مع أحد
5. ✅ استخدم تطبيق مصادقة موثوق

---

## 📞 الدعم

- 📄 التوثيق الكامل: `docs/TWO_FACTOR_AUTHENTICATION.md`
- 🚀 دليل البدء السريع: `docs/TWO_FACTOR_AUTHENTICATION_QUICK_START.md`
- 💬 الدعم: careerak.hr@gmail.com

---

**تم الإنشاء**: 2026-02-23  
**الحالة**: ✅ جاهز للاستخدام
