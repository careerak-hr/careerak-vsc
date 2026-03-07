# عداد المتقدمين - دليل البدء السريع

## 🚀 البدء في 5 دقائق

### 1. Backend Setup (دقيقة واحدة)

الحقول موجودة بالفعل في نموذج JobPosting:
```javascript
applicantCount: Number (default: 0)
showApplicantCount: Boolean (default: true)
```

### 2. Frontend - عرض العداد (دقيقة واحدة)

```jsx
import ApplicantCounter from '../components/JobPostings/ApplicantCounter';

// في بطاقة الوظيفة
<ApplicantCounter jobId={job._id} />

// عرض مضغوط
<ApplicantCounter jobId={job._id} inline={true} />
```

### 3. Frontend - التحكم في الإظهار (دقيقة واحدة)

```jsx
import ApplicantCountToggle from '../components/JobPostings/ApplicantCountToggle';

// في إعدادات الوظيفة (للشركات)
<ApplicantCountToggle
  jobId={job._id}
  initialValue={job.showApplicantCount}
  onToggle={(newValue) => console.log('Changed:', newValue)}
/>
```

---

## 📋 API Endpoints

### الحصول على العداد
```bash
GET /api/job-postings/:id/applicant-count
```

### تبديل الإظهار (مصرح فقط)
```bash
PATCH /api/job-postings/:id/applicant-count-visibility
Authorization: Bearer <token>
Content-Type: application/json

{
  "showApplicantCount": false
}
```

---

## 🎨 الألوان التلقائية

- **0 متقدمين**: رمادي
- **1-4 متقدمين**: أصفر
- **5-19 متقدم**: أزرق
- **20+ متقدم**: أخضر

---

## 🧪 الاختبار

```bash
cd backend
npm test -- applicantCounter.test.js
```

---

## 📚 التوثيق الكامل

راجع [APPLICANT_COUNTER_IMPLEMENTATION.md](./APPLICANT_COUNTER_IMPLEMENTATION.md) للتفاصيل الكاملة.

---

**تم! 🎉** العداد جاهز للاستخدام.
