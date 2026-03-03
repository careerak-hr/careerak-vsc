# دليل البدء السريع - البحث ثنائي اللغة

## ⚡ 5 دقائق للبدء

---

## 1️⃣ التحقق من الإعداد (30 ثانية)

```bash
# تحقق من وجود text index
cd backend
node -e "
const mongoose = require('mongoose');
const JobPosting = require('./src/models/JobPosting');
mongoose.connect(process.env.MONGODB_URI).then(() => {
  JobPosting.collection.getIndexes().then(indexes => {
    console.log('Indexes:', Object.keys(indexes));
    process.exit(0);
  });
});
"
```

**النتيجة المتوقعة**: يجب أن ترى `job_text_search` في القائمة

---

## 2️⃣ اختبار البحث (1 دقيقة)

```bash
# تشغيل الاختبارات
npm test -- bilingual-search.test.js
```

**النتيجة المتوقعة**: ✅ 18/18 اختبار نجح

---

## 3️⃣ استخدام API (2 دقيقة)

### البحث بالعربية

```bash
curl -X GET "http://localhost:5000/api/search/jobs?q=مطور&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### البحث بالإنجليزية

```bash
curl -X GET "http://localhost:5000/api/search/jobs?q=Developer&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### البحث المختلط

```bash
curl -X GET "http://localhost:5000/api/search/jobs?q=مطور JavaScript&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4️⃣ استخدام في الكود (1 دقيقة)

### Backend

```javascript
const searchService = require('./services/searchService');

// بحث بسيط
const results = await searchService.textSearch('مطور', {
  type: 'jobs',
  page: 1,
  limit: 20
});

console.log(`Found ${results.total} jobs`);
```

### Frontend

```javascript
// في React Component
const searchJobs = async (query) => {
  const response = await fetch(
    `/api/search/jobs?q=${encodeURIComponent(query)}&page=1&limit=20`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const data = await response.json();
  return data.results;
};

// استخدام
const jobs = await searchJobs('مطور ويب');
```

---

## 5️⃣ استكشاف الأخطاء (30 ثانية)

### المشكلة: "No results found"

**الحل**:
```javascript
// تحقق من وجود text index
db.jobpostings.getIndexes()

// إذا لم يكن موجود، أنشئه
db.jobpostings.createIndex(
  { title: "text", description: "text", skills: "text", "company.name": "text" },
  { default_language: "none", name: "job_text_search" }
)
```

### المشكلة: "Search query cannot be empty"

**الحل**: تأكد من أن الاستعلام ليس فارغاً أو مسافات فقط

```javascript
if (!query || query.trim().length === 0) {
  throw new Error('Search query cannot be empty');
}
```

### المشكلة: بطء في النتائج

**الحل**: تحقق من الـ indexes

```bash
# تحليل الاستعلام
db.jobpostings.find({ $text: { $search: "مطور" } }).explain("executionStats")
```

---

## 📊 أمثلة سريعة

```javascript
// 1. بحث بسيط
await searchService.textSearch('مطور');

// 2. بحث مع pagination
await searchService.textSearch('Developer', { page: 2, limit: 10 });

// 3. بحث مع sorting
await searchService.textSearch('JavaScript', { sort: 'date' });

// 4. بحث مع filters
await searchService.textSearch('مطور', {
  filters: { jobType: 'Full-time', experienceLevel: 'Mid' }
});
```

---

## ✅ Checklist

- [ ] Text index موجود على JobPosting
- [ ] الاختبارات تعمل (18/18 ✅)
- [ ] API endpoint يعمل
- [ ] البحث بالعربية يعمل
- [ ] البحث بالإنجليزية يعمل
- [ ] البحث المختلط يعمل

---

## 🔗 روابط مفيدة

- 📄 [التوثيق الكامل](./BILINGUAL_SEARCH_SUPPORT.md)
- 📄 [ملف المتطلبات](../../.kiro/specs/advanced-search-filter/requirements.md)
- 📄 [ملف المهام](../../.kiro/specs/advanced-search-filter/tasks.md)

---

**وقت الإعداد الكلي**: 5 دقائق  
**الحالة**: ✅ جاهز للاستخدام
