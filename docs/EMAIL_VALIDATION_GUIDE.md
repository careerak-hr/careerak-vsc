# دليل التحقق من صحة البريد الإلكتروني

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-02-23
- **الحالة**: ✅ مكتمل
- **المتطلبات**: Requirements 4.1 - التحقق من صحة البريد (regex validation)

---

## 🎯 نظرة عامة

تم إنشاء نظام شامل للتحقق من صحة البريد الإلكتروني باستخدام regex validation. يوفر النظام مجموعة من الدوال للتحقق من صحة البريد الإلكتروني، استخراج النطاق، والتحقق من النطاقات الشائعة.

---

## 📁 الملفات

```
frontend/src/utils/
├── emailValidation.js              # الوظائف الرئيسية
└── __tests__/
    └── emailValidation.test.js     # الاختبارات (32 اختبار)
```

---

## 🔧 الوظائف المتاحة

### 1. isValidEmail(email)

التحقق البسيط من صحة البريد الإلكتروني.

```javascript
import { isValidEmail } from '../utils/emailValidation';

// أمثلة
isValidEmail('user@example.com')        // true
isValidEmail('test.user@example.com')   // true
isValidEmail('invalid-email')           // false
isValidEmail('user@domain')             // false
```

**المعايير:**
- يجب أن يحتوي على @
- يجب أن يحتوي على نطاق صحيح
- يجب أن يحتوي على امتداد نطاق (حرفين على الأقل)
- الحد الأقصى 254 حرف
- اسم المستخدم: الحد الأقصى 64 حرف

---

### 2. validateEmailWithMessage(email)

التحقق من صحة البريد مع إرجاع رسالة خطأ تفصيلية.

```javascript
import { validateEmailWithMessage } from '../utils/emailValidation';

// مثال 1: بريد صحيح
const result1 = validateEmailWithMessage('user@example.com');
// { valid: true, error: null }

// مثال 2: بريد بدون @
const result2 = validateEmailWithMessage('userexample.com');
// { valid: false, error: 'البريد الإلكتروني يجب أن يحتوي على @' }

// مثال 3: بريد فارغ
const result3 = validateEmailWithMessage('');
// { valid: false, error: 'يرجى إدخال البريد الإلكتروني' }
```

**رسائل الخطأ المتاحة:**
- `يرجى إدخال البريد الإلكتروني` - بريد فارغ
- `البريد الإلكتروني طويل جداً (الحد الأقصى 254 حرف)` - طول زائد
- `البريد الإلكتروني يجب أن يحتوي على @` - بدون @
- `البريد الإلكتروني يجب أن يحتوي على @ واحدة فقط` - @ متعددة
- `البريد الإلكتروني يجب أن يحتوي على اسم مستخدم قبل @` - بدون اسم مستخدم
- `اسم المستخدم طويل جداً (الحد الأقصى 64 حرف)` - اسم مستخدم طويل
- `البريد الإلكتروني يجب أن يحتوي على نطاق بعد @` - بدون نطاق
- `النطاق يجب أن يحتوي على نقطة (.)` - بدون نقطة
- `امتداد النطاق يجب أن يكون حرفين على الأقل` - امتداد قصير
- `البريد الإلكتروني غير صحيح` - خطأ عام

---

### 3. extractDomain(email)

استخراج النطاق من البريد الإلكتروني.

```javascript
import { extractDomain } from '../utils/emailValidation';

extractDomain('user@example.com')      // 'example.com'
extractDomain('test@gmail.com')        // 'gmail.com'
extractDomain('admin@company.co.uk')   // 'company.co.uk'
extractDomain('invalid')               // null
```

---

### 4. isEmailFromDomain(email, domain)

التحقق من أن البريد ينتمي لنطاق معين.

```javascript
import { isEmailFromDomain } from '../utils/emailValidation';

isEmailFromDomain('user@gmail.com', 'gmail.com')    // true
isEmailFromDomain('user@yahoo.com', 'gmail.com')    // false
isEmailFromDomain('user@Gmail.COM', 'gmail.com')    // true (غير حساس لحالة الأحرف)
```

---

### 5. isCommonEmailDomain(email)

التحقق من أن البريد يستخدم نطاق شائع.

```javascript
import { isCommonEmailDomain } from '../utils/emailValidation';

isCommonEmailDomain('user@gmail.com')        // true
isCommonEmailDomain('user@yahoo.com')        // true
isCommonEmailDomain('user@mycompany.com')    // false
```

**النطاقات الشائعة المدعومة:**
- gmail.com
- yahoo.com
- hotmail.com
- outlook.com
- icloud.com
- live.com
- msn.com
- aol.com
- mail.com
- protonmail.com

---

### 6. normalizeEmail(email)

تنظيف البريد الإلكتروني (إزالة المسافات وتحويل لأحرف صغيرة).

```javascript
import { normalizeEmail } from '../utils/emailValidation';

normalizeEmail('  User@Example.COM  ')    // 'user@example.com'
normalizeEmail('TEST@GMAIL.COM')          // 'test@gmail.com'
```

---

## 🎨 أمثلة الاستخدام في React

### مثال 1: حقل إدخال بسيط

```jsx
import React, { useState } from 'react';
import { isValidEmail } from '../utils/emailValidation';

function EmailInput() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(isValidEmail(value));
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        className={isValid ? 'valid' : 'invalid'}
        placeholder="البريد الإلكتروني"
      />
      {!isValid && <p className="error">البريد الإلكتروني غير صحيح</p>}
    </div>
  );
}
```

---

### مثال 2: حقل إدخال مع رسائل خطأ تفصيلية

```jsx
import React, { useState } from 'react';
import { validateEmailWithMessage } from '../utils/emailValidation';

function EmailInputWithMessages() {
  const [email, setEmail] = useState('');
  const [validation, setValidation] = useState({ valid: true, error: null });

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value) {
      const result = validateEmailWithMessage(value);
      setValidation(result);
    } else {
      setValidation({ valid: true, error: null });
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleChange}
        className={validation.valid ? 'valid' : 'invalid'}
        placeholder="البريد الإلكتروني"
      />
      {validation.error && (
        <p className="error">{validation.error}</p>
      )}
    </div>
  );
}
```

---

### مثال 3: نموذج تسجيل كامل

```jsx
import React, { useState } from 'react';
import { validateEmailWithMessage, normalizeEmail } from '../utils/emailValidation';

function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [validation, setValidation] = useState({ valid: true, error: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // تنظيف البريد
    const cleanEmail = normalizeEmail(email);
    
    // التحقق من الصحة
    const result = validateEmailWithMessage(cleanEmail);
    
    if (result.valid) {
      // إرسال البيانات
      console.log('Submitting:', cleanEmail);
    } else {
      setValidation(result);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>البريد الإلكتروني</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={validation.valid ? 'valid' : 'invalid'}
        />
        {validation.error && (
          <p className="error">{validation.error}</p>
        )}
      </div>
      <button type="submit">تسجيل</button>
    </form>
  );
}
```

---

### مثال 4: التحقق من النطاق

```jsx
import React, { useState } from 'react';
import { isEmailFromDomain, isCommonEmailDomain } from '../utils/emailValidation';

function EmailDomainChecker() {
  const [email, setEmail] = useState('');

  const isWorkEmail = isEmailFromDomain(email, 'company.com');
  const isCommon = isCommonEmailDomain(email);

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="البريد الإلكتروني"
      />
      
      {isWorkEmail && (
        <p className="info">✓ بريد العمل</p>
      )}
      
      {isCommon && (
        <p className="info">✓ نطاق شائع</p>
      )}
    </div>
  );
}
```

---

## 🧪 الاختبارات

تم إنشاء 32 اختبار شامل للتحقق من جميع الوظائف:

```bash
# تشغيل الاختبارات
cd frontend
npm test -- emailValidation.test.js --run
```

**نتائج الاختبارات:**
```
✓ isValidEmail (9 اختبارات)
✓ validateEmailWithMessage (10 اختبارات)
✓ extractDomain (2 اختبارات)
✓ isEmailFromDomain (3 اختبارات)
✓ isCommonEmailDomain (3 اختبارات)
✓ normalizeEmail (2 اختبارات)
✓ EMAIL_REGEX (1 اختبار)
✓ COMMON_EMAIL_DOMAINS (2 اختبارات)

Test Files  1 passed (1)
Tests  32 passed (32)
```

---

## 📊 Regex Pattern

```javascript
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
```

**شرح Pattern:**
- `^` - بداية السلسلة
- `[a-zA-Z0-9._%+-]+` - اسم المستخدم (أحرف، أرقام، رموز مسموحة)
- `@` - رمز @
- `[a-zA-Z0-9.-]+` - اسم النطاق
- `\.` - نقطة
- `[a-zA-Z]{2,}` - امتداد النطاق (حرفين على الأقل)
- `$` - نهاية السلسلة

---

## ✅ الميزات

- ✅ التحقق من صحة البريد باستخدام regex
- ✅ رسائل خطأ تفصيلية بالعربية
- ✅ استخراج النطاق
- ✅ التحقق من النطاقات الشائعة
- ✅ تنظيف البريد الإلكتروني
- ✅ غير حساس لحالة الأحرف
- ✅ التحقق من الطول (254 حرف للبريد، 64 للمستخدم)
- ✅ 32 اختبار شامل
- ✅ دعم كامل للعربية

---

## 🔜 الخطوات التالية

1. ✅ التحقق من صحة البريد (regex validation) - **مكتمل**
2. ⏳ التحقق من وجود البريد في قاعدة البيانات (API call) - **قادم**
3. ⏳ التحقق من الأخطاء الشائعة (typo correction) - **قادم**
4. ⏳ إنشاء EmailValidator Component - **قادم**

---

## 📝 ملاحظات

- جميع الوظائف تدعم العربية
- الوظائف غير حساسة لحالة الأحرف
- يتم إزالة المسافات تلقائياً
- يتبع معيار RFC 5322 المبسط
- جميع الاختبارات تنجح ✅

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل
