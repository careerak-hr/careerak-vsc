# 🔔 دليل نظام الإشعارات الصوتية

## 📋 نظرة عامة

تم إنشاء نظام إشعارات صوتية متكامل يستخدم Web Audio API لتوليد الأصوات برمجياً. هذا حل مؤقت احترافي لحين إضافة ملفات MP3 حقيقية.

---

## 🎵 المكونات الرئيسية

### 1. SoundGenerator (`frontend/src/utils/soundGenerator.js`)

مولد أصوات بسيطة باستخدام Web Audio API.

#### الأصوات المتاحة:

```javascript
soundGenerator.playSuccess()        // نغمتان صاعدتان (C5 → E5)
soundGenerator.playError()          // نغمة منخفضة طويلة
soundGenerator.playNotification()   // نغمتان سريعتان (800Hz → 1000Hz)
soundGenerator.playAlert()          // نغمتان متبادلتان (1000Hz ⇄ 800Hz)
soundGenerator.playApplause()       // 5 نغمات عشوائية سريعة
soundGenerator.playBell()           // نغمة عالية نقية (C6)
soundGenerator.playCashRegister()   // نغمتان (400Hz → 600Hz)
soundGenerator.playMessagePop()     // نغمة قصيرة (600Hz)
soundGenerator.playCongratulations() // 4 نغمات صاعدة (C5-D5-E5-G5)
soundGenerator.playOpportunity()    // نغمتان صاعدتان (880Hz → 1046Hz)
```

#### المعاملات القابلة للتخصيص:

```javascript
soundGenerator.playTone(
  frequency,  // التردد بالهرتز (440 = A4)
  duration,   // المدة بالثواني (0.2)
  type,       // نوع الموجة: 'sine', 'square', 'sawtooth', 'triangle'
  volume      // مستوى الصوت (0-1)
);
```

---

### 2. NotificationSoundManager (`frontend/src/services/notificationSounds.js`)

نظام إدارة الإشعارات الصوتية مع خريطة كاملة للأصوات.

#### أنواع الإشعارات:

##### للأفراد (Individuals):
- `jobAccepted` - قبول في وظيفة → applause
- `jobRejected` - رفض طلب → error
- `newJobMatch` - وظيفة مناسبة جديدة → opportunity
- `applicationSubmitted` - تقديم طلب → success
- `profileUpdated` - تحديث الملف الشخصي → notification
- `messageReceived` - رسالة جديدة → messagePop
- `courseEnrolled` - التسجيل في دورة → congratulations
- `achievementUnlocked` - إنجاز جديد → applause

##### للشركات (Companies):
- `newApplication` - طلب توظيف جديد → cashRegister
- `candidateShortlisted` - ترشيح مرشح → bell
- `interviewScheduled` - جدولة مقابلة → notification
- `jobPosted` - نشر وظيفة → success
- `profileViewed` - مشاهدة ملف شخصي → messagePop

##### عامة (General):
- `success` - نجاح عملية → success
- `error` - خطأ → error
- `warning` - تحذير → alert
- `info` - معلومة → notification
- `message` - رسالة → messagePop

---

## 🚀 الاستخدام

### في المكونات (Components):

```javascript
import notificationSoundManager from '../services/notificationSounds';

// مثال 1: عند قبول وظيفة
const handleJobAccepted = () => {
  notificationSoundManager.play('jobAccepted');
  // ... باقي الكود
};

// مثال 2: عند تقديم طلب
const handleSubmitApplication = async () => {
  try {
    await api.post('/applications', data);
    notificationSoundManager.play('applicationSubmitted');
    // ... باقي الكود
  } catch (error) {
    notificationSoundManager.play('error');
  }
};

// مثال 3: استخدام الاختصارات
notificationSoundManager.playSuccess();
notificationSoundManager.playError();
notificationSoundManager.playWarning();
```

### في Console للاختبار:

```javascript
// اختبار صوت واحد
window.notificationSoundManager.play('jobAccepted');

// اختبار جميع الأصوات (يستغرق ~27 ثانية)
await window.notificationSoundManager.testAll();

// الحصول على قائمة الأصوات المتاحة
window.notificationSoundManager.getAvailableSounds();

// تعطيل الأصوات
window.notificationSoundManager.setEnabled(false);

// تفعيل الأصوات
window.notificationSoundManager.setEnabled(true);

// تغيير مستوى الصوت (0-1)
window.notificationSoundManager.setVolume(0.5);

// اختبار مولد الأصوات مباشرة
window.soundGenerator.playSuccess();
window.soundGenerator.playTone(440, 0.3, 'sine', 0.5);
```

---

## 🎨 تخصيص الأصوات

### إضافة صوت جديد:

#### 1. في SoundGenerator:

```javascript
// في frontend/src/utils/soundGenerator.js
playCustomSound() {
  this.playTone(500, 0.2, 'sine', 0.3);
  setTimeout(() => this.playTone(700, 0.2, 'sine', 0.3), 200);
}
```

#### 2. في NotificationSoundManager:

```javascript
// في frontend/src/services/notificationSounds.js
constructor() {
  // ...
  this.soundMap = {
    // ...
    customNotification: 'customSound'
  };
}

// إضافة case في play()
case 'customSound':
  soundGenerator.playCustomSound();
  break;
```

---

## 🔄 الترقية لملفات MP3

عند توفر ملفات MP3 حقيقية:

### الخطوة 1: إضافة الملفات

```bash
frontend/public/sounds/
├── individuals/
│   ├── applause.mp3
│   ├── gentle-notification.mp3
│   └── ...
├── companies/
│   ├── cash-register.mp3
│   └── ...
└── general/
    ├── success.mp3
    └── ...
```

### الخطوة 2: تعديل NotificationSoundManager

```javascript
// في frontend/src/services/notificationSounds.js
constructor() {
  this.audioCache = {};
  
  // تحميل الملفات
  this.sounds = {
    success: new Audio('/sounds/general/success.mp3'),
    error: new Audio('/sounds/general/error.mp3'),
    // ... إلخ
  };
}

play(notificationType) {
  if (!this.enabled) return;
  
  const audio = this.sounds[notificationType];
  if (audio) {
    audio.currentTime = 0;
    audio.volume = this.volume;
    audio.play().catch(err => {
      console.error('Failed to play sound:', err);
      // Fallback للمولد
      soundGenerator.playNotification();
    });
  }
}
```

---

## 🧪 الاختبار

### اختبار شامل:

```javascript
// 1. اختبار جميع الأصوات
console.log('🎵 Testing all sounds...');
await window.notificationSoundManager.testAll();

// 2. اختبار التفعيل/التعطيل
window.notificationSoundManager.setEnabled(false);
window.notificationSoundManager.play('success'); // لن يعمل
window.notificationSoundManager.setEnabled(true);
window.notificationSoundManager.play('success'); // سيعمل

// 3. اختبار مستوى الصوت
window.notificationSoundManager.setVolume(0.1); // هادئ
window.notificationSoundManager.play('success');
window.notificationSoundManager.setVolume(1.0); // عالي
window.notificationSoundManager.play('success');

// 4. اختبار المولد مباشرة
window.soundGenerator.playTone(440, 0.5, 'sine', 0.5);
window.soundGenerator.playTone(880, 0.5, 'square', 0.5);
```

### اختبار في السيناريوهات الحقيقية:

```javascript
// في مكون التطبيق
import notificationSoundManager from '../services/notificationSounds';

// عند نجاح عملية
const handleSuccess = () => {
  notificationSoundManager.playSuccess();
  showSuccessMessage();
};

// عند فشل عملية
const handleError = () => {
  notificationSoundManager.playError();
  showErrorMessage();
};

// عند استلام رسالة
const handleNewMessage = () => {
  notificationSoundManager.play('messageReceived');
  updateMessageList();
};
```

---

## 📊 مقارنة الحلول

### الحل الحالي (Web Audio API):

#### المزايا:
✅ لا يحتاج ملفات خارجية
✅ حجم صغير جداً (< 5KB)
✅ سريع التحميل
✅ قابل للتخصيص بالكامل
✅ يعمل في جميع المتصفحات الحديثة
✅ لا توجد مشاكل في الترخيص

#### العيوب:
❌ جودة صوت أقل من MP3
❌ محدود في التنوع
❌ يحتاج برمجة لكل صوت جديد

### الحل المستقبلي (MP3 Files):

#### المزايا:
✅ جودة صوت عالية
✅ أصوات احترافية
✅ تنوع كبير
✅ سهولة الإضافة والتعديل

#### العيوب:
❌ حجم أكبر (~2-5MB لـ 27 ملف)
❌ وقت تحميل أطول
❌ يحتاج ملفات خارجية
❌ قد تحتاج ترخيص

---

## 🎯 أفضل الممارسات

### 1. متى تستخدم الأصوات:

✅ **استخدم الأصوات في:**
- إشعارات مهمة (قبول وظيفة، رسالة جديدة)
- نجاح/فشل عمليات
- تنبيهات تحتاج انتباه فوري

❌ **لا تستخدم الأصوات في:**
- كل نقرة زر
- التنقل العادي
- العمليات المتكررة كثيراً

### 2. مستوى الصوت:

```javascript
// للإشعارات العادية
notificationSoundManager.setVolume(0.3);

// للتنبيهات المهمة
notificationSoundManager.setVolume(0.5);

// للأصوات الخلفية
notificationSoundManager.setVolume(0.2);
```

### 3. احترام تفضيلات المستخدم:

```javascript
// حفظ التفضيلات
localStorage.setItem('soundsEnabled', 'true');
localStorage.setItem('soundVolume', '0.3');

// تحميل التفضيلات
const soundsEnabled = localStorage.getItem('soundsEnabled') === 'true';
const soundVolume = parseFloat(localStorage.getItem('soundVolume')) || 0.3;

notificationSoundManager.setEnabled(soundsEnabled);
notificationSoundManager.setVolume(soundVolume);
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الأصوات لا تعمل

```javascript
// 1. تحقق من التهيئة
console.log(window.soundGenerator.isInitialized);

// 2. تحقق من التفعيل
console.log(window.notificationSoundManager.enabled);

// 3. جرب التهيئة يدوياً
window.soundGenerator.init();

// 4. جرب صوت بسيط
window.soundGenerator.playTone(440, 0.5, 'sine', 0.5);
```

### المشكلة: الصوت ضعيف جداً

```javascript
// زيادة مستوى الصوت
window.notificationSoundManager.setVolume(1.0);

// أو في المولد مباشرة
window.soundGenerator.playTone(440, 0.5, 'sine', 1.0);
```

### المشكلة: الصوت متقطع

```javascript
// تأكد من عدم وجود عمليات ثقيلة
// استخدم setTimeout للتأخير البسيط
setTimeout(() => {
  notificationSoundManager.play('success');
}, 100);
```

---

## 📚 مراجع

### Web Audio API:
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)

### الترددات الموسيقية:
- A4 = 440 Hz
- C5 = 523.25 Hz
- E5 = 659.25 Hz
- G5 = 783.99 Hz
- C6 = 1046.50 Hz

---

## ✅ الخلاصة

نظام الإشعارات الصوتية جاهز للاستخدام:
- ✅ 27 نوع إشعار مختلف
- ✅ 10 أصوات أساسية
- ✅ قابل للتخصيص بالكامل
- ✅ سهل الاستخدام
- ✅ جاهز للترقية لـ MP3

**ابدأ الاستخدام الآن!** 🎉

---

**تاريخ الإنشاء**: 2026-02-13  
**المطور**: Eng.AlaaUddien  
**البريد**: careerak.hr@gmail.com
