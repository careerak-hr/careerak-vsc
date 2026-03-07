# احتمالية القبول - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. Backend - إضافة المسار (✅ تم بالفعل)
```javascript
// في backend/src/app.js
app.use('/acceptance-probability', require('./routes/acceptanceProbabilityRoutes'));
```

### 2. Frontend - استخدام المكون

#### أ. في صفحة تفاصيل الوظيفة (عرض كامل)
```jsx
import AcceptanceProbability from '../components/AcceptanceProbability/AcceptanceProbability';
import { useAcceptanceProbability } from '../hooks/useAcceptanceProbability';

function JobDetailPage({ jobId }) {
  const { probability, loading } = useAcceptanceProbability(jobId);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h1>تفاصيل الوظيفة</h1>
      
      {probability && (
        <AcceptanceProbability
          probability={probability.probability}
          level={probability.level}
          factors={probability.factors}
          matchScore={probability.matchScore}
          details={probability.details}
          compact={false}
        />
      )}
    </div>
  );
}
```

#### ب. في بطاقة الوظيفة (عرض مضغوط)
```jsx
function JobCard({ job }) {
  const { probability, loading } = useAcceptanceProbability(job._id);

  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.company.name}</p>
      
      {!loading && probability && (
        <AcceptanceProbability
          probability={probability.probability}
          level={probability.level}
          compact={true}
        />
      )}
    </div>
  );
}
```

### 3. اختبار API

```bash
# احصل على token أولاً
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# اختبر احتمالية القبول
curl http://localhost:5000/api/acceptance-probability/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. تشغيل الاختبارات

```bash
cd backend
npm test -- acceptanceProbability.test.js
```

## 📊 فهم النتائج

| الاحتمالية | المستوى | اللون | المعنى |
|-----------|---------|-------|--------|
| 70%+ | high | 🟢 | قدّم الآن! |
| 40-70% | medium | 🟡 | حسّن مهاراتك |
| < 40% | low | 🔴 | ابحث عن وظائف أخرى |

## 🎯 أمثلة سريعة

### مثال 1: Badge بسيط
```jsx
function SimpleBadge({ jobId }) {
  const { probability } = useAcceptanceProbability(jobId);
  
  if (!probability) return null;
  
  return (
    <span style={{ 
      color: probability.level === 'high' ? '#10b981' : 
             probability.level === 'medium' ? '#f59e0b' : '#ef4444'
    }}>
      {probability.probability}% احتمالية
    </span>
  );
}
```

### مثال 2: فلترة الوظائف
```jsx
function HighProbabilityJobs() {
  const { jobs } = useAllJobsProbabilities({ limit: 50 });
  
  const highProbJobs = jobs.filter(item => item.level === 'high');
  
  return (
    <div>
      <h2>وظائف ذات احتمالية عالية ({highProbJobs.length})</h2>
      {highProbJobs.map(item => (
        <JobCard key={item.jobId} job={item.job} />
      ))}
    </div>
  );
}
```

## 🔧 استكشاف الأخطاء

### "يجب تسجيل الدخول أولاً"
```javascript
// تأكد من وجود token
const token = localStorage.getItem('token');
if (!token) {
  // أعد توجيه المستخدم لصفحة تسجيل الدخول
}
```

### "فشل في جلب احتمالية القبول"
```javascript
// تحقق من:
// 1. الـ jobId صحيح
// 2. الـ token صالح
// 3. Backend يعمل
// 4. المستخدم لديه ملف شخصي كامل
```

### احتمالية منخفضة دائماً
```javascript
// تحقق من:
// 1. المستخدم أضاف مهاراته
// 2. المستخدم أضاف خبراته
// 3. المستخدم أضاف تعليمه
// 4. الملف الشخصي محدّث
```

## 📚 المزيد من الأمثلة

راجع:
- `frontend/src/examples/AcceptanceProbabilityExample.jsx` - 6 أمثلة كاملة
- `docs/ACCEPTANCE_PROBABILITY_IMPLEMENTATION.md` - توثيق شامل

## ✅ Checklist

- [ ] Backend route مضاف في app.js
- [ ] المكون مستورد في الصفحة
- [ ] Hook مستخدم بشكل صحيح
- [ ] المستخدم مسجل دخول
- [ ] الملف الشخصي كامل
- [ ] الاختبارات تعمل

---

**وقت الإعداد**: 5 دقائق  
**الصعوبة**: سهل  
**الحالة**: ✅ جاهز للاستخدام
