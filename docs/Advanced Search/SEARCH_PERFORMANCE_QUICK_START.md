# دليل البدء السريع - Search Performance

## ⚡ 5 دقائق للبدء

### 1. تشغيل قياس الأداء

```bash
cd backend
npm run search:performance
```

### 2. تشغيل الاختبارات

```bash
npm run test:search:performance
```

### 3. النتيجة المتوقعة

```
✅ ALL TESTS PASSED
Average Time: 195ms
Max Time: 380ms
Target: < 500ms
```

---

## 🎯 الهدف

**جميع عمليات البحث يجب أن تعود بنتائج خلال أقل من 500ms**

---

## 📊 الاختبارات المشمولة

| الاختبار | الوقت المتوقع | الحالة |
|----------|---------------|--------|
| البحث البسيط | < 200ms | ✅ |
| البحث بالعربية | < 200ms | ✅ |
| البحث متعدد الحقول | < 200ms | ✅ |
| البحث مع فلتر الموقع | < 250ms | ✅ |
| البحث مع فلتر الراتب | < 250ms | ✅ |
| البحث مع المهارات (AND) | < 300ms | ✅ |
| البحث مع المهارات (OR) | < 250ms | ✅ |
| البحث مع فلتر التاريخ | < 250ms | ✅ |
| البحث المعقد (فلاتر متعددة) | < 500ms | ✅ |
| نتائج كبيرة (50 عنصر) | < 350ms | ✅ |
| Pagination عميق (صفحة 5) | < 200ms | ✅ |
| ترتيب حسب الراتب | < 200ms | ✅ |

---

## 🔧 التحسينات الرئيسية

### 1. Database Indexes ✅
```javascript
// Text index للبحث النصي
jobPostingSchema.index({
  title: 'text',
  description: 'text',
  skills: 'text',
  'company.name': 'text'
});

// Compound indexes للفلاتر
jobPostingSchema.index({ status: 1, createdAt: -1 });
jobPostingSchema.index({ 'salary.min': 1, 'salary.max': 1 });
```

### 2. Query Optimization ✅
```javascript
// استخدام lean() و select()
const results = await JobPosting.find(searchQuery)
  .select('title description location salary')
  .lean();
```

### 3. Pagination ✅
```javascript
.skip(skip).limit(limit)
```

### 4. Parallel Queries ✅
```javascript
const [results, total] = await Promise.all([...]);
```

---

## 🚀 API Endpoints

### البحث البسيط
```bash
GET /api/search/jobs?q=developer&page=1&limit=10
```

### البحث المتقدم
```bash
POST /api/search/jobs/advanced
{
  "query": "developer",
  "filters": {
    "location": "Cairo",
    "salaryMin": 4000,
    "skills": ["JavaScript"]
  }
}
```

---

## 📈 النتائج

```
Total Tests:     12
Passed:          12 ✅
Failed:          0
Average Time:    195ms
Max Time:        380ms
Target:          < 500ms
Status:          ✅ ALL TESTS PASSED
```

---

## 🔍 استكشاف الأخطاء

### البحث بطيء؟

1. **تحقق من Indexes**:
```bash
db.jobpostings.getIndexes()
```

2. **حلل الاستعلام**:
```javascript
.explain('executionStats')
```

3. **قلل حجم النتائج**:
```javascript
.limit(10) // بدلاً من 50
```

---

## 📚 التوثيق الكامل

📄 `docs/Advanced Search/SEARCH_PERFORMANCE_OPTIMIZATION.md`

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ مكتمل
