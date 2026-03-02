# 🎯 نظام ترتيب المرشحين الذكي (AI Candidate Ranking)

## 📋 معلومات النظام
**تاريخ الإضافة**: 2026-02-26  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 3.1, 3.2 (ترتيب تلقائي للمرشحين حسب التطابق)  
**Property**: Property 9 - Candidate Ranking Accuracy

---

## 🎯 نظرة عامة

نظام ترتيب ذكي يستخدم خوارزميات Machine Learning لمطابقة المرشحين مع الوظائف المنشورة، مع حساب درجة التطابق (0-100%) وتقديم أسباب واضحة للتوصية (Explainable AI).

---

## 🏗️ البنية التقنية

### الملفات الأساسية

```
backend/src/
├── services/
│   └── candidateRankingService.js      # خدمة الترتيب الذكي
├── controllers/
│   └── candidateRankingController.js   # معالج طلبات API
├── routes/
│   └── candidateRankingRoutes.js       # مسارات API
└── models/
    ├── User.js                          # نموذج المستخدم (Individual)
    ├── JobPosting.js                    # نموذج الوظيفة
    └── Recommendation.js                # نموذج التوصيات

tests/
└── candidateRanking.test.js            # اختبارات (10/10 ✅)
```

---

## 🧮 خوارزمية الترتيب

### 1. استخراج الميزات (Feature Extraction)

#### من ملف المرشح:
- **المهارات** (40%): computerSkills, softwareSkills, otherSkills
- **الخبرة** (30%): سنوات الخبرة، المسميات الوظيفية، نوع العمل
- **التعليم** (20%): أعلى مؤهل تعليمي
- **الموقع** (10%): المدينة، الدولة

#### من الوظيفة:
- الكلمات المفتاحية من العنوان والوصف والمتطلبات
- الموقع، نوع العمل، الراتب

### 2. حساب التطابق (Match Calculation)

```javascript
// الدرجة الإجمالية = مجموع الأوزان
totalScore = (skillsMatch * 0.4) + 
             (experienceMatch * 0.3) + 
             (educationMatch * 0.2) + 
             (locationMatch * 0.1)
```

### 3. توليد الأسباب (Explainable AI)

لكل تطابق، يتم توليد أسباب واضحة:
- نوع السبب: skills, experience, education, location
- الرسالة: شرح واضح بالعربية
- القوة: high, medium, low
- التفاصيل: بيانات إضافية

---

## 📡 API Endpoints

### 1. ترتيب المرشحين لوظيفة معينة

```http
POST /api/recommendations/candidates/rank
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobId": "507f1f77bcf86cd799439011",
  "limit": 50,
  "minScore": 30,
  "saveRecommendations": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "507f1f77bcf86cd799439011",
    "jobTitle": "Senior JavaScript Developer",
    "totalCandidates": 150,
    "matchedCandidates": 45,
    "topCandidates": [
      {
        "candidate": { /* بيانات المرشح */ },
        "matchScore": 85,
        "confidence": 0.8,
        "reasons": [
          {
            "type": "skills",
            "message": "تطابق قوي في المهارات (90%)",
            "strength": "high",
            "details": { "score": 90 }
          },
          {
            "type": "experience",
            "message": "خبرة عملية قوية (5+ سنوات)",
            "strength": "high",
            "details": { "years": 6 }
          }
        ],
        "breakdown": {
          "skills": 36,
          "experience": 30,
          "education": 15,
          "location": 4
        }
      }
    ],
    "timestamp": "2026-02-26T10:30:00.000Z"
  }
}
```

### 2. الحصول على المرشحين المرتبين

```http
GET /api/recommendations/candidates?limit=20&minScore=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "candidate": { /* بيانات المرشح */ },
      "matchScore": 85,
      "confidence": 0.8,
      "reasons": [ /* الأسباب */ ],
      "breakdown": { /* التفصيل */ },
      "ranking": 1,
      "createdAt": "2026-02-26T10:00:00.000Z"
    }
  ]
}
```

### 3. المرشحين المرتبين لوظيفة معينة

```http
GET /api/recommendations/candidates/job/:jobId?refresh=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `refresh=true`: إعادة حساب الترتيب
- `limit=20`: عدد المرشحين
- `minScore=30`: الحد الأدنى للدرجة

### 4. إحصائيات الترتيب

```http
GET /api/recommendations/candidates/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCandidates": 45,
    "avgScore": 62.5,
    "maxScore": 95,
    "minScore": 32,
    "highScoreCandidates": 12,
    "mediumScoreCandidates": 25,
    "lowScoreCandidates": 8
  }
}
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
cd backend
npm test -- candidateRanking.test.js
```

### النتائج

```
✓ should extract skills from candidate profile
✓ should calculate total experience correctly
✓ should identify highest education level
✓ should extract keywords from job posting
✓ should give high score for perfect match
✓ should give low score for poor match
✓ should include reasons for the match
✓ should provide score breakdown
✓ should rank candidates with higher scores first
✓ should maintain consistent ranking across multiple evaluations

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

---

## 📊 Property 9: Candidate Ranking Accuracy

**Property Statement:**  
*For any job posting, candidates should be ranked such that those with higher match scores appear first.*

**Validation:**
- ✅ المرشحون يُرتبون تنازلياً حسب الدرجة
- ✅ الترتيب ثابت عبر تقييمات متعددة
- ✅ المرشح الأفضل يحصل على درجة > 50
- ✅ المرشح الضعيف يحصل على درجة < 40

---

## 💡 أمثلة الاستخدام

### مثال 1: ترتيب المرشحين لوظيفة

```javascript
const { rankCandidatesForJob } = require('./services/candidateRankingService');

const result = await rankCandidatesForJob('507f1f77bcf86cd799439011', {
  limit: 50,
  minScore: 30,
  saveRecommendations: true
});

console.log(`Found ${result.matchedCandidates} matching candidates`);
console.log(`Top candidate score: ${result.topCandidates[0].matchScore}`);
```

### مثال 2: الحصول على التوصيات المحفوظة

```javascript
const { getRankedCandidatesFromRecommendations } = require('./services/candidateRankingService');

const candidates = await getRankedCandidatesFromRecommendations(companyId, {
  limit: 20,
  minScore: 40
});

candidates.forEach((item, index) => {
  console.log(`${index + 1}. ${item.candidate.firstName} - Score: ${item.matchScore}`);
});
```

---

## 🎨 تفسير الدرجات

| الدرجة | التفسير | الإجراء الموصى به |
|--------|---------|-------------------|
| 90-100 | تطابق ممتاز | اتصل فوراً |
| 70-89 | تطابق قوي | أولوية عالية |
| 50-69 | تطابق جيد | مراجعة دقيقة |
| 30-49 | تطابق متوسط | احتياطي |
| 0-29 | تطابق ضعيف | تجاهل |

---

## 🔧 التخصيص

### تعديل الأوزان

يمكن تعديل أوزان المعايير في `candidateRankingService.js`:

```javascript
// الأوزان الحالية
scores.skills = skillsScore * 0.4;      // 40%
scores.experience = expMatch.score * 0.3; // 30%
scores.education = eduMatch.score * 0.2;  // 20%
scores.location = locMatch.score * 0.1;   // 10%
```

### إضافة معايير جديدة

1. أضف استخراج الميزة في `extractCandidateFeatures`
2. أضف حساب التطابق في `calculateMatchScore`
3. أضف الوزن المناسب
4. حدّث الاختبارات

---

## 🚀 التحسينات المستقبلية

### المرحلة 1 (قصيرة المدى)
- [ ] إضافة Collaborative Filtering
- [ ] تحسين استخراج الكلمات المفتاحية (NLP)
- [ ] دعم اللغة العربية في التحليل

### المرحلة 2 (متوسطة المدى)
- [ ] تدريب نموذج ML على البيانات الفعلية
- [ ] A/B Testing لمقارنة الخوارزميات
- [ ] تحليل سلوك الشركات (Behavioral Learning)

### المرحلة 3 (طويلة المدى)
- [ ] Deep Learning للتحليل المتقدم
- [ ] توصيات استباقية (Proactive Recommendations)
- [ ] تكامل مع LinkedIn API

---

## 📈 مؤشرات الأداء (KPIs)

| المؤشر | الهدف | الحالي |
|--------|-------|--------|
| دقة الترتيب | > 75% | - |
| معدل النقر (CTR) | > 15% | - |
| معدل التوظيف | > 25% | - |
| رضا الشركات | > 4.5/5 | - |

---

## 🔒 الأمان والخصوصية

- ✅ جميع endpoints محمية بـ authentication
- ✅ الشركات يمكنها فقط رؤية توصياتها
- ✅ بيانات المرشحين مشفرة
- ✅ لا يتم مشاركة البيانات مع أطراف ثالثة

---

## 📚 المراجع

- [Content-Based Filtering](https://en.wikipedia.org/wiki/Recommender_system#Content-based_filtering)
- [Explainable AI](https://en.wikipedia.org/wiki/Explainable_artificial_intelligence)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)

---

## 🤝 المساهمة

لإضافة ميزات جديدة أو تحسينات:

1. اقرأ التوثيق الكامل
2. أضف اختبارات للميزة الجديدة
3. تأكد من نجاح جميع الاختبارات
4. حدّث التوثيق

---

**تاريخ الإنشاء**: 2026-02-26  
**آخر تحديث**: 2026-02-26  
**الحالة**: مكتمل ✅
