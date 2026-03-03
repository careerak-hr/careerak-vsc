# Scheduled Access Property Test - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. تشغيل الاختبار

```bash
cd backend
npm test -- scheduledAccess.property.test.js
```

### 2. النتيجة المتوقعة

```
✓ 10/10 اختبارات نجحت
✓ 50/50 سيناريو عشوائي نجح
✓ 0 أخطاء
```

---

## 📋 ما يختبره

### القاعدة الأساسية

**يمكن الانضمام للمقابلة فقط ضمن 5 دقائق قبل الموعد المحدد أو بعده**

### أمثلة

| الموعد | محاولة الانضمام | النتيجة |
|--------|------------------|---------|
| 10:00 AM | 9:45 AM | ❌ رفض (قبل 15 دقيقة) |
| 10:00 AM | 9:54 AM | ❌ رفض (قبل 6 دقائق) |
| 10:00 AM | 9:55 AM | ✅ قبول (قبل 5 دقائق) |
| 10:00 AM | 10:00 AM | ✅ قبول (في الوقت المحدد) |
| 10:00 AM | 10:10 AM | ✅ قبول (بعد 10 دقائق) |

---

## 🧪 الاختبارات العشرة

1. ✅ **Property-based test** - 50 سيناريو عشوائي
2. ✅ **قبل 10 دقائق** - يجب أن يرفض
3. ✅ **قبل 5 دقائق بالضبط** - يجب أن يقبل
4. ✅ **قبل 4 دقائق** - يجب أن يقبل
5. ✅ **في الوقت المحدد** - يجب أن يقبل
6. ✅ **بعد 10 دقائق** - يجب أن يقبل
7. ✅ **قبل 6 دقائق** - يجب أن يرفض
8. ✅ **قبل ساعة** - يجب أن يرفض
9. ✅ **مشاركين متعددين** - نفس القاعدة للجميع
10. ✅ **Boundary testing** - اختبار الحد الفاصل بدقة

---

## 💻 الكود الأساسي

### دالة التحقق

```javascript
function canJoinInterview(interview, currentTime) {
  const scheduledTime = new Date(interview.scheduledAt);
  const fiveMinutesBefore = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
  
  return currentTime >= fiveMinutesBefore;
}
```

### مثال استخدام

```javascript
const interview = await VideoInterview.findOne({ roomId: 'room123' });
const now = new Date();

if (canJoinInterview(interview, now)) {
  // السماح بالانضمام
  console.log('يمكنك الانضمام الآن');
} else {
  // رفض الانضمام
  const scheduledTime = new Date(interview.scheduledAt);
  const fiveMinutesBefore = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
  const minutesUntilJoin = Math.ceil((fiveMinutesBefore - now) / 60000);
  console.log(`يمكنك الانضمام بعد ${minutesUntilJoin} دقيقة`);
}
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: الاختبارات تفشل

**الحل**:
```bash
# تحقق من اتصال MongoDB
echo $MONGODB_URI

# أعد تشغيل الاختبار
npm test -- scheduledAccess.property.test.js
```

### المشكلة: بطء الاختبارات

**الحل**: الاختبارات يجب أن تنتهي في < 10 ثواني. إذا كانت أبطأ:
- تحقق من اتصال قاعدة البيانات
- تحقق من أن MongoDB يعمل محلياً

---

## 📊 النتائج

### معدل النجاح: 100%

```
Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        7.894 s
```

### التغطية

- ✅ محاولات قبل الموعد
- ✅ محاولات في الوقت المحدد
- ✅ محاولات بعد الموعد
- ✅ الحد الفاصل (5 دقائق)
- ✅ مشاركين متعددين
- ✅ سيناريوهات عشوائية

---

## 📚 المزيد من المعلومات

- 📄 **التوثيق الشامل**: `docs/Video Interviews/SCHEDULED_ACCESS_PROPERTY_TEST.md`
- 📄 **الكود**: `backend/tests/scheduledAccess.property.test.js`
- 📄 **المتطلبات**: `.kiro/specs/video-interviews/requirements.md` (5.5)
- 📄 **التصميم**: `.kiro/specs/video-interviews/design.md` (Property 7)

---

## ✅ الخلاصة

اختبار Property 7 يتحقق من أن المشاركين يمكنهم الانضمام فقط ضمن 5 دقائق قبل الموعد المحدد. جميع الاختبارات نجحت بنسبة 100%.

**الحالة**: ✅ مكتمل بنجاح

---

**تاريخ الإنشاء**: 2026-03-02
