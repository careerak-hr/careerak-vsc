# 🎵 نظام الصوتيات في تطبيق Careerak

## نظرة عامة

يحتوي التطبيق على نظام صوتي شامل يتكون من:

1. **AudioManager** - إدارة الموسيقى الخلفية والمقدمة
2. **NotificationSoundManager** - إدارة أصوات الإشعارات
3. **AppAudioPlayer** - مكون React للتكامل مع التطبيق

---

## 📁 هيكل الملفات

```
frontend/
├── src/
│   ├── services/
│   │   ├── audioManager.js          # مدير الموسيقى الرئيسي
│   │   └── notificationSounds.js    # مدير أصوات الإشعارات
│   ├── components/
│   │   └── AppAudioPlayer.jsx       # مكون التكامل
│   ├── context/
│   │   └── AppContext.js            # إدارة الإعدادات
│   └── utils/
│       └── audioSystemTest.js       # أدوات الاختبار
└── public/
    ├── Music.mp3                     # الموسيقى الخلفية
    ├── intro.mp3                     # موسيقى المقدمة
    └── sounds/                       # مجلد أصوات الإشعارات
        ├── individuals/              # أصوات الأفراد
        ├── companies/                # أصوات الشركات
        └── general/                  # أصوات عامة
```

---

## 🎼 AudioManager

### الميزات الرئيسية

- ✅ تشغيل الموسيقى الخلفية في صفحات محددة
- ✅ إدارة موسيقى المقدمة
- ✅ إيقاف/استئناف تلقائي عند تغيير حالة التطبيق
- ✅ دعم قفل الشاشة وتبديل التطبيقات
- ✅ مزامنة مع إعدادات المستخدم

### الصفحات التي تشغل الموسيقى

```javascript
musicPages = ['/login', '/auth']
```

### الاستخدام

```javascript
import audioManager from './services/audioManager';

// تهيئة
await audioManager.initialize();

// تحديث الصفحة
audioManager.updatePage('/login');

// تحديث الإعدادات
audioManager.updateAudioSettings(true, true);

// الحصول على الحالة
const status = audioManager.getStatus();
```

---

## 🔔 NotificationSoundManager

### أنواع الأصوات

#### 1. أصوات الأفراد (Individuals)
- `jobAccepted` - تصفيق عند قبول طلب توظيف
- `jobRejected` - صوت لطيف عند رفض طلب
- `courseCompleted` - تهانينا عند إتمام دورة
- `courseEnrolled` - صوت نجاح عند التسجيل
- `newJobPosted` - جرس فرصة عند نشر وظيفة
- `profileViewed` - صوت لطيف عند مشاهدة الملف
- `messageReceived` - صوت رسالة جديدة
- `interviewScheduled` - صوت مهم لموعد مقابلة
- `certificateEarned` - صوت إنجاز عند الحصول على شهادة

#### 2. أصوات الشركات (Companies)
- `paymentReceived` - صوت فلوس عند استلام دفعة
- `paymentSent` - صوت تحويل مالي
- `newApplication` - صوت مهني لطلب جديد
- `candidateShortlisted` - صوت اختيار مرشح
- `jobPostExpired` - تذكير لطيف لانتهاء إعلان
- `subscriptionRenewal` - صوت تجاري للاشتراك
- `reportGenerated` - صوت جاهزية تقرير
- `teamUpdate` - إشعار فريق العمل
- `contractSigned` - صوت احتفالي لتوقيع عقد

#### 3. أصوات عامة (General)
- `systemUpdate` - تحديث النظام
- `maintenance` - تنبيه صيانة
- `welcome` - صوت ترحيب
- `error` - صوت خطأ
- `success` - صوت نجاح عام

### الاستخدام

```javascript
import notificationSoundManager from './services/notificationSounds';

// تشغيل صوت
await notificationSoundManager.playSound('individual', 'jobAccepted');

// تفعيل/تعطيل
notificationSoundManager.setEnabled(true);

// تعديل مستوى الصوت
notificationSoundManager.setVolume(0.7);

// اختبار صوت
await notificationSoundManager.testSound('company', 'paymentReceived');
```

---

## ⚙️ إعدادات المستخدم

يتم حفظ الإعدادات في:
- **Preferences** (Capacitor) - للأجهزة المحمولة
- **localStorage** - للمتصفح

### المفاتيح المستخدمة

```javascript
{
  audio_enabled: 'true' | 'false',    // تفعيل الصوت
  musicEnabled: 'true' | 'false',     // تفعيل الموسيقى
  audioConsent: 'true' | 'false',     // موافقة المستخدم
  notificationsEnabled: 'true' | 'false'
}
```

---

## 🧪 الاختبار

### في Console المتصفح

```javascript
// اختبار شامل للنظام
await window.audioSystemTest.run();

// اختبار صوت إشعار محدد
await window.audioSystemTest.testNotification('individual', 'jobAccepted');

// اختبار جميع الأصوات
await window.audioSystemTest.testAll();

// مراقبة الحالة
const monitor = window.audioSystemTest.startMonitoring();
// لإيقاف المراقبة
window.audioSystemTest.stopMonitoring(monitor);

// الحصول على الحالة الحالية
window.audioSystemTest.getStatus();
```

### في الكود

```javascript
import { runAudioSystemTest } from './utils/audioSystemTest';

const result = await runAudioSystemTest();
console.log(result);
```

---

## 🔧 حل المشاكل

### المشكلة: الموسيقى لا تعمل

**الحلول:**
1. تحقق من الإعدادات:
```javascript
window.audioManager.getStatus();
```

2. تحقق من وجود الملفات:
```javascript
// في console
new Audio('/Music.mp3').play();
new Audio('/intro.mp3').play();
```

3. تحقق من الصفحة الحالية:
```javascript
window.audioManager.currentPage
```

### المشكلة: أصوات الإشعارات لا تعمل

**الحلول:**
1. تحقق من تفعيل الأصوات:
```javascript
window.notificationSoundManager.isEnabled
```

2. اختبر صوت محدد:
```javascript
await window.notificationSoundManager.testSound('individual', 'success');
```

3. تحقق من الأصوات المتاحة:
```javascript
window.notificationSoundManager.getAvailableSounds();
```

### المشكلة: الصوت يتوقف عند قفل الشاشة

هذا سلوك طبيعي! النظام يوقف الصوت تلقائياً عند:
- قفل الشاشة
- تبديل التطبيق
- إخفاء الصفحة

ويستأنف التشغيل عند العودة.

---

## 📝 ملاحظات مهمة

### 1. ملفات الصوت المطلوبة

يجب وضع ملفات الصوت في:
```
frontend/public/sounds/
├── individuals/
│   ├── applause.mp3
│   ├── gentle-notification.mp3
│   ├── congratulations.mp3
│   └── ... (باقي الأصوات)
├── companies/
│   ├── cash-register.mp3
│   ├── money-transfer.mp3
│   └── ... (باقي الأصوات)
└── general/
    ├── system-notification.mp3
    └── ... (باقي الأصوات)
```

### 2. التوافق مع المتصفحات

- ✅ Chrome/Edge - دعم كامل
- ✅ Firefox - دعم كامل
- ✅ Safari - يتطلب تفاعل المستخدم أولاً
- ✅ Mobile browsers - دعم كامل مع Capacitor

### 3. الأداء

- الملفات الصوتية يتم تحميلها مسبقاً (`preload='auto'`)
- الموسيقى تعمل في loop تلقائياً
- لا يوجد تأثير على أداء التطبيق

---

## 🚀 التطوير المستقبلي

### ميزات مقترحة

- [ ] إضافة تأثيرات fade in/out
- [ ] دعم قوائم تشغيل متعددة
- [ ] إضافة equalizer
- [ ] دعم الأصوات المخصصة للمستخدم
- [ ] إحصائيات استخدام الصوتيات

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، استخدم:
```javascript
window.audioSystemTest.run()
```
وأرسل النتائج للفريق التقني.
