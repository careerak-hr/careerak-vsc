# دليل البدء السريع - نظام تحليل الملف الشخصي

## ⚡ البدء السريع (5 دقائق)

### 1. تحليل الملف الشخصي

```bash
# طلب تحليل جديد
curl -X GET http://localhost:5000/api/profile-analysis/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. الحصول على آخر تحليل

```bash
curl -X GET http://localhost:5000/api/profile-analysis/latest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. تتبع التقدم

```bash
curl -X GET http://localhost:5000/api/profile-analysis/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 استخدام في Frontend

### React Hook

```jsx
import { useState, useEffect } from 'react';

export const useProfileAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile-analysis/analyze', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalysis(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLatest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile-analysis/latest', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalysis(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, error, analyze, getLatest };
};
```

### استخدام Hook

```jsx
function ProfilePage() {
  const { analysis, loading, analyze, getLatest } = useProfileAnalysis();

  useEffect(() => {
    getLatest();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <button onClick={analyze}>تحليل جديد</button>
      
      {analysis && (
        <div>
          <h2>درجة الاكتمال: {analysis.completenessScore}%</h2>
          <h3>نقاط القوة: {analysis.strengths.length}</h3>
          <h3>الاقتراحات: {analysis.suggestions.length}</h3>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 مكونات UI جاهزة

### مكون درجة الاكتمال

```jsx
function CompletenessScore({ score, level }) {
  const getColor = (score) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 75) return '#3b82f6'; // blue
    if (score >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="completeness-score">
      <svg width="120" height="120">
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="10"
          strokeDasharray={`${score * 3.14} 314`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="score-text">
        <span className="score">{score}%</span>
        <span className="level">{level}</span>
      </div>
    </div>
  );
}
```

### مكون الاقتراحات

```jsx
function SuggestionsList({ suggestions, onComplete }) {
  return (
    <div className="suggestions-list">
      {suggestions.map((suggestion) => (
        <div key={suggestion._id} className="suggestion-card">
          <div className="suggestion-header">
            <h4>{suggestion.title}</h4>
            <span className={`priority ${suggestion.priority}`}>
              {suggestion.priority}
            </span>
          </div>
          <p className="description">{suggestion.description}</p>
          <p className="action">{suggestion.action}</p>
          <div className="suggestion-footer">
            <span className="impact">
              +{suggestion.estimatedImpact} نقطة
            </span>
            {!suggestion.completed && (
              <button onClick={() => onComplete(suggestion._id)}>
                تم الإكمال ✓
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 CSS جاهز

```css
.profile-analysis {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.completeness-score {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 20px auto;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.level {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.suggestion-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.priority.high {
  background: #fee2e2;
  color: #dc2626;
}

.priority.medium {
  background: #fef3c7;
  color: #d97706;
}

.priority.low {
  background: #dbeafe;
  color: #2563eb;
}

.suggestion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.impact {
  color: #10b981;
  font-weight: 600;
}
```

---

## 🔍 استكشاف الأخطاء

### "User not found"
```bash
# تأكد من أن المستخدم موجود ومن نوع Employee
# تحقق من token صحيح
```

### "No analysis found"
```bash
# قم بإجراء تحليل جديد أولاً
curl -X GET http://localhost:5000/api/profile-analysis/analyze \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### "Unauthorized"
```bash
# تأكد من إرسال token صحيح
# تحقق من أن token لم ينتهي
```

---

## 📊 مثال كامل

```jsx
import { useState, useEffect } from 'react';

function ProfileAnalysisPage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // جلب آخر تحليل
      const analysisRes = await fetch('/api/profile-analysis/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analysisData = await analysisRes.json();
      setAnalysis(analysisData.data);

      // جلب التقدم
      const progressRes = await fetch('/api/profile-analysis/progress', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const progressData = await progressRes.json();
      setProgress(progressData.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeNow = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile-analysis/analyze', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalysis(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeSuggestion = async (suggestionId) => {
    try {
      await fetch(`/api/profile-analysis/suggestions/${suggestionId}/complete`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData(); // إعادة تحميل البيانات
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className="profile-analysis-page">
      <header>
        <h1>تحليل الملف الشخصي</h1>
        <button onClick={analyzeNow}>تحليل جديد</button>
      </header>

      {analysis && (
        <>
          {/* درجة الاكتمال */}
          <section className="completeness-section">
            <h2>درجة الاكتمال</h2>
            <CompletenessScore 
              score={analysis.completenessScore}
              level={analysis.completenessLevel}
            />
          </section>

          {/* التقدم */}
          {progress && (
            <section className="progress-section">
              <h2>التقدم</h2>
              <div className="progress-stats">
                <div className="stat">
                  <span className="label">التحسن في الاكتمال</span>
                  <span className="value">
                    +{progress.improvement.completeness}%
                  </span>
                </div>
                <div className="stat">
                  <span className="label">الاقتراحات المكتملة</span>
                  <span className="value">
                    {progress.suggestions.completed}/{progress.suggestions.total}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* نقاط القوة */}
          <section className="strengths-section">
            <h2>نقاط القوة ({analysis.strengths.length})</h2>
            {analysis.strengths.map((strength, index) => (
              <div key={index} className="strength-card">
                <h3>{strength.title}</h3>
                <p>{strength.description}</p>
              </div>
            ))}
          </section>

          {/* الاقتراحات */}
          <section className="suggestions-section">
            <h2>اقتراحات للتحسين ({analysis.suggestions.length})</h2>
            <SuggestionsList 
              suggestions={analysis.suggestions}
              onComplete={completeSuggestion}
            />
          </section>
        </>
      )}
    </div>
  );
}
```

---

## ✅ Checklist

- [ ] تثبيت التبعيات
- [ ] إضافة المسار إلى app.js
- [ ] اختبار API endpoints
- [ ] إنشاء مكونات UI
- [ ] إضافة CSS
- [ ] اختبار على المتصفح
- [ ] اختبار على الموبايل

---

**تاريخ الإنشاء**: 2026-02-27  
**الحالة**: ✅ جاهز للاستخدام
