# مثال على مكون PasswordStrengthIndicator

## 📋 الوصف
هذا المثال يوضح كيفية استخدام مكون `PasswordStrengthIndicator` في تطبيقك.

## 🚀 كيفية التشغيل

### الطريقة 1: إضافة إلى AppRoutes
```jsx
// في AppRoutes.jsx
import PasswordStrengthIndicatorExample from './examples/PasswordStrengthIndicatorExample';

<Route path="/examples/password-strength" element={<PasswordStrengthIndicatorExample />} />
```

ثم افتح: `http://localhost:5173/examples/password-strength`

### الطريقة 2: استبدال صفحة مؤقتة
```jsx
// في App.jsx أو أي صفحة أخرى
import PasswordStrengthIndicatorExample from './examples/PasswordStrengthIndicatorExample';

function App() {
  return <PasswordStrengthIndicatorExample />;
}
```

## 🎯 الميزات المعروضة

### 1. الشريط الملون
- شريط تقدم يتغير لونه حسب قوة كلمة المرور
- 5 مستويات: ضعيف جداً، ضعيف، متوسط، جيد، قوي

### 2. المتطلبات
- قائمة تحقق للمتطلبات الخمسة
- علامات ✓/✗ لكل متطلب
- تغيير اللون حسب الحالة

### 3. النصائح
- نصائح من zxcvbn لتحسين كلمة المرور
- عرض وقت الاختراق المتوقع

### 4. التحديث الفوري
- تحديث تلقائي أثناء الكتابة
- لا حاجة للنقر على زر

## 📝 أمثلة الاختبار

المثال يوفر 5 أزرار سريعة لاختبار مستويات مختلفة:

1. **ضعيف جداً**: `123`
   - لا يستوفي أي متطلبات تقريباً
   - شريط أحمر

2. **ضعيف**: `password`
   - يستوفي بعض المتطلبات
   - شريط برتقالي

3. **متوسط**: `Password1`
   - يستوفي معظم المتطلبات
   - شريط أصفر

4. **جيد**: `Password123`
   - يستوفي جميع المتطلبات تقريباً
   - شريط أصفر فاتح

5. **قوي**: `P@ssw0rd!123`
   - يستوفي جميع المتطلبات
   - شريط أخضر

## 🔧 الاستخدام في مشروعك

```jsx
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator';

function MyForm() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      {password && (
        <PasswordStrengthIndicator
          password={password}
          onStrengthChange={(strength) => {
            console.log('Password strength:', strength);
            // يمكنك استخدام strength.score للتحقق
            // أو منع الإرسال إذا كانت كلمة المرور ضعيفة
          }}
        />
      )}
    </div>
  );
}
```

## 📊 كائن القوة (Strength Object)

```javascript
{
  score: 3,                    // 0-4
  label: 'جيد',                // ضعيف جداً، ضعيف، متوسط، جيد، قوي
  color: '#eab308',            // اللون المناسب
  percentage: 75,              // 0-100
  requirements: {
    length: true,              // 8 أحرف على الأقل
    uppercase: true,           // حرف كبير
    lowercase: true,           // حرف صغير
    number: true,              // رقم
    special: false             // رمز خاص
  },
  feedback: [                  // نصائح من zxcvbn
    'Add another word or two',
    'Use a few words, avoid common phrases'
  ],
  crackTime: '3 days'          // وقت الاختراق المتوقع
}
```

## 🌍 دعم اللغات

المكون يدعم 3 لغات:
- العربية (ar) - افتراضي
- الإنجليزية (en)
- الفرنسية (fr)

يتم اختيار اللغة تلقائياً من `AppContext`.

## 🎨 التخصيص

يمكنك تخصيص الألوان في `PasswordStrengthIndicator.jsx`:

```javascript
const colors = [
  '#ef4444',  // ضعيف جداً - أحمر
  '#f97316',  // ضعيف - برتقالي
  '#f59e0b',  // متوسط - أصفر
  '#eab308',  // جيد - أصفر فاتح
  '#10b981'   // قوي - أخضر
];
```

## 📚 المراجع

- [zxcvbn Documentation](https://github.com/dropbox/zxcvbn)
- [Password Strength Requirements](https://www.nist.gov/password-guidelines)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**تاريخ الإنشاء**: 2026-02-23  
**الحالة**: ✅ جاهز للاستخدام
