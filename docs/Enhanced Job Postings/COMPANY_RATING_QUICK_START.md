# دليل البدء السريع - تقييم الشركة

## ⚡ 5 دقائق للبدء

### 1. Backend - التحقق من التكامل

```bash
# اختبار جلب معلومات الشركة مع التقييمات
curl -X GET http://localhost:5000/api/companies/<company_id>/info
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "data": {
    "rating": {
      "average": 4.3,
      "count": 15,
      "breakdown": {
        "culture": 4.5,
        "salary": 4.0,
        "management": 4.2,
        "workLife": 4.4
      }
    }
  }
}
```

### 2. Frontend - استخدام CompanyCard

```jsx
import CompanyCard from './components/CompanyCard/CompanyCard';

function JobDetailPage({ job }) {
  return (
    <div>
      <h1>{job.title}</h1>
      
      {/* بطاقة الشركة مع التقييمات */}
      <CompanyCard 
        companyId={job.company._id} 
        jobId={job._id} 
      />
    </div>
  );
}
```

### 3. إضافة تقييم جديد

```javascript
// POST /api/reviews
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    reviewType: 'employee_to_company',
    revieweeId: companyId,
    jobApplicationId: applicationId,
    rating: 4,
    detailedRatings: {
      workEnvironment: 4.5,
      management: 4.0,
      benefits: 3.5,
      careerGrowth: 4.0
    },
    comment: 'شركة ممتازة للعمل'
  })
});

// التقييم سيُحدّث CompanyInfo تلقائياً!
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: التقييمات لا تظهر

**الحل**:
```bash
# 1. تحقق من وجود تقييمات
GET /api/reviews/user/<company_id>?reviewType=employee_to_company

# 2. حدّث التقييمات يدوياً
POST /api/companies/<company_id>/update-rating

# 3. تحقق من CompanyInfo
GET /api/companies/<company_id>/info
```

### المشكلة: التقييمات قديمة

**الحل**:
```javascript
// في companyInfoService.js
// تأكد من أن التحديث التلقائي يعمل:
if (hoursSinceUpdate > 24 || companyInfo.rating.count === 0) {
  await this.updateCompanyRating(companyId);
}
```

---

## 📊 مثال كامل

```jsx
// JobDetailPage.jsx
import React, { useState, useEffect } from 'react';
import CompanyCard from './components/CompanyCard/CompanyCard';

function JobDetailPage({ jobId }) {
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    const response = await fetch(`/api/jobs/${jobId}`);
    const data = await response.json();
    setJob(data.job);
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="job-detail-page">
      <div className="job-header">
        <h1>{job.title}</h1>
        <p>{job.description}</p>
      </div>

      {/* بطاقة الشركة مع التقييمات */}
      <CompanyCard 
        companyId={job.company._id} 
        jobId={job._id} 
      />

      <button onClick={() => applyToJob(job._id)}>
        تقديم على الوظيفة
      </button>
    </div>
  );
}
```

---

## ✅ قائمة التحقق

- [ ] Backend يجلب التقييمات من Review model
- [ ] CompanyCard يعرض النجوم والمتوسط
- [ ] التحديث التلقائي يعمل عند إضافة تقييم
- [ ] التحديث الدوري كل 24 ساعة يعمل
- [ ] دعم متعدد اللغات (ar, en, fr)
- [ ] التصميم متجاوب على جميع الأجهزة

---

## 📚 المزيد من التوثيق

- 📄 `COMPANY_RATING_INTEGRATION.md` - توثيق شامل
- 📄 `docs/REVIEW_SYSTEM.md` - نظام التقييمات الكامل
- 📄 `frontend/src/components/CompanyCard/CompanyCard.jsx` - كود المكون

---

**تم الإنشاء**: 2026-03-06
