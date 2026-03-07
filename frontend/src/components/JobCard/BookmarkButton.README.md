# BookmarkButton Component

مكون زر حفظ الوظيفة (Bookmark) مع animations احترافية وتجربة مستخدم ممتازة.

## الميزات الرئيسية

- ✅ أيقونة قلب جذابة
- ✅ Animation عند الحفظ/الإزالة (heartBeat + ripple effect)
- ✅ تغيير اللون (رمادي → ذهبي/نحاسي)
- ✅ 3 أحجام (small, medium, large)
- ✅ نوعان (icon only, button with label)
- ✅ حالات متعددة (normal, bookmarked, loading, disabled)
- ✅ دعم RTL/LTR
- ✅ Dark Mode Support
- ✅ Accessibility كامل
- ✅ Responsive Design
- ✅ Reduced Motion Support

## الاستخدام الأساسي

```jsx
import { BookmarkButton } from '../components/JobCard';

function JobCard({ job }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleToggle = async (jobId) => {
    // API call
    const response = await fetch(`/api/jobs/${jobId}/bookmark`, {
      method: 'POST'
    });
    
    if (response.ok) {
      setIsBookmarked(!isBookmarked);
    }
  };

  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <BookmarkButton
        jobId={job.id}
        isBookmarked={isBookmarked}
        onToggle={handleToggle}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `jobId` | `string` | - | معرف الوظيفة (مطلوب) |
| `isBookmarked` | `boolean` | `false` | هل الوظيفة محفوظة |
| `onToggle` | `function` | - | دالة تبديل حالة الحفظ |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | حجم الزر |
| `variant` | `'icon' \| 'button'` | `'icon'` | نوع الزر |
| `showLabel` | `boolean` | `false` | عرض النص بجانب الأيقونة |
| `disabled` | `boolean` | `false` | تعطيل الزر |

## الأحجام

### Small (36x36px)
```jsx
<BookmarkButton
  jobId="job-1"
  isBookmarked={false}
  onToggle={handleToggle}
  size="small"
/>
```

### Medium (44x44px) - الافتراضي
```jsx
<BookmarkButton
  jobId="job-1"
  isBookmarked={false}
  onToggle={handleToggle}
  size="medium"
/>
```

### Large (52x52px)
```jsx
<BookmarkButton
  jobId="job-1"
  isBookmarked={false}
  onToggle={handleToggle}
  size="large"
/>
```

## الأنواع

### Icon Only (افتراضي)
```jsx
<BookmarkButton
  jobId="job-1"
  isBookmarked={false}
  onToggle={handleToggle}
  variant="icon"
/>
```

### Button with Label
```jsx
<BookmarkButton
  jobId="job-1"
  isBookmarked={false}
  onToggle={handleToggle}
  variant="button"
  showLabel={true}
/>
```

## الحالات

### Normal (غير محفوظة)
```jsx
<BookmarkButton
  jobId="job-1"
  isBookmarked={false}
  onToggle={handleToggle}
/>
```

### Bookmarked (محفوظة)
```jsx
<BookmarkButton
  jobId="job-1"
  isBookmarked={true}
  onToggle={handleToggle}
/>
```

### Loading (أثناء التحميل)
يتم التعامل معها تلقائياً أثناء استدعاء `onToggle`

### Disabled (معطلة)
```jsx
<BookmarkButton
  jobId="job-1"
  isBookmarked={false}
  onToggle={handleToggle}
  disabled={true}
/>
```

## Animations

### Heart Beat Animation
عند النقر على الزر، تظهر animation نبضات القلب:
- Scale up إلى 1.3x
- Scale down إلى 1x
- Scale up إلى 1.2x
- Scale down إلى 1x
- المدة: 600ms

### Ripple Effect
3 دوائر متموجة تظهر من مركز الزر:
- Ripple 1: يبدأ فوراً
- Ripple 2: يبدأ بعد 100ms
- Ripple 3: يبدأ بعد 200ms
- كل ripple يتوسع من 0.5x إلى 2x مع fade out

## التكامل مع Backend

```jsx
import { BookmarkButton } from '../components/JobCard';
import { useAuth } from '../context/AuthContext';

function JobCard({ job }) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked);

  const handleToggle = async (jobId) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle bookmark');
      }

      const data = await response.json();
      setIsBookmarked(data.bookmarked);
      
      // إشعار للمستخدم
      if (data.bookmarked) {
        showToast('تم حفظ الوظيفة في المفضلة');
      } else {
        showToast('تم إزالة الوظيفة من المفضلة');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showToast('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    }
  };

  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <BookmarkButton
        jobId={job.id}
        isBookmarked={isBookmarked}
        onToggle={handleToggle}
      />
    </div>
  );
}
```

## Accessibility

- ✅ `aria-label` ديناميكي (حفظ/إزالة)
- ✅ `title` للـ tooltip
- ✅ `role="button"` ضمني
- ✅ Keyboard navigation (Enter, Space)
- ✅ Focus indicator واضح
- ✅ Touch target >= 44x44px
- ✅ Color contrast >= 4.5:1

## Responsive Design

### Desktop
- الحجم الافتراضي: 44x44px
- Hover effects مفعّلة

### Tablet
- نفس الحجم
- Touch-friendly

### Mobile (< 640px)
- الحجم: 40x40px
- Touch targets محسّنة
- Animations أسرع قليلاً

## Dark Mode

يدعم المكون Dark Mode تلقائياً:
```css
@media (prefers-color-scheme: dark) {
  /* الألوان تتغير تلقائياً */
}
```

## RTL Support

يدعم المكون RTL/LTR تلقائياً:
```jsx
<div dir="rtl">
  <BookmarkButton ... />
</div>
```

## Reduced Motion

يحترم المكون تفضيلات المستخدم:
```css
@media (prefers-reduced-motion: reduce) {
  /* جميع animations معطلة */
}
```

## أمثلة متقدمة

### مع Context API
```jsx
import { useBookmarks } from '../context/BookmarksContext';

function JobCard({ job }) {
  const { bookmarks, toggleBookmark } = useBookmarks();
  const isBookmarked = bookmarks.has(job.id);

  return (
    <BookmarkButton
      jobId={job.id}
      isBookmarked={isBookmarked}
      onToggle={toggleBookmark}
    />
  );
}
```

### مع React Query
```jsx
import { useMutation, useQueryClient } from 'react-query';

function JobCard({ job }) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation(
    (jobId) => fetch(`/api/jobs/${jobId}/bookmark`, { method: 'POST' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('jobs');
      }
    }
  );

  return (
    <BookmarkButton
      jobId={job.id}
      isBookmarked={job.isBookmarked}
      onToggle={mutation.mutate}
    />
  );
}
```

### مع Optimistic Updates
```jsx
function JobCard({ job }) {
  const [isBookmarked, setIsBookmarked] = useState(job.isBookmarked);

  const handleToggle = async (jobId) => {
    // Optimistic update
    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      await fetch(`/api/jobs/${jobId}/bookmark`, { method: 'POST' });
    } catch (error) {
      // Rollback on error
      setIsBookmarked(previousState);
      showToast('حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    }
  };

  return (
    <BookmarkButton
      jobId={job.id}
      isBookmarked={isBookmarked}
      onToggle={handleToggle}
    />
  );
}
```

## الاختبار

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookmarkButton from './BookmarkButton';

describe('BookmarkButton', () => {
  it('renders correctly', () => {
    render(
      <BookmarkButton
        jobId="job-1"
        isBookmarked={false}
        onToggle={jest.fn()}
      />
    );
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = jest.fn();
    render(
      <BookmarkButton
        jobId="job-1"
        isBookmarked={false}
        onToggle={onToggle}
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith('job-1');
    });
  });

  it('shows correct aria-label', () => {
    const { rerender } = render(
      <BookmarkButton
        jobId="job-1"
        isBookmarked={false}
        onToggle={jest.fn()}
      />
    );
    
    expect(screen.getByLabelText('حفظ في المفضلة')).toBeInTheDocument();
    
    rerender(
      <BookmarkButton
        jobId="job-1"
        isBookmarked={true}
        onToggle={jest.fn()}
      />
    );
    
    expect(screen.getByLabelText('إزالة من المفضلة')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <BookmarkButton
        jobId="job-1"
        isBookmarked={false}
        onToggle={jest.fn()}
        disabled={true}
      />
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## الأداء

- ✅ Lightweight (< 5KB gzipped)
- ✅ No external dependencies (إلا lucide-react)
- ✅ GPU-accelerated animations
- ✅ Debounced clicks (منع double-click)
- ✅ Lazy loading للـ ripple effects

## المتصفحات المدعومة

- ✅ Chrome (Desktop + Mobile)
- ✅ Safari (Desktop + iOS)
- ✅ Firefox (Desktop + Mobile)
- ✅ Edge
- ✅ Samsung Internet
- ✅ Opera

## الملفات

```
JobCard/
├── BookmarkButton.jsx          # المكون الرئيسي
├── BookmarkButton.css          # التنسيقات والـ animations
├── BookmarkButton.README.md    # التوثيق (هذا الملف)
├── JobCardGrid.jsx             # يستخدم BookmarkButton
├── JobCardList.jsx             # يستخدم BookmarkButton
└── index.js                    # التصدير
```

## المراجع

- [Requirements 2.1, 2.2, 2.3](../../.kiro/specs/enhanced-job-postings/requirements.md)
- [Task 3.2](../../.kiro/specs/enhanced-job-postings/tasks.md)
- [Lucide React Icons](https://lucide.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح issue في المشروع.

---

**تاريخ الإنشاء**: 2026-03-06  
**آخر تحديث**: 2026-03-06  
**الحالة**: ✅ مكتمل ومفعّل
