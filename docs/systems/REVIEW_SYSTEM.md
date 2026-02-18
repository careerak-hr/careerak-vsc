# ⭐ نظام التقييمات والمراجعات - Careerak

## 📋 نظرة عامة

نظام شامل لتقييم الشركات والموظفين بعد اكتمال العمل، مع نظام نجوم (1-5) وتعليقات مكتوبة.

---

## 🎯 الميزات الرئيسية

### 1. التقييم الثنائي ✅
- **الموظفون يقيمون الشركات** بعد العمل
- **الشركات تقيم الموظفين** بعد العمل
- تقييم واحد لكل طلب توظيف

### 2. نظام النجوم (1-5) ⭐
- تقييم إجمالي من 1 إلى 5 نجوم
- تقييمات تفصيلية اختيارية:
  - **للموظفين**: الاحترافية، التواصل، المهارات، الالتزام بالمواعيد
  - **للشركات**: بيئة العمل، الإدارة، المزايا، فرص النمو

### 3. التعليقات المكتوبة 📝
- تعليق رئيسي (10-1000 حرف)
- عنوان اختياري
- الإيجابيات والسلبيات
- هل توصي بالعمل مع هذا الطرف؟

### 4. عرض في الملف الشخصي 👤
- متوسط التقييم
- عدد التقييمات
- توزيع النجوم (1-5)
- عرض التقييمات الأخيرة

### 5. ميزات إضافية 🎁
- **الرد على التقييمات**: المُقيَّم يمكنه الرد مرة واحدة
- **مفيد/غير مفيد**: المستخدمون يصوتون على فائدة التقييم
- **الإبلاغ**: الإبلاغ عن تقييمات غير لائقة
- **التعديل**: تعديل التقييم خلال 24 ساعة (حتى 3 مرات)
- **التقييم المجهول**: خيار إخفاء الهوية

---

## 📊 البنية التقنية

### النموذج (Review Model)

```javascript
{
  reviewType: 'company_to_employee' | 'employee_to_company',
  reviewer: ObjectId,        // المُقيِّم
  reviewee: ObjectId,        // المُقيَّم
  jobPosting: ObjectId,
  jobApplication: ObjectId,
  
  rating: Number (1-5),      // التقييم الإجمالي
  
  detailedRatings: {
    // للموظفين
    professionalism: Number,
    communication: Number,
    skills: Number,
    punctuality: Number,
    
    // للشركات
    workEnvironment: Number,
    management: Number,
    benefits: Number,
    careerGrowth: Number
  },
  
  comment: String,           // التعليق الرئيسي
  title: String,             // العنوان
  pros: String,              // الإيجابيات
  cons: String,              // السلبيات
  wouldRecommend: Boolean,   // هل يوصي؟
  
  status: 'pending' | 'approved' | 'rejected' | 'flagged',
  isAnonymous: Boolean,
  
  response: {
    text: String,
    respondedAt: Date
  },
  
  helpfulCount: Number,
  notHelpfulCount: Number,
  helpfulBy: [ObjectId],
  
  reports: [{
    reportedBy: ObjectId,
    reason: String,
    description: String,
    reportedAt: Date
  }],
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    editedAt: Date,
    editCount: Number
  }
}
```

### تحديث نموذج User

```javascript
{
  // ... الحقول الموجودة
  
  reviewStats: {
    averageRating: Number (0-5),
    totalReviews: Number,
    ratingDistribution: {
      1: Number,
      2: Number,
      3: Number,
      4: Number,
      5: Number
    }
  }
}
```

---

## 🔌 API Endpoints

### 1. إنشاء تقييم
```http
POST /reviews
Authorization: Bearer {token}

{
  "reviewType": "employee_to_company",
  "revieweeId": "company_user_id",
  "jobApplicationId": "application_id",
  "rating": 4.5,
  "detailedRatings": {
    "workEnvironment": 5,
    "management": 4,
    "benefits": 4,
    "careerGrowth": 5
  },
  "comment": "تجربة عمل رائعة! بيئة عمل محترمة وإدارة داعمة.",
  "title": "تجربة ممتازة",
  "pros": "بيئة عمل إيجابية، رواتب جيدة، فرص تطوير",
  "cons": "ساعات العمل أحياناً طويلة",
  "wouldRecommend": true,
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إضافة التقييم بنجاح",
  "review": { ... }
}
```

### 2. جلب تقييمات مستخدم
```http
GET /reviews/user/:userId?reviewType=employee_to_company&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "reviews": [...],
  "stats": {
    "averageRating": 4.3,
    "totalReviews": 15,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 5,
      "5": 7
    }
  },
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalReviews": 15,
    "hasMore": true
  }
}
```

### 3. جلب إحصائيات التقييمات
```http
GET /reviews/stats/:userId?reviewType=employee_to_company
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "averageRating": 4.3,
    "totalReviews": 15,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 5,
      "5": 7
    }
  }
}
```

### 4. جلب تقييم واحد
```http
GET /reviews/:reviewId
```

### 5. تعديل تقييم
```http
PUT /reviews/:reviewId
Authorization: Bearer {token}

{
  "rating": 5,
  "comment": "تعليق محدّث..."
}
```

### 6. حذف تقييم
```http
DELETE /reviews/:reviewId
Authorization: Bearer {token}
```

### 7. إضافة رد على تقييم
```http
POST /reviews/:reviewId/response
Authorization: Bearer {token}

{
  "responseText": "شكراً على تقييمك! نسعد بالعمل معك مجدداً."
}
```

### 8. تحديد التقييم كمفيد
```http
POST /reviews/:reviewId/helpful
Authorization: Bearer {token}

{
  "isHelpful": true
}
```

### 9. الإبلاغ عن تقييم
```http
POST /reviews/:reviewId/report
Authorization: Bearer {token}

{
  "reason": "spam",
  "description": "تقييم مزيف"
}
```

### 10. جلب التقييمات المُبلغ عنها (Admin)
```http
GET /reviews/admin/flagged?page=1&limit=20
Authorization: Bearer {admin_token}
```

### 11. مراجعة تقييم (Admin)
```http
PUT /reviews/admin/:reviewId/moderate
Authorization: Bearer {admin_token}

{
  "action": "approve",
  "moderationNote": "تقييم صحيح"
}
```

---

## 🔒 القواعد والقيود

### 1. متى يمكن كتابة تقييم؟
- ✅ بعد اكتمال العمل (status: 'hired')
- ✅ تقييم واحد فقط لكل طلب توظيف
- ✅ الشركة تقيم الموظف والعكس

### 2. التعديل
- ✅ خلال 24 ساعة من الإنشاء
- ✅ حتى 3 تعديلات فقط
- ❌ بعد ذلك لا يمكن التعديل

### 3. الرد
- ✅ المُقيَّم فقط يمكنه الرد
- ✅ رد واحد فقط
- ❌ لا يمكن تعديل الرد

### 4. الإبلاغ
- ✅ أي مستخدم يمكنه الإبلاغ
- ✅ إبلاغ واحد لكل مستخدم
- ⚠️ 3 إبلاغات = حالة flagged تلقائياً

### 5. الحذف
- ✅ صاحب التقييم يمكنه الحذف
- ✅ الأدمن يمكنه الحذف
- ❌ المُقيَّم لا يمكنه الحذف

---

## 🎨 عرض التقييمات في UI

### 1. في الملف الشخصي
```jsx
<div className="review-stats">
  <div className="average-rating">
    <span className="rating-number">4.3</span>
    <div className="stars">⭐⭐⭐⭐☆</div>
    <span className="total-reviews">(15 تقييم)</span>
  </div>
  
  <div className="rating-distribution">
    <div className="rating-bar">
      <span>5 ⭐</span>
      <div className="bar" style="width: 47%"></div>
      <span>7</span>
    </div>
    <div className="rating-bar">
      <span>4 ⭐</span>
      <div className="bar" style="width: 33%"></div>
      <span>5</span>
    </div>
    <!-- ... -->
  </div>
</div>
```

### 2. عرض تقييم واحد
```jsx
<div className="review-card">
  <div className="review-header">
    <img src={reviewer.profilePicture} />
    <div>
      <h4>{reviewer.fullName}</h4>
      <div className="stars">⭐⭐⭐⭐⭐</div>
      <span className="date">منذ أسبوعين</span>
    </div>
  </div>
  
  <h3 className="review-title">{review.title}</h3>
  <p className="review-comment">{review.comment}</p>
  
  {review.pros && (
    <div className="pros">
      <strong>الإيجابيات:</strong> {review.pros}
    </div>
  )}
  
  {review.cons && (
    <div className="cons">
      <strong>السلبيات:</strong> {review.cons}
    </div>
  )}
  
  {review.wouldRecommend && (
    <div className="recommend">
      ✅ يوصي بالعمل مع هذا الطرف
    </div>
  )}
  
  {review.response && (
    <div className="response">
      <strong>رد من {reviewee.fullName}:</strong>
      <p>{review.response.text}</p>
    </div>
  )}
  
  <div className="review-actions">
    <button onClick={() => markHelpful(true)}>
      👍 مفيد ({review.helpfulCount})
    </button>
    <button onClick={() => markHelpful(false)}>
      👎 غير مفيد ({review.notHelpfulCount})
    </button>
    <button onClick={() => reportReview()}>
      🚩 إبلاغ
    </button>
  </div>
</div>
```

### 3. نموذج كتابة تقييم
```jsx
<form onSubmit={handleSubmit}>
  <div className="rating-input">
    <label>التقييم الإجمالي</label>
    <StarRating value={rating} onChange={setRating} />
  </div>
  
  <div className="detailed-ratings">
    <h4>تقييمات تفصيلية (اختياري)</h4>
    <div>
      <label>بيئة العمل</label>
      <StarRating value={workEnvironment} onChange={setWorkEnvironment} />
    </div>
    <!-- ... باقي التقييمات -->
  </div>
  
  <div className="form-group">
    <label>العنوان</label>
    <input type="text" maxLength="100" />
  </div>
  
  <div className="form-group">
    <label>التعليق</label>
    <textarea minLength="10" maxLength="1000" required />
  </div>
  
  <div className="form-group">
    <label>الإيجابيات</label>
    <textarea maxLength="500" />
  </div>
  
  <div className="form-group">
    <label>السلبيات</label>
    <textarea maxLength="500" />
  </div>
  
  <div className="form-group">
    <label>
      <input type="checkbox" checked={wouldRecommend} />
      أوصي بالعمل مع هذا الطرف
    </label>
  </div>
  
  <div className="form-group">
    <label>
      <input type="checkbox" checked={isAnonymous} />
      تقييم مجهول
    </label>
  </div>
  
  <button type="submit">إرسال التقييم</button>
</form>
```

---

## 🧪 أمثلة الاستخدام

### مثال 1: موظف يقيم شركة
```javascript
const createReview = async () => {
  const response = await fetch('/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      reviewType: 'employee_to_company',
      revieweeId: companyId,
      jobApplicationId: applicationId,
      rating: 4.5,
      detailedRatings: {
        workEnvironment: 5,
        management: 4,
        benefits: 4,
        careerGrowth: 5
      },
      comment: 'تجربة عمل رائعة! بيئة عمل محترمة وإدارة داعمة.',
      title: 'تجربة ممتازة',
      pros: 'بيئة عمل إيجابية، رواتب جيدة، فرص تطوير',
      cons: 'ساعات العمل أحياناً طويلة',
      wouldRecommend: true
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

### مثال 2: شركة تقيم موظف
```javascript
const createReview = async () => {
  const response = await fetch('/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      reviewType: 'company_to_employee',
      revieweeId: employeeId,
      jobApplicationId: applicationId,
      rating: 5,
      detailedRatings: {
        professionalism: 5,
        communication: 5,
        skills: 5,
        punctuality: 5
      },
      comment: 'موظف ممتاز! محترف ومتعاون ويلتزم بالمواعيد.',
      title: 'موظف مثالي',
      pros: 'احترافية عالية، مهارات ممتازة، التزام بالمواعيد',
      wouldRecommend: true
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

### مثال 3: جلب تقييمات مستخدم
```javascript
const fetchUserReviews = async (userId) => {
  const response = await fetch(
    `/reviews/user/${userId}?reviewType=employee_to_company&page=1&limit=10`
  );
  
  const data = await response.json();
  
  console.log('Average Rating:', data.stats.averageRating);
  console.log('Total Reviews:', data.stats.totalReviews);
  console.log('Reviews:', data.reviews);
};
```

---

## 📈 الفوائد المتوقعة

### 1. بناء الثقة 🤝
- تقييمات حقيقية من مستخدمين فعليين
- شفافية في التعاملات
- سمعة قابلة للقياس

### 2. تحسين الجودة 📊
- الشركات تحسّن خدماتها بناءً على التقييمات
- الموظفون يطورون مهاراتهم
- المنصة تحدد المستخدمين المميزين

### 3. اتخاذ قرارات أفضل 🎯
- الشركات تختار موظفين بناءً على تقييماتهم
- الموظفون يختارون شركات بناءً على تقييماتها
- تقليل المخاطر

### 4. زيادة المصداقية ✅
- نظام تقييم موثوق
- مراجعة الإبلاغات
- منع التقييمات المزيفة

---

## 🔐 الأمان والخصوصية

### 1. منع التلاعب
- ✅ تقييم واحد فقط لكل طلب
- ✅ التحقق من اكتمال العمل
- ✅ نظام الإبلاغ
- ✅ مراجعة الأدمن

### 2. الخصوصية
- ✅ خيار التقييم المجهول
- ✅ إخفاء معلومات حساسة
- ✅ التحكم في الرد

### 3. الجودة
- ✅ حد أدنى للتعليق (10 أحرف)
- ✅ حد أقصى (1000 حرف)
- ✅ تقييمات تفصيلية اختيارية

---

## 📚 الملفات المضافة

| الملف | الوصف |
|------|-------|
| `backend/src/models/Review.js` | نموذج التقييمات |
| `backend/src/controllers/reviewController.js` | معالج طلبات التقييمات |
| `backend/src/routes/reviewRoutes.js` | مسارات API |
| `backend/src/models/User.js` | محدّث بحقل reviewStats |
| `backend/src/app.js` | محدّث بمسار /reviews |
| `docs/REVIEW_SYSTEM.md` | هذا الملف |

---

**تاريخ الإنشاء**: 2026-02-17  
**الحالة**: ✅ مكتمل وجاهز للاستخدام  
**الإصدار**: 1.0.0
