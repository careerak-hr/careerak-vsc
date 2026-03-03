# Checkpoint 8: دليل البدء السريع

## 🚀 تشغيل الاختبارات (5 دقائق)

### 1. التحضير
```bash
cd backend
npm install
```

### 2. تشغيل الاختبارات
```bash
npm test -- checkpoint-8-recording-screenshare.test.js
```

### 3. النتيجة المتوقعة
```
✅ 16/16 اختبارات نجحت
معدل النجاح: 100%
```

---

## 📋 ما يتم اختباره

### 1. تسجيل المقابلات (6 اختبارات)
- ✅ إنشاء مقابلة مع تفعيل التسجيل
- ✅ طلب موافقة قبل التسجيل
- ✅ تسجيل موافقة المشارك
- ✅ بدء التسجيل بعد الموافقة
- ✅ إيقاف التسجيل
- ✅ حساب مدة التسجيل

### 2. مشاركة الشاشة (4 اختبارات)
- ✅ السماح بمشاركة الشاشة
- ✅ منع مشاركة ثانية
- ✅ إيقاف مشاركة الشاشة
- ✅ مشاركة جديدة بعد الإيقاف

### 3. معالجة التسجيلات (3 اختبارات)
- ✅ رفع للتخزين السحابي
- ✅ توليد رابط تحميل
- ✅ منع الوصول غير المصرح

### 4. الحذف التلقائي (2 اختبار)
- ✅ جدولة الحذف بعد 90 يوم
- ✅ حذف التسجيلات المنتهية

### 5. اختبارات التكامل (1 اختبار)
- ✅ سيناريو كامل متكامل

---

## 🔧 استكشاف الأخطاء

### "MongoDB connection failed"
```bash
# تحقق من .env
cat backend/.env | grep MONGODB_URI
```

### "Authentication failed"
```bash
# تحقق من JWT_SECRET
cat backend/.env | grep JWT_SECRET
```

### "Tests timeout"
```bash
# زيادة timeout
npm test -- checkpoint-8-recording-screenshare.test.js --testTimeout=30000
```

---

## 📊 التحقق اليدوي

### 1. اختبار التسجيل
```bash
# بدء التسجيل
curl -X POST http://localhost:5000/api/recordings/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interviewId": "INTERVIEW_ID"}'

# إيقاف التسجيل
curl -X POST http://localhost:5000/api/recordings/stop \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interviewId": "INTERVIEW_ID"}'
```

### 2. اختبار مشاركة الشاشة
```bash
# بدء المشاركة
curl -X POST http://localhost:5000/api/screen-share/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interviewId": "INTERVIEW_ID", "roomId": "ROOM_ID", "sourceType": "screen"}'

# إيقاف المشاركة
curl -X POST http://localhost:5000/api/screen-share/stop \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"interviewId": "INTERVIEW_ID", "roomId": "ROOM_ID"}'
```

---

## ✅ معايير النجاح

- [ ] جميع الاختبارات نجحت (16/16)
- [ ] لا توجد أخطاء في console
- [ ] التسجيل يبدأ ويتوقف بشكل صحيح
- [ ] مشاركة الشاشة تعمل بشكل حصري
- [ ] الموافقات تُسجل بشكل صحيح
- [ ] التسجيلات تُحذف تلقائياً بعد 90 يوم

---

## 📚 المراجع السريعة

- 📄 التقرير الشامل: `docs/Video Interviews/CHECKPOINT_8_RECORDING_SCREENSHARE_REPORT.md`
- 📄 الاختبارات: `backend/tests/checkpoint-8-recording-screenshare.test.js`
- 📄 API التسجيل: `backend/src/controllers/recordingController.js`
- 📄 API مشاركة الشاشة: `backend/src/controllers/screenShareController.js`

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
