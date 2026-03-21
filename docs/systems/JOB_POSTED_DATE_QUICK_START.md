# دليل البدء السريع - عرض تاريخ النشر

## ⚡ البدء في 5 دقائق

### 1. الاستخدام الأساسي

```jsx
import JobBadges from './components/JobBadges/JobBadges';

function JobCard({ job }) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <JobBadges job={job} lang="ar" />
    </div>
  );
}
```

### 2. الدوال المساعدة

```javascript
import { getRelativeTime, isNewJob, isUrgentJob } from './utils/dateUtils';

// عرض تاريخ نسبي
const relativeTime = getRelativeTime(job.createdAt, 'ar');
// "منذ 3 أيام"

// التحقق من وظيفة جديدة
const isNew = isNewJob(job.createdAt);
// true or false

// التحقق من وظيفة عاجلة
const isUrgent = isUrgentJob(job.expiryDate);
// true or false
```

### 3. التخصيص

```jsx
// بدون badges
<JobBadges job={job} lang="ar" showBadges={false} />

// بدون تاريخ النشر
<JobBadges job={job} lang="ar" showPostedDate={false} />
```

---

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `job` | Object | required | كائن الوظيفة (يجب أن يحتوي على `createdAt`) |
| `lang` | String | 'ar' | اللغة (ar, en, fr) |
| `showPostedDate` | Boolean | true | عرض تاريخ النشر |
| `showBadges` | Boolean | true | عرض badges (جديد، عاجل) |

---

## 🎯 أمثلة سريعة

### مثال 1: Job Card
```jsx
<div className="job-card">
  <h3>{job.title}</h3>
  <p>{job.description}</p>
  <JobBadges job={job} lang="ar" />
  <button>تقديم</button>
</div>
```

### مثال 2: Job List
```jsx
{jobs.map(job => (
  <div key={job.id} className="job-item">
    <h4>{job.title}</h4>
    <JobBadges job={job} lang="ar" />
  </div>
))}
```

### مثال 3: Job Details
```jsx
<div className="job-details">
  <h1>{job.title}</h1>
  <JobBadges job={job} lang="ar" showBadges={true} />
  <p>{job.description}</p>
</div>
```

---

## ✅ الاختبار

```bash
cd frontend
npm test -- dateUtils.test.js
```

---

## 📚 المزيد

للتوثيق الكامل، راجع: `docs/JOB_POSTED_DATE_IMPLEMENTATION.md`
