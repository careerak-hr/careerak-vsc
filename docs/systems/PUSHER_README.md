# 🚀 Pusher - دليل الاختبار السريع

## ✅ الإعداد مكتمل!

تم دمج Pusher بنجاح في Backend و Android.

---

## 🧪 اختبار سريع (30 ثانية)

### الخطوة 1: اختبار Backend
```bash
node pusher-test-simple.js
```

**يجب أن ترى:**
```
✅ تم إرسال الرسالة بنجاح!
📡 القناة: my-channel
🎯 الحدث: my-event
💬 الرسالة: hello world
```

### الخطوة 2: تشغيل Backend
```bash
npm start
```

**يجب أن ترى:**
```
✅ Pusher initialized successfully
📡 Pusher cluster: ap1
🧪 Pusher test message sent successfully
```

### الخطوة 3: اختبار Android
1. بناء APK: `build_careerak_optimized.bat`
2. تثبيت التطبيق
3. فتح Logcat: `adb logcat | grep Careerak_Pusher`
4. تشغيل التطبيق

**يجب أن ترى:**
```
Careerak_Pusher: Pusher initialized successfully
Careerak_Pusher: State changed to CONNECTED
```

### الخطوة 4: إرسال رسالة تجريبية
من Backend:
```bash
node pusher-test-simple.js
```

في Android Logcat:
```
Careerak_Pusher: Received event with data: {"message":"hello world"}
```

---

## 📚 ملفات الاختبار

| الملف | الوصف | الاستخدام |
|------|-------|----------|
| `pusher-test-simple.js` | اختبار بسيط | `node pusher-test-simple.js` |
| `test-pusher.js` | اختبار شامل | `node test-pusher.js` |
| `src/index.js` | اختبار تلقائي | يعمل عند `npm start` |

---

## 🔑 المفاتيح

```env
PUSHER_APP_ID=2116650
PUSHER_KEY=e1634b67b9768369c949
PUSHER_SECRET=6cc69e70fd3118893c6c
PUSHER_CLUSTER=ap1
```

---

## 🌐 روابط مفيدة

- 🔗 [Pusher Dashboard](https://dashboard.pusher.com/apps/2116650)
- 🔗 [Debug Console](https://dashboard.pusher.com/apps/2116650/getting_started)
- 📖 [دليل الاختبار الكامل](../docs/PUSHER_TESTING_GUIDE.md)

---

## 🎯 الخطوات التالية

1. ✅ اختبار Backend - `node pusher-test-simple.js`
2. ✅ اختبار Android - بناء APK واختباره
3. ✅ اختبار المحادثات الحقيقية
4. ✅ دمج مع Frontend (React)

---

**تاريخ الإنشاء**: 2026-02-17  
**الحالة**: ✅ جاهز للاختبار
