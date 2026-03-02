# لوحة إدارة المقابلات - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. Backend Setup

**إضافة المسارات إلى app.js**:
```javascript
// في backend/src/app.js
const videoInterviewRoutes = require('./routes/videoInterviewRoutes');
app.use('/api/video-interviews', videoInterviewRoutes);
```

**إعادة تشغيل Backend**:
```bash
cd backend
npm run pm2:restart
```

---

### 2. Frontend Setup

**إضافة المسار إلى AppRoutes**:
```javascript
// في frontend/src/routes/AppRoutes.jsx
import InterviewDashboard from '../pages/InterviewDashboard';

<Route path="/interviews" element={<InterviewDashboard />} />
```

**إضافة رابط في Navbar**:
```jsx
<Link to="/interviews">المقابلات</Link>
```

---

### 3. الاستخدام الأساسي

**عرض المقابلات القادمة**:
```javascript
// افتح المتصفح
http://localhost:5173/interviews

// سترى:
// - بطاقات الإحصائيات (4 بطاقات)
// - قائمة المقابلات القادمة
// - أزرار الإجراءات
```

**إضافة ملاحظات**:
```javascript
// 1. افتح مقابلة منتهية
// 2. انقر "إضافة ملاحظات"
// 3. اكتب الملاحظات
// 4. انقر "حفظ"
```

**تقييم المرشح**:
```javascript
// 1. افتح مقابلة منتهية
// 2. انقر "تقييم المرشح"
// 3. اختر من 1 إلى 5 نجوم
```

---

## 📋 API Endpoints السريعة

### الحصول على المقابلات القادمة
```bash
GET /api/video-interviews/upcoming
```

### الحصول على المقابلات السابقة
```bash
GET /api/video-interviews/past
```

### إضافة ملاحظات
```bash
PUT /api/video-interviews/:id/notes
Body: { "notes": "..." }
```

### تقييم المرشح
```bash
PUT /api/video-interviews/:id/rating
Body: { "rating": 4 }
```

### البحث والفلترة
```bash
GET /api/video-interviews/search?status=ended&search=john
```

---

## 🎨 المكونات الجاهزة

### 1. InterviewDashboard
```jsx
import InterviewDashboard from './pages/InterviewDashboard';

<InterviewDashboard />
```

### 2. InterviewNotes
```jsx
import InterviewNotes from './components/InterviewNotes';

<InterviewNotes
  interview={interview}
  onUpdate={() => fetchInterview()}
/>
```

### 3. InterviewFilters
```jsx
import InterviewFilters from './components/InterviewFilters';

<InterviewFilters
  onFilter={(filters) => applyFilters(filters)}
  onClear={() => clearFilters()}
/>
```

---

## ✅ Checklist السريع

- [ ] Backend routes مضافة في app.js
- [ ] Backend يعمل (npm run pm2:status)
- [ ] Frontend route مضاف في AppRoutes
- [ ] رابط مضاف في Navbar
- [ ] اختبار عرض المقابلات
- [ ] اختبار إضافة ملاحظات
- [ ] اختبار التقييم
- [ ] اختبار البحث والفلترة

---

## 🐛 استكشاف الأخطاء السريع

### المقابلات لا تظهر؟
```bash
# 1. تحقق من Backend
curl http://localhost:5000/api/video-interviews/upcoming \
  -H "Authorization: Bearer <token>"

# 2. تحقق من Console
# افتح DevTools → Console → ابحث عن أخطاء

# 3. تحقق من Token
console.log(localStorage.getItem('token'))
```

### لا يمكن إضافة ملاحظات؟
```javascript
// تحقق من:
// 1. أنت المضيف؟
// 2. المقابلة منتهية؟
// 3. Token صحيح؟
```

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/VIDEO_INTERVIEW_DASHBOARD.md` - توثيق شامل

---

**تاريخ الإنشاء**: 2026-03-02  
**الحالة**: ✅ جاهز للاستخدام
