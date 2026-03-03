# Advanced Search Responsive Design - README

## 📁 الملف
`advancedSearchResponsive.css`

## 🎯 الغرض
ملف CSS شامل للتصميم المتجاوب لنظام البحث والفلترة المتقدم.

---

## ⚡ الاستخدام السريع

### 1. الاستيراد
```css
/* في index.css أو App.css */
@import './styles/advancedSearchResponsive.css';
```

### 2. استخدام Classes
```jsx
<div className="search-page">
  <div className="search-bar-container">
    <div className="search-bar">
      <input className="search-input" />
      <button className="search-button">بحث</button>
    </div>
  </div>
</div>
```

---

## 📐 Breakpoints

```css
Mobile:  < 640px
Tablet:  640px - 1023px
Desktop: >= 1024px
```

---

## 🎨 Classes الرئيسية

### Search
- `.search-page` - Container رئيسي
- `.search-bar-container` - Container شريط البحث
- `.search-bar` - شريط البحث
- `.search-input` - حقل الإدخال
- `.search-button` - زر البحث
- `.autocomplete-suggestions` - قائمة الاقتراحات

### Filters
- `.filter-panel` - لوحة الفلاتر
- `.filter-toggle-btn` - زر فتح/إغلاق
- `.filter-group` - مجموعة فلاتر
- `.filter-group-title` - عنوان المجموعة
- `.filter-options` - خيارات الفلتر
- `.clear-filters-btn` - زر مسح الفلاتر

### Results
- `.results-container` - Container النتائج
- `.results-header` - رأس النتائج
- `.results-count` - عداد النتائج
- `.results-grid` - Grid النتائج
- `.result-card` - بطاقة نتيجة
- `.match-score` - نسبة المطابقة

### Map
- `.map-view-container` - Container الخريطة
- `.map-controls` - أزرار التحكم
- `.map-info-window` - نافذة المعلومات

### Pagination
- `.pagination` - Container
- `.pagination-btn` - زر
- `.pagination-btn.active` - زر نشط

### Other
- `.saved-searches-panel` - لوحة البحث المحفوظ
- `.saved-search-item` - عنصر بحث محفوظ
- `.view-mode-toggle` - تبديل وضع العرض
- `.skeleton-loader` - Loading state

---

## 📱 السلوك المتجاوب

### Filter Panel

**Desktop (>= 1024px)**:
- Sidebar ثابت على الجانب
- عرض 280px
- Sticky positioning

**Tablet (640px - 1023px)**:
- Sidebar منزلق من الجانب
- يظهر/يختفي بزر toggle
- عرض 260px

**Mobile (< 640px)**:
- Bottom Sheet من الأسفل
- يظهر/يختفي بزر عائم (FAB)
- max-height: 80vh
- Handle للسحب

### Results Grid

**Desktop**: 2 columns  
**Tablet**: 1 column  
**Mobile**: 1 column

### Map View

**Desktop**: 600px height  
**Tablet**: 500px height  
**Mobile**: 400px height

---

## ♿ Accessibility

- ✅ Focus visible styles
- ✅ Reduced motion support
- ✅ High contrast support
- ✅ Touch targets >= 44px
- ✅ Font size >= 16px (inputs)

---

## 🌍 RTL Support

جميع المكونات تدعم RTL تلقائياً:
```css
[dir="rtl"] .filter-panel {
  right: auto;
  left: 0;
}
```

---

## 🌙 Dark Mode

يدعم Dark Mode تلقائياً:
```css
@media (prefers-color-scheme: dark) {
  .result-card {
    background: #1a1a1a;
  }
}
```

---

## 📱 iOS Support

- ✅ Safe area insets (notch)
- ✅ No auto-zoom (16px font)
- ✅ Touch-friendly

---

## 🖨️ Print Support

يخفي العناصر غير الضرورية عند الطباعة:
```css
@media print {
  .filter-panel,
  .pagination {
    display: none !important;
  }
}
```

---

## 🎨 التخصيص

### الألوان
```css
/* يمكن تغييرها في ملف variables */
--primary: #304B60;
--secondary: #E3DAD1;
--accent: #D48161;
```

### Breakpoints
```css
/* يمكن تعديلها حسب الحاجة */
@media (max-width: 639px) { }
@media (min-width: 640px) and (max-width: 1023px) { }
@media (min-width: 1024px) { }
```

---

## 🐛 استكشاف الأخطاء

### الفلاتر لا تظهر
```jsx
// تأكد من إضافة class "open"
<div className={`filter-panel ${isOpen ? 'open' : ''}`}>
```

### Zoom تلقائي في iOS
```css
/* تأكد من font-size: 16px */
.search-input {
  font-size: 16px;
}
```

### التمرير الأفقي
```css
.search-page {
  max-width: 100vw;
  overflow-x: hidden;
}
```

---

## 📚 التوثيق الكامل

- 📄 [التوثيق الشامل](../../../docs/Advanced Search/RESPONSIVE_DESIGN_IMPLEMENTATION.md)
- 📄 [دليل البدء السريع](../../../docs/Advanced Search/RESPONSIVE_DESIGN_QUICK_START.md)
- 📄 [ملخص التنفيذ](../../../docs/Advanced Search/RESPONSIVE_DESIGN_SUMMARY.md)

---

## ✅ Checklist

- [ ] استوردت الملف في index.css
- [ ] استخدمت Classes الصحيحة
- [ ] أضفت Toggle للفلاتر
- [ ] اختبرت على Mobile
- [ ] اختبرت على Tablet
- [ ] اختبرت على Desktop
- [ ] Touch targets >= 44px
- [ ] Font size >= 16px

---

**الحالة**: ✅ جاهز للاستخدام  
**التاريخ**: 2026-03-03  
**الإصدار**: 1.0.0
