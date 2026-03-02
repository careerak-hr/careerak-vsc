# إعادة جدولة مقابلات الفيديو - دليل البدء السريع ⚡

## 🚀 البدء السريع (5 دقائق)

### 1. إعادة جدولة مقابلة (Frontend)

```javascript
const rescheduleInterview = async (interviewId, newDate, reason) => {
  const response = await fetch(`/api/interviews/${interviewId}/reschedule`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      newScheduledAt: newDate,
      reason: reason || ''
    })
  });

  return await response.json();
};

// الاستخدام
const result = await rescheduleInterview(
  'interview-id-here',
  '2026-03-10T14:00:00.000Z',
  'ظرف طارئ'
);

if (result.success) {
  console.log('تم إعادة الجدولة بنجاح!');
}
```

---

## 📋 API Reference

### Endpoint
```
PUT /api/interviews/:id/reschedule
```

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```json
{
  "newScheduledAt": "2026-03-10T14:00:00.000Z",  // مطلوب
  "reason": "ظرف طارئ"                          // اختياري
}
```

### Response
```json
{
  "success": true,
  "message": "تم إعادة جدولة المقابلة بنجاح",
  "interview": {
    "id": "...",
    "roomId": "...",
    "oldScheduledAt": "...",
    "newScheduledAt": "...",
    "status": "rescheduled"
  }
}
```

---

## ✅ القواعد

1. ✅ يمكن للمضيف أو أي مشارك إعادة الجدولة
2. ✅ الموعد الجديد يجب أن يكون في المستقبل
3. ❌ لا يمكن إعادة جدولة مقابلة بدأت أو انتهت
4. ❌ فقط المشاركين يمكنهم إعادة الجدولة

---

## 🔔 ماذا يحدث تلقائياً؟

1. ✅ تحديث VideoInterview
2. ✅ تحديث Appointment المرتبط
3. ✅ إرسال إشعارات لجميع المشاركين
4. ✅ إرسال بريد إلكتروني لجميع المشاركين
5. ✅ تغيير الحالة إلى 'rescheduled'

---

## 🎨 مثال UI Component (React)

```jsx
import { useState } from 'react';

function RescheduleButton({ interviewId, currentDate }) {
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReschedule = async () => {
    if (!newDate) {
      alert('يرجى تحديد موعد جديد');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/interviews/${interviewId}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          newScheduledAt: newDate,
          reason: reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('تم إعادة جدولة المقابلة بنجاح');
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('فشل إعادة جدولة المقابلة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reschedule-form">
      <h3>إعادة جدولة المقابلة</h3>
      
      <div>
        <label>الموعد الحالي:</label>
        <p>{new Date(currentDate).toLocaleString('ar-EG')}</p>
      </div>

      <div>
        <label>الموعد الجديد:</label>
        <input
          type="datetime-local"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>

      <div>
        <label>السبب (اختياري):</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="مثال: ظرف طارئ - أرجو المعذرة"
          rows={3}
        />
      </div>

      <button 
        onClick={handleReschedule}
        disabled={loading || !newDate}
      >
        {loading ? 'جاري إعادة الجدولة...' : 'إعادة الجدولة'}
      </button>
    </div>
  );
}

export default RescheduleButton;
```

---

## 🧪 الاختبار السريع

```bash
# 1. إعادة جدولة مقابلة
curl -X PUT http://localhost:5000/api/interviews/INTERVIEW_ID/reschedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newScheduledAt": "2026-03-10T14:00:00.000Z",
    "reason": "ظرف طارئ"
  }'

# 2. التحقق من الإشعارات
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ❌ الأخطاء الشائعة

### خطأ 400: "يجب تحديد الموعد الجديد"
```javascript
// ❌ خطأ
{ }

// ✅ صحيح
{ "newScheduledAt": "2026-03-10T14:00:00.000Z" }
```

### خطأ 400: "يجب أن يكون الموعد الجديد في المستقبل"
```javascript
// ❌ خطأ - موعد في الماضي
{ "newScheduledAt": "2020-01-01T10:00:00.000Z" }

// ✅ صحيح - موعد في المستقبل
{ "newScheduledAt": "2026-03-10T14:00:00.000Z" }
```

### خطأ 403: "ليس لديك صلاحية إعادة جدولة هذه المقابلة"
- السبب: المستخدم ليس مشاركاً في المقابلة
- الحل: تأكد من أن المستخدم مضيف أو مشارك

### خطأ 400: "لا يمكن إعادة جدولة مقابلة بدأت أو انتهت"
- السبب: المقابلة في حالة 'active' أو 'ended'
- الحل: يمكن إعادة جدولة المقابلات في حالة 'scheduled' فقط

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/VIDEO_INTERVIEW_RESCHEDULE.md` - التوثيق الشامل

---

## 💡 نصائح

1. **استخدم datetime-local input** لسهولة اختيار الموعد
2. **أضف تأكيد** قبل إعادة الجدولة
3. **اعرض الموعد القديم والجديد** للمقارنة
4. **أضف validation** للتأكد من أن الموعد في المستقبل
5. **اعرض loading state** أثناء العملية

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
