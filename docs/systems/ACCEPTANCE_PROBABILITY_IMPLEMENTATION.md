# احتمالية القبول - التوثيق الشامل

## 📋 معلومات النظام
- **تاريخ الإضافة**: 2026-03-07
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 9.6 (احتمالية القبول)

## 🎯 نظرة عامة

نظام احتمالية القبول يحسب فرصة قبول المرشح للوظيفة بناءً على:
1. نسبة التطابق (من Content-Based Filtering)
2. عدد المتقدمين (المنافسة)
3. المهارات المطلوبة vs المتوفرة
4. الخبرة المطلوبة vs المتوفرة
5. التعليم المطلوب vs المتوفر

## 📊 المستويات

| المستوى | النطاق | اللون | الوصف |
|---------|--------|-------|-------|
| **عالي (High)** | 70%+ | 🟢 أخضر | فرصة ممتازة للقبول |
| **متوسط (Medium)** | 40-70% | 🟡 برتقالي | فرصة جيدة مع بعض التحسينات |
| **منخفض (Low)** | < 40% | 🔴 أحمر | فرصة محدودة، يحتاج تطوير |

## 🔧 البنية التقنية

### Backend

#### 1. Service Layer
```
backend/src/services/acceptanceProbabilityService.js
```

**الوظائف الرئيسية**:
- `calculateAcceptanceProbability(user, job)` - حساب احتمالية القبول لوظيفة واحدة
- `calculateBulkProbabilities(user, jobs)` - حساب لعدة وظائف
- `calculateCompetitionFactor(job)` - حساب عامل المنافسة
- `calculateExperienceFactor(user, job)` - حساب عامل الخبرة
- `calculateSkillsFactor(user, job)` - حساب عامل المهارات
- `calculateEducationFactor(user, job)` - حساب عامل التعليم
- `calculateFinalProbability(factors)` - حساب الاحتمالية النهائية
- `getProbabilityLevel(probability)` - تحديد المستوى
- `generateFactors(data)` - توليد العوامل المؤثرة

#### 2. Controller Layer
```
backend/src/controllers/acceptanceProbabilityController.js
```

**Endpoints**:
- `getJobAcceptanceProbability` - GET /:jobId
- `getBulkAcceptanceProbabilities` - POST /bulk
- `getAllJobsProbabilities` - GET /all

#### 3. Routes
```
backend/src/routes/acceptanceProbabilityRoutes.js
```

### Frontend

#### 1. Component
```
frontend/src/components/AcceptanceProbability/AcceptanceProbability.jsx
frontend/src/components/AcceptanceProbability/AcceptanceProbability.css
```

**Props**:
- `probability` (number) - النسبة المئوية (0-100)
- `level` (string) - المستوى (high, medium, low)
- `factors` (array) - العوامل المؤثرة
- `matchScore` (number) - نسبة التطابق
- `details` (object) - التفاصيل
- `compact` (boolean) - عرض مضغوط أو كامل

#### 2. Hooks
```
frontend/src/hooks/useAcceptanceProbability.js
```

**Hooks**:
- `useAcceptanceProbability(jobId)` - لوظيفة واحدة
- `useBulkAcceptanceProbabilities(jobIds)` - لعدة وظائف
- `useAllJobsProbabilities(options)` - لجميع الوظائف مع pagination

## 📡 API Endpoints

### 1. احتمالية القبول لوظيفة واحدة
```http
GET /api/acceptance-probability/:jobId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "jobId": "65f1234567890abcdef12345",
    "jobTitle": "Senior React Developer",
    "company": {
      "_id": "65f1234567890abcdef12346",
      "name": "Tech Company",
      "logo": "https://..."
    },
    "probability": 75,
    "level": "high",
    "factors": [
      "تطابق ممتاز مع متطلبات الوظيفة",
      "لديك معظم المهارات المطلوبة",
      "خبرتك مناسبة للوظيفة",
      "عدد المتقدمين قليل"
    ],
    "matchScore": 82,
    "details": {
      "competition": 90,
      "experience": 85,
      "skills": 88,
      "education": 100
    }
  }
}
```

### 2. احتمالية القبول لعدة وظائف
```http
POST /api/acceptance-probability/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobIds": ["65f1234567890abcdef12345", "65f1234567890abcdef12346"]
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "jobId": "65f1234567890abcdef12345",
      "probability": 75,
      "level": "high",
      "factors": [...],
      "matchScore": 82,
      "details": {...}
    },
    {
      "jobId": "65f1234567890abcdef12346",
      "probability": 55,
      "level": "medium",
      "factors": [...],
      "matchScore": 60,
      "details": {...}
    }
  ],
  "count": 2
}
```

### 3. جميع الوظائف مع pagination
```http
GET /api/acceptance-probability/all?page=1&limit=20
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "jobId": "65f1234567890abcdef12345",
      "probability": 75,
      "level": "high",
      "factors": [...],
      "matchScore": 82,
      "details": {...},
      "job": {
        "_id": "65f1234567890abcdef12345",
        "title": "Senior React Developer",
        "company": {...},
        "location": "Riyadh",
        "salary": 12000,
        "type": "full-time"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## 🧮 خوارزمية الحساب

### 1. الأوزان (Weights)
```javascript
{
  matchScore: 0.40,      // 40% - الأهم
  skillsFactor: 0.25,    // 25%
  experienceFactor: 0.20, // 20%
  competitionFactor: 0.10, // 10%
  educationFactor: 0.05   // 5%
}
```

### 2. عامل المنافسة
```javascript
applicantCount === 0  → 1.0  // لا منافسة
applicantCount < 10   → 0.9  // منافسة قليلة
applicantCount < 50   → 0.7  // منافسة متوسطة
applicantCount < 100  → 0.5  // منافسة عالية
applicantCount >= 100 → 0.3  // منافسة شديدة
```

### 3. عامل الخبرة
```javascript
userYears / requiredYears >= 1.5 → 1.0  // خبرة أكثر
userYears / requiredYears >= 1.0 → 0.9  // خبرة مطابقة
userYears / requiredYears >= 0.7 → 0.7  // خبرة قريبة
userYears / requiredYears >= 0.5 → 0.5  // خبرة أقل قليلاً
userYears / requiredYears < 0.5  → 0.3  // خبرة أقل بكثير
```

### 4. عامل المهارات
```javascript
// 80% للمهارات المطلوبة، 20% للمفضلة
skillsFactor = (requiredRatio * 0.8) + (preferredRatio * 0.2)
```

### 5. عامل التعليم
```javascript
userLevel >= requiredLevel     → 1.0  // يلبي المتطلب
userLevel === requiredLevel - 1 → 0.7  // أقل بدرجة واحدة
userLevel < requiredLevel - 1   → 0.4  // أقل بكثير
```

## 💻 أمثلة الاستخدام

### مثال 1: عرض في صفحة تفاصيل الوظيفة
```jsx
import AcceptanceProbability from '../components/AcceptanceProbability/AcceptanceProbability';
import { useAcceptanceProbability } from '../hooks/useAcceptanceProbability';

function JobDetailPage({ jobId }) {
  const { probability, loading, error } = useAcceptanceProbability(jobId);

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      <h1>تفاصيل الوظيفة</h1>
      
      <AcceptanceProbability
        probability={probability.probability}
        level={probability.level}
        factors={probability.factors}
        matchScore={probability.matchScore}
        details={probability.details}
        compact={false}
      />
    </div>
  );
}
```

### مثال 2: عرض مضغوط في بطاقة الوظيفة
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

### مثال 3: فلترة حسب احتمالية القبول
```jsx
function FilteredJobs() {
  const [filter, setFilter] = useState('all');
  const { jobs, loading } = useAllJobsProbabilities({ limit: 100 });

  const filteredJobs = jobs.filter(item => 
    filter === 'all' || item.level === filter
  );

  return (
    <div>
      <select value={filter} onChange={e => setFilter(e.target.value)}>
        <option value="all">الكل</option>
        <option value="high">احتمالية عالية</option>
        <option value="medium">احتمالية متوسطة</option>
        <option value="low">احتمالية منخفضة</option>
      </select>

      {filteredJobs.map(item => (
        <JobCard key={item.jobId} job={item.job} probability={item} />
      ))}
    </div>
  );
}
```

## 🧪 الاختبارات

```bash
cd backend
npm test -- acceptanceProbability.test.js
```

**الاختبارات المتاحة**:
- ✅ حساب احتمالية عالية للتطابق الممتاز
- ✅ حساب احتمالية متوسطة للتطابق الجزئي
- ✅ حساب احتمالية منخفضة للتطابق الضعيف
- ✅ حساب عامل المنافسة
- ✅ حساب عامل الخبرة
- ✅ حساب عامل المهارات
- ✅ تحديد المستوى
- ✅ توليد العوامل المؤثرة
- ✅ حساب لعدة وظائف

## 📈 الفوائد المتوقعة

- 🎯 **قرارات أفضل**: يساعد الباحثين على اختيار الوظائف المناسبة
- ⏱️ **توفير الوقت**: تقليل الوقت المهدر في التقديم على وظائف غير مناسبة
- 📊 **شفافية**: فهم واضح لأسباب التوصية
- 💡 **تحسين مستمر**: نصائح لتطوير المهارات
- 📈 **زيادة معدل التوظيف**: التركيز على الوظائف ذات الاحتمالية العالية

## 🔒 الأمان والخصوصية

- ✅ جميع endpoints محمية بـ authentication
- ✅ المستخدم يمكنه فقط رؤية احتماليته الخاصة
- ✅ لا يتم مشاركة البيانات مع أطراف ثالثة
- ✅ الحسابات تتم على الخادم (server-side)

## 📝 ملاحظات مهمة

1. **يتطلب ملف شخصي كامل**: المستخدم يجب أن يكون لديه مهارات، خبرة، وتعليم محدثة
2. **يعتمد على Content-Based Filtering**: يستخدم نفس خوارزمية التوصيات
3. **ديناميكي**: يتغير مع تحديث الملف الشخصي أو بيانات الوظيفة
4. **غير مضمون**: الاحتمالية تقديرية وليست ضماناً للقبول

## 🚀 التحسينات المستقبلية

- [ ] تعلم آلي لتحسين الدقة بناءً على النتائج الفعلية
- [ ] تحليل تاريخي لمعدلات القبول
- [ ] توصيات مخصصة لتحسين الاحتمالية
- [ ] إشعارات عند ظهور وظائف ذات احتمالية عالية
- [ ] تكامل مع نظام التقديم لتتبع النتائج

---

**تاريخ الإنشاء**: 2026-03-07  
**آخر تحديث**: 2026-03-07  
**الحالة**: ✅ مكتمل ومفعّل
