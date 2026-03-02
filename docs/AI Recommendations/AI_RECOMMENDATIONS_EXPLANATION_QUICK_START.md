# دليل البدء السريع: نظام شرح التوصيات

## 🚀 البدء السريع (5 دقائق)

### 1. استخدام النظام في Backend

```javascript
const ContentBasedFiltering = require('./services/contentBasedFiltering');
const cbf = new ContentBasedFiltering();

// توليد توصيات مع شروحات
const recommendations = await cbf.rankJobsByMatch(user, jobs);

// كل توصية تحتوي على:
recommendations.forEach(rec => {
  console.log(`الوظيفة: ${rec.job.title}`);
  console.log(`نسبة التطابق: ${rec.matchScore.percentage}%`);
  console.log(`الأسباب:`);
  rec.reasons.forEach(reason => {
    console.log(`  - ${reason.message} (${reason.strength})`);
  });
});
```

### 2. عرض الشروحات في Frontend

```jsx
import RecommendationsDashboard from './components/RecommendationsDashboard';

function App() {
  return <RecommendationsDashboard />;
}
```

### 3. تشغيل الاختبارات

```bash
cd backend
npm test -- recommendation-explanation-completeness.property.test.js
```

---

## 📋 هيكل السبب (Reason Structure)

```javascript
{
  type: 'skills',              // نوع السبب
  message: 'رسالة واضحة',      // الرسالة المعروضة
  strength: 'high',            // القوة: high, medium, low
  details: {                   // تفاصيل إضافية
    category: 'البرمجة',
    matchedCount: 3,
    totalRequired: 5,
    matchPercentage: 60,
    topSkills: ['JavaScript', 'React']
  }
}
```

---

## 🎯 أنواع الأسباب

| النوع | الوصف | مثال |
|------|-------|------|
| `skills` | تطابق المهارات | "مهارات البرمجة (JavaScript، React) تتطابق" |
| `experience` | تطابق الخبرة | "خبرتك (3 سنوات) مناسبة للمستوى المطلوب" |
| `education` | تطابق التعليم | "درجة البكالوريوس تتطابق مع المتطلبات" |
| `location` | تطابق الموقع | "الموقع (القاهرة) قريب منك" |
| `salary` | مناسبة الراتب | "الراتب المقدم مناسب لمستوى الوظيفة" |
| `jobType` | نوع العمل | "نوع العمل (دوام كامل) يتناسب مع تفضيلاتك" |
| `general` | سبب عام | "هذه الوظيفة قد تكون مناسبة لملفك الشخصي" |

---

## 💪 مستويات القوة

| المستوى | النطاق | الوصف |
|---------|--------|-------|
| `high` | > 80% | تطابق قوي جداً |
| `medium` | 50-80% | تطابق متوسط |
| `low` | < 50% | تطابق ضعيف |

---

## 🔧 إضافة نوع جديد من الأسباب

### الخطوة 1: أضف في `generateMatchReasons()`

```javascript
// في backend/src/services/contentBasedFiltering.js
generateMatchReasons(userFeatures, jobFeatures, scores) {
  const reasons = [];
  
  // ... الأسباب الموجودة
  
  // إضافة نوع جديد
  if (scores.newType > 0.5) {
    reasons.push({
      type: 'newType',
      message: 'رسالة مخصصة',
      strength: 'medium',
      details: { /* تفاصيل */ }
    });
  }
  
  return reasons;
}
```

### الخطوة 2: أضف اختبار

```javascript
// في backend/tests/properties/recommendation-explanation-completeness.property.test.js
test('new type reasons should be generated', async () => {
  // اختبار النوع الجديد
});
```

### الخطوة 3: حدّث Frontend (اختياري)

```jsx
// في frontend/src/components/RecommendationsDashboard.jsx
// لا حاجة لتغيير - يعرض تلقائياً
```

---

## 🎨 تخصيص العرض

### تغيير الألوان

```css
/* في frontend/src/components/RecommendationsDashboard.css */
.recommendation-reasons {
  background: #f8f8f8;           /* لون الخلفية */
  border-left: 4px solid #304B60; /* لون الحد */
}

.reasons-title {
  color: #304B60;                /* لون العنوان */
}
```

### تغيير عدد الأسباب المعروضة

```jsx
// في frontend/src/components/RecommendationsDashboard.jsx
{reasons.slice(0, 3).map(...)}  // غيّر 3 إلى العدد المطلوب
```

---

## 🧪 الاختبار

### اختبار Backend

```bash
cd backend
npm test -- recommendation-explanation-completeness.property.test.js
```

### اختبار Frontend

```bash
cd frontend
npm test -- RecommendationsDashboard.test.jsx
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا توجد أسباب

**الحل**:
```javascript
// تحقق من أن الدرجات ليست صفر
console.log('Scores:', scores);

// تحقق من أن generateMatchReasons() يُستدعى
console.log('Reasons:', reasons);
```

### المشكلة: الأسباب لا تظهر في Frontend

**الحل**:
```jsx
// تحقق من أن reasons موجود في البيانات
console.log('Recommendation:', recommendation);
console.log('Reasons:', recommendation.reasons);
```

### المشكلة: الأسباب بالإنجليزية بدلاً من العربية

**الحل**:
```javascript
// تحقق من اللغة الحالية
const { language } = useApp();
console.log('Current language:', language);
```

---

## 📚 موارد إضافية

- 📄 [التقرير الشامل](./AI_RECOMMENDATIONS_EXPLANATION_REPORT.md)
- 📄 [الكود المصدري](../backend/src/services/contentBasedFiltering.js)
- 📄 [الاختبارات](../backend/tests/properties/recommendation-explanation-completeness.property.test.js)
- 📄 [مكون Frontend](../frontend/src/components/RecommendationsDashboard.jsx)

---

## ✅ قائمة التحقق

قبل النشر، تأكد من:

- [ ] جميع الاختبارات نجحت (6/6 ✅)
- [ ] الشروحات واضحة ومفهومة
- [ ] دعم اللغات الثلاث (ar, en, fr)
- [ ] التصميم متجاوب (Desktop, Tablet, Mobile)
- [ ] الألوان متناسقة مع المشروع
- [ ] لا توجد أخطاء في Console

---

**تاريخ الإنشاء**: 2026-02-28  
**آخر تحديث**: 2026-02-28
