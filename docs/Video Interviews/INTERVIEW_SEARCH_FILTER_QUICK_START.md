# دليل البدء السريع - البحث والفلترة في المقابلات

## 🚀 البدء السريع (5 دقائق)

### 1. Backend API

**Endpoint**: `GET /api/video-interviews/search`

**المعاملات**:
```
page=1              # رقم الصفحة
limit=10            # عدد النتائج
status=ended        # الحالة (اختياري)
startDate=2026-01-01  # تاريخ البداية (اختياري)
endDate=2026-12-31    # تاريخ النهاية (اختياري)
search=مقابلة        # نص البحث (اختياري)
```

**مثال**:
```bash
curl -X GET "http://localhost:5000/api/video-interviews/search?status=ended&search=ممتازة" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Frontend Component

**الاستخدام**:
```jsx
import InterviewDashboard from './pages/InterviewDashboard';

// في App.jsx أو Router
<Route path="/interviews" element={<InterviewDashboard />} />
```

**الوصول**:
```
http://localhost:3000/interviews
```

---

### 3. الفلاتر المتاحة

| الفلتر | النوع | القيم المتاحة |
|--------|------|---------------|
| **الحالة** | Select | scheduled, waiting, active, ended, cancelled |
| **تاريخ البداية** | Date | أي تاريخ |
| **تاريخ النهاية** | Date | أي تاريخ |
| **البحث** | Text | أي نص |

---

### 4. أمثلة سريعة

**جميع المقابلات**:
```javascript
const response = await fetch('/api/video-interviews/search', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**المقابلات المنتهية**:
```javascript
const response = await fetch('/api/video-interviews/search?status=ended', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**البحث في الملاحظات**:
```javascript
const response = await fetch('/api/video-interviews/search?search=ممتازة', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**دمج الفلاتر**:
```javascript
const response = await fetch(
  '/api/video-interviews/search?status=ended&startDate=2026-01-01&search=مهمة&page=1&limit=10',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

---

### 5. الاستجابة

```json
{
  "success": true,
  "interviews": [
    {
      "_id": "...",
      "status": "ended",
      "scheduledAt": "2026-01-15T10:00:00Z",
      "hostId": { "name": "مسؤول التوظيف" },
      "participants": [
        { "userId": { "name": "المرشح" } }
      ],
      "notes": "مقابلة ممتازة",
      "rating": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 6. الاختبار

```bash
cd backend
npm test -- videoInterviewSearch.test.js
```

---

## 📱 الاستخدام في Frontend

### في React Component

```jsx
const [filters, setFilters] = useState({
  status: '',
  startDate: '',
  endDate: '',
  search: ''
});

const fetchInterviews = async () => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.search) params.append('search', filters.search);
  
  const response = await fetch(
    `/api/video-interviews/search?${params.toString()}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  
  const data = await response.json();
  setInterviews(data.interviews);
};
```

---

## 🎯 نصائح سريعة

1. **البحث النصي**: يبحث في اسم المضيف، أسماء المشاركين، والملاحظات
2. **الفلترة حسب التاريخ**: استخدم ISO format (YYYY-MM-DD)
3. **Pagination**: استخدم `page` و `limit` للتنقل
4. **دمج الفلاتر**: يمكن استخدام جميع الفلاتر معاً
5. **الترتيب**: النتائج مرتبة حسب التاريخ (الأحدث أولاً)

---

## 🔒 الأمان

- ✅ جميع الطلبات تحتاج `Authorization` header
- ✅ المستخدم يرى مقابلاته فقط
- ✅ التحقق من الهوية تلقائي

---

## 📚 المزيد من المعلومات

- **التوثيق الكامل**: `INTERVIEW_SEARCH_FILTER_IMPLEMENTATION.md`
- **Requirements**: `.kiro/specs/video-interviews/requirements.md`
- **Component**: `frontend/src/pages/InterviewDashboard.jsx`

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
