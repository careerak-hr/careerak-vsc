# Recording Cleanup Cron Job

## 🎯 الغرض

Cron Job للحذف التلقائي لتسجيلات المقابلات المنتهية الصلاحية.

## ⏰ الجدولة

- **يومياً**: 2:00 صباحاً - حذف التسجيلات المنتهية
- **أسبوعياً**: الأحد 10:00 صباحاً - تنبيه للتسجيلات التي ستنتهي خلال 7 أيام

## 🚀 الاستخدام

### بدء Cron Job

```javascript
const recordingCleanupCron = require('./jobs/recordingCleanupCron');

// بدء التشغيل
recordingCleanupCron.start();
```

### إيقاف Cron Job

```javascript
recordingCleanupCron.stop();
```

### تشغيل يدوي

```javascript
await recordingCleanupCron.runManually();
```

### الحصول على الإحصائيات

```javascript
const stats = recordingCleanupCron.getStats();
console.log(stats);
```

## 📊 الإحصائيات

```javascript
{
  totalRuns: 45,           // عدد مرات التشغيل الكلي
  totalDeleted: 120,       // عدد التسجيلات المحذوفة الكلي
  totalErrors: 2,          // عدد الأخطاء الكلي
  isRunning: false,        // هل يعمل الآن؟
  lastRun: Date,           // آخر تشغيل
  lastRunStats: {
    timestamp: Date,       // وقت آخر تشغيل
    duration: 5432,        // المدة بالميلي ثانية
    found: 10,             // عدد التسجيلات المنتهية
    deleted: 10,           // عدد التسجيلات المحذوفة
    errors: 0              // عدد الأخطاء
  }
}
```

## 🔧 التخصيص

### تغيير التوقيت

```javascript
// في recordingCleanupCron.js

// يومياً في 3:00 صباحاً بدلاً من 2:00
this.dailyJob = cron.schedule('0 3 * * *', async () => {
  await this.cleanup();
});

// كل 6 ساعات
this.dailyJob = cron.schedule('0 */6 * * *', async () => {
  await this.cleanup();
});
```

### تغيير فترة التنبيه

```javascript
// تنبيه للتسجيلات التي ستنتهي خلال 14 يوم بدلاً من 7
await this.notifyExpiringSoon(14);
```

## 🧪 الاختبار

```javascript
// اختبار التشغيل اليدوي
await recordingCleanupCron.runManually();

// التحقق من النتائج
const stats = recordingCleanupCron.getStats();
console.log('Deleted:', stats.lastRunStats.deleted);
console.log('Errors:', stats.lastRunStats.errors);
```

## ⚠️ ملاحظات مهمة

1. يجب أن يكون Cloudinary مكوناً بشكل صحيح
2. يحذف الملفات من Cloudinary أولاً ثم يحدث قاعدة البيانات
3. الحذف نهائي ولا يمكن التراجع عنه
4. يسجل جميع العمليات في logs
5. يعمل بشكل غير متزامن (non-blocking)

## 📚 الموارد

- [التوثيق الكامل](../../../docs/VIDEO_INTERVIEWS_AUTO_DELETE.md)
- [دليل البدء السريع](../../../docs/VIDEO_INTERVIEWS_AUTO_DELETE_QUICK_START.md)
