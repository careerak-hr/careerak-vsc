# عرض الخريطة - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. تشغيل Migration (دقيقة واحدة)

```bash
cd backend
node scripts/add-geo-coordinates.js
```

**النتيجة المتوقعة**: ✅ تم تحديث الوظائف بإحداثيات جغرافية

---

### 2. اختبار API (30 ثانية)

```bash
# البحث في القاهرة الكبرى
curl "http://localhost:5000/api/search/map?north=30.2&south=29.8&east=31.5&west=31.0"
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "data": {
    "markers": [
      {
        "id": "...",
        "position": { "lat": 30.0444, "lng": 31.2357 },
        "title": "Senior Developer",
        "company": "Tech Co",
        "location": "القاهرة"
      }
    ]
  }
}
```

---

### 3. Frontend Integration (3 دقائق)

#### Google Maps

```bash
npm install @react-google-maps/api
```

```jsx
import { GoogleMap, Marker } from '@react-google-maps/api';

function MapView() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetch('/api/search/map?north=30.2&south=29.8&east=31.5&west=31.0')
      .then(res => res.json())
      .then(data => setMarkers(data.data.markers));
  }, []);

  return (
    <GoogleMap center={{ lat: 30.0444, lng: 31.2357 }} zoom={10}>
      {markers.map(m => (
        <Marker key={m.id} position={m.position} />
      ))}
    </GoogleMap>
  );
}
```

#### Mapbox

```bash
npm install react-map-gl mapbox-gl
```

```jsx
import Map, { Marker } from 'react-map-gl';

function MapView() {
  const [markers, setMarkers] = useState([]);

  return (
    <Map
      initialViewState={{ latitude: 30.0444, longitude: 31.2357, zoom: 10 }}
      mapboxAccessToken="YOUR_TOKEN"
    >
      {markers.map(m => (
        <Marker key={m.id} latitude={m.position.lat} longitude={m.position.lng} />
      ))}
    </Map>
  );
}
```

---

## 🎯 الميزات الرئيسية

✅ عرض جميع الوظائف على الخريطة  
✅ البحث في منطقة جغرافية محددة  
✅ تطبيق فلاتر (راتب، نوع عمل، خبرة)  
✅ 80+ مدينة عربية مدعومة  
✅ أداء عالي (< 100ms)

---

## 📚 التوثيق الكامل

📄 `docs/Advanced Search/MAP_VIEW_IMPLEMENTATION.md` - دليل شامل

---

**تاريخ الإنشاء**: 2026-03-03
