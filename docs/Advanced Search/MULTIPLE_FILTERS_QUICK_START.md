# تطبيق الفلاتر المتعددة - دليل البدء السريع

## ⚡ البدء السريع (5 دقائق)

### 1. الاستخدام الأساسي

```javascript
const filterService = require('./services/filterService');

// تطبيق فلاتر متعددة
const baseQuery = { status: 'Open' };
const filters = {
  salaryMin: 5000,
  salaryMax: 10000,
  location: 'Cairo',
  workType: ['Full-time', 'Remote'],
  skills: ['JavaScript', 'React'],
  skillsLogic: 'AND'
};

const query = filterService.applyFilters(baseQuery, filters, 'jobs');
```

### 2. البحث مع الفلاتر

```javascript
const searchService = require('./services/searchService');

const results = await searchService.textSearch('developer', {
  type: 'jobs',
  page: 1,
  limit: 20,
  filters: {
    salaryMin: 5000,
    location: 'Cairo',
    skills: ['JavaScript']
  }
});

console.log(`Found ${results.total} jobs`);
```

### 3. التحقق من صحة الفلاتر

```javascript
const validation = filterService.validateFilters(filters, 'jobs');

if (!validation.valid) {
  console.error('Errors:', validation.errors);
}
```

### 4. الحصول على الفلاتر المتاحة

```javascript
const available = await filterService.getAvailableFilters('jobs');

console.log('Available filters:', available);
```

---

## 📋 الفلاتر المدعومة

| الفلتر | النوع | مثال |
|--------|------|------|
| salaryMin | number | 5000 |
| salaryMax | number | 10000 |
| location | string | 'Cairo' |
| workType | array | ['Full-time', 'Remote'] |
| experienceLevel | array | ['Mid', 'Senior'] |
| skills | array | ['JavaScript', 'React'] |
| skillsLogic | string | 'AND' أو 'OR' |
| datePosted | string | 'today', 'week', 'month' |
| companySize | array | ['Medium', 'Large'] |

---

## 🧪 الاختبار

```bash
cd backend
npm test -- filterService.test.js
```

**النتيجة المتوقعة**: ✅ 39/39 اختبارات نجحت

---

## 📚 التوثيق الكامل

- 📄 [MULTIPLE_FILTERS_IMPLEMENTATION.md](./MULTIPLE_FILTERS_IMPLEMENTATION.md) - دليل شامل
- 📄 [backend/src/services/README_FILTER_SERVICE.md](../../backend/src/services/README_FILTER_SERVICE.md) - دليل الخدمة

---

## ✅ معايير القبول

- [x] جميع الفلاتر تعمل بشكل صحيح
- [x] يمكن تطبيق فلاتر متعددة في نفس الوقت
- [x] التحقق من صحة الفلاتر
- [x] 39 اختبار شامل (كلها نجحت ✅)

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ مكتمل ومفعّل

