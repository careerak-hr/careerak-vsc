# 📚 توثيق API نظام التوصيات الذكية (AI)

## 📋 معلومات الوثيقة
- **اسم الميزة**: نظام التوصيات الذكية (AI)
- **تاريخ الإنشاء**: 2026-02-28
- **الحالة**: ✅ مكتمل ومفعّل
- **الإصدار**: 1.0

---

## 📑 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المصادقة](#المصادقة)
3. [نماذج البيانات](#نماذج-البيانات)
4. [API Endpoints](#api-endpoints)
5. [أمثلة الاستخدام](#أمثلة-الاستخدام)
6. [رموز الأخطاء](#رموز-الأخطاء)
7. [أفضل الممارسات](#أفضل-الممارسات)

---

## 🎯 نظرة عامة

نظام التوصيات الذكية يوفر توصيات مخصصة للوظائف، الدورات، والمرشحين باستخدام:
- **Content-Based Filtering**: تحليل التشابه بين الملف الشخصي والوظائف
- **Collaborative Filtering**: التعلم من سلوك المستخدمين المشابهين
- **Hybrid Approach**: دمج النهجين للحصول على أفضل النتائج
- **Explainable AI**: شرح واضح لسبب كل توصية

### الميزات الرئيسية
- ✅ توصيات وظائف مخصصة (0-100%)
- ✅ تحليل فجوات المهارات
- ✅ توصيات دورات لسد الفجوات
- ✅ ترتيب ذكي للمرشحين
- ✅ إشعارات فورية للتطابقات
- ✅ تحسين مستمر للدقة
- ✅ دعم كامل للعربية والإنجليزية

---

## 🔐 المصادقة

جميع endpoints تتطلب مصادقة JWT.

### Headers المطلوبة
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Accept-Language: ar  # أو en للإنجليزية
```

### الحصول على Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---


## 📊 نماذج البيانات

### 1. Recommendation Model

نموذج التوصيات المولدة للمستخدمين.

```javascript
{
  recommendationId: UUID,
  userId: ObjectId,              // المستخدم المستهدف
  itemType: String,              // 'job' | 'course' | 'candidate'
  itemId: ObjectId,              // العنصر الموصى به
  score: Number,                 // 0-100 (درجة التطابق)
  confidence: Number,            // 0-1 (ثقة النموذج)
  reasons: [{                    // أسباب التوصية (Explainable AI)
    type: String,                // 'skills' | 'experience' | 'education' | ...
    message: String,             // الرسالة بالعربية/الإنجليزية
    strength: String,            // 'high' | 'medium' | 'low'
    details: Object              // تفاصيل إضافية
  }],
  features: Object,              // الميزات المستخدمة
  modelVersion: String,          // إصدار النموذج
  metadata: {
    algorithm: String,           // 'content_based' | 'collaborative' | 'hybrid'
    ranking: Number,             // الترتيب
    seen: Boolean,               // تم المشاهدة؟
    clicked: Boolean,            // تم النقر؟
    applied: Boolean             // تم التقديم؟
  },
  expiresAt: Date,               // تاريخ انتهاء الصلاحية (7 أيام)
  createdAt: Date,
  updatedAt: Date
}
```

### 2. UserInteraction Model

نموذج تتبع تفاعلات المستخدم مع التوصيات.

```javascript
{
  userId: ObjectId,              // المستخدم
  itemType: String,              // 'job' | 'course' | 'candidate'
  itemId: ObjectId,              // العنصر
  action: String,                // 'view' | 'like' | 'apply' | 'ignore' | 'save'
  duration: Number,              // مدة المشاهدة (ثواني)
  timestamp: Date,               // وقت التفاعل
  context: {
    sourcePage: String,          // 'recommendations' | 'search' | ...
    displayType: String,         // 'list' | 'card' | 'detailed' | ...
    position: Number,            // موقع العنصر في القائمة
    originalScore: Number,       // درجة التطابق الأصلية
    metadata: Object             // معلومات إضافية
  },
  session: {
    sessionId: String,
    deviceType: String,          // 'desktop' | 'mobile' | 'tablet'
    browser: String,
    platform: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3. ProfileAnalysis Model

نموذج تحليل الملف الشخصي.

```javascript
{
  userId: ObjectId,
  completenessScore: Number,     // 0-100 (درجة الاكتمال)
  completenessLevel: String,     // 'very_poor' | 'poor' | 'fair' | 'good' | 'excellent'
  completenessDetails: {
    basic: { score, filled, total, percentage },
    education: { score, filled, total, percentage },
    experience: { score, filled, total, percentage },
    skills: { score, filled, total, percentage },
    training: { score, filled, total, percentage },
    additional: { score, filled, total, percentage }
  },
  strengthScore: Number,         // 0-100 (درجة القوة)
  strengths: [{
    category: String,
    title: String,
    description: String,
    impact: String               // 'low' | 'medium' | 'high'
  }],
  weaknesses: [{
    category: String,
    title: String,
    description: String,
    impact: String,
    missingFields: [{ field, label }]
  }],
  suggestions: [{
    category: String,
    priority: String,            // 'low' | 'medium' | 'high'
    title: String,
    description: String,
    action: String,
    estimatedImpact: Number,     // التأثير المتوقع
    completed: Boolean,
    completedAt: Date
  }],
  analyzedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---


## 🔌 API Endpoints

### 1. توصيات الوظائف

#### 1.1 الحصول على توصيات الوظائف

```http
GET /api/recommendations/jobs
```

**Query Parameters**:
- `limit` (optional): عدد التوصيات (افتراضي: 20)
- `minScore` (optional): الحد الأدنى للدرجة 0-1 (افتراضي: 0.5)

**Response**:
```json
{
  "success": true,
  "message": "تم توليد التوصيات بنجاح",
  "recommendations": [
    {
      "job": {
        "_id": "65abc123...",
        "title": "مطور Full Stack",
        "company": "شركة التقنية",
        "location": "القاهرة، مصر",
        "description": "...",
        "requirements": "..."
      },
      "matchScore": {
        "percentage": 85,
        "overall": 0.85,
        "components": {
          "skills": 0.90,
          "experience": 0.80,
          "education": 0.85
        }
      },
      "reasons": [
        {
          "type": "skills",
          "message": "لديك 8 من 10 مهارات مطلوبة",
          "strength": "high",
          "details": {
            "matchedSkills": ["JavaScript", "React", "Node.js", ...]
          }
        }
      ],
      "aiAnalysis": {
        "score": 0.87,
        "strengths": { ... }
      }
    }
  ],
  "total": 15,
  "userProfile": {
    "skills": 12,
    "experience": 3,
    "education": 2
  }
}
```

#### 1.2 حساب درجة التطابق مع وظيفة محددة

```http
GET /api/recommendations/jobs/:jobId/match
```

**Response**:
```json
{
  "success": true,
  "message": "تم حساب درجة التطابق بنجاح",
  "job": {
    "id": "65abc123...",
    "title": "مطور Full Stack",
    "company": "شركة التقنية",
    "location": "title": "Docker للمبتدئين",
      "description": "...",
      "category": "programming",
      "level": "beginner",
      "duration": "20 ساعة",
      "rating": 4.8,
      "price": "مجاني",
      "url": "https://udemy.com/docker-basics",
      "matchScore": 95,
      "employmentImprovement": 25
    }
  ]
}
```

---

"تم توليد 10 توصيات دورات بناءً على 5 مهارات مفقودة",
    "topRecommendations": [ ... ]
  },
  "metadata": {
    "generatedAt": "2026-02-28T10:30:00Z",
    "algorithm": "hybrid",
    "version": "1.0"
  }
}
```

#### 4.2 توصيات دورات سريعة

```http
GET /api/recommendations/courses/quick
```

**Query Parameters**:
- `limit` (optional): عدد الدورات (افتراضي: 5)

**Response**:
```json
{
  "success": true,
  "message": "تم توليد توصيات سريعة للدورات",
  "courseRecommendations": [
    {
      "id": "course_001",
     on": "مسار شامل لتطوير مهارات البرمجة المطلوبة",
      "totalDuration": "120 ساعة",
      "estimatedCompletion": "3-4 أشهر",
      "courses": [ ... ],
      "milestones": [
        {
          "week": 1,
          "title": "أساسيات Docker",
          "skills": ["Docker", "Containers"],
          "courses": ["Docker للمبتدئين"]
        }
      ]
    }
  ],
  "employmentImprovement": {
    "overall": 35,
    "byCategory": {
      "programming": 25,
      "database": 10
    }
  },
  "report": {
    "summary": y.com/docker-basics",
      "matchScore": 95,
      "relevance": 90,
      "employmentImprovement": {
        "percentage": 25,
        "expectedOutcomes": [
          "زيادة فرص التوظيف بنسبة 25%",
          "إتقان مهارة Docker المطلوبة في 4 وظائف"
        ]
      },
      "metadata": {
        "skillCoverage": 80,
        "completionRate": 75,
        "marketDemand": 90
      }
    }
  ],
  "learningPaths": [
    {
      "category": "programming",
      "title": "مسار تطوير مهارات البرمجة",
      "descripti      "description": "تعلم أساسيات Docker وContainerization",
      "category": "programming",
      "level": "beginner",
      "levelDescription": "مناسب للمبتدئين",
      "levelSuitability": "ممتاز",
      "recommendedLevel": "beginner",
      "skills": ["Docker", "Containers", "DevOps"],
      "matchedSkills": ["Docker"],
      "duration": "20 ساعة",
      "instructor": "محمد أحمد",
      "rating": 4.8,
      "studentsCount": 15000,
      "price": "مجاني",
      "platform": "Udemy",
      "url": "https://udems": true,
  "message": "تم توليد توصيات الدورات بنجاح",
  "user": {
    "id": "65abc123...",
    "name": "أحمد محمد",
    "currentSkills": 12,
    "experience": 3
  },
  "targetJobs": [
    {
      "id": "65abc456...",
      "title": "مطور Full Stack",
      "company": "شركة التقنية"
    }
  ],
  "skillGapAnalysis": {
    "totalMissingSkills": 5,
    "criticalGaps": 2,
    "estimatedTimeToClose": "3-6 أشهر"
  },
  "courseRecommendations": [
    {
      "id": "course_001",
      "title": "Docker للمبتدئين",
ة 75%"
    ],
    "longTermDevelopment": [
      "تطوير مهارات programming بشكل شامل"
    ]
  }
}
```

---

### 4. توصيات الدورات

#### 4.1 الحصول على توصيات الدورات

```http
GET /api/recommendations/courses
```

**Query Parameters**:
- `jobIds` (optional): معرفات الوظائف المستهدفة (array)
- `targetJobTitles` (optional): عناوين الوظائف المستهدفة (array)
- `limit` (optional): عدد الدورات (افتراضي: 10)
- `includeLearningPaths` (optional): تضمين مسارات تعليمية (افتراضي: true)

**Response**:
```json
{
  "succesker",
        "category": "programming",
        "priority": "0.95",
        "frequency": 4,
        "jobs": ["مطور Full Stack", "مهندس DevOps", "مطور Backend"]
      }
    ],
    "skillDistribution": {
      "programming": 3,
      "database": 2,
      "web": 2,
      "soft": 1
    }
  },
  "courseRecommendations": [ ... ],
  "similarJobsAnalysis": [ ... ],
  "improvementPlan": {
    "immediateActions": [
      "تعلم Docker - مطلوب في 4 وظائف"
    ],
    "shortTermGoals": [
      "تحسين Kubernetes - يزيد فرصك بنسب: "65abc123...",
    "title": "مطور Full Stack",
    "company": "شركة التقنية",
    "location": "القاهرة، مصر"
  },
  "analysis": {
    "userSkills": 12,
    "jobSkills": 15,
    "missingSkills": 5,
    "overallCoverage": 67,
    "coverageLevel": "جيد",
    "criticalGaps": 2,
    "topMissingSkills": ["Docker", "Kubernetes", "AWS", "CI/CD", "GraphQL"],
    "estimatedTimeToCloseGaps": "3-6 أشهر"
  },
  "aggregatedAnalysis": {
    "totalMissingSkills": 8,
    "topPrioritySkills": [
      {
        "name": "Doc "suggestion": "أضف 3 مهارات على الأقل لتحسين فرصك",
        "action": "update_skills"
      }
    ]
  }
}
```

---

### 3. تحليل فجوات المهارات

#### 3.1 تحليل فجوات المهارات

```http
GET /api/recommendations/skill-gaps
```

**Query Parameters**:
- `jobId` (optional): معرف الوظيفة المستهدفة
- `targetJobTitle` (optional): عنوان الوظيفة المستهدفة
- `limit` (optional): عدد الوظائف المشابهة (افتراضي: 5)

**Response**:
```json
{
  "success": true,
  "message": "تم تحليل فجوات المهارات بنجاح",
  "targetJob": {
    "id"ة",
        "years": 5
      }
    ],
    "improvementAreas": [
      {
        "type": "skills",
        "message": "يمكنك تحسين فرصك بتعلم هذه المهارات",
        "skills": ["Docker", "Kubernetes", "AWS"],
        "priority": "high"
      }
    ],
    "skillGaps": [
      {
        "jobTitle": "مطور Full Stack Senior",
        "missingSkills": ["Docker", "Kubernetes"],
        "matchScore": 0.75
      }
    ],
    "recommendations": [
      {
        "category": "skills",
        "priority": "high",
       يل الملف الشخصي

```http
GET /api/recommendations/profile-analysis
```

**Response**:
```json
{
  "success": true,
  "message": "تم تحليل الملف الشخصي بنجاح",
  "analysis": {
    "profileCompleteness": {
      "percentage": 75,
      "filledFields": 9,
      "totalFields": 12,
      "level": "جيد"
    },
    "strengths": [
      {
        "type": "skills",
        "message": "لديك مجموعة متنوعة من المهارات",
        "count": 12
      },
      {
        "type": "experience",
        "message": "لديك 5 سنوات من الخبر]
}
```

#### 1.3 الحصول على التوصيات المحفوظة

```http
GET /api/recommendations/saved
```

**Query Parameters**:
- `limit` (optional): عدد التوصيات (افتراضي: 20)
- `minScore` (optional): الحد الأدنى للدرجة 0-100 (افتراضي: 30)
- `excludeSeen` (optional): استبعاد المشاهدة (افتراضي: false)

**Response**:
```json
{
  "success": true,
  "message": "تم جلب التوصيات المحفوظة",
  "recommendations": [ ... ],
  "total": 15,
  "source": "database"  // أو "generated"
}
```

---

### 2. تحليل الملف الشخصي

#### 2.1 تحل "القاهرة، مصر"
  },
  "matchScore": {
    "percentage": 85,
    "overall": 0.85,
    "components": {
      "skills": 0.90,
      "experience": 0.80,
      "education": 0.85,
      "location": 1.00
    }
  },
  "reasons": [
    {
      "type": "skills",
      "message": "لديك 8 من 10 مهارات مطلوبة",
      "strength": "high"
    }
  ],
  "aiAnalysis": {
    "score": 0.87,
    "components": { ... },
    "reasons": [ ... ]
  },
  "recommendations": [
    "أضف مهارة Docker لتحسين فرصك",
    "خبرتك في React ممتازة"
  