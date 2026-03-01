# 🔌 API Endpoints - نظام التوصيات الذكية

## 📋 معلومات الوثيقة
- **الجزء**: 2 من 3
- **تاريخ الإنشاء**: 2026-02-28
- **الحالة**: ✅ مكتمل

---

## 5. توصيات المرشحين (للشركات)

### 5.1 فلترة ذكية للمرشحين

```http
GET /api/recommendations/candidates/filter
```

**Query Parameters**:
- `jobId` (optional): معرف الوظيفة
- `skills` (optional): المهارات المطلوبة (array)
- `minExperience` (optional): الحد الأدنى للخبرة (سنوات)
- `maxExperience` (optional): الحد الأقصى للخبرة (سنوات)
- `location` (optional): الموقع
- `education` (optional): المؤهل التعليمي
- `minScore` (optional): الحد الأدنى للدرجة (افتراضي: 30)
- `limit` (optional): عدد المرشحين (افتراضي: 50)
- `sortBy` (optional): الترتيب حسب (score | experience | education)

**Response**:
```json
{
  "success": true,
  "message": "تم العثور على 25 مرشح مطابق",
  "candidates": [
    {
      "candidate": {
        "_id": "65abc123...",
        "firstName": "أحمد",
        "lastName": "محمد",
        "email": "ahmed@example.com",
        "profileImage": "https://...",
        "city": "القاهرة",
        "country": "مصر",
        "specialization": "تطوير البرمجيات"
      },
      "matchScore": 85,
      "confidence": 0.9,
      "reasons": [
        {
          "type": "skills",
          "message": "يمتلك 8 من 10 مهارات مطلوبة",
          "strength": "high",
          "details": {
            "matchedSkills": ["JavaScript", "React", "Node.js", ...]
          }
        },
        {
          "type": "experience",
          "message": "5 سنوات من الخبرة",
          "strength": "high",
          "details": { "years": 5 }
        },
        {
          "type": "location",
          "message": "موقع مطابق: القاهرة، مصر",
          "strength": "high",
          "details": { "city": "القاهرة", "country": "مصر" }
        }
      ],
      "features": {
        "totalExperience": 5,
        "skillsCount": 12,
        "education": "bachelor",
        "location": "القاهرة, مصر"
      }
    }
  ],
  "stats": {
    "totalEvaluated": 100,
    "totalMatched": 45,
    "totalReturned": 25,
    "averageScore": 78,
    "experienceRange": {
      "min": 2,
      "max": 8,
      "average": 4.5
    },
    "educationDistribution": {
      "bachelor": 15,
      "master": 8,
      "diploma": 2
    }
  },
  "filters": {
    "jobId": "65abc456...",
    "skills": ["JavaScript", "React"],
    "minExperience": 3,
    "maxExperience": null,
    "location": "القاهرة",
    "education": null,
    "minScore": 30,
    "sortBy": "score"
  },
  "timestamp": "2026-02-28T10:30:00Z"
}
```

---

## 6. الإشعارات الفورية

### 6.1 إشعار بتطابقات جديدة (للوظائف)

```http
POST /api/recommendations/notify-matches
```

**Request Body**:
```json
{
  "jobId": "65abc123...",
  "minScore": 70
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم إرسال 15 إشعار فوري بنجاح",
  "job": {
    "id": "65abc123...",
    "title": "مطور Full Stack",
    "company": "شركة التقنية"
  },
  "stats": {
    "evaluated": 100,
    "matched": 25,
    "notified": 15,
    "minScore": 70,
    "averageScore": 82
  },
  "topMatches": [
    {
      "userId": "65abc456...",
      "matchScore": 95,
      "topReasons": [
        "لديك 9 من 10 مهارات مطلوبة",
        "خبرتك 5 سنوات تطابق المطلوب"
      ]
    }
  ]
}
```

### 6.2 إشعار بمرشح مناسب (للشركات)

```http
POST /api/recommendations/notify-candidate-match
```

**Request Body**:
```json
{
  "candidateId": "65abc123...",
  "jobId": "65abc456..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم إرسال الإشعار بنجاح",
  "notification": {
    "id": "65abc789...",
    "type": "new_application",
    "title": "مرشح جديد مناسب",
    "message": "مرشح بدرجة تطابق 85% تقدم لوظيفة مطور Full Stack"
  },
  "match": {
    "candidate": {
      "id": "65abc123...",
      "name": "أحمد محمد",
      "specialization": "تطوير البرمجيات"
    },
    "job": {
      "id": "65abc456...",
      "title": "مطور Full Stack"
    },
    "matchScore": 85,
    "confidence": 0.9,
    "topReasons": [
      "يمتلك 8 من 10 مهارات مطلوبة",
      "5 سنوات من الخبرة",
      "موقع مطابق"
    ]
  }
}
```

### 6.3 إشعار بتحديث التوصيات

```http
POST /api/recommendations/notify-update
```

**Request Body**:
```json
{
  "updateType": "profile_updated",
  "data": {
    "field": "skills",
    "value": ["Docker", "Kubernetes"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم إرسال إشعار التحديث بنجاح",
  "notification": {
    "id": "65abc789...",
    "type": "system",
    "title": "تم تحديث توصياتك",
    "message": "تم تحديث توصياتك بناءً على التغييرات في ملفك الشخصي"
  }
}
```

---

## 7. تسجيل التفاعلات

### 7.1 تسجيل تفاعل مع توصية

```http
POST /api/recommendations/feedback
```

**Request Body**:
```json
{
  "jobId": "65abc123...",
  "action": "like",
  "rating": 5,
  "comments": "وظيفة ممتازة تناسب مهاراتي"
}
```

**Response**:
```json
{
  "success": true,
  "message": "تم تسجيل التفاعل بنجاح",
  "feedback": {
    "userId": "65abc456...",
    "jobId": "65abc123...",
    "action": "like",
    "rating": 5,
    "timestamp": "2026-02-28T10:30:00Z"
  }
}
```

---

## 8. قياس دقة التوصيات

### 8.1 دقة التوصيات للمستخدم

```http
GET /api/recommendations/accuracy
```

**Query Parameters**:
- `itemType` (optional): نوع العنصر (job | course) - افتراضي: job
- `period` (optional): الفترة بالأيام (افتراضي: 30)

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "65abc123...",
    "itemType": "job",
    "period": "30 days",
    "accuracy": {
      "overall": 75.5,
      "level": "جيد",
      "description": "توصيات جيدة، يمكن التحسين"
    },
    "breakdown": {
      "byScoreRange": {
        "90-100": { "count": 5, "accuracy": 90.0 },
        "80-89": { "count": 8, "accuracy": 82.5 },
        "70-79": { "count": 12, "accuracy": 70.0 }
      },
      "byInteractionType": {
        "apply": { "count": 3, "weight": 1.0 },
        "like": { "count": 5, "weight": 0.8 },
        "view": { "count": 15, "weight": 0.3 }
      }
    },
    "suggestions": [
      {
        "priority": "high",
        "message": "زيادة التفاعل مع التوصيات لتحسين الدقة",
        "action": "interact_more"
      }
    ],
    "timestamp": "2026-02-28T10:30:00Z"
  }
}
```

### 8.2 دقة النظام (للأدمن)

```http
GET /api/recommendations/accuracy/system
```

**Query Parameters**:
- `itemType` (optional): نوع العنصر (job | course)
- `period` (optional): الفترة بالأيام
- `sampleSize` (optional): حجم العينة (افتراضي: 100)

**Response**:
```json
{
  "success": true,
  "data": {
    "itemType": "job",
    "period": "30 days",
    "sampleSize": 100,
    "accuracy": {
      "overall": 72.3,
      "level": "جيد",
      "description": "النظام يعمل بشكل جيد"
    },
    "userDistribution": {
      "excellent": 15,
      "good": 45,
      "fair": 30,
      "poor": 10
    },
    "topPerformers": [
      {
        "userId": "65abc123...",
        "accuracy": 95.0,
        "interactions": 50
      }
    ],
    "bottomPerformers": [
      {
        "userId": "65abc456...",
        "accuracy": 35.0,
        "interactions": 5
      }
    ],
    "recommendations": [
      "تحسين خوارزمية التوصيات للمستخدمين الجدد",
      "زيادة التفاعل مع المستخدمين ذوي الدقة المنخفضة"
    ],
    "timestamp": "2026-02-28T10:30:00Z"
  }
}
```

### 8.3 تتبع تحسن الدقة

```http
GET /api/recommendations/accuracy/improvement
```

**Query Parameters**:
- `itemType` (optional): نوع العنصر (job | course)
- `periods` (optional): الفترات بالأيام (مفصولة بفاصلة) - افتراضي: 7,14,30

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "65abc123...",
    "itemType": "job",
    "periods": [7, 14, 30],
    "improvement": {
      "trend": "improving",
      "rate": 5.2,
      "description": "الدقة تتحسن بمعدل 5.2% شهرياً"
    },
    "history": [
      {
        "period": "7 days",
        "accuracy": 78.5,
        "change": "+3.2%"
      },
      {
        "period": "14 days",
        "accuracy": 76.0,
        "change": "+0.5%"
      },
      {
        "period": "30 days",
        "accuracy": 75.5,
        "change": "baseline"
      }
    ],
    "predictions": {
      "next7Days": 80.0,
      "next14Days": 82.5,
      "next30Days": 85.0
    },
    "recommendations": [
      "استمر في التفاعل مع التوصيات",
      "حدّث ملفك الشخصي بانتظام"
    ],
    "timestamp": "2026-02-28T10:30:00Z"
  }
}
```

---

