# PasswordGenerator - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. الاستيراد (30 ثانية)

```jsx
import PasswordGenerator from '../components/auth/PasswordGenerator';
```

### 2. الاستخدام الأساسي (دقيقة)

```jsx
function MyForm() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      
      <PasswordGenerator
        onGenerate={(generatedPassword) => setPassword(generatedPassword)}
        language="ar"
      />
    </div>
  );
}
```

### 3. مع مؤشر القوة (دقيقتان)

```jsx
import PasswordGenerator from '../components/auth/PasswordGenerator';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';

function RegistrationForm() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <label>كلمة المرور:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      
      <PasswordGenerator
        onGenerate={(generatedPassword) => setPassword(generatedPassword)}
        language="ar"
      />
      
      {password && (
        <PasswordStrengthIndicator
          password={password}
          language="ar"
        />
      )}
    </div>
  );
}
```

---

## 📦 Props السريعة

| Prop | مطلوب؟ | الافتراضي | الوصف |
|------|--------|-----------|-------|
| `onGenerate` | ✅ نعم | - | دالة تُستدعى عند التوليد |
| `language` | ❌ لا | `'ar'` | اللغة: `'ar'`, `'en'`, `'fr'` |

---

## 🎨 التخصيص السريع

### تغيير الألوان

```css
/* في ملف CSS الخاص بك */
.password-generator .suggest-button {
  color: #your-color;
}

.password-generator .password-display {
  border-color: #your-color;
}
```

### تغيير الخط

```css
.password-generator .suggest-button {
  font-family: 'Your-Font', serif;
}
```

---

## 🔐 مواصفات كلمة المرور

- **الطول**: 14 حرف (12-32)
- **الأحرف الكبيرة**: A-Z (حرف واحد على الأقل)
- **الأحرف الصغيرة**: a-z (حرف واحد على الأقل)
- **الأرقام**: 0-9 (رقم واحد على الأقل)
- **الرموز**: !@#$%^&*(),.?":{}|<> (رمز واحد على الأقل)

---

## 🐛 حل المشاكل السريع

### النسخ لا يعمل؟
- تحقق من أن الموقع يعمل على HTTPS
- تحقق من أذونات المتصفح

### التصميم لا يظهر؟
```jsx
// تأكد من استيراد CSS
import './PasswordGenerator.css';
```

### كلمة المرور لا تُملأ؟
```jsx
// تأكد من استدعاء onGenerate
<PasswordGenerator
  onGenerate={(password) => {
    console.log('Generated:', password);
    setPassword(password);
  }}
/>
```

---

## 📚 أمثلة سريعة

### مع React Hook Form

```jsx
import { useForm } from 'react-hook-form';

function Form() {
  const { register, setValue } = useForm();

  return (
    <form>
      <input {...register('password')} type="password" />
      <PasswordGenerator
        onGenerate={(password) => setValue('password', password)}
      />
    </form>
  );
}
```

### مع Formik

```jsx
import { Formik, Field } from 'formik';

function Form() {
  return (
    <Formik initialValues={{ password: '' }}>
      {({ setFieldValue }) => (
        <Form>
          <Field name="password" type="password" />
          <PasswordGenerator
            onGenerate={(password) => setFieldValue('password', password)}
          />
        </Form>
      )}
    </Formik>
  );
}
```

---

## ✅ Checklist السريع

- [ ] استيراد المكون
- [ ] إضافة prop `onGenerate`
- [ ] إضافة `autoComplete="new-password"` للـ input
- [ ] اختبار التوليد
- [ ] اختبار النسخ
- [ ] اختبار على الموبايل

---

## 🔗 روابط مفيدة

- **التوثيق الكامل**: `docs/enhanced-auth/PASSWORD_GENERATOR_COMPONENT.md`
- **مثال كامل**: `frontend/src/examples/PasswordGeneratorUsage.jsx`
- **الكود المصدري**: `frontend/src/components/auth/PasswordGenerator.jsx`

---

**وقت القراءة**: 2 دقيقة  
**وقت التطبيق**: 3 دقائق  
**الإجمالي**: 5 دقائق ⚡
