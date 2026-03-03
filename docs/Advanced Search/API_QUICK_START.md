# نظام الفلترة والبحث المتقدم - دليل البدء السريع

## 🚀 البدء في 5 دقائق

هذا الدليل يساعدك على البدء باستخدام APIs نظام البحث المتقدم بسرعة.

---

## 1. المصادقة (30 ثانية)

### الحصول على Token

```bash
curl -X POST https://careerak.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

احفظ الـ token - ستحتاجه في جميع الطلبات!

---

## 2. البحث البسيط (1 دقيقة)

### البحث عن وظائف

```bash
curl -X GET "https://careerak.com/api/search/jobs?q=developer&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### في JavaScript

```javascript
const searchJobs = async (query) => {
  const response = await fetch(
    `https://careerak.com/api/search/jobs?q=${query}&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  console.log('Results:', data.data.results);
};

searchJobs('developer');
```

---

## 3. البحث مع فلاتر (2 دقيقة)

### مثال كامل

```javascript
const searchWithFilters = async () => {
  const params = new URLSearchParams({
    q: 'developer',
    location: 'Cairo',
    salaryMin: 5000,
    salaryMax: 15000,
    skills: 'JavaScript,React',
    skillsLogic: 'AND',
    workType: 'full-time,remote',
    page: 1,
    limit: 20
  });
  
  const response = await fetch(
    `https://careerak.com/api/search/jobs?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data.data.results;
};
```

---

## 4. الاقتراحات التلقائية (1 دقيقة)

```javascript
const getAutocomplete = async (query) => {
  if (query.length < 3) return [];
  
  const response = await fetch(
    `https://careerak.com/api/search/autocomplete?q=${query}&type=jobs`
  );
  
  const data = await response.json();
  return data.data.suggestions;
};

// Usage
getAutocomplete('dev').then(suggestions => {
  console.log(suggestions);
  // ['developer', 'development', 'devops engineer', ...]
});
```

---

## 5. حفظ عملية بحث (30 ثانية)

```javascript
const saveSearch = async () => {
  const response = await fetch('https://careerak.com/api/search/saved', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Cairo Developer Jobs',
      searchType: 'jobs',
      searchParams: {
        q: 'developer',
        location: 'Cairo'
      },
      alertEnabled: true,
      alertFrequency: 'daily'
    })
  });
  
  const data = await response.json();
  console.log('Saved:', data.data);
};
```

---

## 📚 الخطوات التالية

الآن أنت جاهز! إليك ما يمكنك فعله:

1. **استكشف التوثيق الكامل**: `API_DOCUMENTATION.md`
2. **جرب المزيد من الفلاتر**: skills, experienceLevel, datePosted
3. **فعّل التنبيهات**: احصل على إشعارات للوظائف الجديدة
4. **استخدم Map Search**: ابحث جغرافياً على الخريطة

---

## 🔗 روابط مفيدة

- [التوثيق الكامل](./API_DOCUMENTATION.md)
- [أمثلة متقدمة](./API_DOCUMENTATION.md#أمثلة-الاستخدام)
- [معالجة الأخطاء](./API_DOCUMENTATION.md#معالجة-الأخطاء)
- [Best Practices](./API_DOCUMENTATION.md#best-practices)

---

**تاريخ الإنشاء**: 2026-03-03  
**الحالة**: مكتمل ✅

