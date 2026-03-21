# إعداد Map Clustering - تعليمات المستخدم 🗺️

## 🎯 ما تم إنجازه

تم تنفيذ ميزة **Map Clustering** بنجاح! الآن يمكنك عرض الوظائف على خريطة Google Maps التفاعلية مع تجميع تلقائي للعلامات عند التصغير.

---

## 📦 الملفات الجديدة

```
frontend/src/
├── components/MapView/
│   ├── MapView.jsx              ✅ المكون الرئيسي
│   ├── MapMarker.jsx            ✅ مكون العلامة
│   ├── MapInfoWindow.jsx        ✅ نافذة المعلومات
│   ├── MapView.css              ✅ التنسيقات
│   ├── MapInfoWindow.css        ✅ تنسيقات النافذة
│   ├── MapView.test.jsx         ✅ الاختبارات
│   └── README.md                ✅ التوثيق
├── examples/
│   └── MapViewExample.jsx       ✅ مثال استخدام
└── package-additions.json       ✅ التبعيات المطلوبة
```

---

## 🚀 خطوات الإعداد (5 دقائق)

### الخطوة 1: تثبيت التبعيات

```bash
cd frontend
npm install @react-google-maps/api
```

### الخطوة 2: الحصول على Google Maps API Key

1. افتح [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد (أو اختر مشروع موجود)
3. فعّل **Google Maps JavaScript API**:
   - انتقل إلى **APIs & Services** → **Library**
   - ابحث عن "Google Maps JavaScript API"
   - انقر **Enable**
4. أنشئ API Key:
   - انتقل إلى **APIs & Services** → **Credentials**
   - انقر **Create Credentials** → **API Key**
   - انسخ المفتاح
5. أضف القيود (موصى به):
   - **Application restrictions**: HTTP referrers
   - **Website restrictions**: أضف نطاقك (مثلاً: `https://careerak.com/*`)
   - **API restrictions**: Google Maps JavaScript API

### الخطوة 3: إضافة API Key في .env

أنشئ أو عدّل ملف `.env` في مجلد `frontend`:

```env
# frontend/.env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **مهم**: لا تشارك هذا المفتاح علناً!

### الخطوة 4: التحقق من التثبيت

```bash
npm run dev
```

افتح المتصفح على `http://localhost:5173/examples/map-view`

---

## 📖 كيفية الاستخدام

### استخدام بسيط

```jsx
import MapView from './components/MapView/MapView';

function JobsPage() {
  const [jobs, setJobs] = useState([]);

  // جلب الوظائف من API
  useEffect(() => {
    fetch('/api/search/jobs?limit=100')
      .then(res => res.json())
      .then(data => setJobs(data.data.results));
  }, []);

  return (
    <div>
      <h1>الوظائف على الخريطة</h1>
      <MapView
        jobs={jobs}
        onJobClick={(job) => console.log('تم النقر على:', job.title)}
      />
    </div>
  );
}
```

### استخدام متقدم مع البحث الجغرافي

```jsx
import MapView from './components/MapView/MapView';

function JobsPage() {
  const [jobs, setJobs] = useState([]);

  const handleBoundsChange = async (bounds) => {
    // البحث بناءً على حدود الخريطة
    const response = await fetch('/api/search/map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bounds })
    });
    
    const data = await response.json();
    setJobs(data.data.results);
  };

  const handleJobClick = (job) => {
    // الانتقال لصفحة التفاصيل
    navigate(`/job-postings/${job._id}`);
  };

  return (
    <MapView
      jobs={jobs}
      center={{ lat: 24.7136, lng: 46.6753 }} // الرياض
      zoom={6}
      onJobClick={handleJobClick}
      onBoundsChange={handleBoundsChange}
    />
  );
}
```

---

## 🎨 الميزات

### 1. Clustering التلقائي ✅
- العلامات القريبة تتجمع تلقائياً عند التصغير
- 5 مستويات من أحجام الـ clusters
- النقر على cluster يكبر المنطقة

### 2. Info Windows ✅
- نافذة معلومات احترافية عند النقر على العلامة
- عرض تفاصيل الوظيفة (العنوان، الشركة، الراتب، المهارات)
- زر "عرض التفاصيل" للانتقال لصفحة الوظيفة

### 3. البحث الجغرافي ✅
- البحث بناءً على حدود الخريطة المرئية
- تحديث تلقائي عند تحريك الخريطة
- دعم البحث داخل دائرة/مربع

### 4. تصميم متجاوب ✅
- يعمل على Desktop, Tablet, Mobile
- دعم RTL/LTR
- حالات Loading و Error واضحة

---

## 📊 هيكل بيانات Job المطلوب

```javascript
{
  _id: "job123",
  title: "مطور Full Stack",
  company: {
    name: "شركة التقنية",
    logo: "https://example.com/logo.png"
  },
  location: {
    city: "الرياض",
    country: "السعودية",
    coordinates: {
      lat: 24.7136,    // مطلوب
      lng: 46.6753     // مطلوب
    }
  },
  salary: {
    min: 8000,
    max: 12000,
    currency: "SAR"
  },
  workType: "full-time",
  skills: ["JavaScript", "React", "Node.js"],
  createdAt: "2026-03-03T10:00:00Z"
}
```

⚠️ **مهم**: يجب أن تحتوي كل وظيفة على `location.coordinates.lat` و `lng`

---

## 🐛 حل المشاكل الشائعة

### المشكلة: "خطأ في تحميل الخريطة"

**الحل**:
1. تحقق من `VITE_GOOGLE_MAPS_API_KEY` في `.env`
2. تحقق من تفعيل Google Maps JavaScript API
3. تحقق من القيود على API Key

### المشكلة: "العلامات لا تظهر"

**الحل**:
1. تحقق من وجود `location.coordinates.lat` و `lng` في بيانات الوظائف
2. تحقق من صحة القيم:
   - `lat`: -90 إلى 90
   - `lng`: -180 إلى 180
3. افتح Console وتحقق من الأخطاء

### المشكلة: "Clustering لا يعمل"

**الحل**:
1. تحقق من وجود علامتين على الأقل قريبتين من بعضهما
2. جرب التصغير أكثر (zoom out)
3. تحقق من تثبيت `@react-google-maps/api` بشكل صحيح

### المشكلة: "الخريطة بطيئة"

**الحل**:
1. قلل عدد الوظائف المعروضة (استخدم pagination)
2. استخدم bounds-based search
3. تأكد من تفعيل clustering

---

## 📚 التوثيق الإضافي

- 📄 [التوثيق الكامل](../docs/MAP_CLUSTERING_IMPLEMENTATION.md)
- 📄 [دليل البدء السريع](../docs/MAP_CLUSTERING_QUICK_START.md)
- 📄 [ملخص التنفيذ](../docs/MAP_CLUSTERING_SUMMARY.md)
- 📄 [README المكون](./src/components/MapView/README.md)

---

## ✅ قائمة التحقق

قبل البدء، تأكد من:

- [ ] تثبيت `@react-google-maps/api`
- [ ] إضافة Google Maps API Key في `.env`
- [ ] تفعيل Google Maps JavaScript API
- [ ] إضافة القيود على API Key
- [ ] بيانات الوظائف تحتوي على إحداثيات صحيحة

---

## 🎉 جاهز للاستخدام!

الآن يمكنك استخدام MapView Component في تطبيقك. إذا واجهت أي مشاكل، راجع التوثيق أو افتح issue.

**وقت الإعداد**: 5 دقائق ⚡  
**الحالة**: ✅ جاهز للاستخدام

---

**تاريخ الإنشاء**: 2026-03-03  
**المطور**: Eng.AlaaUddien
