# لوحة إدارة المقابلات - توثيق شامل

## 📋 معلومات النظام
- **تاريخ الإنشاء**: 2026-03-02
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6

---

## 🎯 نظرة عامة

لوحة إدارة المقابلات هي نظام شامل لإدارة مقابلات الفيديو، تتيح للمستخدمين:
- عرض المقابلات القادمة والسابقة
- الوصول للتسجيلات
- إضافة ملاحظات وتقييمات
- البحث والفلترة المتقدمة
- عرض الإحصائيات

---

## 📁 الملفات الأساسية

### Backend
```
backend/src/
├── controllers/
│   └── videoInterviewController.js    # 7 وظائف جديدة
├── routes/
│   └── videoInterviewRoutes.js        # 7 مسارات جديدة
└── models/
    └── VideoInterview.js              # نموذج موجود
```

### Frontend
```
frontend/src/
├── pages/
│   ├── InterviewDashboard.jsx         # الصفحة الرئيسية
│   └── InterviewDashboard.css         # التنسيقات
└── components/
    ├── InterviewNotes.jsx             # مكون الملاحظات والتقييم
    ├── InterviewNotes.css
    ├── InterviewFilters.jsx           # مكون الفلترة المتقدمة
    └── InterviewFilters.css
```

---

## 🔧 API Endpoints

### 1. الحصول على المقابلات القادمة
```http
GET /api/video-interviews/upcoming?page=1&limit=10
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "interviews": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

**Requirements**: 8.1

---

### 2. الحصول على المقابلات السابقة
```http
GET /api/video-interviews/past?page=1&limit=10&status=ended
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): رقم الصفحة (افتراضي: 1)
- `limit` (optional): عدد النتائج (افتراضي: 10)
- `status` (optional): تصفية حسب الحالة (ended, cancelled)

**Requirements**: 8.2

---

### 3. الحصول على تفاصيل مقابلة
```http
GET /api/video-interviews/:interviewId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "interview": {
    "_id": "...",
    "roomId": "...",
    "hostId": {...},
    "participants": [...],
    "status": "ended",
    "scheduledAt": "2026-03-01T10:00:00Z",
    "startedAt": "2026-03-01T10:05:00Z",
    "endedAt": "2026-03-01T10:35:00Z",
    "duration": 1800,
    "recording": {
      "status": "ready",
      "videoUrl": "...",
      "thumbnailUrl": "..."
    },
    "notes": "...",
    "rating": 4
  },
  "userRole": "host"
}
```

**Requirements**: 8.1, 8.2, 8.3

---

### 4. إضافة ملاحظات
```http
PUT /api/video-interviews/:interviewId/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "المرشح أظهر مهارات ممتازة في البرمجة..."
}
```

**Validation**:
- ✅ المستخدم يجب أن يكون المضيف
- ✅ المقابلة يجب أن تكون منتهية (status: 'ended')

**Requirements**: 8.4

---

### 5. تقييم المرشح
```http
PUT /api/video-interviews/:interviewId/rating
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4
}
```

**Validation**:
- ✅ التقييم بين 1 و 5
- ✅ المستخدم يجب أن يكون المضيف
- ✅ المقابلة يجب أن تكون منتهية

**Requirements**: 8.5

---

### 6. البحث والفلترة
```http
GET /api/video-interviews/search?page=1&limit=10&status=ended&startDate=2026-03-01&endDate=2026-03-31&search=john
Authorization: Bearer <token>
```

**Query Parameters**:
- `page` (optional): رقم الصفحة
- `limit` (optional): عدد النتائج
- `status` (optional): الحالة (scheduled, waiting, active, ended, cancelled)
- `startDate` (optional): تاريخ البداية (YYYY-MM-DD)
- `endDate` (optional): تاريخ النهاية (YYYY-MM-DD)
- `search` (optional): البحث النصي (في الأسماء والملاحظات)

**Requirements**: 8.6

---

### 7. الحصول على الإحصائيات
```http
GET /api/video-interviews/stats
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "upcoming": 5,
    "completed": 23,
    "cancelled": 2,
    "withRecordings": 18
  }
}
```

---

## 🎨 Frontend Components

### 1. InterviewDashboard (الصفحة الرئيسية)

**الميزات**:
- ✅ 3 تبويبات (القادمة، السابقة، البحث)
- ✅ بطاقات إحصائيات (4 بطاقات)
- ✅ قائمة المقابلات مع pagination
- ✅ أزرار الإجراءات (عرض، ملاحظات، تقييم، تحميل)
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب

**الاستخدام**:
```jsx
import InterviewDashboard from './pages/InterviewDashboard';

<Route path="/interviews" element={<InterviewDashboard />} />
```

---

### 2. InterviewNotes (الملاحظات والتقييم)

**الميزات**:
- ✅ textarea للملاحظات
- ✅ نظام تقييم بالنجوم (1-5)
- ✅ حفظ تلقائي
- ✅ رسائل نجاح/خطأ
- ✅ التحقق من الصلاحيات

**الاستخدام**:
```jsx
import InterviewNotes from './components/InterviewNotes';

<InterviewNotes
  interview={interview}
  onUpdate={() => fetchInterview()}
/>
```

**Props**:
- `interview` (required): كائن المقابلة
- `onUpdate` (optional): دالة تُستدعى بعد الحفظ

---

### 3. InterviewFilters (الفلترة المتقدمة)

**الميزات**:
- ✅ فلترة حسب الحالة
- ✅ فلترة حسب نطاق التاريخ
- ✅ البحث النصي
- ✅ فلترة حسب التسجيل (يحتوي/لا يحتوي)
- ✅ فلترة حسب التقييم (يحتوي/لا يحتوي)
- ✅ فلترة حسب نطاق التقييم (1-5)

**الاستخدام**:
```jsx
import InterviewFilters from './components/InterviewFilters';

<InterviewFilters
  onFilter={(filters) => applyFilters(filters)}
  onClear={() => clearFilters()}
/>
```

**Props**:
- `onFilter` (required): دالة تُستدعى عند تطبيق الفلاتر
- `onClear` (required): دالة تُستدعى عند مسح الفلاتر

---

## 📊 بطاقات الإحصائيات

### 1. المقابلات القادمة
- **الأيقونة**: 📅
- **الاستعلام**: `status: ['scheduled', 'waiting']` + `scheduledAt >= now`

### 2. المقابلات المكتملة
- **الأيقونة**: ✅
- **الاستعلام**: `status: 'ended'`

### 3. المقابلات الملغاة
- **الأيقونة**: ❌
- **الاستعلام**: `status: 'cancelled'`

### 4. التسجيلات المتاحة
- **الأيقونة**: 🎥
- **الاستعلام**: `recording.status: 'ready'`

---

## 🎨 التصميم

### الألوان
- **Primary**: #304B60 (كحلي)
- **Secondary**: #E3DAD1 (بيج)
- **Accent**: #D48161 (نحاسي)
- **Border**: #D4816180 (نحاسي باهت)

### Status Badges
```css
.status-scheduled  { background: #e3f2fd; color: #1976d2; }
.status-waiting    { background: #fff3e0; color: #f57c00; }
.status-active     { background: #e8f5e9; color: #388e3c; }
.status-ended      { background: #f3e5f5; color: #7b1fa2; }
.status-cancelled  { background: #ffebee; color: #c62828; }
```

### Responsive Breakpoints
- **Desktop**: > 768px
- **Tablet**: 640px - 768px
- **Mobile**: < 640px

---

## 🔒 الأمان والصلاحيات

### التحقق من الصلاحيات

**في Backend**:
```javascript
// التحقق من أن المستخدم هو المضيف
if (interview.hostId.toString() !== userId.toString()) {
  return res.status(403).json({
    success: false,
    message: 'فقط المضيف يمكنه إضافة ملاحظات'
  });
}

// التحقق من أن المقابلة انتهت
if (interview.status !== 'ended') {
  return res.status(400).json({
    success: false,
    message: 'لا يمكن إضافة ملاحظات إلا بعد انتهاء المقابلة'
  });
}
```

**في Frontend**:
```javascript
const userId = localStorage.getItem('userId');
const isHost = interview.hostId?._id === userId;
const isEnded = interview.status === 'ended';

if (!isHost || !isEnded) {
  // عرض رسالة تحذير
}
```

---

## 📱 التصميم المتجاوب

### Desktop (> 768px)
- Grid layout للبطاقات (4 أعمدة)
- Tabs أفقية
- Filters في صف واحد

### Tablet (640px - 768px)
- Grid layout للبطاقات (2 أعمدة)
- Tabs أفقية مع scroll
- Filters في صفين

### Mobile (< 640px)
- Grid layout للبطاقات (عمود واحد)
- Tabs أفقية مع scroll
- Filters عمودية
- أزرار الإجراءات عمودية (full width)

---

## 🌍 دعم متعدد اللغات

### اللغات المدعومة
- ✅ العربية (ar)
- ✅ الإنجليزية (en)
- ✅ الفرنسية (fr)

### الترجمات
جميع النصوص مترجمة بالكامل في:
- `InterviewDashboard.jsx`
- `InterviewNotes.jsx`
- `InterviewFilters.jsx`

---

## 🧪 الاختبار

### اختبار Backend

```bash
# اختبار الحصول على المقابلات القادمة
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/video-interviews/upcoming

# اختبار إضافة ملاحظات
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"notes":"ملاحظات الاختبار"}' \
  http://localhost:5000/api/video-interviews/<id>/notes

# اختبار التقييم
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating":4}' \
  http://localhost:5000/api/video-interviews/<id>/rating
```

### اختبار Frontend

1. **المقابلات القادمة**:
   - افتح `/interviews`
   - تحقق من عرض المقابلات القادمة
   - تحقق من الإحصائيات

2. **المقابلات السابقة**:
   - انقر على تبويب "المقابلات السابقة"
   - تحقق من عرض المقابلات المنتهية

3. **الملاحظات والتقييم**:
   - افتح مقابلة منتهية
   - أضف ملاحظات
   - أضف تقييم (1-5 نجوم)

4. **البحث والفلترة**:
   - انقر على تبويب "البحث والفلترة"
   - جرب الفلاتر المختلفة
   - تحقق من النتائج

---

## 🐛 استكشاف الأخطاء

### "المقابلات لا تظهر"
```javascript
// تحقق من:
1. Token صحيح في localStorage
2. API URL صحيح في .env
3. المستخدم لديه مقابلات
4. الاتصال بالـ Backend يعمل
```

### "لا يمكن إضافة ملاحظات"
```javascript
// تحقق من:
1. المستخدم هو المضيف
2. المقابلة منتهية (status: 'ended')
3. Token صحيح
```

### "الفلاتر لا تعمل"
```javascript
// تحقق من:
1. Query parameters صحيحة
2. التواريخ بصيغة صحيحة (YYYY-MM-DD)
3. الاستعلام في Backend يعمل
```

---

## 📈 الفوائد المتوقعة

- 📊 **إدارة أفضل**: لوحة تحكم شاملة لجميع المقابلات
- ⏱️ **توفير الوقت**: الوصول السريع للمقابلات والتسجيلات
- 📝 **توثيق أفضل**: ملاحظات وتقييمات منظمة
- 🔍 **بحث فعال**: فلترة متقدمة للعثور على المقابلات
- 📈 **إحصائيات واضحة**: نظرة عامة على جميع المقابلات

---

## 🔄 التحسينات المستقبلية

### المرحلة 2
- [ ] تصدير المقابلات (PDF, Excel)
- [ ] تقارير مفصلة
- [ ] رسوم بيانية للإحصائيات
- [ ] مقارنة المرشحين

### المرحلة 3
- [ ] تكامل مع نظام التوظيف
- [ ] إشعارات تلقائية
- [ ] تذكيرات المقابلات
- [ ] مشاركة التسجيلات مع الفريق

---

## ✅ Checklist التنفيذ

- [x] Backend API endpoints (7 endpoints)
- [x] Frontend Dashboard page
- [x] Frontend Notes component
- [x] Frontend Filters component
- [x] CSS styling (responsive)
- [x] Multi-language support (ar, en, fr)
- [x] Error handling
- [x] Loading states
- [x] Pagination
- [x] Documentation

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الحالة**: ✅ مكتمل ومفعّل
