# 🚀 دعم اللغات - دليل البدء السريع

## 📋 نظرة عامة

دليل سريع لاستخدام نظام الترجمة في AI Recommendations.

---

## ⚡ Backend - 3 خطوات

### 1. استيراد نظام الترجمة

```javascript
const { t, detectLanguage } = require('../utils/translations');
```

### 2. كشف اللغة

```javascript
async myController(req, res) {
  const lang = detectLanguage(req); // 'ar' أو 'en'
  // ...
}
```

### 3. استخدام الترجمات

```javascript
// رسالة بسيطة
res.json({
  success: true,
  message: t('recommendations.generated', lang)
});

// رسالة مع معاملات
res.json({
  success: true,
  message: t('candidates.filtered', lang, { count: 5 })
});
```

---

## ⚡ Frontend - 3 خطوات

### 1. استيراد AppContext

```javascript
import { useApp } from '../context/AppContext';
```

### 2. إنشاء كائن الترجمات

```javascript
const translations = {
  ar: {
    title: 'العنوان',
    subtitle: 'العنوان الفرعي'
  },
  en: {
    title: 'Title',
    subtitle: 'Subtitle'
  },
  fr: {
    title: 'Titre',
    subtitle: 'Sous-titre'
  }
};
```

### 3. استخدام الترجمات

```javascript
function MyComponent() {
  const { language } = useApp();
  const t = translations[language] || translations.ar;
  
  return (
    <div>
      <h1>{t.title}</h1>
      <p>{t.subtitle}</p>
    </div>
  );
}
```

---

## 🧪 الاختبار

### Backend

```bash
# عربي (افتراضي)
curl http://localhost:5000/api/recommendations/jobs

# إنجليزي
curl http://localhost:5000/api/recommendations/jobs?lang=en
```

### Frontend

```javascript
// تغيير اللغة
const { saveLanguage } = useApp();
await saveLanguage('en'); // أو 'ar' أو 'fr'
```

---

## 📚 الترجمات المتاحة

### Backend (100+ رسالة)

```javascript
// مستخدم
t('user.notFound', lang)

// وظائف
t('job.notFound', lang)
t('job.noJobsAvailable', lang)

// توصيات
t('recommendations.generated', lang)
t('recommendations.error', lang)

// مرشحين
t('candidates.filtered', lang, { count: 5 })
t('candidates.noMatches', lang)

// إشعارات
t('notifications.sent', lang, { count: 10 })
```

### Frontend (60+ رسالة)

```javascript
// RecommendationsDashboard
t.title
t.subtitle
t.loading
t.error
t.retry
t.matchScore
t.reasons
t.apply
t.save
t.ignore
t.viewDetails
// ... والمزيد
```

---

## 💡 نصائح سريعة

### ✅ افعل
- استخدم `t()` لجميع الرسائل
- اكشف اللغة في بداية كل endpoint
- أضف fallback للعربية
- اختبر كلا اللغتين

### ❌ لا تفعل
- لا تكتب رسائل مباشرة
- لا تنسى المعاملات الديناميكية
- لا تتخطى كشف اللغة

---

## 🔗 روابط مفيدة

- 📄 [التوثيق الكامل](./AI_RECOMMENDATIONS_LANGUAGE_SUPPORT.md)
- 📄 [ملف الترجمات](../backend/src/utils/translations.js)
- 📄 [مثال Controller](../backend/src/controllers/recommendationController.js)
- 📄 [مثال Component](../frontend/src/components/RecommendationsDashboard.jsx)

---

**تاريخ الإنشاء**: 2026-02-28  
**الحالة**: ✅ جاهز للاستخدام
