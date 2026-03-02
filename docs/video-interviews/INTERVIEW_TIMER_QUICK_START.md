# مؤقت المقابلة - دليل البدء السريع ⏱️

## 🚀 البدء في 5 دقائق

### 1. الاستخدام الأساسي (دقيقة واحدة)

```jsx
import InterviewTimer from './components/VideoCall/InterviewTimer';

function MyInterview() {
  return (
    <InterviewTimer
      startTime={Date.now()}
      language="ar"
    />
  );
}
```

✅ هذا كل ما تحتاجه للبدء!

---

### 2. مع VideoCall Component (دقيقتان)

```jsx
import VideoCall from './components/VideoCall/VideoCall';
import { useState } from 'react';

function InterviewPage() {
  const [startTime] = useState(Date.now());

  return (
    <VideoCall
      localStream={localStream}
      remoteStream={remoteStream}
      interviewStartTime={startTime}
      showInterviewTimer={true}
      timerPosition="top-right"
      language="ar"
    />
  );
}
```

---

### 3. مع إيقاف مؤقت (3 دقائق)

```jsx
import InterviewTimer from './components/VideoCall/InterviewTimer';
import { useState } from 'react';

function InterviewWithControls() {
  const [startTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div>
      <InterviewTimer
        startTime={startTime}
        isActive={!isPaused}
        language="ar"
      />
      
      <button onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? '▶️ استئناف' : '⏸️ إيقاف مؤقت'}
      </button>
    </div>
  );
}
```

---

## 📊 Props السريعة

| Prop | مثال | الوصف |
|------|------|-------|
| `startTime` | `Date.now()` | وقت البدء |
| `isActive` | `true` | نشط/متوقف |
| `language` | `'ar'` | اللغة |
| `position` | `'top-right'` | الموقع |
| `showLabel` | `true` | عرض التسمية |

---

## 🎨 المواقع المتاحة

```jsx
// أعلى اليمين (افتراضي)
<InterviewTimer position="top-right" />

// أعلى اليسار
<InterviewTimer position="top-left" />

// أسفل اليمين
<InterviewTimer position="bottom-right" />

// أسفل اليسار
<InterviewTimer position="bottom-left" />
```

---

## 🌍 اللغات المدعومة

```jsx
// العربية (افتراضي)
<InterviewTimer language="ar" />

// الإنجليزية
<InterviewTimer language="en" />

// الفرنسية
<InterviewTimer language="fr" />
```

---

## 🧪 الاختبار السريع

```bash
# تشغيل الاختبارات
cd frontend
npm test -- InterviewTimer.test.jsx

# النتيجة المتوقعة: ✅ 15/15 نجحت
```

---

## 📱 المثال التفاعلي

```bash
# تشغيل المثال
cd frontend
npm run dev

# افتح في المتصفح
http://localhost:5173/examples/interview-timer
```

---

## 🔍 استكشاف الأخطاء السريع

### المؤقت لا يظهر؟
```jsx
// تأكد من startTime
const [startTime] = useState(Date.now()); // ✅
```

### المؤقت لا يتحدث؟
```jsx
// تأكد من isActive
<InterviewTimer isActive={true} /> // ✅
```

### الوقت غير صحيح؟
```jsx
// استخدم Date.now() وليس string
startTime={Date.now()} // ✅
startTime="2024-01-01" // ❌
```

---

## 📚 المزيد من المعلومات

- 📄 [التوثيق الشامل](./INTERVIEW_TIMER_IMPLEMENTATION.md)
- 📄 [ملف المتطلبات](../../.kiro/specs/video-interviews/requirements.md)
- 📄 [ملف المهام](../../.kiro/specs/video-interviews/tasks.md)

---

## ✅ الخلاصة

```jsx
// كل ما تحتاجه:
<InterviewTimer
  startTime={Date.now()}
  language="ar"
/>
```

**هذا كل شيء! 🎉**

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: جاهز للاستخدام
