# ResultsList Component - دليل البدء السريع

## ⚡ البدء في 5 دقائق

### 1. الاستيراد (30 ثانية)

```jsx
import { ResultsList } from '../components/Search';
```

### 2. الاستخدام الأساسي (2 دقيقة)

```jsx
import React, { useState, useEffect } from 'react';
import { ResultsList } from '../components/Search';

function JobsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب النتائج من API
    fetch('/api/recommendations/jobs?limit=10', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setResults(data.data.recommendations);
        setLoading(false);
      });
  }, []);

  return (
    <ResultsList
      results={results}
      loading={loading}
      onJobClick={(job) => console.log(job)}
    />
  );
}
```

### 3. بنية البيانات (1 دقيقة)

```javascript
const results = [
  {
    job: {
      _id: '1',
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      location: 'Riyadh',
      salary: { min: 15000, max: 25000, currency: 'SAR' },
      description: 'Job description...'
    },
    matchScore: {
      percentage: 92,  // 0-100
      overall: 0.92    // 0-1
    },
    reasons: [
      {
        type: 'skills',
        message: 'لديك 8 من 10 مهارات مطلوبة',
        strength: 'high'  // 'high', 'medium', 'low'
      }
    ]
  }
];
```

### 4. التجربة (1.5 دقيقة)

```bash
# افتح المثال
http://localhost:3000/examples/results-list

# أو شغّل الاختبارات
npm test -- ResultsList.test.jsx
```

---

## 🎯 Props الأساسية

| Prop | Type | Default | مطلوب؟ |
|------|------|---------|--------|
| `results` | `Array` | `[]` | ✅ |
| `loading` | `Boolean` | `false` | ❌ |
| `onJobClick` | `Function` | - | ❌ |
| `showMatchScore` | `Boolean` | `true` | ❌ |
| `viewMode` | `String` | `'list'` | ❌ |

---

## 🎨 أمثلة سريعة

### مثال 1: قائمة بسيطة

```jsx
<ResultsList results={jobs} />
```

### مثال 2: شبكة بدون نسب مطابقة

```jsx
<ResultsList
  results={jobs}
  viewMode="grid"
  showMatchScore={false}
/>
```

### مثال 3: مع معالج النقر

```jsx
<ResultsList
  results={jobs}
  onJobClick={(job) => navigate(`/jobs/${job._id}`)}
/>
```

---

## 🔌 API Integration

```javascript
// Backend Endpoint
GET /api/recommendations/jobs?limit=10

// Response
{
  success: true,
  data: {
    recommendations: [
      {
        job: { /* job data */ },
        matchScore: { percentage: 92, overall: 0.92 },
        reasons: [ /* reasons */ ]
      }
    ]
  }
}
```

---

## 🎨 ألوان شارات المطابقة

| النسبة | اللون | الوصف |
|--------|-------|-------|
| 80%+ | 🟢 | ممتاز |
| 60-79% | 🔵 | جيد |
| 40-59% | 🟡 | مقبول |
| < 40% | ⚫ | ضعيف |

---

## 🌍 اللغات المدعومة

- ✅ العربية (ar)
- ✅ الإنجليزية (en)
- ✅ الفرنسية (fr)

---

## 📱 التصميم المتجاوب

- ✅ Desktop (> 1024px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)

---

## ♿ إمكانية الوصول

- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Focus indicators

---

## 🧪 الاختبار السريع

```bash
# تشغيل الاختبارات
npm test -- ResultsList.test.jsx

# فتح المثال
http://localhost:3000/examples/results-list

# فتح مثال التكامل الكامل
http://localhost:3000/examples/job-postings-with-match-score
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تظهر نسب المطابقة

**الحل**:
```jsx
// تأكد من وجود matchScore في البيانات
<ResultsList
  results={results}
  showMatchScore={true}  // تأكد أنها true
/>
```

### المشكلة: الأزرار لا تعمل

**الحل**:
```jsx
// أضف معالج النقر
<ResultsList
  results={results}
  onJobClick={(job) => {
    console.log('Clicked:', job);
    // أضف منطقك هنا
  }}
/>
```

### المشكلة: التنسيقات لا تظهر

**الحل**:
```jsx
// تأكد من استيراد CSS
import './ResultsList.css';
```

---

## 📚 المزيد من التوثيق

- 📄 [التوثيق الكامل](./RESULTS_LIST_COMPONENT.md)
- 📄 [README المكون](../frontend/src/components/Search/README.md)
- 📄 [مثال بسيط](../frontend/src/examples/ResultsListExample.jsx)
- 📄 [مثال تكامل](../frontend/src/examples/JobPostingsWithMatchScoreExample.jsx)

---

## 💡 نصائح سريعة

1. **استخدم showMatchScore={false}** إذا لم تكن لديك نسب مطابقة
2. **استخدم viewMode="grid"** للشاشات الكبيرة
3. **أضف onJobClick** للتوجيه إلى صفحة التفاصيل
4. **استخدم loading={true}** أثناء جلب البيانات
5. **تأكد من وجود _id** في كل job object

---

## 🚀 الخطوات التالية

1. ✅ جرب المثال الأساسي
2. ✅ اقرأ التوثيق الكامل
3. ✅ شغّل الاختبارات
4. ✅ دمج في مشروعك
5. ✅ خصص حسب احتياجاتك

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ جاهز للاستخدام
