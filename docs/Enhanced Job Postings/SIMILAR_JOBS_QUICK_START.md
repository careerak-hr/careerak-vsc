# دليل البدء السريع: الوظائف المشابهة

## 📋 نظرة عامة
نظام ذكي لعرض 4-6 وظائف مشابهة بناءً على المجال، المهارات، الموقع، والراتب.

---

## 🚀 الاستخدام السريع

### Backend API

**الحصول على الوظائف المشابهة**:
```bash
GET /api/job-postings/:id/similar?limit=6
```

**مثال**:
```bash
curl http://localhost:5000/api/job-postings/507f1f77bcf86cd799439011/similar?limit=6
```

**الاستجابة**:
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Full Stack Developer",
      "company": { "name": "Tech Corp" },
      "location": { "city": "Riyadh", "country": "Saudi Arabia" },
      "salary": { "min": 8000, "max": 12000 },
      "skills": ["JavaScript", "React", "Node.js"],
      "similarityScore": 85
    }
  ]
}
```

---

### Frontend Component

**الاستخدام الأساسي**:
```jsx
import SimilarJobsSection from '../components/SimilarJobs/SimilarJobsSection';

function JobDetailPage() {
  const { jobId } = useParams();
  
  return (
    <div>
      {/* محتوى الوظيفة */}
      
      {/* الوظائف المشابهة */}
      <SimilarJobsSection jobId={jobId} />
    </div>
  );
}
```

**مع limit مخصص**:
```jsx
<SimilarJobsSection jobId={jobId} limit={4} />
```

---

## 🔧 كيف يعمل

### خوارزمية التشابه

```javascript
// الأوزان
المجال (postingType): 40%
المهارات (skills): 30%
الموقع (location): 15%
الراتب (salary): 15%

// مثال
Job A: Full Stack Developer, JavaScript/React, Riyadh, 8000-12000
Job B: Full Stack Developer, JavaScript/Vue, Riyadh, 8500-12500

التشابه = 40 (نفس المجال) + 15 (مهارة مشتركة) + 15 (نفس المدينة) + 14 (راتب قريب)
       = 84%
```

### التخزين المؤقت (Redis)

```javascript
// يُحفظ لمدة ساعة
Cache Key: similar_jobs:{jobId}
TTL: 3600 seconds (1 hour)

// مثال
similar_jobs:507f1f77bcf86cd799439011 → [job1, job2, job3, ...]
```

---

## 🎨 التخصيص

### ألوان نسبة التشابه

```javascript
// في SimilarJobsSection.jsx
const getSimilarityColor = (score) => {
  if (score >= 75) return '#10b981'; // أخضر
  if (score >= 60) return '#f59e0b'; // أصفر
  return '#ef4444'; // أحمر
};
```

### الترجمات

```javascript
const translations = {
  ar: {
    title: 'وظائف مشابهة',
    similarity: 'نسبة التشابه',
    viewJob: 'عرض الوظيفة'
  },
  en: {
    title: 'Similar Jobs',
    similarity: 'Similarity',
    viewJob: 'View Job'
  }
};
```

---

## 🧪 الاختبار

### Backend
```bash
cd backend
npm test -- similarJobs.test.js
```

### Frontend
```bash
cd frontend
npm test -- SimilarJobsSection.test.jsx --run
```

---

## 🔍 استكشاف الأخطاء

### "No similar jobs found"
- تحقق من أن الوظيفة موجودة
- تحقق من وجود وظائف أخرى نشطة (status: 'Open')
- تحقق من أن نسبة التشابه >= 40%

### "Error loading similar jobs"
- تحقق من اتصال Backend
- تحقق من Redis
- راجع سجلات الخادم

### Cache لا يعمل
- تحقق من اتصال Redis
- تحقق من `redis.get()` و `redis.setex()`
- راجع سجلات Redis

---

## 📊 مؤشرات الأداء

| المقياس | القيمة |
|---------|--------|
| وقت الاستجابة (مع cache) | ~50ms |
| وقت الاستجابة (بدون cache) | ~500ms |
| عدد الوظائف | 4-6 |
| نسبة التشابه الدنيا | 40% |
| مدة الـ cache | 1 ساعة |

---

## 🔗 روابط مفيدة

- 📄 [التقرير الشامل](./SIMILAR_JOBS_VERIFICATION_REPORT.md)
- 📄 [أمثلة الاستخدام](../../frontend/src/examples/SimilarJobsExample.jsx)
- 📄 [الاختبارات](../../backend/tests/similarJobs.test.js)

---

**تاريخ الإنشاء**: 2026-03-07  
**آخر تحديث**: 2026-03-07
