# دليل البدء السريع - جدولة مقابلات الفيديو

## ⚡ البدء في 5 دقائق

### 1. جدولة مقابلة جديدة

```bash
curl -X POST https://careerak.com/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "video_interview",
    "title": "مقابلة توظيف",
    "participants": ["userId1"],
    "scheduledAt": "2026-03-05T10:00:00Z",
    "duration": 60
  }'
```

**النتيجة**:
```json
{
  "success": true,
  "appointment": {
    "id": "...",
    "meetingLink": "https://careerak.com/video-interview/room-id",
    "scheduledAt": "2026-03-05T10:00:00Z"
  }
}
```

### 2. الحصول على المواعيد القادمة

```bash
curl https://careerak.com/api/appointments?upcoming=true \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. إعادة جدولة موعد

```bash
curl -X PUT https://careerak.com/api/appointments/APPOINTMENT_ID/reschedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduledAt": "2026-03-06T14:00:00Z",
    "reason": "تعارض في المواعيد"
  }'
```

---

## 🎨 مثال Frontend (React)

```jsx
import { useState, useEffect } from 'react';

function ScheduleInterview({ candidateId }) {
  const [scheduledAt, setScheduledAt] = useState('');
  
  const handleSchedule = async () => {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'video_interview',
        title: 'مقابلة توظيف',
        participants: [candidateId],
        scheduledAt,
        duration: 60,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('تم جدولة المقابلة بنجاح!');
      console.log('رابط المقابلة:', data.appointment.meetingLink);
    }
  };
  
  return (
    <div>
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
      />
      <button onClick={handleSchedule}>جدولة المقابلة</button>
    </div>
  );
}
```

---

## 🔔 التذكيرات التلقائية

**تعمل تلقائياً!** لا حاجة لإعداد إضافي.

- ✅ تذكير قبل 24 ساعة
- ✅ تذكير قبل 15 دقيقة
- ✅ Cron Job يعمل كل 5 دقائق

---

## ⏰ زر "انضم الآن"

```jsx
function AppointmentCard({ appointment }) {
  const [canJoin, setCanJoin] = useState(false);
  
  useEffect(() => {
    const checkCanJoin = async () => {
      const response = await fetch(`/api/appointments/${appointment._id}`);
      const data = await response.json();
      setCanJoin(data.canJoin);
    };
    
    const interval = setInterval(checkCanJoin, 60000);
    checkCanJoin();
    
    return () => clearInterval(interval);
  }, [appointment._id]);
  
  return (
    <div>
      {canJoin ? (
        <a href={appointment.meetingLink}>
          <button>انضم الآن</button>
        </a>
      ) : (
        <p>سيتم تفعيل الزر قبل 5 دقائق من الموعد</p>
      )}
    </div>
  );
}
```

---

## 📋 Endpoints السريعة

| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/api/appointments` | POST | جدولة موعد |
| `/api/appointments` | GET | قائمة المواعيد |
| `/api/appointments/:id` | GET | تفاصيل موعد |
| `/api/appointments/:id/respond` | PUT | قبول/رفض |
| `/api/appointments/:id/reschedule` | PUT | إعادة جدولة |
| `/api/appointments/:id/confirm` | PUT | تأكيد |
| `/api/appointments/:id` | DELETE | إلغاء |

---

## 🧪 اختبار سريع

```bash
cd backend
npm test -- appointment.test.js
```

**النتيجة المتوقعة**: ✅ 15/15 اختبارات نجحت

---

## 📚 التوثيق الكامل

📄 `docs/VIDEO_INTERVIEW_SCHEDULING.md` - دليل شامل (500+ سطر)

---

**تاريخ الإنشاء**: 2026-03-01
