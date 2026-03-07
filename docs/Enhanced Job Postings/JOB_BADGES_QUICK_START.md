# Job Badges - دليل البدء السريع

## 🚀 البدء في 5 دقائق

### 1. Backend - استخدام الحقول المحسوبة

الحقول المحسوبة تُضاف تلقائياً في API responses:

```javascript
// GET /api/job-postings
// GET /api/job-postings/:id

// Response:
{
  "_id": "123",
  "title": "مطور Full Stack",
  "company": { "name": "شركة التقنية" },
  "createdAt": "2026-03-05T10:00:00Z",
  "expiryDate": "2026-03-12T23:59:59Z",
  
  // ✨ حقول محسوبة تلقائياً
  "isNew": true,           // < 3 أيام
  "isUrgent": true,        // تنتهي خلال 7 أيام
  "timeSincePosted": {
    "ar": "منذ يومين",
    "en": "2 days ago",
    "fr": "Il y a 2 jours"
  }
}
```

### 2. Frontend - استخدام المكونات

```jsx
import { JobBadges, TimeSincePosted } from '../components/JobBadges';

function JobCard({ job }) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      
      {/* عرض badges (جديد، عاجل) */}
      <JobBadges job={job} />
      
      {/* عرض تاريخ النشر */}
      <TimeSincePosted job={job} />
    </div>
  );
}
```

---

## 📦 التثبيت

### Backend
لا يحتاج تثبيت - الكود موجود بالفعل في:
- `backend/src/utils/jobHelpers.js`
- `backend/src/controllers/jobPostingController.js`

### Frontend
لا يحتاج تثبيت - المكونات موجودة في:
- `frontend/src/components/JobBadges/`

---

## 🎯 الاستخدام الأساسي

### JobBadges Component

```jsx
import { JobBadges } from '../components/JobBadges';

// استخدام بسيط
<JobBadges job={job} />

// مع className إضافي
<JobBadges job={job} className="mb-4" />
```

**Props**:
- `job` (required): كائن الوظيفة مع `isNew` و `isUrgent`
- `className` (optional): CSS classes إضافية

### TimeSincePosted Component

```jsx
import { TimeSincePosted } from '../components/JobBadges';

// مع أيقونة (افتراضي)
<TimeSincePosted job={job} />

// بدون أيقونة
<TimeSincePosted job={job} showIcon={false} />

// مع className إضافي
<TimeSincePosted job={job} className="text-sm" />
```

**Props**:
- `job` (required): كائن الوظيفة مع `timeSincePosted`
- `showIcon` (optional): عرض أيقونة الساعة (default: true)
- `className` (optional): CSS classes إضافية

---

## 🎨 التخصيص

### تخصيص الألوان

```css
/* في ملف CSS الخاص بك */

/* Badge "جديد" */
.job-badge-new {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

/* Badge "عاجل" */
.job-badge-urgent {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

/* تاريخ النشر */
.time-since-posted {
  color: #your-color;
}
```

### تخصيص الأيقونات

```jsx
// في JobBadges.jsx
{isNew && (
  <span className="job-badge job-badge-new">
    <span className="job-badge-icon">🆕</span> {/* غيّر الأيقونة */}
    <span className="job-badge-text">{t.new}</span>
  </span>
)}
```

---

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
cd backend
npm test -- jobBadges.test.js

# النتيجة المتوقعة: ✅ 23/23 اختبارات نجحت
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: Badges لا تظهر

**الحل**:
1. تأكد من أن API يعيد `isNew` و `isUrgent`
2. تأكد من استيراد المكون بشكل صحيح
3. تأكد من أن `job` object ليس null

```jsx
// ✅ صحيح
import { JobBadges } from '../components/JobBadges';

// ❌ خطأ
import JobBadges from '../components/JobBadges/JobBadges';
```

### المشكلة: تاريخ النشر لا يظهر

**الحل**:
1. تأكد من أن API يعيد `timeSincePosted`
2. تأكد من أن `job.timeSincePosted` object وليس string

```javascript
// ✅ صحيح
{
  "timeSincePosted": {
    "ar": "منذ يومين",
    "en": "2 days ago",
    "fr": "Il y a 2 jours"
  }
}

// ❌ خطأ
{
  "timeSincePosted": "منذ يومين"
}
```

### المشكلة: اللغة لا تتغير

**الحل**:
تأكد من استخدام `useApp()` hook:

```jsx
import { useApp } from '../../context/AppContext';

function MyComponent() {
  const { language } = useApp();
  // ...
}
```

---

## 📚 أمثلة إضافية

### مثال: قائمة وظائف
```jsx
function JobsList({ jobs }) {
  return (
    <div className="jobs-list">
      {jobs.map(job => (
        <div key={job._id} className="job-item">
          <div className="job-item-header">
            <h4>{job.title}</h4>
            <JobBadges job={job} />
          </div>
          
          <div className="job-item-meta">
            <span>{job.company.name}</span>
            <TimeSincePosted job={job} showIcon={false} />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### مثال: بطاقة وظيفة كاملة
```jsx
function JobCard({ job }) {
  return (
    <div className="job-card">
      {/* Header */}
      <div className="job-card-header">
        <img src={job.company.logo} alt={job.company.name} />
        <div>
          <h3>{job.title}</h3>
          <p>{job.company.name}</p>
        </div>
      </div>
      
      {/* Badges */}
      <JobBadges job={job} className="mb-3" />
      
      {/* Description */}
      <p className="job-description">{job.description}</p>
      
      {/* Footer */}
      <div className="job-card-footer">
        <TimeSincePosted job={job} />
        <span className="job-location">{job.location.city}</span>
        <span className="job-salary">{job.salary.min} - {job.salary.max} ريال</span>
      </div>
      
      {/* Actions */}
      <div className="job-card-actions">
        <button className="btn-primary">تقديم</button>
        <button className="btn-secondary">حفظ</button>
      </div>
    </div>
  );
}
```

---

## 🔗 روابط مفيدة

- 📄 [التوثيق الكامل](./JOB_BADGES_IMPLEMENTATION.md)
- 📄 [أمثلة كاملة](../../frontend/src/examples/JobBadgesExample.jsx)
- 📄 [الاختبارات](../../backend/tests/jobBadges.test.js)

---

**تاريخ الإنشاء**: 2026-03-07  
**الحالة**: ✅ جاهز للاستخدام
