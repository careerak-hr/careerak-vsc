# اختبارات نظام الفيديو للمقابلات
# Video Interview System Tests

هذا الدليل يشرح جميع الاختبارات المتاحة لنظام الفيديو للمقابلات.

---

## 📁 هيكل الاختبارات

```
backend/tests/
├── unit/                                    # اختبارات الوحدات
├── integration/                             # اختبارات التكامل
├── property/                                # اختبارات الخصائص (Property-Based)
│   ├── webrtc-connection-establishment.property.test.js  # 5 اختبارات
│   └── webrtc-video-quality.property.test.js             # 7 اختبارات
├── e2e/                                     # اختبارات E2E
│   └── videoInterview.e2e.test.js          # سيناريوهات كاملة
├── recording.test.js                        # اختبارات التسجيل
├── recordingService.test.js                 # اختبارات خدمة التسجيل
├── screenShareService.test.js               # اختبارات مشاركة الشاشة
├── waitingRoom.integration.test.js          # اختبارات غرفة الانتظار
├── groupVideoInterview.test.js              # اختبارات المقابلات الجماعية
├── videoInterview.comprehensive.test.js     # اختبارات شاملة
├── videoInterviewSearch.test.js             # اختبارات البحث
├── videoInterviewReschedule.test.js         # اختبارات إعادة الجدولة
├── videoInterviewEmail.test.js              # اختبارات البريد
├── joinInterviewTiming.test.js              # اختبارات التوقيت
├── interviewDashboard.test.js               # اختبارات لوحة التحكم
├── interviewNote.test.js                    # اختبارات الملاحظات
├── connectionQuality.test.js                # اختبارات جودة الاتصال
├── latencyOptimization.test.js              # اختبارات تحسين الـ latency
└── chatFileUpload.test.js                   # اختبارات رفع الملفات
```

---

## 🚀 تشغيل الاختبارات

### جميع اختبارات نظام الفيديو
```bash
npm run test:video
```

### اختبارات Unit فقط
```bash
npm run test:video:unit
```

### اختبارات Integration فقط
```bash
npm run test:video:integration
```

### اختبارات E2E فقط
```bash
npm run test:video:e2e
```

### جميع الاختبارات مع التغطية
```bash
npm run test:video:coverage
```

### اختبار ملف محدد
```bash
npm test -- recording.test.js
npm test -- waitingRoom.integration.test.js
npm test -- e2e/videoInterview.e2e.test.js
```

---

## 📊 الاختبارات المتاحة

### 0. Property-Based Tests (12 اختبار) - جديد ✨

#### webrtc-connection-establishment.property.test.js (5 اختبارات)
- ✅ Connection establishment time < 5 seconds
- ✅ Connection success rate = 100%
- ✅ Connection establishment is idempotent
- ✅ Connection is symmetric
- ✅ Connection transitivity in mesh network

#### webrtc-video-quality.property.test.js (7 اختبارات)
- ✅ Minimum video resolution >= 720p
- ✅ Frame rate >= 24 fps
- ✅ Bitrate adapts to network conditions
- ✅ Graceful degradation with poor network
- ✅ Audio-video sync offset < 100ms
- ✅ Quality consistency over time
- ✅ Multi-participant quality distribution

### 1. Unit Tests (55+ اختبار)

#### recording.test.js (15 اختبار)
- ✅ بدء التسجيل بنجاح
- ✅ فشل بدون موافقة
- ✅ فشل إذا لم يكن المستخدم مضيف
- ✅ فشل إذا التسجيل معطل
- ✅ إيقاف التسجيل بنجاح
- ✅ جدولة الحذف التلقائي
- ✅ حذف التسجيل
- ✅ التحقق من الوصول للتسجيل
- ✅ حذف التسجيلات المنتهية
- ✅ جلب التسجيلات القريبة من الانتهاء

#### screenShareService.test.js (12 اختبار)
- ✅ التحقق من مشاركة نشطة
- ✅ جلب معلومات المشاركة
- ✅ إيقاف مشاركة الشاشة
- ✅ معالجة انتهاء المشاركة
- ✅ بناء constraints
- ✅ تحديد نوع المشاركة
- ✅ جلب إحصائيات المشاركة
- ✅ تنظيف جميع المشاركات

#### recordingService.test.js (10 اختبارات)
- ✅ بدء التسجيل
- ✅ إيقاف التسجيل
- ✅ معالجة التسجيل
- ✅ توليد صورة مصغرة
- ✅ جدولة الحذف
- ✅ حذف التسجيل
- ✅ التحقق من الوصول

### 2. Integration Tests (36+ اختبار)

#### waitingRoom.integration.test.js (10 اختبارات)
- ✅ إنشاء غرفة انتظار
- ✅ انضمام مشارك
- ✅ قبول مشارك
- ✅ رفض مشارك
- ✅ قائمة المنتظرين
- ✅ معلومات غرفة الانتظار
- ✅ تحديث رسالة الترحيب
- ✅ مغادرة غرفة الانتظار
- ✅ حذف غرفة الانتظار
- ✅ إدارة عدة مشاركين

#### groupVideoInterview.test.js (10 اختبارات)
- ✅ دعم حتى 10 مشاركين
- ✅ رفض المشارك الـ 11
- ✅ عرض شبكي
- ✅ كتم الجميع (للمضيف)
- ✅ رفض كتم الجميع من غير المضيف
- ✅ إزالة مشارك (للمضيف)
- ✅ رفض إزالة من غير المضيف
- ✅ تتبع حالة الصوت والفيديو
- ✅ تتبع مشاركة الشاشة
- ✅ إحصائيات الغرفة

#### videoInterview.comprehensive.test.js (25+ اختبار)
- ✅ إنشاء مقابلة
- ✅ التحقق من الحقول المطلوبة
- ✅ رفض إعدادات غير صحيحة
- ✅ التدفق الكامل للمقابلة
- ✅ إدارة مشاركين متعددين
- ✅ رفض عند امتلاء الغرفة
- ✅ التسجيل مع الحذف التلقائي
- ✅ اختبارات الأداء
- ✅ اختبارات الأمان

### 3. E2E Tests (20+ سيناريو)

#### e2e/videoInterview.e2e.test.js (7 سيناريوهات)
1. ✅ مقابلة ثنائية بسيطة
2. ✅ مقابلة مع غرفة انتظار
3. ✅ مقابلة مع تسجيل
4. ✅ مقابلة جماعية
5. ✅ إعادة جدولة المقابلة
6. ✅ إضافة ملاحظات وتقييم
7. ✅ البحث والفلترة

---

## 🎯 اختبارات حسب المتطلب

### Requirements 1: مقابلات فيديو مباشرة
```bash
npm test -- connectionQuality.test.js
npm test -- latencyOptimization.test.js

# Property-Based Tests (جديد)
npm test -- property/webrtc-connection-establishment.property.test.js
npm test -- property/webrtc-video-quality.property.test.js
```

### Requirements 2: تسجيل المقابلات
```bash
npm test -- recording.test.js
npm test -- recordingService.test.js
```

### Requirements 3: مشاركة الشاشة
```bash
npm test -- screenShareService.test.js
```

### Requirements 4: غرفة الانتظار
```bash
npm test -- waitingRoom.integration.test.js
```

### Requirements 5: جدولة المقابلات
```bash
npm test -- videoInterviewReschedule.test.js
npm test -- videoInterviewEmail.test.js
npm test -- joinInterviewTiming.test.js
```

### Requirements 6: ميزات إضافية
```bash
npm test -- chatFileUpload.test.js
```

### Requirements 7: مقابلات جماعية
```bash
npm test -- groupVideoInterview.test.js
```

### Requirements 8: إدارة المقابلات
```bash
npm test -- interviewDashboard.test.js
npm test -- interviewNote.test.js
npm test -- videoInterviewSearch.test.js
```

---

## 📈 تقرير التغطية

```bash
# تشغيل مع تقرير التغطية
npm run test:video:coverage

# عرض التقرير
open coverage/lcov-report/index.html
```

**التغطية المتوقعة**:
- Services: 95%+
- Controllers: 90%+
- Models: 100%
- Routes: 95%+
- الإجمالي: 93%+

---

## 🔍 اختبارات محددة

### اختبار ميزة واحدة
```bash
# اختبار إنشاء مقابلة فقط
npm test -- -t "should create a video interview"

# اختبار بدء التسجيل فقط
npm test -- -t "should start recording"

# اختبار قبول مشارك فقط
npm test -- -t "should allow host to admit"
```

### اختبار بنمط معين
```bash
# جميع اختبارات "should reject"
npm test -- -t "should reject"

# جميع اختبارات "should fail"
npm test -- -t "should fail"

# جميع اختبارات "should allow"
npm test -- -t "should allow"
```

---

## 🐛 استكشاف الأخطاء

### الاختبارات تفشل؟

**1. تحقق من قاعدة البيانات**
```bash
# تأكد من تشغيل MongoDB
mongod --version

# تحقق من MONGODB_TEST_URI في .env.test
cat .env.test | grep MONGODB_TEST_URI
```

**2. نظف قاعدة البيانات**
```bash
# احذف قاعدة بيانات الاختبار
mongo careerak-test --eval "db.dropDatabase()"

# أعد تشغيل الاختبارات
npm test
```

**3. أعد تثبيت التبعيات**
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

---

## 📝 كتابة اختبار جديد

### مثال Unit Test
```javascript
// tests/myFeature.test.js
describe('My Feature', () => {
  test('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### مثال Integration Test
```javascript
// tests/integration/myFeature.integration.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('My Feature Integration', () => {
  test('should integrate with API', async () => {
    const response = await request(app)
      .post('/api/my-endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
  });
});
```

### مثال E2E Test
```javascript
// tests/e2e/myFeature.e2e.test.js
describe('E2E: My Feature', () => {
  test('should complete full user journey', async () => {
    // 1. إنشاء
    // 2. تعديل
    // 3. حذف
    // 4. التحقق
  });
});
```

---

## 🎯 معايير النجاح

### يجب أن تنجح جميع الاختبارات
- ✅ 132+ اختبار (120 سابق + 12 property tests جديد)
- ✅ 0 فشل
- ✅ 93%+ تغطية

### معايير الأداء
- ✅ إنشاء مقابلة < 1s
- ✅ انضمام مشارك < 500ms
- ✅ بدء تسجيل < 2s

### معايير الأمان
- ✅ جميع اختبارات الصلاحيات تنجح
- ✅ جميع اختبارات JWT تنجح
- ✅ جميع اختبارات الحماية تنجح

---

## 📚 المراجع

- 📄 [VIDEO_INTERVIEW_TESTING_REPORT.md](../../docs/Video%20Interviews/VIDEO_INTERVIEW_TESTING_REPORT.md)
- 📄 [VIDEO_INTERVIEW_TESTING_QUICK_START.md](../../docs/Video%20Interviews/VIDEO_INTERVIEW_TESTING_QUICK_START.md)
- 📄 [WEBRTC_PROPERTY_TESTS.md](../../docs/Video%20Interviews/WEBRTC_PROPERTY_TESTS.md) - جديد ✨
- 📄 [WEBRTC_PROPERTY_TESTS_QUICK_START.md](../../docs/Video%20Interviews/WEBRTC_PROPERTY_TESTS_QUICK_START.md) - جديد ✨
- 📄 [requirements.md](../../.kiro/specs/video-interviews/requirements.md)
- 📄 [design.md](../../.kiro/specs/video-interviews/design.md)

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
