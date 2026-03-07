# Checkpoint 15 - دليل الإصلاحات السريعة

## 📋 نظرة عامة

هذا الدليل يوضح الإصلاحات البسيطة المطلوبة لجعل جميع الاختبارات تنجح 100%.

---

## 🔧 الإصلاح 1: تحديث بنية Location في الاختبارات

### المشكلة

بعض الاختبارات تستخدم `location` كـ string بينما النموذج يتوقع object:

```javascript
// ❌ خطأ - يسبب ValidationError
location: fc.constant('Cairo, Egypt')

// ✅ صحيح - يعمل بشكل صحيح
location: fc.constant({ 
  type: 'Cairo, Egypt', 
  city: 'Cairo', 
  country: 'Egypt' 
})
```

### الملفات المتأثرة

1. `backend/tests/skills-logic.property.test.js`
2. `backend/tests/map-marker-completeness.property.test.js`
3. `backend/tests/geographic-boundary-filtering.property.test.js`
4. أي اختبار آخر يستخدم `jobPostingArbitrary`

### الحل

في كل ملف اختبار، ابحث عن:

```javascript
location: fc.oneof(
  fc.constant('Cairo, Egypt'),
  fc.constant('Alexandria, Egypt'),
  // ...
)
```

واستبدله بـ:

```javascript
location: fc.oneof(
  fc.constant({ type: 'Cairo, Egypt', city: 'Cairo', country: 'Egypt' }),
  fc.constant({ type: 'Alexandria, Egypt', city: 'Alexandria', country: 'Egypt' }),
  fc.constant({ type: 'Giza, Egypt', city: 'Giza', country: 'Egypt' }),
  fc.constant({ type: 'Mansoura, Egypt', city: 'Mansoura', country: 'Egypt' })
)
```

وأيضاً، عند التحقق من location في assertions:

```javascript
// ❌ خطأ
expect(job.location.toLowerCase()).toContain(filters.location.toLowerCase());

// ✅ صحيح
const locationStr = job.location.type || job.location.city || '';
expect(locationStr.toLowerCase()).toContain(filters.location.toLowerCase());
```

### الوقت المقدر: 30 دقيقة

---

## 🔧 الإصلاح 2: مشكلة passport.js

### المشكلة

بعض الاختبارات تفشل في التحميل بسبب warnings في `src/config/passport.js`:

```
Jest failed to parse a file...
at Object.warn (src/config/passport.js:178:11)
```

### الحل المقترح

1. **افتح ملف** `backend/src/config/passport.js`

2. **ابحث عن السطر 178** وما حوله

3. **تحقق من**:
   - هل هناك `console.warn()` أو `console.log()` غير ضرورية؟
   - هل هناك require() لملفات غير موجودة؟
   - هل هناك syntax errors؟

4. **الحل المؤقت**: إذا كانت المشكلة في warnings فقط، يمكن تعطيلها في jest.config.js:

```javascript
// jest.config.js
module.exports = {
  // ...
  silent: true, // تعطيل console.warn
  // أو
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};

// tests/setup.js
global.console = {
  ...console,
  warn: jest.fn(), // mock console.warn
};
```

### الوقت المقدر: 15 دقيقة

---

## 🔧 الإصلاح 3: MongoMemoryServer Timeout

### المشكلة

```
GenericMMSError: Instance failed to start within 10000ms
```

### الحل 1: زيادة Timeout

في ملفات الاختبار المتأثرة، أضف:

```javascript
beforeAll(async () => {
  // زيادة timeout إلى 60 ثانية
  jest.setTimeout(60000);
  
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/careerak_test';
  await mongoose.connect(mongoUri);
}, 60000); // timeout للـ beforeAll نفسه
```

### الحل 2: استخدام MongoDB حقيقي

في `.env.test`:

```env
MONGODB_URI_TEST=mongodb://localhost:27017/careerak_test
```

وفي الاختبارات:

```javascript
beforeAll(async () => {
  // استخدام MongoDB حقيقي بدلاً من MongoMemoryServer
  const mongoUri = process.env.MONGODB_URI_TEST;
  await mongoose.connect(mongoUri);
});
```

### الحل 3: تحسين إعدادات MongoMemoryServer

```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'careerak_test',
      storageEngine: 'wiredTiger'
    },
    binary: {
      version: '6.0.0', // استخدام إصدار محدد
      downloadDir: './mongodb-binaries' // تخزين محلي
    }
  });
  
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 60000);
```

### الوقت المقدر: 10 دقائق

---

## 🔧 الإصلاح 4: تحديث jest.config.js

لتحسين الأداء العام للاختبارات:

```javascript
// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  testTimeout: 60000, // زيادة timeout العام
  maxWorkers: 4, // تحديد عدد workers
  bail: false, // عدم التوقف عند أول فشل
  verbose: true,
  collectCoverage: false, // تعطيل coverage للسرعة
  
  // تجاهل ملفات معينة
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/'
  ],
  
  // إعدادات إضافية
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // تحسين الأداء
  maxConcurrency: 5,
  testSequencer: '<rootDir>/tests/sequencer.js' // اختياري
};
```

### الوقت المقدر: 5 دقائق

---

## ✅ خطوات التنفيذ

### الخطوة 1: إصلاح Location (30 دقيقة)

```bash
# 1. افتح الملفات المتأثرة
code backend/tests/skills-logic.property.test.js
code backend/tests/map-marker-completeness.property.test.js
code backend/tests/geographic-boundary-filtering.property.test.js

# 2. ابحث عن location: fc.constant('...')
# 3. استبدل بـ location: fc.constant({ type: '...', city: '...', country: '...' })
# 4. احفظ الملفات
```

### الخطوة 2: إصلاح passport.js (15 دقيقة)

```bash
# 1. افتح الملف
code backend/src/config/passport.js

# 2. ابحث عن السطر 178
# 3. أصلح المشكلة أو أضف mock في jest.config.js
# 4. احفظ
```

### الخطوة 3: إصلاح MongoMemoryServer (10 دقيقة)

```bash
# 1. افتح jest.config.js
code backend/jest.config.js

# 2. أضف testTimeout: 60000
# 3. احفظ

# أو استخدم MongoDB حقيقي
echo "MONGODB_URI_TEST=mongodb://localhost:27017/careerak_test" >> backend/.env.test
```

### الخطوة 4: تشغيل الاختبارات (5 دقائق)

```bash
cd backend

# اختبار واحد للتأكد
npm test -- skills-logic.property.test.js

# إذا نجح، شغّل الكل
npm test

# أو شغّل اختبارات البحث فقط
npm test -- --testPathPattern="advanced-search|alert|saved-search"
```

---

## 📊 التحقق من النجاح

بعد تطبيق الإصلاحات، يجب أن ترى:

```
Test Suites: X passed, X total
Tests:       Y passed, Y total
Snapshots:   0 total
Time:        Zs
```

حيث:
- X = عدد test suites (يجب أن تكون كلها passed)
- Y = عدد tests (يجب أن تكون كلها passed)
- Z = الوقت (يجب أن يكون معقول < 5 دقائق)

---

## 🆘 استكشاف الأخطاء

### إذا استمرت المشاكل

1. **تنظيف node_modules**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

2. **تنظيف MongoDB**:
```bash
# إذا كنت تستخدم MongoDB محلي
mongo
use careerak_test
db.dropDatabase()
exit
```

3. **تشغيل اختبار واحد بـ verbose**:
```bash
npm test -- skills-logic.property.test.js --verbose --detectOpenHandles
```

4. **فحص السجلات**:
```bash
# تشغيل مع سجلات كاملة
DEBUG=* npm test -- skills-logic.property.test.js
```

---

## 📝 ملاحظات مهمة

1. **لا تنسى**: بعد كل إصلاح، شغّل الاختبار للتأكد
2. **استخدم Git**: commit بعد كل إصلاح ناجح
3. **اختبر تدريجياً**: لا تصلح كل شيء مرة واحدة
4. **اقرأ الأخطاء**: رسائل الأخطاء تحتوي على معلومات مفيدة

---

**الوقت الإجمالي المقدر**: ~1 ساعة

**مستوى الصعوبة**: سهل - متوسط

**المهارات المطلوبة**: 
- JavaScript/Node.js
- Jest Testing
- MongoDB/Mongoose
- Fast-check (Property-based testing)

---

**تاريخ الإنشاء**: 2026-03-04  
**آخر تحديث**: 2026-03-04
