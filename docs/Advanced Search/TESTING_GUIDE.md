# دليل الاختبارات الشامل - نظام الفلترة والبحث المتقدم

## 📋 نظرة عامة

هذا الدليل يغطي جميع الاختبارات المتعلقة بنظام الفلترة والبحث المتقدم، بما في ذلك:
- اختبارات الوحدة (Unit Tests)
- اختبارات الخصائص (Property-Based Tests)
- اختبارات التكامل (Integration Tests)
- اختبارات الأداء (Performance Tests)

---

## 📁 هيكل الاختبارات

```
backend/tests/
├── advanced-search-filter.unit.test.js          # اختبارات الوحدة
├── search-bilingual.property.test.js            # Property 3: Bilingual Support
├── saved-search-round-trip.property.test.js     # Property 9: Saved Search Round-trip
├── alert-deduplication.property.test.js         # Property 14: Alert Deduplication
├── alert-toggle-behavior.property.test.js       # Property 12: Alert Toggle
├── advanced-search-integration.test.js          # اختبارات التكامل
├── advanced-search-performance.test.js          # اختبارات الأداء
└── run-advanced-search-tests.js                 # سكريبت تشغيل الاختبارات
```

---

## 🚀 تشغيل الاختبارات

### تشغيل جميع الاختبارات
```bash
cd backend
npm test -- advanced-search
```

### تشغيل باستخدام السكريبت المخصص
```bash
# جميع الاختبارات
node tests/run-advanced-search-tests.js

# اختبارات محددة
node tests/run-advanced-search-tests.js --unit
node tests/run-advanced-search-tests.js --property
node tests/run-advanced-search-tests.js --integration
node tests/run-advanced-search-tests.js --performance

# مع تفاصيل إضافية
node tests/run-advanced-search-tests.js --all --verbose
```

### تشغيل اختبار واحد
```bash
npm test -- advanced-search-integration.test.js
npm test -- advanced-search-performance.test.js
```

---

## 📊 أنواع الاختبارات

### 1. اختبارات الوحدة (Unit Tests)

**الملف**: `advanced-search-filter.unit.test.js`

**التغطية**:
- SearchService - البحث النصي الأساسي
- FilterService - جميع أنواع الفلاتر
- MatchingEngine - حساب نسبة المطابقة
- SavedSearchService - إدارة عمليات البحث المحفوظة
- AlertService - نظام التنبيهات

**أمثلة**:
```javascript
// اختبار البحث الأساسي
test('should search across multiple fields', async () => {
  const results = await searchService.search('JavaScript');
  expect(results.length).toBeGreaterThan(0);
});

// اختبار الفلترة
test('should filter by salary range', async () => {
  const results = await filterService.filterBySalary(jobs, 3000, 8000);
  results.forEach(job => {
    expect(job.salary.min).toBeGreaterThanOrEqual(3000);
    expect(job.salary.max).toBeLessThanOrEqual(8000);
  });
});

// اختبار حساب المطابقة
test('should calculate match percentage correctly', () => {
  const score = matchingEngine.calculateMatchPercentage(
    ['JavaScript', 'React', 'Node.js'],
    ['JavaScript', 'React']
  );
  expect(score).toBe(66.67);
});
```

---

### 2. اختبارات الخصائص (Property-Based Tests)

تستخدم مكتبة `fast-check` للتحقق من الخصائص العامة عبر مدخلات عشوائية متعددة.

#### Property 3: Bilingual Search Support
**الملف**: `search-bilingual.property.test.js`

```javascript
fc.assert(
  fc.asyncProperty(
    fc.string({ minLength: 1 }),
    fc.constantFrom('ar', 'en'),
    async (query, language) => {
      const results = await searchService.search(query, { language });
      // يجب أن تعمل مع كلا اللغتين
      expect(results).toBeDefined();
    }
  ),
  { numRuns: 100 }
);
```

#### Property 9: Saved Search Round-trip
**الملف**: `saved-search-round-trip.property.test.js`

```javascript
fc.assert(
  fc.asyncProperty(
    searchParamsArbitrary(),
    async (params) => {
      // حفظ
      const saved = await savedSearchService.create(userId, params);
      
      // استرجاع
      const retrieved = await savedSearchService.getById(saved._id);
      
      // يجب أن تكون متطابقة
      expect(retrieved.searchParams).toEqual(params);
    }
  ),
  { numRuns: 100 }
);
```

#### Property 12: Alert Toggle Behavior
**الملف**: `alert-toggle-behavior.property.test.js`

```javascript
fc.assert(
  fc.asyncProperty(
    fc.boolean(),
    async (enabled) => {
      const alert = await createAlert({ enabled });
      const job = await createMatchingJob();
      
      const notifications = await getNotifications();
      
      if (enabled) {
        expect(notifications.length).toBeGreaterThan(0);
      } else {
        expect(notifications.length).toBe(0);
      }
    }
  ),
  { numRuns: 50 }
);
```

#### Property 14: Alert Deduplication
**الملف**: `alert-deduplication.property.test.js`

```javascript
fc.assert(
  fc.asyncProperty(
    fc.integer({ min: 2, max: 10 }),
    async (triggerCount) => {
      const alert = await createAlert();
      const job = await createJob();
      
      // تفعيل التنبيه عدة مرات
      for (let i = 0; i < triggerCount; i++) {
        await alertService.checkNewResults(alert);
      }
      
      // يجب أن يكون هناك إشعار واحد فقط
      const notifications = await getNotifications();
      expect(notifications.length).toBe(1);
    }
  ),
  { numRuns: 50 }
);
```

---

### 3. اختبارات التكامل (Integration Tests)

**الملف**: `advanced-search-integration.test.js`

**التغطية**:
- Workflow كامل: بحث → فلترة → حفظ → تنبيه
- تفاعل متعدد المكونات
- سيناريوهات المستخدم الكاملة
- استمرارية البيانات

**السيناريوهات**:

#### 1. Complete Search Workflow
```javascript
test('should complete full workflow: search → filter → save → alert', async () => {
  // 1. بحث أولي
  const searchResponse = await request(app)
    .get('/api/search/jobs')
    .query({ q: 'JavaScript' });
  
  // 2. تطبيق الفلاتر
  const filterResponse = await request(app)
    .get('/api/search/jobs')
    .query({ q: 'JavaScript', salaryMin: 4000 });
  
  // 3. حفظ البحث
  const saveResponse = await request(app)
    .post('/api/search/saved')
    .send({ name: 'My Search', searchParams: {...} });
  
  // 4. تفعيل التنبيه
  const alertResponse = await request(app)
    .post('/api/search/alerts')
    .send({ savedSearchId: saveResponse.body.data._id });
  
  // 5. إنشاء وظيفة مطابقة
  const newJob = await JobPosting.create({...});
  
  // 6. التحقق من إرسال التنبيه
  const notifications = await Notification.find({ userId });
  expect(notifications.length).toBeGreaterThan(0);
});
```

#### 2. Multi-Filter Application
```javascript
test('should apply multiple filters simultaneously', async () => {
  const response = await request(app)
    .get('/api/search/jobs')
    .query({
      q: 'JavaScript',
      location: 'Cairo',
      salaryMin: 4000,
      salaryMax: 7000,
      experienceLevel: 'intermediate,senior',
      workType: 'full-time,hybrid',
      skills: 'JavaScript,Node.js'
    });
  
  // التحقق من تطبيق جميع الفلاتر
  response.body.data.results.forEach(job => {
    expect(job.salary.min).toBeGreaterThanOrEqual(4000);
    expect(job.location.city).toBe('Cairo');
    // ... المزيد من التحققات
  });
});
```

#### 3. Saved Search Management
```javascript
test('should enforce 10 saved searches limit', async () => {
  // إنشاء 10 عمليات بحث
  for (let i = 0; i < 10; i++) {
    await request(app)
      .post('/api/search/saved')
      .send({ name: `Search ${i}`, searchParams: {...} });
  }
  
  // محاولة إنشاء الحادية عشر
  const response = await request(app)
    .post('/api/search/saved')
    .send({ name: 'Search 11', searchParams: {...} });
  
  expect(response.status).toBe(400);
  expect(response.body.error.code).toBe('LIMIT_EXCEEDED');
});
```

---

### 4. اختبارات الأداء (Performance Tests)

**الملف**: `advanced-search-performance.test.js`

**التغطية**:
- وقت الاستجابة (< 500ms)
- معالجة الطلبات المتزامنة
- تحسين استعلامات قاعدة البيانات
- معالجة مجموعات البيانات الكبيرة
- استخدام الذاكرة

**المقاييس**:

#### 1. Response Time Requirements
```javascript
test('should return search results within 500ms', async () => {
  const startTime = Date.now();
  
  await request(app)
    .get('/api/search/jobs')
    .query({ q: 'JavaScript' });
  
  const duration = Date.now() - startTime;
  
  expect(duration).toBeLessThan(500);
  console.log(`Search completed in ${duration}ms`);
});
```

#### 2. Concurrent Request Handling
```javascript
test('should handle 10 concurrent searches efficiently', async () => {
  const promises = Array.from({ length: 10 }, (_, i) =>
    request(app)
      .get('/api/search/jobs')
      .query({ q: `skill${i}` })
  );
  
  const responses = await Promise.all(promises);
  
  responses.forEach(response => {
    expect(response.status).toBe(200);
  });
});
```

#### 3. Large Dataset Handling
```javascript
test('should handle search across 1000+ jobs efficiently', async () => {
  // إنشاء 1000 وظيفة
  await JobPosting.insertMany(generateJobs(1000));
  
  const startTime = Date.now();
  
  await request(app)
    .get('/api/search/jobs')
    .query({ q: 'JavaScript' });
  
  const duration = Date.now() - startTime;
  
  expect(duration).toBeLessThan(500);
});
```

#### 4. Memory Usage
```javascript
test('should not cause memory leaks with repeated searches', async () => {
  const initialMemory = process.memoryUsage().heapUsed;
  
  // 100 عملية بحث
  for (let i = 0; i < 100; i++) {
    await request(app)
      .get('/api/search/jobs')
      .query({ q: `test${i % 10}` });
  }
  
  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;
  
  expect(memoryIncrease).toBeLessThan(50); // < 50MB
});
```

---

## 📈 معايير النجاح

### اختبارات الوحدة
- ✅ جميع الوظائف تعمل بشكل صحيح
- ✅ معالجة الأخطاء تعمل
- ✅ حالات الحافة مغطاة

### اختبارات الخصائص
- ✅ 100+ تكرار لكل خاصية
- ✅ لا فشل في أي تكرار
- ✅ الخصائص تتحقق عبر جميع المدخلات

### اختبارات التكامل
- ✅ جميع السيناريوهات تعمل end-to-end
- ✅ التفاعل بين المكونات صحيح
- ✅ البيانات تُحفظ وتُسترجع بشكل صحيح

### اختبارات الأداء
- ✅ وقت الاستجابة < 500ms
- ✅ معالجة 10+ طلبات متزامنة
- ✅ لا تسرب للذاكرة
- ✅ استخدام فعال للـ indexes

---

## 🔧 الإعداد

### المتطلبات
```bash
npm install --save-dev jest supertest fast-check
```

### متغيرات البيئة
```env
# .env.test
MONGODB_URI_TEST=mongodb://localhost:27017/careerak_test
NODE_ENV=test
```

### تكوين Jest
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  testTimeout: 30000
};
```

---

## 📊 تقارير التغطية

### توليد تقرير التغطية
```bash
npm test -- --coverage
```

### عرض التقرير
```bash
open coverage/lcov-report/index.html
```

### الأهداف
- ✅ تغطية الأسطر: > 80%
- ✅ تغطية الفروع: > 75%
- ✅ تغطية الوظائف: > 85%
- ✅ تغطية العبارات: > 80%

---

## 🐛 استكشاف الأخطاء

### الاختبارات تفشل بشكل عشوائي
```bash
# تشغيل بشكل متسلسل
npm test -- --runInBand

# زيادة timeout
npm test -- --testTimeout=60000
```

### مشاكل الاتصال بقاعدة البيانات
```bash
# التحقق من MongoDB
mongosh mongodb://localhost:27017/careerak_test

# إعادة تشغيل MongoDB
sudo systemctl restart mongod
```

### مشاكل الذاكرة
```bash
# تشغيل مع garbage collection
node --expose-gc node_modules/.bin/jest
```

---

## 📝 أفضل الممارسات

### 1. تنظيم الاختبارات
- ✅ استخدم `describe` لتجميع الاختبارات المتعلقة
- ✅ استخدم أسماء واضحة وصفية
- ✅ اتبع نمط AAA (Arrange, Act, Assert)

### 2. البيانات التجريبية
- ✅ استخدم factories لإنشاء بيانات متسقة
- ✅ نظف البيانات بعد كل اختبار
- ✅ استخدم بيانات واقعية

### 3. الأداء
- ✅ تجنب الاختبارات البطيئة
- ✅ استخدم mocks عند الحاجة
- ✅ قم بقياس الأداء بانتظام

### 4. الصيانة
- ✅ حدّث الاختبارات مع الكود
- ✅ أزل الاختبارات القديمة
- ✅ وثّق الاختبارات المعقدة

---

## 🎯 الخطوات التالية

1. ✅ تشغيل جميع الاختبارات والتأكد من نجاحها
2. ✅ مراجعة تقرير التغطية
3. ✅ إضافة اختبارات للميزات الجديدة
4. ✅ تحسين الاختبارات البطيئة
5. ✅ إعداد CI/CD للاختبارات التلقائية

---

## 📚 المراجع

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Testing Best Practices](https://testingjavascript.com/)

---

**تاريخ الإنشاء**: 2026-03-03  
**آخر تحديث**: 2026-03-03  
**الحالة**: ✅ مكتمل
