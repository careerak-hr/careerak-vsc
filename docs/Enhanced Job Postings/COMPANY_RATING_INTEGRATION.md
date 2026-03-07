# تكامل تقييم الشركة مع صفحة الوظائف

## 📋 معلومات التوثيق
- **التاريخ**: 2026-03-06
- **الحالة**: ✅ مكتمل
- **المتطلبات**: Requirements 6.4 (تقييم الشركة من نظام التقييمات)

---

## 🎯 نظرة عامة

تم دمج نظام التقييمات الموجود مع بطاقة معلومات الشركة (CompanyCard) في صفحة الوظائف. الآن يمكن للباحثين عن عمل رؤية تقييمات الشركة قبل التقديم على الوظيفة.

---

## 🔧 التغييرات المطبقة

### 1. Backend - تحديث companyInfoService.js

#### تحديث دالة updateCompanyRating
```javascript
async updateCompanyRating(companyId) {
  // Get reviews where employees reviewed the company
  const reviews = await Review.find({
    reviewee: companyId,
    reviewType: 'employee_to_company',
    status: 'approved'
  });
  
  // Calculate averages from detailed ratings
  // - workEnvironment → culture
  // - benefits → salary
  // - management → management
  // - careerGrowth → workLife
  
  // Update CompanyInfo with calculated ratings
}
```

**التغييرات الرئيسية**:
- ✅ استخدام `reviewee` بدلاً من `reviewedUser`
- ✅ تصفية حسب `reviewType: 'employee_to_company'`
- ✅ استخدام `detailedRatings` من نموذج Review
- ✅ تقريب النتائج إلى منزلة عشرية واحدة
- ✅ معالجة حالة عدم وجود تقييمات

#### تحديث دالة getCompanyInfo
```javascript
async getCompanyInfo(companyId) {
  // ... existing code ...
  
  // Update rating from reviews if needed
  const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);
  
  if (hoursSinceUpdate > 24 || companyInfo.rating.count === 0) {
    await this.updateCompanyRating(companyId);
    companyInfo = await CompanyInfo.findOne({ companyId });
  }
  
  return companyInfo;
}
```

**التغييرات الرئيسية**:
- ✅ تحديث تلقائي للتقييمات كل 24 ساعة
- ✅ تحديث فوري إذا لم تكن هناك تقييمات

### 2. Backend - تحديث Review.js Model

#### إضافة middleware لتحديث CompanyInfo تلقائياً
```javascript
reviewSchema.post('save', async function(doc) {
  // ... existing code ...
  
  // إذا كان التقييم للشركة، حدّث CompanyInfo أيضاً
  if (doc.reviewType === 'employee_to_company') {
    const companyInfoService = require('../services/companyInfoService');
    await companyInfoService.updateCompanyRating(doc.reviewee);
  }
});
```

**الفائدة**:
- ✅ تحديث تلقائي لتقييم الشركة عند إضافة تقييم جديد
- ✅ لا حاجة لاستدعاء API منفصل

### 3. Frontend - CompanyCard Component

المكون موجود بالفعل ويعمل بشكل صحيح! يعرض:
- ✅ النجوم (1-5)
- ✅ متوسط التقييم (مثال: 4.3)
- ✅ عدد التقييمات (مثال: 15 تقييم)

---

## 📊 تدفق البيانات

```
1. موظف يكتب تقييم للشركة
   ↓
2. Review.save() → post middleware
   ↓
3. companyInfoService.updateCompanyRating()
   ↓
4. حساب متوسط التقييمات
   ↓
5. تحديث CompanyInfo.rating
   ↓
6. CompanyCard يعرض التقييم المحدّث
```

---

## 🔗 ربط التقييمات التفصيلية

| Review.detailedRatings | CompanyInfo.rating.breakdown |
|------------------------|------------------------------|
| workEnvironment        | culture                      |
| benefits               | salary                       |
| management             | management                   |
| careerGrowth           | workLife                     |

---

## 📝 API Endpoints

### جلب معلومات الشركة (مع التقييمات)
```http
GET /api/companies/:id/info
```

**Response**:
```json
{
  "success": true,
  "data": {
    "companyId": "...",
    "name": "شركة ABC",
    "logo": "https://...",
    "size": "medium",
    "employeeCount": 150,
    "rating": {
      "average": 4.3,
      "count": 15,
      "breakdown": {
        "culture": 4.5,
        "salary": 4.0,
        "management": 4.2,
        "workLife": 4.4
      }
    },
    "openPositions": 5,
    "website": "https://...",
    "description": "...",
    "responseRate": {
      "percentage": 90,
      "label": "fast"
    }
  }
}
```

### تحديث تقييم الشركة يدوياً (للأدمن)
```http
POST /api/companies/:id/update-rating
Authorization: Bearer <admin_token>
```

---

## 🧪 الاختبار

### 1. اختبار إضافة تقييم جديد
```bash
# 1. إنشاء تقييم للشركة
POST /api/reviews
{
  "reviewType": "employee_to_company",
  "revieweeId": "<company_id>",
  "jobApplicationId": "<application_id>",
  "rating": 4,
  "detailedRatings": {
    "workEnvironment": 4.5,
    "management": 4.0,
    "benefits": 3.5,
    "careerGrowth": 4.0
  },
  "comment": "شركة ممتازة للعمل"
}

# 2. التحقق من تحديث CompanyInfo
GET /api/companies/<company_id>/info

# النتيجة المتوقعة:
# - rating.average = 4.0
# - rating.count = 1
# - rating.breakdown محدّث
```

### 2. اختبار التحديث التلقائي
```bash
# 1. جلب معلومات الشركة
GET /api/companies/<company_id>/info

# 2. انتظر 25 ساعة (أو غيّر updatedAt يدوياً)

# 3. جلب معلومات الشركة مرة أخرى
GET /api/companies/<company_id>/info

# النتيجة المتوقعة:
# - التقييمات محدّثة تلقائياً
```

### 3. اختبار عرض التقييمات في Frontend
```javascript
// في CompanyCard component
// يجب أن يعرض:
// - النجوم (★★★★☆)
// - متوسط التقييم (4.3)
// - عدد التقييمات (15 تقييم)
```

---

## ✅ معايير القبول

- [x] تقييم الشركة يُجلب من نظام التقييمات
- [x] CompanyCard يعرض النجوم والمتوسط
- [x] التحديث التلقائي عند إضافة تقييم جديد
- [x] التحديث الدوري كل 24 ساعة
- [x] معالجة حالة عدم وجود تقييمات
- [x] دعم متعدد اللغات (ar, en, fr)
- [x] تصميم متجاوب

---

## 🔄 التحسينات المستقبلية

### 1. عرض التقييمات التفصيلية
```jsx
// في CompanyCard
<div className="rating-breakdown">
  <div className="rating-item">
    <span>بيئة العمل</span>
    <div className="stars">{renderStars(4.5)}</div>
  </div>
  <div className="rating-item">
    <span>الإدارة</span>
    <div className="stars">{renderStars(4.0)}</div>
  </div>
  // ... المزيد
</div>
```

### 2. رابط لصفحة التقييمات
```jsx
<button onClick={() => navigate(`/companies/${companyId}/reviews`)}>
  عرض جميع التقييمات
</button>
```

### 3. توزيع التقييمات (Rating Distribution)
```jsx
<div className="rating-distribution">
  <div className="bar">
    <span>5 نجوم</span>
    <div className="progress" style={{ width: '60%' }}></div>
    <span>60%</span>
  </div>
  // ... المزيد
</div>
```

---

## 📚 المراجع

- 📄 `backend/src/models/Review.js` - نموذج التقييمات
- 📄 `backend/src/models/CompanyInfo.js` - نموذج معلومات الشركة
- 📄 `backend/src/services/companyInfoService.js` - خدمة معلومات الشركة
- 📄 `frontend/src/components/CompanyCard/CompanyCard.jsx` - مكون بطاقة الشركة
- 📄 `docs/REVIEW_SYSTEM.md` - توثيق نظام التقييمات

---

## 🎉 الخلاصة

تم دمج نظام التقييمات بنجاح مع بطاقة معلومات الشركة. الآن:

- ✅ الباحثون عن عمل يمكنهم رؤية تقييمات الشركة قبل التقديم
- ✅ التقييمات تُحدّث تلقائياً عند إضافة تقييم جديد
- ✅ التحديث الدوري كل 24 ساعة يضمن دقة البيانات
- ✅ التصميم احترافي ومتجاوب

**تاريخ الإكمال**: 2026-03-06
