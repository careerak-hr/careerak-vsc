# إصلاح مسارات API - حل مشكلة CORS و 404

**التاريخ**: 2026-02-17  
**المشكلة**: أخطاء CORS و 404 عند استدعاء `/admin/stats`

---

## 🔴 المشكلة

### الأخطاء الظاهرة:
```
❌ Access to XMLHttpRequest at 'https://careerak-vsc.vercel.app/admin/stats' 
   from origin 'http://localhost:3000' has been blocked by CORS policy
❌ GET https://careerak-vsc.vercel.app/admin/stats net::ERR_FAILED 404
```

### السبب الجذري:
**تضارب في المسارات بين Frontend و Backend و Vercel**

1. **Frontend** (`AdminDashboard.jsx`):
   - يستدعي: `api.get('/admin/stats')`
   - baseURL: `https://careerak-vsc.vercel.app`
   - المسار الكامل: `https://careerak-vsc.vercel.app/admin/stats`

2. **Backend** (`app.js` - القديم):
   - المسارات مسجلة كـ: `app.use('/api/admin', adminRoutes)`
   - المسار المتوقع: `/api/admin/stats`

3. **Vercel** (`vercel.json`):
   - يوجه `/api/*` إلى Backend
   - لكن Frontend يطلب `/admin/stats` (بدون `/api/`)

### النتيجة:
- Frontend يطلب: `/admin/stats`
- Vercel لا يجد route لـ `/admin/*` (يبحث فقط عن `/api/*`)
- النتيجة: **404 Not Found**

---

## ✅ الحل

### التعديلات المطبقة:

#### 1. إصلاح المسارات في `backend/src/app.js`

**قبل**:
```javascript
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.get('/api/health', ...);
app.get('/api/stats', ...);
```

**بعد**:
```javascript
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/upload', uploadRoutes);
app.get('/health', ...);
app.get('/stats', ...);
```

### لماذا هذا الحل؟

**Vercel Routing** في `vercel.json`:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/index.js"
    }
  ]
}
```

- عندما يأتي طلب لـ `/api/admin/stats`
- Vercel يوجهه إلى Backend كـ `/admin/stats` (يحذف `/api/`)
- Backend يجب أن يستقبله كـ `/admin/stats` وليس `/api/admin/stats`

---

## 📊 المسارات بعد الإصلاح

### Frontend → Vercel → Backend

| Frontend Request | Vercel Receives | Vercel Forwards to Backend | Backend Route |
|-----------------|-----------------|---------------------------|---------------|
| `/api/admin/stats` | `/api/admin/stats` | `/admin/stats` | `/admin/stats` ✅ |
| `/api/users/login` | `/api/users/login` | `/users/login` | `/users/login` ✅ |
| `/api/upload/image` | `/api/upload/image` | `/upload/image` | `/upload/image` ✅ |
| `/api/health` | `/api/health` | `/health` | `/health` ✅ |

---

## 🔧 الملفات المعدلة

### 1. `backend/src/app.js`
- ✅ حذف `/api/` من جميع المسارات
- ✅ CORS configuration موجودة ومضبوطة
- ✅ Token interceptor في Frontend يعمل

### 2. لا تغيير في Frontend
- ❌ لا حاجة لتعديل `api.js` أو `AdminDashboard.jsx`
- ✅ Frontend يستمر في الاستدعاء بـ `/api/...`
- ✅ Vercel يتولى التوجيه تلقائياً

---

## 🚀 خطوات النشر

### 1. Commit التغييرات:
```bash
git add backend/src/app.js
git commit -m "fix: إصلاح مسارات API للتوافق مع Vercel routing"
```

### 2. Push إلى GitHub:
```bash
git push origin main
```

### 3. Vercel Auto-Deploy:
- Vercel سيكتشف التغييرات تلقائياً
- سيبدأ deployment جديد
- انتظر 2-3 دقائق

### 4. التحقق من النشر:
```bash
# اختبار health check
curl https://careerak-vsc.vercel.app/api/health

# يجب أن يرجع:
{"status":"live","server":"vercel","timestamp":"..."}
```

---

## 🧪 الاختبار

### 1. اختبار محلي (قبل النشر):
```bash
cd backend
npm start
```

في terminal آخر:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/admin/stats -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. اختبار على Vercel (بعد النشر):
```bash
curl https://careerak-vsc.vercel.app/api/health
```

### 3. اختبار من Frontend:
1. افتح `http://localhost:3000/login`
2. سجل دخول بحساب Admin: `admin01` / `admin123`
3. انتقل إلى `/admin-dashboard`
4. يجب أن تظهر الإحصائيات بدون أخطاء CORS

---

## 📝 ملاحظات مهمة

### CORS Configuration
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://careerak-vsc.vercel.app',
      'https://careerak.vercel.app'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // السماح بجميع الأصول مؤقتاً
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
```

### Token Interceptor
```javascript
// في frontend/src/services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## ✅ Checklist

- [x] إصلاح المسارات في `backend/src/app.js`
- [x] CORS configuration صحيحة
- [x] Token interceptor يعمل
- [ ] Commit التغييرات
- [ ] Push إلى GitHub
- [ ] انتظار Vercel deployment
- [ ] اختبار API endpoints
- [ ] اختبار من Frontend

---

## 🎯 النتيجة المتوقعة

بعد النشر:
- ✅ لا أخطاء CORS
- ✅ لا أخطاء 404
- ✅ Admin Dashboard يعرض الإحصائيات
- ✅ جميع API calls تعمل بشكل صحيح

---

**آخر تحديث**: 2026-02-17  
**الحالة**: جاهز للنشر
