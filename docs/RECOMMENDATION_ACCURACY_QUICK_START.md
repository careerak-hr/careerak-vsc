# 🎯 تحسين دقة التوصيات - دليل البدء السريع

## ⚡ البدء في 5 دقائق

### 1. تحليل دقة المستخدم (Frontend)

```javascript
// في أي مكون React
const checkAccuracy = async () => {
  const response = await fetch('/api/recommendations/accuracy', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { data } = await response.json();
  
  console.log('الدقة:', data.accuracy.overall);
  console.log('المستوى:', data.level.label);
  console.log('الاقتراحات:', data.improvements);
};
```

### 2. تشغيل التحليل والتحسين (Backend)

```bash
# تحليل وتحسين الدقة
npm run accuracy:improve
```

### 3. جدولة تلقائية (Cron)

```bash
# كل يوم الساعة 2 صباحاً
0 2 * * * cd /path/to/backend && npm run accuracy:improve
```

---

## 📊 فهم النتائج

### مستويات الدقة

| الدقة | المستوى | الإجراء |
|-------|---------|---------|
| 75%+ | ممتاز ✅ | استمر! |
| 60-75% | جيد 👍 | يمكن التحسين |
| 45-60% | مقبول ⚠️ | يحتاج تحسين |
| < 45% | ضعيف ❌ | تدخل فوري |

### مثال على النتيجة

```json
{
  "accuracy": {
    "overall": 0.68,           // 68% دقة
    "interactionRate": 0.71    // 71% معدل تفاعل
  },
  "level": {
    "level": "good",
    "label": "جيد"
  },
  "improvements": [
    {
      "message": "تفاعل مع المزيد من التوصيات",
      "expectedImprovement": "+15-20% في الدقة"
    }
  ]
}
```

---

## 🔧 API Endpoints السريعة

### دقة المستخدم
```http
GET /api/recommendations/accuracy?period=30
```

### تتبع التحسن
```http
GET /api/recommendations/accuracy/improvement?periods=7,14,30
```

### دقة النظام (Admin)
```http
GET /api/recommendations/accuracy/system?sampleSize=100
```

---

## 🚀 نصائح سريعة

### لتحسين الدقة:

1. ✅ **تفاعل أكثر**: إعجاب، حفظ، تقديم
2. ✅ **أكمل ملفك**: أضف مهارات وخبرات
3. ✅ **حدّث النماذج**: شغّل `npm run accuracy:improve`
4. ✅ **راقب الاتجاهات**: تحقق من التحسن أسبوعياً

### لحل المشاكل:

```bash
# دقة منخفضة؟
npm run model:update:retrain

# لا توجد بيانات؟
# تحتاج 10+ توصيات و 5+ تفاعلات

# الدقة لا تتحسن؟
# جدول التحليل تلقائياً (Cron)
```

---

## 📈 مثال كامل (React Component)

```jsx
import { useState, useEffect } from 'react';

function AccuracyDashboard() {
  const [accuracy, setAccuracy] = useState(null);
  
  useEffect(() => {
    fetchAccuracy();
  }, []);
  
  const fetchAccuracy = async () => {
    const response = await fetch('/api/recommendations/accuracy', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const { data } = await response.json();
    setAccuracy(data);
  };
  
  if (!accuracy) return <div>جاري التحميل...</div>;
  
  return (
    <div className="accuracy-dashboard">
      <h2>دقة التوصيات</h2>
      
      <div className="accuracy-score">
        <span className="score">
          {(accuracy.accuracy.overall * 100).toFixed(0)}%
        </span>
        <span className={`level ${accuracy.level.level}`}>
          {accuracy.level.label}
        </span>
      </div>
      
      <p>{accuracy.level.message}</p>
      
      <div className="improvements">
        <h3>اقتراحات التحسين:</h3>
        {accuracy.improvements.map((imp, i) => (
          <div key={i} className={`improvement ${imp.priority}`}>
            <p>{imp.message}</p>
            <small>{imp.expectedImprovement}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 الأهداف المطلوبة

- ✅ دقة النظام > 75%
- ✅ معدل التفاعل > 60%
- ✅ < 15% مستخدمين بدقة ضعيفة
- ✅ تحسن شهري +5%

---

## 📚 المزيد من المعلومات

للتوثيق الكامل، راجع:
- 📄 [RECOMMENDATION_ACCURACY_IMPROVEMENT.md](./RECOMMENDATION_ACCURACY_IMPROVEMENT.md)

---

**تاريخ الإنشاء**: 2026-02-27  
**الحالة**: ✅ جاهز للاستخدام
