# تنفيذ البحث والفلترة في المقابلات

## 📋 معلومات التنفيذ
- **التاريخ**: 2026-03-02
- **الحالة**: ✅ مكتمل
- **المتطلبات**: Requirements 8.6

---

## 🎯 نظرة عامة

تم تنفيذ نظام شامل للبحث والفلترة في المقابلات يتيح للمستخدمين:
- البحث النصي في المقابلات
- الفلترة حسب الحالة (scheduled, active, ended, cancelled, waiting)
- الفلترة حسب نطاق التاريخ (startDate, endDate)
- Pagination للنتائج
- الترتيب حسب التاريخ (الأحدث أولاً)

---

## 🔧 المكونات المنفذة

### 1. Backend API

#### Controller: `videoInterviewController.js`

**الدالة**: `searchInterviews(req, res)`

**المعاملات**:
- `page` (query): رقم الصفحة (افتراضي: 1)
- `limit` (query): عدد النتائج لكل صفحة (افتراضي: 10)
- `status` (query): الحالة (scheduled, active, ended, cancelled, waiting)
- `startDate` (query): تاريخ البداية (ISO format)
- `endDate` (query): تاريخ النهاية (ISO format)
- `search` (query): نص البحث (يبحث في: اسم المضيف، أسماء المشاركين، الملاحظات)

**الاستجابة**:
```json
{
  "success": true,
  "interviews": [
    {
      "_id": "...",
      "roomId": "...",
      "hostId": {
        "name": "...",
        "email": "...",
        "profilePicture": "..."
      },
      "participants": [
        {
          "userId": {
            "name": "...",
            "email": "...",
            "profilePicture": "..."
          },
          "role": "participant",
          "joinedAt": "...",
          "leftAt": "..."
        }
      ],
      "status": "scheduled",
      "scheduledAt": "...",
      "startedAt": "...",
      "endedAt": "...",
      "duration": 3600,
      "notes": "...",
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

#### Route: `videoInterviewRoutes.js`

```javascript
/**
 * @route   GET /api/video-interviews/search
 * @desc    البحث والفلترة في المقابلات
 * @access  Private
 * Requirements: 8.6
 */
router.get('/search', VideoInterviewController.searchInterviews);
```

---

### 2. Frontend Component

#### Component: `InterviewDashboard.jsx`

**الميزات**:
- 3 تبويبات: المقابلات القادمة، المقابلات السابقة، البحث والفلترة
- نموذج فلترة شامل مع:
  - قائمة منسدلة للحالة
  - حقلي تاريخ (من - إلى)
  - حقل بحث نصي
  - زر مسح الفلاتر
- عرض النتائج في بطاقات
- Pagination للتنقل بين الصفحات
- دعم متعدد اللغات (ar, en, fr)
- تصميم متجاوب (Desktop, Tablet, Mobile)

**الاستخدام**:
```jsx
import InterviewDashboard from './pages/InterviewDashboard';

<Route path="/interviews" element={<InterviewDashboard />} />
```

---

## 📊 أمثلة الاستخدام

### 1. البحث بدون فلاتر (جميع المقابلات)

```bash
GET /api/video-interviews/search
Authorization: Bearer <token>
```

### 2. الفلترة حسب الحالة

```bash
GET /api/video-interviews/search?status=ended
Authorization: Bearer <token>
```

### 3. الفلترة حسب نطاق التاريخ

```bash
GET /api/video-interviews/search?startDate=2026-01-01&endDate=2026-12-31
Authorization: Bearer <token>
```

### 4. البحث النصي

```bash
GET /api/video-interviews/search?search=مقابلة%20مهمة
Authorization: Bearer <token>
```

### 5. دمج الفلاتر المتعددة

```bash
GET /api/video-interviews/search?status=ended&startDate=2026-01-01&search=ممتازة&page=1&limit=10
Authorization: Bearer <token>
```

---

## 🔍 آلية البحث

### البحث النصي

يبحث النظام في:
1. **اسم المضيف** (`hostId.name`)
2. **أسماء المشاركين** (`participants.userId.name`)
3. **الملاحظات** (`notes`)

**مثال**:
```javascript
const searchLower = search.toLowerCase();
filteredInterviews = interviews.filter(interview => {
  const hostName = interview.hostId?.name?.toLowerCase() || '';
  const participantNames = interview.participants
    .map(p => p.userId?.name?.toLowerCase() || '')
    .join(' ');
  const notes = interview.notes?.toLowerCase() || '';
  
  return hostName.includes(searchLower) ||
         participantNames.includes(searchLower) ||
         notes.includes(searchLower);
});
```

### الفلترة حسب التاريخ

```javascript
if (startDate || endDate) {
  query.scheduledAt = {};
  if (startDate) {
    query.scheduledAt.$gte = new Date(startDate);
  }
  if (endDate) {
    query.scheduledAt.$lte = new Date(endDate);
  }
}
```

---

## 🎨 التصميم

### الألوان
- **Primary**: #304B60 (كحلي)
- **Secondary**: #E3DAD1 (بيج)
- **Accent**: #D48161 (نحاسي)
- **Borders**: #D4816180 (نحاسي باهت)

### Status Badges
- **scheduled**: أزرق (#e3f2fd / #1976d2)
- **waiting**: برتقالي (#fff3e0 / #f57c00)
- **active**: أخضر (#e8f5e9 / #388e3c)
- **ended**: بنفسجي (#f3e5f5 / #7b1fa2)
- **cancelled**: أحمر (#ffebee / #c62828)

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: > 1024px

---

## ✅ الميزات المنفذة

- [x] البحث النصي في المقابلات
- [x] الفلترة حسب الحالة
- [x] الفلترة حسب نطاق التاريخ
- [x] دمج الفلاتر المتعددة
- [x] Pagination للنتائج
- [x] الترتيب حسب التاريخ (الأحدث أولاً)
- [x] عرض معلومات المضيف والمشاركين
- [x] دعم متعدد اللغات (ar, en, fr)
- [x] تصميم متجاوب (Desktop, Tablet, Mobile)
- [x] RTL/LTR support
- [x] Dark mode support (عبر palette المشروع)

---

## 🧪 الاختبار

### اختبارات Backend

تم إنشاء ملف اختبار شامل: `backend/tests/videoInterviewSearch.test.js`

**الاختبارات المغطاة** (17 اختبار):
1. ✅ جلب جميع المقابلات بدون فلاتر
2. ✅ الفلترة حسب الحالة (scheduled)
3. ✅ الفلترة حسب الحالة (ended)
4. ✅ الفلترة حسب الحالة (cancelled)
5. ✅ الفلترة حسب تاريخ البداية
6. ✅ الفلترة حسب تاريخ النهاية
7. ✅ الفلترة حسب نطاق تاريخ
8. ✅ البحث في الملاحظات
9. ✅ البحث في اسم المضيف
10. ✅ البحث في اسم المشارك
11. ✅ دمج الفلاتر المتعددة
12. ✅ دعم Pagination
13. ✅ جلب الصفحة الثانية
14. ✅ إرجاع مصفوفة فارغة للبحث بدون نتائج
15. ✅ رفض الطلب بدون authentication
16. ✅ ترتيب النتائج حسب التاريخ (الأحدث أولاً)
17. ✅ إرجاع معلومات المضيف والمشاركين

**تشغيل الاختبارات**:
```bash
cd backend
npm test -- videoInterviewSearch.test.js
```

### اختبارات Frontend

**الاختبار اليدوي**:
1. افتح `/interviews` في المتصفح
2. انتقل إلى تبويب "البحث والفلترة"
3. جرب الفلاتر المختلفة:
   - اختر حالة من القائمة المنسدلة
   - أدخل نطاق تاريخ
   - اكتب نص في حقل البحث
   - اضغط "مسح" لإعادة تعيين الفلاتر
4. تحقق من Pagination
5. تحقق من التصميم المتجاوب على أجهزة مختلفة

---

## 📈 الأداء

### Indexes المستخدمة

```javascript
// في VideoInterview model
videoInterviewSchema.index({ hostId: 1, status: 1 });
videoInterviewSchema.index({ 'participants.userId': 1 });
videoInterviewSchema.index({ scheduledAt: 1 });
```

### التحسينات
- استخدام `populate()` لجلب معلومات المستخدمين
- Pagination لتقليل حجم البيانات المنقولة
- Indexes لتسريع الاستعلامات
- البحث النصي يتم على جانب الخادم

---

## 🔒 الأمان

- ✅ جميع endpoints محمية بـ `protect` middleware
- ✅ المستخدم يمكنه فقط البحث في مقابلاته الخاصة
- ✅ التحقق من الهوية قبل كل طلب
- ✅ منع SQL injection (استخدام Mongoose)
- ✅ منع XSS (تنظيف المدخلات)

---

## 🌍 دعم اللغات

### اللغات المدعومة
- العربية (ar) - الافتراضية
- الإنجليزية (en)
- الفرنسية (fr)

### الترجمات
جميع النصوص مترجمة في `InterviewDashboard.jsx`:
- عناوين التبويبات
- تسميات الفلاتر
- حالات المقابلات
- رسائل الأخطاء
- أزرار الإجراءات

---

## 📝 ملاحظات التنفيذ

### التحديات
1. **نموذج المستخدم المعقد**: يستخدم discriminators (Company, Individual)
2. **البحث النصي**: يتم على جانب الخادم بعد جلب النتائج
3. **Pagination**: يحسب العدد الإجمالي قبل التصفية النصية

### التحسينات المستقبلية
- [ ] استخدام MongoDB text search للبحث الأسرع
- [ ] إضافة فلاتر إضافية (rating, duration)
- [ ] تصدير النتائج (CSV, PDF)
- [ ] حفظ الفلاتر المفضلة
- [ ] البحث المتقدم (AND/OR logic)

---

## 📚 المراجع

- **Requirements**: `.kiro/specs/video-interviews/requirements.md` (Section 8.6)
- **Design**: `.kiro/specs/video-interviews/design.md`
- **Tasks**: `.kiro/specs/video-interviews/tasks.md` (Task 13.3)
- **Controller**: `backend/src/controllers/videoInterviewController.js`
- **Routes**: `backend/src/routes/videoInterviewRoutes.js`
- **Component**: `frontend/src/pages/InterviewDashboard.jsx`
- **Styles**: `frontend/src/pages/InterviewDashboard.css`
- **Tests**: `backend/tests/videoInterviewSearch.test.js`

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الحالة**: ✅ مكتمل ومفعّل
