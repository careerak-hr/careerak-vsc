# دليل البدء السريع - اختبارات نظام البحث المتقدم

## ⚡ البدء السريع (5 دقائق)

### 1. التثبيت
```bash
cd backend
npm install
```

### 2. تشغيل جميع الاختبارات
```bash
npm test -- advanced-search
```

### 3. النتيجة المتوقعة
```
✅ Unit Tests: 25/25 passed
✅ Property Tests: 4/4 passed (400+ iterations)
✅ Integration Tests: 15/15 passed
✅ Performance Tests: 12/12 passed

Total: 56/56 tests passed
```

---

## 🎯 الاختبارات الأساسية

### اختبار سريع (30 ثانية)
```bash
# اختبارات الوحدة فقط
npm test -- advanced-search-filter.unit.test.js
```

### اختبار شامل (2-3 دقائق)
```bash
# جميع الاختبارات
node tests/run-advanced-search-tests.js --all
```

### اختبار الأداء (1-2 دقيقة)
```bash
# اختبارات الأداء فقط
npm test -- advanced-search-performance.test.js
```

---

## 📊 أنواع الاختبارات

| النوع | الملف | الوقت | الأهمية |
|------|------|-------|---------|
| Unit | `advanced-search-filter.unit.test.js` | 10s | ⭐⭐⭐⭐⭐ |
| Property | `search-bilingual.property.test.js` | 20s | ⭐⭐⭐⭐ |
| Integration | `advanced-search-integration.test.js` | 30s | ⭐⭐⭐⭐⭐ |
| Performance | `advanced-search-performance.test.js` | 60s | ⭐⭐⭐⭐ |

---

## 🔍 اختبارات محددة

### البحث الأساسي
```bash
npm test -- -t "should search across multiple fields"
```

### الفلترة
```bash
npm test -- -t "should apply multiple filters"
```

### عمليات البحث المحفوظة
```bash
npm test -- -t "saved search"
```

### التنبيهات
```bash
npm test -- -t "alert"
```

### الأداء
```bash
npm test -- -t "should return.*within 500ms"
```

---

## ✅ معايير النجاح

### يجب أن تنجح جميع الاختبارات
- ✅ 25 اختبار وحدة
- ✅ 4 اختبارات خصائص (400+ تكرار)
- ✅ 15 اختبار تكامل
- ✅ 12 اختبار أداء

### معايير الأداء
- ✅ وقت الاستجابة < 500ms
- ✅ معالجة 10+ طلبات متزامنة
- ✅ لا تسرب للذاكرة (< 50MB)

---

## 🐛 استكشاف الأخطاء السريع

### الاختبارات تفشل؟
```bash
# 1. تحقق من MongoDB
mongosh mongodb://localhost:27017/careerak_test

# 2. نظف قاعدة البيانات
npm run test:clean

# 3. أعد التشغيل
npm test -- advanced-search
```

### بطء في الاختبارات؟
```bash
# تشغيل متسلسل
npm test -- --runInBand

# زيادة timeout
npm test -- --testTimeout=60000
```

### مشاكل في الذاكرة؟
```bash
# تشغيل مع garbage collection
node --expose-gc node_modules/.bin/jest
```

---

## 📈 تقرير التغطية

### توليد التقرير
```bash
npm test -- --coverage
```

### عرض التقرير
```bash
# Windows
start coverage/lcov-report/index.html

# Mac/Linux
open coverage/lcov-report/index.html
```

### الأهداف
- ✅ تغطية الأسطر: > 80%
- ✅ تغطية الفروع: > 75%
- ✅ تغطية الوظائف: > 85%

---

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test -- advanced-search
```

### Pre-commit Hook
```bash
# .husky/pre-commit
npm test -- advanced-search --bail
```

---

## 📝 الأوامر المفيدة

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل اختبارات محددة
npm test -- advanced-search

# تشغيل مع تفاصيل
npm test -- --verbose

# تشغيل مع تغطية
npm test -- --coverage

# تشغيل في وضع المراقبة
npm test -- --watch

# تشغيل اختبار واحد
npm test -- -t "test name"

# تشغيل بدون cache
npm test -- --no-cache
```

---

## 🎯 الخطوات التالية

1. ✅ شغّل جميع الاختبارات
2. ✅ تحقق من النتائج
3. ✅ راجع تقرير التغطية
4. ✅ أصلح أي اختبارات فاشلة
5. ✅ أضف اختبارات للميزات الجديدة

---

## 📚 المزيد من المعلومات

- 📄 [دليل الاختبارات الشامل](./TESTING_GUIDE.md)
- 📄 [توثيق التصميم](./design.md)
- 📄 [المتطلبات](./requirements.md)

---

**نصيحة**: شغّل الاختبارات قبل كل commit للتأكد من عدم كسر أي شيء!

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ جاهز للاستخدام
