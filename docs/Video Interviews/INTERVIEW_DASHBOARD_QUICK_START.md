# 📊 لوحة إدارة المقابلات - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. الوصول للوحة التحكم

```javascript
// في المتصفح
http://localhost:3000/interview-dashboard

// أو في React Router
<Route path="/interview-dashboard" element={<InterviewDashboard />} />
```

### 2. API Endpoints الأساسية

```javascript
const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// المقابلات القادمة
GET /interviews/upcoming?page=1&limit=10

// المقابلات السابقة
GET /interviews/past?page=1&limit=10

// البحث
GET /interviews/search?search=test&status=ended

// الإحصائيات
GET /interviews/stats

// تفاصيل مقابلة
GET /interviews/:interviewId

// إضافة ملاحظات
PUT /interviews/:interviewId/notes
Body: { notes: "ملاحظات المقابلة" }

// تقييم المرشح
PUT /interviews/:interviewId/rating
Body: { rating: 5 }
```

### 3. مثال كامل - جلب المقابلات السابقة

```javascript
const fetchPastInterviews = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/interviews/past?page=1&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    console.log('Past Interviews:', data.interviews);
    console.log('Pagination:', data.pagination);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 4. مثال كامل - إضافة ملاحظات

```javascript
const addNotes = async (interviewId, notes) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/interviews/${interviewId}/notes`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      }
    );

    if (!response.ok) throw new Error('Failed to add notes');

    const data = await response.json();
    console.log('Notes added:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// الاستخدام
addNotes('interview-id-here', 'مقابلة ممتازة، المرشح مؤهل جداً');
```

### 5. مثال كامل - تقييم المرشح

```javascript
const rateCandidate = async (interviewId, rating) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/interviews/${interviewId}/rating`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating })
      }
    );

    if (!response.ok) throw new Error('Failed to rate');

    const data = await response.json();
    console.log('Rating added:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// الاستخدام
rateCandidate('interview-id-here', 5); // 5 نجوم
```

---

## 📊 الميزات الرئيسية

### 1. المقابلات القادمة
- عرض جميع المقابلات المجدولة
- حالة المقابلة (scheduled, waiting, active)
- معلومات المشاركين

### 2. المقابلات السابقة
- سجل كامل للمقابلات المنتهية
- مدة المقابلة
- حالة التسجيل
- الملاحظات والتقييم

### 3. البحث والفلترة
- بحث نصي
- فلترة حسب الحالة
- فلترة حسب التاريخ

### 4. الإحصائيات
- المقابلات القادمة
- المقابلات المكتملة
- المقابلات الملغاة
- التسجيلات المتاحة

---

## 🎨 التخصيص

### تغيير عدد المقابلات في الصفحة

```javascript
const [pagination, setPagination] = useState({
  page: 1,
  limit: 20, // غيّر هنا (الافتراضي: 10)
  total: 0,
  pages: 0
});
```

### تغيير الألوان

```css
/* في InterviewDashboard.css */
.stat-card {
  border: 2px solid #D4816180; /* غيّر اللون هنا */
}

.status-ended {
  background: #f3e5f5; /* غيّر لون الخلفية */
  color: #7b1fa2;      /* غيّر لون النص */
}
```

### إضافة لغة جديدة

```javascript
const translations = {
  ar: { /* ... */ },
  en: { /* ... */ },
  fr: { /* ... */ },
  es: { // إسبانية جديدة
    title: 'Panel de Entrevistas',
    upcoming: 'Próximas Entrevistas',
    past: 'Entrevistas Pasadas',
    // ...
  }
};
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: "401 Unauthorized"
**الحل**: تأكد من وجود token صالح
```javascript
const token = localStorage.getItem('token');
if (!token) {
  // إعادة توجيه لصفحة تسجيل الدخول
  window.location.href = '/login';
}
```

### المشكلة: "404 Not Found"
**الحل**: تأكد من تسجيل المسارات في app.js
```javascript
// في backend/src/app.js
app.use('/interviews', require('./routes/videoInterviewRoutes'));
```

### المشكلة: لا تظهر المقابلات
**الحل**: تحقق من الاستعلام في Backend
```javascript
// في getPastInterviews
const query = {
  $or: [
    { hostId: userId },
    { 'participants.userId': userId }
  ],
  status: { $in: ['ended', 'cancelled'] }
};
```

### المشكلة: Pagination لا يعمل
**الحل**: تأكد من تمرير المعاملات الصحيحة
```javascript
const url = `/interviews/past?page=${page}&limit=${limit}`;
```

---

## 📱 التصميم المتجاوب

### Desktop (> 768px)
- 4 بطاقات إحصائيات في صف
- عرض كامل للبطاقات

### Tablet (640px - 768px)
- بطاقتان إحصائيات في صف
- تبويبات قابلة للتمرير

### Mobile (< 640px)
- بطاقة واحدة في صف
- أزرار بعرض كامل

---

## ✅ Checklist قبل الإنتاج

- [ ] جميع API endpoints تعمل
- [ ] Authentication يعمل بشكل صحيح
- [ ] Pagination يعمل
- [ ] الفلترة تعمل
- [ ] البحث يعمل
- [ ] إضافة الملاحظات تعمل
- [ ] التقييم يعمل
- [ ] التصميم متجاوب على جميع الأجهزة
- [ ] دعم 3 لغات يعمل
- [ ] الاختبارات تنجح

---

## 📚 المراجع السريعة

- [التوثيق الشامل](./INTERVIEW_DASHBOARD_IMPLEMENTATION.md)
- [Requirements](../../.kiro/specs/video-interviews/requirements.md)
- [Design](../../.kiro/specs/video-interviews/design.md)
- [Tasks](../../.kiro/specs/video-interviews/tasks.md)

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: جاهز للاستخدام
