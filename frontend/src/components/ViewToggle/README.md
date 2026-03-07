# ViewToggle Component

مكون لتبديل عرض الوظائف بين Grid (شبكي) و List (قائمة) مع حفظ التفضيل في localStorage.

## الميزات

- ✅ تبديل سلس بين Grid و List
- ✅ حفظ التفضيل في localStorage
- ✅ استرجاع تلقائي للتفضيل عند إعادة التحميل
- ✅ مزامنة بين التبويبات المفتوحة
- ✅ دعم RTL/LTR
- ✅ دعم Dark Mode
- ✅ Accessibility كامل
- ✅ Responsive Design

## الاستخدام

### 1. استيراد Hook و Component

```jsx
import { useViewPreference } from '../hooks/useViewPreference';
import ViewToggle from '../components/ViewToggle/ViewToggle';
```

### 2. استخدام في المكون

```jsx
function JobPostingsPage() {
  const [view, toggleView] = useViewPreference();

  return (
    <div>
      <ViewToggle view={view} onToggle={toggleView} />
      
      {view === 'grid' ? (
        <JobsGrid jobs={jobs} />
      ) : (
        <JobsList jobs={jobs} />
      )}
    </div>
  );
}
```

### 3. استخدام setViewType (اختياري)

```jsx
function JobPostingsPage() {
  const [view, toggleView, setViewType] = useViewPreference();

  // تعيين نوع عرض محدد
  const handleViewChange = (newView) => {
    setViewType(newView);
  };

  return (
    <div>
      <ViewToggle view={view} onToggle={toggleView} />
      
      {/* أزرار إضافية */}
      <button onClick={() => setViewType('grid')}>Grid</button>
      <button onClick={() => setViewType('list')}>List</button>
    </div>
  );
}
```

## API

### useViewPreference Hook

```typescript
const [view, toggleView, setViewType] = useViewPreference();
```

**Returns:**
- `view` (string): نوع العرض الحالي ('grid' أو 'list')
- `toggleView` (function): دالة للتبديل بين Grid و List
- `setViewType` (function): دالة لتعيين نوع عرض محدد

### ViewToggle Component

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| view | string | ✅ | - | نوع العرض الحالي ('grid' أو 'list') |
| onToggle | function | ✅ | - | دالة التبديل |
| className | string | ❌ | '' | CSS classes إضافية |

## localStorage

**Key:** `careerak_jobViewPreference`

**Values:**
- `'grid'` - عرض شبكي (افتراضي)
- `'list'` - عرض قائمة

## التخصيص

### CSS Variables

```css
:root {
  --bg-secondary: #E3DAD1;
  --text-secondary: #304B60;
  --accent: #D48161;
  --accent-dark: #c06f51;
}
```

### تخصيص الأنماط

```jsx
<ViewToggle 
  view={view} 
  onToggle={toggleView}
  className="my-custom-class"
/>
```

```css
.my-custom-class {
  /* أنماط مخصصة */
}
```

## Accessibility

- ✅ ARIA labels واضحة
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Touch targets >= 44px
- ✅ Screen reader support

## Browser Support

- ✅ Chrome (Desktop + Mobile)
- ✅ Safari (Desktop + iOS)
- ✅ Firefox (Desktop + Mobile)
- ✅ Edge
- ✅ Samsung Internet
- ✅ Opera

## Testing

```bash
npm test -- useViewPreference.test.js
```

## مثال كامل

راجع `frontend/src/examples/ViewToggleExample.jsx` لمثال كامل وتفاعلي.

## ملاحظات

- التفضيل يُحفظ تلقائياً عند التبديل
- يعمل عبر التبويبات المفتوحة (storage event)
- يتعامل مع أخطاء localStorage بشكل صحيح
- القيمة الافتراضية: 'grid'
