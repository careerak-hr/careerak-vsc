# reCAPTCHA - دليل البدء السريع ⚡

## 🚀 الإعداد في 5 دقائق

### 1. الحصول على المفاتيح (دقيقتان)

1. اذهب إلى https://www.google.com/recaptcha/admin
2. سجل موقع جديد:
   - Type: **reCAPTCHA v3**
   - Domains: `localhost`, `careerak.com`
3. احصل على **Site Key** و **Secret Key**

### 2. إعداد Backend (دقيقة)

```env
# backend/.env
RECAPTCHA_ENABLED=true
RECAPTCHA_SECRET_KEY=your_secret_key_here
RECAPTCHA_MIN_SCORE=0.5
```

```bash
cd backend
npm install axios  # إذا لم يكن مثبت
npm start
```

### 3. إعداد Frontend (دقيقة)

```env
# frontend/.env
VITE_RECAPTCHA_ENABLED=true
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

```bash
cd frontend
npm run dev
```

### 4. إضافة إلى Route (دقيقة)

```javascript
// backend/src/routes/authRoutes.js
const { verifyRecaptcha } = require('../middleware/recaptcha');

router.post('/register', verifyRecaptcha, authController.register);
```

### 5. استخدام في Frontend (دقيقة)

```jsx
import { useRecaptchaV3 } from '../components/auth/RecaptchaV3';
import { isRecaptchaEnabled, getRecaptchaSiteKey, addRecaptchaToken } from '../utils/recaptcha';

function RegisterForm() {
  const { executeRecaptcha, ready } = useRecaptchaV3(getRecaptchaSiteKey());

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let data = { name, email, password };

    if (isRecaptchaEnabled() && ready) {
      const token = await executeRecaptcha('register');
      data = addRecaptchaToken(data, token);
    }

    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      
      <button disabled={isRecaptchaEnabled() && !ready}>
        تسجيل
      </button>

      {/* إشعار reCAPTCHA */}
      {isRecaptchaEnabled() && (
        <p className="text-xs text-gray-500 mt-2">
          محمي بواسطة reCAPTCHA
        </p>
      )}
    </form>
  );
}
```

---

## ✅ التحقق من العمل

### 1. اختبار Backend

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!"}'

# يجب أن يفشل مع: "RECAPTCHA_VERIFICATION_FAILED"
```

### 2. اختبار Frontend

1. افتح `http://localhost:5173`
2. افتح DevTools → Console
3. يجب أن ترى: `reCAPTCHA loaded successfully`
4. سجل حساب جديد
5. افتح Network tab
6. تحقق من الطلب - يجب أن يحتوي على `recaptchaToken`

---

## 🎯 الاستخدامات الشائعة

### التسجيل

```javascript
const token = await executeRecaptcha('register');
```

### تسجيل الدخول

```javascript
const token = await executeRecaptcha('login');
```

### إعادة تعيين كلمة المرور

```javascript
const token = await executeRecaptcha('reset_password');
```

### نشر وظيفة

```javascript
const token = await executeRecaptcha('post_job');
```

---

## 🐛 حل المشاكل السريع

| المشكلة | الحل |
|---------|------|
| "reCAPTCHA is not ready" | انتظر `ready === true` |
| "Invalid site key" | تحقق من `VITE_RECAPTCHA_SITE_KEY` |
| "Score too low" | خفض `RECAPTCHA_MIN_SCORE` |
| لا يظهر badge | طبيعي - v3 غير مرئي |

---

## 📖 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/RECAPTCHA_INTEGRATION.md` - دليل شامل
- 📄 `frontend/src/examples/RecaptchaUsageExample.jsx` - أمثلة كاملة

---

**تم! 🎉 الآن لديك CAPTCHA يعمل بالكامل**
