# دليل نظام الخطوط في تطبيق كاريرك
# Careerak Font System Guide

## نظرة عامة / Overview

تم تطوير نظام خطوط شامل وقوي لضمان تطبيق الخطوط المناسبة حسب اللغة في جميع أنحاء التطبيق.

A comprehensive and robust font system has been developed to ensure appropriate fonts are applied based on language throughout the entire application.

## الخطوط المستخدمة / Fonts Used

### العربية / Arabic
- **الخط الأساسي**: Amiri
- **الخط الاحتياطي**: Cairo
- **النوع**: serif

### الإنجليزية / English
- **الخط الأساسي**: Cormorant Garamond
- **النوع**: serif

### الفرنسية / French
- **الخط الأساسي**: EB Garamond
- **النوع**: serif

## مكونات النظام / System Components

### 1. FontProvider
مكون رئيسي يطبق الخطوط على مستوى التطبيق بالكامل.

### 2. GlobalFontEnforcer
مكون قوي يضمن تطبيق الخطوط على جميع العناصر الجديدة والموجودة.

### 3. LanguageAwareText
مكون ذكي لعرض النصوص بالخط المناسب حسب اللغة.

### 4. fontUtils.js
مجموعة من الوظائف المساعدة لإدارة الخطوط.

### 5. fontEnforcement.css
ملف CSS قوي لفرض الخطوط على جميع العناصر.

## كيفية الاستخدام / How to Use

### استخدام المكونات الذكية / Using Smart Components

```jsx
import { LanguageAwareText, LanguageAwareHeading, LanguageAwareBody } from '../components';

// للنصوص العادية
<LanguageAwareText>النص هنا</LanguageAwareText>

// للعناوين
<LanguageAwareHeading as="h1">العنوان هنا</LanguageAwareHeading>

// للفقرات
<LanguageAwareBody as="p">الفقرة هنا</LanguageAwareBody>
```

### استخدام الكلاسات / Using Classes

```jsx
// للعربية
<div className="font-arabic">النص العربي</div>

// للإنجليزية
<div className="font-english">English Text</div>

// للفرنسية
<div className="font-french">Texte français</div>
```

### استخدام Tailwind Classes

```jsx
// للعربية
<div className="font-arabic">النص</div>

// للإنجليزية
<div className="font-english">Text</div>

// للفرنسية
<div className="font-french">Texte</div>
```

## الميزات / Features

### ✅ تطبيق تلقائي حسب اللغة
الخطوط تتغير تلقائياً عند تغيير لغة التطبيق.

### ✅ فرض قوي للخطوط
نظام قوي يضمن تطبيق الخطوط على جميع العناصر.

### ✅ مراقبة العناصر الجديدة
تطبيق الخطوط تلقائياً على العناصر المضافة ديناميكياً.

### ✅ دعم شامل للمكتبات
يعمل مع جميع مكتبات CSS والمكونات.

### ✅ أداء محسن
تحميل الخطوط بطريقة محسنة مع font-display: swap.

## استكشاف الأخطاء / Troubleshooting

### إذا لم تظهر الخطوط بشكل صحيح:

1. تأكد من تحميل الخطوط المحلية
2. تحقق من إعدادات اللغة في التطبيق
3. تأكد من تطبيق FontProvider في App.jsx
4. تحقق من وجود GlobalFontEnforcer

### للتحقق من تطبيق الخطوط:

```javascript
// في وحدة تحكم المتصفح
console.log(getComputedStyle(document.body).fontFamily);
```

## الملفات المهمة / Important Files

- `frontend/src/assets/fonts/fonts.css` - تعريف الخطوط
- `frontend/src/components/FontProvider.jsx` - مزود الخطوط
- `frontend/src/components/GlobalFontEnforcer.jsx` - فارض الخطوط
- `frontend/src/utils/fontUtils.js` - وظائف مساعدة
- `frontend/src/styles/fontEnforcement.css` - CSS قوي للفرض
- `frontend/src/index.css` - الأنماط الأساسية

## ملاحظات مهمة / Important Notes

- الخطوط محملة محلياً لضمان الأداء
- يوجد خطوط احتياطية من Google Fonts
- النظام يدعم RTL للعربية
- جميع الخطوط محسنة للويب (woff2)