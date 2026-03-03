# SavedSearchesPanel Component

## الوصف
مكون لعرض قائمة عمليات البحث المحفوظة للمستخدم في الصفحة الرئيسية.

## الميزات
- ✅ عرض جميع عمليات البحث المحفوظة
- ✅ تطبيق عملية بحث بنقرة واحدة
- ✅ حذف عملية بحث
- ✅ عرض تفاصيل البحث (الكلمات المفتاحية، الموقع، إلخ)
- ✅ مؤشر التنبيهات المفعلة
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ حالات التحميل والخطأ والفراغ

## الاستخدام

```jsx
import SavedSearchesPanel from '../components/SavedSearchesPanel';

function JobPostingsPage() {
  return (
    <div>
      <SavedSearchesPanel />
    </div>
  );
}
```

## API Endpoints المستخدمة

### GET /api/search/saved
جلب جميع عمليات البحث المحفوظة للمستخدم.

**Response:**
```json
{
  "success": true,
  "data": {
    "savedSearches": [
      {
        "_id": "...",
        "name": "وظائف مطور React",
        "searchType": "jobs",
        "searchParams": {
          "query": "React Developer",
          "location": "Riyadh",
          "salaryMin": 8000,
          "skills": ["React", "JavaScript"]
        },
        "alertEnabled": true,
        "createdAt": "2026-02-17T..."
      }
    ],
    "count": 5,
    "limit": 10
  }
}
```

### DELETE /api/search/saved/:id
حذف عملية بحث محفوظة.

**Response:**
```json
{
  "success": true,
  "message": "Saved search deleted successfully"
}
```

## Props
لا يوجد props - المكون يستخدم AppContext للحصول على اللغة والخط.

## الحالات

### Loading
يعرض spinner أثناء تحميل البيانات.

### Error
يعرض رسالة خطأ إذا فشل التحميل.

### Empty
يعرض رسالة ودية عندما لا توجد عمليات بحث محفوظة.

### Success
يعرض قائمة البطاقات مع جميع عمليات البحث.

## التصميم

### الألوان
- Primary: #304B60 (كحلي)
- Secondary: #E3DAD1 (بيج)
- Accent: #D48161 (نحاسي)

### Breakpoints
- Desktop: > 768px
- Tablet: 640px - 768px
- Mobile: < 640px

## الملفات
- `SavedSearchesPanel.jsx` - المكون الرئيسي
- `SavedSearchesPanel.css` - التنسيقات
- `index.js` - التصدير
- `README.md` - التوثيق

## المتطلبات
- React 18+
- React Router DOM (للتنقل)
- AppContext (للغة والخط)
- Backend API متاح على VITE_API_URL

## الاختبار

### اختبار يدوي
1. سجل دخول كمستخدم
2. احفظ عملية بحث من صفحة البحث
3. افتح صفحة الوظائف
4. يجب أن ترى المكون مع عملية البحث المحفوظة
5. انقر "تطبيق" - يجب أن ينقلك للبحث مع الفلاتر
6. انقر "حذف" - يجب أن تحذف العملية

### حالات الاختبار
- ✅ عرض قائمة فارغة
- ✅ عرض عملية بحث واحدة
- ✅ عرض عدة عمليات بحث
- ✅ تطبيق عملية بحث
- ✅ حذف عملية بحث
- ✅ عرض التنبيهات المفعلة
- ✅ التصميم المتجاوب

## الملاحظات
- المكون محمي بـ authentication (يتطلب token)
- الحد الأقصى 10 عمليات بحث لكل مستخدم
- يدعم RTL/LTR تلقائياً
- يدعم Dark Mode (اختياري)

## التحديثات المستقبلية
- [ ] إضافة زر "تعديل"
- [ ] إضافة إمكانية إعادة الترتيب
- [ ] إضافة تصدير/استيراد
- [ ] إضافة مشاركة عمليات البحث
