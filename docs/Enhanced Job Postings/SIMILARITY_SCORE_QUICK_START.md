# نسبة التشابه - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. استخدام المكون (Frontend)

```jsx
import SimilarJobsSection from '../components/SimilarJobs/SimilarJobsSection';

function JobDetailPage() {
  const { jobId } = useParams();

  return (
    <div>
      {/* محتوى الوظيفة */}
      <h1>تفاصيل الوظيفة</h1>
      
      {/* الوظائف المشابهة مع نسبة التشابه */}
      <SimilarJobsSection jobId={jobId} />
    </div>
  );
}
```

### 2. API Endpoint

```bash
GET /api/job-postings/:id/similar?limit=6
```

**Response**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "...",
      "title": "Senior React Developer",
      "similarityScore": 85,
      "company": { "name": "Tech Co" },
      "location": { "city": "Riyadh" },
      "salary": { "min": 8000, "max": 12000 },
      "skills": ["JavaScript", "React"]
    }
  ]
}
```

### 3. كيف تُحسب النسبة؟

```
النسبة الإجمالية = 
  (نوع الوظيفة × 40%) +
  (المهارات × 30%) +
  (الموقع × 15%) +
  (الراتب × 15%)
```

### 4. الألوان

- 🟢 **75%+**: أخضر - تشابه عالي
- 🟡 **60-74%**: أصفر - تشابه متوسط
- 🔴 **< 60%**: أحمر - تشابه منخفض

### 5. الاختبار

```bash
cd backend
npm test -- similarJobs.test.js
```

**النتيجة المتوقعة**: ✅ 18/18 tests passed

---

## 📝 مثال كامل

```jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import SimilarJobsSection from '../components/SimilarJobs/SimilarJobsSection';

function JobDetailPage() {
  const { jobId } = useParams();

  return (
    <div className="container mx-auto p-4">
      {/* Job Header */}
      <div className="job-header mb-6">
        <h1 className="text-3xl font-bold">Software Engineer</h1>
        <p className="text-gray-600">Tech Company - Riyadh</p>
      </div>

      {/* Job Description */}
      <div className="job-description mb-8">
        <h2 className="text-2xl font-semibold mb-4">الوصف الوظيفي</h2>
        <p>نبحث عن مطور برمجيات متمرس...</p>
      </div>

      {/* Similar Jobs with Similarity Score */}
      <SimilarJobsSection 
        jobId={jobId} 
        limit={6}  // عدد الوظائف (اختياري، افتراضي: 6)
      />
    </div>
  );
}

export default JobDetailPage;
```

---

## 🎨 التخصيص

### تغيير عدد الوظائف
```jsx
<SimilarJobsSection jobId={jobId} limit={4} />
```

### تغيير الألوان
```css
/* في SimilarJobsSection.css */
.similarity-badge {
  /* تخصيص الألوان */
}
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: لا تظهر نسبة التشابه
**الحل**: تأكد من أن API يُرجع `similarityScore` في الـ response

### المشكلة: الألوان غير صحيحة
**الحل**: تحقق من دالة `getSimilarityColor()` في المكون

### المشكلة: الوظائف المشابهة فارغة
**الحل**: تأكد من وجود وظائف مشابهة (score >= 40%)

---

## 📚 المزيد من المعلومات

- 📄 [التوثيق الشامل](./SIMILARITY_SCORE_FEATURE.md)
- 📄 [أمثلة الاستخدام](../../frontend/src/examples/SimilarJobsExample.jsx)
- 📄 [الاختبارات](../../backend/tests/similarJobs.test.js)

---

**تاريخ الإنشاء**: 2026-03-06  
**الحالة**: ✅ جاهز للاستخدام
