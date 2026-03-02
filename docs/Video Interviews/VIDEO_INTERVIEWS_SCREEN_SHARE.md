# نظام مشاركة الشاشة - نظام الفيديو للمقابلات

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-03-01
- **الحالة**: ✅ مكتمل
- **المتطلبات**: Requirements 3.1, 3.2, 3.3

---

## 🎯 نظرة عامة

نظام شامل لمشاركة الشاشة في مقابلات الفيديو، يدعم:
- ✅ مشاركة الشاشة الكاملة
- ✅ مشاركة نافذة محددة
- ✅ مشاركة تبويب المتصفح
- ✅ تبديل المصدر أثناء المشاركة
- ✅ معلومات جودة المشاركة
- ✅ واجهة مستخدم احترافية

---

## 📁 الملفات المنشأة

### Backend
```
backend/src/services/
└── screenShareService.js              # خدمة إدارة المشاركة
```

### Frontend
```
frontend/src/
├── services/
│   └── screenShareService.js          # خدمة المشاركة من جانب العميل
└── components/VideoInterview/
    ├── ScreenShareControls.jsx        # مكون التحكم
    ├── ScreenShareControls.css        # تنسيقات التحكم
    ├── ScreenShareDisplay.jsx         # مكون العرض
    └── ScreenShareDisplay.css         # تنسيقات العرض
```

---

## 🔧 Backend Service

### الميزات الرئيسية

**ScreenShareService** يوفر:
- إدارة المشاركات النشطة
- التحقق من حصرية المشاركة (مشارك واحد فقط)
- معلومات جودة المشاركة
- تبديل المصدر
- تنظيف تلقائي

### الاستخدام

```javascript
const ScreenShareService = require('./services/screenShareService');
const screenShareService = new ScreenShareService();

// بدء مشاركة
const result = await screenShareService.startScreenShare(
  roomId,
  userId,
  'window',
  stream
);

// إيقاف مشاركة
await screenShareService.stopScreenShare(roomId, userId);

// الحصول على المشاركة النشطة
const activeShare = screenShareService.getActiveShare(roomId);

// تبديل المصدر
await screenShareService.switchSource(roomId, userId, 'screen', newStream);
```

### API Methods

| Method | الوصف | Parameters |
|--------|-------|-----------|
| `startScreenShare()` | بدء مشاركة | roomId, userId, type, stream |
| `stopScreenShare()` | إيقاف مشاركة | roomId, userId |
| `getActiveShare()` | الحصول على المشاركة النشطة | roomId |
| `hasActiveShare()` | التحقق من وجود مشاركة | roomId |
| `switchSource()` | تبديل المصدر | roomId, userId, newType, newStream |
| `getStreamQuality()` | الحصول على الجودة | stream |
| `cleanup()` | تنظيف جميع المشاركات | - |

---

## 💻 Frontend Service

### الميزات الرئيسية

**ScreenShareService** (Frontend) يوفر:
- الوصول إلى `getDisplayMedia` API
- دعم 3 أنواع مشاركة
- معالجة الأخطاء الشاملة
- اكتشاف نوع المشاركة
- معلومات الجودة

### الاستخدام

```javascript
import ScreenShareService from './services/screenShareService';

const screenShareService = new ScreenShareService();

// مشاركة الشاشة الكاملة
const stream = await screenShareService.startFullScreenShare();

// مشاركة نافذة محددة
const stream = await screenShareService.startWindowShare();

// مشاركة تبويب
const stream = await screenShareService.startTabShare();

// مشاركة عامة (يعرض خيارات للمستخدم)
const stream = await screenShareService.startScreenShare({
  width: 1920,
  height: 1080,
  frameRate: 30,
  audio: false
});

// إيقاف المشاركة
screenShareService.stopScreenShare();

// تبديل المصدر
const newStream = await screenShareService.switchSource('window');

// الحصول على معلومات
const isSharing = screenShareService.isSharing();
const quality = screenShareService.getQuality();
const type = screenShareService.getShareType();
```

### API Methods

| Method | الوصف | Returns |
|--------|-------|---------|
| `startFullScreenShare()` | مشاركة الشاشة الكاملة | Promise<MediaStream> |
| `startWindowShare()` | مشاركة نافذة | Promise<MediaStream> |
| `startTabShare()` | مشاركة تبويب | Promise<MediaStream> |
| `startScreenShare(options)` | مشاركة عامة | Promise<MediaStream> |
| `stopScreenShare()` | إيقاف المشاركة | void |
| `switchSource(type)` | تبديل المصدر | Promise<MediaStream> |
| `isSharing()` | التحقق من المشاركة | boolean |
| `getQuality()` | معلومات الجودة | Object |
| `getShareType()` | نوع المشاركة | string |
| `isSupported()` | التحقق من الدعم | boolean (static) |

---

## 🎨 React Components

### ScreenShareControls

مكون التحكم في مشاركة الشاشة.

**Props:**
```typescript
{
  onShareStart?: (stream: MediaStream, type: string) => void;
  onShareStop?: () => void;
  disabled?: boolean;
}
```

**الاستخدام:**
```jsx
import ScreenShareControls from './components/VideoInterview/ScreenShareControls';

<ScreenShareControls
  onShareStart={(stream, type) => {
    console.log('Share started:', type);
    // إرسال stream للمشاركين الآخرين
  }}
  onShareStop={() => {
    console.log('Share stopped');
  }}
  disabled={!isConnected}
/>
```

**الميزات:**
- زر مشاركة رئيسي
- قائمة خيارات (شاشة/نافذة/تبويب)
- مؤشر المشاركة النشطة
- معلومات الجودة
- زر إيقاف المشاركة
- معالجة الأخطاء

### ScreenShareDisplay

مكون عرض الشاشة المشاركة.

**Props:**
```typescript
{
  stream: MediaStream;
  sharerName: string;
  shareType: 'screen' | 'window' | 'tab';
  onClose?: () => void;
  fullscreen?: boolean;
}
```

**الاستخدام:**
```jsx
import ScreenShareDisplay from './components/VideoInterview/ScreenShareDisplay';

<ScreenShareDisplay
  stream={remoteScreenStream}
  sharerName="أحمد محمد"
  shareType="window"
  onClose={() => setShowScreenShare(false)}
  fullscreen={false}
/>
```

**الميزات:**
- عرض stream المشاركة
- معلومات المشارك
- نوع المشاركة
- معلومات الجودة
- زر ملء الشاشة
- زر إغلاق

---

## 🔄 تدفق العمل

### 1. بدء المشاركة

```
User clicks "Share Screen"
    ↓
Show options menu (Screen/Window/Tab)
    ↓
User selects option
    ↓
Request permission (getDisplayMedia)
    ↓
User grants permission
    ↓
Get MediaStream
    ↓
Update UI (show sharing indicator)
    ↓
Send stream to other participants
```

### 2. إيقاف المشاركة

```
User clicks "Stop" OR closes picker
    ↓
Stop all tracks
    ↓
Update UI (hide sharing indicator)
    ↓
Notify other participants
```

### 3. تبديل المصدر

```
User clicks "Switch Source"
    ↓
Show options menu
    ↓
User selects new option
    ↓
Stop current stream
    ↓
Request new stream
    ↓
Update UI
    ↓
Send new stream to participants
```

---

## 🌐 دعم المتصفحات

| المتصفح | الدعم | الملاحظات |
|---------|-------|-----------|
| Chrome | ✅ كامل | يدعم جميع الميزات |
| Firefox | ✅ كامل | يدعم جميع الميزات |
| Edge | ✅ كامل | يدعم جميع الميزات |
| Safari | ⚠️ جزئي | يتطلب iOS 13+ / macOS 10.15+ |
| Opera | ✅ كامل | يدعم جميع الميزات |

---

## 📊 معلومات الجودة

### الدقة المدعومة
- **1080p**: 1920x1080 @ 30fps (موصى به)
- **720p**: 1280x720 @ 30fps
- **480p**: 854x480 @ 30fps

### استهلاك النطاق الترددي
- **1080p**: ~2-3 Mbps
- **720p**: ~1-1.5 Mbps
- **480p**: ~0.5-1 Mbps

---

## 🔒 الأمان والخصوصية

### الأذونات
- يتطلب إذن صريح من المستخدم
- المستخدم يختار ما يشارك
- يمكن إيقاف المشاركة في أي وقت

### الخصوصية
- لا يتم تسجيل المشاركة بدون موافقة
- المستخدم يرى مؤشر "يشارك الآن"
- يمكن إخفاء نوافذ معينة (Chrome)

---

## 🎯 أفضل الممارسات

### للمطورين

**✅ افعل:**
- تحقق من دعم المتصفح قبل عرض الزر
- معالجة الأخطاء بشكل صحيح
- إيقاف stream عند انتهاء المشاركة
- عرض مؤشر واضح للمشاركة النشطة
- احترم اختيار المستخدم

**❌ لا تفعل:**
- لا تفترض دعم جميع المتصفحات
- لا تنسى إيقاف tracks عند الانتهاء
- لا تخفي مؤشر المشاركة
- لا تجبر المستخدم على نوع معين

### للمستخدمين

**✅ افعل:**
- اختر النافذة/التبويب المناسب
- أغلق النوافذ الحساسة قبل المشاركة
- استخدم "نافذة محددة" بدلاً من "الشاشة الكاملة"
- تحقق من المشاركة قبل البدء

**❌ لا تفعل:**
- لا تشارك الشاشة الكاملة إذا كانت هناك معلومات حساسة
- لا تنسى إيقاف المشاركة بعد الانتهاء
- لا تشارك نوافذ متعددة في نفس الوقت

---

## 🐛 استكشاف الأخطاء

### "مشاركة الشاشة غير مدعومة"
```javascript
// التحقق من الدعم
if (!ScreenShareService.isSupported()) {
  console.error('Screen sharing not supported');
  // عرض رسالة للمستخدم
}
```

### "تم رفض الإذن"
```javascript
try {
  const stream = await screenShareService.startScreenShare();
} catch (error) {
  if (error.message.includes('رفض')) {
    // المستخدم رفض الإذن
    console.log('User denied permission');
  }
}
```

### "مشاركة نشطة بالفعل"
```javascript
// التحقق قبل البدء
if (screenShareService.isSharing()) {
  console.log('Already sharing');
  return;
}
```

---

## 📈 التحسينات المستقبلية

### المرحلة 1 (الحالية)
- ✅ مشاركة الشاشة الكاملة
- ✅ مشاركة نافذة محددة
- ✅ مشاركة تبويب المتصفح
- ✅ تبديل المصدر
- ✅ معلومات الجودة

### المرحلة 2 (قريباً)
- [ ] Adaptive quality (تعديل الجودة حسب الشبكة)
- [ ] Annotation tools (أدوات الرسم على الشاشة)
- [ ] Pointer sharing (مشاركة مؤشر الماوس)
- [ ] Recording (تسجيل المشاركة)

### المرحلة 3 (مستقبلاً)
- [ ] Multiple screen shares (عدة مشاركات في نفس الوقت)
- [ ] Screen share permissions (أذونات متقدمة)
- [ ] Screen share analytics (إحصائيات الاستخدام)

---

## 📚 المراجع

- [MDN - Screen Capture API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API)
- [WebRTC Screen Sharing](https://webrtc.org/getting-started/media-capture-and-constraints)
- [Chrome Screen Sharing](https://developer.chrome.com/docs/web-platform/screen-sharing-controls)

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: ✅ مكتمل ومفعّل
