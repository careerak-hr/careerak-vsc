# FilterService - دليل الاستخدام السريع

## نظرة عامة

خدمة الفلترة المتقدمة التي تدعم جميع أنواع الفلاتر للوظائف والدورات التدريبية.

## الميزات الرئيسية

- ✅ فلترة حسب الراتب (نطاق من-إلى)
- ✅ فلترة حسب الموقع (المدينة/الدولة)
- ✅ فلترة حسب نوع العمل (دوام كامل، جزئي، عن بعد، هجين)
- ✅ فلترة حسب مستوى الخبرة (مبتدئ، متوسط، خبير)
- ✅ فلترة حسب المهارات (مع منطق AND/OR)
- ✅ فلترة حسب تاريخ النشر (اليوم، آخر أسبوع، آخر شهر)
- ✅ فلترة حسب حجم الشركة (صغيرة، متوسطة، كبيرة)
- ✅ التحقق من صحة الفلاتر
- ✅ الحصول على الفلاتر المتاحة

## الاستخدام الأساسي

```javascript
const filterService = require('./services/filterService');

// تطبيق جميع الفلاتر
const baseQuery = { status: 'Open' };
const filters = {
  salaryMin: 5000,
  salaryMax: 10000,
  location: 'Cairo',
  workType: ['Full-time', 'Remote'],
  experienceLevel: ['Mid', 'Senior'],
  skills: ['JavaScript', 'React'],
  skillsLogic: 'AND',
  datePosted: 'week',
  companySize: ['Medium', 'Large']
};

const query = filterService.applyFilters(baseQuery, filters, 'jobs');
```

## الفلاتر المدعومة

### 1. فلترة حسب الراتب

```javascript
const query = filterService.filterBySalary({}, 5000, 10000);
// النتيجة: { 'salary.min': { $gte: 5000, $lte: 10000 } }
```

### 2. فلترة حسب الموقع

```javascript
const query = filterService.filterByLocation({}, 'Cairo');
// النتيجة: { $or: [{ 'location.city': /Cairo/i }, { 'location.country': /Cairo/i }] }
```

### 3. فلترة حسب نوع العمل

```javascript
const query = filterService.filterByWorkType({}, ['Full-time', 'Remote']);
// النتيجة: { jobType: { $in: ['Full-time', 'Remote'] } }
```

**القيم الصحيحة**: `Full-time`, `Part-time`, `Remote`, `Hybrid`, `Contract`, `Internship`

### 4. فلترة حسب مستوى الخبرة

```javascript
const query = filterService.filterByExperienceLevel({}, ['Mid', 'Senior']);
// النتيجة: { experienceLevel: { $in: ['Mid', 'Senior'] } }
```

**القيم الصحيحة**: `Entry`, `Mid`, `Senior`, `Lead`, `Executive`

### 5. فلترة حسب المهارات

```javascript
// منطق OR (أي مهارة)
const query = filterService.filterBySkills({}, ['JavaScript', 'React'], 'OR');
// النتيجة: { skills: { $in: ['JavaScript', 'React'] } }

// منطق AND (جميع المهارات)
const query = filterService.filterBySkills({}, ['JavaScript', 'React'], 'AND');
// النتيجة: { skills: { $all: ['JavaScript', 'React'] } }
```

### 6. فلترة حسب تاريخ النشر

```javascript
const query = filterService.filterByDate({}, 'week');
// النتيجة: { createdAt: { $gte: Date (7 أيام مضت) } }
```

**القيم الصحيحة**: `today`, `week`, `month`, `all`

### 7. فلترة حسب حجم الشركة

```javascript
const query = filterService.filterByCompanySize({}, ['Medium', 'Large']);
// النتيجة: { 'company.size': { $in: ['Medium', 'Large'] } }
```

**القيم الصحيحة**: `Small`, `Medium`, `Large`, `Enterprise`

## التحقق من صحة الفلاتر

```javascript
const filters = {
  salaryMin: 5000,
  salaryMax: 10000,
  skills: ['JavaScript', 'React'],
  skillsLogic: 'AND'
};

const validation = filterService.validateFilters(filters, 'jobs');

if (!validation.valid) {
  console.error('أخطاء في الفلاتر:', validation.errors);
}
```

## الحصول على الفلاتر المتاحة

```javascript
const availableFilters = await filterService.getAvailableFilters('jobs');

console.log(availableFilters);
// {
//   salary: { min: 0, max: 50000 },
//   workTypes: ['Full-time', 'Remote', 'Hybrid'],
//   experienceLevels: ['Entry', 'Mid', 'Senior'],
//   companySizes: ['Small', 'Medium', 'Large'],
//   locations: {
//     cities: ['Cairo', 'Alexandria', 'Giza'],
//     countries: ['Egypt', 'UAE', 'Saudi Arabia']
//   },
//   skills: ['JavaScript', 'React', 'Node.js', ...]
// }
```

## التكامل مع SearchService

```javascript
const searchService = require('./services/searchService');

// البحث مع الفلترة
const results = await searchService.textSearch('developer', {
  type: 'jobs',
  page: 1,
  limit: 20,
  sort: 'relevance',
  filters: {
    salaryMin: 5000,
    location: 'Cairo',
    skills: ['JavaScript', 'React'],
    skillsLogic: 'AND'
  }
});

console.log(results);
// {
//   results: [...],
//   total: 150,
//   page: 1,
//   pages: 8,
//   filters: {
//     applied: { ... },
//     available: { ... }
//   }
// }
```

## معالجة الأخطاء

```javascript
try {
  const query = filterService.filterBySalary({}, 10000, 5000);
} catch (error) {
  console.error(error.message);
  // "Minimum salary cannot be greater than maximum salary"
}
```

## الاختبارات

```bash
npm test -- filterService.test.js
```

**النتيجة**: ✅ 39/39 اختبارات نجحت

## ملاحظات مهمة

- جميع الفلاتر اختيارية
- يمكن تطبيق فلاتر متعددة في نفس الوقت
- الفلاتر الخاصة بالوظائف (salary, workType, experienceLevel, companySize) لا تُطبق على الدورات
- المهارات تدعم منطق AND و OR
- الموقع يبحث في المدينة والدولة معاً
- التحقق من صحة الفلاتر يتم تلقائياً في SearchService

## الملفات ذات الصلة

- `backend/src/services/filterService.js` - الخدمة الرئيسية
- `backend/src/services/searchService.js` - التكامل مع البحث
- `backend/tests/filterService.test.js` - الاختبارات (39 اختبار)

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ مكتمل ومفعّل
