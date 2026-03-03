# 🌍 Translations System - دليل الاستخدام

## 📋 نظرة عامة

نظام ترجمة مركزي لدعم العربية والإنجليزية في جميع APIs.

---

## ⚡ الاستخدام السريع

### 1. الاستيراد

```javascript
const { t, detectLanguage } = require('../utils/translations');
```

### 2. في Controller

```javascript
async myController(req, res) {
  const lang = detectLanguage(req);
  
  res.json({
    success: true,
    message: t('recommendations.generated', lang)
  });
}
```

### 3. مع معاملات

```javascript
const count = 5;
const message = t('candidates.filtered', lang, { count });
// ar: 'تم العثور على 5 مرشح مطابق'
// en: 'Found 5 matching candidates'
```

---

## 📚 الدوال المتاحة

### `t(key, lang, params)`

الحصول على ترجمة واحدة.

**المعاملات**:
- `key` (string): مفتاح الترجمة (مثل: 'user.notFound')
- `lang` (string): اللغة ('ar' أو 'en')
- `params` (object): معاملات للاستبدال (اختياري)

**مثال**:
```javascript
t('user.notFound', 'ar') // => 'المستخدم غير موجود'
t('user.notFound', 'en') // => 'User not found'
t('candidates.filtered', 'ar', { count: 5 }) // => 'تم العثور على 5 مرشح مطابق'
```

### `tBoth(key, params)`

الحصول على كلا اللغتين.

**المعاملات**:
- `key` (string): مفتاح الترجمة
- `params` (object): معاملات للاستبدال (اختياري)

**مثال**:
```javascript
tBoth('user.notFound')
// => { ar: 'المستخدم غير موجود', en: 'User not found' }
```

### `detectLanguage(req)`

كشف اللغة من request.

**المعاملات**:
- `req` (object): Express request object

**مثال**:
```javascript
const lang = detectLanguage(req); // => 'ar' أو 'en'
```

**مصادر الكشف** (بالترتيب):
1. Query parameter: `?lang=en`
2. Header: `Accept-Language: en-US`
3. Body: `{ language: 'en' }`
4. افتراضي: `'ar'`

---

## 📖 الترجمات المتاحة

### الفئات (16)

1. **general** - رسائل عامة
   - `success`, `error`, `notFound`, `invalidRequest`

2. **user** - رسائل المستخدم
   - `notFound`, `profileIncomplete`

3. **job** - رسائل الوظائف
   - `notFound`, `noJobsAvailable`

4. **recommendations** - رسائل التوصيات
   - `generated`, `error`, `noRecommendations`, `saved`, `newGenerated`, `errorSaved`

5. **match** - رسائل التطابق
   - `calculated`, `error`

6. **profile** - رسائل تحليل الملف الشخصي
   - `analyzed`, `error`

7. **feedback** - رسائل التفاعل
   - `recorded`, `error`

8. **skillGaps** - رسائل فجوات المهارات
   - `analyzed`, `error`, `noTargetJobs`

9. **courses** - رسائل توصيات الدورات
   - `generated`, `quickGenerated`, `default`, `error`, `noTargetJobs`

10. **candidates** - رسائل فلترة المرشحين
    - `filtered`, `noMatches`, `error`, `missingCriteria`

11. **notifications** - رسائل الإشعارات
    - `sent`, `noMatches`, `noActiveUsers`, `error`, `missingJobId`, `candidateMatch`, `missingIds`, `updateSent`, `invalidUpdateType`, `missingUpdateType`

12. **accuracy** - رسائل الدقة
    - `retrieved`, `systemRetrieved`, `improvementTracked`, `error`, `systemError`, `improvementError`

13. **profileCompleteness** - مستويات اكتمال الملف
    - `excellent`, `good`, `average`, `poor`

14. **strengths** - أنواع نقاط القوة
    - `skills`, `experience`, `education`

15. **improvements** - مجالات التحسين
    - `skills`, `experience`

16. **profileSuggestions** - اقتراحات الملف الشخصي
    - `addSkills`, `addExperience`, `addEducation`, `updateBio`

---

## 🧪 الاختبار

### تشغيل الاختبارات

```bash
cd backend
npm test -- translations.test.js
```

### اختبار يدوي

```bash
node src/utils/translations.js
```

---

## 💡 أمثلة عملية

### مثال 1: رسالة نجاح بسيطة

```javascript
const lang = detectLanguage(req);

res.json({
  success: true,
  message: t('recommendations.generated', lang)
});

// ar: { success: true, message: 'تم توليد التوصيات بنجاح' }
// en: { success: true, message: 'Recommendations generated successfully' }
```

### مثال 2: رسالة خطأ

```javascript
const lang = detectLanguage(req);

res.status(404).json({
  success: false,
  message: t('user.notFound', lang)
});

// ar: { success: false, message: 'المستخدم غير موجود' }
// en: { success: false, message: 'User not found' }
```

### مثال 3: رسالة مع معاملات

```javascript
const lang = detectLanguage(req);
const count = candidates.length;

res.json({
  success: true,
  message: t('candidates.filtered', lang, { count }),
  candidates
});

// ar: { success: true, message: 'تم العثور على 5 مرشح مطابق', ... }
// en: { success: true, message: 'Found 5 matching candidates', ... }
```

### مثال 4: رسالة مع معاملات متعددة

```javascript
const lang = detectLanguage(req);

const message = t('improvements.experience', lang, {
  avg: 3.5,
  current: 2
});

// ar: 'متوسط الخبرة المطلوبة 3.5 سنوات، لديك 2'
// en: 'Average required experience is 3.5 years, you have 2'
```

---

## 🔧 إضافة ترجمات جديدة

### 1. افتح `translations.js`

### 2. أضف في الفئة المناسبة

```javascript
const translations = {
  myCategory: {
    myKey: {
      ar: 'النص العربي',
      en: 'English text'
    }
  }
};
```

### 3. استخدم الترجمة الجديدة

```javascript
t('myCategory.myKey', lang)
```

---

## ✅ أفضل الممارسات

### ✅ افعل
- استخدم `t()` لجميع الرسائل
- اكشف اللغة في بداية كل endpoint
- أضف معاملات للنصوص الديناميكية
- اختبر كلا اللغتين

### ❌ لا تفعل
- لا تكتب رسائل مباشرة في الكود
- لا تنسى كشف اللغة
- لا تتخطى المعاملات الديناميكية
- لا تستخدم مفاتيح غير موجودة

---

## 🔗 روابط مفيدة

- 📄 [التوثيق الكامل](../../../docs/AI_RECOMMENDATIONS_LANGUAGE_SUPPORT.md)
- 📄 [دليل البدء السريع](../../../docs/AI_RECOMMENDATIONS_LANGUAGE_SUPPORT_QUICK_START.md)
- 📄 [ملخص الإنجاز](../../../docs/AI_RECOMMENDATIONS_LANGUAGE_SUPPORT_SUMMARY.md)
- 📄 [الاختبارات](../../tests/translations.test.js)

---

**تاريخ الإنشاء**: 2026-02-28  
**الحالة**: ✅ جاهز للاستخدام
