# SalaryIndicator Component

مكون React لعرض تقدير الراتب مع نطاق السوق (الأدنى - الأعلى) ومؤشر بصري ملون.

## 📋 الميزات

- ✅ عرض الراتب المعروض
- ✅ عرض متوسط السوق
- ✅ عرض نطاق الراتب (الأدنى - الأعلى)
- ✅ مؤشر بصري ملون (أحمر، أصفر، أخضر)
- ✅ عرض نسبة الفرق عن المتوسط
- ✅ عرض عدد الوظائف المستخدمة في الحساب
- ✅ Tooltip توضيحي
- ✅ تنسيق الأرقام بفواصل عربية
- ✅ دعم عملات مختلفة
- ✅ تصميم متجاوب (Responsive)
- ✅ دعم Dark Mode
- ✅ دعم RTL
- ✅ Accessibility كامل

## 🚀 الاستخدام

### استيراد المكون

```jsx
import SalaryIndicator from '../components/SalaryIndicator';
```

### مثال بسيط

```jsx
function JobDetailPage({ job }) {
  const salaryEstimate = {
    provided: 6000,
    market: {
      average: 6000,
      min: 4500,
      max: 7500,
      count: 45
    },
    comparison: 'average',
    percentageDiff: 0
  };

  return (
    <div>
      <h1>{job.title}</h1>
      <SalaryIndicator estimate={salaryEstimate} currency="ريال" />
    </div>
  );
}
```

### مثال مع API

```jsx
import React, { useState, useEffect } from 'react';
import SalaryIndicator from '../components/SalaryIndicator';

function JobDetailPage({ jobId }) {
  const [salaryEstimate, setSalaryEstimate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب تقدير الراتب من API
    fetch(`/api/jobs/${jobId}/salary-estimate`)
      .then(res => res.json())
      .then(data => {
        setSalaryEstimate(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching salary estimate:', err);
        setLoading(false);
      });
  }, [jobId]);

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div>
      {salaryEstimate && (
        <SalaryIndicator estimate={salaryEstimate} currency="ريال" />
      )}
    </div>
  );
}
```

## 📊 Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `estimate` | `object` | ✅ Yes | - | بيانات تقدير الراتب |
| `currency` | `string` | ❌ No | `'ريال'` | العملة المستخدمة |

### هيكل `estimate` Object

```typescript
{
  provided: number,           // الراتب المعروض
  market: {
    average: number,          // متوسط السوق
    min: number,              // الحد الأدنى
    max: number,              // الحد الأعلى
    count?: number            // عدد الوظائف (اختياري)
  },
  comparison: 'below' | 'average' | 'above',  // المقارنة
  percentageDiff?: number     // نسبة الفرق (اختياري)
}
```

## 🎨 الألوان والمؤشرات

| المقارنة | اللون | الأيقونة | الخلفية |
|----------|-------|----------|----------|
| `below` | أحمر (#ef4444) | 🔴 | #fef2f2 |
| `average` | أصفر (#f59e0b) | 🟡 | #fffbeb |
| `above` | أخضر (#10b981) | 🟢 | #f0fdf4 |

## 📱 Responsive Design

المكون متجاوب تماماً مع جميع أحجام الشاشات:

- **Desktop**: عرض كامل مع جميع التفاصيل
- **Tablet**: تعديل الأحجام للتناسب
- **Mobile**: تصميم مضغوط مع الحفاظ على الوضوح

## 🌙 Dark Mode

المكون يدعم Dark Mode تلقائياً باستخدام `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  /* تطبيق ألوان داكنة */
}
```

## 🌍 RTL Support

المكون يدعم RTL (Right-to-Left) للغة العربية:

```css
[dir="rtl"] .salary-value {
  direction: rtl;
  text-align: right;
}
```

## ♿ Accessibility

- الأيقونات لها `aria-label` وصفي
- ألوان متباينة للوضوح
- دعم قارئات الشاشة
- تنسيق منطقي للمحتوى

## 🧪 الاختبارات

تشغيل الاختبارات:

```bash
npm test -- SalaryIndicator.test.jsx
```

الاختبارات تغطي:
- ✅ Rendering الأساسي
- ✅ عرض نطاق الراتب
- ✅ المقارنة والألوان
- ✅ عدد الوظائف
- ✅ Tooltip
- ✅ Accessibility
- ✅ Edge Cases

## 📝 أمثلة

### راتب أقل من المتوسط

```jsx
<SalaryIndicator 
  estimate={{
    provided: 4000,
    market: { average: 6000, min: 4500, max: 7500, count: 45 },
    comparison: 'below',
    percentageDiff: 33
  }}
/>
```

### راتب متوسط

```jsx
<SalaryIndicator 
  estimate={{
    provided: 6000,
    market: { average: 6000, min: 4500, max: 7500, count: 45 },
    comparison: 'average',
    percentageDiff: 0
  }}
/>
```

### راتب أعلى من المتوسط

```jsx
<SalaryIndicator 
  estimate={{
    provided: 7500,
    market: { average: 6000, min: 4500, max: 7500, count: 45 },
    comparison: 'above',
    percentageDiff: 25
  }}
/>
```

### بدون بيانات

```jsx
<SalaryIndicator estimate={null} />
// لا يعرض شيء
```

## 🔧 التخصيص

### تغيير العملة

```jsx
<SalaryIndicator estimate={estimate} currency="دولار" />
<SalaryIndicator estimate={estimate} currency="يورو" />
<SalaryIndicator estimate={estimate} currency="جنيه" />
```

### تخصيص الألوان

يمكنك تخصيص الألوان عن طريق تعديل ملف CSS:

```css
/* في SalaryIndicator.css */
.bg-red-50 {
  background-color: #your-color;
}
```

## 📚 المراجع

- [Requirements 5.2](../../.kiro/specs/enhanced-job-postings/requirements.md#user-story-5)
- [Design Document](../../.kiro/specs/enhanced-job-postings/design.md#8-salary-estimation)
- [Task 7.2](../../.kiro/specs/enhanced-job-postings/tasks.md#7-تنفيذ-تقدير-الراتب)

## 🐛 استكشاف الأخطاء

### المكون لا يظهر

تأكد من:
- `estimate` ليس `null`
- `estimate.market` موجود
- جميع الحقول المطلوبة موجودة

### الأرقام لا تظهر بشكل صحيح

تأكد من:
- الأرقام من نوع `number` وليس `string`
- القيم ليست `undefined` أو `null`

### الألوان لا تظهر

تأكد من:
- ملف CSS مستورد بشكل صحيح
- `comparison` له قيمة صحيحة: `'below'`, `'average'`, أو `'above'`

## 📄 الترخيص

هذا المكون جزء من مشروع Careerak.

---

**تاريخ الإنشاء**: 2026-03-06  
**آخر تحديث**: 2026-03-06  
**الحالة**: ✅ مكتمل ومفعّل
