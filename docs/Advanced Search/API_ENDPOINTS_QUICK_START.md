# دليل البدء السريع - API Endpoints

## 📋 معلومات الوثيقة

- **تاريخ الإنشاء**: 2026-03-03
- **الوقت المتوقع**: 5 دقائق
- **الحالة**: ✅ جاهز للاستخدام

---

## نظرة عامة سريعة

جميع API Endpoints جاهزة ومتاحة على:
- **Base URL**: `http://localhost:5000/api/search`
- **Production**: `https://careerak.com/api/search`

---

## 1. البحث الأساسي (بدون تسجيل دخول)

```bash
# البحث عن وظائف
curl "http://localhost:5000/api/search/jobs?q=developer&location=Cairo"

# البحث مع فلاتر
curl "http://localhost:5000/api/search/jobs?q=developer&salaryMin=5000&jobType=full-time"

# الاقتراحات التلقائية
curl "http://localhost:5000/api/search/autocomplete?q=jav&type=jobs"

# البحث على الخريطة
curl "http://localhost:5000/api/search/map?north=31&south=30&east=32&west=31"
```

---

## 2. حفظ عمليات البحث (يتطلب تسجيل دخول)

```bash
# الحصول على Token
TOKEN="your_jwt_token_here"

# حفظ عملية بحث
curl -X POST "http://localhost:5000/api/search/saved" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cairo Developer Jobs",
    "searchType": "jobs",
    "searchParams": {
      "query": "developer",
      "location": "Cairo",
      "salaryMin": 5000
    }
  }'

# جلب عمليات البحث المحفوظة
curl "http://localhost:5000/api/search/saved" \
  -H "Authorization: Bearer $TOKEN"

# تحديث عملية بحث
curl -X PUT "http://localhost:5000/api/search/saved/SEARCH_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# حذف عملية بحث
curl -X DELETE "http://localhost:5000/api/search/saved/SEARCH_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. التنبيهات الذكية (يتطلب تسجيل دخول)

```bash
# إنشاء تنبيه
curl -X POST "http://localhost:5000/api/search/alerts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "savedSearchId": "SAVED_SEARCH_ID",
    "frequency": "instant",
    "notificationMethod": "push"
  }'

# جلب التنبيهات
curl "http://localhost:5000/api/search/alerts" \
  -H "Authorization: Bearer $TOKEN"

# تحديث تنبيه
curl -X PUT "http://localhost:5000/api/search/alerts/ALERT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "daily",
    "isActive": false
  }'

# حذف تنبيه
curl -X DELETE "http://localhost:5000/api/search/alerts/ALERT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4. أمثلة JavaScript/TypeScript

### البحث الأساسي

```javascript
// البحث عن وظائف
const searchJobs = async (query, filters = {}) => {
  const params = new URLSearchParams({
    q: query,
    ...filters
  });

  const response = await fetch(`/api/search/jobs?${params}`);
  const data = await response.json();
  
  return data.data.results;
};

// استخدام
const jobs = await searchJobs('developer', {
  location: 'Cairo',
  salaryMin: 5000,
  jobType: 'full-time'
});
```

### الاقتراحات التلقائية

```javascript
// Autocomplete مع debounce
import { debounce } from 'lodash';

const getAutocomplete = async (query) => {
  if (query.length < 3) return [];
  
  const response = await fetch(
    `/api/search/autocomplete?q=${query}&type=jobs&limit=5`
  );
  const data = await response.json();
  
  return data.data.suggestions;
};

const debouncedAutocomplete = debounce(getAutocomplete, 300);
```

### حفظ عملية بحث

```javascript
const saveSearch = async (searchData, token) => {
  const response = await fetch('/api/search/saved', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(searchData)
  });
  
  const data = await response.json();
  return data.data;
};

// استخدام
const saved = await saveSearch({
  name: 'My Search',
  searchType: 'jobs',
  searchParams: {
    query: 'developer',
    location: 'Cairo'
  }
}, userToken);
```

### إنشاء تنبيه

```javascript
const createAlert = async (alertData, token) => {
  const response = await fetch('/api/search/alerts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(alertData)
  });
  
  const data = await response.json();
  return data.data;
};

// استخدام
const alert = await createAlert({
  savedSearchId: 'SAVED_SEARCH_ID',
  frequency: 'instant',
  notificationMethod: 'push'
}, userToken);
```

---

## 5. أمثلة React

### مكون البحث

```jsx
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = debounce(async (q) => {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    const response = await fetch(
      `/api/search/autocomplete?q=${q}&type=jobs&limit=5`
    );
    const data = await response.json();
    setSuggestions(data.data.suggestions);
  }, 300);

  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث عن وظيفة..."
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### مكون عمليات البحث المحفوظة

```jsx
import { useState, useEffect } from 'react';

function SavedSearches({ token }) {
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    const response = await fetch('/api/search/saved', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setSearches(data.data);
  };

  const deleteSearch = async (id) => {
    await fetch(`/api/search/saved/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    fetchSavedSearches();
  };

  return (
    <div>
      <h2>عمليات البحث المحفوظة</h2>
      {searches.map((search) => (
        <div key={search._id}>
          <h3>{search.name}</h3>
          <p>النتائج: {search.resultCount}</p>
          <button onClick={() => deleteSearch(search._id)}>
            حذف
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 6. معالجة الأخطاء

```javascript
const searchWithErrorHandling = async (query) => {
  try {
    const response = await fetch(`/api/search/jobs?q=${query}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'حدث خطأ في البحث');
    }
    
    return data.data.results;
  } catch (error) {
    console.error('Search error:', error);
    // عرض رسالة خطأ للمستخدم
    alert('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    return [];
  }
};
```

---

## 7. الاختبار السريع

### اختبار جميع Endpoints

```bash
# 1. البحث الأساسي
curl "http://localhost:5000/api/search/jobs?q=developer"

# 2. Autocomplete
curl "http://localhost:5000/api/search/autocomplete?q=jav&type=jobs"

# 3. Map Search
curl "http://localhost:5000/api/search/map?north=31&south=30&east=32&west=31"

# 4. Saved Search (يتطلب token)
curl "http://localhost:5000/api/search/saved" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Alerts (يتطلب token)
curl "http://localhost:5000/api/search/alerts" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8. استكشاف الأخطاء

### المشكلة: "Unauthorized"
```bash
# تأكد من إرسال token صحيح
curl "http://localhost:5000/api/search/saved" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"
```

### المشكلة: "Maximum 10 saved searches"
```bash
# احذف عملية بحث قديمة أولاً
curl -X DELETE "http://localhost:5000/api/search/saved/OLD_SEARCH_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### المشكلة: "Alert already exists"
```bash
# احذف التنبيه القديم أولاً
curl -X DELETE "http://localhost:5000/api/search/alerts/OLD_ALERT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 9. الخطوات التالية

1. ✅ جرب جميع Endpoints
2. ✅ اقرأ التوثيق الكامل: `API_ENDPOINTS_COMPLETE.md`
3. ✅ راجع أمثلة الكود في `frontend/src/examples/`
4. ✅ شغّل الاختبارات: `npm test -- allSearchEndpoints.test.js`

---

## 10. الموارد

- 📄 التوثيق الكامل: `docs/Advanced Search Filter/API_ENDPOINTS_COMPLETE.md`
- 📄 ملف التصميم: `.kiro/specs/advanced-search-filter/design.md`
- 📄 ملف المتطلبات: `.kiro/specs/advanced-search-filter/requirements.md`
- 📄 ملف المهام: `.kiro/specs/advanced-search-filter/tasks.md`

---

**تاريخ الإنشاء**: 2026-03-03  
**الوقت المتوقع**: 5 دقائق  
**الحالة**: ✅ جاهز للاستخدام
