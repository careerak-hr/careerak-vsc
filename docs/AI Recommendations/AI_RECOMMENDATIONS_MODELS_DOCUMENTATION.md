# 📊 توثيق النماذج - نظام التوصيات الذكية

## 📋 معلومات الوثيقة
- **تاريخ الإنشاء**: 2026-02-28
- **الحالة**: ✅ مكتمل ومفعّل
- **الإصدار**: 1.0

---

## 📑 جدول المحتويات

1. [Recommendation Model](#1-recommendation-model)
2. [UserInteraction Model](#2-userinteraction-model)
3. [ProfileAnalysis Model](#3-profileanalysis-model)
4. [MLModel Model](#4-mlmodel-model)
5. [الفهارس والأداء](#الفهارس-والأداء)
6. [العلاقات بين النماذج](#العلاقات-بين-النماذج)

---

## 1. Recommendation Model

### الوصف
نموذج التوصيات المولدة للمستخدمين (وظائف، دورات، مرشحين) مع نسب التطابق وأسباب التوصية (Explainable AI).

### الموقع
`backend/src/models/Recommendation.js`

### Schema

```javascript
{
  // المستخدم المستهدف
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // نوع العنصر الموصى به
  itemType: {
    type: String,
    enum: ['job', 'course', 'candidate'],
    required: true,
    index: true
  },
  
  // العنصر الموصى به (مرجع ديناميكي)
  itemId: {
    type: ObjectId,
    required: true,
    index: true,
    refPath: 'itemType'
  },
  
  // درجة التطابق (0-100)
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  
  // ثقة النموذج في التوصية (0-1)
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  
  // أسباب التوصية (Explainable AI)
  reasons: [{
    type: {
      type: String,
      enum: ['skills', 'experience', 'education', 'location', 
             'salary', 'jobType', 'interests', 'behavior'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    strength: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    details: {
      type: Mixed,
      default: {}
    }
  }],
  
  // الميزات المستخدمة في التوصية
  features: {
    type: Mixed,
    default: {}
  },
  
  // إصدار النموذج المستخدم
  modelVersion: {
    type: String,
    default: '1.0'
  },
  
  // معلومات إضافية
  metadata: {
    algorithm: {
      type: String,
      enum: ['content_based', 'collaborative', 'hybrid'],
      default: 'content_based'
    },
    ranking: Number,
    seen: Boolean,
    clicked: Boolean,
    applied: Boolean
  },
  
  // تاريخ انتهاء الصلاحية (TTL: 7 أيام)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    index: { expires: 0 }
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### الفهارس

```javascript
// فهارس مركبة للأداء
{ userId: 1, itemType: 1, score: -1 }
{ userId: 1, 'metadata.seen': 1, score: -1 }
{ itemType: 1, itemId: 1, userId: 1 }  // unique
```

### الطرق

#### Instance Methods

**updateStatus(action)**
- تحديث حالة التوصية (رؤية، نقر، تقديم)
- Parameters: `action` ('view' | 'click' | 'apply')
- Returns: Promise<Recommendation>

**getFormattedReasons()**
- الحصول على أسباب التوصية بصيغة مقروءة
- Returns: Array<{type, message, strength, icon}>

**isValid()**
- التحقق من صلاحية التوصية
- Returns: Boolean

#### Static Methods

**getUserRecommendations(userId, options)**
- جلب توصيات مستخدم مع فلترة
- Parameters:
  - `userId`: ObjectId
  - `options`: {itemType, limit, minScore, includeSeen, sortBy}
- Returns: Promise<Array<Recommendation>>

**cleanupOldRecommendations(days)**
- حذف التوصيات القديمة
- Parameters: `days` (default: 30)
- Returns: Promise<{deletedCount}>

**updateUserRecommendations(userId, recommendations)**
- تحديث توصيات مستخدم
- Parameters:
  - `userId`: ObjectId
  - `recommendations`: Array<Object>
- Returns: Promise<Array<Recommendation>>

**getRecommendationStats(userId)**
- إحصاءات التوصيات
- Parameters: `userId`: ObjectId
- Returns: Promise<Object>

### أمثلة الاستخدام

```javascript
const Recommendation = require('./models/Recommendation');

// إنشاء توصية جديدة
const recommendation = await Recommendation.create({
  userId: '65abc123...',
  itemType: 'job',
  itemId: '65abc456...',
  score: 85,
  confidence: 0.9,
  reasons: [
    {
      type: 'skills',
      message: 'لديك 8 من 10 مهارات مطلوبة',
      strength: 'high',
      details: { matchedSkills: ['JavaScript', 'React', 'Node.js'] }
    }
  ],
  metadata: {
    algorithm: 'hybrid',
    ranking: 1
  }
});

// جلب توصيات مستخدم
const recommendations = await Recommendation.getUserRecommendations(
  '65abc123...',
  {
    itemType: 'job',
    limit: 20,
    minScore: 70,
    includeSeen: false,
    sortBy: 'score'
  }
);

// تحديث حالة التوصية
await recommendation.updateStatus('view');
await recommendation.updateStatus('click');
await recommendation.updateStatus('apply');

// الحصول على إحصاءات
const stats = await Recommendation.getRecommendationStats('65abc123...');
console.log(stats);
// {
//   job: { count: 15, avgScore: 78, seenCount: 10, clickedCount: 5, appliedCount: 2 },
//   course: { count: 8, avgScore: 82, seenCount: 6, clickedCount: 3, appliedCount: 1 }
// }
```

---

## 2. UserInteraction Model

### الوصف
نموذج تتبع تفاعلات المستخدم مع التوصيات (view, like, apply, ignore, save) مع تتبع مدة المشاهدة والسياق.

### الموقع
`backend/src/models/UserInteraction.js`

### Schema

```javascript
{
  // المستخدم الذي قام بالتفاعل
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // نوع العنصر
  itemType: {
    type: String,
    enum: ['job', 'course', 'candidate'],
    required: true,
    index: true
  },
  
  // العنصر الذي تم التفاعل معه
  itemId: {
    type: ObjectId,
    required: true,
    index: true,
    refPath: 'itemType'
  },
  
  // نوع التفاعل
  action: {
    type: String,
    enum: ['view', 'like', 'apply', 'ignore', 'save'],
    required: true,
    index: true
  },
  
  // مدة المشاهدة (بالثواني)
  duration: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // وقت التفاعل
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // سياق التفاعل
  context: {
    sourcePage: {
      type: String,
      enum: ['recommendations', 'search', 'job_details', 
             'course_details', 'profile', 'home', 'other'],
      default: 'recommendations'
    },
    displayType: {
      type: String,
      enum: ['list', 'card', 'detailed', 'notification', 'email', 'other'],
      default: 'list'
    },
    position: Number,
    originalScore: Number,
    metadata: Mixed
  },
  
  // معلومات الجلسة
  session: {
    sessionId: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'other'],
      default: 'desktop'
    },
    browser: String,
    platform: String
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### الفهارس

```javascript
{ userId: 1, itemType: 1, action: 1, timestamp: -1 }
{ itemType: 1, itemId: 1, action: 1 }
{ userId: 1, 'context.sourcePage': 1, timestamp: -1 }
```

### الطرق

#### Instance Methods

**getFormattedDetails()**
- الحصول على تفاصيل التفاعل بصيغة مقروءة
- Returns: Object

**isPositiveInteraction()**
- التحقق مما إذا كان التفاعل إيجابياً
- Returns: Boolean

**isNegativeInteraction()**
- التحقق مما إذا كان التفاعل سلبياً
- Returns: Boolean

**getInteractionWeight()**
- الحصول على وزن التفاعل للتوصيات
- Returns: Number (-1.0 to 2.0)

#### Static Methods

**logInteraction(userId, itemType, itemId, action, options)**
- تسجيل تفاعل جديد
- Parameters:
  - `userId`: ObjectId
  - `itemType`: String
  - `itemId`: ObjectId
  - `action`: String
  - `options`: Object
- Returns: Promise<UserInteraction>

**getUserInteractions(userId, options)**
- جلب تفاعلات مستخدم مع فلترة
- Returns: Promise<Array<UserInteraction>>

**getUserInteractionStats(userId, options)**
- إحصاءات تفاعلات مستخدم
- Returns: Promise<Object>

**analyzeUserPreferences(userId, options)**
- تحليل تفضيلات المستخدم من التفاعلات
- Returns: Promise<Object>

**calculateConversionRate(userId, options)**
- حساب معدل التحويل (CTR) للمستخدم
- Returns: Promise<Object>

**cleanupOldInteractions(days)**
- حذف التفاعلات القديمة
- Parameters: `days` (default: 90)
- Returns: Promise<{deletedCount}>

### أمثلة الاستخدام

```javascript
const UserInteraction = require('./models/UserInteraction');

// تسجيل تفاعل جديد
const interaction = await UserInteraction.logInteraction(
  '65abc123...',  // userId
  'job',          // itemType
  '65abc456...',  // itemId
  'view',         // action
  {
    duration: 45,
    sourcePage: 'recommendations',
    displayType: 'card',
    position: 3,
    originalScore: 85,
    sessionId: 'session_123',
    deviceType: 'mobile',
    browser: 'Chrome',
    platform: 'Android'
  }
);

// جلب تفاعلات مستخدم
const interactions = await UserInteraction.getUserInteractions(
  '65abc123...',
  {
    itemType: 'job',
    action: 'apply',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    limit: 50
  }
);

// إحصاءات التفاعلات
const stats = await UserInteraction.getUserInteractionStats('65abc123...');
console.log(stats);
// {
//   job: {
//     actions: {
//       view: { count: 50, totalDuration: 1200, avgDuration: 24, avgScore: 75 },
//       like: { count: 15, totalDuration: 0, avgDuration: 0, avgScore: 82 },
//       apply: { count: 5, totalDuration: 0, avgDuration: 0, avgScore: 88 }
//     },
//     totalInteractions: 70,
//     totalDuration: 1200
//   }
// }

// تحليل التفضيلات
const preferences = await UserInteraction.analyzeUserPreferences('65abc123...');
console.log(preferences);
// {
//   likedItems: [...],
//   ignoredItems: [...],
//   positiveCount: 20,
//   negativeCount: 5,
//   lastUpdated: Date
// }

// حساب معدل التحويل
const conversionRate = await UserInteraction.calculateConversionRate('65abc123...');
console.log(conversionRate);
// {
//   viewToLike: 30,
//   viewToApply: 10,
//   viewToSave: 15,
//   likeToApply: 33.3,
//   totalViews: 50,
//   totalLikes: 15,
//   totalApplies: 5,
//   totalSaves: 7
// }
```

---


## 3. ProfileAnalysis Model

### الوصف
نموذج تحليل الملف الشخصي مع درجة الاكتمال، نقاط القوة والضعف، والاقتراحات.

### الموقع
`backend/src/models/ProfileAnalysis.js`

### Schema

```javascript
{
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // درجة الاكتمال (0-100)
  completenessScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // مستوى الاكتمال
  completenessLevel: {
    type: String,
    enum: ['very_poor', 'poor', 'fair', 'good', 'excellent'],
    required: true
  },
  
  // تفاصيل الاكتمال حسب الفئة
  completenessDetails: {
    basic: { score, filled, total, percentage },
    education: { score, filled, total, percentage },
    experience: { score, filled, total, percentage },
    skills: { score, filled, total, percentage },
    training: { score, filled, total, percentage },
    additional: { score, filled, total, percentage }
  },
  
  // درجة القوة الإجمالية (0-100)
  strengthScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // نقاط القوة
  strengths: [{
    category: String,
    title: String,
    description: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  
  // نقاط الضعف
  weaknesses: [{
    category: String,
    title: String,
    description: String,
    impact: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    missingFields: [{
      field: String,
      label: String
    }]
  }],
  
  // الاقتراحات
  suggestions: [{
    category: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    title: String,
    description: String,
    action: String,
    estimatedImpact: Number,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  
  // تاريخ التحليل
  analyzedAt: {
    type: Date,
    default: Date.now
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### الفهارس

```javascript
{ userId: 1, analyzedAt: -1 }
{ completenessScore: -1 }
{ strengthScore: -1 }
```

### أمثلة الاستخدام

```javascript
const ProfileAnalysis = require('./models/ProfileAnalysis');

// إنشاء تحليل جديد
const analysis = await ProfileAnalysis.create({
  userId: '65abc123...',
  completenessScore: 75,
  completenessLevel: 'good',
  completenessDetails: {
    basic: { score: 90, filled: 9, total: 10, percentage: 90 },
    education: { score: 80, filled: 4, total: 5, percentage: 80 },
    experience: { score: 70, filled: 7, total: 10, percentage: 70 },
    skills: { score: 60, filled: 6, total: 10, percentage: 60 },
    training: { score: 50, filled: 2, total: 4, percentage: 50 },
    additional: { score: 40, filled: 2, total: 5, percentage: 40 }
  },
  strengthScore: 78,
  strengths: [
    {
      category: 'skills',
      title: 'مهارات متنوعة',
      description: 'لديك مجموعة متنوعة من المهارات التقنية',
      impact: 'high'
    }
  ],
  weaknesses: [
    {
      category: 'experience',
      title: 'خبرة محدودة',
      description: 'يمكنك تحسين خبرتك العملية',
      impact: 'medium',
      missingFields: [
        { field: 'experienceList', label: 'الخبرات العملية' }
      ]
    }
  ],
  suggestions: [
    {
      category: 'skills',
      priority: 'high',
      title: 'أضف مهارات جديدة',
      description: 'أضف 3 مهارات على الأقل لتحسين فرصك',
      action: 'update_skills',
      estimatedImpact: 15
    }
  ]
});

// جلب آخر تحليل لمستخدم
const latestAnalysis = await ProfileAnalysis.findOne({ 
  userId: '65abc123...' 
})
  .sort({ analyzedAt: -1 })
  .exec();

// تحديث حالة اقتراح
const updatedAnalysis = await ProfileAnalysis.findOneAndUpdate(
  { 
    userId: '65abc123...',
    'suggestions._id': suggestionId
  },
  {
    $set: {
      'suggestions.$.completed': true,
      'suggestions.$.completedAt': new Date()
    }
  },
  { new: true }
);
```

---

## 4. MLModel Model

### الوصف
نموذج معلومات نماذج التعلم الآلي المستخدمة في التوصيات.

### Schema

```javascript
{
  modelId: {
    type: String,
    required: true,
    unique: true
  },
  
  modelType: {
    type: String,
    enum: ['content_based', 'collaborative', 'hybrid'],
    required: true
  },
  
  version: {
    type: String,
    required: true
  },
  
  // مقاييس الأداء
  accuracy: Number,
  precision: Number,
  recall: Number,
  f1Score: Number,
  
  // تاريخ التدريب
  trainingDate: {
    type: Date,
    required: true
  },
  
  // حالة النموذج
  isActive: {
    type: Boolean,
    default: false
  },
  
  // معاملات النموذج
  hyperparameters: {
    type: Mixed,
    default: {}
  },
  
  // الميزات المستخدمة
  features: [String],
  
  createdAt: Date,
  updatedAt: Date
}
```

### أمثلة الاستخدام

```javascript
const MLModel = require('./models/MLModel');

// إنشاء نموذج جديد
const model = await MLModel.create({
  modelId: 'hybrid_v1.2',
  modelType: 'hybrid',
  version: '1.2',
  accuracy: 0.85,
  precision: 0.82,
  recall: 0.88,
  f1Score: 0.85,
  trainingDate: new Date(),
  isActive: true,
  hyperparameters: {
    contentWeight: 0.6,
    collaborativeWeight: 0.4,
    minSimilarity: 0.5
  },
  features: ['skills', 'experience', 'education', 'location']
});

// جلب النموذج النشط
const activeModel = await MLModel.findOne({ 
  isActive: true,
  modelType: 'hybrid'
})
  .sort({ trainingDate: -1 })
  .exec();

// تحديث حالة النموذج
await MLModel.updateMany(
  { modelType: 'hybrid', isActive: true },
  { $set: { isActive: false } }
);

await MLModel.findByIdAndUpdate(
  newModelId,
  { $set: { isActive: true } }
);
```

---

## الفهارس والأداء

### Recommendation Model

```javascript
// فهارس أساسية
userId: 1                                    // للبحث السريع بالمستخدم
itemType: 1                                  // للبحث بنوع العنصر
expiresAt: 1                                 // TTL index للحذف التلقائي

// فهارس مركبة
{ userId: 1, itemType: 1, score: -1 }       // للبحث والترتيب
{ userId: 1, 'metadata.seen': 1, score: -1 } // للتوصيات غير المشاهدة
{ itemType: 1, itemId: 1, userId: 1 }       // unique - منع التكرار
```

### UserInteraction Model

```javascript
// فهارس أساسية
userId: 1                                    // للبحث بالمستخدم
itemType: 1                                  // للبحث بنوع العنصر
action: 1                                    // للبحث بنوع التفاعل
timestamp: 1                                 // للترتيب الزمني

// فهارس مركبة
{ userId: 1, itemType: 1, action: 1, timestamp: -1 }  // للإحصاءات
{ itemType: 1, itemId: 1, action: 1 }                 // للتحليل
{ userId: 1, 'context.sourcePage': 1, timestamp: -1 } // للتتبع
```

### ProfileAnalysis Model

```javascript
// فهارس أساسية
userId: 1                                    // للبحث بالمستخدم
analyzedAt: -1                               // للترتيب الزمني
completenessScore: -1                        // للترتيب بالدرجة
strengthScore: -1                            // للترتيب بالقوة

// فهارس مركبة
{ userId: 1, analyzedAt: -1 }               // لآخر تحليل
```

---

## العلاقات بين النماذج

### Recommendation → User
```javascript
userId: {
  type: ObjectId,
  ref: 'User'
}
```

### Recommendation → Job/Course/Candidate
```javascript
itemId: {
  type: ObjectId,
  refPath: 'itemType'  // مرجع ديناميكي
}
```

### UserInteraction → User
```javascript
userId: {
  type: ObjectId,
  ref: 'User'
}
```

### UserInteraction → Job/Course/Candidate
```javascript
itemId: {
  type: ObjectId,
  refPath: 'itemType'  // مرجع ديناميكي
}
```

### ProfileAnalysis → User
```javascript
userId: {
  type: ObjectId,
  ref: 'User'
}
```

### مخطط العلاقات

```
User
  ├── Recommendation (1:N)
  │   └── Job/Course/Candidate (N:1)
  ├── UserInteraction (1:N)
  │   └── Job/Course/Candidate (N:1)
  └── ProfileAnalysis (1:N)

MLModel (مستقل)
```

---

## أفضل الممارسات

### 1. استخدام الفهارس بشكل صحيح

```javascript
// ✅ جيد - استخدام الفهارس المركبة
const recommendations = await Recommendation.find({
  userId: userId,
  itemType: 'job',
  score: { $gte: 70 }
}).sort({ score: -1 });

// ❌ سيء - بحث بدون فهارس
const recommendations = await Recommendation.find({
  'reasons.message': { $regex: 'مهارات' }
});
```

### 2. استخدام Lean للقراءة فقط

```javascript
// ✅ جيد - lean() للأداء الأفضل
const recommendations = await Recommendation.find({ userId })
  .lean()
  .exec();

// ❌ سيء - بدون lean() عند عدم الحاجة للطرق
const recommendations = await Recommendation.find({ userId });
```

### 3. استخدام Select لتحديد الحقول

```javascript
// ✅ جيد - جلب الحقول المطلوبة فقط
const recommendations = await Recommendation.find({ userId })
  .select('itemId score reasons')
  .lean();

// ❌ سيء - جلب جميع الحقول
const recommendations = await Recommendation.find({ userId });
```

### 4. استخدام Populate بحذر

```javascript
// ✅ جيد - populate مع select
const recommendations = await Recommendation.find({ userId })
  .populate('itemId', 'title company location')
  .lean();

// ❌ سيء - populate بدون select
const recommendations = await Recommendation.find({ userId })
  .populate('itemId');
```

### 5. استخدام Aggregation للإحصاءات

```javascript
// ✅ جيد - aggregation للإحصاءات المعقدة
const stats = await UserInteraction.aggregate([
  { $match: { userId: userId } },
  {
    $group: {
      _id: '$action',
      count: { $sum: 1 },
      avgDuration: { $avg: '$duration' }
    }
  }
]);

// ❌ سيء - جلب جميع البيانات ثم المعالجة
const interactions = await UserInteraction.find({ userId });
const stats = interactions.reduce(...);
```

---

## الصيانة والتنظيف

### تنظيف التوصيات القديمة

```javascript
// تشغيل يومياً
const cleanupRecommendations = async () => {
  const result = await Recommendation.cleanupOldRecommendations(30);
  console.log(`تم حذف ${result.deletedCount} توصية قديمة`);
};
```

### تنظيف التفاعلات القديمة

```javascript
// تشغيل شهرياً
const cleanupInteractions = async () => {
  const result = await UserInteraction.cleanupOldInteractions(90);
  console.log(`تم حذف ${result.deletedCount} تفاعل قديم`);
};
```

### تحديث التحليلات

```javascript
// تشغيل أسبوعياً
const updateAnalyses = async () => {
  const users = await User.find({ accountDisabled: { $ne: true } });
  
  for (const user of users) {
    const analysis = await analyzeUserProfile(user);
    await ProfileAnalysis.create(analysis);
  }
};
```

---

**تاريخ الإنشاء**: 2026-02-28  
**آخر تحديث**: 2026-02-28  
**الحالة**: ✅ مكتمل ومفعّل

