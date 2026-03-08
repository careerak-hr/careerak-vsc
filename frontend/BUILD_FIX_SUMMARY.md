# إصلاح أخطاء البناء - 2026-03-08

## المشاكل المكتشفة والحلول

### 1. ✅ pdfjs-dist و video.js غير مثبتة
**الملف**: `src/utils/performanceOptimization.js`
**الحل**: تعليق الاستيرادات الديناميكية للمكتبات غير المثبتة

### 2. ✅ direction-rtl class غير موجودة
**الملف**: `src/pages/11_CoursesPage.css`
**الحل**: إزالة `@apply direction-rtl` (ليست class في Tailwind)

### 3. ✅ Circular dependency مع @apply grid
**الملف**: `src/pages/11_CoursesPage.css`
**الحل**: استبدال `@apply grid gap-6` بـ CSS عادي:
```css
display: grid;
gap: 1.5rem;
```

### 4. ✅ Circular dependency مع @apply flex
**الملف**: `src/pages/11_CoursesPage.css`
**الحل**: استبدال `@apply flex flex-col` بـ CSS عادي:
```css
display: flex;
flex-direction: column;
```

### 5. ✅ Circular dependency مع @apply grid-cols-*
**الملف**: `src/pages/11_CoursesPage.css`
**الحل**: استبدال `@apply grid-cols-2` بـ CSS عادي:
```css
grid-template-columns: repeat(2, minmax(0, 1fr));
```

### 6. ✅ CourseCurriculum component مفقود
**الملف**: `src/pages/CourseDetailsPage.jsx`
**الحل**: تعليق الاستيراد والاستخدام، إضافة placeholder

### 7. ✅ recharts library غير مثبتة
**الملف**: `src/components/ProfileImprovement/ProfileAnalytics.jsx`
**الحل**: تعليق الاستيراد والاستخدام، إضافة placeholder

### 8. ⏳ مكونات Courses مفقودة
**الملفات المفقودة**:
- `src/components/Courses/CourseHero.jsx`
- `src/components/Courses/CourseOverview.jsx`
- `src/components/Courses/InstructorInfo.jsx`
- `src/components/Courses/CourseReviews.jsx`

**الحل المؤقت**: تعليق الاستيرادات، يحتاج إنشاء المكونات أو تعليق الاستخدام

## الملفات المعدلة
1. ✅ `frontend/vite.config.js` - إصلاح sitemapPlugin
2. ✅ `frontend/src/test/setup.js` - إزالة JSX من mocks
3. ✅ `frontend/src/utils/performanceOptimization.js` - تعليق مكتبات غير مثبتة
4. ✅ `frontend/src/pages/11_CoursesPage.css` - إصلاح circular dependencies
5. ✅ `frontend/src/pages/CourseDetailsPage.jsx` - تعليق مكونات مفقودة
6. ✅ `frontend/src/components/ProfileImprovement/ProfileAnalytics.jsx` - تعليق recharts

## الخطوات التالية
1. إنشاء المكونات المفقودة في `src/components/Courses/`
2. أو تعليق استخدامها في `CourseDetailsPage.jsx`
3. تثبيت المكتبات المطلوبة إذا لزم الأمر:
   - `npm install recharts` (للرسوم البيانية)
   - `npm install pdfjs-dist` (لعرض PDF)
   - `npm install video.js` (لمشغل الفيديو)

## ملاحظات
- جميع الإصلاحات مؤقتة باستخدام placeholders
- يجب إنشاء المكونات المفقودة للحصول على وظائف كاملة
- البناء يجب أن ينجح الآن مع placeholders
