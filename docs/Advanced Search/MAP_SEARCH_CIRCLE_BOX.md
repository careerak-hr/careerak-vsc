# البحث الجغرافي على الخريطة - دائرة ومستطيل

## 📋 معلومات الوثيقة

- **التاريخ**: 2026-03-03
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 5.2 (يمكن رسم دائرة أو مربع للبحث في منطقة محددة)

---

## 🎯 نظرة عامة

تم تنفيذ نظام بحث جغرافي متقدم يدعم نوعين من البحث:

1. **البحث في مستطيل (Box Search)**: تحديد منطقة مستطيلة بواسطة 4 نقاط (north, south, east, west)
2. **البحث في دائرة (Circle Search)**: تحديد منطقة دائرية بواسطة مركز ونصف قطر (lat, lng, radius)

---

## 🔧 التنفيذ التقني

### Backend

#### 1. SearchService - دعم البحث في دائرة

```javascript
// في backend/src/services/searchService.js

async searchJobsInBounds(bounds, filters = {}) {
  // دعم نوعين من البحث
  if (bounds.type === 'circle') {
    // البحث في دائرة باستخدام $centerSphere
    const radiusInRadians = (bounds.radius || 10) / 6378.1;
    
    searchQuery['location.coordinates'] = {
      $geoWithin: {
        $centerSphere: [
          [bounds.lng, bounds.lat],
          radiusInRadians
        ]
      }
    };
  } else {
    // البحث في مستطيل (الافتراضي)
    searchQuery['location.coordinates'] = {
      $geoWithin: {
        $box: [
          [bounds.west, bounds.south],
          [bounds.east, bounds.north]
        ]
      }
    };
  }
}
```

#### 2. SearchController - API Endpoint محدّث

```javascript
// في backend/src/controllers/searchController.js

async searchJobsOnMap(req, res) {
  const { north, south, east, west, lat, lng, radius, type } = req.query;

  let bounds;

  if (type === 'circle' || (lat && lng)) {
    // البحث في دائرة
    bounds = {
      type: 'circle',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: radius ? parseFloat(radius) : 10
    };
  } else {
    // البحث في مستطيل
    bounds = {
      type: 'box',
      north: parseFloat(north),
      south: parseFloat(south),
      east: parseFloat(east),
      west: parseFloat(west)
    };
  }

  const markers = await searchService.searchJobsInBounds(bounds, filters);
  res.json({ success: true, data: { markers, bounds } });
}
```

---

## 📡 API Endpoints

### البحث في مستطيل (Box Search)

**Endpoint**: `GET /api/search/map`

**Query Parameters**:
```
north: number (required) - خط العرض الشمالي
south: number (required) - خط العرض الجنوبي
east: number (required) - خط الطول الشرقي
west: number (required) - خط الطول الغربي
```

**مثال**:
```bash
GET /api/search/map?north=30.1&south=30.0&east=31.3&west=31.2
```

**Response**:
```json
{
  "success": true,
  "data": {
    "markers": [
      {
        "id": "507f1f77bcf86cd799439011",
        "position": { "lat": 30.0444, "lng": 31.2357 },
        "title": "Software Engineer",
        "company": "Tech Company",
        "location": "Cairo",
        "salary": "5000 - 8000",
        "jobType": "Full-time",
        "experienceLevel": "Mid-level"
      }
    ],
    "bounds": {
      "type": "box",
      "north": 30.1,
      "south": 30.0,
      "east": 31.3,
      "west": 31.2
    }
  }
}
```

---

### البحث في دائرة (Circle Search)

**Endpoint**: `GET /api/search/map`

**Query Parameters**:
```
type: string (optional) - 'circle' (يمكن حذفه إذا كان lat و lng موجودين)
lat: number (required) - خط العرض لمركز الدائرة
lng: number (required) - خط الطول لمركز الدائرة
radius: number (optional) - نصف القطر بالكيلومتر (افتراضي: 10 كم)
```

**مثال**:
```bash
GET /api/search/map?type=circle&lat=30.0444&lng=31.2357&radius=50
```

**Response**:
```json
{
  "success": true,
  "data": {
    "markers": [
      {
        "id": "507f1f77bcf86cd799439011",
        "position": { "lat": 30.0444, "lng": 31.2357 },
        "title": "Software Engineer",
        "company": "Tech Company",
        "location": "Cairo",
        "salary": "5000 - 8000",
        "jobType": "Full-time",
        "experienceLevel": "Mid-level"
      }
    ],
    "bounds": {
      "type": "circle",
      "lat": 30.0444,
      "lng": 31.2357,
      "radius": 50
    }
  }
}
```

---

## 🎨 Frontend Integration

### استخدام مع Google Maps

```jsx
import { GoogleMap, Circle, Rectangle, Marker } from '@react-google-maps/api';

// البحث في دائرة
const searchInCircle = async (lat, lng, radius) => {
  const response = await fetch(
    `/api/search/map?type=circle&lat=${lat}&lng=${lng}&radius=${radius}`
  );
  const data = await response.json();
  return data.data.markers;
};

// البحث في مستطيل
const searchInBox = async (north, south, east, west) => {
  const response = await fetch(
    `/api/search/map?north=${north}&south=${south}&east=${east}&west=${west}`
  );
  const data = await response.json();
  return data.data.markers;
};

// رسم دائرة على الخريطة
<Circle
  center={{ lat: 30.0444, lng: 31.2357 }}
  radius={50000} // 50 كم بالمتر
  options={{
    fillColor: '#304B60',
    fillOpacity: 0.2,
    strokeColor: '#304B60',
    strokeWeight: 2
  }}
/>

// رسم مستطيل على الخريطة
<Rectangle
  bounds={{
    north: 30.1,
    south: 30.0,
    east: 31.3,
    west: 31.2
  }}
  options={{
    fillColor: '#D48161',
    fillOpacity: 0.2,
    strokeColor: '#D48161',
    strokeWeight: 2
  }}
/>
```

---

## ✅ التحقق من الصحة (Validation)

### البحث في مستطيل

```javascript
// التحقق من وجود جميع المعاملات
if (!north || !south || !east || !west) {
  return { error: 'MISSING_BOUNDS' };
}

// التحقق من صحة الحدود
if (north <= south || east <= west) {
  return { error: 'INVALID_BOUNDS' };
}
```

### البحث في دائرة

```javascript
// التحقق من وجود المعاملات
if (!lat || !lng) {
  return { error: 'MISSING_CIRCLE_PARAMS' };
}

// التحقق من صحة الإحداثيات
if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
  return { error: 'INVALID_COORDINATES' };
}

// التحقق من صحة نصف القطر
if (radius <= 0 || radius > 500) {
  return { error: 'INVALID_RADIUS' };
}
```

---

## 🧪 الاختبارات

### اختبارات Backend

```bash
cd backend
npm test -- mapSearch.test.js
```

**الاختبارات المتاحة**:
- ✅ البحث في مستطيل يعمل بشكل صحيح
- ✅ البحث في دائرة يعمل بشكل صحيح
- ✅ نصف القطر الافتراضي (10 كم) يعمل
- ✅ التحقق من صحة المعاملات
- ✅ رفض الإحداثيات غير الصحيحة
- ✅ رفض نصف القطر غير الصحيح
- ✅ تطبيق الفلاتر الإضافية
- ✅ هيكل البيانات المرجعة صحيح

---

## 📊 أمثلة الاستخدام

### مثال 1: البحث حول القاهرة (50 كم)

```bash
curl "http://localhost:5000/api/search/map?type=circle&lat=30.0444&lng=31.2357&radius=50"
```

### مثال 2: البحث في منطقة القاهرة الكبرى

```bash
curl "http://localhost:5000/api/search/map?north=30.2&south=29.9&east=31.5&west=31.0"
```

### مثال 3: البحث في دائرة مع فلاتر إضافية

```bash
curl "http://localhost:5000/api/search/map?type=circle&lat=30.0444&lng=31.2357&radius=50&experienceLevel=Mid-level&jobType=Full-time"
```

---

## 🔍 استكشاف الأخطاء

### خطأ: "MISSING_BOUNDS"

**السبب**: لم يتم تحديد جميع معاملات المستطيل (north, south, east, west)

**الحل**: تأكد من إرسال جميع المعاملات الأربعة

### خطأ: "INVALID_BOUNDS"

**السبب**: الحدود غير صحيحة (north <= south أو east <= west)

**الحل**: تأكد من أن north > south و east > west

### خطأ: "MISSING_CIRCLE_PARAMS"

**السبب**: لم يتم تحديد مركز الدائرة (lat, lng)

**الحل**: تأكد من إرسال lat و lng

### خطأ: "INVALID_COORDINATES"

**السبب**: الإحداثيات خارج النطاق الصحيح

**الحل**: تأكد من أن lat بين -90 و 90، و lng بين -180 و 180

### خطأ: "INVALID_RADIUS"

**السبب**: نصف القطر خارج النطاق المسموح (0-500 كم)

**الحل**: تأكد من أن radius بين 0 و 500

---

## 🎯 الفوائد

1. **مرونة عالية**: دعم نوعين من البحث (دائرة ومستطيل)
2. **سهولة الاستخدام**: API بسيط وواضح
3. **أداء ممتاز**: استخدام MongoDB geospatial indexes
4. **دقة عالية**: حسابات جغرافية دقيقة
5. **تكامل سهل**: يعمل مع Google Maps و Mapbox

---

## 📚 المراجع

- [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [@react-google-maps/api](https://react-google-maps-api-docs.netlify.app/)

---

## 🔄 التحديثات المستقبلية

- [ ] دعم أشكال جغرافية أخرى (مضلعات)
- [ ] تحسين الأداء مع clustering
- [ ] إضافة heat maps
- [ ] دعم البحث في مسارات (routes)

---

**تاريخ الإنشاء**: 2026-03-03  
**آخر تحديث**: 2026-03-03  
**الحالة**: مكتمل ومفعّل ✅
