# المؤشر البصري لتقدير الراتب - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. الاستيراد

```jsx
import SalaryIndicator from '../components/SalaryIndicator';
```

### 2. الاستخدام الأساسي

```jsx
function JobDetailPage() {
  const estimate = {
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

  return <SalaryIndicator estimate={estimate} currency="ريال" />;
}
```

### 3. مع API

```jsx
import React, { useState, useEffect } from 'react';
import SalaryIndicator from '../components/SalaryIndicator';

function JobDetailPage({ jobId }) {
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/salary-estimate`)
      .then(res => res.json())
      .then(data => setEstimate(data));
  }, [jobId]);

  return estimate && <SalaryIndicator estimate={estimate} />;
}
```

---

## 📊 الألوان

| المقارنة | اللون | الأيقونة |
|----------|-------|----------|
| `below` | 🔴 أحمر | أقل من المتوسط |
| `average` | 🟡 أصفر | متوسط السوق |
| `above` | 🟢 أخضر | أعلى من المتوسط |

---

## 🧪 الاختبار

```bash
npm test -- SalaryIndicator.test.jsx --run
```

**النتيجة**: ✅ 18/18 اختبارات نجحت

---

## 📚 المزيد

- [التوثيق الشامل](./SALARY_INDICATOR_VISUAL_IMPLEMENTATION.md)
- [Component README](../../frontend/src/components/SalaryIndicator/README.md)
- [أمثلة الاستخدام](../../frontend/src/examples/SalaryIndicatorExample.jsx)

---

**تاريخ الإنشاء**: 2026-03-06  
**الحالة**: ✅ مكتمل
