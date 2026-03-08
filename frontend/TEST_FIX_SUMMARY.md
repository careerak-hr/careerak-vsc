# إصلاح أخطاء الاختبارات - 2026-03-08

## المشكلة
عند تشغيل `npm test` في frontend، ظهرت 223 خطأ parsing:
```
Cannot parse D:/Careerak/Careerak-vsc/frontend/src/test/setup.js:
Expression expected
```

## السبب
كان ملف `src/test/setup.js` يحتوي على JSX syntax داخل vi.mock()، وهذا غير مدعوم في ملفات setup.

## الإصلاح

### 1. إصلاح vite.config.js
تم تغيير `require()` إلى `await import()` في sitemapPlugin:
```javascript
// قبل
const { generateSitemapXML, routes, BASE_URL } = require('./scripts/generate-sitemap.js');

// بعد
const { generateSitemapXML, routes, BASE_URL } = await import('./scripts/generate-sitemap.js');
```

### 2. إصلاح src/test/setup.js
تم استبدال JSX syntax بـ React.createElement():

#### Framer Motion Mock
```javascript
// قبل
div: ({ children, ...props }) => <div {...props}>{children}</div>

// بعد
div: React.forwardRef((props, ref) => React.createElement('div', { ...props, ref }))
```

#### Lucide Icons Mock
```javascript
// قبل
Heart: (props) => <span data-testid="icon-heart" {...props} />

// بعد
const createIcon = (name) => React.forwardRef((props, ref) => 
  React.createElement('span', { 'data-testid': `icon-${name}`, ...props, ref })
);
Heart: createIcon('heart')
```

## النتيجة
✅ الاختبارات تعمل الآن بدون أخطاء parsing
✅ تم اختبار ملف واحد بنجاح: 13/13 passed

## ملاحظات
- عدد ملفات الاختبار: 223 ملف
- الاختبارات تأخذ وقتاً طويلاً (3+ دقائق)
- يمكن تشغيل اختبار واحد: `npm test -- path/to/test.jsx --run`
- يمكن تشغيل جميع الاختبارات: `npm test -- --run`

## الملفات المعدلة
1. `frontend/vite.config.js` - إصلاح sitemapPlugin
2. `frontend/src/test/setup.js` - إزالة JSX syntax من mocks
