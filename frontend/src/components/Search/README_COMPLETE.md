# Advanced Search & Filter System - Frontend Components

## 📋 نظرة عامة

نظام شامل للبحث والفلترة المتقدمة مع دعم كامل للغة العربية والإنجليزية والفرنسية، تصميم متجاوب، ودعم الوضع الداكن.

**تاريخ الإنشاء**: 2026-03-04  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 1.1-6.4

---

## 🎯 المكونات الرئيسية

### 1. SearchBar Component
شريط بحث ذكي مع اقتراحات تلقائية (Autocomplete)

**الملفات**:
- `SearchBar.jsx` - المكون الرئيسي
- `SearchBar.css` - التنسيقات

**الميزات**:
- ✅ اقتراحات تلقائية بعد 3 أحرف
- ✅ Debouncing (300ms) لتحسين الأداء
- ✅ التنقل بلوحة المفاتيح (Arrow keys, Enter, Escape)
- ✅ دعم RTL/LTR
- ✅ Font size 16px (منع zoom في iOS)
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ Loading indicator
- ✅ Accessibility كامل

**الاستخدام**:
```jsx
import { SearchBar } from '../components/Search';

<SearchBar
  initialValue=""
  onSearch={(query) => console.log(query)}
  onSuggestionSelect={(suggestion) => console.log(suggestion)}
  placeholder="ابحث عن وظائف..."
  autoFocus={true}
  type="jobs"
  minChars={3}
/>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialValue` | `String` | `''` | القيمة الأولية |
| `onSearch` | `Function` | - | دالة البحث (required) |
| `onSuggestionSelect` | `Function` | - | دالة اختيار الاقتراح |
| `placeholder` | `String` | - | نص placeholder |
| `autoFocus` | `Boolean` | `false` | تركيز تلقائي |
| `type` | `String` | `'jobs'` | نوع البحث: 'jobs' أو 'courses' |
| `minChars` | `Number` | `3` | الحد الأدنى للأحرف |

---

### 2. FilterPanel Component
لوحة فلاتر جانبية شاملة

**الملفات**:
- `FilterPanel.jsx` - المكون الرئيسي
- `FilterPanel.css` - التنسيقات

**الميزات**:
- ✅ جميع أنواع الفلاتر (راتب، موقع، نوع العمل، خبرة، مهارات، تاريخ، حجم الشركة)
- ✅ منطق AND/OR للمهارات
- ✅ بحث في المهارات مع dropdown
- ✅ عداد النتائج
- ✅ زر مسح الفلاتر
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ دعم RTL/LTR
- ✅ دعم متعدد اللغات

**الاستخدام**:
```jsx
import { FilterPanel } from '../components/Search';

<FilterPanel
  filters={filters}
  onFilterChange={(newFilters) => setFilters(newFilters)}
  onClearFilters={() => setFilters({})}
  resultCount={150}
  availableFilters={{
    skills: ['JavaScript', 'React', 'Node.js', ...]
  }}
  type="jobs"
/>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `Object` | - | الفلاتر الحالية (required) |
| `onFilterChange` | `Function` | - | دالة تغيير الفلاتر (required) |
| `onClearFilters` | `Function` | - | دالة مسح الفلاتر (required) |
| `resultCount` | `Number` | - | عدد النتائج |
| `availableFilters` | `Object` | `{}` | الفلاتر المتاحة |
| `type` | `String` | `'jobs'` | نوع الفلترة: 'jobs' أو 'courses' |

**بنية الفلاتر**:
```javascript
{
  salaryMin: 5000,
  salaryMax: 15000,
  location: 'Riyadh',
  workType: ['Full-time', 'Remote'],
  experienceLevel: ['Mid', 'Senior'],
  skills: ['JavaScript', 'React'],
  skillsLogic: 'OR', // 'AND' or 'OR'
  datePosted: 'week', // 'today', 'week', 'month', 'all'
  companySize: ['Medium', 'Large']
}
```

---

### 3. ResultsList Component
عرض نتائج البحث مع نسب المطابقة

**الملفات**:
- `ResultsList.jsx` - المكون الرئيسي
- `ResultsList.css` - التنسيقات

**الميزات**:
- ✅ عرض نسبة المطابقة (0-100%)
- ✅ شارات ملونة حسب النسبة (ممتاز، جيد، مقبول، ضعيف)
- ✅ عرض أسباب التوصية (3-5 أسباب)
- ✅ وضعين للعرض: قائمة (list) أو شبكة (grid)
- ✅ Animations سلسة (Framer Motion)
- ✅ Empty state
- ✅ دعم متعدد اللغات
- ✅ Accessibility كامل

**الاستخدام**:
```jsx
import { ResultsList } from '../components/Search';

<ResultsList
  results={results}
  loading={false}
  onJobClick={(job) => navigate(`/jobs/${job._id}`)}
  showMatchScore={true}
  viewMode="list"
/>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `results` | `Array` | `[]` | قائمة النتائج |
| `loading` | `Boolean` | `false` | حالة التحميل |
| `onJobClick` | `Function` | - | دالة النقر على وظيفة |
| `showMatchScore` | `Boolean` | `true` | عرض نسبة المطابقة |
| `viewMode` | `String` | `'list'` | وضع العرض: 'list' أو 'grid' |

**بنية النتائج**:
```javascript
[
  {
    job: {
      _id: '1',
      title: 'Senior Frontend Developer',
      company: 'Tech Corp',
      location: 'Riyadh',
      salary: { min: 15000, max: 25000, currency: 'SAR' },
      description: '...'
    },
    matchScore: {
      percentage: 92,
      overall: 0.92
    },
    reasons: [
      {
        type: 'skills',
        message: 'لديك 8 من 10 مهارات مطلوبة',
        strength: 'high'
      }
    ]
  }
]
```

---

### 4. AlertsManager Component
إدارة التنبيهات للبحث المحفوظ

**الملفات**:
- `AlertsManager.jsx` - المكون الرئيسي
- `AlertsManager.css` - التنسيقات

**الميزات**:
- ✅ تفعيل/تعطيل التنبيهات (Toggle switch)
- ✅ اختيار التكرار (فوري، يومي، أسبوعي)
- ✅ اختيار طريقة الإشعار (Push, Email, Both)
- ✅ حذف التنبيه
- ✅ حفظ التنبيه
- ✅ دعم متعدد اللغات
- ✅ Responsive design

**الاستخدام**:
```jsx
import { AlertsManager } from '../components/Search';

<AlertsManager
  savedSearchId="search123"
  onClose={() => setShowAlerts(false)}
/>
```

**Props**:
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `savedSearchId` | `String` | - | معرف البحث المحفوظ (required) |
| `onClose` | `Function` | - | دالة الإغلاق |

---

## 🎨 التصميم والألوان

### الألوان الرسمية (من project standards)
- **Primary (كحلي)**: #304B60
- **Secondary (بيج)**: #E3DAD1
- **Accent (نحاسي)**: #D48161
- **إطارات الحقول**: #D4816180 (نحاسي باهت - 50% شفافية)

### الخطوط
- **العربية**: Amiri, Cairo, serif
- **الإنجليزية**: Cormorant Garamond, serif
- **الفرنسية**: EB Garamond, serif

### Breakpoints
```css
Mobile:  < 640px
Tablet:  640px - 1023px
Desktop: >= 1024px
```

---

## 🔌 التكامل مع Backend

### API Endpoints

**1. Autocomplete**:
```javascript
GET /api/search/autocomplete?q=developer&type=jobs&limit=10
```

**2. Search**:
```javascript
GET /api/search/jobs?q=developer&location=Riyadh&salaryMin=5000&...
```

**3. Saved Searches**:
```javascript
GET    /api/search/saved
POST   /api/search/saved
PUT    /api/search/saved/:id
DELETE /api/search/saved/:id
```

**4. Alerts**:
```javascript
GET    /api/search/alerts?savedSearchId=123
POST   /api/search/alerts
PUT    /api/search/alerts/:id
DELETE /api/search/alerts/:id
```

---

## 📱 Responsive Design

### Mobile (< 640px)
- SearchBar: عرض كامل، font-size 16px
- FilterPanel: Bottom sheet (80vh)
- ResultsList: 1 column
- AlertsManager: عرض كامل

### Tablet (640px - 1023px)
- SearchBar: عرض كامل
- FilterPanel: Sidebar منزلق (260px)
- ResultsList: 1 column
- AlertsManager: عرض متوسط

### Desktop (>= 1024px)
- SearchBar: عرض أفقي
- FilterPanel: Sidebar ثابت (280px)
- ResultsList: 2 columns
- AlertsManager: عرض كامل

---

## ♿ Accessibility

### ARIA Labels
- جميع المكونات تحتوي على ARIA labels
- `aria-label`, `aria-controls`, `aria-expanded`
- `role="listbox"`, `role="option"`

### Keyboard Navigation
- Tab navigation
- Arrow keys للتنقل في الاقتراحات
- Enter للاختيار
- Escape للإغلاق

### Screen Reader Support
- جميع النصوص قابلة للقراءة
- Focus indicators واضحة
- Semantic HTML

### High Contrast Mode
- دعم كامل لـ `prefers-contrast: high`
- حدود واضحة للعناصر

### Reduced Motion
- دعم كامل لـ `prefers-reduced-motion: reduce`
- إيقاف جميع الرسوم المتحركة

---

## 🌍 دعم متعدد اللغات

### اللغات المدعومة
- العربية (ar) - RTL
- الإنجليزية (en) - LTR
- الفرنسية (fr) - LTR

### الترجمات
جميع المكونات تحتوي على ترجمات مدمجة:
```javascript
const translations = {
  ar: { /* ... */ },
  en: { /* ... */ },
  fr: { /* ... */ }
};
```

---

## 🎭 Dark Mode Support

جميع المكونات تدعم الوضع الداكن:
```css
[data-theme="dark"] .component {
  background: var(--bg-secondary, #1f2937);
  color: var(--text-primary, #f9fafb);
}
```

---

## 🧪 الاختبار

### Unit Tests
```bash
npm test -- SearchBar.test.jsx
npm test -- FilterPanel.test.jsx
npm test -- ResultsList.test.jsx
npm test -- AlertsManager.test.jsx
```

### Integration Tests
```bash
npm test -- search-integration.test.jsx
```

### E2E Tests
```bash
npm run test:e2e -- search-flow.spec.js
```

---

## 📊 الأداء

### Metrics
- ⚡ First Contentful Paint: < 1.8s
- ⚡ Time to Interactive: < 3.8s
- ⚡ Cumulative Layout Shift: < 0.1
- ⚡ Search Response Time: < 500ms

### Optimizations
- ✅ Debouncing للبحث (300ms)
- ✅ Lazy loading للمكونات
- ✅ Memoization للنتائج
- ✅ Code splitting
- ✅ Image optimization

---

## 🔒 الأمان

### Input Validation
- جميع المدخلات يتم التحقق منها
- Sanitization للنصوص
- XSS protection

### Authentication
- جميع API calls تتطلب token
- Token يُخزن في localStorage
- Auto-refresh للـ token

---

## 📚 أمثلة الاستخدام

### مثال 1: صفحة بحث كاملة
```jsx
import React, { useState } from 'react';
import { SearchBar, FilterPanel, ResultsList } from '../components/Search';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);
    setLoading(true);
    
    const params = new URLSearchParams({
      q: searchQuery,
      ...filters
    });
    
    const response = await fetch(`/api/search/jobs?${params}`);
    const data = await response.json();
    
    setResults(data.data.results);
    setLoading(false);
  };

  return (
    <div className="search-page">
      <SearchBar
        onSearch={handleSearch}
        type="jobs"
      />
      
      <div className="search-content">
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={() => setFilters({})}
          resultCount={results.length}
        />
        
        <ResultsList
          results={results}
          loading={loading}
          onJobClick={(job) => navigate(`/jobs/${job._id}`)}
        />
      </div>
    </div>
  );
}
```

### مثال 2: مع Saved Searches
```jsx
import { SavedSearchesPanel } from '../components/SavedSearchesPanel';
import { AlertsManager } from '../components/Search';

function SavedSearchesPage() {
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <div>
      <SavedSearchesPanel />
      
      {showAlerts && (
        <AlertsManager
          savedSearchId={selectedSearch}
          onClose={() => setShowAlerts(false)}
        />
      )}
    </div>
  );
}
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الاقتراحات لا تظهر
**الحل**: تحقق من:
- الحد الأدنى للأحرف (minChars = 3)
- اتصال API
- CORS headers

### المشكلة: الفلاتر لا تعمل
**الحل**: تحقق من:
- بنية الفلاتر صحيحة
- onFilterChange يُستدعى
- Backend يستقبل الفلاتر

### المشكلة: نسب المطابقة خاطئة
**الحل**: تحقق من:
- Backend يرسل matchScore
- بنية matchScore صحيحة
- showMatchScore = true

---

## 📝 الملاحظات المهمة

1. **Font Size 16px**: مهم جداً لمنع zoom في iOS
2. **إطارات الحقول**: يجب أن تكون #D4816180 دائماً (من project standards)
3. **RTL Support**: جميع المكونات تدعم RTL/LTR
4. **Debouncing**: 300ms للبحث لتحسين الأداء
5. **Accessibility**: جميع المكونات تدعم keyboard navigation

---

## 🔗 الملفات ذات الصلة

- **Design Document**: `.kiro/specs/advanced-search-filter/design.md`
- **Requirements Document**: `.kiro/specs/advanced-search-filter/requirements.md`
- **Tasks Document**: `.kiro/specs/advanced-search-filter/tasks.md`
- **Backend Services**: `backend/src/services/`
- **Backend Tests**: `backend/tests/`

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح issue في GitHub.

---

**تاريخ الإنشاء**: 2026-03-04  
**آخر تحديث**: 2026-03-04  
**الحالة**: ✅ مكتمل ومفعّل  
**المطور**: Eng.AlaaUddien
