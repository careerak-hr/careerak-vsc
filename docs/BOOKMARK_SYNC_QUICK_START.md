# دليل البدء السريع - نظام Bookmark مع المزامنة

## 🚀 البدء السريع (5 دقائق)

### 1. Backend Setup

```bash
# تأكد من تشغيل MongoDB
# تأكد من وجود المتغيرات في .env:
# MONGODB_URI=mongodb://localhost:27017/careerak
# JWT_SECRET=your_secret_key

cd backend
npm install
npm start
```

### 2. Frontend Setup

```bash
cd frontend

# تأكد من وجود المتغيرات في .env:
# VITE_API_URL=http://localhost:5000

npm install
npm run dev
```

### 3. الاستخدام الأساسي

```javascript
import { toggleBookmark, getBookmarkedJobs } from '../utils/bookmarkUtils';

// حفظ/إزالة وظيفة
const result = await toggleBookmark('job_id_here');
console.log(result.bookmarked); // true or false

// جلب الوظائف المحفوظة
const jobs = await getBookmarkedJobs();
console.log(jobs); // Array of bookmarked jobs
```

---

## 📱 اختبار المزامنة

### اختبار على جهازين:

**الجهاز الأول**:
1. افتح: `http://localhost:5173/bookmarked-jobs`
2. سجل دخول
3. احفظ وظيفة

**الجهاز الثاني**:
1. افتح: `http://localhost:5173/bookmarked-jobs`
2. سجل دخول بنفس الحساب
3. يجب أن تظهر الوظيفة المحفوظة

---

## 🔌 اختبار Offline

1. افتح التطبيق
2. افصل الإنترنت (F12 → Network → Offline)
3. احفظ وظيفة
4. يجب أن تظهر رسالة "تم الحفظ محلياً"
5. أعد الاتصال
6. يجب أن تتم المزامنة تلقائياً

---

## 🧪 اختبار المثال

```bash
cd frontend
npm run dev

# افتح في المتصفح:
http://localhost:5173/examples/bookmark-sync
```

---

## 📚 API Endpoints

```http
# حفظ/إزالة
POST /api/jobs/:id/bookmark

# جلب المحفوظة
GET /api/jobs/bookmarked

# التحقق من الحالة
GET /api/jobs/:id/bookmark/status

# تحديث
PATCH /api/jobs/:id/bookmark

# إحصائيات
GET /api/jobs/bookmarks/stats
```

---

## ✅ Checklist

- [ ] Backend يعمل على port 5000
- [ ] Frontend يعمل على port 5173
- [ ] MongoDB متصل
- [ ] يمكن تسجيل الدخول
- [ ] يمكن حفظ وظيفة
- [ ] تظهر في صفحة المحفوظة
- [ ] المزامنة تعمل عبر الأجهزة
- [ ] Offline mode يعمل

---

## 🐛 استكشاف الأخطاء

### "Failed to fetch bookmarked jobs"
- تحقق من تشغيل Backend
- تحقق من VITE_API_URL في .env
- تحقق من token في localStorage

### "Bookmark not syncing"
- تحقق من الاتصال بالإنترنت
- افتح Console للأخطاء
- تحقق من MongoDB connection

### "Offline mode not working"
- تحقق من localStorage permissions
- افتح Console للأخطاء
- جرب في Incognito mode

---

## 📖 التوثيق الكامل

للمزيد من التفاصيل، راجع:
- 📄 `docs/BOOKMARK_SYNC_IMPLEMENTATION.md` - دليل شامل
- 📄 `frontend/src/examples/BookmarkSyncExample.jsx` - مثال كامل
- 📄 `backend/src/services/bookmarkService.js` - كود Backend

---

**تاريخ الإنشاء**: 2026-03-06
