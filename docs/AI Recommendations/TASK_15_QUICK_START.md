# المهمة 15: تحسين النماذج والأداء - دليل البدء السريع

## 🚀 البدء السريع (5 دقائق)

### 1. تدريب النماذج

```bash
cd backend
node scripts/train-models.js
```

**النتيجة المتوقعة**:
```
✅ تم جمع 1250 عينة تدريب
📈 بيانات التدريب: 1000 عينة
📉 بيانات الاختبار: 250 عينة

🎯 تدريب نموذج: content_based...
✅ content_based - Accuracy: 82.50%

🎯 تدريب نموذج: collaborative...
✅ collaborative - Accuracy: 78.30%

🎯 تدريب نموذج: hybrid...
✅ hybrid - Accuracy: 85.20%

🏆 أفضل نموذج: HYBRID
📊 F1-Score: 83.45%
```

---

### 2. إنشاء تجربة A/B

```javascript
// في Backend API
POST /api/ab-testing/experiments
Authorization: Bearer <admin_token>

{
  "name": "Content-Based vs Hybrid",
  "description": "مقارنة بين النموذجين",
  "modelA": "content_based",
  "modelB": "hybrid",
  "splitRatio": 0.5,
  "duration": 7,
  "metrics": ["ctr", "conversion", "engagement"]
}
```

**الاستجابة**:
```json
{
  "success": true,
  "experiment": {
    "id": "exp_1709251200000_abc123",
    "name": "Content-Based vs Hybrid",
    "status": "active",
    "startDate": "2026-03-01T00:00:00.000Z",
    "endDate": "2026-03-08T00:00:00.000Z"
  }
}
```

---

### 3. تتبع الأحداث

```javascript
// عند عرض توصية
POST /api/ab-testing/track/impression
{
  "experimentId": "exp_1709251200000_abc123",
  "recommendationId": "rec_123"
}

// عند النقر
POST /api/ab-testing/track/click
{
  "experimentId": "exp_1709251200000_abc123",
  "recommendationId": "rec_123"
}

// عند التقديم
POST /api/ab-testing/track/conversion
{
  "experimentId": "exp_1709251200000_abc123",
  "recommendationId": "rec_123"
}
```

---

### 4. تحليل النتائج

```javascript
GET /api/ab-testing/experiments/exp_1709251200000_abc123/analysis
```

**الاستجابة**:
```json
{
  "success": true,
  "analysis": {
    "experimentId": "exp_1709251200000_abc123",
    "name": "Content-Based vs Hybrid",
    "duration": 7.0,
    "groupA": {
      "users": 150,
      "impressions": 1500,
      "clicks": 225,
      "conversions": 60,
      "ctr": 0.15,
      "conversionRate": 0.267
    },
    "groupB": {
      "users": 145,
      "impressions": 1450,
      "clicks": 261,
      "conversions": 78,
      "ctr": 0.18,
      "conversionRate": 0.299
    },
    "winner": {
      "group": "B",
      "model": "hybrid",
      "score": 80,
      "confidence": 72.5
    },
    "statisticalSignificance": {
      "isSignificant": true,
      "pValue": 0.03,
      "confidence": 97.0
    }
  }
}
```

---

### 5. استخدام التخزين المؤقت

```javascript
// في Recommendation Service
const cacheService = require('./recommendationCacheService');

async function getRecommendations(userId) {
  // 1. محاولة الجلب من الذاكرة المؤقتة
  let recommendations = await cacheService.getRecommendations(userId, 'job', 10);
  
  if (recommendations) {
    console.log('✅ Cache HIT');
    return recommendations;
  }
  
  // 2. حساب التوصيات
  console.log('❌ Cache MISS - حساب التوصيات...');
  recommendations = await calculateRecommendations(userId);
  
  // 3. حفظ في الذاكرة المؤقتة
  await cacheService.setRecommendations(userId, 'job', 10, recommendations);
  
  return recommendations;
}

// عند تحديث الملف الشخصي
async function updateUserProfile(userId, updates) {
  await User.findByIdAndUpdate(userId, updates);
  
  // حذف الذاكرة المؤقتة
  await cacheService.invalidateUserProfile(userId);
}
```

---

### 6. تحسين الاستعلامات

```javascript
const queryOptimization = require('./queryOptimizationService');

// جلب مستخدمين محسّن
const users = await queryOptimization.getOptimizedUsers(
  { 'profile.experience.years': { $gte: 3 } },
  { 
    limit: 100, 
    fields: 'profile.skills profile.experience',
    skip: 0
  }
);

// جلب وظائف محسّن
const jobs = await queryOptimization.getOptimizedJobs(
  { location: 'Cairo', status: 'active' },
  { 
    limit: 50, 
    sort: { createdAt: -1 },
    fields: 'title description requirements'
  }
);

// معالجة دفعات
const results = await queryOptimization.processBatch(
  users,
  50, // batch size
  async (user) => {
    return await processUser(user);
  }
);
```

---

## 📊 مراقبة الأداء

### إحصائيات الذاكرة المؤقتة

```javascript
const stats = await cacheService.getCacheStats();

console.log(stats);
// {
//   recommendations: 450,
//   userProfiles: 320,
//   jobDetails: 180,
//   similarUsers: 95,
//   userItemMatrix: 1,
//   total: 1046
// }
```

### تحليل أداء الاستعلامات

```javascript
const performance = await queryOptimization.analyzeQueryPerformance(
  { status: 'active', location: 'Cairo' },
  JobPosting.collection
);

console.log(performance);
// {
//   executionTimeMs: 12,
//   totalDocsExamined: 50,
//   totalKeysExamined: 50,
//   nReturned: 50,
//   indexUsed: 'status_1_location_1'
// }
```

---

## 🔧 الإعداد الأولي

### 1. إنشاء Indexes

```javascript
const queryOptimization = require('./queryOptimizationService');

await queryOptimization.createOptimizedIndexes();
```

### 2. تكوين Redis

```javascript
// في .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. إضافة Routes

```javascript
// في app.js
const abTestingRoutes = require('./routes/abTestingRoutes');
app.use('/api/ab-testing', abTestingRoutes);
```

---

## 🎯 أفضل الممارسات

### Model Training
- ✅ تدريب شهري للنماذج
- ✅ حفظ التقارير للمقارنة
- ✅ مراقبة دقة النماذج

### A/B Testing
- ✅ حجم عينة كافٍ (100+ لكل مجموعة)
- ✅ مدة كافية (7-14 يوم)
- ✅ التحقق من الدلالة الإحصائية

### Caching
- ✅ مراقبة Cache Hit Rate
- ✅ حذف الذاكرة المؤقتة عند التحديث
- ✅ تحديث مدة التخزين حسب الحاجة

### Query Optimization
- ✅ استخدام indexes دائماً
- ✅ تحديد الحقول المطلوبة فقط
- ✅ استخدام lean() للقراءة فقط
- ✅ معالجة دفعات للعمليات الكبيرة

---

## 🐛 استكشاف الأخطاء

### "لا توجد بيانات كافية للتدريب"
```bash
# تحقق من عدد المستخدمين والتفاعلات
node scripts/train-models.js --min-interactions 5
```

### "Cache not working"
```bash
# تحقق من Redis
redis-cli ping
# يجب أن يرجع: PONG
```

### "Slow queries"
```javascript
// تحليل الاستعلام
const performance = await queryOptimization.analyzeQueryPerformance(query, collection);

// إذا كان indexUsed = 'COLLSCAN'، أنشئ index
await collection.createIndex({ field: 1 });
```

---

## 📚 المزيد من المعلومات

- 📄 `TASK_15_MODEL_OPTIMIZATION_SUMMARY.md` - ملخص شامل
- 📄 `backend/src/services/modelTrainingPipeline.js` - كود التدريب
- 📄 `backend/src/services/abTestingService.js` - كود A/B Testing
- 📄 `backend/src/services/recommendationCacheService.js` - كود التخزين المؤقت

---

**تاريخ الإنشاء**: 2026-03-01  
**الحالة**: ✅ جاهز للاستخدام
