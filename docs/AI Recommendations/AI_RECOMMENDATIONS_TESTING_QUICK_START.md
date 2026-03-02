# نظام التوصيات الذكية - دليل الاختبارات السريع

## 🚀 البدء السريع (5 دقائق)

### 1. التثبيت (دقيقة واحدة)

```bash
cd backend

# تثبيت التبعيات (إذا لم تكن مثبتة)
npm install

# التحقق من تثبيت أدوات الاختبار
npm list jest fast-check mongodb-memory-server
```

### 2. تشغيل الاختبارات (دقيقتان)

```bash
# تشغيل جميع اختبارات AI Recommendations
npm test -- ai-recommendations-comprehensive

# النتيجة المتوقعة:
# ✅ 110+ tests passed
# ⏱️  Time: ~30-60 seconds
```

### 3. التحقق من التغطية (دقيقة واحدة)

```bash
# تشغيل مع تقرير التغطية
npm test -- ai-recommendations-comprehensive --coverage

# النتيجة المتوقعة:
# Coverage: 88.5%+ ✅
```

### 4. عرض التقرير (دقيقة واحدة)

```bash
# فتح تقرير HTML
# Windows
start coverage/lcov-report/index.html

# Mac
open coverage/lcov-report/index.html

# Linux
xdg-open coverage/lcov-report/index.html
```

---

## 📋 الأوامر الأساسية

### تشغيل اختبارات محددة

```bash
# جميع اختبارات AI
npm test -- ai-recommendations

# Content-Based Filtering فقط
npm test -- contentBasedFiltering

# Skill Gap Analysis فقط
npm test -- skillGapAnalysis

# Profile Analysis فقط
npm test -- profileAnalysis

# Recommendation Accuracy فقط
npm test -- recommendationAccuracy

# Learning from Interactions فقط
npm test -- learning-from-interactions

# Tracking Opt-Out فقط
npm test -- tracking-opt-out
```

### أوامر مفيدة

```bash
# تشغيل في وضع Watch (يعيد التشغيل عند التغيير)
npm test -- --watch

# تشغيل اختبار واحد فقط
npm test -- -t "should calculate match score"

# تشغيل مع verbose output
npm test -- --verbose

# تشغيل بدون cache
npm test -- --no-cache
```

---

## 🎯 فهم النتائج

### نتيجة ناجحة ✅

```
PASS  tests/ai-recommendations-comprehensive.test.js
  Unit Tests - Content-Based Filtering
    ✓ should calculate match score between user and job (125ms)
    ✓ should return higher score for better matches (98ms)
  Unit Tests - Skill Gap Analysis
    ✓ should identify missing skills (87ms)
    ✓ should return empty array when no skill gaps (76ms)
  ...
  
Test Suites: 1 passed, 1 total
Tests:       110 passed, 110 total
Time:        45.234s
```

### نتيجة فاشلة ❌

```
FAIL  tests/ai-recommendations-comprehensive.test.js
  Unit Tests - Content-Based Filtering
    ✕ should calculate match score between user and job (125ms)
    
  ● Unit Tests - Content-Based Filtering › should calculate match score

    expect(received).toHaveProperty(expected)

    Expected property: "score"
    Received value: undefined
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: MongoDB Connection Error

```
Error: MongoMemoryServer failed to start
```

**الحل**:
```bash
# إعادة تثبيت mongodb-memory-server
npm uninstall mongodb-memory-server
npm install mongodb-memory-server --save-dev

# مسح cache
npm cache clean --force

# إعادة التشغيل
npm test
```

### المشكلة 2: Timeout Error

```
Timeout - Async callback was not invoked within the 30000 ms timeout
```

**الحل**:
```bash
# زيادة timeout في jest.config.js
# testTimeout: 60000

# أو في الاختبار نفسه
jest.setTimeout(60000);
```

### المشكلة 3: Property Tests Failing

```
Property failed after 5 tests
```

**الحل**:
```javascript
// زيادة عدد التشغيلات
fc.assert(..., { numRuns: 50 })

// أو تقليل العدد للاختبار السريع
fc.assert(..., { numRuns: 5 })
```

### المشكلة 4: Coverage Too Low

```
Coverage: 65% (Target: 80%)
```

**الحل**:
```bash
# عرض الملفات غير المغطاة
npm test -- --coverage --verbose

# إضافة اختبارات للملفات المفقودة
```

---

## 📊 فهم تقرير التغطية

### مثال على تقرير التغطية

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   88.5  |   81.2   |   86.3  |   89.1  |
 services/          |   90.2  |   83.5   |   88.1  |   91.0  |
  contentBased...   |   92.0  |   85.0   |   90.0  |   93.0  |
  skillGapAna...    |   88.0  |   80.0   |   85.0  |   89.0  |
  profileAnal...    |   90.0  |   82.0   |   88.0  |   91.0  |
--------------------|---------|----------|---------|---------|
```

**المعاني**:
- **Stmts**: نسبة الأوامر المختبرة
- **Branch**: نسبة الفروع (if/else) المختبرة
- **Funcs**: نسبة الدوال المختبرة
- **Lines**: نسبة الأسطر المختبرة

**الهدف**: جميع النسب > 80% ✅

---

## ✅ قائمة التحقق السريعة

قبل الـ commit، تأكد من:

- [ ] جميع الاختبارات تنجح (110/110 ✅)
- [ ] التغطية > 80% ✅
- [ ] لا توجد console.log في الكود
- [ ] لا توجد اختبارات معطلة (.skip)
- [ ] لا توجد اختبارات مؤقتة (.only)
- [ ] جميع Property tests تنجح
- [ ] Performance tests تنجح (< 3s)

---

## 🎓 نصائح للاختبار الفعال

### 1. اكتب الاختبار أولاً (TDD)
```javascript
// ❌ سيء: كتابة الكود ثم الاختبار
// ✅ جيد: كتابة الاختبار ثم الكود

test('should do something', () => {
  // Write test first
  expect(doSomething()).toBe(expected);
});

// Then implement doSomething()
```

### 2. استخدم أسماء واضحة
```javascript
// ❌ سيء
test('test1', () => {});

// ✅ جيد
test('should calculate match score between user and job', () => {});
```

### 3. اختبر حالة واحدة فقط
```javascript
// ❌ سيء: اختبار متعدد
test('should do everything', () => {
  expect(a).toBe(1);
  expect(b).toBe(2);
  expect(c).toBe(3);
});

// ✅ جيد: اختبار واحد
test('should calculate score', () => {
  expect(calculateScore()).toBe(75);
});
```

### 4. استخدم beforeEach للإعداد
```javascript
let user, job;

beforeEach(async () => {
  user = await User.create({...});
  job = await JobPosting.create({...});
});

test('test 1', () => {
  // use user and job
});

test('test 2', () => {
  // use user and job
});
```

### 5. نظف بعد الاختبار
```javascript
afterEach(async () => {
  await User.deleteMany({});
  await JobPosting.deleteMany({});
});
```

---

## 📚 موارد إضافية

### الوثائق الكاملة
- 📄 `docs/AI_RECOMMENDATIONS_TESTING.md` - دليل شامل (500+ سطر)
- 📄 `backend/tests/ai-recommendations-comprehensive.test.js` - الاختبارات الكاملة

### أمثلة الاختبارات
- 📄 `backend/tests/contentBasedFiltering.test.js`
- 📄 `backend/tests/skillGapAnalysis.test.js`
- 📄 `backend/tests/profileAnalysis.test.js`
- 📄 `backend/tests/recommendationAccuracy.test.js`

### المراجع الخارجية
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## 🎯 الخطوات التالية

بعد تشغيل الاختبارات بنجاح:

1. ✅ راجع تقرير التغطية
2. ✅ أضف اختبارات للملفات المفقودة
3. ✅ حسّن الاختبارات الفاشلة
4. ✅ وثّق أي مشاكل وجدتها
5. ✅ شارك النتائج مع الفريق

---

**تاريخ الإنشاء**: 2026-02-28  
**آخر تحديث**: 2026-02-28  
**الوقت المتوقع**: 5 دقائق ⏱️
