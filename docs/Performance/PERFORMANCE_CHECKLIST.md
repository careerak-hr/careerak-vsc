# قائمة التحقق - تحسينات الأداء

## ✅ Checklist للمطورين

استخدم هذه القائمة عند إضافة مكون أو صفحة جديدة:

### 1. الإعداد الأساسي
- [ ] استيراد `usePerformance` من `../hooks/usePerformance`
- [ ] تفعيل التحسينات الأساسية في المكون
- [ ] إضافة Performance Monitoring

```javascript
const { getMetrics, isHighQualityNetwork } = usePerformance({
  enableLazyLoading: true,
  enablePerformanceMonitoring: true,
  enableMemoryCleanup: true
});
```

### 2. الصور
- [ ] استخدام `data-src` بدلاً من `src` للصور
- [ ] إضافة `className="lazy-image"` للصور
- [ ] تحديد `width` و `height` لمنع CLS
- [ ] استخدام `alt` text وصفي

```jsx
<img 
  data-src="/path/to/image.jpg" 
  alt="Descriptive text"
  width="300"
  height="200"
  className="lazy-image"
/>
```

### 3. المكونات الثقيلة
- [ ] استخدام `lazy()` للمكونات الثقيلة
- [ ] إضافة `Suspense` مع fallback مناسب
- [ ] تحديد `webpackChunkName` للتسمية الواضحة

```javascript
const HeavyComponent = lazy(() => 
  import(/* webpackChunkName: "heavy-component" */ './HeavyComponent')
);

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

### 4. البيانات والطلبات
- [ ] استخدام `dataCache` للبيانات المتكررة
- [ ] التحقق من الـ cache قبل الجلب
- [ ] حفظ النتائج في الـ cache بعد الجلب

```javascript
const cacheKey = `data_${JSON.stringify(params)}`;

if (dataCache.has(cacheKey)) {
  return dataCache.get(cacheKey);
}

const data = await fetchData(params);
dataCache.set(cacheKey, data);
```

### 5. البحث والفلترة
- [ ] استخدام `useDebouncedCallback` للبحث
- [ ] تحديد delay مناسب (300ms للبحث)
- [ ] استخدام `useThrottledCallback` للـ scroll

```javascript
const handleSearch = useDebouncedCallback((query) => {
  fetchResults(query);
}, 300);
```

### 6. Prefetching
- [ ] استخدام `usePrefetch` للصفحات المحتملة
- [ ] تحديد الصفحات الأكثر احتمالاً للزيارة

```javascript
usePrefetch([
  '/api/next-page',
  '/related-page',
  '/details-page'
]);
```

### 7. الرسوم المتحركة
- [ ] استخدام `transform` و `opacity` فقط
- [ ] تجنب `width`, `height`, `top`, `left`
- [ ] استخدام `will-change` بحذر
- [ ] مدة قصيرة (< 300ms)

```css
.animated {
  transition: transform 300ms ease, opacity 300ms ease;
  will-change: transform, opacity;
}
```

### 8. الأداء على الشبكات البطيئة
- [ ] استخدام `isHighQualityNetwork()` للتحقق
- [ ] تقليل الجودة على الشبكات البطيئة
- [ ] توفير fallback للمحتوى

```javascript
const quality = isHighQualityNetwork() ? 'high' : 'medium';
```

### 9. الاختبار
- [ ] اختبار على Chrome DevTools (Throttling)
- [ ] اختبار على أجهزة حقيقية
- [ ] قياس الأداء بـ `npm run measure:performance`
- [ ] التحقق من تحقيق الأهداف (< 2s)

### 10. التوثيق
- [ ] إضافة تعليقات للكود المعقد
- [ ] توثيق أي تحسينات مخصصة
- [ ] تحديث README إذا لزم الأمر

---

## 🎯 الأهداف المطلوبة

يجب تحقيق هذه الأهداف لكل صفحة:

- [ ] **Load Time**: < 2 seconds
- [ ] **FCP**: < 1.8 seconds
- [ ] **LCP**: < 2.5 seconds
- [ ] **CLS**: < 0.1
- [ ] **TTI**: < 3.8 seconds

---

## 🚫 الأخطاء الشائعة

### ❌ لا تفعل

1. **تحميل جميع الصور مرة واحدة**
   ```jsx
   // ❌ خطأ
   <img src="/large-image.jpg" />
   ```

2. **تجاهل الـ caching**
   ```javascript
   // ❌ خطأ
   const data = await fetch('/api/data');
   ```

3. **استخدام animations ثقيلة**
   ```css
   /* ❌ خطأ */
   .animated {
     transition: width 500ms, height 500ms;
   }
   ```

4. **عدم استخدام debounce للبحث**
   ```javascript
   // ❌ خطأ
   const handleSearch = (query) => {
     fetchResults(query); // يُستدعى مع كل حرف!
   };
   ```

5. **تحميل مكتبات كبيرة بدون حاجة**
   ```javascript
   // ❌ خطأ
   import _ from 'lodash'; // تحميل كامل المكتبة!
   ```

### ✅ افعل

1. **استخدم lazy loading**
   ```jsx
   // ✅ صحيح
   <img data-src="/large-image.jpg" className="lazy-image" />
   ```

2. **طبق caching**
   ```javascript
   // ✅ صحيح
   if (dataCache.has(key)) return dataCache.get(key);
   const data = await fetch('/api/data');
   dataCache.set(key, data);
   ```

3. **استخدم animations خفيفة**
   ```css
   /* ✅ صحيح */
   .animated {
     transition: transform 300ms, opacity 300ms;
   }
   ```

4. **استخدم debounce**
   ```javascript
   // ✅ صحيح
   const handleSearch = useDebouncedCallback((query) => {
     fetchResults(query);
   }, 300);
   ```

5. **استورد فقط ما تحتاج**
   ```javascript
   // ✅ صحيح
   import { debounce } from 'lodash-es';
   ```

---

## 📊 كيفية القياس

### 1. محلياً
```bash
npm run build
npm run preview
npm run measure:performance
```

### 2. في DevTools
1. افتح Chrome DevTools
2. اذهب إلى Performance tab
3. اضغط Record
4. حمّل الصفحة
5. اضغط Stop
6. راجع المقاييس

### 3. Lighthouse
```bash
lighthouse http://localhost:4173 --view
```

---

## 🆘 المساعدة

### إذا كانت الصفحة بطيئة:

1. **تحقق من الصور**
   - هل تستخدم lazy loading؟
   - هل الصور محسّنة؟

2. **تحقق من الطلبات**
   - هل تستخدم caching؟
   - هل هناك طلبات مكررة؟

3. **تحقق من المكونات**
   - هل المكونات الثقيلة lazy loaded؟
   - هل هناك re-renders غير ضرورية؟

4. **تحقق من الرسوم المتحركة**
   - هل تستخدم transform/opacity فقط؟
   - هل المدة قصيرة (< 300ms)؟

5. **استخدم الأدوات**
   ```bash
   npm run measure:performance
   ```

---

## 📚 المراجع

- `docs/Performance/PERFORMANCE_OPTIMIZATION_COMPLETE.md`
- `docs/Performance/PERFORMANCE_OPTIMIZATION_QUICK_START.md`
- `frontend/PERFORMANCE_README.md`
- `frontend/src/utils/performanceOptimization.js`
- `frontend/src/hooks/usePerformance.js`

---

**آخر تحديث**: 2026-03-07
