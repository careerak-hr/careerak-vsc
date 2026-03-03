# نظام الفيديو للمقابلات - دليل البدء السريع للترجمات

## ⚡ البدء السريع (5 دقائق)

### 1. الاستيراد
```jsx
import { useVideoInterviewSection } from '../hooks/useVideoInterviewTranslations';
```

### 2. الاستخدام في المكون
```jsx
function MyVideoComponent() {
  const t = useVideoInterviewSection('videoCall');
  
  return (
    <div>
      <h1>{t.title}</h1>
      <button>{t.muteAudio}</button>
      <button>{t.shareScreen}</button>
    </div>
  );
}
```

### 3. الأقسام المتاحة
```javascript
'common'              // مشترك
'videoCall'           // مكالمة الفيديو
'deviceTest'          // اختبار الأجهزة
'waitingRoom'         // غرفة الانتظار
'recording'           // التسجيل
'screenShare'         // مشاركة الشاشة
'chat'                // الدردشة
'connectionQuality'   // جودة الاتصال
'raiseHand'           // رفع اليد
'groupCall'           // المكالمة الجماعية
'interviewManagement' // إدارة المقابلات
'interviewNotes'      // ملاحظات المقابلة
'timer'               // المؤقت
'errors'              // الأخطاء
```

---

## 📝 أمثلة سريعة

### مثال 1: زر بسيط
```jsx
const t = useVideoInterviewSection('videoCall');
<button>{t.muteAudio}</button>
```

### مثال 2: رسالة خطأ
```jsx
const t = useVideoInterviewSection('errors');
<div className="error">{t.connectionFailed}</div>
```

### مثال 3: عدة أقسام
```jsx
const videoCallT = useVideoInterviewSection('videoCall');
const commonT = useVideoInterviewSection('common');

<div>
  <h1>{videoCallT.title}</h1>
  <button>{commonT.close}</button>
</div>
```

---

## 🔄 تحويل مكون موجود

### قبل:
```jsx
const translations = {
  ar: { title: 'غرفة الانتظار' },
  en: { title: 'Waiting Room' }
};
const t = translations[language] || translations.ar;
```

### بعد:
```jsx
const t = useVideoInterviewSection('waitingRoom');
```

---

## ✅ Checklist

- [ ] استيراد Hook
- [ ] استخدام القسم المناسب
- [ ] اختبار مع اللغتين (عربي/إنجليزي)
- [ ] حذف الترجمات المحلية القديمة

---

**الوقت المتوقع**: 2-5 دقائق لكل مكون

