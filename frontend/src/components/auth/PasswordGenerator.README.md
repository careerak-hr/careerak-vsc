# PasswordGenerator Component

## 📋 نظرة عامة

مكون React لتوليد كلمات مرور قوية مع خيارات النسخ والتوليد الجديد. يستخدم Backend API لتوليد كلمات مرور آمنة مع fallback محلي في حالة فشل الاتصال.

## ✨ الميزات

- ✅ توليد كلمات مرور قوية (14 حرف افتراضياً)
- ✅ عرض كلمة المرور في code block
- ✅ نسخ كلمة المرور للحافظة
- ✅ توليد كلمة مرور جديدة
- ✅ عرض قوة كلمة المرور
- ✅ دعم RTL/LTR
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ Fallback محلي عند فشل API
- ✅ تصميم متجاوب

## 📦 الاستخدام

### استيراد المكون

```jsx
import PasswordGenerator from './components/auth/PasswordGenerator';
```

### استخدام بسيط

```jsx
<PasswordGenerator />
```

### مع callback

```jsx
<PasswordGenerator 
  onPasswordGenerated={(password) => {
    console.log('Generated password:', password);
    // استخدام كلمة المرور
  }}
/>
```

### في نموذج تسجيل

```jsx
function RegistrationForm() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  return (
    <div>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      
      <PasswordGenerator 
        onPasswordGenerated={(password) => {
          setFormData({
            ...formData,
            password: password,
            confirmPassword: password
          });
        }}
      />
    </div>
  );
}
```

## 🔧 Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onPasswordGenerated` | `function` | No | `undefined` | Callback يُستدعى عند توليد كلمة مرور جديدة |

### onPasswordGenerated

```typescript
onPasswordGenerated?: (password: string) => void
```

يُستدعى عند توليد كلمة مرور جديدة بنجاح، سواء من API أو محلياً.

**مثال:**
```jsx
<PasswordGenerator 
  onPasswordGenerated={(password) => {
    console.log('New password:', password);
    // تحديث state
    setPassword(password);
  }}
/>
```

## 🎨 التصميم

### الألوان

- **Primary**: `#304B60` (كحلي)
- **Border**: `#D4816180` (نحاسي باهت)
- **Success**: `#10b981` (أخضر)
- **Info**: `#3b82f6` (أزرق)

### الأزرار

1. **زر الاقتراح**: زر رئيسي لتوليد كلمة مرور
2. **زر النسخ**: أيقونة نسخ مع تأكيد بصري
3. **زر التوليد الجديد**: أيقونة تحديث لتوليد كلمة مرور جديدة

### الحالات

- **Initial**: عرض زر "اقتراح كلمة مرور قوية"
- **Generating**: عرض "جاري التوليد..."
- **Generated**: عرض كلمة المرور مع أزرار الإجراءات
- **Copied**: عرض رسالة "تم النسخ!" لمدة 2 ثانية

## 🔐 الأمان

### توليد كلمات المرور

**Backend (مفضل):**
- يستخدم `crypto.randomBytes` لتوليد أرقام عشوائية آمنة
- يضمن وجود حرف واحد من كل نوع (uppercase, lowercase, number, special)
- يخلط الأحرف باستخدام Fisher-Yates shuffle

**Frontend (Fallback):**
- يستخدم `Math.random()` (أقل أماناً)
- نفس المنطق لضمان التنوع
- يُستخدم فقط عند فشل API

### متطلبات كلمة المرور

- ✓ 8 أحرف على الأقل
- ✓ حرف كبير واحد على الأقل (A-Z)
- ✓ حرف صغير واحد على الأقل (a-z)
- ✓ رقم واحد على الأقل (0-9)
- ✓ رمز خاص واحد على الأقل (!@#$%^&*...)

## 🌐 الترجمة

### اللغات المدعومة

- العربية (ar) - افتراضي
- الإنجليزية (en)
- الفرنسية (fr)

### النصوص المترجمة

```javascript
{
  ar: {
    suggestButton: '🔑 اقتراح كلمة مرور قوية',
    generating: 'جاري التوليد...',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    regenerate: 'توليد جديد',
    strength: 'القوة:',
    generatedPassword: 'كلمة المرور المقترحة:'
  },
  en: {
    suggestButton: '🔑 Suggest Strong Password',
    generating: 'Generating...',
    copy: 'Copy',
    copied: 'Copied!',
    regenerate: 'Generate New',
    strength: 'Strength:',
    generatedPassword: 'Suggested Password:'
  },
  fr: {
    suggestButton: '🔑 Suggérer un mot de passe fort',
    generating: 'Génération...',
    copy: 'Copier',
    copied: 'Copié!',
    regenerate: 'Générer nouveau',
    strength: 'Force:',
    generatedPassword: 'Mot de passe suggéré:'
  }
}
```

## 🔌 Backend API

### Endpoint

```
POST /auth/generate-password
```

### Request

```json
{
  "length": 14
}
```

### Response (Success)

```json
{
  "success": true,
  "data": {
    "password": "Kx9#mP2$vL4@",
    "strength": {
      "score": 4,
      "label": "strong",
      "labelAr": "قوي",
      "color": "#10b981",
      "percentage": 100
    }
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "حدث خطأ أثناء توليد كلمة المرور",
  "messageEn": "Error generating password"
}
```

## 📱 Responsive Design

### Desktop (> 640px)
- عرض أفقي للأزرار
- نص كبير للكلمة المرور

### Mobile (≤ 639px)
- عرض عمودي للأزرار
- نص أصغر للكلمة المرور
- أزرار في المنتصف

## ♿ Accessibility

- ✅ دعم keyboard navigation
- ✅ ARIA labels للأزرار
- ✅ Focus states واضحة
- ✅ رسائل خطأ واضحة
- ✅ دعم screen readers

## 🧪 الاختبار

### تشغيل الاختبارات

```bash
npm test -- PasswordGenerator.test.jsx --run
```

### الاختبارات المتاحة

1. ✅ عرض زر الاقتراح في البداية
2. ✅ توليد كلمة مرور عند النقر
3. ✅ توليد كلمة مرور محلياً عند فشل API
4. ✅ نسخ كلمة المرور للحافظة
5. ✅ إعادة توليد كلمة مرور جديدة
6. ✅ عرض معلومات القوة
7. ✅ دعم RTL للعربية
8. ✅ توليد كلمة مرور بالطول الصحيح
9. ✅ توليد كلمة مرور بجميع أنواع الأحرف

## 🐛 استكشاف الأخطاء

### كلمة المرور لا تُولد

**المشكلة**: النقر على الزر لا يولد كلمة مرور

**الحلول**:
1. تحقق من اتصال Backend API
2. تحقق من console للأخطاء
3. المكون يجب أن يولد كلمة مرور محلياً تلقائياً

### النسخ لا يعمل

**المشكلة**: زر النسخ لا ينسخ كلمة المرور

**الحلول**:
1. تحقق من دعم `navigator.clipboard` في المتصفح
2. المكون يستخدم fallback للمتصفحات القديمة
3. تحقق من أذونات الحافظة

### الترجمة لا تعمل

**المشكلة**: النصوص تظهر بالإنجليزية دائماً

**الحلول**:
1. تحقق من `AppContext` يوفر `language`
2. تحقق من قيمة `language` صحيحة (ar, en, fr)

## 📚 أمثلة إضافية

### مع PasswordStrengthIndicator

```jsx
function PasswordField() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <PasswordStrengthIndicator password={password} />
      
      <PasswordGenerator 
        onPasswordGenerated={setPassword}
      />
    </div>
  );
}
```

### في Stepper

```jsx
function Step2Password({ formData, setFormData }) {
  return (
    <div>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={(e) => setFormData({ 
          ...formData, 
          password: e.target.value 
        })}
      />
      
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
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ 
          ...formData, 
          confirmPassword: e.target.value 
        })}
      />
    </div>
  );
}
```

## 🔗 الملفات ذات الصلة

- `PasswordGenerator.jsx` - المكون الرئيسي
- `PasswordGenerator.css` - الأنماط
- `PasswordGenerator.test.jsx` - الاختبارات
- `backend/src/services/passwordService.js` - خدمة توليد كلمات المرور
- `backend/src/controllers/authController.js` - معالج API

## 📝 ملاحظات

- المكون يستخدم `useApp()` للحصول على اللغة
- يدعم RTL/LTR تلقائياً
- يعمل مع أو بدون Backend API
- يحترم تفضيلات المستخدم للغة

## 🎯 المتطلبات المستوفاة

- ✅ Requirements 3.1: زر "اقتراح كلمة مرور قوية"
- ✅ Requirements 3.2: توليد كلمة مرور عشوائية (12-16 حرف)
- ✅ Requirements 3.3: زر "نسخ" بجانب الاقتراح
- ✅ Requirements 3.4: زر "توليد جديد" لاقتراح آخر
- ✅ Requirements 3.5: رسالة تأكيد عند النسخ

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل ومختبر
