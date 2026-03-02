# المصادقة الثنائية (2FA) - دليل شامل

## 📋 معلومات النظام
- **تاريخ الإضافة**: 2026-02-23
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 7.2 (خيار تفعيل 2FA بعد التسجيل)

---

## 🎯 نظرة عامة

نظام المصادقة الثنائية (Two-Factor Authentication - 2FA) يضيف طبقة أمان إضافية لحسابات المستخدمين. يتطلب من المستخدمين إدخال رمز من 6 أرقام من تطبيق المصادقة (مثل Google Authenticator أو Authy) بالإضافة إلى كلمة المرور عند تسجيل الدخول.

---

## 🏗️ البنية التقنية

### Backend

#### المكتبات المستخدمة
- `speakeasy` - توليد والتحقق من OTP
- `qrcode` - توليد QR codes
- `bcryptjs` - تشفير الرموز الاحتياطية

#### الملفات الأساسية
```
backend/src/
├── services/
│   └── twoFactorService.js          # خدمة 2FA
├── controllers/
│   └── twoFactorController.js       # معالج طلبات 2FA
├── routes/
│   └── twoFactorRoutes.js           # مسارات API
└── models/
    └── User.js                      # محدّث بحقول 2FA
```

#### حقول User Model الجديدة
```javascript
{
  twoFactorEnabled: Boolean,      // هل 2FA مفعل؟
  twoFactorSecret: String,        // السر المشفر
  backupCodes: [String]           // رموز احتياطية مشفرة
}
```

### Frontend

#### المكونات
```
frontend/src/components/auth/
├── TwoFactorSetup.jsx              # إعداد 2FA
├── TwoFactorSetup.css
├── TwoFactorVerify.jsx             # التحقق أثناء تسجيل الدخول
├── TwoFactorVerify.css
├── TwoFactorSettings.jsx           # إدارة 2FA من الإعدادات
└── TwoFactorSettings.css
```

---

## 🔌 API Endpoints

### 1. إعداد 2FA
```
POST /auth/2fa/setup
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم توليد رمز QR بنجاح",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCode": "data:image/png;base64,...",
    "manualEntryKey": "JBSWY3DPEHPK3PXP"
  }
}
```

---

### 2. تفعيل 2FA
```
POST /auth/2fa/enable
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تفعيل المصادقة الثنائية بنجاح",
  "data": {
    "backupCodes": [
      "ABCD1234",
      "EFGH5678",
      ...
    ]
  }
}
```

---

### 3. تعطيل 2FA
```
POST /auth/2fa/disable
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "password": "user_password",
  "token": "123456"  // اختياري
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تعطيل المصادقة الثنائية بنجاح"
}
```

---

### 4. التحقق من رمز 2FA
```
POST /auth/2fa/verify
```

**Body:**
```json
{
  "userId": "user_id",
  "token": "123456",
  "isBackupCode": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم التحقق بنجاح",
  "data": {
    "remainingBackupCodes": 9
  }
}
```

---

### 5. الحصول على حالة 2FA
```
GET /auth/2fa/status
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "hasBackupCodes": true,
    "remainingBackupCodes": 10
  }
}
```

---

### 6. توليد رموز احتياطية جديدة
```
POST /auth/2fa/regenerate-backup-codes
```

**Headers:**
```json
{
  "Authorization": "Bearer <token>"
}
```

**Body:**
```json
{
  "password": "user_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم توليد رموز احتياطية جديدة بنجاح",
  "data": {
    "backupCodes": [
      "WXYZ9012",
      "IJKL3456",
      ...
    ]
  }
}
```

---

## 💻 الاستخدام في Frontend

### 1. إعداد 2FA (في صفحة الإعدادات)

```jsx
import { TwoFactorSettings } from '../components/auth';

function SettingsPage() {
  return (
    <div>
      <h1>الإعدادات</h1>
      <TwoFactorSettings />
    </div>
  );
}
```

---

### 2. التحقق من 2FA (أثناء تسجيل الدخول)

```jsx
import { TwoFactorVerify } from '../components/auth';

function LoginPage() {
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLogin = async (email, password) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
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

## 🔐 الأمان

### تشفير الرموز الاحتياطية
```javascript
// الرموز الاحتياطية تُشفر باستخدام bcrypt قبل الحفظ
const hashedBackupCodes = await Promise.all(
  backupCodes.map(code => bcrypt.hash(code, 10))
);
```

### التحقق من الرموز
```javascript
// التحقق من OTP (صالح لـ ±60 ثانية)
speakeasy.totp.verify({
  secret: secret,
  encoding: 'base32',
  token: token,
  window: 2
});

// التحقق من الرمز الاحتياطي
const match = await bcrypt.compare(token, hashedBackupCode);
```

---

## 📱 تطبيقات المصادقة المدعومة

- ✅ Google Authenticator (Android, iOS)
- ✅ Microsoft Authenticator (Android, iOS)
- ✅ Authy (Android, iOS, Desktop)
- ✅ 1Password (مع دعم TOTP)
- ✅ LastPass Authenticator
- ✅ أي تطبيق يدعم TOTP

---

## 🎨 تجربة المستخدم

### تدفق التفعيل
1. المستخدم يذهب إلى الإعدادات
2. ينقر على "تفعيل 2FA"
3. يمسح QR code بتطبيق المصادقة
4. يدخل الرمز المكون من 6 أرقام للتحقق
5. يحفظ الرموز الاحتياطية (10 رموز)
6. تم التفعيل ✓

### تدفق تسجيل الدخول
1. المستخدم يدخل البريد وكلمة المرور
2. إذا كان 2FA مفعل، يُطلب منه إدخال الرمز
3. يدخل الرمز من تطبيق المصادقة
4. أو يستخدم رمز احتياطي إذا فقد جهازه
5. تسجيل دخول ناجح ✓

---

## 🌍 دعم متعدد اللغات

المكونات تدعم 3 لغات:
- 🇸🇦 العربية (ar)
- 🇬🇧 الإنجليزية (en)
- 🇫🇷 الفرنسية (fr)

---

## 🧪 الاختبار

### اختبار Backend
```bash
cd backend
npm test -- twoFactor
```

### اختبار Frontend
```bash
cd frontend
npm test -- TwoFactor
```

### اختبار يدوي
1. سجل دخول كمستخدم
2. اذهب إلى الإعدادات
3. فعّل 2FA
4. امسح QR code بتطبيق Google Authenticator
5. أدخل الرمز للتحقق
6. احفظ الرموز الاحتياطية
7. سجل خروج
8. سجل دخول مرة أخرى
9. أدخل رمز 2FA
10. تحقق من نجاح تسجيل الدخول

---

## 🐛 استكشاف الأخطاء

### "الرمز غير صحيح"
- تأكد من أن الوقت على الجهاز صحيح
- الرمز صالح لـ 30 ثانية فقط
- جرب الرمز التالي

### "لا توجد رموز احتياطية"
- ولّد رموز جديدة من الإعدادات
- يتطلب كلمة المرور للتأكيد

### "QR code لا يظهر"
- تحقق من اتصال الإنترنت
- تحقق من أن Backend يعمل
- افتح console للأخطاء

---

## 📊 الإحصائيات المتوقعة

- 📈 زيادة أمان الحسابات بنسبة 99.9%
- 🔒 حماية من هجمات سرقة كلمات المرور
- 👥 معدل تفعيل متوقع: 20-30% من المستخدمين
- ⚡ وقت الإعداد: < 2 دقيقة

---

## ✅ الفوائد

1. **أمان محسّن**: حماية إضافية ضد الاختراق
2. **سهولة الاستخدام**: إعداد بسيط في دقائق
3. **رموز احتياطية**: حل بديل إذا فقد المستخدم جهازه
4. **دعم متعدد اللغات**: تجربة محلية لجميع المستخدمين
5. **متوافق مع المعايير**: يستخدم TOTP (RFC 6238)

---

## 🔮 التحسينات المستقبلية

- [ ] دعم SMS 2FA
- [ ] دعم Email 2FA
- [ ] دعم WebAuthn/FIDO2
- [ ] تذكر الأجهزة الموثوقة
- [ ] إشعارات تسجيل الدخول
- [ ] سجل نشاط 2FA

---

## 📚 المراجع

- [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238)
- [Speakeasy Documentation](https://github.com/speakeasyjs/speakeasy)
- [OWASP 2FA Guide](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل ومفعّل
