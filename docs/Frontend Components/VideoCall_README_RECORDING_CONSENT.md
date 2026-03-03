# نظام الموافقة على تسجيل المقابلات

## 📋 نظرة عامة

نظام شامل لطلب والحصول على موافقة صريحة من جميع المشاركين قبل بدء تسجيل مقابلة الفيديو.

**Requirements**: 2.3 (موافقة المرشح إلزامية قبل التسجيل)

---

## 🎯 الميزات الرئيسية

### 1. RecordingConsentModal
- ✅ نافذة منبثقة لطلب الموافقة
- ✅ شرح واضح للغرض من التسجيل
- ✅ معلومات الخصوصية والأمان
- ✅ حقوق المستخدم
- ✅ خيارات قبول/رفض واضحة
- ✅ لا يمكن إغلاقها بدون اختيار
- ✅ دعم متعدد اللغات (ar, en, fr)

### 2. ConsentStatusIndicator
- ✅ عرض قائمة المشاركين وحالة موافقتهم
- ✅ مؤشرات بصرية (✓ موافق، ✗ رفض، ⏳ في الانتظار)
- ✅ تحديث في الوقت الفعلي
- ✅ عرض للمضيف فقط

### 3. Backend Integration
- ✅ API endpoints للموافقة
- ✅ التحقق من موافقة جميع المشاركين
- ✅ منع بدء التسجيل بدون موافقة

---

## 📦 المكونات

### RecordingConsentModal

```jsx
import RecordingConsentModal from './components/VideoCall/RecordingConsentModal';

<RecordingConsentModal
  isOpen={showConsentModal}
  onConsent={handleConsent}
  onDecline={handleDecline}
  hostName="أحمد محمد"
  language="ar"
  isLoading={false}
/>
```

**Props:**
- `isOpen` (boolean): عرض/إخفاء النافذة
- `onConsent` (function): دالة تُنفذ عند الموافقة
- `onDecline` (function): دالة تُنفذ عند الرفض
- `hostName` (string): اسم المضيف
- `language` (string): اللغة (ar, en, fr)
- `isLoading` (boolean): حالة التحميل

### ConsentStatusIndicator

```jsx
import ConsentStatusIndicator from './components/VideoCall/ConsentStatusIndicator';

<ConsentStatusIndicator
  participants={[
    { userId: '1', name: 'أحمد', email: 'ahmed@example.com', consented: true },
    { userId: '2', name: 'سارة', email: 'sara@example.com', consented: null },
  ]}
  language="ar"
  showForHost={true}
/>
```

**Props:**
- `participants` (array): قائمة المشاركين وحالة موافقتهم
- `language` (string): اللغة (ar, en, fr)
- `showForHost` (boolean): عرض للمضيف فقط

---

## 🔌 Backend API

### 1. إضافة موافقة

```javascript
POST /api/interviews/:id/recording/consent

Headers:
  Authorization: Bearer <token>

Body:
{
  "consented": true  // أو false
}

Response:
{
  "success": true,
  "message": "تم تسجيل موافقتك على التسجيل",
  "hasAllConsents": false
}
```

### 2. التحقق من جميع الموافقات

```javascript
GET /api/interviews/:id/recording/consents

Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "hasAllConsents": false,
  "consentStatus": [
    {
      "userId": "user1",
      "name": "أحمد محمد",
      "email": "ahmed@example.com",
      "consented": true,
      "consentedAt": "2026-03-01T10:00:00Z"
    },
    {
      "userId": "user2",
      "name": "سارة أحمد",
      "email": "sara@example.com",
      "consented": null,
      "consentedAt": null
    }
  ]
}
```

### 3. بدء التسجيل

```javascript
POST /api/interviews/:id/recording/start

Headers:
  Authorization: Bearer <token>

Response (Success):
{
  "success": true,
  "message": "تم بدء التسجيل بنجاح",
  "recording": {
    "status": "recording",
    "startedAt": "2026-03-01T10:00:00Z"
  }
}

Response (Error - No Consents):
{
  "success": false,
  "message": "يجب الحصول على موافقة جميع المشاركين قبل بدء التسجيل"
}
```

---

## 🎬 مثال كامل

```jsx
import React, { useState, useEffect } from 'react';
import RecordingConsentModal from './components/VideoCall/RecordingConsentModal';
import ConsentStatusIndicator from './components/VideoCall/ConsentStatusIndicator';

const VideoInterviewPage = () => {
  const [interviewId] = useState('interview-123');
  const [userId] = useState('user-456');
  const [isHost] = useState(false);
  
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [hasAllConsents, setHasAllConsents] = useState(false);

  // جلب حالة الموافقة
  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = async () => {
    const response = await fetch(`/api/interviews/${interviewId}/recording/consents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    setHasAllConsents(data.hasAllConsents);
    setParticipants(data.consentStatus);
    
    // إذا كان المستخدم مشارك ولم يوافق بعد
    if (!isHost) {
      const myConsent = data.consentStatus.find(p => p.userId === userId);
      if (myConsent && myConsent.consented === null) {
        setShowConsentModal(true);
      }
    }
  };

  const handleConsent = async () => {
    await fetch(`/api/interviews/${interviewId}/recording/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ consented: true })
    });
    
    setShowConsentModal(false);
    await checkConsentStatus();
  };

  const handleDecline = async () => {
    await fetch(`/api/interviews/${interviewId}/recording/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ consented: false })
    });
    
    setShowConsentModal(false);
    await checkConsentStatus();
  };

  const handleStartRecording = async () => {
    if (!hasAllConsents) {
      alert('يجب الحصول على موافقة جميع المشاركين أولاً');
      return;
    }
    
    await fetch(`/api/interviews/${interviewId}/recording/start`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };

  return (
    <div>
      {/* نافذة الموافقة */}
      <RecordingConsentModal
        isOpen={showConsentModal}
        onConsent={handleConsent}
        onDecline={handleDecline}
        hostName="أحمد محمد"
        language="ar"
      />

      {/* مؤشر الحالة (للمضيف) */}
      {isHost && (
        <ConsentStatusIndicator
          participants={participants}
          language="ar"
          showForHost={true}
        />
      )}

      {/* زر بدء التسجيل (للمضيف) */}
      {isHost && (
        <button
          onClick={handleStartRecording}
          disabled={!hasAllConsents}
        >
          {hasAllConsents ? 'بدء التسجيل' : 'في انتظار الموافقات'}
        </button>
      )}
    </div>
  );
};
```

---

## 🔒 الأمان والخصوصية

### 1. الموافقة الإلزامية
- ✅ لا يمكن بدء التسجيل بدون موافقة جميع المشاركين
- ✅ Backend يتحقق من الموافقات قبل بدء التسجيل
- ✅ رسالة خطأ واضحة إذا لم تكتمل الموافقات

### 2. الشفافية
- ✅ شرح واضح للغرض من التسجيل
- ✅ معلومات الخصوصية والأمان
- ✅ حقوق المستخدم موضحة بوضوح

### 3. حقوق المستخدم
- ✅ يمكن رفض التسجيل دون تأثير على الفرصة
- ✅ يمكن طلب إيقاف التسجيل في أي وقت
- ✅ يمكن الوصول إلى التسجيل بعد المقابلة

### 4. التخزين الآمن
- ✅ التسجيلات مشفرة
- ✅ حذف تلقائي بعد 90 يوم
- ✅ لا مشاركة مع أطراف خارجية

---

## 📱 التصميم المتجاوب

جميع المكونات متجاوبة بالكامل:
- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)

---

## 🌍 دعم متعدد اللغات

- ✅ العربية (ar)
- ✅ الإنجليزية (en)
- ✅ الفرنسية (fr)

---

## ✅ معايير القبول

- [x] نافذة طلب الموافقة تعمل بشكل صحيح
- [x] شرح واضح للغرض من التسجيل
- [x] معلومات الخصوصية والأمان موضحة
- [x] خيارات قبول/رفض واضحة
- [x] لا يمكن إغلاق النافذة بدون اختيار
- [x] مؤشر حالة الموافقة يعمل بشكل صحيح
- [x] Backend يتحقق من الموافقات قبل بدء التسجيل
- [x] رسالة خطأ واضحة إذا لم تكتمل الموافقات
- [x] دعم متعدد اللغات (ar, en, fr)
- [x] تصميم متجاوب على جميع الأجهزة

---

## 🧪 الاختبار

### اختبار يدوي:

1. **كمشارك:**
   - انضم للمقابلة
   - يجب أن تظهر نافذة طلب الموافقة
   - اقرأ المعلومات
   - اختر "أوافق" أو "لا أوافق"
   - تحقق من إرسال الموافقة للـ Backend

2. **كمضيف:**
   - انضم للمقابلة
   - يجب أن ترى مؤشر حالة الموافقة
   - تحقق من عرض جميع المشاركين وحالتهم
   - حاول بدء التسجيل قبل اكتمال الموافقات (يجب أن يفشل)
   - انتظر حتى يوافق الجميع
   - ابدأ التسجيل (يجب أن ينجح)

### اختبار API:

```bash
# 1. إضافة موافقة
curl -X POST http://localhost:5000/api/interviews/interview-123/recording/consent \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"consented": true}'

# 2. التحقق من الموافقات
curl http://localhost:5000/api/interviews/interview-123/recording/consents \
  -H "Authorization: Bearer <token>"

# 3. بدء التسجيل (يجب أن يفشل إذا لم يوافق الجميع)
curl -X POST http://localhost:5000/api/interviews/interview-123/recording/start \
  -H "Authorization: Bearer <token>"
```

---

## 📚 المراجع

- **Requirements**: `.kiro/specs/video-interviews/requirements.md` - Section 2.3
- **Design**: `.kiro/specs/video-interviews/design.md` - Section 6 (RecordingService)
- **Tasks**: `.kiro/specs/video-interviews/tasks.md` - Task 7.2

---

**تاريخ الإنشاء**: 2026-03-01  
**آخر تحديث**: 2026-03-01  
**الحالة**: ✅ مكتمل
