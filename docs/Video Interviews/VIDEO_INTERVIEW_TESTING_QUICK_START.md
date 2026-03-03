# دليل البدء السريع - اختبارات نظام الفيديو
# Video Interview Testing Quick Start Guide

**الوقت المتوقع**: 5 دقائق ⏱️

---

## 🚀 البدء السريع

### 1. الإعداد (دقيقة واحدة)

```bash
# الانتقال لمجلد Backend
cd backend

# تثبيت التبعيات (إذا لم تكن مثبتة)
npm install

# إعداد متغيرات البيئة للاختبار
cp .env.example .env.test
```

### 2. تشغيل جميع الاختبارات (دقيقتان)

```bash
# تشغيل جميع الاختبارات
npm test

# النتيجة المتوقعة:
# ✓ 120+ tests passed
# ✓ 0 tests failed
# ✓ Coverage: 93%+
```

### 3. تشغيل اختبارات محددة (30 ثانية)

```bash
# اختبارات نظام الفيديو فقط
npm test -- --testPathPattern=video

# اختبارات التسجيل فقط
npm test -- recording.test.js

# اختبارات غرفة الانتظار فقط
npm test -- waitingRoom

# اختبارات E2E فقط
npm test -- e2e/videoInterview
```

---

## 📊 الاختبارات المتاحة

### Unit Tests (55+ اختبار)
```bash
# اختبارات التسجيل
npm test -- recording.test.js

# اختبارات مشاركة الشاشة
npm test -- screenShareService.test.js

# اختبارات خدمة التسجيل
npm test -- recordingService.test.js
```

### Integration Tests (36+ اختبار)
```bash
# اختبارات غرفة الانتظار
npm test -- waitingRoom.integration.test.js

# اختبارات المقابلات الجماعية
npm test -- groupVideoInterview.test.js

# اختبارات شاملة
npm test -- videoInterview.comprehensive.test.js
```

### E2E Tests (20+ سيناريو)
```bash
# جميع سيناريوهات E2E
npm test -- e2e/videoInterview.e2e.test.js
```

---

## 🎯 اختبارات سريعة حسب الميزة

### اختبار التسجيل
```bash
npm test -- recording
# ✓ بدء التسجيل
# ✓ إيقاف التسجيل
# ✓ موافقة التسجيل
# ✓ الحذف التلقائي
```

### اختبار غرفة الانتظار
```bash
npm test -- waitingRoom
# ✓ إنشاء غرفة انتظار
# ✓ انضمام مشارك
# ✓ قبول مشارك
# ✓ رفض مشارك
```

### اختبار المقابلات الجماعية
```bash
npm test -- groupVideoInterview
# ✓ دعم 10 مشاركين
# ✓ رفض المشارك الـ 11
# ✓ كتم الجميع
# ✓ إزالة مشارك
```

### اختبار مشاركة الشاشة
```bash
npm test -- screenShareService
# ✓ بدء مشاركة الشاشة
# ✓ إيقاف المشاركة
# ✓ حصرية المشاركة
# ✓ جودة 1080p
```

---

## 📈 تقرير التغطية

```bash
# تشغيل مع تقرير التغطية
npm test -- --coverage

# عرض التقرير في المتصفح
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

# أو استخدم MongoDB Atlas
# تحقق من MONGODB_TEST_URI في .env.test
```

**2. تحقق من المتغيرات**
```bash
# تأكد من وجود .env.test
cat .env.test

# يجب أن يحتوي على:
# MONGODB_TEST_URI=mongodb://localhost:27017/careerak-test
# JWT_SECRET=test-secret
```

**3. نظف قاعدة البيانات**
```bash
# احذف قاعدة بيانات الاختبار
mongo careerak-test --eval "db.dropDatabase()"

# أعد تشغيل الاختبارات
npm test
```

**4. أعد تثبيت التبعيات**
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

---

## 📝 كتابة اختبار جديد

### مثال سريع
```javascript
// backend/tests/myFeature.test.js
const request = require('supertest');
const app = require('../src/app');

describe('My Feature Tests', () => {
  test('should do something', async () => {
    const response = await request(app)
      .post('/api/my-endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### تشغيل الاختبار الجديد
```bash
npm test -- myFeature.test.js
```

---

## 🎯 اختبارات حسب المتطلب

### Requirements 1: مقابلات فيديو مباشرة
```bash
npm test -- connectionQuality
npm test -- latencyOptimization
```

### Requirements 2: تسجيل المقابلات
```bash
npm test -- recording
npm test -- recordingService
```

### Requirements 3: مشاركة الشاشة
```bash
npm test -- screenShareService
```

### Requirements 4: غرفة الانتظار
```bash
npm test -- waitingRoom
```

### Requirements 5: جدولة المقابلات
```bash
npm test -- videoInterviewReschedule
npm test -- videoInterviewEmail
npm test -- joinInterviewTiming
```

### Requirements 6: ميزات إضافية
```bash
npm test -- chatFileUpload
npm test -- groupVideoInterview
```

### Requirements 7: مقابلات جماعية
```bash
npm test -- groupVideoInterview
```

### Requirements 8: إدارة المقابلات
```bash
npm test -- interviewDashboard
npm test -- interviewNote
npm test -- videoInterviewSearch
```

---

## 🚦 CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
```

### Pre-commit Hook
```bash
# .husky/pre-commit
#!/bin/sh
npm test
```

---

## 📊 معايير النجاح

### يجب أن تنجح جميع الاختبارات
- ✅ 120+ اختبار
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

## 🎉 الخطوات التالية

بعد نجاح جميع الاختبارات:

1. ✅ راجع تقرير التغطية
2. ✅ أضف اختبارات لميزات جديدة
3. ✅ شغّل الاختبارات قبل كل commit
4. ✅ راقب الأداء بانتظام
5. ✅ حدّث الاختبارات مع التغييرات

---

## 📚 المراجع

- 📄 [VIDEO_INTERVIEW_TESTING_REPORT.md](./VIDEO_INTERVIEW_TESTING_REPORT.md) - تقرير شامل
- 📄 [requirements.md](../../.kiro/specs/video-interviews/requirements.md) - المتطلبات
- 📄 [design.md](../../.kiro/specs/video-interviews/design.md) - التصميم
- 📄 [tasks.md](../../.kiro/specs/video-interviews/tasks.md) - المهام

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
