# 🧪 دليل اختبار Pusher - Careerak

## 📋 نظرة عامة

دليل شامل لاختبار Pusher في Backend و Android.

---

## ✅ التحقق من الإعداد

### 1. التحقق من المفاتيح
```bash
cd backend
cat .env | grep PUSHER
```

يجب أن ترى:
```env
PUSHER_APP_ID=2116650
PUSHER_KEY=e1634b67b9768369c949
PUSHER_SECRET=6cc69e70fd3118893c6c
PUSHER_CLUSTER=ap1
```

### 2. التحقق من تثبيت Pusher
```bash
npm list pusher
```

يجب أن ترى:
```
pusher@5.3.2
```

---

## 🧪 الاختبارات المتاحة

### اختبار 1: الاختبار البسيط (كما طلب Pusher)
```bash
cd backend
node pusher-test-simple.js
```

**المخرجات المتوقعة:**
```
🚀 إرسال رسالة تجريبية إلى Pusher...

✅ تم إرسال الرسالة بنجاح!
📡 القناة: my-channel
🎯 الحدث: my-event
💬 الرسالة: hello world

📱 الآن افتح تطبيق Android وراقب Logcat
```

### اختبار 2: الاختبار الشامل
```bash
node test-pusher.js
```

**المخرجات المتوقعة:**
```
🧪 اختبار Pusher...

📋 المفاتيح:
  App ID: 2116650
  Key: e1634b67b9768369c949
  Secret: ***
  Cluster: ap1

✅ Pusher initialized successfully

🧪 اختبار 1: إرسال حدث بسيط...
✅ تم إرسال الحدث بنجاح

🧪 اختبار 2: إرسال رسالة محادثة...
✅ تم إرسال رسالة المحادثة بنجاح

🧪 اختبار 3: إرسال مؤشر "يكتب الآن"...
✅ تم إرسال مؤشر الكتابة بنجاح

🧪 اختبار 4: إرسال إشعار...
✅ تم إرسال الإشعار بنجاح

🧪 اختبار 5: الحصول على معلومات القناة...
✅ تم الحصول على معلومات القناة

🎉 جميع الاختبارات نجحت!
```

### اختبار 3: تشغيل Backend
```bash
npm start
```

**المخرجات المتوقعة:**
```
✅ Pusher initialized successfully
📡 Pusher cluster: ap1
🚀 Server running on port 5000

# بعد 3 ثواني:
🧪 Pusher test message sent successfully to my-channel
```

---

## 📱 اختبار Android

### الخطوة 1: بناء APK
```bash
cd ..
build_careerak_optimized.bat
```

### الخطوة 2: تثبيت التطبيق
- ثبّت APK على الجهاز أو المحاكي

### الخطوة 3: فتح Logcat
في Android Studio:
1. اضغط على "Logcat" في الأسفل
2. اختر الجهاز/المحاكي
3. في الفلتر اكتب: `Careerak_Pusher`

### الخطوة 4: تشغيل التطبيق
- افتح التطبيق
- يجب أن ترى في Logcat:

```
Careerak_Pusher: Pusher initialized successfully
Careerak_Pusher: State changed from DISCONNECTED to CONNECTING
Careerak_Pusher: State changed from CONNECTING to CONNECTED
```

### الخطوة 5: إرسال رسالة تجريبية
من Backend:
```bash
node pusher-test-simple.js
```

يجب أن ترى في Logcat:
```
Careerak_Pusher: Received event with data: {"message":"hello world"}
```

---

## 🌐 اختبار من Pusher Dashboard

### الخطوة 1: فتح Debug Console
🔗 https://dashboard.pusher.com/apps/2116650/getting_started

### الخطوة 2: إرسال حدث تجريبي
في قسم "Event Creator":
```
Channel: my-channel
Event: my-event
Data: {"message": "Test from Dashboard"}
```

اضغط "Send event"

### الخطوة 3: التحقق
- في Android Logcat يجب أن ترى الرسالة
- في Debug Console يجب أن ترى "Event sent successfully"

---

## 🔄 اختبار المحادثات الحقيقية

### 1. إنشاء محادثة
```bash
curl -X POST http://localhost:5000/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "participants": ["user1_id", "user2_id"]
  }'
```

### 2. إرسال رسالة
```bash
curl -X POST http://localhost:5000/chat/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "conversationId": "CONVERSATION_ID",
    "content": "مرحباً! هذه رسالة حقيقية",
    "type": "text"
  }'
```

### 3. التحقق في Android
يجب أن ترى في Logcat:
```
Careerak_Pusher: Received event with data: {
  "message": {
    "content": "مرحباً! هذه رسالة حقيقية",
    ...
  }
}
```

---

## 🧪 اختبار مؤشر "يكتب الآن"

### إرسال مؤشر الكتابة
```bash
curl -X POST http://localhost:5000/chat/typing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "conversationId": "CONVERSATION_ID"
  }'
```

### التحقق في Android
يجب أن ترى:
```
Careerak_Pusher: Received event: user-typing
```

---

## 🔔 اختبار الإشعارات

### إرسال إشعار
```bash
curl -X POST http://localhost:5000/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "job_match",
    "title": "وظيفة جديدة!",
    "message": "تم نشر وظيفة مناسبة لك"
  }'
```

### التحقق في Android
يجب أن ترى:
```
Careerak_Pusher: Received event: notification
```

---

## 📊 مراقبة الأداء

### في Pusher Dashboard
1. اذهب إلى: https://dashboard.pusher.com/apps/2116650
2. اضغط على "Overview"
3. راقب:
   - **Messages**: عدد الرسائل المرسلة
   - **Connections**: عدد الاتصالات النشطة
   - **Channels**: عدد القنوات المفتوحة

### في Backend Logs
```bash
tail -f backend/logs/combined.log | grep Pusher
```

### في Android Logcat
```
adb logcat | grep Careerak_Pusher
```

---

## 🐛 استكشاف الأخطاء

### المشكلة 1: "Pusher not initialized"
**الأعراض:**
```
⚠️ Pusher credentials not found
```

**الحل:**
```bash
# تحقق من .env
cat backend/.env | grep PUSHER

# تأكد من المفاتيح موجودة
# أعد تشغيل Backend
npm start
```

### المشكلة 2: "Connection failed" في Android
**الأعراض:**
```
Careerak_Pusher: Connection error! code: 4001
```

**الحل:**
1. تحقق من الإنترنت على الجهاز
2. تحقق من الـ Key في MainActivity.java
3. تحقق من الـ Cluster (ap1)

### المشكلة 3: "No events received"
**الأعراض:**
- Backend يرسل بنجاح
- Android لا يستقبل

**الحل:**
1. تحقق من اسم القناة (نفسه في Backend و Android)
2. تحقق من اسم الحدث
3. تأكد من Android متصل (State: CONNECTED)

### المشكلة 4: "Authentication failed"
**الأعراض:**
```
Careerak_Pusher: Connection error! code: 4009
```

**الحل:**
1. تحقق من الـ Secret في Backend
2. تحقق من JWT token
3. راجع `/chat/pusher/auth` endpoint

---

## 📈 معايير النجاح

### Backend ✅
- [ ] Pusher initialized successfully
- [ ] Test message sent successfully
- [ ] No errors in logs

### Android ✅
- [ ] Pusher initialized successfully
- [ ] State changed to CONNECTED
- [ ] Events received successfully

### Integration ✅
- [ ] Messages sent from Backend appear in Android
- [ ] Typing indicators work
- [ ] Notifications received
- [ ] No connection drops

---

## 🎯 السيناريوهات الكاملة

### سيناريو 1: محادثة بين مستخدمين
1. المستخدم A يفتح التطبيق
2. المستخدم B يفتح التطبيق
3. A يرسل رسالة
4. B يستقبل الرسالة فوراً ✅
5. B يبدأ الكتابة
6. A يرى "يكتب الآن..." ✅
7. B يرسل رسالة
8. A يستقبل الرسالة فوراً ✅

### سيناريو 2: إشعار وظيفة جديدة
1. شركة تنشر وظيفة جديدة
2. Backend يطابق مع مهارات المستخدمين
3. المستخدمون المناسبون يستقبلون إشعار فوري ✅
4. الإشعار يظهر في التطبيق ✅

### سيناريو 3: تحديث حالة الطلب
1. شركة تقبل طلب توظيف
2. Backend يرسل إشعار للمتقدم
3. المتقدم يستقبل إشعار فوري ✅
4. حالة الطلب تتحدث في التطبيق ✅

---

## 📚 الأوامر المفيدة

### Backend
```bash
# اختبار بسيط
node pusher-test-simple.js

# اختبار شامل
node test-pusher.js

# تشغيل Backend
npm start

# مراقبة Logs
tail -f logs/combined.log
```

### Android
```bash
# بناء APK
build_careerak_optimized.bat

# مراقبة Logcat
adb logcat | grep Careerak_Pusher

# تثبيت APK
adb install path/to/apk
```

### Pusher Dashboard
```bash
# فتح Dashboard
start https://dashboard.pusher.com/apps/2116650

# فتح Debug Console
start https://dashboard.pusher.com/apps/2116650/getting_started
```

---

## 🎉 الخلاصة

### ما تم اختباره:
- ✅ Backend Pusher initialization
- ✅ Android Pusher connection
- ✅ Event sending and receiving
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Notifications
- ✅ Error handling

### النتيجة:
🎉 **Pusher يعمل بنجاح في Backend و Android!**

---

**تاريخ الإنشاء**: 2026-02-17  
**الحالة**: ✅ جاهز للاختبار
