# دليل اختبار الأداء - نظام البحث والفلترة المتقدم

## 📋 نظرة عامة

هذا الدليل يشرح كيفية قياس والتحقق من أن نظام البحث والفلترة المتقدم يلبي مؤشرات الأداء (KPIs) المحددة في المتطلبات.

---

## 🎯 مؤشرات الأداء المطلوبة (KPIs)

| المؤشر | الهدف | الوصف |
|--------|-------|-------|
| **سرعة البحث** | < 500ms | وقت استجابة البحث |
| **معدل استخدام الفلاتر** | > 60% | نسبة عمليات البحث التي تستخدم فلاتر |
| **معدل حفظ عمليات البحث** | > 30% | نسبة المستخدمين الذين يحفظون عمليات بحث |
| **معدل تفعيل التنبيهات** | > 20% | نسبة المستخدمين الذين يفعّلون تنبيهات |
| **معدل استخدام Map View** | > 15% | نسبة عمليات البحث على الخريطة |

---

## 🧪 الاختبارات المتاحة

### 1. اختبارات الأداء التلقائية (Jest)

**الملف**: `backend/tests/search-performance.test.js`

**الاختبارات المتضمنة**:
- ✅ سرعة البحث النصي (< 500ms)
- ✅ سرعة البحث مع الفلاتر (< 500ms)
- ✅ سرعة الاقتراحات التلقائية (< 300ms)
- ✅ أداء الاستعلامات المتزامنة
- ✅ كفاءة استخدام Indexes
- ✅ أداء Pagination
- ✅ أداء الفلاتر المتعددة

**التشغيل**:
```bash
cd backend

# تشغيل جميع اختبارات الأداء
npm run test:search:performance

# تشغيل مع تقرير مفصل
npm run test:search:performance -- --verbose

# تشغيل مع coverage
npm run test:search:performance -- --coverage
```

**النتيجة المتوقعة**:
```
PASS  tests/search-performance.test.js
  Search Performance Tests
    KPI 1: سرعة البحث < 500ms
      ✓ should return search results within 500ms (245ms)
      ✓ should handle text search efficiently (180ms)
      ✓ should handle filtered search within 500ms (320ms)
      ✓ should handle concurrent searches efficiently (450ms)
      ✓ should handle autocomplete within 300ms (120ms)
    Database Query Performance
      ✓ should use indexes efficiently (150ms)
      ✓ should use lean() for better performance (200ms)
      ✓ should use select() to limit fields (180ms)
    Pagination Performance
      ✓ should paginate efficiently (160ms)
      ✓ should handle deep pagination (450ms)
    Filter Performance
      ✓ should filter by salary range efficiently (45ms)
      ✓ should filter by skills efficiently (60ms)
      ✓ should apply multiple filters efficiently (280ms)

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

---

### 2. قياس مؤشرات الأداء من البيانات الفعلية

**الملف**: `backend/scripts/measure-search-performance.js`

**المقاييس المتضمنة**:
- 📊 سرعة البحث (متوسط وأقصى)
- 📊 معدل استخدام الفلاتر
- 📊 معدل حفظ عمليات البحث
- 📊 معدل تفعيل التنبيهات
- 📊 معدل استخدام Map View

**التشغيل**:
```bash
cd backend

# قياس جميع المؤشرات
npm run search:performance

# قياس مع تصدير النتائج
npm run search:performance > performance-report.txt
```

**النتيجة المتوقعة**:
```
🚀 بدء قياس مؤشرات الأداء...

✅ تم الاتصال بقاعدة البيانات

============================================================
KPI 1: سرعة البحث
============================================================
  "developer": 245ms
  "designer": 180ms
  "manager": 210ms
  "engineer": 195ms
  "analyst": 220ms

📊 متوسط الوقت: 210ms
📊 أقصى وقت: 245ms

✅ متوسط سرعة البحث: 210ms (الهدف: 500ms)
✅ أقصى سرعة بحث: 245ms (الهدف: 500ms)

============================================================
KPI 2: معدل استخدام الفلاتر
============================================================
📊 إجمالي عمليات البحث: 1250
📊 عمليات بحث مع فلاتر: 825

✅ معدل استخدام الفلاتر: 66.0% (الهدف: 60%)

============================================================
KPI 3: معدل حفظ عمليات البحث
============================================================
📊 مستخدمون بحثوا: 450
📊 مستخدمون حفظوا بحث: 165

✅ معدل حفظ عمليات البحث: 36.7% (الهدف: 30%)

============================================================
KPI 4: معدل تفعيل التنبيهات
============================================================
📊 مستخدمون حفظوا بحث: 165
📊 مستخدمون فعّلوا تنبيهات: 42

✅ معدل تفعيل التنبيهات: 25.5% (الهدف: 20%)

============================================================
KPI 5: معدل استخدام Map View
============================================================
📊 إجمالي عمليات البحث: 1250
📊 عمليات بحث على الخريطة: 210

✅ معدل استخدام Map View: 16.8% (الهدف: 15%)

============================================================
📊 ملخص مؤشرات الأداء (KPIs)
============================================================

✅ سرعة البحث: 210ms
✅ معدل استخدام الفلاتر: 66.0%
✅ معدل حفظ عمليات البحث: 36.7%
✅ معدل تفعيل التنبيهات: 25.5%
✅ معدل استخدام Map View: 16.8%

============================================================
✅ جميع مؤشرات الأداء تلبي المتطلبات!
============================================================
```

---

## 📈 تحسين الأداء

### 1. تحسين سرعة البحث

**إذا كانت سرعة البحث > 500ms**:

```bash
# 1. التحقق من Indexes
cd backend
node -e "
const mongoose = require('mongoose');
const JobPosting = require('./src/models/JobPosting');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const indexes = await JobPosting.collection.getIndexes();
  console.log('Indexes:', indexes);
  process.exit(0);
});
"

# 2. إضافة Indexes المفقودة
# في JobPosting model:
# - Text index على: title, description, skills, company.name
# - Geo index على: location.coordinates
# - Compound indexes على: status, createdAt

# 3. استخدام lean() و select()
# في SearchService:
const results = await JobPosting
  .find(query)
  .select('title company.name location salary')
  .lean()
  .limit(20);

# 4. إضافة Caching (Redis)
# في SearchService:
const cacheKey = `search:${JSON.stringify(params)}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### 2. تحسين معدل استخدام الفلاتر

**إذا كان معدل استخدام الفلاتر < 60%**:

- ✅ اجعل الفلاتر أكثر وضوحاً في UI
- ✅ أضف اقتراحات فلاتر ذكية
- ✅ اعرض عدد النتائج لكل فلتر
- ✅ احفظ الفلاتر المستخدمة مؤخراً
- ✅ أضف فلاتر سريعة (Quick Filters)

### 3. تحسين معدل حفظ عمليات البحث

**إذا كان معدل حفظ عمليات البحث < 30%**:

- ✅ اعرض زر "حفظ البحث" بشكل بارز
- ✅ اشرح فوائد حفظ البحث (تنبيهات، سرعة)
- ✅ اسمح بحفظ البحث بنقرة واحدة
- ✅ اعرض عمليات البحث المحفوظة في الصفحة الرئيسية
- ✅ أرسل تذكير بحفظ البحث بعد 3 عمليات بحث

### 4. تحسين معدل تفعيل التنبيهات

**إذا كان معدل تفعيل التنبيهات < 20%**:

- ✅ اعرض خيار التنبيهات عند حفظ البحث
- ✅ اشرح فوائد التنبيهات (وظائف جديدة فوراً)
- ✅ اجعل التفعيل بنقرة واحدة
- ✅ أرسل إشعار تجريبي بعد التفعيل
- ✅ اعرض إحصائيات (كم وظيفة جديدة وجدنا لك)

### 5. تحسين معدل استخدام Map View

**إذا كان معدل استخدام Map View < 15%**:

- ✅ اجعل زر Map View أكثر وضوحاً
- ✅ اعرض عدد الوظائف على الخريطة
- ✅ أضف clustering للعلامات
- ✅ اسمح بالبحث بالرسم على الخريطة
- ✅ احفظ تفضيل المستخدم (List vs Map)

---

## 🔍 استكشاف الأخطاء

### المشكلة: الاختبارات تفشل

**الحل**:
```bash
# 1. تحقق من الاتصال بقاعدة البيانات
echo $MONGODB_URI

# 2. تحقق من وجود بيانات اختبار
cd backend
node -e "
const mongoose = require('mongoose');
const JobPosting = require('./src/models/JobPosting');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await JobPosting.countDocuments();
  console.log('Job postings:', count);
  process.exit(0);
});
"

# 3. أنشئ بيانات اختبار إذا لزم الأمر
npm run seed:test-data
```

### المشكلة: سرعة البحث بطيئة جداً

**الحل**:
```bash
# 1. تحليل الاستعلام
cd backend
node -e "
const mongoose = require('mongoose');
const JobPosting = require('./src/models/JobPosting');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const explain = await JobPosting
    .find({ \$text: { \$search: 'developer' } })
    .explain('executionStats');
  console.log('Execution stats:', explain.executionStats);
  process.exit(0);
});
"

# 2. إضافة Indexes
# راجع JobPosting model وتأكد من وجود جميع Indexes

# 3. استخدام Redis للـ Caching
# راجع SearchService وأضف caching layer
```

### المشكلة: معدلات الاستخدام منخفضة

**الحل**:
```bash
# 1. تحقق من وجود بيانات كافية
npm run search:performance

# 2. إذا كانت البيانات قليلة، انتظر أسبوع أو أسبوعين

# 3. راجع UI/UX للميزات
# - هل الفلاتر واضحة؟
# - هل زر "حفظ البحث" بارز؟
# - هل خيار التنبيهات واضح؟
# - هل Map View سهل الوصول إليه؟
```

---

## 📊 التقارير الدورية

### تقرير أسبوعي

```bash
# كل يوم إثنين الساعة 9 صباحاً
cd backend
npm run search:performance > reports/weekly-$(date +%Y-%m-%d).txt
```

### تقرير شهري

```bash
# أول يوم من كل شهر
cd backend
npm run search:performance > reports/monthly-$(date +%Y-%m).txt

# مقارنة مع الشهر السابق
diff reports/monthly-2026-02.txt reports/monthly-2026-03.txt
```

### Dashboard (مستقبلاً)

يمكن إنشاء dashboard لعرض المقاييس في الوقت الفعلي:

- 📊 Grafana + Prometheus
- 📊 Google Analytics
- 📊 Custom Admin Dashboard

---

## ✅ Checklist قبل الإنتاج

- [ ] جميع اختبارات الأداء تنجح
- [ ] سرعة البحث < 500ms
- [ ] معدل استخدام الفلاتر > 60%
- [ ] معدل حفظ عمليات البحث > 30%
- [ ] معدل تفعيل التنبيهات > 20%
- [ ] معدل استخدام Map View > 15%
- [ ] Indexes محسّنة
- [ ] Caching مفعّل (Redis)
- [ ] Rate limiting مفعّل
- [ ] Monitoring مفعّل
- [ ] التقارير الدورية مجدولة

---

## 📚 المراجع

- 📄 `backend/tests/search-performance.test.js` - اختبارات الأداء
- 📄 `backend/scripts/measure-search-performance.js` - قياس المؤشرات
- 📄 `.kiro/specs/advanced-search-filter/requirements.md` - المتطلبات
- 📄 `.kiro/specs/advanced-search-filter/design.md` - التصميم التقني

---

**تاريخ الإنشاء**: 2026-03-03  
**آخر تحديث**: 2026-03-03  
**الحالة**: ✅ مكتمل
