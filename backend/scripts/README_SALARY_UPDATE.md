# سكريبت تحديث بيانات الرواتب الشهري

## 📋 نظرة عامة

سكريبت تلقائي لتحديث بيانات الرواتب شهرياً من الوظائف النشطة.

---

## 🚀 الاستخدام

### تشغيل يدوي

```bash
# من مجلد backend
npm run salary:update

# أو مباشرة
node scripts/update-salary-data.js
```

---

## 📊 ماذا يفعل؟

1. يتصل بقاعدة البيانات
2. يجلب جميع الوظائف النشطة التي لديها راتب
3. يجمع الوظائف حسب: العنوان، المجال، الموقع، الخبرة
4. يحسب الإحصائيات لكل مجموعة
5. يحدث أو ينشئ سجلات SalaryData
6. يحذف البيانات القديمة (> 6 أشهر)
7. يعرض تقرير شامل

---

## 📈 النتيجة المتوقعة

```
[INFO] Connecting to database...
[INFO] Connected to database successfully
[INFO] Starting salary data update...
[INFO] Found 1250 jobs with salary information
[INFO] Created 85 salary groups
[INFO] Salary data update completed: 12 created, 73 updated
[INFO] Cleaning up old salary data...
[INFO] Deleted 5 old records
[INFO] Getting salary statistics...
[INFO] Total salary records: 85
[INFO] Top 5 fields by salary data:
  1. Software Development: 25 records, avg salary: 8500 SAR
  2. Marketing: 18 records, avg salary: 6200 SAR
  3. Sales: 15 records, avg salary: 5800 SAR
  4. Design: 12 records, avg salary: 7000 SAR
  5. HR: 10 records, avg salary: 5500 SAR
[INFO] ✅ Salary data update completed successfully
```

---

## ⏰ الجدولة التلقائية

### PM2 (موصى به)

```javascript
// في ecosystem.config.js
{
  name: 'salary-updater',
  script: 'scripts/update-salary-data.js',
  cron_restart: '0 2 1 * *',  // اليوم الأول من كل شهر الساعة 2 صباحاً
  autorestart: false
}
```

### Cron (Linux/Mac)

```bash
# في crontab
0 2 1 * * cd /path/to/backend && npm run salary:update >> /var/log/salary-update.log 2>&1
```

---

## 🔧 المتطلبات

- Node.js >= 14
- MongoDB متصل
- متغيرات البيئة:
  - `MONGODB_URI`

---

## 📝 الملفات ذات الصلة

- `src/models/SalaryData.js` - نموذج البيانات
- `src/services/salaryEstimatorService.js` - خدمة التقدير
- `docs/Enhanced Job Postings/SALARY_DATA_MONTHLY_UPDATE.md` - التوثيق الشامل

---

## 🐛 استكشاف الأخطاء

### "No jobs found"
- تحقق من وجود وظائف نشطة لديها راتب
- `db.jobpostings.countDocuments({status: 'active', salary: {$gt: 0}})`

### "Database connection failed"
- تحقق من `MONGODB_URI` في `.env`
- تأكد من أن MongoDB يعمل

### "Script takes too long"
- عادي إذا كان لديك > 10,000 وظيفة
- شغّل في وقت منخفض الحركة

---

**تاريخ الإنشاء**: 2026-03-06  
**الحالة**: ✅ جاهز للاستخدام
