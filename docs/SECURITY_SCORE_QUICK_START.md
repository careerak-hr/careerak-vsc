# Security Score - دليل البدء السريع

## ⚡ البدء السريع (5 دقائق)

### 1. Backend Setup

**لا يحتاج إعداد!** الميزة جاهزة للاستخدام فوراً.

المسار مضاف تلقائياً في `backend/src/app.js`:
```javascript
app.use('/security-score', require('./routes/securityScoreRoutes'));
```

### 2. Frontend Usage

**الاستخدام الأساسي**:
```jsx
import SecurityScore from './components/SecurityScore/SecurityScore';

function MyPage() {
  return <SecurityScore />;
}
```

**الوضع المضغوط**:
```jsx
<SecurityScore compact={true} />
```

### 3. API Testing

```bash
# احصل على token أولاً من تسجيل الدخول
TOKEN="your_jwt_token_here"

# اختبر API
curl -X GET http://localhost:5000/api/security-score \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 كيف يعمل؟

### عوامل الحساب (100 نقطة)

| العامل | النقاط | كيف تحصل عليها؟ |
|--------|--------|-----------------|
| 🔑 قوة كلمة المرور | 25 | استخدم كلمة مرور قوية (8+ أحرف، أحرف كبيرة/صغيرة، أرقام، رموز) |
| ✉️ تأكيد البريد | 20 | أكد بريدك الإلكتروني |
| 🛡️ المصادقة الثنائية | 30 | فعّل 2FA من الإعدادات |
| 🔗 حسابات OAuth | 15 | اربط Google/Facebook/LinkedIn (5 نقاط لكل حساب) |
| 👤 اكتمال الملف | 10 | أكمل: الهاتف، الدولة، المدينة، الصورة |

### مستويات الأمان

- **80-100**: ممتاز 🟢
- **60-79**: جيد 🔵
- **40-59**: متوسط 🟠
- **0-39**: ضعيف 🔴

---

## 🎯 أمثلة سريعة

### مثال 1: في صفحة الإعدادات

```jsx
import SecurityScore from './components/SecurityScore/SecurityScore';

function SettingsPage() {
  return (
    <div className="settings-page">
      <h1>الإعدادات</h1>
      
      {/* Security Score */}
      <section className="security-section">
        <SecurityScore />
      </section>
      
      {/* باقي الإعدادات */}
    </div>
  );
}
```

### مثال 2: في Dashboard

```jsx
import SecurityScore from './components/SecurityScore/SecurityScore';

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>لوحة التحكم</h1>
      
      <div className="widgets">
        {/* Security Score Widget */}
        <SecurityScore compact={true} />
        
        {/* باقي الـ widgets */}
      </div>
    </div>
  );
}
```

### مثال 3: مع Refresh Button

```jsx
import { useState } from 'react';
import SecurityScore from './components/SecurityScore/SecurityScore';

function ProfilePage() {
  const [key, setKey] = useState(0);
  
  const handleRefresh = () => {
    setKey(prev => prev + 1); // Force re-render
  };
  
  return (
    <div>
      <SecurityScore key={key} />
      <button onClick={handleRefresh}>
        تحديث Security Score
      </button>
    </div>
  );
}
```

---

## 🔧 API Endpoints

### GET /api/security-score

**الحصول على Security Score الكامل**

```javascript
const response = await fetch('/api/security-score', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data.score); // 65
console.log(data.data.level); // "good"
console.log(data.data.recommendations); // Array
```

### GET /api/security-score/recommendations

**الحصول على التوصيات فقط**

```javascript
const response = await fetch('/api/security-score/recommendations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data.recommendations); // Array
```

---

## 💡 نصائح سريعة

### لتحسين Security Score:

1. **فعّل 2FA** (+30 نقطة) 🛡️
   - اذهب إلى الإعدادات → الأمان
   - فعّل المصادقة الثنائية

2. **أكد بريدك** (+20 نقطة) ✉️
   - افتح البريد الوارد
   - انقر على رابط التأكيد

3. **استخدم كلمة مرور قوية** (حتى 25 نقطة) 🔑
   - 8+ أحرف
   - أحرف كبيرة وصغيرة
   - أرقام ورموز

4. **اربط حسابات OAuth** (حتى 15 نقطة) 🔗
   - Google: +5 نقاط
   - Facebook: +5 نقاط
   - LinkedIn: +5 نقاط

5. **أكمل ملفك** (حتى 10 نقاط) 👤
   - أضف رقم الهاتف
   - أضف الدولة والمدينة
   - أضف صورة الملف الشخصي

---

## 🐛 استكشاف الأخطاء السريع

### المشكلة: "غير مصرح" (401)
**الحل**: تحقق من token في localStorage
```javascript
const token = localStorage.getItem('authToken');
console.log(token); // يجب أن يكون موجود
```

### المشكلة: المكون لا يظهر
**الحل**: تحقق من الاستيراد والمسار
```javascript
// ✅ صحيح
import SecurityScore from './components/SecurityScore/SecurityScore';

// ❌ خطأ
import SecurityScore from './components/SecurityScore'; // ناقص .jsx
```

### المشكلة: الدرجة دائماً 0
**الحل**: تحقق من بيانات المستخدم
```javascript
// في Backend
const user = await User.findById(userId);
console.log(user.passwordStrength); // يجب أن يكون موجود
console.log(user.emailVerified); // true/false
```

---

## 📚 المزيد من المعلومات

للتوثيق الكامل، راجع:
- 📄 `docs/SECURITY_SCORE_FEATURE.md` - دليل شامل
- 📄 `frontend/src/examples/SecurityScoreExample.jsx` - أمثلة عملية

---

## ✅ Checklist

قبل الاستخدام، تأكد من:

- [ ] Backend يعمل (`npm start` في `backend/`)
- [ ] Frontend يعمل (`npm start` في `frontend/`)
- [ ] المستخدم مسجل دخول (token موجود)
- [ ] المسار `/api/security-score` يعمل
- [ ] المكون مستورد بشكل صحيح

---

**وقت الإعداد**: < 5 دقائق  
**الصعوبة**: سهل ⭐  
**الحالة**: ✅ جاهز للاستخدام
