# CV Quality Analyzer Service

## نظرة عامة

خدمة تحليل جودة السيرة الذاتية تقوم بتقييم شامل للسيرة الذاتية وإعطاء درجة من 0 إلى 100.

## الاستخدام السريع

```javascript
const cvQualityAnalyzer = require('./cvQualityAnalyzer');
const cvParserService = require('./cvParserService');

// تحليل CV
const parsedCV = await cvParserService.parseCV(buffer, mimetype);
const qualityAnalysis = cvQualityAnalyzer.analyzeQuality(parsedCV);

console.log('Overall Score:', qualityAnalysis.overallScore);
console.log('Rating:', qualityAnalysis.rating);
console.log('Strengths:', qualityAnalysis.strengths);
console.log('Weaknesses:', qualityAnalysis.weaknesses);
console.log('Recommendations:', qualityAnalysis.recommendations);
```

## معايير التقييم

| المعيار | الوزن | الوصف |
|---------|-------|-------|
| معلومات الاتصال | 10% | البريد، الهاتف، LinkedIn، GitHub |
| المهارات | 25% | عدد وجودة المهارات |
| الخبرات | 30% | عدد الخبرات وسنوات الخبرة |
| التعليم | 20% | المؤهلات التعليمية |
| التنسيق | 10% | طول النص، البنية، التنظيم |
| الاكتمال | 5% | اكتمال جميع الأقسام |

## نظام التقييم

- **90-100**: ممتاز
- **80-89**: جيد جداً
- **70-79**: جيد
- **60-69**: مقبول
- **50-59**: ضعيف
- **0-49**: ضعيف جداً

## API Endpoints

- `POST /api/cv/analyze-quality` - تحليل جودة CV
- `GET /api/cv/quality-analysis` - الحصول على التحليل المحفوظ

## الاختبارات

```bash
npm test -- cvQualityAnalyzer.test.js
```

**النتيجة**: ✅ 24/24 اختبارات نجحت

## التوثيق الكامل

- 📄 `docs/CV_QUALITY_ANALYSIS.md` - دليل شامل
- 📄 `docs/CV_QUALITY_ANALYSIS_QUICK_START.md` - دليل البدء السريع

---

**تاريخ الإنشاء**: 2026-02-27  
**Requirements**: 4.3, 4.4
