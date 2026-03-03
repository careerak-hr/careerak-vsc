# دليل البدء السريع - البحث الجغرافي على الخريطة

## ⚡ البدء السريع (5 دقائق)

### 1. البحث في مستطيل (Box Search)

```javascript
// Frontend
const searchInBox = async () => {
  const response = await fetch(
    `/api/search/map?north=30.1&south=30.0&east=31.3&west=31.2`
  );
  const data = await response.json();
  console.log(data.data.markers); // الوظائف في المنطقة
};
```

### 2. البحث في دائرة (Circle Search)

```javascript
// Frontend
const searchInCircle = async () => {
  const response = await fetch(
    `/api/search/map?type=circle&lat=30.0444&lng=31.2357&radius=50`
  );
  const data = await response.json();
  console.log(data.data.markers); // الوظائف في دائرة 50 كم
};
```

### 3. رسم على الخريطة

```jsx
import { GoogleMap, Circle, Rectangle } from '@react-google-maps/api';

// رسم دائرة
<Circle
  center={{ lat: 30.0444, lng: 31.2357 }}
  radius={50000} // 50 كم بالمتر
  options={{ fillColor: '#304B60', fillOpacity: 0.2 }}
/>

// رسم مستطيل
<Rectangle
  bounds={{ north: 30.1, south: 30.0, east: 31.3, west: 31.2 }}
  options={{ fillColor: '#D48161', fillOpacity: 0.2 }}
/>
```

---

## 📋 المعاملات

### مستطيل (Box)
- `north`: خط العرض الشمالي (required)
- `south`: خط العرض الجنوبي (required)
- `east`: خط الطول الشرقي (required)
- `west`: خط الطول الغربي (required)

### دائرة (Circle)
- `type`: 'circle' (optional)
- `lat`: خط العرض للمركز (required)
- `lng`: خط الطول للمركز (required)
- `radius`: نصف القطر بالكيلومتر (optional, default: 10)

---

## ✅ أمثلة سريعة

### مثال 1: البحث حول القاهرة
```bash
curl "http://localhost:5000/api/search/map?type=circle&lat=30.0444&lng=31.2357&radius=50"
```

### مثال 2: البحث في منطقة القاهرة الكبرى
```bash
curl "http://localhost:5000/api/search/map?north=30.2&south=29.9&east=31.5&west=31.0"
```

### مثال 3: مع فلاتر إضافية
```bash
curl "http://localhost:5000/api/search/map?type=circle&lat=30.0444&lng=31.2357&radius=50&experienceLevel=Mid-level"
```

---

## 🧪 الاختبار

```bash
cd backend
npm test -- mapSearch.test.js
```

---

## 📚 التوثيق الكامل

راجع `MAP_SEARCH_CIRCLE_BOX.md` للتوثيق الشامل.

---

**تاريخ الإنشاء**: 2026-03-03
