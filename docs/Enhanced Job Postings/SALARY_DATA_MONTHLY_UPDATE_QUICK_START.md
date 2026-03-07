# تحديث شهري لبيانات الرواتب - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. التشغيل اليدوي (دقيقة واحدة)

```bash
cd backend
npm run salary:update
```

**النتيجة المتوقعة**: ✅ تحديث ناجح مع إحصائيات

---

### 2. الجدولة التلقائية (3 دقائق)

#### الطريقة A: PM2 (موصى به)

```bash
# 1. تثبيت PM2 (إذا لم يكن مثبتاً)
npm install -g pm2

# 2. إضافة إلى ecosystem.config.js
{
  name: 'salary-updater',
  script: 'scripts/update-salary-data.js',
  cron_restart: '0 2 1 * *',  // اليوم الأول من كل شهر
  autorestart: false
}

# 3. تشغيل
pm2 start ecosystem.config.js --only salary-updater
pm2 save
```

#### الطريقة B: Cron (Linux/Mac)

```bash
# فتح crontab
crontab -e

# إضافة السطر التالي
0 2 1 * * cd /path/to/backend && npm run salary:update >> /var/log/salary-update.log 2>&1
```

---

### 3. التحقق من النتائج (دقيقة واحدة)

```bash
# عرض السجلات
tail -f backend/logs/combined.log

# التحقق من قاعدة البيانات
mongo
use careerak
db.salarydatas.find().limit(5).pretty()
```

---

## 📊 ماذا يفعل السكريبت؟

1. ✅ يجمع بيانات الرواتب من الوظائف النشطة
2. ✅ يحسب الإحصائيات (متوسط، وسيط، أدنى، أعلى)
3. ✅ يحدث قاعدة البيانات
4. ✅ يحذف البيانات القديمة (> 6 أشهر)
5. ✅ يعرض تقرير شامل

---

## 🔍 الاستخدام في الكود

### Backend - تقدير الراتب

```javascript
const salaryEstimatorService = require('./services/salaryEstimatorService');

// تقدير راتب وظيفة
const estimate = await salaryEstimatorService.estimateSalary(job);

console.log(estimate);
// {
//   provided: 7500,
//   market: { average: 8500, min: 8000, max: 9000 },
//   comparison: 'below',
//   percentageDiff: 12
// }
```

### Frontend - عرض المؤشر

```jsx
import SalaryIndicator from './components/SalaryIndicator';

<SalaryIndicator estimate={job.salaryEstimate} />
```

---

## 🐛 استكشاف الأخطاء السريع

### "No jobs found"
```bash
# تحقق من الوظائف النشطة
mongo careerak --eval "db.jobpostings.countDocuments({status: 'active', salary: {\$gt: 0}})"
```

### "Database connection failed"
```bash
# تحقق من .env
cat backend/.env | grep MONGODB_URI
```

### "Script takes too long"
```bash
# عادي إذا كان لديك > 10,000 وظيفة
# الحل: تشغيل في وقت منخفض الحركة
```

---

## 📈 مؤشرات النجاح

| المؤشر | الهدف | كيف تتحقق |
|--------|-------|-----------|
| وقت التنفيذ | < 5 دقائق | راقب السجلات |
| السجلات المحدثة | > 50 | `db.salarydatas.countDocuments()` |
| البيانات الحديثة | < 30 يوم | تحقق من `lastUpdated` |

---

## 🔗 روابط مفيدة

- 📄 [التوثيق الشامل](./SALARY_DATA_MONTHLY_UPDATE.md)
- 📄 [Salary Estimator Service](../../backend/src/services/salaryEstimatorService.js)
- 📄 [Update Script](../../backend/scripts/update-salary-data.js)

---

## 💡 نصائح سريعة

1. ✅ شغّل التحديث في وقت منخفض الحركة (2-4 صباحاً)
2. ✅ راقب السجلات بعد أول تحديث
3. ✅ اختبر على staging أولاً
4. ✅ احتفظ بنسخة احتياطية قبل التحديث
5. ✅ راجع الإحصائيات شهرياً

---

**تاريخ الإنشاء**: 2026-03-06  
**الحالة**: ✅ جاهز للاستخدام
