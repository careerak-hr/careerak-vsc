# Password Validation API - التوثيق

## 📋 معلومات عامة

تم تنفيذ نظام التحقق من قوة كلمة المرور باستخدام مكتبة `zxcvbn` المتقدمة.

**تاريخ الإنشاء**: 2026-02-18  
**الحالة**: ✅ مكتمل ومفعّل

---

## 🎯 الميزات

- ✅ حساب قوة كلمة المرور (0-4)
- ✅ التحقق من المتطلبات الأساسية (طول، أحرف كبيرة/صغيرة، أرقام، رموز)
- ✅ تقدير وقت الاختراق
- ✅ نصائح لتحسين كلمة المرور
- ✅ دعم اللغة العربية والإنجليزية
- ✅ ألوان مرئية للقوة (أحمر → أخضر)

---

## 📁 الملفات المضافة

```
backend/src/
├── services/
│   └── passwordService.js          # خدمة التحقق من كلمة المرور
├── controllers/
│   └── authController.js           # معالج طلبات المصادقة
└── routes/
    └── authRoutes.js               # مسارات API المصادقة
```

---

## 🔌 API Endpoint

### POST /auth/validate-password

**الوصف**: التحقق من قوة كلمة المرور وإرجاع معلومات تفصيلية

**الوصول**: Public (لا يحتاج authentication)

**Request Body**:
```json
{
  "password": "MySecureP@ssw0rd"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "data": {
    "score": 3,
    "label": "good",
    "labelAr": "جيد",
    "color": "#eab308",
    "percentage": 75,
    "requirements": {
      "length": true,
      "uppercase": true,
      "lowercase": true,
      "number": true,
      "special": true
    },
    "feedback": [
      "Add another word or two. Uncommon words are better."
    ],
    "feedbackAr": [
      "أضف كلمة أو اثنتين. الكلمات غير الشائعة أفضل."
    ],
    "crackTime": "4 hours",
    "crackTimeAr": "4 ساعات",
    "warning": null,
    "guesses": 14316000,
    "guessesLog10": 7.155,
    "meetsRequirements": true,
    "isAcceptable": true
  }
}
```

**Response (Error - 400)**:
```json
{
  "success": false,
  "message": "كلمة المرور مطلوبة",
  "messageEn": "Password is required"
}
```

---

## 📊 مستويات القوة

| Score | Label (EN) | Label (AR) | Color | Percentage |
|-------|------------|------------|-------|------------|
| 0 | weak | ضعيف | #ef4444 (أحمر) | 0% |
| 1 | weak | ضعيف | #ef4444 (أحمر) | 25% |
| 2 | fair | متوسط | #f59e0b (برتقالي) | 50% |
| 3 | good | جيد | #eab308 (أصفر) | 75% |
| 4 | strong | قوي | #10b981 (أخضر) | 100% |

---

## ✅ متطلبات كلمة المرور

1. **الطول**: 8 أحرف على الأقل
2. **حرف كبير**: حرف واحد على الأقل (A-Z)
3. **حرف صغير**: حرف واحد على الأقل (a-z)
4. **رقم**: رقم واحد على الأقل (0-9)
5. **رمز خاص**: رمز واحد على الأقل (!@#$%^&*(),.?":{}|<>)

---

## 🧪 أمثلة الاختبار

### مثال 1: كلمة مرور ضعيفة
```bash
curl -X POST http://localhost:5000/auth/validate-password \
  -H "Content-Type: application/json" \
  -d '{"password":"123"}'
```

**النتيجة**:
- Score: 0/4
- Label: ضعيف
- meetsRequirements: false
- isAcceptable: false

### مثال 2: كلمة مرور تستوفي المتطلبات لكن ضعيفة
```bash
curl -X POST http://localhost:5000/auth/validate-password \
  -H "Content-Type: application/json" \
  -d '{"password":"Password1!"}'
```

**النتيجة**:
- Score: 1/4
- Label: ضعيف
- meetsRequirements: true
- isAcceptable: false (لأن score < 2)

### مثال 3: كلمة مرور قوية
```bash
curl -X POST http://localhost:5000/auth/validate-password \
  -H "Content-Type: application/json" \
  -d '{"password":"MySecureP@ssw0rd"}'
```

**النتيجة**:
- Score: 3/4
- Label: جيد
- meetsRequirements: true
- isAcceptable: true

### مثال 4: كلمة مرور قوية جداً
```bash
curl -X POST http://localhost:5000/auth/validate-password \
  -H "Content-Type: application/json" \
  -d '{"password":"Kx9#mP2$vL4@"}'
```

**النتيجة**:
- Score: 4/4
- Label: قوي
- meetsRequirements: true
- isAcceptable: true

---

## 🔧 التكامل مع Frontend

### مثال React
```jsx
import { useState, useEffect } from 'react';

function PasswordInput() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounced validation
  useEffect(() => {
    if (!password) {
      setStrength(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/auth/validate-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        
        const result = await response.json();
        if (result.success) {
          setStrength(result.data);
        }
      } catch (error) {
        console.error('Error validating password:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [password]);

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="كلمة المرور"
      />
      
      {strength && (
        <div>
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${strength.percentage}%`,
                backgroundColor: strength.color
              }}
            />
          </div>
          
          {/* Label */}
          <p style={{ color: strength.color }}>
            {strength.labelAr} - {strength.crackTimeAr}
          </p>
          
          {/* Requirements */}
          <ul>
            <li>{strength.requirements.length ? '✅' : '❌'} 8 أحرف على الأقل</li>
            <li>{strength.requirements.uppercase ? '✅' : '❌'} حرف كبير</li>
            <li>{strength.requirements.lowercase ? '✅' : '❌'} حرف صغير</li>
            <li>{strength.requirements.number ? '✅' : '❌'} رقم</li>
            <li>{strength.requirements.special ? '✅' : '❌'} رمز خاص</li>
          </ul>
          
          {/* Feedback */}
          {strength.feedbackAr.length > 0 && (
            <div>
              <p>نصائح:</p>
              <ul>
                {strength.feedbackAr.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🔒 الأمان

### ما يتم حسابه
- ✅ قوة كلمة المرور (zxcvbn algorithm)
- ✅ المتطلبات الأساسية
- ✅ وقت الاختراق المقدر
- ✅ نصائح التحسين

### ما لا يتم حفظه
- ❌ كلمة المرور نفسها لا تُحفظ في أي مكان
- ❌ لا يتم تسجيل كلمات المرور في logs
- ❌ الـ API لا يحتاج authentication (لأنه لا يحفظ شيء)

---

## 📈 معايير القبول

كلمة المرور تُعتبر **مقبولة** إذا:
1. `score >= 2` (متوسط على الأقل)
2. `meetsRequirements === true` (تستوفي جميع المتطلبات)

```javascript
isAcceptable = (score >= 2) && meetsRequirements
```

---

## 🧪 الاختبار

### اختبار الخدمة مباشرة
```bash
cd backend
node test-password-validation.js
```

### اختبار API
```bash
cd backend
node test-api-password.js
```

---

## 🔗 المراجع

- [zxcvbn Library](https://github.com/dropbox/zxcvbn) - مكتبة Dropbox لحساب قوة كلمة المرور
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## 📝 ملاحظات

1. **zxcvbn** تستخدم خوارزميات متقدمة لحساب القوة:
   - تكتشف الأنماط الشائعة (keyboard patterns)
   - تكتشف التواريخ والأرقام المتسلسلة
   - تكتشف الكلمات الشائعة في قواميس متعددة
   - تحسب عدد المحاولات المطلوبة للاختراق

2. **الترجمة العربية**:
   - جميع النصائح مترجمة للعربية
   - أوقات الاختراق مترجمة
   - التسميات مترجمة

3. **الأداء**:
   - zxcvbn سريعة جداً (< 10ms)
   - يمكن استخدامها في real-time validation
   - لا تحتاج اتصال بالإنترنت

---

**تاريخ الإنشاء**: 2026-02-18  
**آخر تحديث**: 2026-02-18  
**الحالة**: ✅ مكتمل ومفعّل
