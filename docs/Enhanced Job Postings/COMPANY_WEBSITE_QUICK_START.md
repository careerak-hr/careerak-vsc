# دليل البدء السريع - موقع الشركة الإلكتروني

## ⚡ 5 دقائق للبدء

---

## ✅ الميزة جاهزة ومفعّلة!

الميزة موجودة بالفعل وتعمل. هذا الدليل يشرح كيفية استخدامها.

---

## 🎯 ما هي الميزة؟

زر "الموقع الإلكتروني" في بطاقة معلومات الشركة يسمح للباحثين عن عمل بزيارة موقع الشركة مباشرة.

---

## 📍 أين تجدها؟

### في واجهة المستخدم
1. افتح أي وظيفة
2. انتقل إلى قسم "معلومات الشركة"
3. ستجد زر "الموقع الإلكتروني" (إذا كان موجوداً)

### في الكود
```
frontend/src/components/CompanyCard/CompanyCard.jsx
السطور 233-241
```

---

## 🔧 كيف تستخدمها؟

### 1. عرض بطاقة الشركة
```jsx
import CompanyCard from '../components/CompanyCard/CompanyCard';

<CompanyCard 
  companyId={job.company._id} 
  jobId={job._id} 
/>
```

### 2. إضافة موقع للشركة (Backend)
```javascript
// في صفحة إعدادات الشركة
const response = await fetch(
  `${API_URL}/companies/${companyId}/info`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      website: 'https://example.com'
    })
  }
);
```

### 3. جلب معلومات الشركة
```javascript
const response = await fetch(
  `${API_URL}/companies/${companyId}/info`
);

const data = await response.json();
console.log(data.data.website); // https://example.com
```

---

## 🧪 الاختبار

### تشغيل الاختبارات
```bash
cd backend
npm test -- companyWebsite.test.js
```

### النتيجة المتوقعة
```
✓ 10 passed, 10 total
```

---

## 🎨 التخصيص

### تغيير النص
```javascript
// في CompanyCard.jsx
const translations = {
  ar: {
    website: 'الموقع الإلكتروني'  // ← غيّر هنا
  },
  en: {
    website: 'Website'
  },
  fr: {
    website: 'Site Web'
  }
};
```

### تغيير التنسيقات
```css
/* في CompanyCard.css */
.btn-outline {
  background: transparent;
  color: #304B60;
  border: 2px solid #304B60;
  /* غيّر التنسيقات هنا */
}
```

---

## 🐛 استكشاف الأخطاء

### الزر لا يظهر؟
**السبب**: الشركة لم تضف موقعها بعد
**الحل**: أضف موقع الشركة في قاعدة البيانات

### الرابط لا يعمل؟
**السبب**: الرابط غير صحيح
**الحل**: تحقق من أن الرابط يبدأ بـ `https://`

### الزر يظهر بشكل غريب؟
**السبب**: مشكلة في CSS
**الحل**: تحقق من أن `CompanyCard.css` محمّل

---

## 📚 المزيد من المعلومات

- 📄 التوثيق الكامل: `docs/Enhanced Job Postings/COMPANY_WEBSITE_FEATURE.md`
- 📄 الاختبارات: `backend/tests/companyWebsite.test.js`
- 📄 المكون: `frontend/src/components/CompanyCard/CompanyCard.jsx`

---

## ✅ Checklist

- [x] الميزة موجودة ومفعّلة
- [x] 10 اختبارات نجحت
- [x] التصميم متجاوب
- [x] دعم 3 لغات
- [x] دعم Dark Mode
- [x] الأمان (noopener noreferrer)

---

**تاريخ الإنشاء**: 2026-03-06  
**الحالة**: ✅ جاهز للاستخدام
