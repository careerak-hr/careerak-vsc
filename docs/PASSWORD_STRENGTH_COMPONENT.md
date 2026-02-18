# Password Strength Component - مكون قوة كلمة المرور

## 📋 معلومات المكون

- **اسم المكون**: PasswordStrengthIndicator
- **المسار**: `frontend/src/components/auth/PasswordStrengthIndicator.jsx`
- **تاريخ الإنشاء**: 2026-02-18
- **الحالة**: ✅ مكتمل ومفعّل

---

## 🎯 الوظيفة

مكون React يعرض مؤشر قوة كلمة المرور بشكل مرئي مع:
- شريط ملون يتغير من الأحمر (ضعيف) إلى الأخضر (قوي)
- 4 مستويات قوة (ضعيف جداً، ضعيف، متوسط، جيد، قوي)
- قائمة متطلبات مع علامات ✓/✗
- تحديث فوري أثناء الكتابة (debounced)
- عرض وقت الاختراق المتوقع
- نصائح لتحسين كلمة المرور

---

## 🔧 التقنيات المستخدمة

- **zxcvbn**: مكتبة حساب قوة كلمة المرور من Dropbox
- **React Hooks**: useState, useEffect, useMemo
- **Backend API**: POST /auth/validate-password
- **Debouncing**: تأخير 500ms قبل التحقق من Backend

---

## 📝 الاستخدام

### Import
```jsx
import PasswordStrengthIndicator from './components/auth/PasswordStrengthIndicator';
```

### Basic Usage
```jsx
<PasswordStrengthIndicator 
  password={formData.password}
/>
```

### With Callback
```jsx
<PasswordStrengthIndicator 
  password={formData.password}
  onStrengthChange={(strength) => {
    console.log('Password strength:', strength);
    // يمكن استخدام هذا لتعطيل زر التسجيل
    if (strength.score < 2) {
      setSubmitDisabled(true);
    }
  }}
/>
```

---

## 🎨 الميزات

### 1. شريط القوة الملون
- **أحمر (#ef4444)**: ضعيف جداً / ضعيف (score 0-1)
- **برتقالي (#f97316)**: ضعيف (score 1)
- **أصفر (#f59e0b)**: متوسط (score 2)
- **أصفر فاتح (#eab308)**: جيد (score 3)
- **أخضر (#10b981)**: قوي (score 4)

### 2. المتطلبات (Requirements)
- ✓ 8 أحرف على الأقل
- ✓ حرف كبير واحد على الأقل (A-Z)
- ✓ حرف صغير واحد على الأقل (a-z)
- ✓ رقم واحد على الأقل (0-9)
- ✓ رمز خاص واحد على الأقل (!@#$%^&*)

### 3. وقت الاختراق
يعرض الوقت المتوقع لاختراق كلمة المرور:
- "أقل من ثانية"
- "3 ساعات"
- "8 أشهر"
- "قرون"

### 4. النصائح (Suggestions)
نصائح من zxcvbn لتحسين كلمة المرور:
- "أضف كلمة أو كلمتين أخريين"
- "تجنب التسلسلات الشائعة"
- "تجنب التواريخ والسنوات"
- "استخدم أحرف كبيرة وصغيرة"

---

## 🌍 دعم اللغات

المكون يدعم 3 لغات:
- **العربية (ar)**: ضعيف جداً، ضعيف، متوسط، جيد، قوي
- **الإنجليزية (en)**: Very Weak, Weak, Fair, Good, Strong
- **الفرنسية (fr)**: Très faible, Faible, Moyen, Bon, Fort

---

## 🔄 التكامل مع Backend

المكون يتحقق من Backend API بشكل تلقائي:

### API Endpoint
```
POST /auth/validate-password
```

### Request Body
```json
{
  "password": "MyP@ssw0rd123"
}
```

### Response
```json
{
  "isValid": true,
  "score": 3,
  "label": "good",
  "requirements": {
    "length": true,
    "uppercase": true,
    "lowercase": true,
    "number": true,
    "special": true
  },
  "suggestions": [
    "Add another word or two"
  ],
  "crackTime": "8 months"
}
```

---

## 📱 التكامل مع النماذج

### IndividualForm
```jsx
<div className="auth-password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder={t.password}
    value={formData.password}
    onChange={handleInputChange}
    className="auth-input-base"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="auth-password-toggle"
  >
    {showPassword ? '👁️' : '🙈'}
  </button>
</div>

{/* Password Strength Indicator */}
{formData.password && (
  <PasswordStrengthIndicator 
    password={formData.password}
  />
)}
```

### CompanyForm
نفس التكامل كما في IndividualForm

---

## 🎨 التصميم

### CSS Classes
- `.password-strength-indicator`: الحاوية الرئيسية
- `.h-2`: ارتفاع شريط القوة
- `.bg-gray-200`: خلفية الشريط
- `.rounded-full`: حواف دائرية
- `.transition-all`: انتقال سلس

### RTL Support
المكون يدعم RTL للعربية تلقائياً:
```jsx
<div 
  className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
>
```

---

## ⚡ الأداء

### Debouncing
- التحقق من Backend يتم بعد 500ms من آخر تغيير
- يمنع الطلبات الزائدة للـ API
- يحسن تجربة المستخدم

### Memoization
- حساب القوة المحلي يستخدم `useMemo`
- يعيد الحساب فقط عند تغيير password أو language

---

## 🧪 الاختبار

### Manual Testing
1. افتح صفحة التسجيل (AuthPage)
2. اختر "أفراد" أو "شركات"
3. ابدأ بكتابة كلمة مرور
4. لاحظ:
   - تغيير لون الشريط
   - تحديث المتطلبات
   - ظهور النصائح
   - عرض وقت الاختراق

### Test Cases
```javascript
// Test 1: كلمة مرور ضعيفة
password = "123456"
// Expected: أحمر، score 0، جميع المتطلبات ✗

// Test 2: كلمة مرور متوسطة
password = "Password123"
// Expected: أصفر، score 2، معظم المتطلبات ✓

// Test 3: كلمة مرور قوية
password = "MyP@ssw0rd123!"
// Expected: أخضر، score 4، جميع المتطلبات ✓
```

---

## 📊 المتطلبات المحققة

- ✅ **2.1**: شريط ملون (أحمر → أخضر)
- ✅ **2.2**: 4 مستويات قوة
- ✅ **2.3**: عرض المتطلبات مع ✓/✗
- ✅ **2.4**: تحديث فوري أثناء الكتابة
- ✅ **2.5**: عرض وقت الاختراق
- ✅ **2.6**: نصائح لتحسين كلمة المرور

---

## 🔮 التحسينات المستقبلية

1. **Password Strength Meter Animation**
   - إضافة animation عند تغيير المستوى
   - Confetti عند الوصول لمستوى "قوي"

2. **Common Passwords Check**
   - التحقق من قائمة كلمات المرور الشائعة
   - تحذير إذا كانت كلمة المرور في القائمة

3. **Password History**
   - منع استخدام كلمات مرور سابقة
   - حفظ hash لآخر 5 كلمات مرور

4. **Breach Check**
   - التحقق من Have I Been Pwned API
   - تحذير إذا كانت كلمة المرور مخترقة

---

## 📚 المراجع

- [zxcvbn GitHub](https://github.com/dropbox/zxcvbn)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

**تاريخ الإنشاء**: 2026-02-18  
**آخر تحديث**: 2026-02-18  
**الحالة**: ✅ مكتمل ومفعّل
