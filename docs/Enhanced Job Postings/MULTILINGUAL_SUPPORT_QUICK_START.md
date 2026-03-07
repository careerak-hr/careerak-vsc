# دعم كامل للعربية والإنجليزية - دليل البدء السريع

## 📋 نظرة عامة

نظام ترجمة شامل لميزة تحسينات صفحة الوظائف مع دعم كامل للعربية والإنجليزية.

**تاريخ الإنشاء**: 2026-03-07  
**الحالة**: ✅ مكتمل ومفعّل

---

## 🚀 البدء السريع (5 دقائق)

### 1. استيراد Hook الترجمة

```jsx
import { useEnhancedJobTranslations } from '../hooks/useEnhancedJobTranslations';

function MyComponent() {
  const { t, formatTimeAgo, formatSalary, isRTL } = useEnhancedJobTranslations();
  
  return (
    <div className={isRTL() ? 'rtl' : 'ltr'}>
      <h1>{t('jobCard.title')}</h1>
    </div>
  );
}
```

### 2. استخدام الترجمات الأساسية

```jsx
// ترجمة بسيطة
<button>{t('bookmark.save')}</button>

// ترجمة مع معاملات
<p>{t('salary.tooltip', { count: 10 })}</p>

// ترجمة مع الجمع
<span>{tp('jobCard.applicants', 25)}</span>
```

### 3. تنسيق التواريخ والأرقام

```jsx
// تنسيق الوقت
<span>{formatTimeAgo(job.postedDate)}</span>
// النتيجة: "منذ 3 أيام" أو "3 days ago"

// تنسيق الراتب
<span>{formatSalary(15000)}</span>
// النتيجة: "15,000 ريال" أو "SAR 15,000"

// تنسيق العدد مع الجمع
<span>{formatCount(42, 'filters.results')}</span>
// النتيجة: "42 نتيجة" أو "42 results"
```

### 4. إضافة دعم RTL/LTR

```jsx
import '../styles/enhancedJobPostingsRTL.css';

function JobCard() {
  const { isRTL } = useEnhancedJobTranslations();
  
  return (
    <div 
      className="job-card"
      dir={isRTL() ? 'rtl' : 'ltr'}
    >
      {/* المحتوى */}
    </div>
  );
}
```

---

## 📚 الدوال المتاحة

### `t(key, params)`
ترجمة مفتاح معين

```jsx
t('bookmark.save')
t('salary.tooltip', { count: 10 })
```

### `tp(key, count, params)`
ترجمة مع الجمع

```jsx
tp('jobCard.applicants', 1)  // "متقدم" أو "applicant"
tp('jobCard.applicants', 5)  // "متقدمين" أو "applicants"
```

### `formatTimeAgo(date)`
تنسيق الوقت النسبي

```jsx
formatTimeAgo(new Date())  // "الآن" أو "Just now"
formatTimeAgo(pastDate)    // "منذ 3 أيام" أو "3 days ago"
```

### `formatSalary(amount)`
تنسيق الراتب مع العملة

```jsx
formatSalary(15000)  // "15,000 ريال" أو "SAR 15,000"
```

### `formatCount(count, key)`
تنسيق العدد مع الجمع

```jsx
formatCount(42, 'filters.results')  // "42 نتيجة" أو "42 results"
```

### `isRTL()`
التحقق من اتجاه اللغة

```jsx
isRTL()  // true للعربية، false للإنجليزية
```

---

## 🎨 أمثلة عملية

### مثال 1: بطاقة وظيفة

```jsx
function JobCard({ job }) {
  const { t, formatTimeAgo, formatSalary, formatCount } = useEnhancedJobTranslations();
  
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{formatSalary(job.salary)} {t('salary.perMonth')}</p>
      <p>{formatTimeAgo(job.postedDate)}</p>
      <p>{formatCount(job.applicants, 'jobCard.applicants')}</p>
      
      {job.isUrgent && (
        <span className="badge urgent">{t('jobCard.urgent')}</span>
      )}
      
      <button>{t('jobCard.apply')}</button>
    </div>
  );
}
```

### مثال 2: زر الحفظ

```jsx
function BookmarkButton({ jobId, isBookmarked, onToggle }) {
  const { t } = useEnhancedJobTranslations();
  
  return (
    <button 
      onClick={onToggle}
      title={isBookmarked ? t('bookmark.remove') : t('bookmark.save')}
    >
      <i className={isBookmarked ? 'fas fa-heart' : 'far fa-heart'}></i>
      <span>{isBookmarked ? t('bookmark.saved') : t('bookmark.save')}</span>
    </button>
  );
}
```

### مثال 3: مؤشر الراتب

```jsx
function SalaryIndicator({ estimate }) {
  const { t, formatSalary } = useEnhancedJobTranslations();
  
  return (
    <div className="salary-indicator">
      <h4>{t('salary.estimation')}</h4>
      
      <div className="salary-row">
        <span>{t('salary.provided')}:</span>
        <strong>{formatSalary(estimate.provided)}</strong>
      </div>
      
      <div className="salary-row">
        <span>{t('salary.marketAverage')}:</span>
        <span>{formatSalary(estimate.market.average)}</span>
      </div>
      
      <div className="salary-comparison">
        {t(`salary.${estimate.comparison}`)}
        {estimate.percentageDiff > 0 && (
          <span> ({estimate.percentageDiff}%)</span>
        )}
      </div>
    </div>
  );
}
```

### مثال 4: قائمة الفلاتر

```jsx
function FiltersPanel({ resultsCount }) {
  const { t, formatCount } = useEnhancedJobTranslations();
  
  return (
    <div className="filters-panel">
      <h3>{t('filters.title')}</h3>
      
      <div className="filter-group">
        <label>{t('filters.field')}</label>
        <select>
          <option>Technology</option>
          <option>Marketing</option>
        </select>
      </div>
      
      <div className="filters-footer">
        <p>{formatCount(resultsCount, 'filters.results')}</p>
        <button>{t('filters.apply')}</button>
      </div>
    </div>
  );
}
```

---

## 🔑 المفاتيح المتاحة

### View Toggle
- `viewToggle.grid` - عرض شبكي / Grid View
- `viewToggle.list` - عرض قائمة / List View

### Bookmark
- `bookmark.save` - حفظ الوظيفة / Save Job
- `bookmark.saved` - تم الحفظ / Saved
- `bookmark.remove` - إزالة من المحفوظات / Remove from Saved
- `bookmark.myBookmarks` - وظائفي المحفوظة / My Saved Jobs

### Share
- `share.title` - مشاركة الوظيفة / Share Job
- `share.copyLink` - نسخ الرابط / Copy Link
- `share.linkCopied` - تم نسخ الرابط / Link Copied
- `share.whatsapp` - واتساب / WhatsApp
- `share.linkedin` - لينكد إن / LinkedIn

### Similar Jobs
- `similarJobs.title` - وظائف مشابهة / Similar Jobs
- `similarJobs.similarity` - نسبة التشابه / Similarity
- `similarJobs.viewAll` - عرض الكل / View All

### Salary
- `salary.estimation` - تقدير الراتب / Salary Estimation
- `salary.provided` - الراتب المعروض / Offered Salary
- `salary.marketAverage` - متوسط السوق / Market Average
- `salary.below` - أقل من المتوسط / Below Average
- `salary.average` - متوسط السوق / Market Average
- `salary.above` - أعلى من المتوسط / Above Average

### Company
- `company.info` - معلومات الشركة / Company Information
- `company.size` - حجم الشركة / Company Size
- `company.rating` - التقييم / Rating
- `company.responseRate` - معدل الاستجابة / Response Rate

### Job Card
- `jobCard.apply` - تقديم / Apply
- `jobCard.viewDetails` - عرض التفاصيل / View Details
- `jobCard.urgent` - عاجل / Urgent
- `jobCard.new` - جديد / New
- `jobCard.fullTime` - دوام كامل / Full Time
- `jobCard.partTime` - دوام جزئي / Part Time
- `jobCard.remote` - عن بُعد / Remote

### Filters
- `filters.title` - الفلاتر / Filters
- `filters.clear` - مسح الفلاتر / Clear Filters
- `filters.apply` - تطبيق / Apply
- `filters.field` - المجال / Field
- `filters.location` - الموقع / Location
- `filters.jobType` - نوع العمل / Job Type

### Loading
- `loading.jobs` - جاري تحميل الوظائف... / Loading jobs...
- `loading.similar` - جاري تحميل الوظائف المشابهة... / Loading similar jobs...

### Errors
- `errors.loadJobs` - فشل تحميل الوظائف / Failed to load jobs
- `errors.tryAgain` - حاول مرة أخرى / Try Again

---

## 🎯 أفضل الممارسات

### ✅ افعل

1. **استخدم Hook في كل مكون**
```jsx
const { t } = useEnhancedJobTranslations();
```

2. **استخدم دوال التنسيق**
```jsx
formatTimeAgo(date)  // بدلاً من تنسيق يدوي
formatSalary(amount) // بدلاً من toLocaleString
```

3. **أضف دعم RTL/LTR**
```jsx
<div dir={isRTL() ? 'rtl' : 'ltr'}>
```

4. **استخدم الجمع الصحيح**
```jsx
tp('jobCard.applicants', count)  // بدلاً من t
```

### ❌ لا تفعل

1. **لا تكتب النصوص مباشرة**
```jsx
// ❌ خطأ
<button>حفظ</button>

// ✅ صحيح
<button>{t('bookmark.save')}</button>
```

2. **لا تنسى المعاملات**
```jsx
// ❌ خطأ
t('salary.tooltip')

// ✅ صحيح
t('salary.tooltip', { count: 10 })
```

3. **لا تتجاهل RTL**
```jsx
// ❌ خطأ
<div className="job-card">

// ✅ صحيح
<div className="job-card" dir={isRTL() ? 'rtl' : 'ltr'}>
```

---

## 📁 الملفات

```
frontend/src/
├── translations/
│   └── enhancedJobPostings.js          # جميع الترجمات
├── hooks/
│   └── useEnhancedJobTranslations.js   # Hook الترجمة
├── styles/
│   └── enhancedJobPostingsRTL.css      # دعم RTL/LTR
└── examples/
    └── EnhancedJobTranslationsExample.jsx  # أمثلة كاملة
```

---

## 🔍 استكشاف الأخطاء

### المشكلة: الترجمة لا تظهر

**الحل**:
```jsx
// تحقق من استيراد Hook
import { useEnhancedJobTranslations } from '../hooks/useEnhancedJobTranslations';

// تحقق من استخدام Hook
const { t } = useEnhancedJobTranslations();

// تحقق من المفتاح الصحيح
t('bookmark.save')  // وليس t('save')
```

### المشكلة: RTL لا يعمل

**الحل**:
```jsx
// استورد CSS
import '../styles/enhancedJobPostingsRTL.css';

// أضف dir attribute
<div dir={isRTL() ? 'rtl' : 'ltr'}>
```

### المشكلة: الجمع غير صحيح

**الحل**:
```jsx
// استخدم tp بدلاً من t
tp('jobCard.applicants', count)  // وليس t('jobCard.applicants')
```

---

## 📊 الفوائد

- ✅ دعم كامل للعربية والإنجليزية
- ✅ تنسيق تلقائي للتواريخ والأرقام
- ✅ دعم RTL/LTR كامل
- ✅ سهل الاستخدام والصيانة
- ✅ قابل للتوسع لإضافة لغات جديدة
- ✅ أداء عالي (لا overhead)

---

## 🚀 الخطوات التالية

1. ✅ استخدم Hook في جميع المكونات
2. ✅ استورد CSS للـ RTL/LTR
3. ✅ اختبر على اللغتين
4. ✅ راجع الأمثلة في `EnhancedJobTranslationsExample.jsx`

---

**تاريخ الإنشاء**: 2026-03-07  
**آخر تحديث**: 2026-03-07  
**الحالة**: ✅ جاهز للاستخدام
