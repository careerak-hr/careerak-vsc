# دليل البدء السريع - تحسينات الأداء

## 🚀 البدء في 5 دقائق

### 1. استيراد الأدوات (30 ثانية)

```javascript
// في أي مكون
import { 
  usePerformance, 
  useDebouncedCallback,
  usePrefetch 
} from '../hooks/usePerformance';
import { dataCache } from '../utils/performanceOptimization';
```

### 2. تفعيل التحسينات الأساسية (1 دقيقة)

```javascript
function MyComponent() {
  // تفعيل تحسينات الأداء
  const { getMetrics, isHighQualityNetwork } = usePerformance({
    enableLazyLoading: true,
    enablePerformanceMonitoring: true,
    enableMemoryCleanup: true
  });

  // Prefetch الصفحات المحتملة
  usePrefetch([
    '/api/next-page',
    '/related-page'
  ]);

  return <div>Your content</div>;
}
```

### 3. تطبيق Caching (1 دقيقة)

```javascript
const fetchData = async (params) => {
  // التحقق من الـ cache
  const cacheKey = `data_${JSON.stringify(params)}`;
  if (dataCache.has(cacheKey)) {
    return dataCache.get(cacheKey);
  }

  // جلب البيانات
  const response = await fetch('/api/data', { params });
  const data = await response.json();

  // حفظ في الـ cache
  dataCache.set(cacheKey, data);
  return data;
};
```

### 4. تطبيق Debounce (30 ثانية)

```javascript
const handleSearch = useDebouncedCallback((query) => {
  // البحث
  fetchResults(query);
}, 300);
```

### 5. Lazy Loading للمكونات (1 دقيقة)

```javascript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 6. Lazy Loading للصور (1 دقيقة)

```jsx
// استخدم data-src بدلاً من src
<img 
  data-src="/path/to/image.jpg" 
  alt="Description"
  className="lazy-image"
/>
```

---

## 📊 قياس الأداء

### في Console
```javascript
// بعد تحميل الصفحة
const metrics = getMetrics();
console.log('Performance Metrics:', metrics);
```

### النتيجة المتوقعة
```
FCP: 1200ms
LCP: 2000ms
CLS: 0.05
TTI: 3000ms
Total Load Time: 1500ms
✅ Page load time is within 2 seconds target!
```

---

## ✅ Checklist سريع

- [ ] استيراد `usePerformance` في المكون
- [ ] تفعيل lazy loading للصور
- [ ] تطبيق caching للبيانات
- [ ] استخدام debounce للبحث/الفلترة
- [ ] lazy load المكونات الثقيلة
- [ ] prefetch الصفحات المحتملة
- [ ] قياس الأداء في Console

---

## 🎯 الأهداف

- ⚡ تحميل < 2 ثانية
- 📊 FCP < 1.8s
- 📊 LCP < 2.5s
- 📊 CLS < 0.1
- 📊 TTI < 3.8s

---

## 📚 المزيد

للتفاصيل الكاملة، راجع:
- `docs/Performance/PERFORMANCE_OPTIMIZATION_COMPLETE.md`
- `frontend/src/utils/performanceOptimization.js`
- `frontend/src/hooks/usePerformance.js`

---

**تاريخ الإنشاء**: 2026-03-07
