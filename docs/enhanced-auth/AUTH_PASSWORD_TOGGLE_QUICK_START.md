# دليل البدء السريع: إظهار/إخفاء كلمة المرور

## ⚡ نظرة سريعة (30 ثانية)

### ✅ الميزة مفعّلة بالفعل!
لا حاجة لأي إعداد - الميزة تعمل تلقائياً في:
- ✅ صفحة التسجيل (نموذج الأفراد)
- ✅ صفحة التسجيل (نموذج الشركات)
- ✅ حقل كلمة المرور
- ✅ حقل تأكيد كلمة المرور

---

## 🎯 كيفية الاستخدام (للمستخدمين)

### الخطوة 1: افتح صفحة التسجيل
```
/auth
```

### الخطوة 2: اختر نوع المستخدم
- فرد (Individual)
- شركة (Company)

### الخطوة 3: أدخل كلمة المرور
- اكتب كلمة المرور في الحقل

### الخطوة 4: اضغط على أيقونة العين
- 👁️ لإظهار كلمة المرور
- 👁️‍🗨️ لإخفاء كلمة المرور

---

## 🔧 للمطورين: كيفية التطبيق في صفحة جديدة

### 1. إضافة الحالة (State)
```jsx
const [showPassword, setShowPassword] = useState(false);
```

### 2. إضافة الحقل مع الزر
```jsx
<div className="auth-password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    value={password}
    onChange={handleChange}
    className="auth-input-base"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="auth-password-toggle right-4"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div>
```

### 3. إضافة الأيقونات
```jsx
// Eye Icon (Show)
const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Eye Off Icon (Hide)
const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);
```

### 4. التنسيقات موجودة بالفعل
```css
/* في 03_AuthPage.css */
.auth-password-wrapper { @apply relative; }
.auth-password-toggle { 
  @apply absolute top-1/2 -translate-y-1/2 
         text-primary/40 hover:text-primary 
         transition-colors cursor-pointer;
}
```

---

## 🌍 دعم RTL

### للعربية (RTL)
```jsx
className={`auth-password-toggle ${isRTL ? 'left-4' : 'right-4'}`}
```

### للإنجليزية/الفرنسية (LTR)
```jsx
className="auth-password-toggle right-4"
```

---

## 🌙 دعم الوضع الداكن

التنسيقات موجودة تلقائياً في `formsDarkMode.css`:
```css
.dark .auth-password-toggle {
  @apply text-dark-text/40 hover:text-dark-text;
}
```

---

## 🧪 اختبار سريع

### 1. اختبار أساسي
```bash
# افتح المتصفح
http://localhost:3000/auth

# اختر نوع المستخدم
# أدخل كلمة مرور
# اضغط على أيقونة العين
# تحقق من الإظهار/الإخفاء
```

### 2. اختبار RTL
```bash
# غيّر اللغة للعربية
# تحقق من موضع الأيقونة (يسار)
# غيّر للإنجليزية
# تحقق من موضع الأيقونة (يمين)
```

### 3. اختبار الوضع الداكن
```bash
# فعّل الوضع الداكن
# تحقق من ألوان الأيقونة
```

---

## ❓ استكشاف الأخطاء

### المشكلة: الأيقونة لا تظهر
**الحل**: تأكد من:
```jsx
// 1. الحالة موجودة
const [showPassword, setShowPassword] = useState(false);

// 2. الزر موجود داخل auth-password-wrapper
<div className="auth-password-wrapper">
  <input ... />
  <button className="auth-password-toggle">...</button>
</div>
```

### المشكلة: الأيقونة في الموضع الخطأ
**الحل**: تحقق من RTL:
```jsx
className={`auth-password-toggle ${isRTL ? 'left-4' : 'right-4'}`}
```

### المشكلة: الألوان غير صحيحة
**الحل**: تأكد من استيراد CSS:
```jsx
import './03_AuthPage.css';
import '../styles/formsDarkMode.css';
```

---

## 📚 المزيد من المعلومات

للحصول على دليل شامل، راجع:
📄 `docs/AUTH_PASSWORD_TOGGLE.md`

---

**تاريخ الإنشاء**: 2026-02-23  
**الحالة**: ✅ جاهز للاستخدام
