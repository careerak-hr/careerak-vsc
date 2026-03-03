# نظام الفلترة والبحث المتقدم - توثيق API

## 📋 معلومات الوثيقة

- **اسم الميزة**: نظام الفلترة والبحث المتقدم
- **تاريخ الإنشاء**: 2026-03-03
- **الحالة**: مكتمل
- **الإصدار**: 1.0.0
- **Base URL**: `https://careerak.com/api`

---

## 📑 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المصادقة](#المصادقة)
3. [معالجة الأخطاء](#معالجة-الأخطاء)
4. [Search APIs](#search-apis)
5. [Autocomplete API](#autocomplete-api)
6. [Saved Searches APIs](#saved-searches-apis)
7. [Alerts APIs](#alerts-apis)
8. [Map Search API](#map-search-api)
9. [أمثلة الاستخدام](#أمثلة-الاستخدام)
10. [Rate Limiting](#rate-limiting)
11. [Changelog](#changelog)

---

## نظرة عامة

نظام الفلترة والبحث المتقدم يوفر مجموعة شاملة من APIs للبحث عن الوظائف والدورات التدريبية مع دعم:

- ✅ البحث النصي الذكي (multi-field search)
- ✅ الفلترة المتقدمة (salary, location, skills, etc.)
- ✅ الاقتراحات التلقائية (autocomplete)
- ✅ حفظ عمليات البحث (saved searches)
- ✅ التنبيهات الذكية (alerts)
- ✅ البحث الجغرافي (map search)
- ✅ مطابقة المهارات (skills matching)

### الميزات الرئيسية

- **السرعة**: استجابة < 500ms
- **الدقة**: نتائج مطابقة بدقة عالية
- **المرونة**: دعم فلاتر متعددة
- **الذكاء**: اقتراحات ومطابقة ذكية

---

## المصادقة

جميع endpoints (ما عدا GET العامة) تتطلب مصادقة باستخدام JWT token.

### طريقة المصادقة

```http
Authorization: Bearer <your_jwt_token>
```

### الحصول على Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```


**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

---

## معالجة الأخطاء

### تنسيق الأخطاء القياسي

جميع الأخطاء تُرجع بالتنسيق التالي:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "رسالة خطأ واضحة للمستخدم",
    "details": {}
  }
}
```

### أكواد الأخطاء

| الكود | الوصف | HTTP Status |
|-------|-------|-------------|
| `VALIDATION_ERROR` | خطأ في التحقق من البيانات | 400 |
| `UNAUTHORIZED` | غير مصرح | 401 |
| `NOT_FOUND` | غير موجود | 404 |
| `LIMIT_EXCEEDED` | تجاوز الحد المسموح | 429 |
| `DUPLICATE` | مكرر | 409 |
| `DATABASE_ERROR` | خطأ في قاعدة البيانات | 500 |
| `EXTERNAL_SERVICE_ERROR` | خطأ في خدمة خارجية | 502 |

### أمثلة على الأخطاء

**خطأ في التحقق:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid salary range",
    "details": {
      "field": "salaryMin",
      "value": -1000,
      "constraint": "must be >= 0"
    }
  }
}
```

**غير مصرح:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access denied",
    "details": {
      "reason": "You don't have permission to access this resource"
    }
  }
}
```

---


## Search APIs

### 1. البحث عن الوظائف

البحث الذكي عن الوظائف مع دعم الفلترة المتقدمة.

**Endpoint:**
```http
GET /api/search/jobs
```

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `q` | string | No | كلمة البحث | `developer` |
| `location` | string | No | الموقع (مدينة أو دولة) | `Cairo` |
| `salaryMin` | number | No | الحد الأدنى للراتب | `5000` |
| `salaryMax` | number | No | الحد الأقصى للراتب | `15000` |
| `workType` | string[] | No | نوع العمل | `full-time,remote` |
| `experienceLevel` | string[] | No | مستوى الخبرة | `mid,senior` |
| `skills` | string[] | No | المهارات المطلوبة | `JavaScript,React` |
| `skillsLogic` | string | No | منطق المهارات (AND/OR) | `AND` |
| `datePosted` | string | No | تاريخ النشر | `today,week,month,all` |
| `companySize` | string[] | No | حجم الشركة | `small,medium,large` |
| `page` | number | No | رقم الصفحة (default: 1) | `1` |
| `limit` | number | No | عدد النتائج (default: 20, max: 100) | `20` |
| `sort` | string | No | الترتيب | `relevance,date,salary,match` |

**Request Example:**

```http
GET /api/search/jobs?q=developer&location=Cairo&salaryMin=5000&skills=JavaScript,React&skillsLogic=AND&page=1&limit=20&sort=relevance
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior JavaScript Developer",
        "description": "We are looking for an experienced developer...",
        "company": {
          "name": "Tech Company",
          "logo": "https://cloudinary.com/...",
          "size": "medium"
        },
        "location": {
          "city": "Cairo",
          "country": "Egypt",
          "coordinates": {
            "lat": 30.0444,
            "lng": 31.2357
          }
        },
        "salary": {
          "min": 8000,
          "max": 12000,
          "currency": "USD"
        },
        "workType": "full-time",
        "experienceLevel": "senior",
        "skills": ["JavaScript", "React", "Node.js"],
        "datePosted": "2026-03-01T10:00:00.000Z",
        "matchScore": 85.5,
        "matchReasons": [
          "مطابقة 100% للمهارات المطلوبة",
          "الراتب ضمن النطاق المطلوب",
          "الموقع مطابق"
        ]
      }
    ],
    "total": 45,
    "page": 1,
    "pages": 3,
    "filters": {
      "applied": {
        "q": "developer",
        "location": "Cairo",
        "salaryMin": 5000,
        "skills": ["JavaScript", "React"],
        "skillsLogic": "AND"
      },
      "available": {
        "workTypes": ["full-time", "part-time", "remote", "hybrid"],
        "experienceLevels": ["junior", "mid", "senior", "expert"],
        "companySizes": ["small", "medium", "large"],
        "datePosted": ["today", "week", "month", "all"]
      }
    }
  }
}
```


### 2. البحث عن الدورات

البحث عن الدورات التدريبية مع فلترة متقدمة.

**Endpoint:**
```http
GET /api/search/courses
```

**Query Parameters:**

نفس parameters البحث عن الوظائف، مع إضافة:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `level` | string[] | No | مستوى الدورة | `beginner,intermediate,advanced` |
| `duration` | string | No | مدة الدورة | `short,medium,long` |
| `price` | string | No | السعر | `free,paid` |
| `language` | string[] | No | لغة الدورة | `ar,en,fr` |

**Request Example:**

```http
GET /api/search/courses?q=web+development&level=beginner&price=free&language=ar
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "title": "تطوير الويب للمبتدئين",
        "description": "دورة شاملة لتعلم تطوير الويب من الصفر",
        "instructor": {
          "name": "أحمد محمد",
          "avatar": "https://cloudinary.com/..."
        },
        "level": "beginner",
        "duration": "40 hours",
        "price": 0,
        "language": "ar",
        "skills": ["HTML", "CSS", "JavaScript"],
        "rating": 4.8,
        "studentsCount": 1250,
        "matchScore": 92.0
      }
    ],
    "total": 28,
    "page": 1,
    "pages": 2
  }
}
```

---

## Autocomplete API

### الاقتراحات التلقائية

الحصول على اقتراحات بحث ذكية بناءً على النص المدخل.

**Endpoint:**
```http
GET /api/search/autocomplete
```

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `q` | string | Yes | النص المدخل (min: 3 chars) | `dev` |
| `type` | string | Yes | نوع البحث | `jobs` or `courses` |
| `limit` | number | No | عدد الاقتراحات (default: 10, max: 20) | `10` |

**Request Example:**

```http
GET /api/search/autocomplete?q=dev&type=jobs&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "suggestions": [
      "developer",
      "development",
      "devops engineer",
      "device driver developer",
      "developer advocate"
    ]
  }
}
```

**ملاحظات:**
- يتطلب 3 أحرف على الأقل
- يدعم العربية والإنجليزية
- النتائج مرتبة حسب الشعبية
- لا يتطلب مصادقة

---


## Saved Searches APIs

### 1. حفظ عملية بحث

حفظ عملية بحث لإعادة استخدامها لاحقاً.

**Endpoint:**
```http
POST /api/search/saved
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Cairo Developer Jobs",
  "searchType": "jobs",
  "searchParams": {
    "q": "developer",
    "location": "Cairo",
    "salaryMin": 5000,
    "skills": ["JavaScript", "React"],
    "skillsLogic": "AND"
  },
  "alertEnabled": false,
  "alertFrequency": "instant",
  "notificationMethod": "push"
}
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | اسم عملية البحث (max: 100 chars) |
| `searchType` | string | Yes | نوع البحث (`jobs` or `courses`) |
| `searchParams` | object | Yes | معاملات البحث |
| `alertEnabled` | boolean | No | تفعيل التنبيهات (default: false) |
| `alertFrequency` | string | No | تكرار التنبيهات (default: instant) |
| `notificationMethod` | string | No | طريقة الإشعار (default: push) |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Cairo Developer Jobs",
    "searchType": "jobs",
    "searchParams": {
      "q": "developer",
      "location": "Cairo",
      "salaryMin": 5000,
      "skills": ["JavaScript", "React"],
      "skillsLogic": "AND"
    },
    "alertEnabled": false,
    "resultCount": 45,
    "createdAt": "2026-03-03T10:00:00.000Z",
    "updatedAt": "2026-03-03T10:00:00.000Z"
  }
}
```

**Errors:**

- `LIMIT_EXCEEDED`: تجاوز الحد الأقصى (10 عمليات بحث)
- `DUPLICATE`: اسم مكرر
- `VALIDATION_ERROR`: بيانات غير صحيحة

---

### 2. جلب عمليات البحث المحفوظة

الحصول على قائمة بجميع عمليات البحث المحفوظة للمستخدم.

**Endpoint:**
```http
GET /api/search/saved
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `searchType` | string | No | تصفية حسب النوع (`jobs` or `courses`) |
| `page` | number | No | رقم الصفحة (default: 1) |
| `limit` | number | No | عدد النتائج (default: 10, max: 50) |

**Request Example:**

```http
GET /api/search/saved?searchType=jobs&page=1&limit=10
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "savedSearches": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Cairo Developer Jobs",
        "searchType": "jobs",
        "searchParams": {
          "q": "developer",
          "location": "Cairo"
        },
        "alertEnabled": true,
        "resultCount": 45,
        "lastChecked": "2026-03-03T09:00:00.000Z",
        "createdAt": "2026-03-01T10:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "pages": 1
  }
}
```


### 3. تعديل عملية بحث محفوظة

تحديث عملية بحث محفوظة.

**Endpoint:**
```http
PUT /api/search/saved/:id
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Cairo Senior Developer Jobs",
  "searchParams": {
    "q": "developer",
    "location": "Cairo",
    "experienceLevel": ["senior"]
  },
  "alertEnabled": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Cairo Senior Developer Jobs",
    "searchParams": {
      "q": "developer",
      "location": "Cairo",
      "experienceLevel": ["senior"]
    },
    "alertEnabled": true,
    "updatedAt": "2026-03-03T11:00:00.000Z"
  }
}
```

**Errors:**

- `NOT_FOUND`: عملية البحث غير موجودة
- `UNAUTHORIZED`: ليس لديك صلاحية
- `DUPLICATE`: اسم مكرر

---

### 4. حذف عملية بحث محفوظة

حذف عملية بحث محفوظة.

**Endpoint:**
```http
DELETE /api/search/saved/:id
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Saved search deleted successfully"
}
```

**Errors:**

- `NOT_FOUND`: عملية البحث غير موجودة
- `UNAUTHORIZED`: ليس لديك صلاحية

---

## Alerts APIs

### 1. تفعيل تنبيه

تفعيل تنبيه لعملية بحث محفوظة.

**Endpoint:**
```http
POST /api/search/alerts
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "savedSearchId": "507f1f77bcf86cd799439013",
  "frequency": "daily",
  "notificationMethod": "both"
}
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `savedSearchId` | ObjectId | Yes | معرف عملية البحث المحفوظة |
| `frequency` | string | Yes | التكرار (`instant`, `daily`, `weekly`) |
| `notificationMethod` | string | Yes | الطريقة (`push`, `email`, `both`) |

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "savedSearchId": "507f1f77bcf86cd799439013",
    "frequency": "daily",
    "notificationMethod": "both",
    "isActive": true,
    "createdAt": "2026-03-03T10:00:00.000Z"
  }
}
```

**Errors:**

- `NOT_FOUND`: عملية البحث غير موجودة
- `DUPLICATE`: التنبيه موجود بالفعل
- `VALIDATION_ERROR`: بيانات غير صحيحة


### 2. جلب التنبيهات

الحصول على قائمة بجميع التنبيهات النشطة.

**Endpoint:**
```http
GET /api/search/alerts
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `isActive` | boolean | No | تصفية حسب الحالة |
| `frequency` | string | No | تصفية حسب التكرار |

**Response:**

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "savedSearchId": "507f1f77bcf86cd799439013",
        "savedSearchName": "Cairo Developer Jobs",
        "frequency": "daily",
        "notificationMethod": "both",
        "isActive": true,
        "lastTriggered": "2026-03-03T09:00:00.000Z",
        "triggerCount": 5
      }
    ],
    "total": 3
  }
}
```

---

### 3. تعديل تنبيه

تحديث إعدادات تنبيه.

**Endpoint:**
```http
PUT /api/search/alerts/:id
```

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "frequency": "weekly",
  "notificationMethod": "email",
  "isActive": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "frequency": "weekly",
    "notificationMethod": "email",
    "isActive": true,
    "updatedAt": "2026-03-03T11:00:00.000Z"
  }
}
```

---

### 4. حذف تنبيه

حذف تنبيه.

**Endpoint:**
```http
DELETE /api/search/alerts/:id
```

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

---

## Map Search API

### البحث الجغرافي

البحث عن الوظائف ضمن حدود جغرافية محددة.

**Endpoint:**
```http
GET /api/search/map
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bounds.north` | number | Yes | الحد الشمالي (latitude) |
| `bounds.south` | number | Yes | الحد الجنوبي (latitude) |
| `bounds.east` | number | Yes | الحد الشرقي (longitude) |
| `bounds.west` | number | Yes | الحد الغربي (longitude) |
| `...otherFilters` | mixed | No | فلاتر إضافية (نفس فلاتر البحث العادي) |

**Request Example:**

```http
GET /api/search/map?bounds.north=30.1&bounds.south=29.9&bounds.east=31.3&bounds.west=31.1&q=developer
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "markers": [
      {
        "id": "507f1f77bcf86cd799439011",
        "position": {
          "lat": 30.0444,
          "lng": 31.2357
        },
        "title": "Senior JavaScript Developer",
        "company": "Tech Company",
        "salary": "8000-12000 USD",
        "count": 1
      },
      {
        "id": "cluster_1",
        "position": {
          "lat": 30.0500,
          "lng": 31.2400
        },
        "title": "5 jobs in this area",
        "count": 5,
        "isCluster": true
      }
    ],
    "total": 15
  }
}
```

**ملاحظات:**
- يدعم clustering للعلامات المتقاربة
- يمكن دمجه مع فلاتر البحث العادية
- النتائج محدودة بـ 1000 علامة


---

## أمثلة الاستخدام

### مثال 1: البحث البسيط

```javascript
// Frontend - JavaScript/React
const searchJobs = async (query) => {
  try {
    const response = await fetch(
      `/api/search/jobs?q=${encodeURIComponent(query)}&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Results:', data.data.results);
      console.log('Total:', data.data.total);
    }
  } catch (error) {
    console.error('Search failed:', error);
  }
};

searchJobs('developer');
```

---

### مثال 2: البحث مع فلاتر متعددة

```javascript
const searchWithFilters = async () => {
  const params = new URLSearchParams({
    q: 'developer',
    location: 'Cairo',
    salaryMin: 5000,
    salaryMax: 15000,
    skills: 'JavaScript,React,Node.js',
    skillsLogic: 'AND',
    workType: 'full-time,remote',
    experienceLevel: 'mid,senior',
    datePosted: 'week',
    page: 1,
    limit: 20,
    sort: 'relevance'
  });
  
  const response = await fetch(`/api/search/jobs?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.data.results;
};
```

---

### مثال 3: الاقتراحات التلقائية

```javascript
// مع debouncing
import { debounce } from 'lodash';

const getAutocomplete = async (query) => {
  if (query.length < 3) return [];
  
  const response = await fetch(
    `/api/search/autocomplete?q=${encodeURIComponent(query)}&type=jobs&limit=10`
  );
  
  const data = await response.json();
  return data.data.suggestions;
};

// Debounced version
const debouncedAutocomplete = debounce(async (query, callback) => {
  const suggestions = await getAutocomplete(query);
  callback(suggestions);
}, 300);

// Usage in React
const [suggestions, setSuggestions] = useState([]);

const handleInputChange = (e) => {
  const value = e.target.value;
  debouncedAutocomplete(value, setSuggestions);
};
```

---

### مثال 4: حفظ عملية بحث

```javascript
const saveSearch = async (searchData) => {
  const response = await fetch('/api/search/saved', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'My Favorite Search',
      searchType: 'jobs',
      searchParams: {
        q: 'developer',
        location: 'Cairo',
        skills: ['JavaScript', 'React']
      },
      alertEnabled: true,
      alertFrequency: 'daily',
      notificationMethod: 'push'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Search saved:', data.data);
  } else {
    console.error('Error:', data.error.message);
  }
};
```

---

### مثال 5: تفعيل تنبيه

```javascript
const enableAlert = async (savedSearchId) => {
  const response = await fetch('/api/search/alerts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      savedSearchId: savedSearchId,
      frequency: 'instant',
      notificationMethod: 'both'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Alert enabled:', data.data);
  }
};
```

---

### مثال 6: البحث على الخريطة

```javascript
// مع Google Maps
const searchOnMap = async (map) => {
  const bounds = map.getBounds();
  
  const params = new URLSearchParams({
    'bounds.north': bounds.getNorthEast().lat(),
    'bounds.south': bounds.getSouthWest().lat(),
    'bounds.east': bounds.getNorthEast().lng(),
    'bounds.west': bounds.getSouthWest().lng(),
    q: 'developer'
  });
  
  const response = await fetch(`/api/search/map?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  // Add markers to map
  data.data.markers.forEach(marker => {
    if (marker.isCluster) {
      // Add cluster marker
      addClusterMarker(map, marker);
    } else {
      // Add single job marker
      addJobMarker(map, marker);
    }
  });
};
```


---

## Rate Limiting

لحماية النظام من الإساءة، يتم تطبيق rate limiting على جميع endpoints.

### الحدود

| Endpoint | الحد | النافذة الزمنية |
|----------|------|-----------------|
| `/api/search/jobs` | 30 requests | 1 minute |
| `/api/search/courses` | 30 requests | 1 minute |
| `/api/search/autocomplete` | 60 requests | 1 minute |
| `/api/search/saved` (POST) | 10 requests | 1 hour |
| `/api/search/alerts` (POST) | 10 requests | 1 hour |
| `/api/search/map` | 20 requests | 1 minute |

### Response Headers

عند الاقتراب من الحد، يتم إرجاع headers إضافية:

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1709467200
```

### خطأ تجاوز الحد

```json
{
  "success": false,
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

**HTTP Status:** `429 Too Many Requests`

---

## Best Practices

### 1. استخدام Pagination

```javascript
// ✅ جيد - استخدام pagination
const getAllResults = async (query) => {
  let allResults = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(
      `/api/search/jobs?q=${query}&page=${page}&limit=20`
    );
    const data = await response.json();
    
    allResults = [...allResults, ...data.data.results];
    hasMore = page < data.data.pages;
    page++;
  }
  
  return allResults;
};

// ❌ سيء - طلب جميع النتائج دفعة واحدة
const response = await fetch('/api/search/jobs?q=developer&limit=1000');
```

---

### 2. Caching النتائج

```javascript
// استخدام localStorage للتخزين المؤقت
const searchWithCache = async (query) => {
  const cacheKey = `search_${query}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // Cache valid for 5 minutes
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  
  const response = await fetch(`/api/search/jobs?q=${query}`);
  const data = await response.json();
  
  localStorage.setItem(cacheKey, JSON.stringify({
    data: data.data,
    timestamp: Date.now()
  }));
  
  return data.data;
};
```

---

### 3. معالجة الأخطاء

```javascript
const searchWithErrorHandling = async (query) => {
  try {
    const response = await fetch(`/api/search/jobs?q=${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!data.success) {
      // Handle API error
      switch (data.error.code) {
        case 'UNAUTHORIZED':
          // Redirect to login
          window.location.href = '/login';
          break;
        case 'LIMIT_EXCEEDED':
          // Show rate limit message
          alert('Too many requests. Please wait a moment.');
          break;
        case 'VALIDATION_ERROR':
          // Show validation error
          console.error('Validation error:', data.error.details);
          break;
        default:
          // Show generic error
          alert('An error occurred. Please try again.');
      }
      return null;
    }
    
    return data.data;
  } catch (error) {
    // Handle network error
    console.error('Network error:', error);
    alert('Network error. Please check your connection.');
    return null;
  }
};
```

---

### 4. Debouncing للاقتراحات

```javascript
// استخدام debounce لتقليل عدد الطلبات
import { debounce } from 'lodash';

const AutocompleteInput = () => {
  const [suggestions, setSuggestions] = useState([]);
  
  const fetchSuggestions = debounce(async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    const response = await fetch(
      `/api/search/autocomplete?q=${query}&type=jobs`
    );
    const data = await response.json();
    setSuggestions(data.data.suggestions);
  }, 300); // Wait 300ms after user stops typing
  
  return (
    <input
      type="text"
      onChange={(e) => fetchSuggestions(e.target.value)}
      placeholder="Search..."
    />
  );
};
```

---

### 5. حفظ الفلاتر في URL

```javascript
// حفظ الفلاتر في URL للمشاركة
const updateURLWithFilters = (filters) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      params.set(key, value.join(','));
    } else if (value !== null && value !== undefined) {
      params.set(key, value);
    }
  });
  
  window.history.pushState(
    {},
    '',
    `${window.location.pathname}?${params}`
  );
};

// استعادة الفلاتر من URL
const getFiltersFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const filters = {};
  
  for (const [key, value] of params) {
    if (value.includes(',')) {
      filters[key] = value.split(',');
    } else {
      filters[key] = value;
    }
  }
  
  return filters;
};
```


---

## Changelog

### Version 1.0.0 (2026-03-03)

**Initial Release**

- ✅ Search APIs (jobs, courses)
- ✅ Autocomplete API
- ✅ Saved Searches APIs (CRUD)
- ✅ Alerts APIs (CRUD)
- ✅ Map Search API
- ✅ Multi-field search support
- ✅ Advanced filtering (salary, location, skills, etc.)
- ✅ Skills matching with AND/OR logic
- ✅ Bilingual support (Arabic, English)
- ✅ Rate limiting
- ✅ Error handling
- ✅ Pagination support

---

## الدعم والمساعدة

### الحصول على المساعدة

إذا واجهت أي مشاكل أو كان لديك أسئلة:

1. **التوثيق**: راجع هذا التوثيق أولاً
2. **الأمثلة**: راجع قسم "أمثلة الاستخدام"
3. **الأخطاء الشائعة**: راجع قسم "معالجة الأخطاء"
4. **الاتصال**: careerak.hr@gmail.com

### الإبلاغ عن مشاكل

عند الإبلاغ عن مشكلة، يرجى تضمين:

- Endpoint المستخدم
- Request parameters/body
- Response المستلم
- رسالة الخطأ (إن وجدت)
- خطوات إعادة إنتاج المشكلة

---

## ملاحظات مهمة

### الأمان

- ✅ جميع endpoints محمية بـ JWT authentication (ما عدا GET العامة)
- ✅ Input validation على جميع المدخلات
- ✅ Rate limiting لمنع الإساءة
- ✅ HTTPS إلزامي في الإنتاج

### الأداء

- ⚡ وقت استجابة < 500ms
- 📊 دعم pagination لتحسين الأداء
- 💾 Caching للنتائج الشائعة (5 دقائق)
- 🔍 Database indexes محسّنة

### التوافق

- ✅ يعمل على جميع المتصفحات الحديثة
- ✅ دعم كامل للـ RTL/LTR
- ✅ متوافق مع REST standards
- ✅ JSON responses فقط

### الحدود

- 📝 حد أقصى 10 عمليات بحث محفوظة لكل مستخدم
- 📝 حد أقصى 100 نتيجة لكل صفحة
- 📝 حد أقصى 20 اقتراح في autocomplete
- 📝 حد أقصى 1000 علامة في map search

---

## الخلاصة

نظام الفلترة والبحث المتقدم يوفر APIs شاملة وقوية للبحث عن الوظائف والدورات التدريبية. التوثيق يغطي جميع الجوانب من المصادقة إلى الأمثلة العملية.

**الميزات الرئيسية:**
- 🔍 بحث ذكي متعدد الحقول
- 🎯 فلترة متقدمة
- 💾 حفظ عمليات البحث
- 🔔 تنبيهات ذكية
- 🗺️ بحث جغرافي
- ⚡ أداء عالي

**للبدء:**
1. احصل على JWT token من `/api/auth/login`
2. استخدم token في header `Authorization`
3. ابدأ البحث باستخدام `/api/search/jobs`

---

**تاريخ الإنشاء**: 2026-03-03  
**آخر تحديث**: 2026-03-03  
**الإصدار**: 1.0.0  
**الحالة**: مكتمل ✅

