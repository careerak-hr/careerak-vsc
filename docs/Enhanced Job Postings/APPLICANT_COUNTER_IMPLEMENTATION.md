# عداد المتقدمين - التوثيق الشامل

## 📋 معلومات الوثيقة
- **الميزة**: عداد المتقدمين (Applicant Counter)
- **المتطلبات**: Requirements 9.2
- **تاريخ الإنشاء**: 2026-03-07
- **الحالة**: ✅ مكتمل

---

## 🎯 نظرة عامة

ميزة عداد المتقدمين تسمح بعرض عدد المتقدمين لكل وظيفة، مع إعطاء الشركات خيار إظهار أو إخفاء هذا العدد عن الجمهور.

### الفوائد
- 📊 **للباحثين عن عمل**: معرفة مدى شعبية الوظيفة والمنافسة
- 🎯 **للشركات**: التحكم في إظهار العدد حسب استراتيجية التوظيف
- 📈 **للمنصة**: بيانات قيمة عن نشاط التقديم

---

## 🏗️ البنية التقنية

### Backend

#### 1. تحديثات نموذج JobPosting

```javascript
// backend/src/models/JobPosting.js

// حقول جديدة
applicantCount: {
  type: Number,
  default: 0,
  min: 0
},

showApplicantCount: {
  type: Boolean,
  default: true
}
```

#### 2. API Endpoints

**الحصول على عدد المتقدمين**:
```
GET /api/job-postings/:id/applicant-count
```

**Response (عند الإظهار)**:
```json
{
  "success": true,
  "data": {
    "applicantCount": 15,
    "visible": true
  }
}
```

**Response (عند الإخفاء)**:
```json
{
  "success": true,
  "data": {
    "applicantCount": null,
    "visible": false
  }
}
```

**تبديل إظهار العداد (للشركات فقط)**:
```
PATCH /api/job-postings/:id/applicant-count-visibility
Authorization: Bearer <token>
Content-Type: application/json

{
  "showApplicantCount": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "showApplicantCount": false
  },
  "message": "Applicant count visibility updated successfully"
}
```

#### 3. تحديث تلقائي للعداد

عند تقديم طلب توظيف، يتم تحديث العداد تلقائياً:

```javascript
// في jobApplicationController.js

await JobPosting.findByIdAndUpdate(jobPostingId, {
  $push: { applicants: jobApplication._id },
  $inc: { applicantCount: 1 }  // زيادة العداد
});
```

---

### Frontend

#### 1. مكون ApplicantCounter

**الاستخدام الأساسي**:
```jsx
import ApplicantCounter from '../components/JobPostings/ApplicantCounter';

<ApplicantCounter jobId="507f1f77bcf86cd799439011" />
```

**الاستخدام المضمّن (inline)**:
```jsx
<ApplicantCounter jobId="507f1f77bcf86cd799439011" inline={true} />
```

**Props**:
- `jobId` (string, required): معرف الوظيفة
- `inline` (boolean, optional): عرض مضغوط (افتراضي: false)

**الحالات المختلفة**:
- **Loading**: عرض skeleton loader
- **Error**: لا يعرض شيء
- **Hidden**: لا يعرض شيء (عندما showApplicantCount = false)
- **Visible**: عرض العداد مع الألوان المناسبة

**الألوان حسب العدد**:
- 0 متقدمين: رمادي (zero)
- 1-4 متقدمين: أصفر (low)
- 5-19 متقدم: أزرق (medium)
- 20+ متقدم: أخضر (high)

#### 2. مكون ApplicantCountToggle

**الاستخدام (للشركات)**:
```jsx
import ApplicantCountToggle from '../components/JobPostings/ApplicantCountToggle';

<ApplicantCountToggle
  jobId="507f1f77bcf86cd799439011"
  initialValue={true}
  onToggle={(newValue) => console.log('Changed to:', newValue)}
/>
```

**Props**:
- `jobId` (string, required): معرف الوظيفة
- `initialValue` (boolean, optional): القيمة الأولية (افتراضي: true)
- `onToggle` (function, optional): callback عند التغيير

---

## 📊 أمثلة الاستخدام

### مثال 1: في بطاقة الوظيفة

```jsx
function JobCard({ job }) {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.company.name}</p>
      
      <div className="job-meta">
        <ApplicantCounter jobId={job._id} />
        <span className="job-type">{job.jobType}</span>
        <span className="experience">{job.experienceLevel}</span>
      </div>
    </div>
  );
}
```

### مثال 2: في قائمة الوظائف

```jsx
function JobList({ jobs }) {
  return (
    <div className="job-list">
      {jobs.map(job => (
        <div key={job._id} className="job-item">
          <div className="job-info">
            <h4>{job.title}</h4>
            <p>{job.location}</p>
          </div>
          <ApplicantCounter jobId={job._id} inline={true} />
        </div>
      ))}
    </div>
  );
}
```

### مثال 3: في إعدادات الوظيفة (للشركات)

```jsx
function JobSettings({ job }) {
  const handleToggle = (newValue) => {
    console.log('Applicant count visibility:', newValue);
    // يمكن إضافة منطق إضافي هنا
  };

  return (
    <div className="job-settings">
      <h2>إعدادات الوظيفة</h2>
      
      <ApplicantCountToggle
        jobId={job._id}
        initialValue={job.showApplicantCount}
        onToggle={handleToggle}
      />
      
      {/* إعدادات أخرى */}
    </div>
  );
}
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
cd backend
npm test -- applicantCounter.test.js
```

### الاختبارات المتضمنة

1. ✅ الحصول على عدد المتقدمين عند الإظهار
2. ✅ إرجاع null عند الإخفاء
3. ✅ معالجة وظيفة غير موجودة (404)
4. ✅ تبديل الإظهار/الإخفاء (مصرح)
5. ✅ رفض الوصول غير المصرح (401)
6. ✅ رفض الوصول من غير المالك (403)
7. ✅ زيادة العداد عند التقديم
8. ✅ عرض العدد الصحيح في API
9. ✅ معالجة ID غير صالح
10. ✅ معالجة حقل مفقود

---

## 🎨 التصميم

### الألوان

**Light Mode**:
- Zero (0): `#f3f4f6` (رمادي فاتح)
- Low (1-4): `#fef3c7` (أصفر فاتح)
- Medium (5-19): `#dbeafe` (أزرق فاتح)
- High (20+): `#d1fae5` (أخضر فاتح)

**Dark Mode**:
- Zero (0): `#374151` (رمادي داكن)
- Low (1-4): `#78350f` (أصفر داكن)
- Medium (5-19): `#1e3a8a` (أزرق داكن)
- High (20+): `#064e3b` (أخضر داكن)

### التجاوب

- **Desktop**: حجم كامل
- **Tablet**: حجم متوسط
- **Mobile**: حجم مضغوط

### RTL Support

جميع المكونات تدعم RTL بالكامل.

---

## 🔒 الأمان

### التحقق من الصلاحيات

1. **الحصول على العداد**: متاح للجميع (public)
2. **تبديل الإظهار**: فقط صاحب الوظيفة أو Admin

### التحقق من الملكية

```javascript
if (jobPosting.postedBy.toString() !== req.user.id) {
  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'You are not authorized to modify this job posting'
    }
  });
}
```

---

## 📈 الأداء

### التخزين المؤقت

- العداد يُحسب في قاعدة البيانات (لا حاجة لحساب في كل طلب)
- يمكن إضافة Redis caching للوظائف الشائعة

### الفهرسة

```javascript
// في JobPosting model
jobPostingSchema.index({ applicantCount: 1 });
jobPostingSchema.index({ showApplicantCount: 1 });
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: العداد لا يظهر

**الحلول**:
1. تحقق من `showApplicantCount` في قاعدة البيانات
2. تحقق من console للأخطاء
3. تحقق من API response

### المشكلة: العداد لا يتحدث

**الحلول**:
1. تحقق من تحديث `applicantCount` في controller
2. تحقق من `$inc` في MongoDB update
3. راجع logs

### المشكلة: خطأ 403 عند التبديل

**الحلول**:
1. تحقق من token في localStorage
2. تحقق من أن المستخدم هو صاحب الوظيفة
3. تحقق من role المستخدم

---

## 📚 المراجع

- [Requirements Document](../../.kiro/specs/enhanced-job-postings/requirements.md)
- [Design Document](../../.kiro/specs/enhanced-job-postings/design.md)
- [Tasks Document](../../.kiro/specs/enhanced-job-postings/tasks.md)

---

## ✅ معايير القبول

- [x] عرض عدد المتقدمين في بطاقة الوظيفة
- [x] خيار إظهار/إخفاء للشركات
- [x] تحديث تلقائي للعداد عند التقديم
- [x] ألوان مختلفة حسب العدد
- [x] دعم RTL
- [x] دعم Dark Mode
- [x] تصميم متجاوب
- [x] اختبارات شاملة (10 tests)
- [x] توثيق كامل

---

**تاريخ الإنشاء**: 2026-03-07  
**آخر تحديث**: 2026-03-07  
**الحالة**: ✅ مكتمل
