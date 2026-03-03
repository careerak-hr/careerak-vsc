# قائمة المقابلات القادمة - Upcoming Interviews List

## 📋 نظرة عامة

مكون React لعرض قائمة المقابلات القادمة للمستخدم مع إمكانية الانضمام إليها.

**Requirements**: 8.1

## ✨ الميزات الرئيسية

- ✅ عرض جميع المقابلات القادمة للمستخدم
- ✅ معلومات تفصيلية لكل مقابلة (التاريخ، الوقت، المشاركون)
- ✅ حساب الوقت المتبقي حتى المقابلة
- ✅ زر "انضم الآن" يظهر قبل 5 دقائق من الموعد
- ✅ Pagination للمقابلات
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم Dark Mode
- ✅ دعم RTL/LTR

## 🎯 الاستخدام

### الاستخدام الأساسي

```jsx
import UpcomingInterviewsList from './components/VideoInterview/UpcomingInterviewsList';

function InterviewDashboard() {
  return (
    <div>
      <h1>لوحة التحكم</h1>
      <UpcomingInterviewsList />
    </div>
  );
}
```

### في صفحة مخصصة

```jsx
import { useNavigate } from 'react-router-dom';
import UpcomingInterviewsList from './components/VideoInterview/UpcomingInterviewsList';

function UpcomingInterviewsPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <button onClick={() => navigate('/dashboard')}>
        العودة للوحة التحكم
      </button>
      <UpcomingInterviewsList />
    </div>
  );
}
```

## 📊 البيانات المعروضة

### معلومات المقابلة

- **التاريخ والوقت**: عرض تاريخ ووقت المقابلة بتنسيق محلي
- **الوقت المتبقي**: حساب ديناميكي للوقت المتبقي (أيام، ساعات، دقائق)
- **الحالة**: scheduled, waiting
- **المشاركون**: قائمة بجميع المشاركين مع صورهم وأدوارهم
- **معلومات الموعد**: عنوان ووصف الموعد (إذا كان مرتبطاً)

### الأزرار والإجراءات

1. **عرض التفاصيل**: الانتقال لصفحة تفاصيل المقابلة
2. **انضم الآن**: 
   - يظهر قبل 5 دقائق من الموعد
   - يبقى متاحاً حتى 30 دقيقة بعد الموعد
   - ينقل المستخدم مباشرة لغرفة المقابلة

## 🔄 API Integration

### Endpoint المستخدم

```
GET /api/video-interviews/upcoming?page=1&limit=10
```

### Response Format

```json
{
  "success": true,
  "interviews": [
    {
      "_id": "interview_id",
      "roomId": "room_123",
      "hostId": {
        "_id": "user_id",
        "name": "أحمد محمد",
        "email": "ahmed@example.com",
        "profilePicture": "https://..."
      },
      "participants": [
        {
          "userId": {
            "_id": "user_id",
            "name": "سارة أحمد",
            "profilePicture": "https://..."
          },
          "role": "participant",
          "joinedAt": null,
          "leftAt": null
        }
      ],
      "status": "scheduled",
      "scheduledAt": "2026-03-05T10:00:00.000Z",
      "appointmentId": {
        "_id": "appointment_id",
        "title": "مقابلة توظيف - مطور Full Stack",
        "description": "مقابلة تقنية للتعرف على المهارات"
      },
      "settings": {
        "recordingEnabled": true,
        "waitingRoomEnabled": true,
        "maxParticipants": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## 🎨 التخصيص

### الألوان

```css
/* Primary Color */
--primary-color: #304B60;

/* Secondary Color */
--secondary-color: #E3DAD1;

/* Accent Color */
--accent-color: #D48161;
```

### الخطوط

```css
/* Arabic */
font-family: 'Amiri', serif;

/* English */
font-family: 'Cormorant Garamond', serif;
```

## 📱 التصميم المتجاوب

### Breakpoints

- **Desktop**: > 768px
- **Tablet**: 768px - 1024px
- **Mobile**: < 768px

### التكيفات

- **Desktop**: عرض شبكي للبطاقات
- **Tablet**: عرض شبكي مع تقليل الأعمدة
- **Mobile**: عرض عمودي واحد، أزرار بعرض كامل

## 🌍 دعم اللغات

### الترجمات المطلوبة

```javascript
{
  videoInterview: {
    upcomingInterviews: 'المقابلات القادمة',
    loading: 'جاري التحميل...',
    retry: 'إعادة المحاولة',
    noUpcoming: 'لا توجد مقابلات قادمة',
    participants: 'المشاركون',
    host: 'مضيف',
    viewDetails: 'عرض التفاصيل',
    joinNow: 'انضم الآن',
    notYet: 'لم يحن الوقت بعد',
    in: 'خلال',
    days: 'يوم',
    hours: 'ساعة',
    minutes: 'دقيقة',
    now: 'الآن',
    page: 'صفحة',
    of: 'من',
    previous: 'السابق',
    next: 'التالي',
    scheduled: 'مجدولة',
    waiting: 'في الانتظار'
  }
}
```

## 🔒 الأمان

- ✅ التحقق من token في كل طلب
- ✅ عرض المقابلات الخاصة بالمستخدم فقط
- ✅ التحقق من صلاحية الانضمام قبل السماح

## ⚡ الأداء

### التحسينات المطبقة

- Lazy loading للصور
- Pagination لتقليل البيانات المحملة
- Caching للبيانات المحملة
- Debouncing للطلبات المتكررة

### مؤشرات الأداء

- **First Load**: < 2s
- **Subsequent Loads**: < 500ms
- **Image Loading**: Progressive with placeholders

## 🧪 الاختبار

### Unit Tests

```bash
npm test -- UpcomingInterviewsList.test.jsx
```

### Integration Tests

```bash
npm test -- UpcomingInterviewsList.integration.test.jsx
```

### Manual Testing Checklist

- [ ] عرض المقابلات القادمة بشكل صحيح
- [ ] حساب الوقت المتبقي بدقة
- [ ] زر "انضم الآن" يظهر في الوقت المناسب
- [ ] Pagination يعمل بشكل صحيح
- [ ] التصميم متجاوب على جميع الأجهزة
- [ ] دعم RTL/LTR يعمل
- [ ] Dark Mode يعمل
- [ ] معالجة الأخطاء تعمل
- [ ] Loading state يظهر بشكل صحيح
- [ ] Empty state يظهر عند عدم وجود مقابلات

## 🐛 استكشاف الأخطاء

### المقابلات لا تظهر

```javascript
// تحقق من:
1. Token موجود في localStorage
2. API endpoint صحيح
3. المستخدم لديه مقابلات قادمة
4. التاريخ والوقت صحيحان
```

### زر "انضم الآن" لا يظهر

```javascript
// تحقق من:
1. الوقت الحالي قبل 5 دقائق من الموعد
2. حساب الوقت المتبقي صحيح
3. timezone settings صحيحة
```

### Pagination لا يعمل

```javascript
// تحقق من:
1. pagination state يتحدث بشكل صحيح
2. API يرجع pagination data
3. useEffect يعمل عند تغيير الصفحة
```

## 📚 المراجع

- [VideoInterview Model](../../backend/src/models/VideoInterview.js)
- [VideoInterviewController](../../backend/src/controllers/videoInterviewController.js)
- [Requirements Document](../../.kiro/specs/video-interviews/requirements.md)
- [Design Document](../../.kiro/specs/video-interviews/design.md)

## 🔄 التحديثات المستقبلية

- [ ] إضافة فلترة حسب التاريخ
- [ ] إضافة بحث في المقابلات
- [ ] إضافة تصدير للتقويم (iCal)
- [ ] إضافة تذكيرات push notifications
- [ ] إضافة عرض خريطة للمقابلات
- [ ] إضافة إحصائيات المقابلات

---

**تاريخ الإنشاء**: 2026-03-02  
**آخر تحديث**: 2026-03-02  
**الحالة**: ✅ مكتمل
