# صفحة الوظائف المحفوظة (Bookmarked Jobs Page)

## 📋 نظرة عامة

صفحة منفصلة تعرض جميع الوظائف التي حفظها المستخدم، مع إمكانيات بحث وفلترة متقدمة.

## ✨ الميزات الرئيسية

### 1. عرض الوظائف المحفوظة
- عرض جميع الوظائف المحفوظة في مكان واحد
- عداد الوظائف المحفوظة في الرأس
- دعم عرض Grid و List (قابل للتبديل)

### 2. البحث
- بحث في العنوان، الشركة، الوصف، والمهارات
- بحث فوري (real-time)
- زر مسح البحث

### 3. الفلترة
- فلترة حسب الموقع
- فلترة حسب نوع العمل
- فلترة حسب نطاق الراتب
- زر مسح جميع الفلاتر

### 4. إدارة الوظائف
- حذف وظيفة واحدة من المفضلة
- حذف جميع الوظائف المحفوظة دفعة واحدة
- تأكيد قبل الحذف الجماعي

### 5. الحالات الخاصة
- حالة فارغة (Empty State) عند عدم وجود وظائف محفوظة
- حالة "لا توجد نتائج" (No Results) عند الفلترة
- Skeleton loading أثناء التحميل

## 🎯 المتطلبات المحققة

- ✅ **Requirements 2.2**: صفحة منفصلة للوظائف المحفوظة
- ✅ **Requirements 2.5**: عداد الوظائف المحفوظة
- ✅ **Requirements 8.1**: شريط بحث ذكي
- ✅ **Requirements 8.2**: فلاتر متعددة
- ✅ **Requirements 8.3**: عداد النتائج
- ✅ **Requirements 8.4**: حفظ الفلاتر في URL (قابل للتطبيق)
- ✅ **Requirements 8.5**: زر "مسح الفلاتر"

## 📁 الملفات

```
frontend/src/
├── pages/
│   ├── BookmarkedJobsPage.jsx          # المكون الرئيسي
│   ├── BookmarkedJobsPage.css          # التنسيقات
│   └── BookmarkedJobsPage.README.md    # هذا الملف
├── examples/
│   └── BookmarkedJobsPageExample.jsx   # مثال استخدام
└── components/
    ├── JobCard/
    │   ├── JobCardGrid.jsx             # بطاقة Grid
    │   ├── JobCardList.jsx             # بطاقة List
    │   └── BookmarkButton.jsx          # زر الحفظ
    └── ViewToggle/
        └── ViewToggle.jsx              # زر التبديل
```

## 🚀 الاستخدام

### 1. الوصول للصفحة

```jsx
import { Link } from 'react-router-dom';

<Link to="/bookmarked-jobs">الوظائف المحفوظة</Link>
```

### 2. في Navbar

```jsx
<nav>
  <Link to="/job-postings">الوظائف</Link>
  <Link to="/bookmarked-jobs">
    المحفوظة ({bookmarkCount})
  </Link>
</nav>
```

## 🔌 API Integration

### Endpoints المطلوبة

```javascript
// 1. جلب الوظائف المحفوظة
GET /api/jobs/bookmarked
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: true,
  data: [
    {
      id: 1,
      title: 'مطور Full Stack',
      company: { name: 'شركة التقنية', logo: '...' },
      location: { city: 'الرياض' },
      type: 'دوام كامل',
      salary: 15000,
      requiredSkills: ['React', 'Node.js'],
      bookmarkedAt: '2024-01-15T10:30:00Z',
      ...
    }
  ]
}

// 2. حذف وظيفة من المفضلة
DELETE /api/jobs/:id/bookmark
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: true,
  message: 'تم إزالة الوظيفة من المفضلة'
}

// 3. حذف جميع الوظائف المحفوظة
DELETE /api/jobs/bookmarked/clear
Headers: { Authorization: 'Bearer <token>' }
Response: {
  success: true,
  message: 'تم حذف جميع الوظائف المحفوظة'
}
```

### استبدال Mock Data

في `BookmarkedJobsPage.jsx`، استبدل:

```javascript
// ❌ Mock data (للتجربة)
const mockData = [...];
setBookmarkedJobs(mockData);

// ✅ API call حقيقي
const response = await fetch('/api/jobs/bookmarked', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
setBookmarkedJobs(data.data);
```

## 🎨 التخصيص

### الألوان

```css
/* في BookmarkedJobsPage.css */
--primary-color: #304B60;    /* كحلي */
--secondary-color: #E3DAD1;  /* بيج */
--accent-color: #D48161;     /* نحاسي */
```

### الأحجام

```css
/* Grid columns */
.jobs-grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

/* تغيير إلى 2 أعمدة */
.jobs-grid {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
}
```

## 📱 التصميم المتجاوب

### Breakpoints

- **Desktop**: ≥1024px - Grid 3 أعمدة
- **Tablet**: 640-1023px - Grid 2 أعمدة
- **Mobile**: <640px - Grid عمود واحد

### التحسينات للموبايل

- شريط بحث بعرض كامل
- فلاتر قابلة للطي
- أزرار بحجم مناسب للمس (≥44px)
- تصميم مبسط

## ♿ Accessibility

### ARIA Labels

```jsx
<main id="main-content" tabIndex="-1">
  <input aria-label="البحث في الوظائف المحفوظة" />
  <button aria-label="عرض الفلاتر" aria-expanded={showFilters} />
  <article aria-label={`وظيفة ${job.title} في ${job.company.name}`} />
</main>
```

### Keyboard Navigation

- `Tab`: التنقل بين العناصر
- `Enter`: تفعيل الأزرار
- `Escape`: إغلاق الفلاتر

### Screen Readers

- عناوين دلالية (h1, h2, h3)
- ARIA labels واضحة
- إعلانات للتغييرات (aria-live)

## 🎭 Animations

### Framer Motion

```jsx
<motion.div
  variants={containerVariants}
  initial="initial"
  animate="animate"
  exit="exit"
>
  {/* محتوى */}
</motion.div>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🌙 Dark Mode

### دعم تلقائي

```css
@media (prefers-color-scheme: dark) {
  .bookmarked-jobs-page {
    background-color: #1a1a1a;
  }
  
  .page-header h1 {
    color: #E3DAD1;
  }
}
```

## 🔍 SEO

### Metadata

```jsx
import { SEOHead } from '../components/SEO';
import { useSEO } from '../hooks';

const seo = useSEO('bookmarkedJobs', {});

<SEOHead {...seo} />
```

### في `seoMetadata.js`

```javascript
bookmarkedJobs: {
  ar: {
    title: 'الوظائف المحفوظة - Careerak',
    description: 'راجع جميع الوظائف التي حفظتها...',
    keywords: 'وظائف محفوظة, مفضلة, Careerak'
  }
}
```

## 🧪 الاختبار

### Manual Testing

1. ✅ تحميل الصفحة بنجاح
2. ✅ عرض الوظائف المحفوظة
3. ✅ البحث يعمل
4. ✅ الفلاتر تعمل
5. ✅ التبديل بين Grid/List
6. ✅ حذف وظيفة واحدة
7. ✅ حذف جميع الوظائف
8. ✅ Empty state يظهر
9. ✅ No results state يظهر
10. ✅ Responsive على جميع الأجهزة

### Unit Tests (مستقبلاً)

```javascript
describe('BookmarkedJobsPage', () => {
  test('renders bookmarked jobs', () => {});
  test('filters jobs by search query', () => {});
  test('filters jobs by location', () => {});
  test('removes bookmark', () => {});
  test('clears all bookmarks', () => {});
});
```

## 🐛 استكشاف الأخطاء

### المشكلة: الصفحة فارغة

```javascript
// تحقق من:
1. هل المستخدم مسجل دخول؟
2. هل token صحيح؟
3. هل API endpoint يعمل؟
4. هل هناك وظائف محفوظة فعلاً؟
```

### المشكلة: البحث لا يعمل

```javascript
// تحقق من:
1. هل searchQuery يتحدث؟
2. هل applyFiltersAndSearch تُستدعى؟
3. هل الحقول المبحوث فيها صحيحة؟
```

### المشكلة: الفلاتر لا تظهر

```javascript
// تحقق من:
1. هل showFilters = true؟
2. هل CSS موجود؟
3. هل Framer Motion مثبت؟
```

## 📚 المراجع

- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Router Docs](https://reactrouter.com/)
- [Lucide Icons](https://lucide.dev/)

## 📝 ملاحظات

- الصفحة محمية (Protected Route)
- تتطلب authentication
- تدعم RTL/LTR
- متوافقة مع جميع المتصفحات الحديثة

## 🔄 التحديثات المستقبلية

- [ ] حفظ الفلاتر في URL
- [ ] ترتيب حسب تاريخ الحفظ
- [ ] تصدير الوظائف المحفوظة (PDF/CSV)
- [ ] مشاركة قائمة الوظائف المحفوظة
- [ ] إضافة ملاحظات لكل وظيفة محفوظة
- [ ] تصنيفات للوظائف المحفوظة (tags)

---

**تاريخ الإنشاء**: 2026-03-06  
**آخر تحديث**: 2026-03-06  
**الحالة**: ✅ مكتمل
