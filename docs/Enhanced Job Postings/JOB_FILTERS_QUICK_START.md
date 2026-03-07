# نظام الفلاتر - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. Backend Setup (دقيقة واحدة)

الكود جاهز! لا حاجة لتغييرات. فقط تأكد من:

```bash
# تشغيل Backend
cd backend
npm start
```

### 2. Frontend Setup (دقيقة واحدة)

الكود جاهز! لا حاجة لتغييرات. فقط تأكد من:

```bash
# تشغيل Frontend
cd frontend
npm start
```

### 3. الاختبار (3 دقائق)

**افتح المتصفح**: `http://localhost:3000/job-postings`

**جرب الفلاتر**:
1. ✅ البحث النصي: اكتب "developer"
2. ✅ المجال: اختر "Permanent Job"
3. ✅ الموقع: اختر مدينة
4. ✅ نوع العمل: اختر "Full-time"
5. ✅ مستوى الخبرة: اختر "Mid"
6. ✅ الراتب: أدخل نطاق (5000 - 10000)
7. ✅ مسح الفلاتر: اضغط "مسح الفلاتر"

## 📡 API Endpoints

### جلب الوظائف مع الفلاتر
```bash
GET /api/job-postings?jobType=Full-time&location=Riyadh&page=1&limit=10
```

### جلب خيارات الفلاتر
```bash
GET /api/job-postings/filter-options
```

## 🎨 استخدام المكون

```jsx
import JobFilters from '../components/JobFilters';

<JobFilters 
  onFilterChange={(filters) => {
    console.log('Filters changed:', filters);
    // جلب الوظائف مع الفلاتر الجديدة
  }}
  onClearFilters={() => {
    console.log('Filters cleared');
    // جلب جميع الوظائف
  }}
/>
```

## 🔧 الفلاتر المتاحة

| الفلتر | النوع | مثال |
|--------|------|------|
| search | String | "developer" |
| field | String | "Permanent Job" |
| location | String | "Riyadh" |
| jobType | String | "Full-time" |
| experienceLevel | String | "Mid" |
| minSalary | Number | 5000 |
| maxSalary | Number | 10000 |

## 🎯 أمثلة سريعة

### مثال 1: البحث عن وظائف Full-time في الرياض
```javascript
const filters = {
  jobType: 'Full-time',
  location: 'Riyadh'
};

fetch(`/api/job-postings?${new URLSearchParams(filters)}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

### مثال 2: البحث النصي مع فلتر الراتب
```javascript
const filters = {
  search: 'developer',
  minSalary: 5000,
  maxSalary: 10000
};

fetch(`/api/job-postings?${new URLSearchParams(filters)}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

### مثال 3: Pagination
```javascript
const filters = {
  page: 2,
  limit: 10
};

fetch(`/api/job-postings?${new URLSearchParams(filters)}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🐛 استكشاف الأخطاء

### المشكلة: لا توجد نتائج
**الحل**: تحقق من:
- ✅ هل هناك وظائف في قاعدة البيانات؟
- ✅ هل الفلاتر صحيحة؟
- ✅ هل Backend يعمل؟

### المشكلة: الفلاتر لا تعمل
**الحل**: تحقق من:
- ✅ Console للأخطاء
- ✅ Network tab في DevTools
- ✅ Backend logs

### المشكلة: Pagination لا يعمل
**الحل**: تحقق من:
- ✅ pagination.pages > 1
- ✅ handlePageChange function
- ✅ API response

## 📚 المزيد من التوثيق

- 📄 [التوثيق الشامل](./JOB_FILTERS_IMPLEMENTATION.md)
- 📄 [Requirements](../../.kiro/specs/enhanced-job-postings/requirements.md)
- 📄 [Design](../../.kiro/specs/enhanced-job-postings/design.md)

## ✅ Checklist

- [x] Backend API يعمل
- [x] Frontend مكون يعمل
- [x] الفلاتر تعمل
- [x] Pagination يعمل
- [x] مسح الفلاتر يعمل
- [x] دعم متعدد اللغات
- [x] Responsive design
- [x] Dark mode support

## 🎉 جاهز!

النظام جاهز للاستخدام. استمتع بالفلترة! 🚀

---

**تاريخ الإنشاء**: 2026-03-07  
**الحالة**: ✅ جاهز للاستخدام
