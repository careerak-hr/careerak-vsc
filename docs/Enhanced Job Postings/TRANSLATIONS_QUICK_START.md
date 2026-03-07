# Enhanced Job Postings - Translations Quick Start
# دليل البدء السريع - الترجمات

## 📋 نظرة عامة

نظام ترجمات شامل لصفحة الوظائف المحسّنة يدعم 3 لغات:
- ✅ العربية (ar)
- ✅ الإنجليزية (en)
- ✅ الفرنسية (fr)

---

## 🚀 الاستخدام السريع (5 دقائق)

### 1. استيراد نظام الترجمة

```javascript
import { useApp } from '../context/AppContext';
import { useEnhancedJobPostingsTranslations } from '../i18n/enhancedJobPostingsTranslations';
```

### 2. استخدام الترجمات في المكون

```jsx
function MyComponent() {
  const { language } = useApp();
  const { t } = useEnhancedJobPostingsTranslations(language);

  return (
    <div>
      <h1>{t('bookmark.myBookmarks')}</h1>
      <button>{t('bookmark.save')}</button>
    </div>
  );
}
```

### 3. الترجمات مع المعاملات

```jsx
// للترجمات التي تحتوي على {count}
<p>{t('time.daysAgo', { count: 5 })}</p>
// النتيجة بالعربية: "منذ 5 يوم"
// النتيجة بالإنجليزية: "5 days ago"
```

---

## 📚 الأقسام المتاحة

### 1. View Toggle (تبديل العرض)
```javascript
t('viewToggle.grid')           // "عرض شبكي" / "Grid View"
t('viewToggle.list')           // "عرض قائمة" / "List View"
t('viewToggle.switchToGrid')   // "التبديل إلى العرض الشبكي"
```

### 2. Bookmark System (نظام الحفظ)
```javascript
t('bookmark.save')             // "حفظ الوظيفة" / "Save Job"
t('bookmark.saved')            // "تم الحفظ" / "Saved"
t('bookmark.myBookmarks')      // "وظائفي المحفوظة" / "My Saved Jobs"
t('bookmark.noBookmarks')      // "لا توجد وظائف محفوظة"
```

### 3. Share System (نظام المشاركة)
```