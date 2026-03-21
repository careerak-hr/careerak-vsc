# PasswordGenerator Example

## 📋 نظرة عامة

مثال تفاعلي كامل يوضح كيفية استخدام مكون `PasswordGenerator` مع `PasswordStrengthIndicator` في نموذج تسجيل.

## 🎯 الميزات المعروضة

1. **توليد كلمة مرور قوية**
   - زر "اقتراح كلمة مرور قوية"
   - توليد تلقائي لكلمة مرور آمنة
   - نسخ كلمة المرور بنقرة واحدة

2. **مؤشر قوة كلمة المرور**
   - شريط ملون يعرض القوة
   - قائمة متطلبات مع علامات ✓/✗
   - نصائح لتحسين كلمة المرور

3. **تأكيد كلمة المرور**
   - حقل تأكيد منفصل
   - مؤشر تطابق كلمات المرور
   - تعطيل زر التسجيل حتى التطابق

4. **إظهار/إخفاء كلمة المرور**
   - أيقونة عين للتبديل
   - دعم keyboard navigation

## 🚀 كيفية التشغيل

### 1. تشغيل المثال في المتصفح

```bash
# في مجلد frontend
npm start
```

ثم افتح المتصفح على:
```
http://localhost:3000/examples/password-generator
```

### 2. استيراد المثال في مشروعك

```jsx
import PasswordGeneratorExample from './examples/PasswordGeneratorExample';

function App() {
  return <PasswordGeneratorExample />;
}
```

## 📝 الكود الأساسي

### State Management

```jsx
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
```

### Password Generator Handler

```jsx
const handlePasswordGenerated = (generatedPassword) => {
  setPassword(generatedPassword);
  setConfirmPassword(generatedPassword);
  console.log('Generated password:', generatedPassword);
};
```

### استخدام المكون

```jsx
<PasswordGenerator 
  onPasswordGenerated={handlePasswordGenerated}
/>
```

## 🎨 التخصيص

### تغيير الألوان

```jsx
// في style object
backgroundColor: '#304B60',  // اللون الأساسي
border: '2px solid #D4816180',  // لون الإطار
```

### تغيير الطول الافتراضي

```jsx
// في PasswordGenerator.jsx
const response = await api.post('/auth/generate-password', {
  length: 16  // بدلاً من 14
});
```

### إضافة validation إضافي

```jsx
const validatePassword = (password) => {
  if (password.length < 12) {
    return 'كلمة المرور قصيرة جداً';
  }
  if (!/[A-Z]/.test(password)) {
    return 'يجب أن تحتوي على حرف كبير';
  }
  // المزيد من الشروط...
  return null;
};
```

## 🧪 الاختبار

### اختبار يدوي

1. افتح المثال في المتصفح
2. انقر على "اقتراح كلمة مرور قوية"
3. تحقق من:
   - ✅ توليد كلمة مرور
   - ✅ عرض مؤشر القوة
   - ✅ ملء حقل التأكيد تلقائياً
   - ✅ عمل زر النسخ
   - ✅ عمل زر التوليد الجديد

### اختبار تلقائي

```bash
npm test -- PasswordGenerator.test.jsx --run
```

## 📚 حالات الاستخدام

### 1. نموذج تسجيل بسيط

```jsx
function SimpleRegistration() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordGenerator onPasswordGenerated={setPassword} />
    </div>
  );
}
```

### 2. نموذج تسجيل متقدم

```jsx
function AdvancedRegistration() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  return (
    <div>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      
      <PasswordStrengthIndicator password={formData.password} />
      
      <PasswordGenerator 
        onPasswordGenerated={(password) => {
          setFormData({
            ...formData,
            password: password,
            confirmPassword: password
          });
        }}
      />
      
      <input
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
      />
    </div>
  );
}
```

### 3. مع Stepper

```jsx
function StepperRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  return (
    <div>
      {currentStep === 1 && (
        <div>
          <input
            type="text"
            placeholder="الاسم"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      )}
      
      {currentStep === 2 && (
        <div>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          
          <PasswordStrengthIndicator password={formData.password} />
          
          <PasswordGenerator 
            onPasswordGenerated={(password) => {
              setFormData({
                ...formData,
                password: password,
                confirmPassword: password
              });
            }}
          />
          
          <input
            type="password"
            placeholder="تأكيد كلمة المرور"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
```

## 🐛 استكشاف الأخطاء

### المثال لا يعمل

**المشكلة**: المثال لا يظهر أو يعطي أخطاء

**الحلول**:
1. تحقق من تثبيت جميع التبعيات: `npm install`
2. تحقق من تشغيل Backend: `npm start` في مجلد backend
3. تحقق من console للأخطاء

### كلمة المرور لا تُولد

**المشكلة**: النقر على الزر لا يولد كلمة مرور

**الحلول**:
1. تحقق من اتصال Backend API
2. افتح Network tab في DevTools
3. تحقق من endpoint `/auth/generate-password`

### الأنماط لا تظهر

**المشكلة**: المثال يعمل لكن الأنماط غير صحيحة

**الحلول**:
1. تحقق من استيراد `PasswordGenerator.css`
2. تحقق من `AppProvider` يحيط بالمكون
3. تحقق من inline styles في المثال

## 💡 نصائح

1. **استخدم مع PasswordStrengthIndicator**: دائماً اعرض مؤشر القوة مع المولد
2. **املأ حقل التأكيد تلقائياً**: وفر على المستخدم الكتابة مرتين
3. **أضف validation**: تحقق من تطابق كلمات المرور قبل الإرسال
4. **اختبر على أجهزة مختلفة**: تأكد من عمل المثال على الموبايل
5. **استخدم HTTPS**: لا تنسى استخدام HTTPS في الإنتاج

## 🔗 الملفات ذات الصلة

- `PasswordGeneratorExample.jsx` - المثال الكامل
- `PasswordGenerator.jsx` - المكون الأساسي
- `PasswordStrengthIndicator.jsx` - مؤشر القوة
- `PasswordGenerator.README.md` - توثيق المكون

## 📝 ملاحظات

- المثال يستخدم inline styles للبساطة
- يمكنك استخدام CSS modules أو styled-components
- المثال يدعم RTL/LTR تلقائياً
- يعمل مع أو بدون Backend API

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ جاهز للاستخدام
