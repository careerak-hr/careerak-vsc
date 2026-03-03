# 🆕 New For You Component

## نظرة عامة
مكون قسم "جديد لك" لعرض التوصيات اليومية المخصصة للمستخدمين.

## المتطلبات
- **Requirements**: 7.2, 7.3 (تحديث يومي، قسم "جديد لك")
- **Task**: 12.2 تحديث يومي

## الميزات
- ✅ عرض التوصيات اليومية الجديدة
- ✅ نسبة التطابق لكل توصية (0-100%)
- ✅ شرح أسباب التوصية (Explainable AI)
- ✅ تحديد التوصيات كمشاهدة تلقائياً
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ حالات Loading, Error, Empty
- ✅ دعم RTL/LTR
- ✅ Accessibility compliant

## الاستخدام

### استيراد المكون
```jsx
import NewForYou from '../components/NewForYou';
```

### استخدام أساسي
```jsx
<NewForYou limit={5} />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `limit` | number | 5 | عدد التوصيات المعروضة |

## API Integration

### Endpoint
```
GET /api/recommendations/new?limit=5
```

### Response
```json
{
  "success": true,
  "count": 5,
  "recommendations": [
    {
      "_id": "...",
      "userId": "...",
      "itemType": "job",
      "itemId": {
        "title": "Senior Developer",
        "company": { "name": "Tech Corp" },
        "description": "..."
      },
      "score": 85,
      "reasons": [
        "تطابق 90% مع مهاراتك",
        "خبرة مناسبة للمستوى المطلوب"
      ],
      "createdAt": "2026-02-28T10:00:00Z"
    }
  ]
}
```

### Mark as Seen
```
PATCH /api/recommendations/:id/seen
```

## التصميم

### الألوان
- **Primary (كحلي)**: #304B60
- **Secondary (بيج)**: #E3DAD1
- **Accent (نحاسي)**: #D48161

### الخطوط
- **العربية**: Amiri
- **الإنجليزية**: Cormorant Garamond
- **الفرنسية**: EB Garamond

### Layout
- Grid responsive: `repeat(auto-fill, minmax(300px, 1fr))`
- Gap: 1.5rem
- Card padding: 1.5rem
- Border radius: 12px

## الحالات

### Loading State
```jsx
<div className="new-for-you-loading">
  <div className="spinner"></div>
  <p>جاري التحميل...</p>
</div>
```

### Error State
```jsx
<div className="new-for-you-error">
  <p>فشل في تحميل التوصيات</p>
  <button onClick={retry}>إعادة المحاولة</button>
</div>
```

### Empty State
```jsx
<div className="new-for-you-empty">
  <p>لا توجد توصيات جديدة حالياً</p>
</div>
```

## Accessibility

### ARIA Labels
- `aria-labelledby="new-for-you-title"`
- `aria-label` على جميع الأزرار
- Semantic HTML (`<section>`, `<article>`, `<h2>`, `<h3>`)

### Keyboard Navigation
- جميع العناصر التفاعلية قابلة للوصول بالـ Tab
- Focus indicators واضحة
- Enter/Space للتفاعل

### Screen Readers
- نصوص بديلة واضحة
- تسميات وصفية
- تسلسل منطقي للمحتوى

## Responsive Design

### Desktop (> 768px)
- Grid: 3-4 columns
- Card width: 300px+
- Full features

### Tablet (768px - 480px)
- Grid: 1-2 columns
- Adjusted spacing
- Optimized touch targets

### Mobile (< 480px)
- Grid: 1 column
- Stacked buttons
- Compact layout

## Performance

### Optimizations
- Lazy loading للتوصيات
- Debounced API calls
- Memoized components (if needed)
- Optimized re-renders

### Bundle Size
- Component: ~5KB (gzipped)
- CSS: ~3KB (gzipped)
- Total: ~8KB

## Testing

### Unit Tests
```bash
npm test -- NewForYou.test.jsx
```

### Integration Tests
```bash
npm test -- NewForYou.integration.test.jsx
```

### E2E Tests
```bash
npm run test:e2e -- new-for-you
```

## مثال كامل

```jsx
import React from 'react';
import NewForYou from '../components/NewForYou';

function HomePage() {
  return (
    <main>
      <h1>الصفحة الرئيسية</h1>
      
      {/* قسم "جديد لك" */}
      <NewForYou limit={5} />
      
      {/* باقي المحتوى */}
    </main>
  );
}

export default HomePage;
```

## التكامل مع الأنظمة الموجودة

### Daily Recommendation Service
- يستخدم `dailyRecommendationService` من Backend
- يتم تحديث التوصيات يومياً عبر Cron Job
- يدعم Content-Based و Collaborative Filtering

### User Interaction Tracking
- يتم تتبع المشاهدات تلقائياً
- يحترم تفضيلات الخصوصية
- يحسّن التوصيات المستقبلية

## الصيانة

### تحديث الترجمات
```jsx
const translations = {
  ar: { /* ... */ },
  en: { /* ... */ },
  fr: { /* ... */ }
};
```

### تخصيص التصميم
```css
/* في NewForYou.css */
.recommendation-card {
  /* تخصيص الألوان والأبعاد */
}
```

### إضافة ميزات جديدة
1. تحديث المكون
2. تحديث CSS
3. تحديث الترجمات
4. إضافة اختبارات
5. تحديث التوثيق

## الملفات
- `NewForYou.jsx` - المكون الرئيسي
- `NewForYou.css` - التنسيقات
- `index.js` - التصدير
- `README.md` - التوثيق

## الدعم
- دعم كامل للعربية والإنجليزية والفرنسية
- دعم RTL/LTR
- دعم Dark Mode (optional)
- دعم Reduced Motion

## الإصدار
- **Version**: 1.0.0
- **Date**: 2026-02-28
- **Status**: ✅ مكتمل

---

**تم الإنشاء**: 2026-02-28  
**آخر تحديث**: 2026-02-28  
**الحالة**: جاهز للاستخدام
