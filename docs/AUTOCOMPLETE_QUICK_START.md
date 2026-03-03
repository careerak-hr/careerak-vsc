# دليل البدء السريع - الاقتراحات التلقائية

## 🚀 البدء في 5 دقائق

### 1. API Endpoint

```
GET /api/search/autocomplete?q=jav&type=jobs&limit=10
```

### 2. المعاملات

| المعامل | النوع | مطلوب | الافتراضي | الوصف |
|---------|-------|-------|-----------|-------|
| `q` | string | ✅ | - | نص البحث (3 أحرف على الأقل) |
| `type` | string | ❌ | `jobs` | نوع البحث: `jobs` أو `courses` |
| `limit` | number | ❌ | `10` | عدد الاقتراحات |

### 3. مثال سريع (cURL)

```bash
# بدون تسجيل دخول
curl "http://localhost:5000/api/search/autocomplete?q=jav&type=jobs&limit=5"

# مع تسجيل دخول
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/search/autocomplete?q=jav&type=jobs&limit=5"
```

### 4. مثال React

```jsx
import { useState, useEffect } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/search/autocomplete?q=${query}&type=jobs&limit=10`
      );
      const data = await res.json();
      setSuggestions(data.data.suggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث..."
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 5. الاستجابة

```json
{
  "success": true,
  "data": {
    "suggestions": [
      "JavaScript Developer",
      "JavaScript Engineer",
      "React Developer"
    ],
    "query": "jav",
    "type": "jobs"
  }
}
```

### 6. القواعد المهمة

- ✅ الحد الأدنى: 3 أحرف
- ✅ يعمل بدون تسجيل دخول
- ✅ نتائج أفضل مع تسجيل الدخول
- ✅ يدعم العربية والإنجليزية
- ✅ يتجاهل الوظائف المغلقة

### 7. الاختبار

```bash
cd backend
npm test -- autocomplete-simple.test.js
```

---

**للتوثيق الكامل**: انظر `docs/AUTOCOMPLETE_IMPLEMENTATION.md`
