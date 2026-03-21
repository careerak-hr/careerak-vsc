# Badge "عاجل" للوظائف - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. تحديث الوظائف الموجودة (دقيقة واحدة)

```bash
cd backend
npm run urgent:update
```

### 2. إعداد التحديث التلقائي (دقيقتان)

**الخيار A: PM2 (موصى به)**
```bash
# إضافة إلى ecosystem.config.js
{
  name: 'urgent-jobs-updater',
  script: 'scripts/cron-update-urgent-jobs.js',
  cron_restart: '0 */6 * * *',
  autorestart: false
}

# تشغيل
pm2 start ecosystem.config.js --only urgent-jobs-updater
pm2 save
```

**الخيار B: Linux Cron**
```bash
crontab -e
# أضف:
0 */6 * * * cd /path/to/backend && npm run urgent:cron
```

### 3. اختبار الميزة (دقيقتان)

```bash
# تشغيل الاختبارات
npm test -- urgentJobs.test.js

# النتيجة المتوقعة: ✅ 12/12 نجحت
```

## 📊 كيف يعمل؟

```
expiryDate - today = daysRemaining

if (daysRemaining > 0 AND daysRemaining <= 7):
    isUrgent = true
    badge = "عاجل" (أحمر)
else:
    isUrgent = false
    badge = لا يظهر
```

## 🎨 المظهر

**Grid View**:
```
┌─────────────────────────┐
│ [عاجل] [جديد]          │
│ 🏢 مهندس Backend       │
│ شركة التقنية           │
│ ...                     │
└─────────────────────────┘
```

**List View**:
```
┌────────────────────────────────────────┐
│ 🏢  مهندس Backend  [عاجل] [جديد]     │
│     شركة التقنية                      │
│     ...                                │
└────────────────────────────────────────┘
```

## 🔧 الإعدادات

### إضافة expiryDate لوظيفة جديدة

```javascript
const job = new JobPosting({
  title: 'مهندس Backend',
  description: '...',
  requirements: '...',
  postedBy: userId,
  expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 أيام
});

await job.save();
// isUrgent سيكون true تلقائياً
```

### تحديث expiryDate لوظيفة موجودة

```javascript
const job = await JobPosting.findById(jobId);
job.expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 أيام
await job.save();
// isUrgent سيتم تحديثه تلقائياً
```

## 📱 Frontend

**استخدام في المكونات**:
```jsx
import { isUrgentJob } from '../utils/dateUtils';

function JobCard({ job }) {
  return (
    <div>
      {job.isUrgent && (
        <span className="badge badge-urgent">عاجل</span>
      )}
      {/* أو */}
      {isUrgentJob(job.expiryDate) && (
        <span className="badge badge-urgent">عاجل</span>
      )}
    </div>
  );
}
```

## 🐛 استكشاف الأخطاء السريع

| المشكلة | الحل |
|---------|------|
| Badge لا يظهر | `npm run urgent:update` |
| Badge خاطئ | `npm run urgent:cron` |
| Cron لا يعمل | `pm2 logs urgent-jobs-updater` |

## 📊 الإحصائيات

```bash
# عرض الوظائف العاجلة
npm run urgent:cron

# النتيجة:
# ✅ 12 وظيفة عاجلة حالياً
# ✅ 5 وظائف منتهية تم إغلاقها
# ✅ 150 وظيفة نشطة
```

## ✅ قائمة التحقق السريعة

- [ ] شغّل `npm run urgent:update`
- [ ] أعد PM2 أو Cron
- [ ] شغّل الاختبارات
- [ ] تحقق من Badge في Frontend
- [ ] راقب السجلات

## 📚 المزيد من المعلومات

📄 التوثيق الشامل: `docs/URGENT_JOBS_BADGE.md`

---

**وقت الإعداد الكلي**: 5 دقائق ⚡  
**الحالة**: ✅ جاهز للإنتاج
