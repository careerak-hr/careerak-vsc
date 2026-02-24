# تكامل Google reCAPTCHA v3

## 📋 معلومات النظام
- **تاريخ الإضافة**: 2026-02-23
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 7.6 (CAPTCHA لمنع البوتات)

---

## 🎯 نظرة عامة

تم تكامل Google reCAPTCHA v3 لحماية المنصة من البوتات والنشاط المشبوه. يعمل reCAPTCHA v3 بشكل غير مرئي في الخلفية ويعطي كل طلب نتيجة (score) من 0.0 إلى 1.0، حيث 1.0 يعني مستخدم حقيقي و 0.0 يعني بوت.

### الميزات الرئيسية
- ✅ غير مرئي - لا يقاطع تجربة المستخدم
- ✅ ذكي - يتعلم من سلوك المستخدمين
- ✅ مرن - يمكن تفعيله/تعطيله بسهولة
- ✅ شرطي - يمكن تفعيله فقط عند الاشتباه بنشاط مشبوه
- ✅ آمن - التحقق يتم على الخادم

---

## 📁 الملفات المضافة

### Backend
```
backend/
├── src/
│   ├── services/
│   │   └── recaptchaService.js       # خدمة reCAPTCHA
│   └── middleware/
│       └── recaptcha.js              # Middleware للتحقق
└── .env.example                      # محدّث بإعدادات CAPTCHA
```

### Frontend
```
frontend/
├── src/
│   ├── components/auth/
│   │   └── RecaptchaV3.jsx           # مكون reCAPTCHA
│   ├── utils/
│   │   └── recaptcha.js              # دوال مساعدة
│   └── examples/
│       └── RecaptchaUsageExample.jsx # أمثلة استخدام
└── .env.example                      # محدّث بإعدادات CAPTCHA
```

---

## 🔧 الإعداد

### 1. الحصول على مفاتيح reCAPTCHA

1. اذهب إلى [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. سجل موقع جديد:
   - **Label**: Careerak
   - **reCAPTCHA type**: reCAPTCHA v3
   - **Domains**: 
     - `localhost` (للتطوير)
     - `careerak.com` (للإنتاج)
3. احصل على:
   - **Site Key** (للـ Frontend)
   - **Secret Key** (للـ Backend)

### 2. إعداد Backend

أضف المتغيرات في `backend/.env`:

```env
# Google reCAPTCHA v3
RECAPTCHA_ENABLED=true
RECAPTCHA_SECRET_KEY=your_secret_key_here
RECAPTCHA_MIN_SCORE=0.5
```

**المتغيرات**:
- `RECAPTCHA_ENABLED`: تفعيل/تعطيل CAPTCHA (`true` أو `false`)
- `RECAPTCHA_SECRET_KEY`: المفتاح السري من Google
- `RECAPTCHA_MIN_SCORE`: الحد الأدنى للنتيجة (0.0 - 1.0)
  - `0.9+`: مستخدم حقيقي جداً
  - `0.7-0.9`: مستخدم حقيقي على الأرجح
  - `0.5-0.7`: مشبوه قليلاً
  - `0.3-0.5`: مشبوه
  - `0.0-0.3`: بوت على الأرجح

**الموصى به**: `0.5` للتوازن بين الأمان وتجربة المستخدم

### 3. إعداد Frontend

أضف المتغيرات في `frontend/.env`:

```env
# Google reCAPTCHA v3
VITE_RECAPTCHA_ENABLED=true
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

---

## 💻 الاستخدام

### Backend - إضافة Middleware

#### 1. التحقق الإجباري

```javascript
const { verifyRecaptcha } = require('../middleware/recaptcha');

// في route التسجيل
router.post('/register', verifyRecaptcha, async (req, res) => {
  // إذا وصلنا هنا، فالتحقق نجح
  const { name, email, password } = req.body;
  
  // النتيجة متاحة في req.recaptcha
  console.log('reCAPTCHA score:', req.recaptcha.score);
  
  // ... منطق التسجيل
});
```

#### 2. التحقق الشرطي

```javascript
const { verifyRecaptchaConditional } = require('../middleware/recaptcha');

// يتحقق فقط إذا كان النشاط مشبوه
router.post('/login', verifyRecaptchaConditional, async (req, res) => {
  // ... منطق تسجيل الدخول
});
```

### Frontend - استخدام Hook

```jsx
import { useRecaptchaV3 } from '../components/auth/RecaptchaV3';
import { isRecaptchaEnabled, getRecaptchaSiteKey, addRecaptchaToken } from '../utils/recaptcha';

function RegisterForm() {
  const { executeRecaptcha, ready } = useRecaptchaV3(getRecaptchaSiteKey());

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let data = { name, email, password };

    // إضافة token إذا كان CAPTCHA مفعل
    if (isRecaptchaEnabled() && ready) {
      const token = await executeRecaptcha('register');
      data = addRecaptchaToken(data, token);
    }

    // إرسال الطلب
    await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* الحقول */}
      <button disabled={isRecaptchaEnabled() && !ready}>
        تسجيل
      </button>
    </form>
  );
}
```

### Frontend - استخدام Component

```jsx
import RecaptchaV3 from '../components/auth/RecaptchaV3';
import { isRecaptchaEnabled, getRecaptchaSiteKey } from '../utils/recaptcha';

function RegisterForm() {
  const [executeRecaptcha, setExecuteRecaptcha] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRecaptchaEnabled() && executeRecaptcha) {
      const token = await executeRecaptcha('register');
      // استخدام token
    }
  };

  return (
    <>
      {isRecaptchaEnabled() && (
        <RecaptchaV3
          siteKey={getRecaptchaSiteKey()}
          onReady={(execute) => setExecuteRecaptcha(() => execute)}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        {/* الحقول */}
      </form>
    </>
  );
}
```

---

## 🎨 إشعار reCAPTCHA

يجب عرض إشعار reCAPTCHA للمستخدمين:

```jsx
{isRecaptchaEnabled() && (
  <p className="text-xs text-gray-500 text-center">
    هذا الموقع محمي بواسطة reCAPTCHA وتطبق{' '}
    <a
      href="https://policies.google.com/privacy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      سياسة الخصوصية
    </a>{' '}
    و{' '}
    <a
      href="https://policies.google.com/terms"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      شروط الخدمة
    </a>{' '}
    من Google.
  </p>
)}
```

---

## 🔍 الاختبار

### 1. اختبار محلي

```bash
# Backend
cd backend
npm install axios  # إذا لم يكن مثبت
npm start

# Frontend
cd frontend
npm run dev
```

### 2. اختبار التحقق

```bash
# اختبار بدون token
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!"}'

# يجب أن يفشل مع: "RECAPTCHA_VERIFICATION_FAILED"
```

### 3. اختبار مع token

1. افتح المتصفح على `http://localhost:5173`
2. افتح DevTools → Network
3. سجل حساب جديد
4. تحقق من الطلب - يجب أن يحتوي على `recaptchaToken`

---

## 📊 مراقبة النتائج

### عرض النتائج في Backend

```javascript
router.post('/register', verifyRecaptcha, async (req, res) => {
  // النتيجة متاحة في req.recaptcha
  const { score, action } = req.recaptcha;
  
  console.log(`reCAPTCHA - Action: ${action}, Score: ${score}`);
  
  // يمكنك حفظها في قاعدة البيانات للتحليل
  await User.create({
    ...userData,
    recaptchaScore: score
  });
});
```

### تحليل النتائج

في Google reCAPTCHA Admin Console:
1. اذهب إلى Analytics
2. راقب:
   - **Score distribution**: توزيع النتائج
   - **Actions**: أنواع العمليات
   - **Requests**: عدد الطلبات

---

## 🛡️ أفضل الممارسات

### 1. لا تعتمد فقط على CAPTCHA

```javascript
// ❌ سيء
if (recaptchaScore > 0.5) {
  // السماح
}

// ✅ جيد
if (recaptchaScore > 0.5 && isValidEmail(email) && isStrongPassword(password)) {
  // السماح
}
```

### 2. استخدم actions مختلفة

```javascript
// للتسجيل
const token = await executeRecaptcha('register');

// لتسجيل الدخول
const token = await executeRecaptcha('login');

// لإعادة تعيين كلمة المرور
const token = await executeRecaptcha('reset_password');
```

### 3. تعامل مع الأخطاء بلطف

```javascript
try {
  const token = await executeRecaptcha('register');
} catch (error) {
  // لا تمنع المستخدم - سجل الخطأ فقط
  console.error('reCAPTCHA failed:', error);
  // تابع بدون token (fail-open)
}
```

### 4. اختبر في بيئات مختلفة

- ✅ Desktop Chrome
- ✅ Mobile Safari
- ✅ Firefox
- ✅ Edge
- ✅ شبكات بطيئة

---

## 🐛 استكشاف الأخطاء

### "reCAPTCHA is not ready yet"

**السبب**: السكريبت لم يحمل بعد

**الحل**:
```jsx
const { ready } = useRecaptchaV3(siteKey);

<button disabled={!ready}>
  {ready ? 'تسجيل' : 'جاري التحميل...'}
</button>
```

### "Invalid site key"

**السبب**: Site key خاطئ أو غير مطابق للدومين

**الحل**:
1. تحقق من `VITE_RECAPTCHA_SITE_KEY`
2. تحقق من أن الدومين مسجل في Google Console

### "Score too low"

**السبب**: المستخدم حصل على نتيجة منخفضة

**الحل**:
1. خفض `RECAPTCHA_MIN_SCORE` (مثلاً من 0.5 إلى 0.3)
2. أو اطلب من المستخدم إعادة المحاولة
3. أو استخدم CAPTCHA شرطي

### "CORS error"

**السبب**: Google API محظور

**الحل**:
1. تحقق من إعدادات CORS في Backend
2. تحقق من Firewall/Proxy

---

## 📈 التحسينات المستقبلية

### 1. تحليل ذكي للنشاط

```javascript
async shouldRequireCaptcha(userId, action) {
  // عدد المحاولات الفاشلة
  const failedAttempts = await getFailedAttempts(userId);
  if (failedAttempts > 3) return true;
  
  // سرعة الطلبات
  const requestRate = await getRequestRate(userId);
  if (requestRate > 10) return true; // 10 طلبات في دقيقة
  
  // IP reputation
  const ipScore = await getIpReputation(req.ip);
  if (ipScore < 0.5) return true;
  
  return false;
}
```

### 2. تخزين النتائج

```javascript
// نموذج CaptchaLog
const CaptchaLog = new Schema({
  userId: ObjectId,
  action: String,
  score: Number,
  success: Boolean,
  ip: String,
  userAgent: String,
  timestamp: Date
});

// تحليل لاحقاً
const avgScore = await CaptchaLog.aggregate([
  { $match: { action: 'register' } },
  { $group: { _id: null, avg: { $avg: '$score' } } }
]);
```

### 3. تنبيهات تلقائية

```javascript
if (score < 0.3) {
  // إرسال تنبيه للأدمن
  await sendAlert({
    type: 'suspicious_activity',
    userId,
    score,
    action
  });
}
```

---

## 📚 المراجع

- [Google reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Best Practices](https://developers.google.com/recaptcha/docs/v3#best_practices)

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل ومفعّل
