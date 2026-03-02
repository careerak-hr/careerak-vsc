# 🚀 دليل البدء السريع - نظام ترتيب المرشحين الذكي

## ⚡ البدء في 5 دقائق

### 1. التثبيت (مكتمل بالفعل ✅)

النظام جاهز للاستخدام! جميع الملفات موجودة في:
- `backend/src/services/candidateRankingService.js`
- `backend/src/controllers/candidateRankingController.js`
- `backend/src/routes/candidateRankingRoutes.js`

### 2. الاستخدام الأساسي

#### أ. ترتيب المرشحين لوظيفة

```bash
curl -X POST http://localhost:5000/api/recommendations/candidates/rank \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "507f1f77bcf86cd799439011",
    "limit": 20,
    "minScore": 30
  }'
```

#### ب. الحصول على المرشحين المرتبين

```bash
curl http://localhost:5000/api/recommendations/candidates?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### ج. إحصائيات الترتيب

```bash
curl http://localhost:5000/api/recommendations/candidates/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 فهم النتائج

### مثال على الاستجابة

```json
{
  "success": true,
  "data": {
    "topCandidates": [
      {
        "candidate": {
          "firstName": "أحمد",
          "lastName": "محمد",
          "email": "ahmed@example.com"
        },
        "matchScore": 85,
        "confidence": 0.8,
        "reasons": [
          {
            "type": "skills",
            "message": "تطابق قوي في المهارات (90%)",
            "strength": "high"
          },
          {
            "type": "experience",
            "message": "خبرة عملية قوية (5+ سنوات)",
            "strength": "high"
          }
        ]
      }
    ]
  }
}
```

### تفسير الدرجات

- **90-100**: تطابق ممتاز ⭐⭐⭐⭐⭐
- **70-89**: تطابق قوي ⭐⭐⭐⭐
- **50-69**: تطابق جيد ⭐⭐⭐
- **30-49**: تطابق متوسط ⭐⭐
- **0-29**: تطابق ضعيف ⭐

---

## 🧪 الاختبار

```bash
cd backend
npm test -- candidateRanking.test.js
```

**النتيجة المتوقعة**: ✅ 10/10 اختبارات نجحت

---

## 🔧 التخصيص السريع

### تغيير الحد الأدنى للدرجة

```javascript
// في candidateRankingController.js
const result = await rankCandidatesForJob(jobId, {
  minScore: 40  // بدلاً من 30
});
```

### تغيير عدد المرشحين

```javascript
const result = await rankCandidatesForJob(jobId, {
  limit: 100  // بدلاً من 50
});
```

---

## 🐛 استكشاف الأخطاء

### "Job not found"
- تحقق من أن `jobId` صحيح
- تحقق من وجود الوظيفة في قاعدة البيانات

### "No candidates found"
- تحقق من وجود مرشحين (Employees) في النظام
- خفّض `minScore` لرؤية المزيد من النتائج

### "Unauthorized"
- تحقق من token المصادقة
- تحقق من أن المستخدم هو HR أو Admin

---

## 📚 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/AI_CANDIDATE_RANKING.md` - دليل شامل
- 📄 `.kiro/specs/ai-recommendations/` - المواصفات الكاملة

---

## ✅ قائمة التحقق

- [x] النظام مثبت ويعمل
- [x] جميع الاختبارات نجحت (10/10)
- [x] API endpoints جاهزة
- [x] التوثيق متوفر
- [ ] اختبار على بيانات حقيقية
- [ ] تكامل مع Frontend

---

**وقت القراءة**: 5 دقائق  
**وقت التنفيذ**: 2 دقيقة  
**الحالة**: جاهز للاستخدام ✅
