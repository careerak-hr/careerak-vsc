# BookmarkCounter Component

## 📋 نظرة عامة

مكون عداد الوظائف المحفوظة في Navbar. يعرض عدد الوظائف المحفوظة مع badge جذاب وقابل للنقر للانتقال إلى صفحة الوظائف المحفوظة.

## ✨ الميزات

- ✅ عرض عدد الوظائف المحفوظة في badge
- ✅ تحديث تلقائي عند إضافة/حذف وظيفة
- ✅ أيقونة قلب مع animation عند وجود وظائف محفوظة
- ✅ قابل للنقر للانتقال إلى صفحة الوظائف المحفوظة
- ✅ دعم RTL/LTR
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم Dark Mode
- ✅ Accessibility كامل
- ✅ حالة Loading
- ✅ مزامنة عبر النوافذ (localStorage)

## 🎨 التصميم

### الألوان
- **Badge**: Gradient نحاسي (#D48161 → #c97050)
- **Icon**: نحاسي عند وجود وظائف محفوظة
- **Hover**: خلفية نحاسية شفافة

### Animations
- **Heartbeat**: نبض القلب عند وجود وظائف محفوظة
- **Badge Appear**: ظهور Badge مع تأثير scale
- **Hover**: تكبير Badge عند hover

## 📦 الاستخدام

### Basic Usage

```jsx
import BookmarkCounter from './components/Navbar/BookmarkCounter';

function Navbar() {
  return (
    <nav>
      <BookmarkCounter />
    </nav>
  );
}
```

### مع Navbar موجود

```jsx
import BookmarkCounter from './components/Navbar/BookmarkCounter';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-actions">
        <BookmarkCounter />
        <ThemeToggle />
        <SettingsButton />
      </div>
    </nav>
  );
}
```

## 🔧 التكامل

### 1. Hook: useBookmarkCount

```javascript
import { useBookmarkCount } from '../../hooks/useBookmarkCount';

const { count, loading, error, fetchCount, incrementCount, decrementCount } = useBookmarkCount();
```

### 2. Event Emitter

```javascript
import { emitBookmarkCountChange } from '../../hooks/useBookmarkCount';

// عند إضافة وظيفة
emitBookmarkCountChange('add');

// عند حذف وظيفة
emitBookmarkCountChange('remove');

// عند تحديث القائمة
emitBookmarkCountChange('refresh');
```

### 3. BookmarkButton Integration

```jsx
import { emitBookmarkCountChange } from '../../hooks/useBookmarkCount';

const handleToggle = async (jobId) => {
  const result = await toggleBookmark(jobId);
  emitBookmarkCountChange(result.bookmarked ? 'add' : 'remove');
};
```

## 🎯 API

### useBookmarkCount Hook

```typescript
interface UseBookmarkCountReturn {
  count: number;              // العدد الحالي
  loading: boolean;           // حالة التحميل
  error: string | null;       // رسالة الخطأ
  fetchCount: () => Promise<void>;      // جلب العدد من الخادم
  incrementCount: () => void;           // زيادة العداد
  decrementCount: () => void;           // تقليل العداد
  setCount: (count: number) => void;    // تعيين العداد مباشرة
}
```

### emitBookmarkCountChange Function

```typescript
function emitBookmarkCountChange(action: 'add' | 'remove' | 'refresh'): void;
```

## 📱 Responsive Design

### Desktop (>= 1024px)
- Icon size: 20px
- Badge size: 18px
- Padding: 0.5rem

### Tablet (640px - 1023px)
- Icon size: 20px
- Badge size: 17px
- Padding: 0.45rem

### Mobile (< 640px)
- Icon size: 18px
- Badge size: 16px
- Padding: 0.4rem
- Touch target: 44x44px

## ♿ Accessibility

### ARIA Attributes
```jsx
<button
  aria-label="الوظائف المحفوظة (3)"
  title="الوظائف المحفوظة"
>
  <span aria-live="polite" aria-atomic="true">
    3
  </span>
</button>
```

### Keyboard Navigation
- **Tab**: التنقل إلى الزر
- **Enter/Space**: فتح صفحة الوظائف المحفوظة
- **Focus Visible**: Outline نحاسي

### Screen Readers
- يقرأ العدد الحالي
- يعلن عن التحديثات (aria-live)
- يوفر وصف واضح (aria-label)

## 🌍 Internationalization

### اللغات المدعومة
- العربية (ar)
- الإنجليزية (en)
- الفرنسية (fr)

### النصوص

```javascript
const labels = {
  ar: {
    title: 'الوظائف المحفوظة',
    ariaLabel: 'الوظائف المحفوظة (${count})'
  },
  en: {
    title: 'Bookmarked Jobs',
    ariaLabel: 'Bookmarked Jobs (${count})'
  },
  fr: {
    title: 'Emplois Sauvegardés',
    ariaLabel: 'Emplois Sauvegardés (${count})'
  }
};
```

## 🎨 Customization

### تخصيص الألوان

```css
.bookmark-counter-badge {
  background: linear-gradient(135deg, #your-color 0%, #your-color-dark 100%);
}

.bookmark-counter-icon.has-bookmarks {
  color: #your-color;
}
```

### تخصيص الحجم

```css
.bookmark-counter-icon {
  width: 24px;
  height: 24px;
}

.bookmark-counter-badge {
  min-width: 20px;
  height: 20px;
  font-size: 12px;
}
```

### تعطيل Animations

```css
@media (prefers-reduced-motion: reduce) {
  .bookmark-counter-icon,
  .bookmark-counter-badge {
    animation: none !important;
  }
}
```

## 🧪 Testing

### Unit Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import BookmarkCounter from './BookmarkCounter';

test('renders bookmark counter', () => {
  render(<BookmarkCounter />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('displays correct count', () => {
  localStorage.setItem('bookmarkCount', '5');
  render(<BookmarkCounter />);
  expect(screen.getByText('5')).toBeInTheDocument();
});

test('navigates to bookmarked jobs page on click', () => {
  const { container } = render(<BookmarkCounter />);
  const button = container.querySelector('button');
  fireEvent.click(button);
  expect(window.location.pathname).toBe('/bookmarked-jobs');
});
```

### Integration Tests

```javascript
test('updates count when bookmark is added', async () => {
  render(<App />);
  
  // إضافة وظيفة
  const bookmarkButton = screen.getByLabelText('حفظ في المفضلة');
  fireEvent.click(bookmarkButton);
  
  // التحقق من تحديث العداد
  await waitFor(() => {
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
```

## 🐛 Troubleshooting

### العداد لا يتحدث

**المشكلة**: العداد لا يتحدث عند إضافة/حذف وظيفة.

**الحل**:
1. تأكد من استدعاء `emitBookmarkCountChange` في BookmarkButton
2. تحقق من console للأخطاء
3. تأكد من تحديث localStorage

```javascript
// في BookmarkButton
const handleToggle = async (jobId) => {
  const result = await toggleBookmark(jobId);
  emitBookmarkCountChange(result.bookmarked ? 'add' : 'remove');
};
```

### العداد يعرض 0 دائماً

**المشكلة**: العداد يعرض 0 حتى مع وجود وظائف محفوظة.

**الحل**:
1. تحقق من localStorage: `localStorage.getItem('bookmarkCount')`
2. تأكد من تحديث localStorage عند جلب الوظائف
3. استدعِ `emitBookmarkCountChange('refresh')` بعد جلب الوظائف

```javascript
// في BookmarkedJobsPage
const fetchBookmarkedJobs = async () => {
  const jobs = await fetchJobs();
  localStorage.setItem('bookmarkCount', jobs.length.toString());
  emitBookmarkCountChange('refresh');
};
```

### Badge لا يظهر

**المشكلة**: Badge لا يظهر حتى مع وجود عدد.

**الحل**:
1. تحقق من CSS: `.bookmark-counter-badge`
2. تأكد من `count > 0`
3. تحقق من z-index

```css
.bookmark-counter-badge {
  position: absolute;
  z-index: 10;
  display: flex;
}
```

## 📚 أمثلة

### مثال 1: عداد بسيط

```jsx
import BookmarkCounter from './components/Navbar/BookmarkCounter';

function SimpleNavbar() {
  return (
    <nav>
      <BookmarkCounter />
    </nav>
  );
}
```

### مثال 2: مع تخصيص

```jsx
import BookmarkCounter from './components/Navbar/BookmarkCounter';
import './custom-bookmark-counter.css';

function CustomNavbar() {
  return (
    <nav className="custom-navbar">
      <div className="custom-actions">
        <BookmarkCounter />
      </div>
    </nav>
  );
}
```

### مثال 3: مع Context

```jsx
import { useBookmarkCount } from '../../hooks/useBookmarkCount';

function BookmarkStats() {
  const { count, loading } = useBookmarkCount();
  
  return (
    <div>
      <h2>إحصائيات الوظائف المحفوظة</h2>
      {loading ? (
        <p>جاري التحميل...</p>
      ) : (
        <p>لديك {count} وظائف محفوظة</p>
      )}
    </div>
  );
}
```

## 🔗 الملفات ذات الصلة

- `frontend/src/hooks/useBookmarkCount.js` - Hook إدارة العداد
- `frontend/src/components/Navbar/BookmarkCounter.jsx` - المكون الرئيسي
- `frontend/src/components/Navbar/BookmarkCounter.css` - التنسيقات
- `frontend/src/components/JobCard/BookmarkButton.jsx` - زر الحفظ
- `frontend/src/pages/BookmarkedJobsPage.jsx` - صفحة الوظائف المحفوظة

## 📝 ملاحظات

- العداد يستخدم localStorage للتخزين المؤقت
- يدعم المزامنة عبر النوافذ المتعددة
- يتحدث تلقائياً عند التغييرات
- يعمل مع أو بدون Backend API
- جاهز للإنتاج

## 🚀 التحسينات المستقبلية

- [ ] دعم الإشعارات عند تغيير حالة الوظيفة المحفوظة
- [ ] إضافة tooltip يعرض آخر الوظائف المحفوظة
- [ ] دعم الفلترة السريعة من العداد
- [ ] إضافة animation عند تحديث العدد
- [ ] دعم الاختصارات (Keyboard shortcuts)

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 2.5 (عداد للوظائف المحفوظة)
