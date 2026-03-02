# EmailValidator Component - مكون التحقق من البريد الإلكتروني

## 📋 معلومات المكون

- **الاسم**: EmailValidator
- **الموقع**: `frontend/src/components/auth/EmailValidator.jsx`
- **تاريخ الإنشاء**: 2026-02-23
- **الحالة**: ✅ مكتمل ومختبر
- **المتطلبات**: 4.1, 4.3, 4.4, 4.5, 4.6, 4.7

---

## 🎯 الهدف

مكون React للتحقق من صحة البريد الإلكتروني مع التحقق الفوري أثناء الكتابة (debounced validation).

---

## ✨ الميزات الرئيسية

### 1. التحقق من الصيغة (Client-side)
- ✅ Regex validation للتحقق من صحة البريد
- ✅ تحقق فوري قبل إرسال الطلب للسيرفر
- ✅ رسائل خطأ واضحة

### 2. التحقق من الوجود (Server-side)
- ✅ API call للتحقق من وجود البريد في قاعدة البيانات
- ✅ Debounced validation (500ms افتراضي)
- ✅ معالجة الأخطاء بشكل آمن

### 3. أيقونات الحالة
- ✅ Loader أثناء التحقق
- ✅ CheckCircle (✓) للبريد المتاح
- ✅ XCircle (✗) للبريد غير الصحيح أو الموجود

### 4. اقتراحات التصحيح
- ✅ اكتشاف الأخطاء الإملائية الشائعة
- ✅ زر لتطبيق الاقتراح
- ✅ مثال: gmial.com → gmail.com

### 5. رابط تسجيل الدخول
- ✅ يظهر إذا كان البريد موجود
- ✅ رابط مباشر لصفحة تسجيل الدخول

### 6. دعم متعدد اللغات
- ✅ العربية (ar)
- ✅ الإنجليزية (en)
- ✅ الفرنسية (fr)

---

## 📦 التثبيت

المكون جاهز للاستخدام بدون تثبيت إضافي. يعتمد على:
- React 18+
- AppContext (للغة)
- Tailwind CSS (للتنسيق)

---

## 🚀 الاستخدام

### الاستخدام الأساسي

```jsx
import React, { useState } from 'react';
import EmailValidator from './components/auth/EmailValidator';

function MyForm() {
  const [email, setEmail] = useState('');

  return (
    <EmailValidator
      value={email}
      onChange={setEmail}
      placeholder="أدخل البريد الإلكتروني"
      required
    />
  );
}
```

### داخل نموذج تسجيل

```jsx
function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // إرسال البيانات
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="الاسم"
      />

      <EmailValidator
        value={formData.email}
        onChange={(value) => setFormData({ ...formData, email: value })}
        placeholder="البريد الإلكتروني"
        required
      />

      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="كلمة المرور"
      />

      <button type="submit">تسجيل</button>
    </form>
  );
}
```

### تخصيص تأخير التحقق

```jsx
<EmailValidator
  value={email}
  onChange={setEmail}
  debounceDelay={1000} // ثانية واحدة
/>
```

---

## 📚 الخصائص (Props)

| الخاصية | النوع | افتراضي | مطلوب | الوصف |
|---------|------|---------|-------|-------|
| `value` | string | - | ✅ | قيمة البريد الإلكتروني |
| `onChange` | function | - | ✅ | دالة تغيير القيمة `(value: string) => void` |
| `placeholder` | string | - | ❌ | النص التوضيحي |
| `className` | string | '' | ❌ | CSS classes إضافية |
| `required` | boolean | false | ❌ | هل الحقل مطلوب |
| `disabled` | boolean | false | ❌ | هل الحقل معطل |
| `debounceDelay` | number | 500 | ❌ | تأخير التحقق بالميلي ثانية |

---

## 🎨 التنسيق

### الألوان المستخدمة

- **الإطار الافتراضي**: `#D4816180` (نحاسي باهت)
- **الإطار عند النجاح**: `#10b981` (أخضر)
- **الإطار عند الخطأ**: `#ef4444` (أحمر)
- **التركيز**: `#304B60` (كحلي)
- **الروابط**: `#304B60` → `#D48161` (hover)

### CSS Classes

```css
/* الإطار الافتراضي */
border-2 border-[#D4816180]

/* الإطار عند النجاح */
border-2 border-green-500

/* الإطار عند الخطأ */
border-2 border-red-500

/* التركيز */
focus:ring-2 focus:ring-[#304B60]
```

---

## 🔄 تدفق العمل

```
1. المستخدم يكتب البريد
   ↓
2. Debounce (500ms)
   ↓
3. التحقق من الصيغة (client-side)
   ↓ (إذا صحيح)
4. API call للتحقق من الوجود
   ↓
5. عرض النتيجة:
   - ✓ متاح
   - ✗ موجود (مع رابط تسجيل الدخول)
   - ✗ خطأ إملائي (مع اقتراح)
   - ✗ صيغة غير صحيحة
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
cd frontend
npm test -- EmailValidator.test.jsx --run
```

### الاختبارات المتاحة

1. ✅ renders input field
2. ✅ calls onChange when user types
3. ✅ shows checking state during validation
4. ✅ shows success icon for valid email
5. ✅ shows error icon for invalid email format
6. ✅ shows error for existing email
7. ✅ shows suggestion for typo
8. ✅ debounces validation calls
9. ✅ handles API errors gracefully
10. ✅ respects disabled prop
11. ✅ respects required prop

**النتيجة**: 11/11 ✅

---

## 🌐 API Integration

### Endpoint

```
POST /auth/check-email
```

### Request

```json
{
  "email": "test@example.com"
}
```

### Response - Success (متاح)

```json
{
  "success": true,
  "valid": true,
  "message": "البريد الإلكتروني متاح",
  "messageEn": "Email is available"
}
```

### Response - Error (موجود)

```json
{
  "success": true,
  "valid": false,
  "error": "هذا البريد مستخدم بالفعل",
  "errorEn": "This email is already in use",
  "action": "login"
}
```

### Response - Error (اقتراح)

```json
{
  "success": true,
  "valid": false,
  "error": "هل تقصد",
  "errorEn": "Did you mean",
  "suggestion": "test@gmail.com"
}
```

### Response - Error (صيغة غير صحيحة)

```json
{
  "success": true,
  "valid": false,
  "error": "البريد الإلكتروني غير صحيح",
  "errorEn": "Invalid email format"
}
```

---

## 🎯 أمثلة الاختبار

### 1. بريد صحيح ومتاح
```
Input: test@example.com
Result: ✓ البريد الإلكتروني متاح
```

### 2. خطأ إملائي
```
Input: test@gmial.com
Result: ✗ هل تقصد: test@gmail.com
```

### 3. صيغة غير صحيحة
```
Input: notanemail
Result: ✗ البريد الإلكتروني غير صحيح
```

### 4. بريد موجود
```
Input: existing@example.com
Result: ✗ هذا البريد مستخدم بالفعل. تسجيل الدخول
```

---

## 🔧 التخصيص

### تغيير الألوان

```jsx
// في EmailValidator.jsx
const getBorderColor = () => {
  if (!validation) return 'border-[#YOUR_COLOR]';
  if (validation.valid === false) return 'border-red-500';
  if (validation.valid === true) return 'border-green-500';
  return 'border-[#YOUR_COLOR]';
};
```

### تغيير تأخير التحقق

```jsx
<EmailValidator
  value={email}
  onChange={setEmail}
  debounceDelay={1000} // 1 ثانية بدلاً من 500ms
/>
```

### إضافة CSS classes

```jsx
<EmailValidator
  value={email}
  onChange={setEmail}
  className="my-custom-class"
/>
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: التحقق لا يعمل

**الحل**:
1. تحقق من أن API endpoint `/auth/check-email` يعمل
2. تحقق من `VITE_API_URL` في `.env`
3. افتح console للتحقق من الأخطاء

### المشكلة: التحقق بطيء جداً

**الحل**:
```jsx
<EmailValidator
  debounceDelay={300} // تقليل التأخير
/>
```

### المشكلة: الأيقونات لا تظهر

**الحل**:
- الأيقونات مدمجة في المكون (SVG)
- تحقق من أن Tailwind CSS يعمل

---

## 📝 ملاحظات مهمة

1. **الأمان**: لا يتم حفظ كلمة المرور في localStorage
2. **الأداء**: Debounced validation يقلل عدد API calls
3. **التوافق**: يعمل على جميع المتصفحات الحديثة
4. **الوصول**: يدعم keyboard navigation (Tab, Enter)
5. **RTL**: يدعم اتجاه النص من اليمين لليسار

---

## 🔗 الملفات ذات الصلة

- **المكون**: `frontend/src/components/auth/EmailValidator.jsx`
- **الاختبارات**: `frontend/src/components/auth/EmailValidator.test.jsx`
- **مثال الاستخدام**: `frontend/src/examples/EmailValidatorUsage.jsx`
- **Utility**: `frontend/src/utils/emailValidation.js`
- **API**: `backend/src/controllers/authController.js` (checkEmail)

---

## 📊 الإحصائيات

- **عدد الأسطر**: ~200 سطر
- **عدد الاختبارات**: 11 اختبار
- **نسبة النجاح**: 100%
- **الحجم**: ~8 KB (minified)
- **التبعيات**: 0 (بدون مكتبات خارجية للأيقونات)

---

## 🚀 التحسينات المستقبلية

- [ ] دعم التحقق من البريد المؤقت (disposable email)
- [ ] دعم التحقق من MX records
- [ ] إضافة autocomplete للنطاقات الشائعة
- [ ] دعم التحقق من البريد عبر regex مخصص
- [ ] إضافة animation للانتقالات

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل:
- **البريد**: careerak.hr@gmail.com
- **الموقع**: https://careerak.com

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل ومختبر
