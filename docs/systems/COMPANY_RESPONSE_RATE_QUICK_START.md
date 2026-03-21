# معدل استجابة الشركة - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. Backend - استخدام الخدمة (دقيقة واحدة)

```javascript
const companyResponseRateService = require('./services/companyResponseRateService');

// حساب معدل الاستجابة
const responseRate = await companyResponseRateService.calculateResponseRate(companyId);

console.log(responseRate);
// {
//   percentage: 85,
//   label: 'fast',
//   averageResponseTime: 36,
//   averageResponseDays: 2,
//   totalApplications: 100,
//   respondedApplications: 85
// }
```

### 2. Frontend - عرض المكون (دقيقة واحدة)

```jsx
import CompanyResponseRate from './components/CompanyResponseRate/CompanyResponseRate';

function CompanyCard({ company }) {
  return (
    <div>
      <h3>{company.name}</h3>
      <CompanyResponseRate responseRate={company.responseRate} />
    </div>
  );
}
```

### 3. API - جلب البيانات (دقيقة واحدة)

```javascript
// جلب معلومات الشركة (يتضمن معدل الاستجابة)
const response = await fetch('/api/companies/123/info');
const data = await response.json();

console.log(data.data.responseRate);
// {
//   percentage: 85,
//   label: 'fast',
//   averageResponseTime: 36,
//   lastUpdated: '2026-03-07T10:00:00.000Z'
// }
```

### 4. الاختبارات - تشغيل (30 ثانية)

```bash
cd backend
npm test -- companyResponseRate.test.js
```

**النتيجة**: ✅ 24/24 اختبارات نجحت

### 5. التحديث الدوري - إعداد (دقيقة واحدة)

```bash
# تشغيل يدوي
node scripts/update-company-response-rates.js

# إعداد cron (شهرياً)
crontab -e
# أضف: 0 2 1 * * cd /path/to/backend && node scripts/update-company-response-rates.js
```

## 📊 معايير التصنيف

| التصنيف | الوقت | النسبة | الأيقونة |
|---------|-------|--------|----------|
| سريع ⚡ | ≤ 48 ساعة | ≥ 70% | 🟢 |
| متوسط ⏱️ | ≤ 7 أيام | ≥ 50% | 🟡 |
| بطيء 🐌 | > 7 أيام | < 50% | 🔴 |

## 🎨 أمثلة سريعة

### عرض بسيط
```jsx
<CompanyResponseRate responseRate={company.responseRate} />
```

### عرض مع تفاصيل
```jsx
<CompanyResponseRate 
  responseRate={company.responseRate} 
  showDetails={true} 
/>
```

### في بطاقة الوظيفة
```jsx
<div className="job-card">
  <h4>{job.title}</h4>
  <p>{job.company.name}</p>
  <CompanyResponseRate responseRate={job.company.responseRate} />
</div>
```

## 🔧 API Endpoints

```http
# جلب معلومات الشركة
GET /api/companies/:id/info

# تحديث معدل الاستجابة
POST /api/companies/:id/update-response-rate

# تحديث جميع المقاييس
POST /api/companies/:id/update-metrics
```

## ✅ قائمة التحقق السريعة

- [x] الخدمة تعمل ✅
- [x] المكون يعرض بشكل صحيح ✅
- [x] API يرجع البيانات ✅
- [x] الاختبارات تنجح (24/24) ✅
- [x] التحديث الدوري مُعد ✅

## 📚 المزيد من المعلومات

- 📄 [التوثيق الشامل](./COMPANY_RESPONSE_RATE_IMPLEMENTATION.md)
- 📄 [أمثلة كاملة](../frontend/src/examples/CompanyResponseRateExample.jsx)
- 📄 [الاختبارات](../backend/tests/companyResponseRate.test.js)

---

**تم إنشاؤه**: 2026-03-07  
**الحالة**: ✅ جاهز للاستخدام
