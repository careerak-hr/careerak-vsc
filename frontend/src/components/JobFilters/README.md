# JobFilters Component

## نظرة عامة
مكون فلترة الوظائف مع زر "مسح الفلاتر" المحسّن.

## الميزات
- ✅ فلترة متعددة (بحث، مجال، موقع، نوع العمل، خبرة، راتب)
- ✅ زر "مسح الفلاتر" ذكي (معطل عند عدم وجود فلاتر)
- ✅ أيقونات واضحة (lucide-react)
- ✅ تأثيرات بصرية جذابة
- ✅ Animation عند المسح
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ تصميم متجاوب
- ✅ إمكانية وصول ممتازة

## الاستخدام

```jsx
import JobFilters from './components/JobFilters/JobFilters';

function JobPostingsPage() {
  const handleFilterChange = (newFilters) => {
    console.log('Filters changed:', newFilters);
    // تطبيق الفلاتر
  };

  const handleClearFilters = () => {
    console.log('Filters cleared');
    // مسح الفلاتر
  };

  return (
    <JobFilters 
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onFilterChange` | `(filters: object) => void` | ✅ | يُستدعى عند تغيير أي فلتر |
| `onClearFilters` | `() => void` | ✅ | يُستدعى عند مسح جميع الفلاتر |

## الفلاتر المتاحة

```javascript
{
  search: '',              // بحث نصي
  field: '',               // المجال
  location: '',            // الموقع
  jobType: '',             // نوع العمل
  experienceLevel: '',     // مستوى الخبرة
  minSalary: '',           // الحد الأدنى للراتب
  maxSalary: '',           // الحد الأقصى للراتب
  skills: []               // المهارات
}
```

## زر "مسح الفلاتر"

### السلوك
- **لا فلاتر نشطة**: الزر معطل (disabled)
- **فلاتر نشطة**: الزر مفعّل
- **عند النقر**: مسح جميع الفلاتر + animation

### التنسيقات
```css
.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  min-height: 44px;
  border: 2px solid #D48161;
  color: #D48161;
}

.clear-filters-btn:hover:not(.disabled) {
  background: #D48161;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(212, 129, 97, 0.3);
}

.clear-filters-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## الترجمات

### العربية
```javascript
{
  filters: 'الفلاتر',
  clearFilters: 'مسح الفلاتر',
  search: 'البحث',
  // ...
}
```

### الإنجليزية
```javascript
{
  filters: 'Filters',
  clearFilters: 'Clear Filters',
  search: 'Search',
  // ...
}
```

### الفرنسية
```javascript
{
  filters: 'Filtres',
  clearFilters: 'Effacer les filtres',
  search: 'Recherche',
  // ...
}
```

## الاختبار

```bash
# تشغيل الاختبارات
npm test -- JobFilters.test.jsx

# النتيجة المتوقعة
✓ renders clear filters button
✓ clear button is disabled when no filters are active
✓ clear button is enabled when filters are active
✓ clicking clear button clears all filters
✓ clear button has proper accessibility attributes
✓ clear button shows icon
✓ filter icon is displayed in header
✓ clearing animation is applied
```

## إمكانية الوصول

- ✅ `aria-label` واضح
- ✅ `title` للتوضيح
- ✅ `disabled` state صحيح
- ✅ `focus-visible` outline
- ✅ Touch target كبير (44px)
- ✅ Keyboard navigation

## التصميم المتجاوب

### Desktop (> 1024px)
- عرض عادي
- جميع الفلاتر ظاهرة

### Tablet (640px - 1023px)
- عرض متوسط
- فلاتر قابلة للطي

### Mobile (< 640px)
- عرض كامل للزر
- فلاتر عمودية
- Touch-friendly

## RTL Support

```css
[dir="rtl"] .filters-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .filters-title {
  flex-direction: row-reverse;
}

[dir="rtl"] .clear-filters-btn {
  flex-direction: row-reverse;
}
```

## Dark Mode

```css
.dark .job-filters {
  background: #1f2937;
}

.dark .clear-filters-btn.disabled {
  border-color: #6b7280;
  color: #6b7280;
}
```

## الملفات

```
JobFilters/
├── JobFilters.jsx          # المكون الرئيسي
├── JobFilters.css          # التنسيقات
├── README.md               # هذا الملف
└── __tests__/
    └── JobFilters.test.jsx # الاختبارات
```

## التبعيات

- `react` (^18.3.1)
- `lucide-react` (^0.575.0)
- `../../context/AppContext`

## التوثيق الكامل

📄 `docs/Enhanced Job Postings/CLEAR_FILTERS_BUTTON.md`

---

**آخر تحديث**: 2026-03-07
