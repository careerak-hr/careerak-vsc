# Map Clustering - دليل البدء السريع ⚡

## 🚀 الإعداد (5 دقائق)

### 1. تثبيت التبعيات (دقيقة واحدة)

```bash
cd frontend
npm install @react-google-maps/api
```

### 2. الحصول على Google Maps API Key (دقيقتان)

1. افتح [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع → فعّل **Google Maps JavaScript API**
3. Credentials → Create API Key
4. أضف قيود HTTP referrers

### 3. إضافة API Key (30 ثانية)

```env
# frontend/.env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. الاستخدام (دقيقة واحدة)

```jsx
import MapView from './components/MapView/MapView';

function JobsPage() {
  const [jobs, setJobs] = useState([]);

  return (
    <MapView
      jobs={jobs}
      onJobClick={(job) => console.log(job)}
    />
  );
}
```

### 5. التشغيل (30 ثانية)

```bash
npm run dev
# افتح http://localhost:5173
```

---

## ✅ التحقق السريع

- [ ] الخريطة تحمل؟
- [ ] العلامات تظهر؟
- [ ] Clustering يعمل عند التصغير؟
- [ ] النقر على cluster يكبر؟
- [ ] Info window يفتح عند النقر؟

---

## 🎯 الميزات الرئيسية

✅ **Clustering تلقائي** - العلامات تتجمع عند التصغير  
✅ **5 مستويات clusters** - حسب عدد الوظائف  
✅ **Info windows** - تفاصيل الوظيفة عند النقر  
✅ **بحث جغرافي** - حسب حدود الخريطة  
✅ **متجاوب** - يعمل على جميع الأجهزة

---

## 🐛 حل المشاكل السريع

**الخريطة لا تحمل؟**
→ تحقق من API Key في `.env`

**العلامات لا تظهر؟**
→ تحقق من `location.coordinates.lat` و `lng` في بيانات الوظائف

**Clustering لا يعمل؟**
→ صغّر الخريطة أكثر (zoom out)

---

## 📚 المزيد

- 📄 [التوثيق الكامل](./MAP_CLUSTERING_IMPLEMENTATION.md)
- 📄 [README المكون](../frontend/src/components/MapView/README.md)
- 📄 [مثال الاستخدام](../frontend/src/examples/MapViewExample.jsx)

---

**وقت الإعداد الكلي**: 5 دقائق ⚡  
**الحالة**: ✅ جاهز للاستخدام
