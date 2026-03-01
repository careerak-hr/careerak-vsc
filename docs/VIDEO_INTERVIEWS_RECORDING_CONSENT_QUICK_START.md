# نظام الموافقة على التسجيل - دليل البدء السريع

## ⚡ البدء السريع (5 دقائق)

### 1. استيراد المكونات

```jsx
import RecordingConsentModal from './components/VideoCall/RecordingConsentModal';
import ConsentStatusIndicator from './components/VideoCall/ConsentStatusIndicator';
```

### 2. إعداد الحالة

```jsx
const [showConsentModal, setShowConsentModal] = useState(false);
const [participants, setParticipants] = useState([]);
const [hasAllConsents, setHasAllConsents] = useState(false);
```

### 3. جلب حالة الموافقة

```jsx
useEffect(() => {
  const checkConsents = async () => {
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
  
  checkConsents();
}, []);
```

### 4. معالجة الموافقة/الرفض

```jsx
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
  // تحديث الحالة
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
  // تحديث الحالة
};
```

### 5. عرض المكونات

```jsx
return (
  <div>
    {/* نافذة الموافقة (للمشاركين) */}
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
```

---

## 🔌 API Endpoints

### إضافة موافقة
```bash
POST /api/interviews/:id/recording/consent
Body: { "consented": true }
```

### التحقق من الموافقات
```bash
GET /api/interviews/:id/recording/consents
```

### بدء التسجيل
```bash
POST /api/interviews/:id/recording/start
```

---

## ✅ Checklist

- [ ] استيراد المكونات
- [ ] إعداد الحالة
- [ ] جلب حالة الموافقة
- [ ] معالجة الموافقة/الرفض
- [ ] عرض المكونات
- [ ] اختبار كمشارك
- [ ] اختبار كمضيف

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- `frontend/src/components/VideoCall/README_RECORDING_CONSENT.md`
- `docs/VIDEO_INTERVIEWS_RECORDING_CONSENT_IMPLEMENTATION.md`

---

**تاريخ الإنشاء**: 2026-03-01
