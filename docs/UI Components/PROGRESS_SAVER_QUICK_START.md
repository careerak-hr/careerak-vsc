# Progress Saver - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. الاستيراد

```javascript
import { 
  saveProgress, 
  loadProgress, 
  clearProgress, 
  getProgressInfo 
} from '../utils/progressSaver';
```

### 2. الحفظ التلقائي

```javascript
// في handleInputChange
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  // حفظ تلقائي
  saveProgress(currentStep, { userType, ...formData, [name]: value });
};
```

### 3. التحميل عند البدء

```javascript
// في useEffect
useEffect(() => {
  const savedProgress = loadProgress();
  if (savedProgress) {
    setShowProgressRestoration(true);
    setProgressInfo(getProgressInfo());
  }
}, []);
```

### 4. الاسترجاع

```javascript
const handleRestore = () => {
  const saved = loadProgress();
  if (saved) {
    setUserType(saved.data.userType);
    setFormData(saved.data);
    setShowProgressRestoration(false);
  }
};
```

### 5. المسح

```javascript
// بدء من جديد
const handleStartOver = () => {
  clearProgress();
  setShowProgressRestoration(false);
};

// بعد التسجيل الناجح
const handleSuccess = () => {
  clearProgress();
  // ... redirect
};
```

---

## 📋 الوظائف الرئيسية

| الوظيفة | الوصف | المثال |
|---------|-------|--------|
| `saveProgress(step, data)` | حفظ التقدم | `saveProgress(2, formData)` |
| `loadProgress()` | تحميل التقدم | `const saved = loadProgress()` |
| `clearProgress()` | مسح التقدم | `clearProgress()` |
| `hasProgress()` | التحقق من وجود تقدم | `if (hasProgress()) { ... }` |
| `getProgressInfo()` | معلومات التقدم | `const info = getProgressInfo()` |

---

## 🔒 الأمان

**✅ يُحفظ**:
- userType
- firstName, lastName
- email
- country, city
- جميع الحقول الأخرى

**❌ لا يُحفظ**:
- password
- confirmPassword
- أي بيانات حساسة

---

## ⏰ انتهاء الصلاحية

- **المدة**: 7 أيام
- **المسح التلقائي**: نعم
- **التحقق**: عند كل تحميل

```javascript
const info = getProgressInfo();
console.log('Days remaining:', info.daysRemaining);
// Output: 7, 6, 5, ... 1, 0
```

---

## 🎨 UI Component

```jsx
import ProgressRestoration from '../components/auth/ProgressRestoration';

<ProgressRestoration
  progressInfo={progressInfo}
  onRestore={handleRestore}
  onClear={handleStartOver}
  language={language}
/>
```

---

## ✅ Checklist

- [ ] استيراد الوظائف
- [ ] إضافة حفظ تلقائي في handleInputChange
- [ ] إضافة تحميل في useEffect
- [ ] إضافة زر استرجاع
- [ ] إضافة زر بدء من جديد
- [ ] مسح بعد التسجيل الناجح
- [ ] اختبار على المتصفح

---

## 🧪 الاختبار السريع

```javascript
// 1. افتح Console في المتصفح
// 2. نفذ:

// حفظ
saveProgress(1, { userType: 'individual', firstName: 'أحمد' });

// تحميل
const saved = loadProgress();
console.log(saved);

// معلومات
const info = getProgressInfo();
console.log(info);

// مسح
clearProgress();
```

---

## 📚 المزيد

للتوثيق الكامل، راجع:
- 📄 `docs/PROGRESS_SAVER_IMPLEMENTATION.md`
- 📄 `frontend/src/utils/progressSaver.js`
- 📄 `frontend/src/utils/progressSaver.test.js`

---

**تاريخ الإنشاء**: 2026-02-23  
**الحالة**: ✅ جاهز للاستخدام
