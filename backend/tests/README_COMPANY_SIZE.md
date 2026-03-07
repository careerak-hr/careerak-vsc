# اختبارات ميزة حجم الشركة

## 🧪 تشغيل الاختبارات

```bash
cd backend
npm test -- companySize.test.js
```

## 📊 الاختبارات المتاحة

### 1. Company Size Determination (3 اختبارات)
- ✅ تصنيف الشركات الصغيرة (< 50 موظف)
- ✅ تصنيف الشركات المتوسطة (50-500 موظف)
- ✅ تصنيف الشركات الكبيرة (> 500 موظف)

### 2. Company Size in Model (3 اختبارات)
- ✅ القيمة الافتراضية (small)
- ✅ قبول القيم الصحيحة فقط
- ✅ رفض القيم الخاطئة

### 3. Auto Size Determination (1 اختبار)
- ✅ تحديد تلقائي للحجم عند تحديث employeeCount

### 4. Company Size Display (1 اختبار)
- ✅ عرض الحجم في استجابة API

### 5. Size Index (1 اختبار)
- ✅ وجود index على حقل size

## ✅ النتيجة المتوقعة

```
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        ~4s
```

## 📝 ملاحظات

- جميع الاختبارات تستخدم قاعدة بيانات اختبار
- يتم تنظيف البيانات تلقائياً بعد الاختبارات
- الاختبارات مستقلة عن بعضها

## 🔗 ملفات ذات صلة

- `backend/src/models/CompanyInfo.js` - النموذج
- `backend/src/services/companyInfoService.js` - الخدمة
- `docs/COMPANY_SIZE_FEATURE.md` - التوثيق الكامل
