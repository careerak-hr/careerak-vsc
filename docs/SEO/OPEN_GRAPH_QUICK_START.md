# Open Graph Tags - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. استيراد المكونات (30 ثانية)

```jsx
import SEOHead from '../components/SEO/SEOHead';
import { generateJobOGImage } from '../utils/ogImageGenerator';
```

### 2. إضافة Open Graph Tags (2 دقيقة)

```jsx
const JobDetailPage = ({ job }) => {
  return (
    <>
      <SEOHead
        title={`${job.title} at ${job.company.name} | Careerak`}
        description={`${job.title} in ${job.location}. Apply now!`}
        keywords={`${job.title}, ${job.company.name}, jobs`}
        image={generateJobOGImage(job)}
        url={`https://careerak.com/jobs/${job.id}`}
        type="article"
      />
      
      {/* محتوى الصفحة */}
      <h1>{job.title}</h1>
    </>
  );
};
```

### 3. اختبار (2 دقيقة)

1. افتح: https://developers.facebook.com/tools/debug/
2. الصق رابط الصفحة
3. اضغط "Debug"
4. تحقق من المعاينة ✅

---

## 📋 قائمة التحقق السريعة

- [ ] استيراد `SEOHead`
- [ ] إضافة `title` (50-60 حرف)
- [ ] إضافة `description` (150-160 حرف)
- [ ] إضافة `image` (1200x630px)
- [ ] إضافة `url` (canonical)
- [ ] اختبار على Facebook Debugger

---

## 🎯 أمثلة سريعة

### صفحة وظيفة

```jsx
<SEOHead
  title="Frontend Developer at Tech Corp | Careerak"
  description="Join Tech Corp as Frontend Developer in Riyadh. Apply now!"
  image={generateJobOGImage(job)}
  url={`https://careerak.com/jobs/${job.id}`}
  type="article"
/>
```

### صفحة دورة

```jsx
<SEOHead
  title="React Masterclass - Online Course | Careerak"
  description="Learn React from scratch. Enroll now!"
  image={generateCourseOGImage(course)}
  url={`https://careerak.com/courses/${course.id}`}
  type="article"
/>
```

### صفحة شركة

```jsx
<SEOHead
  title="Tech Corp - Company Profile | Careerak"
  description="Tech Corp - Leading technology company. View jobs!"
  image={generateCompanyOGImage(company)}
  url={`https://careerak.com/companies/${company.id}`}
  type="profile"
/>
```

---

## 🔧 دوال مساعدة

### توليد صورة OG

```javascript
import { generateJobOGImage } from '../utils/ogImageGenerator';

const ogImage = generateJobOGImage(job);
// يختار تلقائياً: شعار الشركة > صورة الوظيفة > شعار Careerak
```

### تحسين الصورة

```javascript
import { optimizeOGImage } from '../utils/ogImageGenerator';

const optimizedImage = optimizeOGImage(imageUrl);
// يحسّن تلقائياً لـ Cloudinary (1200x630px)
```

---

## 🧪 اختبار سريع

```bash
# تشغيل الاختبارات
npm test -- ogImageGenerator.test.js

# النتيجة المتوقعة
✅ 17/17 tests passed
```

---

## 📊 النتائج المتوقعة

- 📈 +30-50% معدل النقر (CTR)
- 📈 +40-60% المشاركات
- 📈 +50-70% الزيارات من وسائل التواصل

---

## 🆘 مشاكل شائعة

### الصورة لا تظهر؟
```javascript
// ✅ استخدم رابط absolute
image="https://careerak.com/logo.png"

// ❌ لا تستخدم رابط relative
image="/logo.png"
```

### العنوان مقطوع؟
```javascript
// ✅ 50-60 حرف
title="Frontend Developer at Tech Corp | Careerak"

// ❌ طويل جداً
title="Senior Frontend Developer with 5+ years experience..."
```

---

## 📚 المزيد من المعلومات

- 📄 [التوثيق الكامل](./OPEN_GRAPH_IMPLEMENTATION.md)
- 📄 [دليل الاختبار](./OPEN_GRAPH_TESTING_GUIDE.md)
- 📄 [أمثلة متقدمة](../frontend/src/examples/OpenGraphExample.jsx)

---

**وقت التطبيق**: 5 دقائق ⚡  
**الصعوبة**: سهل 🟢  
**الحالة**: ✅ جاهز للاستخدام
