# نظام التوصيات الذكية - المهمة 1: إعداد البنية الأساسية والبيانات

## 📋 معلومات المهمة

- **رقم المهمة**: 1
- **الاسم**: إعداد البنية الأساسية والبيانات
- **الحالة**: ✅ مكتمل
- **تاريخ الإنجاز**: 2026-02-28

---

## 🎯 الهدف

إعداد البنية التحتية الأساسية لنظام التوصيات الذكية، بما في ذلك:
- نماذج قاعدة البيانات (Models)
- بيئة Python للتعلم الآلي
- Redis للتخزين المؤقت
- Celery للمهام الخلفية

---

## ✅ ما تم إنجازه

### 1. نماذج قاعدة البيانات (Database Models)

#### 1.1 Recommendation Model ✅
**الموقع**: `backend/src/models/Recommendation.js`

**الميزات**:
- تخزين التوصيات المولدة (وظائف، دورات، مرشحين)
- نسبة التطابق (0-100%)
- أسباب التوصية (explainable AI)
- ثقة النموذج (confidence)
- تتبع التفاعلات (seen, clicked, applied)
- انتهاء صلاحية تلقائي (TTL)

**الحقول الرئيسية**:
```javascript
{
  userId: ObjectId,
  itemType: 'job' | 'course' | 'candidate',
  itemId: ObjectId,
  score: Number (0-100),
  confidence: Number (0-1),
  reasons: [{
    type: String,
    message: String,
    strength: 'high' | 'medium' | 'low'
  }],
  features: Object,
  modelVersion: String,
  metadata: {
    algorithm: String,
    seen: Boolean,
    clicked: Boolean,
    applied: Boolean
  },
  expiresAt: Date
}
```

**الطرق المتاحة**:
- `getUserRecommendations()`: جلب توصيات مستخدم
- `updateUserRecommendations()`: تحديث التوصيات
- `getRecommendationStats()`: إحصاءات التوصيات
- `cleanupOldRecommendations()`: تنظيف التوصيات القديمة

#### 1.2 UserInteraction Model ✅
**الموقع**: `backend/src/models/UserInteraction.js`

**الميزات**:
- تتبع جميع التفاعلات (view, like, apply, ignore, save)
- مدة المشاهدة
- سياق التفاعل (صفحة المصدر، الموقع، إلخ)
- معلومات الجلسة

**الحقول الرئيسية**:
```javascript
{
  userId: ObjectId,
  itemType: 'job' | 'course' | 'candidate',
  itemId: ObjectId,
  action: 'view' | 'like' | 'apply' | 'ignore' | 'save',
  duration: Number,
  timestamp: Date,
  context: {
    sourcePage: String,
    displayType: String,
    position: Number,
    originalScore: Number
  },
  session: {
    sessionId: String,
    deviceType: String,
    browser: String
  }
}
```

**الطرق المتاحة**:
- `logInteraction()`: تسجيل تفاعل جديد
- `getUserInteractions()`: جلب تفاعلات مستخدم
- `getUserInteractionStats()`: إحصاءات التفاعلات
- `analyzeUserPreferences()`: تحليل تفضيلات المستخدم
- `calculateConversionRate()`: حساب معدل التحويل

#### 1.3 ProfileAnalysis Model ✅
**الموقع**: `backend/src/models/ProfileAnalysis.js`

**الميزات**:
- درجة اكتمال الملف (0-100%)
- درجة القوة (0-100%)
- نقاط القوة والضعف
- اقتراحات التحسين
- تتبع التقدم

**الحقول الرئيسية**:
```javascript
{
  userId: ObjectId,
  completenessScore: Number (0-100),
  completenessLevel: String,
  completenessDetails: {
    basic: { score, filled, total, percentage },
    education: { score, filled, total, percentage },
    experience: { score, filled, total, percentage },
    skills: { score, filled, total, percentage }
  },
  strengthScore: Number (0-100),
  strengths: [{ category, title, description, impact }],
  weaknesses: [{ category, title, description, impact }],
  suggestions: [{
    category: String,
    priority: 'high' | 'medium' | 'low',
    title: String,
    description: String,
    action: String,
    estimatedImpact: Number,
    completed: Boolean
  }],
  analyzedAt: Date
}
```

#### 1.4 MLModel Model ✅ (جديد)
**الموقع**: `backend/src/models/MLModel.js`

**الميزات**:
- تخزين معلومات نماذج ML
- مقاييس الأداء (accuracy, precision, recall, F1)
- معلومات التدريب
- المعاملات الفائقة (hyperparameters)
- الميزات المستخدمة
- سجل التحديثات

**الحقول الرئيسية**:
```javascript
{
  modelId: String (unique),
  modelType: 'content_based' | 'collaborative' | 'hybrid' | 'cv_parser' | 'skill_extractor' | 'profile_analyzer',
  version: String,
  metrics: {
    accuracy: Number (0-1),
    precision: Number (0-1),
    recall: Number (0-1),
    f1Score: Number (0-1),
    ndcg: Number (0-1),
    mrr: Number (0-1),
    ctr: Number (0-1),
    conversionRate: Number (0-1)
  },
  training: {
    trainedAt: Date,
    trainingDataSize: Number,
    testDataSize: Number,
    trainingDuration: Number,
    epochs: Number
  },
  hyperparameters: Object,
  features: [{
    name: String,
    type: String,
    importance: Number,
    description: String
  }],
  status: 'training' | 'testing' | 'active' | 'inactive' | 'deprecated' | 'failed',
  isActive: Boolean,
  deployment: {
    deployedAt: Date,
    environment: String,
    requestCount: Number,
    avgResponseTime: Number,
    errorRate: Number
  }
}
```

**الطرق المتاحة**:
- `activate()`: تفعيل النموذج
- `deactivate()`: إلغاء تفعيل النموذج
- `updateMetrics()`: تحديث مقاييس الأداء
- `getActiveModel()`: الحصول على النموذج النشط
- `getBestModel()`: الحصول على أفضل نموذج
- `compareModels()`: مقارنة النماذج

---

### 2. بيئة Python للتعلم الآلي ✅

#### 2.1 ملف المتطلبات (requirements.txt)
**الموقع**: `backend/ml/requirements.txt`

**المكتبات المثبتة**:

**Core ML Libraries**:
- scikit-learn==1.3.2
- pandas==2.1.4
- numpy==1.26.2

**NLP Libraries**:
- spacy==3.7.2
- nltk==3.8.1
- camel-tools==1.5.2 (للعربية)
- pyarabic==0.6.15 (للعربية)
- sentence-transformers==2.2.2
- transformers==4.36.2

**Document Processing**:
- pdfplumber==0.10.3
- python-docx==1.1.0
- PyPDF2==3.0.1

**Feature Engineering**:
- scipy==1.11.4
- joblib==1.3.2

**Utilities**:
- python-dotenv==1.0.0
- requests==2.31.0

**Development**:
- pytest==7.4.3
- pytest-cov==4.1.0
- black==23.12.1
- flake8==7.0.0

#### 2.2 سكريبت الإعداد (setup.py)
**الموقع**: `backend/ml/setup.py`

**الوظائف**:
- ✅ التحقق من إصدار Python (3.8+)
- ✅ إنشاء بيئة افتراضية (virtual environment)
- ✅ تثبيت جميع المتطلبات
- ✅ تحميل نماذج spaCy (en_core_web_sm, ar_core_news_sm)
- ✅ إنشاء المجلدات الضرورية
- ✅ إنشاء ملف .env

**الاستخدام**:
```bash
cd backend/ml
python setup.py
```

#### 2.3 هيكل المجلدات
```
backend/ml/
├── celery_app.py           # تطبيق Celery
├── requirements.txt        # متطلبات Python
├── setup.py               # سكريبت الإعداد
├── .env                   # المتغيرات البيئية
├── README.md              # التوثيق
├── tasks/                 # مهام Celery
│   ├── __init__.py
│   ├── recommendation_tasks.py
│   ├── training_tasks.py
│   ├── analysis_tasks.py
│   ├── feature_tasks.py
│   └── maintenance_tasks.py
├── models/                # نماذج ML المدربة
├── data/                  # البيانات
│   ├── raw/              # بيانات خام
│   ├── processed/        # بيانات معالجة
│   └── features/         # ميزات مستخرجة
├── logs/                  # سجلات
└── cache/                 # كاش مؤقت
```

---

### 3. Redis للتخزين المؤقت ✅

#### 3.1 إعدادات Redis
**الموقع**: `backend/src/config/redis.js`

**الميزات**:
- اتصال Redis مع إعادة المحاولة التلقائية
- Promisified methods (async/await)
- Cache helper functions
- معالجة الأخطاء الشاملة
- دعم TTL (Time To Live)

**الطرق المتاحة**:

**Raw Redis Methods**:
- `getAsync(key)`: جلب قيمة
- `setAsync(key, value, expireSeconds)`: حفظ قيمة
- `delAsync(key)`: حذف قيمة
- `existsAsync(key)`: التحقق من وجود مفتاح
- `expireAsync(key, seconds)`: تحديث TTL
- `ttlAsync(key)`: الحصول على TTL
- `keysAsync(pattern)`: البحث عن مفاتيح

**Cache Helper Methods**:
- `cacheSet(key, data, ttl)`: حفظ بيانات JSON
- `cacheGet(key)`: جلب بيانات JSON
- `cacheDel(key)`: حذف بيانات
- `cacheDelPattern(pattern)`: حذف بنمط معين
- `cacheExists(key)`: التحقق من وجود
- `cacheTTL(key)`: الحصول على TTL
- `cacheExpire(key, seconds)`: تحديث TTL

**Cache Keys Generator**:
```javascript
CacheKeys = {
  userRecommendations: (userId, itemType) => `recommendations:${userId}:${itemType}`,
  profileAnalysis: (userId) => `profile:analysis:${userId}`,
  userInteractions: (userId) => `interactions:${userId}`,
  mlModel: (modelType) => `ml:model:${modelType}`,
  userFeatures: (userId) => `features:user:${userId}`,
  jobFeatures: (jobId) => `features:job:${jobId}`,
  courseFeatures: (courseId) => `features:course:${courseId}`,
  stats: (type) => `stats:${type}`
}
```

**الاستخدام**:
```javascript
const { cacheSet, cacheGet, CacheKeys } = require('./config/redis');

// حفظ توصيات
await cacheSet(
  CacheKeys.userRecommendations(userId, 'job'),
  recommendations,
  3600 // ساعة واحدة
);

// جلب توصيات
const cached = await cacheGet(CacheKeys.userRecommendations(userId, 'job'));
```

---

### 4. Celery للمهام الخلفية ✅

#### 4.1 تطبيق Celery
**الموقع**: `backend/ml/celery_app.py`

**الإعدادات**:
- Broker: Redis
- Backend: Redis
- Serializer: JSON
- Timezone: UTC
- Task time limit: 30 دقيقة
- Retry: 3 محاولات

**قوائم الانتظار (Queues)**:
- `recommendations`: مهام التوصيات
- `training`: مهام التدريب
- `analysis`: مهام التحليل
- `features`: مهام الميزات
- `maintenance`: مهام الصيانة

**المهام المجدولة**:
| المهمة | الجدول | الوصف |
|--------|--------|-------|
| `update-recommendations-daily` | يومياً 2:00 ص | تحديث التوصيات لجميع المستخدمين |
| `retrain-models-weekly` | الإثنين 3:00 ص | إعادة تدريب النماذج |
| `update-features-6h` | كل 6 ساعات | تحديث الميزات |
| `cleanup-cache-daily` | يومياً 4:00 ص | تنظيف الكاش القديم |
| `analyze-performance-weekly` | الأحد 5:00 ص | تحليل أداء النماذج |

#### 4.2 مهام التوصيات
**الموقع**: `backend/ml/tasks/recommendation_tasks.py`

**المهام المتاحة**:
- `generate_user_recommendations(user_id, item_type)`: توليد توصيات لمستخدم
- `update_all_recommendations()`: تحديث التوصيات لجميع المستخدمين
- `refresh_user_cache(user_id)`: تحديث كاش المستخدم
- `batch_generate_recommendations(user_ids, item_type)`: توليد دفعة من التوصيات

#### 4.3 مهام التدريب
**الموقع**: `backend/ml/tasks/training_tasks.py`

**المهام المتاحة**:
- `train_content_based_model()`: تدريب نموذج Content-Based
- `train_collaborative_model()`: تدريب نموذج Collaborative
- `retrain_all_models()`: إعادة تدريب جميع النماذج

#### 4.4 مهام التحليل
**الموقع**: `backend/ml/tasks/analysis_tasks.py`

**المهام المتاحة**:
- `analyze_cv(user_id, cv_path)`: تحليل السيرة الذاتية
- `analyze_profile(user_id)`: تحليل الملف الشخصي
- `analyze_model_performance()`: تحليل أداء النماذج

#### 4.5 مهام الميزات
**الموقع**: `backend/ml/tasks/feature_tasks.py`

**المهام المتاحة**:
- `extract_user_features(user_id)`: استخراج ميزات المستخدم
- `extract_job_features(job_id)`: استخراج ميزات الوظيفة
- `update_all_features()`: تحديث جميع الميزات

#### 4.6 مهام الصيانة
**الموقع**: `backend/ml/tasks/maintenance_tasks.py`

**المهام المتاحة**:
- `cleanup_old_cache()`: تنظيف الكاش القديم
- `cleanup_old_recommendations()`: تنظيف التوصيات القديمة
- `cleanup_old_interactions()`: تنظيف التفاعلات القديمة

---

## 🚀 كيفية الاستخدام

### 1. إعداد البيئة

```bash
# الانتقال إلى مجلد ML
cd backend/ml

# تشغيل سكريبت الإعداد
python setup.py

# تفعيل البيئة الافتراضية
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### 2. تحديث ملف .env

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/careerak

# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Model Settings
MODEL_VERSION=1.0.0
MODEL_PATH=./models
```

### 3. تشغيل Redis

```bash
# تشغيل Redis
redis-server

# التحقق من عمل Redis
redis-cli ping
# يجب أن يرجع: PONG
```

### 4. تشغيل Celery

```bash
# Worker فقط
celery -A celery_app worker --loglevel=info

# Worker + Beat (للمهام المجدولة)
celery -A celery_app worker --beat --loglevel=info

# قائمة انتظار محددة
celery -A celery_app worker -Q recommendations --loglevel=info
```

### 5. استخدام النماذج في Node.js

```javascript
// استيراد النماذج
const Recommendation = require('./models/Recommendation');
const UserInteraction = require('./models/UserInteraction');
const ProfileAnalysis = require('./models/ProfileAnalysis');
const MLModel = require('./models/MLModel');

// مثال: جلب توصيات مستخدم
const recommendations = await Recommendation.getUserRecommendations(userId, {
  itemType: 'job',
  limit: 20,
  minScore: 30
});

// مثال: تسجيل تفاعل
await UserInteraction.logInteraction(userId, 'job', jobId, 'view', {
  duration: 45,
  sourcePage: 'recommendations',
  position: 3
});

// مثال: الحصول على النموذج النشط
const activeModel = await MLModel.getActiveModel('content_based');
```

### 6. استخدام Redis Cache

```javascript
const { cacheSet, cacheGet, CacheKeys } = require('./config/redis');

// حفظ في الكاش
await cacheSet(
  CacheKeys.userRecommendations(userId, 'job'),
  recommendations,
  3600
);

// جلب من الكاش
const cached = await cacheGet(CacheKeys.userRecommendations(userId, 'job'));

if (cached) {
  return cached; // استخدام الكاش
} else {
  // توليد توصيات جديدة
}
```

---

## 📊 الإحصاءات والمراقبة

### Flower (واجهة مراقبة Celery)

```bash
pip install flower
celery -A celery_app flower
```

ثم افتح: http://localhost:5555

### Redis Commander (واجهة مراقبة Redis)

```bash
npm install -g redis-commander
redis-commander
```

ثم افتح: http://localhost:8081

---

## 🧪 الاختبار

### اختبار Celery

```bash
# مهمة تجريبية
python -c "from celery_app import debug_task; print(debug_task.delay().get())"
```

### اختبار Redis

```javascript
const { cacheSet, cacheGet } = require('./config/redis');

// اختبار
await cacheSet('test_key', { message: 'Hello Redis!' }, 60);
const result = await cacheGet('test_key');
console.log(result); // { message: 'Hello Redis!' }
```

### اختبار النماذج

```javascript
const MLModel = require('./models/MLModel');

// إنشاء نموذج تجريبي
const model = await MLModel.createModel({
  modelType: 'content_based',
  version: '1.0.0',
  metrics: {
    accuracy: 0.85,
    precision: 0.82,
    recall: 0.88,
    f1Score: 0.85
  }
});

console.log('Model created:', model.getSummary());
```

---

## 📝 الخطوات التالية

الآن بعد إكمال المهمة 1، يمكن الانتقال إلى:

- **المهمة 2**: جمع وإعداد البيانات
  - إنشاء Data Collection Service
  - Feature Engineering
  - إنشاء user-item matrix

- **المهمة 3**: تنفيذ توصيات الوظائف الأساسية
  - Content-Based Filtering
  - شرح التوصيات
  - Property tests

---

## 🔗 الموارد

- [Celery Documentation](https://docs.celeryproject.org/)
- [Redis Documentation](https://redis.io/documentation)
- [scikit-learn Documentation](https://scikit-learn.org/)
- [spaCy Documentation](https://spacy.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

## ✅ قائمة التحقق

- [x] إنشاء Recommendation Model
- [x] إنشاء UserInteraction Model
- [x] إنشاء ProfileAnalysis Model
- [x] إنشاء MLModel Model
- [x] إعداد Python environment
- [x] تثبيت المكتبات (scikit-learn, pandas, numpy, spaCy)
- [x] إعداد Redis للتخزين المؤقت
- [x] إعداد Celery للمهام الخلفية
- [x] إنشاء مهام Celery الأساسية
- [x] إنشاء التوثيق الشامل

---

**تاريخ الإنجاز**: 2026-02-28  
**الحالة**: ✅ مكتمل  
**المهمة التالية**: المهمة 2 - جمع وإعداد البيانات
