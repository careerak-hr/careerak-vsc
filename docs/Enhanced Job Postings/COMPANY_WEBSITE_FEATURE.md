# ميزة موقع الشركة الإلكتروني - Company Website Feature

## 📋 معلومات الميزة
- **التاريخ**: 2026-03-06
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 6.9 (موقع الشركة الإلكتروني)
- **المهمة**: Task 9.2 - Frontend Company Card

---

## 🎯 الهدف

إضافة رابط موقع الشركة الإلكتروني في بطاقة معلومات الشركة (CompanyCard) لتمكين الباحثين عن عمل من زيارة موقع الشركة مباشرة.

---

## ✅ ما تم تنفيذه

### 1. Backend (قاعدة البيانات)
- ✅ حقل `website` موجود في نموذج CompanyInfo
- ✅ يدعم قيم null (اختياري)
- ✅ يقوم بـ trim للرابط تلقائياً
- ✅ يُرجع في API response

### 2. Frontend (واجهة المستخدم)
- ✅ زر "الموقع الإلكتروني" في CompanyCard
- ✅ يفتح في تبويب جديد (target="_blank")
- ✅ يحتوي على rel="noopener noreferrer" للأمان
- ✅ يظهر فقط إذا كان الموقع موجوداً
- ✅ تصميم متجاوب (Desktop, Tablet, Mobile)
- ✅ دعم RTL/LTR
- ✅ دعم Dark Mode

### 3. الاختبارات
- ✅ 10 اختبارات شاملة (كلها نجحت)
- ✅ اختبارات النموذج (Model)
- ✅ اختبارات الخدمة (Service)
- ✅ اختبارات التكامل (Integration)

---

## 📁 الملفات المعنية

### Backend
```
backend/
├── src/
│   ├── models/
│   │   └── CompanyInfo.js              # حقل website (السطور 76-80)
│   ├── services/
│   │   └── companyInfoService.js       # getCompanyInfo, updateCompanyInfo
│   └── controllers/
│       └── companyInfoController.js    # API endpoints
└── tests/
    └── companyWebsite.test.js          # 10 اختبارات ✅
```

### Frontend
```
frontend/src/
├── components/
│   └── CompanyCard/
│       ├── CompanyCard.jsx             # المكون الرئيسي (السطور 233-241)
│       └── CompanyCard.css             # التنسيقات
└── examples/
    └── CompanyCardExample.jsx          # أمثلة الاستخدام
```

---

## 🔧 كيف يعمل

### 1. في قاعدة البيانات (CompanyInfo Model)
```javascript
{
  companyId: ObjectId,
  name: "شركة مثال",
  website: "https://example.com",  // ← الحقل الجديد
  logo: "...",
  description: "...",
  // ... باقي الحقول
}
```

### 2. في API Response
```json
{
  "success": true,
  "data": {
    "companyId": "...",
    "name": "شركة مثال",
    "website": "https://example.com",
    "logo": "...",
    "description": "...",
    // ... باقي البيانات
  }
}
```

### 3. في واجهة المستخدم (CompanyCard)
```jsx
{companyInfo.website && (
  <a 
    href={companyInfo.website}
    target="_blank"
    rel="noopener noreferrer"
    className="btn-outline"
  >
    {t.website}
  </a>
)}
```

---

## 🎨 التصميم

### الزر
- **النوع**: btn-outline (إطار فقط)
- **اللون**: #304B60 (كحلي)
- **Hover**: يتحول إلى خلفية كحلي مع نص أبيض
- **الموقع**: بجانب زر "وظائف أخرى"

### التنسيقات
```css
.btn-outline {
  background: transparent;
  color: #304B60;
  border: 2px solid #304B60;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background: #304B60;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(48, 75, 96, 0.2);
}
```

---

## 🌍 دعم اللغات

### العربية
```javascript
website: 'الموقع الإلكتروني'
```

### الإنجليزية
```javascript
website: 'Website'
```

### الفرنسية
```javascript
website: 'Site Web'
```

---

## 📱 التصميم المتجاوب

### Desktop (> 768px)
- الزر بجانب زر "وظائف أخرى"
- عرض مرن (flex: 1)
- حد أدنى للعرض: 140px

### Tablet & Mobile (< 768px)
- الأزرار تحت بعضها (flex-direction: column)
- عرض كامل (width: 100%)
- لا حد أدنى للعرض

---

## 🔒 الأمان

### 1. target="_blank"
- يفتح الرابط في تبويب جديد
- لا يؤثر على الصفحة الحالية

### 2. rel="noopener noreferrer"
- **noopener**: يمنع الصفحة الجديدة من الوصول إلى window.opener
- **noreferrer**: لا يرسل معلومات المُحيل (referrer)
- **الفائدة**: حماية من هجمات Tabnabbing

### 3. Validation
- الرابط يُحفظ كما هو (لا validation في Backend)
- يمكن إضافة validation لاحقاً إذا لزم الأمر

---

## 🧪 الاختبارات

### نتائج الاختبارات
```
✓ should save company with website
✓ should allow null website
✓ should trim website URL
✓ should save company without website field
✓ should include website field in response
✓ should return null website if not set
✓ should update company website
✓ should allow removing website (set to null)
✓ should update website along with other fields
✓ should handle complete company website lifecycle

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

### تشغيل الاختبارات
```bash
cd backend
npm test -- companyWebsite.test.js
```

---

## 📊 الاستخدام

### مثال 1: عرض بطاقة الشركة
```jsx
import CompanyCard from '../components/CompanyCard/CompanyCard';

function JobDetailPage({ job }) {
  return (
    <div>
      <h1>{job.title}</h1>
      
      {/* بطاقة معلومات الشركة */}
      <CompanyCard 
        companyId={job.company._id} 
        jobId={job._id} 
      />
    </div>
  );
}
```

### مثال 2: تحديث موقع الشركة
```javascript
// في صفحة إعدادات الشركة
const updateCompanyWebsite = async (website) => {
  const response = await fetch(
    `${API_URL}/companies/${companyId}/info`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ website })
    }
  );
  
  const data = await response.json();
  console.log('Updated:', data.data.website);
};
```

---

## 🎯 الفوائد

### للباحثين عن عمل
- ✅ معرفة المزيد عن الشركة قبل التقديم
- ✅ زيارة موقع الشركة مباشرة
- ✅ التحقق من مصداقية الشركة
- ✅ الاطلاع على منتجات/خدمات الشركة

### للشركات
- ✅ عرض موقعهم الإلكتروني للمرشحين
- ✅ زيادة الزيارات لموقعهم
- ✅ تحسين صورة الشركة
- ✅ جذب مرشحين أفضل

---

## 📈 التحسينات المستقبلية (اختياري)

### 1. Validation
- التحقق من صحة الرابط (URL validation)
- التحقق من أن الموقع يعمل (ping check)
- عرض تحذير إذا كان الرابط معطل

### 2. Analytics
- تتبع عدد النقرات على رابط الموقع
- معرفة أكثر الشركات زيارة
- تحليل سلوك المستخدمين

### 3. Preview
- عرض معاينة للموقع (screenshot)
- عرض معلومات إضافية (Open Graph)
- عرض أيقونة الموقع (favicon)

---

## ✅ معايير القبول

- [x] حقل website موجود في CompanyInfo model
- [x] API يُرجع حقل website
- [x] زر "الموقع الإلكتروني" يظهر في CompanyCard
- [x] الزر يفتح الموقع في تبويب جديد
- [x] الزر يظهر فقط إذا كان الموقع موجوداً
- [x] التصميم متجاوب على جميع الأجهزة
- [x] دعم RTL/LTR
- [x] دعم Dark Mode
- [x] دعم 3 لغات (ar, en, fr)
- [x] 10 اختبارات نجحت

---

## 📝 ملاحظات مهمة

1. **الحقل اختياري**: الشركات غير ملزمة بإضافة موقعهم
2. **لا validation**: يُحفظ الرابط كما هو (يمكن إضافة validation لاحقاً)
3. **الأمان**: استخدام rel="noopener noreferrer" للحماية
4. **التصميم**: يتبع معايير المشروع (الألوان، الخطوط، إلخ)

---

**تاريخ الإنشاء**: 2026-03-06  
**آخر تحديث**: 2026-03-06  
**الحالة**: ✅ مكتمل ومفعّل
