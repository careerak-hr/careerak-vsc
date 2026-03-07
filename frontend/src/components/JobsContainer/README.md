# JobsContainer Component

مكون حاوية الوظائف مع انتقالات سلسة بين عرض Grid و List باستخدام Framer Motion.

## الميزات الرئيسية

- ✅ انتقالات سلسة بين Grid و List (< 300ms)
- ✅ Stagger animation للبطاقات
- ✅ Spring physics للحركة الطبيعية
- ✅ دعم `prefers-reduced-motion`
- ✅ Layout animations تلقائية
- ✅ Performance محسّن

## الاستخدام

```jsx
import JobsContainer from './components/JobsContainer/JobsContainer';

function JobsPage() {
  const [view, setView] = useState('grid');
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  return (
    <JobsContainer
      jobs={jobs}
      view={view}
      onBookmark={handleBookmark}
      onShare={handleShare}
      onJobClick={handleJobClick}
      bookmarkedJobs={bookmarkedJobs}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `jobs` | `Array` | ✅ | `[]` | قائمة الوظائف |
| `view` | `'grid' \| 'list'` | ✅ | `'grid'` | نوع العرض |
| `onBookmark` | `Function` | ❌ | - | دالة حفظ الوظيفة |
| `onShare` | `Function` | ❌ | - | دالة مشاركة الوظيفة |
| `onJobClick` | `Function` | ❌ | - | دالة عند النقر على وظيفة |
| `bookmarkedJobs` | `Array` | ❌ | `[]` | قائمة IDs الوظائف المحفوظة |

## Animation Details

### Container Animation
```javascript
{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,  // تأخير 50ms بين كل بطاقة
      delayChildren: 0.1      // تأخير 100ms قبل البدء
    }
  }
}
```

### Item Animation
```javascript
{
  hidden: { 
    opacity: 0, 
    y: 20,           // تبدأ 20px للأسفل
    scale: 0.95      // تبدأ بحجم 95%
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,  // صلابة النابض
      damping: 15,     // التخميد
      mass: 0.5        // الكتلة
    }
  }
}
```

### Layout Transition
```javascript
{
  type: 'spring',
  stiffness: 200,
  damping: 25,
  mass: 0.8
}
```

## Performance

- استخدام `AnimatePresence` مع `mode="wait"` لتجنب تداخل الـ animations
- `layout` prop للـ automatic layout animations
- GPU-accelerated properties فقط (opacity, transform)
- Stagger animation محسّن (50ms بين كل بطاقة)

## Accessibility

- دعم كامل لـ `prefers-reduced-motion`
- جميع الـ animations تُعطل تلقائياً للمستخدمين الذين يفضلون تقليل الحركة
- Semantic HTML
- ARIA labels في البطاقات

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Examples

### مثال كامل
انظر `frontend/src/examples/JobsContainerExample.jsx`

### مثال بسيط
```jsx
<JobsContainer
  jobs={[
    { id: '1', title: 'مطور Full Stack', ... },
    { id: '2', title: 'مصمم UI/UX', ... }
  ]}
  view="grid"
/>
```

### مع Bookmarks
```jsx
const [bookmarked, setBookmarked] = useState(['1', '3']);

<JobsContainer
  jobs={jobs}
  view={view}
  bookmarkedJobs={bookmarked}
  onBookmark={(id) => {
    setBookmarked(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }}
/>
```

## Testing

```bash
npm test -- JobsContainer.test.jsx
```

## Dependencies

- `framer-motion` ^10.0.0
- `react` ^18.0.0
- `lucide-react` ^0.263.0

## Related Components

- `JobCardGrid` - بطاقة الوظيفة في عرض Grid
- `JobCardList` - بطاقة الوظيفة في عرض List
- `ViewToggle` - زر التبديل بين العرضين

## Notes

- الـ animations تستخدم spring physics للحركة الطبيعية
- التأخير بين البطاقات (stagger) يحسّن التجربة البصرية
- Layout animations تلقائية عند تغيير الترتيب
- Performance ممتاز حتى مع 100+ وظيفة

## Requirements Validation

✅ **Requirements 1.5**: انتقال سلس بين العرضين (animation)
- Spring animation مع stagger effect
- مدة < 300ms
- GPU-accelerated
- دعم reduced motion

## License

MIT
