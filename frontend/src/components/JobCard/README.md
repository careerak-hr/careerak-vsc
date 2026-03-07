# JobCard Components

مكونات بطاقات الوظائف مع دعم عرض Grid و List متجاوب.

## المكونات

### JobCardGrid
بطاقة وظيفة في عرض Grid مع تصميم متجاوب:
- **Desktop (≥1024px)**: 3 أعمدة
- **Tablet (640px - 1023px)**: عمودين
- **Mobile (<640px)**: عمود واحد

### JobCardList
بطاقة وظيفة في عرض List مع تفاصيل أكثر:
- صف واحد لكل وظيفة على جميع الأجهزة
- يعرض معلومات إضافية (عدد المتقدمين، نسبة التطابق)

## الاستخدام

```jsx
import { JobCardGrid, JobCardList } from './components/JobCard';
import ViewToggle from './components/ViewToggle/ViewToggle';

function JobsPage() {
  const [view, setView] = useState('grid');
  const [bookmarkedJobs, setBookmarkedJobs] = useState(new Set());

  const handleBookmark = (jobId) => {
    setBookmarkedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleShare = (job) => {
    // منطق المشاركة
  };

  const handleJobClick = (job) => {
    // التوجيه إلى صفحة التفاصيل
  };

  return (
    <div>
      <ViewToggle view={view} onToggle={setView} />
      
      <div className={view === 'grid' ? 'jobs-grid' : 'jobs-list'}>
        {jobs.map(job => (
          view === 'grid' ? (
            <JobCardGrid
              key={job.id}
              job={job}
              isBookmarked={bookmarkedJobs.has(job.id)}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onClick={handleJobClick}
            />
          ) : (
            <JobCardList
              key={job.id}
              job={job}
              isBookmarked={bookmarkedJobs.has(job.id)}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onClick={handleJobClick}
            />
          )
        ))}
      </div>
    </div>
  );
}
```

## Props

### JobCardGrid & JobCardList

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `job` | Object | ✅ | بيانات الوظيفة |
| `onBookmark` | Function | ❌ | دالة يتم استدعاؤها عند حفظ الوظيفة |
| `onShare` | Function | ❌ | دالة يتم استدعاؤها عند مشاركة الوظيفة |
| `onClick` | Function | ❌ | دالة يتم استدعاؤها عند النقر على البطاقة |
| `isBookmarked` | Boolean | ❌ | هل الوظيفة محفوظة (افتراضي: false) |

### Job Object Structure

```javascript
{
  id: Number,                    // معرف الوظيفة
  title: String,                 // عنوان الوظيفة
  company: {
    name: String,                // اسم الشركة
    logo: String | null          // رابط شعار الشركة
  },
  description: String,           // وصف الوظيفة
  location: {
    city: String                 // المدينة
  },
  type: String,                  // نوع العمل (دوام كامل، جزئي، إلخ)
  salary: Number,                // الراتب
  createdAt: Date,               // تاريخ النشر
  requiredSkills: Array<String>, // المهارات المطلوبة
  isNew: Boolean,                // هل الوظيفة جديدة
  isUrgent: Boolean,             // هل الوظيفة عاجلة
  applicantCount: Number,        // عدد المتقدمين (اختياري)
  matchPercentage: Number        // نسبة التطابق (اختياري)
}
```

## الميزات

### التصميم المتجاوب
- ✅ 3 أعمدة على Desktop
- ✅ عمودين على Tablet
- ✅ عمود واحد على Mobile
- ✅ تصميم متجاوب كامل لعرض List

### Accessibility
- ✅ ARIA labels لجميع العناصر التفاعلية
- ✅ دعم لوحة المفاتيح
- ✅ Focus indicators واضحة
- ✅ Semantic HTML

### الأداء
- ✅ Lazy loading للصور
- ✅ GPU-accelerated animations
- ✅ دعم prefers-reduced-motion

### الميزات الإضافية
- ✅ دعم RTL/LTR
- ✅ Dark mode support
- ✅ Print styles
- ✅ Badges (جديد، عاجل)
- ✅ حفظ في المفضلة
- ✅ مشاركة الوظيفة

## التخصيص

### CSS Variables
يمكنك تخصيص الألوان باستخدام CSS variables:

```css
:root {
  --primary-color: #304B60;
  --secondary-color: #E3DAD1;
  --accent-color: #D48161;
}
```

### Breakpoints
يمكنك تعديل breakpoints في ملف CSS:

```css
/* Desktop: 3 columns */
.jobs-grid {
  grid-template-columns: repeat(3, 1fr);
}

/* Tablet: 2 columns */
@media (max-width: 1023px) and (min-width: 640px) {
  .jobs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile: 1 column */
@media (max-width: 639px) {
  .jobs-grid {
    grid-template-columns: 1fr;
  }
}
```

## الاختبارات

```bash
npm test -- JobCard.test.jsx
```

## مثال كامل

راجع `frontend/src/examples/JobCardsExample.jsx` لمثال استخدام كامل.

## المتطلبات

- React 16.8+
- lucide-react (للأيقونات)

## الملفات

```
JobCard/
├── JobCardGrid.jsx       # مكون عرض Grid
├── JobCardList.jsx       # مكون عرض List
├── JobCard.css           # التنسيقات
├── index.js              # التصدير
├── README.md             # التوثيق
└── __tests__/
    └── JobCard.test.jsx  # الاختبارات
```

## الدعم

- ✅ جميع المتصفحات الحديثة
- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari, Chrome Mobile
- ✅ RTL Support
- ✅ Dark Mode
- ✅ Print

## الترخيص

جزء من مشروع Careerak - 2026
