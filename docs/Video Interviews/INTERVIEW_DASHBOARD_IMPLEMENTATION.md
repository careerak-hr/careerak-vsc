# 📊 لوحة إدارة المقابلات - دليل التنفيذ الشامل

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-03-02
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6

---

## 🎯 نظرة عامة

لوحة إدارة المقابلات هي واجهة شاملة تتيح للمستخدمين:
- عرض المقابلات القادمة
- استعراض سجل المقابلات السابقة
- الوصول السريع للتسجيلات
- إضافة ملاحظات وتقييمات
- البحث والفلترة في المقابلات
- عرض إحصائيات شاملة

---

## 🏗️ البنية التقنية

### Backend Components

#### 1. Models
```javascript
// VideoInterview Model
{
  roomId: String (unique),
  hostId: ObjectId (ref: User),
  participants: [{
    userId: ObjectId,
    role: 'host' | 'participant',
    joinedAt: Date,
    leftAt: Date
  }],
  status: 'scheduled' | 'waiting' | 'active' | 'ended' | 'cancelled',
  scheduledAt: Date,
  startedAt: Date,
  endedAt: Date,
  duration: Number,
  recording: {
    status: String,
    videoUrl: String,
    duration: Number
  },
  notes: String,
  rating: Number (1-5)
}
```

#### 2. API Endpoints

**GET /api/interviews/upcoming**
- الوصف: جلب المقابلات القادمة
- المعاملات: `page`, `limit`
- الاستجابة: قائمة المقابلات + pagination
- Requirements: 8.1

**GET /api/interviews/past**
- الوصف: جلب سجل المقابلات السابقة
- المعاملات: `page`, `limit`, `status`
- الاستجابة: قائمة المقابلات + pagination
- Requirements: 8.2

**GET /api/interviews/search**
- الوصف: البحث والفلترة في المقابلات
- المعاملات: `search`, `status`, `startDate`, `endDate`, `page`, `limit`
- الاستجابة: نتائج البحث + pagination
- Requirements: 8.6

**GET /api/interviews/stats**
- الوصف: إحصائيات المقابلات
- الاستجابة: 
  ```json
  {
    "upcoming": Number,
    "completed": Number,
    "cancelled": Number,
    "withRecordings": Number
  }
  ```

**GET /api/interviews/:interviewId**
- الوصف: تفاصيل مقابلة واحدة
- الاستجابة: بيانات المقابلة الكاملة
- Requirements: 8.1, 8.2, 8.3

**PUT /api/interviews/:interviewId/notes**
- الوصف: إضافة ملاحظات بعد المقابلة
- Body: `{ notes: String }`
- Requirements: 8.4

**PUT /api/interviews/:interviewId/rating**
- الوصف: تقييم المرشح
- Body: `{ rating: Number (1-5) }`
- Requirements: 8.5

#### 3. Controller Methods

```javascript
class VideoInterviewController {
  // جلب المقابلات القادمة
  static async getUpcomingInterviews(req, res)
  
  // جلب المقابلات السابقة
  static async getPastInterviews(req, res)
  
  // تفاصيل مقابلة واحدة
  static async getInterviewDetails(req, res)
  
  // إضافة ملاحظات
  static async addNotes(req, res)
  
  // تقييم المرشح
  static async rateCandidate(req, res)
  
  // البحث والفلترة
  static async searchInterviews(req, res)
  
  // الإحصائيات
  static async getInterviewStats(req, res)
}
```

### Frontend Components

#### 1. InterviewDashboard Component

**الموقع**: `frontend/src/pages/InterviewDashboard.jsx`

**الميزات**:
- ✅ 3 تبويبات: القادمة، السابقة، البحث
- ✅ بطاقات إحصائيات (4 مقاييس)
- ✅ Pagination للقوائم الطويلة
- ✅ فلترة حسب الحالة والتاريخ
- ✅ بحث نصي
- ✅ عرض معلومات المشاركين
- ✅ عرض حالة التسجيل
- ✅ إضافة ملاحظات وتقييمات
- ✅ تحميل التسجيلات
- ✅ دعم 3 لغات (ar, en, fr)
- ✅ تصميم متجاوب

**State Management**:
```javascript
const [activeTab, setActiveTab] = useState('upcoming');
const [interviews, setInterviews] = useState([]);
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [filters, setFilters] = useState({
  status: '',
  startDate: '',
  endDate: '',
  search: ''
});
const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
});
```

#### 2. CSS Styling

**الموقع**: `frontend/src/pages/InterviewDashboard.css`

**الميزات**:
- ✅ بطاقات إحصائيات جذابة
- ✅ تبويبات واضحة
- ✅ فلاتر منظمة
- ✅ بطاقات مقابلات احترافية
- ✅ Status badges ملونة
- ✅ أزرار تفاعلية
- ✅ Pagination واضح
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم RTL/LTR

---

## 📊 الميزات الرئيسية

### 1. المقابلات القادمة (Upcoming Interviews)

**الوصف**: عرض جميع المقابلات المجدولة أو النشطة

**المعلومات المعروضة**:
- اسم المضيف
- موعد المقابلة
- حالة المقابلة (scheduled, waiting, active)
- المشاركون
- إعدادات المقابلة

**الإجراءات المتاحة**:
- عرض التفاصيل
- الانضمام للمقابلة (إذا كانت نشطة)

### 2. المقابلات السابقة (Past Interviews)

**الوصف**: سجل كامل للمقابلات المنتهية أو الملغاة

**المعلومات المعروضة**:
- اسم المضيف
- تاريخ المقابلة
- حالة المقابلة (ended, cancelled)
- المشاركون
- مدة المقابلة
- حالة التسجيل
- الملاحظات
- التقييم

**الإجراءات المتاحة**:
- عرض التفاصيل
- إضافة ملاحظات (للمضيف فقط)
- تقييم المرشح (للمضيف فقط)
- تحميل التسجيل (إذا كان متاحاً)

**التصفية**:
- حسب الحالة (ended, cancelled)
- Pagination (10 مقابلات لكل صفحة)

### 3. البحث والفلترة (Search & Filter)

**الوصف**: بحث متقدم في جميع المقابلات

**خيارات الفلترة**:
- حسب الحالة (scheduled, waiting, active, ended, cancelled)
- حسب التاريخ (من - إلى)
- بحث نصي (في الأسماء والملاحظات)

**الإجراءات**:
- تطبيق الفلاتر
- مسح الفلاتر
- Pagination

### 4. الإحصائيات (Statistics)

**المقاييس المعروضة**:
- 📅 المقابلات القادمة
- ✅ المقابلات المكتملة
- ❌ المقابلات الملغاة
- 🎥 التسجيلات المتاحة

**التحديث**: تلقائي عند تحميل الصفحة

### 5. إضافة الملاحظات (Add Notes)

**الوصف**: إضافة ملاحظات بعد انتهاء المقابلة

**الشروط**:
- المقابلة يجب أن تكون منتهية (status: 'ended')
- المستخدم يجب أن يكون المضيف

**الاستخدام**:
```javascript
const handleAddNotes = async (interviewId) => {
  const notes = prompt('إضافة ملاحظات');
  if (!notes) return;

  await fetch(`/api/interviews/${interviewId}/notes`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ notes })
  });
};
```

### 6. تقييم المرشح (Rate Candidate)

**الوصف**: تقييم المرشح من 1 إلى 5 نجوم

**الشروط**:
- المقابلة يجب أن تكون منتهية (status: 'ended')
- المستخدم يجب أن يكون المضيف

**الاستخدام**:
```javascript
const handleRateCandidate = async (interviewId) => {
  const rating = prompt('تقييم المرشح (1-5)');
  if (!rating || rating < 1 || rating > 5) return;

  await fetch(`/api/interviews/${interviewId}/rating`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rating: parseInt(rating) })
  });
};
```

---

## 🎨 التصميم والواجهة

### الألوان المستخدمة

```css
/* Primary Colors */
--primary: #304B60;      /* كحلي */
--secondary: #E3DAD1;    /* بيج */
--accent: #D48161;       /* نحاسي */

/* Status Colors */
--scheduled: #e3f2fd;    /* أزرق فاتح */
--waiting: #fff3e0;      /* برتقالي فاتح */
--active: #e8f5e9;       /* أخضر فاتح */
--ended: #f3e5f5;        /* بنفسجي فاتح */
--cancelled: #ffebee;    /* أحمر فاتح */
```

### الخطوط

- **العربية**: Amiri
- **الإنجليزية**: Cormorant Garamond
- **الفرنسية**: EB Garamond

### التصميم المتجاوب

**Desktop (> 768px)**:
- عرض كامل للبطاقات
- 4 بطاقات إحصائيات في صف واحد
- تبويبات أفقية

**Tablet (640px - 768px)**:
- بطاقتان إحصائيات في صف
- تبويبات قابلة للتمرير

**Mobile (< 640px)**:
- بطاقة إحصائيات واحدة في صف
- تبويبات قابلة للتمرير
- أزرار بعرض كامل

---

## 🔐 الأمان والصلاحيات

### Authentication
- جميع endpoints محمية بـ `protect` middleware
- يتطلب token صالح في header

### Authorization
- المستخدم يمكنه فقط رؤية مقابلاته (كمضيف أو مشارك)
- إضافة الملاحظات والتقييم: للمضيف فقط
- تحميل التسجيلات: للمشاركين فقط

### Data Validation
- التحقق من صحة `interviewId`
- التحقق من صحة `rating` (1-5)
- التحقق من صحة التواريخ في الفلترة

---

## 📱 الاستخدام

### 1. الوصول للوحة التحكم

```javascript
// في React Router
<Route path="/interview-dashboard" element={<InterviewDashboard />} />
```

### 2. جلب المقابلات القادمة

```javascript
const fetchUpcomingInterviews = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_URL}/interviews/upcoming?page=1&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  console.log(data.interviews);
};
```

### 3. جلب المقابلات السابقة

```javascript
const fetchPastInterviews = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_URL}/interviews/past?page=1&limit=10&status=ended`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  console.log(data.interviews);
};
```

### 4. البحث في المقابلات

```javascript
const searchInterviews = async (filters) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({
    page: 1,
    limit: 10,
    ...filters
  });
  
  const response = await fetch(
    `${API_URL}/interviews/search?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  console.log(data.interviews);
};
```

### 5. إضافة ملاحظات

```javascript
const addNotes = async (interviewId, notes) => {
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
  
  const data = await response.json();
  console.log(data);
};
```

### 6. تقييم المرشح

```javascript
const rateCandidate = async (interviewId, rating) => {
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
  
  const data = await response.json();
  console.log(data);
};
```

---

## 🧪 الاختبارات

### Unit Tests

**الموقع**: `backend/tests/interviewDashboard.test.js`

**الاختبارات المتاحة**:
- ✅ جلب المقابلات السابقة بنجاح
- ✅ دعم pagination
- ✅ التصفية حسب الحالة
- ✅ عرض معلومات المضيف والمشاركين
- ✅ عرض معلومات التسجيل
- ✅ عرض الملاحظات والتقييم
- ✅ رفض الطلب بدون authentication
- ✅ ترتيب المقابلات حسب التاريخ
- ✅ جلب المقابلات القادمة
- ✅ عدم عرض المقابلات السابقة في القادمة
- ✅ جلب الإحصائيات
- ✅ البحث في المقابلات
- ✅ التصفية حسب التاريخ
- ✅ جلب تفاصيل مقابلة واحدة
- ✅ رفض الوصول لمقابلة غير موجودة

**تشغيل الاختبارات**:
```bash
cd backend
npm test -- interviewDashboard.test.js
```

---

## 🚀 التحسينات المستقبلية

### المرحلة 1 (قصيرة المدى)
- [ ] تصدير المقابلات إلى PDF/Excel
- [ ] إضافة رسوم بيانية للإحصائيات
- [ ] تحسين البحث (full-text search)
- [ ] إضافة تنبيهات للمقابلات القادمة

### المرحلة 2 (متوسطة المدى)
- [ ] تكامل مع التقويم (Google Calendar, Outlook)
- [ ] إضافة تقارير شهرية
- [ ] تحليلات متقدمة (معدل النجاح، متوسط المدة)
- [ ] مشاركة التسجيلات مع فريق التوظيف

### المرحلة 3 (طويلة المدى)
- [ ] AI لتحليل المقابلات
- [ ] توصيات تلقائية للمرشحين
- [ ] تقييم تلقائي بناءً على الكلام
- [ ] ترجمة فورية للمقابلات

---

## 📚 المراجع

- [Requirements Document](../../.kiro/specs/video-interviews/requirements.md)
- [Design Document](../../.kiro/specs/video-interviews/design.md)
- [Tasks Document](../../.kiro/specs/video-interviews/tasks.md)
- [Video Interview Controller](../../backend/src/controllers/videoInterviewController.js)
- [Video Interview Routes](../../backend/src/routes/videoInterviewRoutes.js)
- [Interview Dashboard Component](../../frontend/src/pages/InterviewDashboard.jsx)

---

## ✅ الخلاصة

لوحة إدارة المقابلات هي ميزة شاملة ومكتملة توفر:
- ✅ عرض منظم للمقابلات القادمة والسابقة
- ✅ بحث وفلترة متقدمة
- ✅ إحصائيات شاملة
- ✅ إضافة ملاحظات وتقييمات
- ✅ الوصول السريع للتسجيلات
- ✅ تصميم متجاوب واحترافي
- ✅ دعم 3 لغات
- ✅ أمان وصلاحيات محكمة

**الحالة**: ✅ جاهز للإنتاج

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الحالة**: مكتمل
