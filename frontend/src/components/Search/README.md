# ResultsList Component

مكون عرض نتائج البحث مع نسب المطابقة للوظائف.

## الميزات

- ✅ عرض نسبة المطابقة لكل وظيفة (0-100%)
- ✅ شارات ملونة حسب نسبة المطابقة (ممتاز، جيد، مقبول، ضعيف)
- ✅ عرض أسباب التوصية (لماذا هذه الوظيفة مناسبة؟)
- ✅ وضعين للعرض: قائمة (list) أو شبكة (grid)
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم الوضع الداكن (Dark Mode)
- ✅ دعم RTL/LTR
- ✅ رسوم متحركة سلسة (Framer Motion)
- ✅ إمكانية الوصول (Accessibility)

## الاستخدام

### استيراد المكون

```jsx
import { ResultsList } from '../components/Search';
```

### مثال بسيط

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
        setResults(data.recommendations);
        setLoading(false);
      });
  }, []);

  const handleJobClick = (job) => {
    // التوجيه إلى صفحة تفاصيل الوظيفة
    navigate(`/jobs/${job._id}`);
  };

  return (
    <ResultsList
      results={results}
      loading={loading}
      onJobClick={handleJobClick}
      showMatchScore={true}
      viewMode="list"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `results` | `Array` | `[]` | قائمة النتائج مع نسب المطابقة |
| `loading` | `Boolean` | `false` | حالة التحميل |
| `onJobClick` | `Function` | - | دالة تُستدعى عند النقر على وظيفة |
| `showMatchScore` | `Boolean` | `true` | عرض/إخفاء نسبة المطابقة |
| `viewMode` | `String` | `'list'` | وضع العرض: `'list'` أو `'grid'` |

## بنية البيانات

### Result Object

```javascript
{
  job: {
    _id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'Riyadh, Saudi Arabia',
    salary: {
      min: 15000,
      max: 25000,
      currency: 'SAR'
    },
    description: 'Job description...',
    postedBy: {
      companyName: 'Tech Corp'
    }
  },
  matchScore: {
    percentage: 92,      // نسبة المطابقة (0-100)
    overall: 0.92,       // النسبة الإجمالية (0-1)
    scores: {            // نسب فرعية (اختياري)
      skills: 0.9,
      experience: 0.95,
      education: 0.85,
      location: 1.0,
      salary: 0.9,
      jobType: 1.0
    }
  },
  reasons: [             // أسباب التوصية (اختياري)
    {
      type: 'skills',
      message: 'لديك 8 من 10 مهارات مطلوبة',
      strength: 'high'   // 'high', 'medium', 'low'
    },
    {
      type: 'experience',
      message: 'خبرتك تطابق المتطلبات',
      strength: 'high'
    }
  ]
}
```

## ألوان شارات المطابقة

| النسبة | اللون | الوصف |
|--------|-------|-------|
| 80%+ | 🟢 أخضر | ممتاز - مطابقة عالية جداً |
| 60-79% | 🔵 أزرق | جيد - مطابقة جيدة |
| 40-59% | 🟡 برتقالي | مقبول - مطابقة متوسطة |
| < 40% | ⚫ رمادي | ضعيف - مطابقة منخفضة |

## التكامل مع Backend

### API Endpoint

```javascript
// GET /api/recommendations/jobs
// Headers: Authorization: Bearer <token>
// Query: ?limit=10&minScore=0.5

// Response:
{
  success: true,
  data: {
    recommendations: [
      {
        job: { /* job object */ },
        matchScore: { /* match score */ },
        reasons: [ /* reasons array */ ]
      }
    ],
    total: 50,
    page: 1,
    pages: 5
  }
}
```

### مثال على استدعاء API

```javascript
const fetchRecommendations = async (userId, options = {}) => {
  const { limit = 10, minScore = 0 } = options;
  
  const response = await fetch(
    `/api/recommendations/jobs?limit=${limit}&minScore=${minScore}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data.data.recommendations;
};
```

## أمثلة

### مثال 1: عرض قائمة بسيطة

```jsx
<ResultsList
  results={jobs}
  onJobClick={(job) => console.log(job)}
/>
```

### مثال 2: عرض شبكة بدون نسب مطابقة

```jsx
<ResultsList
  results={jobs}
  viewMode="grid"
  showMatchScore={false}
  onJobClick={handleJobClick}
/>
```

### مثال 3: مع حالة التحميل

```jsx
{loading ? (
  <JobCardSkeleton count={5} />
) : (
  <ResultsList
    results={results}
    loading={loading}
    onJobClick={handleJobClick}
  />
)}
```

## التخصيص

### تخصيص الألوان

يمكنك تخصيص ألوان شارات المطابقة في ملف CSS:

```css
.match-badge-excellent {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.match-badge-good {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.match-badge-fair {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.match-badge-low {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}
```

### تخصيص الترجمات

الترجمات مدمجة في المكون، ولكن يمكنك تمريرها كـ props إذا أردت:

```jsx
const customTranslations = {
  ar: {
    match: 'تطابق',
    company: 'المؤسسة',
    // ...
  }
};

// ثم استخدامها في المكون
```

## الاختبار

### اختبار يدوي

1. افتح `http://localhost:3000/examples/results-list`
2. جرب التبديل بين وضعي العرض (قائمة/شبكة)
3. جرب تغيير اللغة
4. جرب الوضع الداكن
5. جرب على أجهزة مختلفة

### اختبار تلقائي

```bash
npm test -- ResultsList.test.jsx
```

## الأداء

- ✅ Lazy loading للصور
- ✅ Memoization للمكونات الفرعية
- ✅ Virtual scrolling للقوائم الطويلة (قريباً)
- ✅ Code splitting

## إمكانية الوصول

- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ Semantic HTML

## المتصفحات المدعومة

- ✅ Chrome (آخر إصدارين)
- ✅ Firefox (آخر إصدارين)
- ✅ Safari (آخر إصدارين)
- ✅ Edge (آخر إصدارين)
- ✅ Mobile browsers

## الملفات ذات الصلة

- `ResultsList.jsx` - المكون الرئيسي
- `ResultsList.css` - التنسيقات
- `ResultsListExample.jsx` - مثال استخدام
- `JobPostingsWithMatchScoreExample.jsx` - مثال تكامل كامل

## المراجع

- [AI Recommendations System](../../docs/AI%20Recommendations/)
- [Content-Based Filtering](../../../backend/src/services/contentBasedFiltering.js)
- [Design Document](.kiro/specs/advanced-search-filter/design.md)
- [Requirements Document](.kiro/specs/advanced-search-filter/requirements.md)

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح issue في GitHub.

---

**تاريخ الإنشاء**: 2026-03-03  
**آخر تحديث**: 2026-03-03  
**الحالة**: ✅ مكتمل ومفعّل
