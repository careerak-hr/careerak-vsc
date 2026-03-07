# ميزة حجم الشركة (Company Size)

## 📋 معلومات الميزة
- **تاريخ الإضافة**: 2026-03-06
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 6.3 (حجم الشركة)

---

## 🎯 نظرة عامة

ميزة حجم الشركة تسمح بتصنيف الشركات إلى ثلاث فئات بناءً على عدد الموظفين:
- **صغيرة (Small)**: أقل من 50 موظف
- **متوسطة (Medium)**: 50-500 موظف
- **كبيرة (Large)**: أكثر من 500 موظف

---

## 🏗️ البنية التقنية

### Backend

#### 1. النموذج (CompanyInfo Model)

```javascript
{
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'small'
  },
  employeeCount: {
    type: Number,
    min: 0,
    default: null
  }
}
```

**الميزات**:
- ✅ حقل `size` مع قيم محددة فقط
- ✅ حقل `employeeCount` اختياري
- ✅ قيمة افتراضية: `small`
- ✅ Index على حقل `size` للاستعلامات السريعة

#### 2. الخدمة (CompanyInfoService)

**دالة تحديد الحجم**:
```javascript
determineCompanySize(employeeCount) {
  if (employeeCount < 50) return 'small';
  if (employeeCount <= 500) return 'medium';
  return 'large';
}
```

**التحديث التلقائي**:
```javascript
async updateCompanyInfo(companyId, updateData) {
  // Auto-determine size if employeeCount is provided
  if (updateData.employeeCount !== undefined) {
    updateData.size = this.determineCompanySize(updateData.employeeCount);
  }
  // ...
}
```

#### 3. API Endpoints

**الحصول على معلومات الشركة**:
```bash
GET /api/companies/:id/info
```

**Response**:
```json
{
  "success": true,
  "data": {
    "companyId": "507f1f77bcf86cd799439011",
    "name": "شركة التقنية المتقدمة",
    "size": "medium",
    "employeeCount": 150,
    "logo": "https://...",
    "rating": { ... },
    "openPositions": 5
  }
}
```

**تحديث معلومات الشركة**:
```bash
PUT /api/companies/:id/info
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeCount": 200
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم تحديث معلومات الشركة بنجاح",
  "data": {
    "size": "medium",  // تم تحديده تلقائياً
    "employeeCount": 200
  }
}
```

---

### Frontend

#### 1. مكون CompanyCard

**الموقع**: `frontend/src/components/CompanyCard/CompanyCard.jsx`

**الترجمات**:
```javascript
const translations = {
  ar: {
    small: 'صغيرة',
    medium_size: 'متوسطة',
    large: 'كبيرة'
  },
  en: {
    small: 'Small',
    medium_size: 'Medium',
    large: 'Large'
  },
  fr: {
    small: 'Petite',
    medium_size: 'Moyenne',
    large: 'Grande'
  }
};
```

**دالة عرض الحجم**:
```javascript
const getSizeLabel = (size) => {
  const labels = {
    small: t.small,
    medium: t.medium_size,
    large: t.large
  };
  return labels[size] || size;
};
```

**العرض في UI**:
```jsx
<div className="company-meta">
  <span className="company-size">
    {getSizeLabel(companyInfo.size)}
  </span>
  {companyInfo.employeeCount && (
    <span className="employee-count">
      {companyInfo.employeeCount} {t.employees}
    </span>
  )}
</div>
```

---

## 📊 أمثلة الاستخدام

### مثال 1: عرض معلومات الشركة

```jsx
import CompanyCard from './components/CompanyCard/CompanyCard';

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

**النتيجة**:
```
┌─────────────────────────────────────┐
│ [Logo] شركة التقنية المتقدمة       │
│        متوسطة • 150 موظف           │
│                                     │
│ ★★★★☆ 4.2 (45 تقييم)              │
│                                     │
│ شركة رائدة في مجال التقنية...      │
│                                     │
│ 5 وظائف مفتوحة | استجابة سريعة     │
│                                     │
│ [وظائف أخرى] [الموقع الإلكتروني]  │
└─────────────────────────────────────┘
```

### مثال 2: تحديث حجم الشركة

```javascript
// Frontend
const updateCompanySize = async (employeeCount) => {
  const response = await fetch(
    `${API_URL}/companies/${companyId}/info`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ employeeCount })
    }
  );
  
  const data = await response.json();
  console.log('New size:', data.data.size);
};

// تحديث عدد الموظفين إلى 600
await updateCompanySize(600);
// النتيجة: size = 'large'
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
cd backend
npm test -- companySize.test.js
```

### نتائج الاختبارات

```
✅ Company Size Determination
  ✓ should classify company with < 50 employees as small
  ✓ should classify company with 50-500 employees as medium
  ✓ should classify company with > 500 employees as large

✅ Company Size in Model
  ✓ should have default size as small
  ✓ should only accept valid size values
  ✓ should reject invalid size values

✅ Auto Size Determination on Update
  ✓ should auto-determine size when employeeCount is provided

✅ Company Size Display
  ✓ should include size in company info response

✅ Size Index
  ✓ should have index on size field for efficient queries

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

---

## 🎨 التصميم

### CSS Classes

```css
.company-size {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.company-size.small {
  background-color: #e3f2fd;
  color: #1976d2;
}

.company-size.medium {
  background-color: #fff3e0;
  color: #f57c00;
}

.company-size.large {
  background-color: #e8f5e9;
  color: #388e3c;
}
```

---

## 📈 الفوائد المتوقعة

1. **للباحثين عن عمل**:
   - 🎯 فهم أفضل لحجم الشركة
   - 📊 اتخاذ قرارات مستنيرة
   - 🔍 فلترة الوظائف حسب حجم الشركة

2. **للشركات**:
   - 📢 عرض احترافي للمعلومات
   - 🏆 جذب المرشحين المناسبين
   - 📊 تحديث تلقائي للحجم

3. **للمنصة**:
   - 📊 إحصائيات أفضل
   - 🔍 بحث وفلترة محسّنة
   - 📈 تجربة مستخدم أفضل

---

## 🔧 التكامل مع الأنظمة الموجودة

### 1. نظام الوظائف
- ✅ عرض حجم الشركة في بطاقة الوظيفة
- ✅ فلترة الوظائف حسب حجم الشركة

### 2. نظام البحث
- ✅ إضافة حجم الشركة كفلتر بحث
- ✅ Index للاستعلامات السريعة

### 3. نظام التوصيات
- ✅ استخدام حجم الشركة في خوارزمية التوصيات
- ✅ تفضيلات المستخدم لحجم الشركة

---

## 🚀 التحسينات المستقبلية

### المرحلة 1 (قصيرة المدى)
- [ ] إضافة فلتر حجم الشركة في صفحة البحث
- [ ] إحصائيات حجم الشركات في لوحة التحكم
- [ ] تفضيلات المستخدم لحجم الشركة

### المرحلة 2 (متوسطة المدى)
- [ ] تحليلات متقدمة حسب حجم الشركة
- [ ] مقارنة الرواتب حسب حجم الشركة
- [ ] توصيات مخصصة بناءً على حجم الشركة

### المرحلة 3 (طويلة المدى)
- [ ] AI لتحديد حجم الشركة من البيانات المتاحة
- [ ] تنبؤ بنمو الشركة
- [ ] تحليل اتجاهات التوظيف حسب حجم الشركة

---

## 📝 ملاحظات مهمة

1. **التحديث التلقائي**:
   - عند تحديث `employeeCount`, يتم تحديد `size` تلقائياً
   - لا حاجة لتحديد `size` يدوياً

2. **القيم الافتراضية**:
   - الحجم الافتراضي: `small`
   - `employeeCount` اختياري (يمكن أن يكون `null`)

3. **الأمان**:
   - فقط صاحب الشركة يمكنه تحديث المعلومات
   - التحقق من الصلاحيات في الـ controller

4. **الأداء**:
   - Index على حقل `size` للاستعلامات السريعة
   - Cache في Frontend لتقليل الطلبات

---

## 🔗 الملفات ذات الصلة

### Backend
- `backend/src/models/CompanyInfo.js` - النموذج
- `backend/src/services/companyInfoService.js` - الخدمة
- `backend/src/controllers/companyInfoController.js` - المعالج
- `backend/tests/companySize.test.js` - الاختبارات

### Frontend
- `frontend/src/components/CompanyCard/CompanyCard.jsx` - المكون
- `frontend/src/components/CompanyCard/CompanyCard.css` - التنسيقات
- `frontend/src/examples/CompanyCardExample.jsx` - أمثلة

---

## ✅ معايير القبول

- [x] حقل `size` في نموذج CompanyInfo
- [x] قيم محددة: small, medium, large
- [x] تحديد تلقائي للحجم بناءً على employeeCount
- [x] عرض الحجم في CompanyCard
- [x] دعم متعدد اللغات (ar, en, fr)
- [x] API endpoints للحصول والتحديث
- [x] اختبارات شاملة (9/9 ✅)
- [x] توثيق كامل

---

**تاريخ الإنشاء**: 2026-03-06  
**آخر تحديث**: 2026-03-06  
**الحالة**: ✅ مكتمل ومفعّل
