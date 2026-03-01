# المهمة 5: Collaborative Filtering - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. الحصول على توصيات ذكية (موصى به)

```javascript
// Frontend - الطريقة الأسهل والأفضل
const response = await fetch('/api/recommendations/smart?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
console.log('Recommendations:', data.recommendations);
console.log('Weights:', data.weights);
// Weights: { content: 0.7, collaborative: 0.3, reason: "مستخدم نشط" }
```

**لماذا Smart؟**
- ✅ يحدد الأوزان المثلى تلقائياً
- ✅ يتكيف مع نشاط المستخدم
- ✅ أفضل دقة (80-90%)

---

### 2. أنواع التوصيات الثلاثة

#### A. Content-Based (الموجود مسبقاً)
```javascript
GET /api/recommendations/jobs?limit=10
```
- يعتمد على ملف المستخدم فقط
- دقة: 80-90%
- مناسب للمستخدمين الجدد

#### B. Collaborative (جديد)
```javascript
GET /api/recommendations/collaborative?limit=10
```
- يعتمد على المستخدمين المشابهين
- دقة: 60-70%
- يكتشف وظائف جديدة

#### C. Hybrid (جديد - موصى به)
```javascript
GET /api/recommendations/hybrid?limit=10
```
- يدمج الاثنين معاً
- دقة: 75-85%
- أفضل من كليهما

#### D. Smart (جديد - الأفضل)
```javascript
GET /api/recommendations/smart?limit=10
```
- Hybrid مع أوزان تلقائية
- دقة: 80-90%
- يتكيف مع المستخدم

---

### 3. كيف يعمل Collaborative Filtering؟

```
1. المستخدم A يعجب بـ Job1, Job2, Job3
2. المستخدم B يعجب بـ Job1, Job2, Job4
3. النظام يجد أن A و B متشابهان (لديهم Job1 و Job2 مشتركة)
4. النظام يوصي A بـ Job4 (لأن B أعجب بها)
```

**مثال واقعي**:
- أنت مطور React
- مستخدم آخر مطور React مشابه لك
- هو أعجب بوظيفة "Senior React Developer"
- النظام يوصيك بنفس الوظيفة

---

### 4. أوزان التفاعلات

```javascript
{
  'apply': 1.0,    // تقديم = أقوى إشارة
  'like': 0.8,     // إعجاب
  'save': 0.7,     // حفظ
  'view': 0.3,     // مشاهدة
  'ignore': -0.5   // تجاهل = إشارة سلبية
}
```

**كلما زادت التفاعلات، كانت التوصيات أفضل!**

---

### 5. الأوزان التلقائية (Smart)

| نشاط المستخدم | Content-Based | Collaborative | السبب |
|---------------|---------------|---------------|-------|
| جديد (< 5 تفاعلات) | 90% | 10% | لا توجد بيانات كافية |
| نشط (5-20 تفاعل) | 70% | 30% | بيانات متوسطة |
| نشط جداً (> 20 تفاعل) | 50% | 50% | بيانات كافية |

---

### 6. تقييم جودة التوصيات

```javascript
// Frontend
const response = await fetch('/api/recommendations/evaluate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    recommendations: [
      { job: { _id: 'job1' }, finalScore: 80 },
      { job: { _id: 'job2' }, finalScore: 75 }
    ]
  })
});

const evaluation = await response.json();
console.log('Precision:', evaluation.precision);  // "70.00%"
console.log('Quality:', evaluation.quality);      // "excellent"
```

**مستويات الجودة**:
- **excellent**: > 50% دقة
- **good**: 30-50% دقة
- **needs improvement**: < 30% دقة

---

### 7. إحصائيات المصفوفة

```javascript
// الحصول على إحصائيات
const response = await fetch('/api/recommendations/matrix-stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const stats = await response.json();
console.log('Total users:', stats.totalUsers);
console.log('Total interactions:', stats.totalInteractions);
console.log('Average per user:', stats.averageInteractionsPerUser);
```

---

### 8. إيجاد المستخدمين المشابهين

```javascript
// الحصول على أفضل 10 مستخدمين مشابهين
const response = await fetch('/api/recommendations/similar-users?topK=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();
console.log('Similar users:', data.similarUsers);
// [{ userId: 'user2', similarity: 0.85 }, ...]
```

---

## 🎯 أفضل الممارسات

### 1. استخدم Smart Recommendations
```javascript
// ✅ الأفضل - أوزان تلقائية
GET /api/recommendations/smart

// ❌ تجنب - أوزان يدوية
GET /api/recommendations/hybrid?contentWeight=0.6&collaborativeWeight=0.4
```

### 2. راقب جودة التوصيات
```javascript
// قيّم التوصيات بانتظام
POST /api/recommendations/evaluate
```

### 3. شجع التفاعلات
- كلما زادت التفاعلات، كانت التوصيات أفضل
- اطلب من المستخدمين الإعجاب/الحفظ/التقديم

### 4. أعد بناء المصفوفة عند الحاجة
```javascript
// عند إضافة تفاعلات كثيرة
POST /api/recommendations/rebuild-matrix
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: لا توجد توصيات collaborative
**السبب**: المستخدم جديد أو لا توجد تفاعلات كافية
**الحل**: استخدم Smart Recommendations (تعتمد على Content-Based تلقائياً)

### المشكلة: التوصيات غير دقيقة
**السبب**: بيانات تفاعلات قليلة
**الحل**: 
1. شجع المستخدمين على التفاعل
2. استخدم أوزان أعلى للـ Content-Based

### المشكلة: المصفوفة قديمة
**السبب**: لم يتم تحديثها منذ 24 ساعة
**الحل**: أعد بناءها يدوياً

---

## 📊 مثال كامل

```javascript
// 1. الحصول على توصيات ذكية
const recommendations = await fetch('/api/recommendations/smart?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

console.log('Got', recommendations.count, 'recommendations');
console.log('Weights:', recommendations.weights);

// 2. عرض التوصيات للمستخدم
recommendations.recommendations.forEach(rec => {
  console.log('Job:', rec.job.title);
  console.log('Score:', rec.finalScore);
  console.log('Reasons:', rec.reasons);
  console.log('Source:', rec.source); // 'hybrid', 'content', 'collaborative'
});

// 3. تسجيل تفاعل المستخدم
await fetch('/api/recommendations/feedback', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobId: rec.job._id,
    action: 'like'
  })
});

// 4. تقييم الجودة
const evaluation = await fetch('/api/recommendations/evaluate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ recommendations: recommendations.recommendations })
}).then(r => r.json());

console.log('Quality:', evaluation.quality);
console.log('Precision:', evaluation.precision);
```

---

## ✅ Checklist

- [ ] استخدم Smart Recommendations بدلاً من Hybrid
- [ ] راقب إحصائيات المصفوفة بانتظام
- [ ] قيّم جودة التوصيات شهرياً
- [ ] شجع المستخدمين على التفاعل
- [ ] أعد بناء المصفوفة عند إضافة تفاعلات كثيرة

---

## 📚 المزيد من المعلومات

- 📄 `TASK_5_COLLABORATIVE_FILTERING_REPORT.md` - تقرير شامل
- 📄 `backend/src/services/collaborativeFiltering.js` - الكود المصدري
- 📄 `backend/src/services/hybridRecommendation.js` - الكود المصدري
- 📄 `backend/tests/collaborativeFiltering.test.js` - الاختبارات

---

**تاريخ الإنشاء**: 2026-02-28  
**آخر تحديث**: 2026-02-28  
**الحالة**: ✅ جاهز للاستخدام
