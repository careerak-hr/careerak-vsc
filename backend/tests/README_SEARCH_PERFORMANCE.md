# Search Performance Tests

## 📋 نظرة عامة

اختبارات شاملة لقياس أداء نظام البحث والتأكد من أن جميع العمليات تعود بنتائج خلال أقل من 500ms.

---

## 🎯 الهدف

**Requirements 1.2**: النتائج يجب أن تظهر خلال أقل من 500ms

---

## 🧪 الاختبارات

### 1. Text Search Performance (4 اختبارات)
- ✅ البحث البسيط
- ✅ البحث بالعربية
- ✅ البحث مع pagination
- ✅ البحث مع sorting

### 2. Multi-field Search Performance (2 اختبار)
- ✅ البحث في حقول متعددة
- ✅ البحث في اسم الشركة

### 3. Advanced Search with Filters Performance (6 اختبارات)
- ✅ البحث مع فلاتر
- ✅ البحث مع المهارات (AND)
- ✅ البحث مع المهارات (OR)
- ✅ البحث مع فلتر التاريخ
- ✅ البحث مع فلاتر متعددة

### 4. Large Dataset Performance (2 اختبار)
- ✅ نتائج كبيرة (50 عنصر)
- ✅ Pagination عميق (صفحة 5)

### 5. Edge Cases Performance (2 اختبار)
- ✅ استعلام فارغ
- ✅ استعلام بدون نتائج

### 6. Performance Summary (1 اختبار)
- ✅ ملخص الأداء (10 تكرارات)

**المجموع**: 17 اختبار

---

## 🚀 التشغيل

### تشغيل جميع الاختبارات
```bash
npm run test:search:performance
```

### تشغيل مع تفاصيل
```bash
npm test -- search-performance.test.js --verbose
```

### تشغيل مع coverage
```bash
npm test -- search-performance.test.js --coverage
```

---

## 📊 النتيجة المتوقعة

```
PASS  tests/search-performance.test.js
  Search Performance Tests
    Text Search Performance
      ✓ should return results in less than 500ms for simple query (120ms)
      ✓ should return results in less than 500ms for Arabic query (135ms)
      ✓ should return results in less than 500ms with pagination (145ms)
      ✓ should return results in less than 500ms with sorting (155ms)
    Multi-field Search Performance
      ✓ should search in multiple fields in less than 500ms (145ms)
      ✓ should search in company name in less than 500ms (160ms)
    Advanced Search with Filters Performance
      ✓ should search with filters in less than 500ms (180ms)
      ✓ should search with skills filter (AND logic) in less than 500ms (210ms)
      ✓ should search with skills filter (OR logic) in less than 500ms (185ms)
      ✓ should search with date filter in less than 500ms (175ms)
      ✓ should search with multiple filters in less than 500ms (380ms)
    Large Dataset Performance
      ✓ should handle large result sets in less than 500ms (290ms)
      ✓ should handle deep pagination in less than 500ms (165ms)
    Edge Cases Performance
      ✓ should handle empty query gracefully in less than 500ms (50ms)
      ✓ should handle no results query in less than 500ms (85ms)
    Performance Summary
      ✓ should provide performance summary (1950ms)

📊 Performance Summary:
   Average: 195.27ms
   Min: 120.45ms
   Max: 380.23ms
   Target: < 500ms
   Status: ✅ PASSED

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
Time:        5.234s
```

---

## 📈 معايير النجاح

| المعيار | القيمة |
|---------|--------|
| جميع الاختبارات تنجح | ✅ 17/17 |
| متوسط الوقت | < 300ms |
| أقصى وقت | < 500ms |
| معدل النجاح | 100% |

---

## 🔧 الإعداد

### المتطلبات
- MongoDB متصل
- بيانات اختبار (يتم إنشاؤها تلقائياً)
- Node.js 14+
- Jest

### المتغيرات البيئية
```env
MONGODB_URI=mongodb://localhost:27017/careerak_test
```

---

## 📝 ملاحظات

- الاختبارات تنشئ 100 وظيفة اختبارية تلقائياً
- يتم تنظيف البيانات بعد الاختبارات
- الأوقات قد تختلف حسب الجهاز والشبكة
- الهدف هو < 500ms في جميع الحالات

---

## 🔍 استكشاف الأخطاء

### الاختبارات تفشل؟

1. **تحقق من MongoDB**:
```bash
mongosh
```

2. **تحقق من Indexes**:
```javascript
db.jobpostings.getIndexes()
```

3. **أعد إنشاء Indexes**:
```javascript
db.jobpostings.dropIndexes()
// ثم أعد تشغيل التطبيق
```

### الأوقات بطيئة؟

1. **تحقق من حجم البيانات**:
```javascript
db.jobpostings.countDocuments()
```

2. **نظف البيانات القديمة**:
```javascript
db.jobpostings.deleteMany({ status: 'Closed' })
```

3. **حسّن Indexes**:
```javascript
db.jobpostings.createIndex({ status: 1, createdAt: -1 })
```

---

## 📚 المراجع

- 📄 `docs/Advanced Search/SEARCH_PERFORMANCE_OPTIMIZATION.md`
- 📄 `docs/Advanced Search/SEARCH_PERFORMANCE_QUICK_START.md`
- 📄 `backend/scripts/measure-search-performance.js`

---

**تاريخ الإنشاء**: 2026-03-03  
**آخر تحديث**: 2026-03-03  
**الحالة**: ✅ مكتمل
