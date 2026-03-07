# دليل البدء السريع - زر التبديل بين Grid و List

## ⚡ البدء في 5 دقائق

### 1. الاستيراد (30 ثانية)

```jsx
import ViewToggle from './components/ViewToggle/ViewToggle';
import useViewPreference from './hooks/useViewPreference';
```

### 2. الاستخدام (دقيقة)

```jsx
function JobPostingsPage() {
  const { view, setView } = useViewPreference();

  return (
    <div>
      <ViewToggle view={view} onToggle={setView} />
      
      <div className={view === 'grid' ? 'grid-view' : 'list-view'}>
        {/* محتوى الوظائف */}
      </div>
    </div>
  );
}
```

### 3. التنسيقات (دقيقتان)

```css
/* Grid View */
.grid-view {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* List View */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Responsive */
@media (max-width: 1023px) {
  .grid-view {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639px) {
  .grid-view {
    grid-template-columns: 1fr;
  }
}
```

### 4. الاختبار (دقيقة)

```bash
# تشغيل الاختبارات
npm test -- useViewPreference.test.js
npm test -- ViewToggle.test.jsx

# تشغيل المثال
npm run dev
# افتح: http://localhost:5173/examples/view-toggle
```

---

## 🎯 الميزات الرئيسية

✅ حفظ تلقائي في localStorage  
✅ استرجاع تلقائي عند التحميل  
✅ انتقال سلس (300ms)  
✅ Accessibility كامل  
✅ Responsive Design  
✅ RTL Support  
✅ Dark Mode Support  

---

## 📖 API Reference

### useViewPreference()

```javascript
const { view, toggleView, setView } = useViewPreference();

// view: 'grid' | 'list'
// toggleView: () => void
// setView: (view: 'grid' | 'list') => void
```

### ViewToggle Props

```typescript
interface ViewToggleProps {
  view: 'grid' | 'list';
  onToggle: (view: 'grid' | 'list') => void;
  className?: string;
}
```

---

## 🐛 استكشاف الأخطاء

**التفضيل لا يُحفظ؟**
- تحقق من دعم localStorage في المتصفح
- تحقق من عدم وجود أخطاء في console

**الأيقونات لا تظهر؟**
- تأكد من تثبيت lucide-react: `npm install lucide-react`

**التنسيقات لا تعمل؟**
- تأكد من استيراد ViewToggle.css

---

## 📚 المزيد من المعلومات

📄 [التوثيق الكامل](./VIEW_TOGGLE_IMPLEMENTATION.md)  
📄 [مثال كامل](../../frontend/src/examples/ViewToggleExample.jsx)  
📄 [الاختبارات](../../frontend/src/__tests__/)

---

**تاريخ الإنشاء**: 2026-03-06
