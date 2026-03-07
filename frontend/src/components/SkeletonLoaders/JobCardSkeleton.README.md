# Job Card Skeleton Loaders

مكونات Skeleton للوظائف مع دعم Grid و List views.

## 📋 المتطلبات

- **Requirements 7.1**: Skeleton screens لبطاقات الوظائف
- **Requirements 7.2**: Skeleton يحاكي شكل البطاقة الحقيقية
- **Requirements 7.3**: تأثير shimmer/pulse للحركة
- **Requirements 7.4**: عرض 6-9 skeletons أثناء التحميل
- **Requirements 7.5**: انتقال سلس من skeleton إلى المحتوى الحقيقي
- **Requirements 7.6**: skeleton مختلف لـ Grid و List
- **Requirements 7.7**: لا spinners دوّارة

## 🎯 الميزات

### JobCardGridSkeleton
- ✅ يطابق تصميم JobCardGrid بالضبط
- ✅ عرض Grid (3-2-1 أعمدة)
- ✅ تأثير shimmer/pulse
- ✅ انتقال fade 200ms
- ✅ دعم Dark mode
- ✅ دعم RTL
- ✅ Responsive design
- ✅ منع layout shifts (CLS = 0)

### JobCardListSkeleton
- ✅ يطابق تصميم JobCardList بالضبط
- ✅ عرض List (صف واحد مع تفاصيل أكثر)
- ✅ تأثير shimmer/pulse
- ✅ انتقال fade 200ms
- ✅ دعم Dark mode
- ✅ دعم RTL
- ✅ Responsive design
- ✅ منع layout shifts (CLS = 0)

## 📦 الاستخدام

### Grid View

```jsx
import { JobCardGridSkeleton } from './components/SkeletonLoaders';

function JobPostingsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        <JobCardGridSkeleton count={6} />
      ) : (
        jobs.map(job => <JobCardGrid key={job.id} job={job} />)
      )}
    </div>
  );
}
```

### List View

```jsx
import { JobCardListSkeleton } from './components/SkeletonLoaders';

function JobPostingsPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  return (
    <div className="space-y-4">
      {loading ? (
        <JobCardListSkeleton count={6} />
      ) : (
        jobs.map(job => <JobCardList key={job.id} job={job} />)
      )}
    </div>
  );
}
```

### مع View Toggle

```jsx
import { JobCardGridSkeleton, JobCardListSkeleton } from './components/SkeletonLoaders';

function JobPostingsPage() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [jobs, setJobs] = useState([]);

  return (
    <>
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <JobCardGridSkeleton count={6} />
          ) : (
            jobs.map(job => <JobCardGrid key={job.id} job={job} />)
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <JobCardListSkeleton count={6} />
          ) : (
            jobs.map(job => <JobCardList key={job.id} job={job} />)
          )}
        </div>
      )}
    </>
  );
}
```

## 🎨 Props

### JobCardGridSkeleton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `1` | عدد skeletons (6-9 موصى به) |
| `className` | `string` | `''` | CSS classes إضافية |

### JobCardListSkeleton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `1` | عدد skeletons (6-9 موصى به) |
| `className` | `string` | `''` | CSS classes إضافية |

## 🎭 التأثيرات

### Shimmer Animation
- تأثير shimmer يتحرك من اليسار لليمين
- مدة: 2 ثانية
- يتكرر بشكل لا نهائي
- يحترم `prefers-reduced-motion`

### Fade Transition
- مدة: 200ms
- Easing: ease-in-out
- يحترم `prefers-reduced-motion`

## ♿ Accessibility

- ✅ `role="status"` للإعلان عن حالة التحميل
- ✅ `aria-busy="true"` للإشارة إلى التحميل
- ✅ `aria-label` وصفية لكل skeleton
- ✅ يحترم `prefers-reduced-motion`
- ✅ keyboard navigation friendly

## 🌙 Dark Mode

يدعم Dark mode تلقائياً:
- خلفية: `bg-white dark:bg-gray-800`
- shimmer: شفافية مختلفة للوضع الداكن

## 🌍 RTL Support

يدعم RTL تلقائياً:
- shimmer يتحرك في الاتجاه الصحيح
- layout يتكيف مع الاتجاه

## 📱 Responsive Design

### Grid View
- Desktop (≥1024px): 3 أعمدة
- Tablet (640-1023px): 2 أعمدة
- Mobile (<640px): 1 عمود

### List View
- جميع الأحجام: 1 عمود
- تفاصيل أكثر على الشاشات الكبيرة

## 🧪 الاختبارات

```bash
npm test -- JobCardSkeleton.test.jsx
```

### الاختبارات المتاحة
- ✅ Rendering single skeleton
- ✅ Rendering multiple skeletons
- ✅ Correct aria attributes
- ✅ Custom className
- ✅ All skeleton elements present
- ✅ Skeleton count consistency (Property 10)

## 📊 الأداء

- **CLS**: 0 (لا layout shifts)
- **Animation**: GPU-accelerated
- **Bundle size**: ~2KB (gzipped)

## 🔗 الملفات ذات الصلة

- `JobCardGridSkeleton.jsx` - مكون Grid skeleton
- `JobCardListSkeleton.jsx` - مكون List skeleton
- `JobCardSkeleton.css` - تنسيقات و animations
- `JobCardSkeletonExample.jsx` - مثال كامل
- `__tests__/JobCardSkeleton.test.jsx` - اختبارات

## 📝 ملاحظات

- استخدم 6-9 skeletons للحصول على أفضل تجربة
- تأكد من مطابقة layout الـ skeleton مع المحتوى الفعلي
- استخدم نفس grid/spacing للـ skeleton والمحتوى
- لا تنسى إضافة fade transition عند تحميل المحتوى

## 🎯 أفضل الممارسات

### ✅ افعل
- استخدم 6-9 skeletons
- طابق layout المحتوى الفعلي
- استخدم fade transition
- احترم `prefers-reduced-motion`

### ❌ لا تفعل
- لا تستخدم spinners دوّارة
- لا تستخدم عدد قليل جداً من skeletons (< 3)
- لا تستخدم عدد كبير جداً من skeletons (> 12)
- لا تنسى Dark mode support

## 📚 المراجع

- [Skeleton Screens Best Practices](https://www.nngroup.com/articles/skeleton-screens/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
