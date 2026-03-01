# 💡 أمثلة الاستخدام - نظام التوصيات الذكية

## 📋 معلومات الوثيقة
- **الجزء**: 3 من 3
- **تاريخ الإنشاء**: 2026-02-28
- **الحالة**: ✅ مكتمل

---

## 🔍 أمثلة عملية

### مثال 1: الحصول على توصيات وظائف مخصصة

```javascript
// Frontend - React/JavaScript
const getJobRecommendations = async () => {
  try {
    const response = await fetch('/api/recommendations/jobs?limit=10&minScore=0.7', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'ar'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`تم العثور على ${data.total} توصية`);
      data.recommendations.forEach(rec => {
        console.log(`${rec.job.title} - ${rec.matchScore.percentage}%`);
        console.log(`الأسباب: ${rec.reasons.map(r => r.message).join(', ')}`);
      });
    }
  } catch (error) {
    console.error('خطأ في جلب التوصيات:', error);
  }
};
```

### مثال 2: حساب التطابق مع وظيفة محددة

```javascript
const calculateJobMatch = async (jobId) => {
  try {
    const response = await fetch(`/api/recommendations/jobs/${jobId}/match`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`درجة التطابق: ${data.matchScore.percentage}%`);
      console.log('المكونات:');
      console.log(`- المهارات: ${data.matchScore.components.skills * 100}%`);
      console.log(`- الخبرة: ${data.matchScore.components.experience * 100}%`);
      console.log(`- التعليم: ${data.matchScore.components.education * 100}%`);
      
      console.log('\nالأسباب:');
      data.reasons.forEach(reason => {
        console.log(`- ${reason.message} (${reason.strength})`);
      });
    }
  } catch (error) {
    console.error('خطأ في حساب التطابق:', error);
  }
};
```

### مثال 3: تحليل فجوات المهارات

```javascript
const analyzeSkillGaps = async (jobId) => {
  try {
    const response = await fetch(`/api/recommendations/skill-gaps?jobId=${jobId}&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`تغطية المهارات: ${data.analysis.overallCoverage}%`);
      console.log(`المهارات المفقودة: ${data.analysis.missingSkills}`);
      console.log(`الوقت المتوقع لسد الفجوات: ${data.analysis.estimatedTimeToCloseGaps}`);
      
      console.log('\nأهم المهارات المفقودة:');
      data.aggregatedAnalysis.topPrioritySkills.forEach(skill => {
        console.log(`- ${skill.name} (أولوية: ${skill.priority}, تكرار: ${skill.frequency})`);
      });
      
      console.log('\nخطة التحسين:');
      console.log('إجراءات فورية:', data.improvementPlan.immediateActions);
      console.log('أهداف قصيرة المدى:', data.improvementPlan.shortTermGoals);
    }
  } catch (error) {
    console.error('خطأ في تحليل فجوات المهارات:', error);
  }
};
```

### مثال 4: الحصول على توصيات دورات

```javascript
const getCourseRecommendations = async (jobIds) => {
  try {
    const queryParams = new URLSearchParams({
      jobIds: jobIds.join(','),
      limit: 10,
      includeLearningPaths: true
    });

    const response = await fetch(`/api/recommendations/courses?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`تم العثور على ${data.courseRecommendations.length} دورة`);
      
      data.courseRecommendations.forEach(course => {
        console.log(`\n${course.title}`);
        console.log(`- الفئة: ${course.category}`);
        console.log(`- المستوى: ${course.level}`);
        console.log(`- المدة: ${course.duration}`);
        console.log(`- درجة التطابق: ${course.matchScore}%`);
        console.log(`- تحسين فرص التوظيف: ${course.employmentImprovement.percentage}%`);
        console.log(`- المهارات: ${course.skills.join(', ')}`);
      });
      
      if (data.learningPaths && data.learningPaths.length > 0) {
        console.log('\n=== مسارات تعليمية مقترحة ===');
        data.learningPaths.forEach(path => {
          console.log(`\n${path.title}`);
          console.log(`- المدة الإجمالية: ${path.totalDuration}`);
          console.log(`- الوقت المتوقع للإكمال: ${path.estimatedCompletion}`);
          console.log(`- عدد الدورات: ${path.courses.length}`);
        });
      }
    }
  } catch (error) {
    console.error('خطأ في جلب توصيات الدورات:', error);
  }
};
```

### مثال 5: فلترة المرشحين (للشركات)

```javascript
const filterCandidates = async (filters) => {
  try {
    const queryParams = new URLSearchParams({
      jobId: filters.jobId,
      skills: filters.skills.join(','),
      minExperience: filters.minExperience,
      location: filters.location,
      minScore: filters.minScore || 30,
      limit: filters.limit || 50,
      sortBy: filters.sortBy || 'score'
    });

    const response = await fetch(`/api/recommendations/candidates/filter?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`تم العثور على ${data.candidates.length} مرشح`);
      console.log(`متوسط الدرجة: ${data.stats.averageScore}%`);
      
      data.candidates.forEach(candidate => {
        console.log(`\n${candidate.candidate.firstName} ${candidate.candidate.lastName}`);
        console.log(`- درجة التطابق: ${candidate.matchScore}%`);
        console.log(`- الخبرة: ${candidate.features.totalExperience} سنوات`);
        console.log(`- المهارات: ${candidate.features.skillsCount}`);
        console.log(`- الموقع: ${candidate.features.location}`);
        
        console.log('الأسباب:');
        candidate.reasons.forEach(reason => {
          console.log(`  - ${reason.message} (${reason.strength})`);
        });
      });
    }
  } catch (error) {
    console.error('خطأ في فلترة المرشحين:', error);
  }
};

// استخدام
filterCandidates({
  jobId: '65abc123...',
  skills: ['JavaScript', 'React', 'Node.js'],
  minExperience: 3,
  location: 'القاهرة',
  minScore: 70,
  limit: 25,
  sortBy: 'score'
});
```

### مثال 6: إرسال إشعارات فورية

```javascript
const notifyNewMatches = async (jobId) => {
  try {
    const response = await fetch('/api/recommendations/notify-matches', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId: jobId,
        minScore: 70
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`تم إرسال ${data.stats.notified} إشعار`);
      console.log(`تم تقييم ${data.stats.evaluated} مستخدم`);
      console.log(`تم العثور على ${data.stats.matched} تطابق`);
      console.log(`متوسط الدرجة: ${data.stats.averageScore}%`);
      
      console.log('\nأفضل التطابقات:');
      data.topMatches.forEach(match => {
        console.log(`- درجة التطابق: ${match.matchScore}%`);
        console.log(`  الأسباب: ${match.topReasons.join(', ')}`);
      });
    }
  } catch (error) {
    console.error('خطأ في إرسال الإشعارات:', error);
  }
};
```

### مثال 7: تسجيل تفاعل مع توصية

```javascript
const recordFeedback = async (jobId, action, rating = null) => {
  try {
    const response = await fetch('/api/recommendations/feedback', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId: jobId,
        action: action,  // 'like', 'apply', 'ignore', 'save'
        rating: rating,
        comments: 'وظيفة ممتازة'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('تم تسجيل التفاعل بنجاح');
      console.log(`الإجراء: ${data.feedback.action}`);
      console.log(`الوقت: ${data.feedback.timestamp}`);
    }
  } catch (error) {
    console.error('خطأ في تسجيل التفاعل:', error);
  }
};
```

### مثال 8: قياس دقة التوصيات

```javascript
const checkAccuracy = async () => {
  try {
    const response = await fetch('/api/recommendations/accuracy?itemType=job&period=30', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`دقة التوصيات: ${data.data.accuracy.overall}%`);
      console.log(`المستوى: ${data.data.accuracy.level}`);
      console.log(`الوصف: ${data.data.accuracy.description}`);
      
      console.log('\nالتفصيل حسب نطاق الدرجة:');
      Object.entries(data.data.breakdown.byScoreRange).forEach(([range, stats]) => {
        console.log(`- ${range}: ${stats.count} توصية، دقة ${stats.accuracy}%`);
      });
      
      console.log('\nالاقتراحات:');
      data.data.suggestions.forEach(suggestion => {
        console.log(`- [${suggestion.priority}] ${suggestion.message}`);
      });
    }
  } catch (error) {
    console.error('خطأ في قياس الدقة:', error);
  }
};
```

---

## ❌ رموز الأخطاء

### أخطاء المصادقة (401)

```json
{
  "success": false,
  "message": "غير مصرح - يجب تسجيل الدخول",
  "error": "Unauthorized"
}
```

### أخطاء الصلاحيات (403)

```json
{
  "success": false,
  "message": "ليس لديك صلاحية للوصول إلى هذا المورد",
  "error": "Forbidden"
}
```

### أخطاء البيانات المفقودة (404)

```json
{
  "success": false,
  "message": "المستخدم غير موجود",
  "error": "Not Found"
}
```

### أخطاء البيانات غير الصحيحة (400)

```json
{
  "success": false,
  "message": "يجب تحديد معيار واحد على الأقل للفلترة",
  "error": "Bad Request",
  "details": {
    "required": ["jobId", "skills", "minExperience", "location"],
    "provided": []
  }
}
```

### أخطاء الخادم (500)

```json
{
  "success": false,
  "message": "حدث خطأ في توليد التوصيات",
  "error": "Internal Server Error",
  "details": "Database connection failed"
}
```

---

## ✅ أفضل الممارسات

### 1. استخدام التخزين المؤقت

```javascript
// تخزين التوصيات مؤقتاً لتقليل الطلبات
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق
let cachedRecommendations = null;
let cacheTimestamp = null;

const getRecommendations = async () => {
  const now = Date.now();
  
  if (cachedRecommendations && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRecommendations;
  }
  
  const response = await fetch('/api/recommendations/jobs');
  const data = await response.json();
  
  cachedRecommendations = data;
  cacheTimestamp = now;
  
  return data;
};
```

### 2. معالجة الأخطاء بشكل صحيح

```javascript
const safeApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'حدث خطأ في الطلب');
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطأ في API:', error);
    
    // عرض رسالة للمستخدم
    showErrorMessage(error.message);
    
    // إرجاع قيمة افتراضية
    return { success: false, error: error.message };
  }
};
```

### 3. استخدام Pagination

```javascript
const getAllRecommendations = async () => {
  const allRecommendations = [];
  let page = 1;
  const limit = 20;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(
      `/api/recommendations/jobs?limit=${limit}&page=${page}`
    );
    const data = await response.json();
    
    if (data.success && data.recommendations.length > 0) {
      allRecommendations.push(...data.recommendations);
      page++;
      hasMore = data.recommendations.length === limit;
    } else {
      hasMore = false;
    }
  }
  
  return allRecommendations;
};
```

### 4. تحديث التوصيات بشكل دوري

```javascript
// تحديث التوصيات كل 10 دقائق
const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000;

const setupAutoRefresh = () => {
  setInterval(async () => {
    try {
      const data = await getRecommendations();
      updateUI(data.recommendations);
    } catch (error) {
      console.error('خطأ في التحديث التلقائي:', error);
    }
  }, AUTO_REFRESH_INTERVAL);
};
```

### 5. تتبع التفاعلات

```javascript
// تتبع جميع التفاعلات لتحسين التوصيات
const trackInteraction = async (jobId, action) => {
  try {
    await fetch('/api/recommendations/feedback', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobId: jobId,
        action: action,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // تسجيل الخطأ بدون إزعاج المستخدم
    console.error('خطأ في تتبع التفاعل:', error);
  }
};

// استخدام
document.getElementById('likeButton').addEventListener('click', () => {
  trackInteraction(jobId, 'like');
});
```

---

## 📚 موارد إضافية

### التوثيق الكامل
- 📄 `AI_RECOMMENDATIONS_API_DOCUMENTATION.md` - التوثيق الرئيسي
- 📄 `AI_RECOMMENDATIONS_API_ENDPOINTS.md` - جميع Endpoints
- 📄 `AI_RECOMMENDATIONS_API_EXAMPLES.md` - أمثلة عملية (هذا الملف)
- 📄 `AI_RECOMMENDATIONS_MODELS_DOCUMENTATION.md` - توثيق النماذج

### الأدلة السريعة
- 📄 `AI_RECOMMENDATIONS_QUICK_START.md` - دليل البدء السريع
- 📄 `RECOMMENDATION_ACCURACY_QUICK_START.md` - دليل قياس الدقة
- 📄 `TRACKING_OPT_OUT_QUICK_START.md` - دليل إيقاف التتبع

### التقارير
- 📄 `AI_RECOMMENDATIONS_IMPLEMENTATION_SUMMARY.md` - ملخص التنفيذ
- 📄 `AI_RECOMMENDATIONS_IMPROVEMENT_SUMMARY.md` - ملخص التحسينات

---

**تاريخ الإنشاء**: 2026-02-28  
**آخر تحديث**: 2026-02-28  
**الحالة**: ✅ مكتمل ومفعّل

