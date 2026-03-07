# دليل البدء السريع - الاختبارات

دليل سريع لتشغيل اختبارات تحسينات صفحة الوظائف.

## ⚡ البدء السريع (5 دقائق)

### 1. Backend Tests
```bash
cd backend
npm install
npm test -- enhanced-job-postings
```

### 2. Frontend Tests
```bash
cd frontend
npm install
npm test -- enhanced-job-postings
```

---

## 📊 النتائج المتوقعة

### Backend (55 tests)
```
✓ bookmark.test.js (11 tests)
✓ share.test.js (13 tests)
✓ similarJobs.test.js (12 tests)
✓ salaryEstimation.test.js (11 tests)
✓ integration.test.js (8 tests)

Test Suites: 5 passed, 5 total
Tests:       55 passed, 55 total
Time:        ~30s
```

### Frontend (46 tests)
```
✓ ViewToggle.test.jsx (15 tests)
✓ BookmarkButton.test.jsx (15 tests)
✓ ShareButton.test.jsx (16 tests)

Test Suites: 3 passed, 3 total
Tests:       46 passed, 46 total
Time:        ~15s
```

---

## 🎯 اختبارات محددة

### Backend

**Bookmark Tests**:
```bash
npm test -- bookmark.test.js
```

**Share Tests**:
```bash
npm test -- share.test.js
```

**Similar Jobs Tests**:
```bash
npm test -- similarJobs.test.js
```

**Salary Estimation Tests**:
```bash
npm test -- salaryEstimation.test.js
```

**Integration Tests**:
```bash
npm test -- integration.test.js
```

### Frontend

**View Toggle Tests**:
```bash
npm test -- ViewToggle.test.jsx
```

**Bookmark Button Tests**:
```bash
npm test -- BookmarkButton.test.jsx
```

**Share Button Tests**:
```bash
npm test -- ShareButton.test.jsx
```

---

## 📈 التغطية (Coverage)

### Backend
```bash
cd backend
npm test -- enhanced-job-postings --coverage
```

**النتيجة المتوقعة**: > 90% تغطية

### Frontend
```bash
cd frontend
npm test -- enhanced-job-postings --coverage
```

**النتيجة المتوقعة**: > 95% تغطية

---

## 🔍 وضع المراقبة (Watch Mode)

### Backend
```bash
npm test -- enhanced-job-postings --watch
```

### Frontend
```bash
npm test -- enhanced-job-postings --watch
```

---

## 🐛 استكشاف الأخطاء

### الاختبارات تفشل؟

**1. تحقق من MongoDB**:
```bash
# Backend
echo $MONGODB_URI
```

**2. تحقق من التبعيات**:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

**3. شغّل اختبار واحد للتشخيص**:
```bash
# Backend
npm test -- bookmark.test.js --verbose

# Frontend
npm test -- ViewToggle.test.jsx --verbose
```

### بطء الاختبارات؟

**Backend - تشغيل بالتوازي**:
```bash
npm test -- enhanced-job-postings --maxWorkers=4
```

**Frontend - تشغيل بالتوازي**:
```bash
npm test -- enhanced-job-postings --maxWorkers=4
```

---

## ✅ Checklist قبل النشر

- [ ] جميع اختبارات Backend تنجح (55/55)
- [ ] جميع اختبارات Frontend تنجح (46/46)
- [ ] التغطية > 90%
- [ ] لا تحذيرات أو أخطاء
- [ ] الأداء < 2 ثواني
- [ ] Accessibility tests تنجح

---

## 📚 التوثيق الكامل

- 📄 [Backend Tests README](../../backend/tests/enhanced-job-postings/README.md)
- 📄 [Frontend Tests README](../../frontend/src/tests/enhanced-job-postings/README.md)
- 📄 [Testing Report](./TESTING_REPORT.md)

---

## 🎯 الأوامر الأساسية

```bash
# Backend - جميع الاختبارات
cd backend && npm test -- enhanced-job-postings

# Frontend - جميع الاختبارات
cd frontend && npm test -- enhanced-job-postings

# Backend - مع التغطية
cd backend && npm test -- enhanced-job-postings --coverage

# Frontend - مع التغطية
cd frontend && npm test -- enhanced-job-postings --coverage

# Backend - وضع المراقبة
cd backend && npm test -- enhanced-job-postings --watch

# Frontend - وضع المراقبة
cd frontend && npm test -- enhanced-job-postings --watch
```

---

**الوقت المتوقع**: 5 دقائق للإعداد + 1 دقيقة للتشغيل  
**معدل النجاح المتوقع**: 100% (101/101)  
**الحالة**: ✅ جاهز للتشغيل
