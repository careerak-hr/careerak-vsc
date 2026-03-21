# قائمة تحقق النشر على بيئة Staging - ميزة مشاركة المحتوى

**تاريخ الإنشاء**: 2026  
**الحالة**: ✅ جاهز للنشر على Staging  
**المتطلبات**: Task 9.5 - Deploy to staging environment

---

## ✅ التحقق من ملفات الميزة (Feature Files Verification)

### Backend - النماذج (Models)
- [x] `backend/src/models/Share.js` - نموذج المشاركة
- [x] `backend/src/models/ShareAnalytics.js` - نموذج تحليلات المشاركة

### Backend - الخدمات (Services)
- [x] `backend/src/services/shareService.js` - خدمة المشاركة الرئيسية
- [x] `backend/src/services/shareTrackingService.js` - خدمة تتبع المشاركات
- [x] `backend/src/services/metadataService.js` - خدمة البيانات الوصفية (Open Graph / Twitter Cards)

### Backend - المتحكمات (Controllers)
- [x] `backend/src/controllers/shareController.js` - متحكم المشاركة
- [x] `backend/src/controllers/shareHtmlController.js` - متحكم صفحات HTML للمشاركة
- [x] `backend/src/controllers/metadataController.js` - متحكم البيانات الوصفية

### Backend - المسارات (Routes)
- [x] `backend/src/routes/shareRoutes.js` - مسارات API المشاركة
- [x] `backend/src/routes/shareHtmlRoutes.js` - مسارات صفحات HTML
- [x] `backend/src/routes/metadataRoutes.js` - مسارات البيانات الوصفية

### Backend - تسجيل المسارات في app.js
- [x] `/shares` → `shareRoutes` ✅ مسجّل
- [x] `/metadata` → `metadataRoutes` ✅ مسجّل
- [x] `/share` → `shareHtmlRoutes` ✅ مسجّل

### Frontend - المكونات (Components)
- [x] `frontend/src/components/ShareButton/` - زر المشاركة
- [x] `frontend/src/components/ShareModal/` - نافذة خيارات المشاركة
- [x] `frontend/src/components/ShareAnalytics/` - لوحة تحليلات المشاركة
- [x] `frontend/src/components/SharedContentPreview/` - معاينة المحتوى المشارك
- [x] `frontend/src/components/ContactSelector/` - اختيار جهة الاتصال للمشاركة الداخلية

---

## 🔧 إعداد متغيرات البيئة (Environment Variables)

### Backend (.env)
```env
# متغيرات مطلوبة لميزة المشاركة
MONGODB_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
FRONTEND_URL=https://careerak-staging.vercel.app

# Cloudinary (للصور في البيانات الوصفية)
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Pusher (للإشعارات الفورية عند المشاركة الداخلية)
PUSHER_APP_ID=<your_pusher_app_id>
PUSHER_KEY=<your_pusher_key>
PUSHER_SECRET=<your_pusher_secret>
PUSHER_CLUSTER=eu
```

### Frontend (.env)
```env
VITE_API_URL=https://careerak-backend-staging.vercel.app
VITE_PUSHER_KEY=<your_pusher_key>
VITE_PUSHER_CLUSTER=eu
```

---

## 🗄️ قاعدة البيانات (Database)

### الفهارس المطلوبة (Indexes)
تأكد من وجود الفهارس التالية في MongoDB:

**نموذج Share:**
```javascript
// فهارس الأداء
{ contentId: 1 }
{ userId: 1 }
{ timestamp: -1 }
{ contentType: 1, contentId: 1 }
```

**نموذج ShareAnalytics:**
```javascript
{ contentId: 1, contentType: 1 }
{ shareMethod: 1 }
{ createdAt: -1 }
```

### إنشاء الفهارس يدوياً (إذا لزم الأمر)
```bash
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Share = require('./src/models/Share');
  const ShareAnalytics = require('./src/models/ShareAnalytics');
  await Share.createIndexes();
  await ShareAnalytics.createIndexes();
  console.log('✅ Indexes created successfully');
  process.exit(0);
});
"
```

---

## 🚀 خطوات النشر على Staging

### 1. Backend (PM2)
```bash
cd backend

# التحقق من الحالة الحالية
npm run pm2:status

# إعادة تشغيل السيرفر بعد التحديثات
npm run pm2:restart

# التحقق من السجلات
npm run pm2:logs
```

### 2. Frontend (Vercel)
```bash
cd frontend

# بناء المشروع
npm run build

# النشر على Vercel (يتم تلقائياً عند push إلى main)
# أو يدوياً:
vercel --prod
```

---

## 🔍 التحقق من API Endpoints

بعد النشر، تحقق من عمل هذه النقاط:

```bash
BASE_URL=https://careerak-backend-staging.vercel.app

# 1. تسجيل حدث مشاركة
curl -X POST $BASE_URL/shares \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"job","contentId":"<id>","shareMethod":"whatsapp"}'

# 2. الحصول على عدد المشاركات
curl $BASE_URL/shares/job/<contentId>

# 3. تحليلات المشاركة
curl $BASE_URL/shares/analytics \
  -H "Authorization: Bearer <token>"

# 4. البيانات الوصفية للوظيفة
curl $BASE_URL/metadata/job/<jobId>

# 5. البيانات الوصفية للدورة
curl $BASE_URL/metadata/course/<courseId>
```

---

## 🎨 التحقق من مكونات Frontend

تحقق من ظهور زر المشاركة في:
- [ ] صفحة تفاصيل الوظيفة (JobDetailsPage)
- [ ] بطاقة الوظيفة (JobPostingCard)
- [ ] صفحة تفاصيل الدورة (CourseDetailsPage)
- [ ] بطاقة الدورة (CourseCard)
- [ ] صفحة الملف الشخصي (UserProfilePage)
- [ ] صفحة ملف الشركة (CompanyProfilePage)

---

## 🌍 دعم اللغات

تأكد من ظهور ترجمات المشاركة بشكل صحيح:
- [ ] العربية (ar) - الاتجاه RTL
- [ ] الإنجليزية (en) - الاتجاه LTR
- [ ] الفرنسية (fr) - الاتجاه LTR

---

## 📱 التحقق من التصميم المتجاوب

- [ ] الموبايل (< 640px) - زر المشاركة بحجم 44x44px على الأقل
- [ ] الجهاز اللوحي (640px - 1023px)
- [ ] سطح المكتب (>= 1024px)
- [ ] Native Share Sheet على الموبايل (navigator.share API)

---

## 🔒 التحقق من الأمان والخصوصية

- [ ] المحتوى الخاص لا يمكن مشاركته خارجياً
- [ ] روابط المشاركة لا تكشف معلومات حساسة
- [ ] التحقق من صلاحيات المستخدم قبل المشاركة الداخلية
- [ ] روابط المحتوى المحذوف تُرجع 404

---

## 📊 التحقق من تحليلات المشاركة

- [ ] تسجيل أحداث المشاركة في قاعدة البيانات
- [ ] لوحة تحليلات المشاركة في Admin Dashboard تعمل
- [ ] تصدير البيانات (CSV, JSON) يعمل

---

## ✅ قائمة التحقق النهائية قبل UAT

- [ ] جميع ملفات الميزة موجودة ✅
- [ ] المسارات مسجّلة في app.js ✅
- [ ] متغيرات البيئة مضبوطة
- [ ] فهارس قاعدة البيانات موجودة
- [ ] Backend يعمل عبر PM2
- [ ] Frontend مبني ومنشور على Vercel
- [ ] جميع API endpoints تستجيب بشكل صحيح
- [ ] زر المشاركة يظهر في جميع الصفحات المطلوبة
- [ ] دعم اللغات الثلاث يعمل
- [ ] التصميم المتجاوب يعمل على جميع الأجهزة
- [ ] الأمان والخصوصية مطبّقان
- [ ] تحليلات المشاركة تعمل

---

## 📝 ملاحظات

- **PM2**: يجب استخدام `npm run pm2:restart` وليس `npm run dev` لإعادة تشغيل Backend
- **Vercel**: Frontend يُنشر تلقائياً عند push إلى main branch
- **MongoDB**: الفهارس تُنشأ تلقائياً عند أول تشغيل للنماذج
- **الألوان**: يجب أن تتبع ShareModal ألوان المشروع (#304B60, #E3DAD1, #D48161)

---

**آخر تحديث**: 2026  
**المسؤول**: Eng.AlaaUddien
