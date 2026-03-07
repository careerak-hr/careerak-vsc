# Enhanced Job Postings - Tests

اختبارات شاملة لميزات تحسينات صفحة الوظائف.

## 📋 نظرة عامة

هذا المجلد يحتوي على اختبارات Unit و Integration لجميع ميزات تحسينات صفحة الوظائف:

- ✅ نظام الحفظ (Bookmarks)
- ✅ نظام المشاركة (Share)
- ✅ الوظائف المشابهة (Similar Jobs)
- ✅ تقدير الراتب (Salary Estimation)
- ✅ اختبارات التكامل الشاملة

## 📁 هيكل الملفات

```
enhanced-job-postings/
├── bookmark.test.js           # اختبارات نظام الحفظ (11 tests)
├── share.test.js              # اختبارات نظام المشاركة (13 tests)
├── similarJobs.test.js        # اختبارات الوظائف المشابهة (12 tests)
├── salaryEstimation.test.js   # اختبارات تقدير الراتب (11 tests)
├── integration.test.js        # اختبارات التكامل (8 tests)
└── README.md                  # هذا الملف
```

## 🧪 الاختبارات

### 1. Bookmark Tests (11 tests)
- ✅ حفظ وظيفة بنجاح
- ✅ إزالة وظيفة من المحفوظات
- ✅ فرض التفرد (bookmark uniqueness)
- ✅ جلب الوظائف المحفوظة
- ✅ تصفية الوظائف غير النشطة
- ✅ اتساق عداد الحفظ (bookmarkCount consistency)
- ✅ المصادقة والأمان

### 2. Share Tests (13 tests)
- ✅ تتبع المشاركة على جميع المنصات (WhatsApp, LinkedIn, Twitter, Facebook, Copy)
- ✅ التحقق من صحة المنصة
- ✅ دقة عداد المشاركة (shareCount accuracy)
- ✅ تتبع المشاركات من مستخدمين متعددين
- ✅ تحليلات المشاركة
- ✅ المصادقة والأمان

### 3. Similar Jobs Tests (12 tests)
- ✅ إرجاع وظائف مشابهة
- ✅ الحد الأقصى 6 وظائف
- ✅ نسبة التشابه >= 40%
- ✅ الأولوية للمجال نفسه
- ✅ الأولوية للمهارات المشتركة
- ✅ الترتيب حسب نسبة التشابه
- ✅ استبعاد الوظيفة المرجعية
- ✅ فقط الوظائف النشطة
- ✅ خوارزمية التشابه
- ✅ اعتبار الموقع

### 4. Salary Estimation Tests (11 tests)
- ✅ إرجاع تقدير الراتب
- ✅ حساب "below" بشكل صحيح
- ✅ حساب "average" بشكل صحيح
- ✅ حساب "above" بشكل صحيح
- ✅ حساب النسبة المئوية بدقة
- ✅ إرجاع إحصائيات السوق
- ✅ null عند بيانات غير كافية
- ✅ منطق المقارنة
- ✅ متطلبات البيانات (5+ نقاط)

### 5. Integration Tests (8 tests)
- ✅ رحلة المستخدم الكاملة
- ✅ اتساق البيانات
- ✅ صلة الوظائف المشابهة
- ✅ دقة تقدير الراتب
- ✅ الأداء (< 2 ثواني)
- ✅ معالجة الأخطاء
- ✅ المصادقة المطلوبة

## 🚀 تشغيل الاختبارات

### جميع الاختبارات
```bash
cd backend
npm test -- enhanced-job-postings
```

### اختبار محدد
```bash
# Bookmark tests
npm test -- enhanced-job-postings/bookmark.test.js

# Share tests
npm test -- enhanced-job-postings/share.test.js

# Similar Jobs tests
npm test -- enhanced-job-postings/similarJobs.test.js

# Salary Estimation tests
npm test -- enhanced-job-postings/salaryEstimation.test.js

# Integration tests
npm test -- enhanced-job-postings/integration.test.js
```

### مع التغطية (Coverage)
```bash
npm test -- enhanced-job-postings --coverage
```

### وضع المراقبة (Watch Mode)
```bash
npm test -- enhanced-job-postings --watch
```

## 📊 التغطية المتوقعة

| المكون | التغطية المستهدفة |
|--------|-------------------|
| Bookmark Service | 95%+ |
| Share Service | 95%+ |
| Similar Jobs Engine | 90%+ |
| Salary Estimator | 90%+ |
| Integration | 85%+ |

## ✅ معايير النجاح

- ✅ جميع الاختبارات تنجح (55/55)
- ✅ التغطية > 90%
- ✅ لا تحذيرات أو أخطاء
- ✅ الأداء < 2 ثواني لكل endpoint
- ✅ معالجة الأخطاء شاملة

## 🔧 المتطلبات

- Node.js >= 14
- MongoDB (للاختبارات)
- Jest (test runner)
- Supertest (HTTP testing)

## 📝 ملاحظات مهمة

1. **قاعدة البيانات**: الاختبارات تستخدم قاعدة بيانات اختبار منفصلة
2. **التنظيف**: يتم تنظيف البيانات تلقائياً بعد كل اختبار
3. **المصادقة**: جميع الاختبارات تستخدم مستخدم اختبار
4. **العزل**: كل اختبار معزول ولا يؤثر على الآخرين

## 🐛 استكشاف الأخطاء

### الاختبارات تفشل؟
```bash
# تحقق من اتصال MongoDB
echo $MONGODB_URI

# تحقق من تثبيت التبعيات
npm install

# شغّل اختبار واحد للتشخيص
npm test -- enhanced-job-postings/bookmark.test.js --verbose
```

### بطء الاختبارات؟
```bash
# شغّل بالتوازي
npm test -- enhanced-job-postings --maxWorkers=4

# أو قلل عدد الاختبارات
npm test -- enhanced-job-postings/bookmark.test.js
```

## 📚 المراجع

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)

## 🎯 الخطوات التالية

1. ✅ تشغيل جميع الاختبارات
2. ✅ التحقق من التغطية
3. ✅ إصلاح أي اختبارات فاشلة
4. ✅ إضافة اختبارات إضافية إذا لزم الأمر
5. ✅ دمج في CI/CD pipeline

---

**تاريخ الإنشاء**: 2026-03-07  
**آخر تحديث**: 2026-03-07  
**الحالة**: ✅ مكتمل
