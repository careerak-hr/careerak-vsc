# دليل البدء السريع - إشعارات الشهادات

## ⚡ البدء في 5 دقائق

### 1. الإعداد (دقيقة واحدة)

تأكد من وجود المتغيرات في `.env`:

```env
FRONTEND_URL=https://careerak.com
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
```

### 2. إصدار شهادة مع إشعارات (30 ثانية)

```javascript
const certificateService = require('./services/certificateService');

// إصدار شهادة (يرسل إشعار وبريد تلقائياً)
const result = await certificateService.issueCertificate(userId, courseId);

// ✅ تم إرسال إشعار فوري
// ✅ تم إرسال بريد إلكتروني
```

### 3. التحقق (دقيقة واحدة)

**في console**:
```
✅ Notification sent for certificate uuid-here
✅ Email sent for certificate uuid-here
```

**في التطبيق**:
- افتح قائمة الإشعارات
- يجب أن ترى: "تهانينا! شهادتك جاهزة 🎉"

**في البريد الإلكتروني**:
- افتح بريدك الإلكتروني
- يجب أن ترى بريد من Careerak

---

## 🧪 الاختبار (دقيقتان)

```bash
cd backend
npm test -- certificateNotification.test.js
```

**النتيجة المتوقعة**: ✅ جميع الاختبارات تنجح

---

## 📋 Checklist

- [x] المتغيرات في .env
- [x] Pusher مفعّل
- [x] الإشعارات تصل
- [x] البريد الإلكتروني يُرسل
- [x] الاختبارات تنجح

---

## 🆘 مشاكل شائعة

### الإشعار لا يصل
```bash
# تحقق من Pusher
echo $PUSHER_KEY
```

### البريد لا يصل
```bash
# في التطوير: تحقق من console
# في الإنتاج: تحقق من SMTP settings
```

---

## 📚 المزيد

للتوثيق الكامل: `docs/CERTIFICATE_NOTIFICATIONS_IMPLEMENTATION.md`

---

**تاريخ الإنشاء**: 2026-03-09
