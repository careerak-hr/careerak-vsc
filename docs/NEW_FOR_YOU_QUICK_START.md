# 🚀 قسم "جديد لك" - دليل البدء السريع

## ⚡ البدء في 5 دقائق

### 1. استيراد المكون (30 ثانية)

```jsx
import NewForYou from '../components/NewForYou';
```

### 2. إضافة إلى الصفحة (1 دقيقة)

```jsx
function InterfaceIndividuals() {
  const { user } = useApp();

  return (
    <main>
      <h1>الصفحة الرئيسية</h1>
      
      {/* قسم "جديد لك" - 5 توصيات */}
      {user && <NewForYou limit={5} />}
    </main>
  );
}
```

### 3. التحقق من Backend (2 دقيقة)

```bash
# تحقق من أن API يعمل
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/recommendations/new?limit=5
```

### 4. اختبار (1 دقيقة)

```bash
# شغّل الاختبارات
npm test -- NewForYou.test.jsx
```

### 5. تشغيل (30 ثانية)

```bash
# شغّل Frontend
cd frontend
npm run dev

# افتح المتصفح
# http://localhost:5173
```

---

## 📋 Checklist سريع

- [ ] المكون مستورد
- [ ] المكون مضاف للصفحة
- [ ] API يعمل
- [ ] الاختبارات تنجح
- [ ] التطبيق يعمل

---

## 🎯 الميزات الأساسية

### ✅ ما يعمل الآن
- عرض التوصيات اليومية
- نسبة التطابق (0-100%)
- شرح أسباب التوصية
- تحديد كمشاهدة تلقائياً
- دعم 3 لغات (ar, en, fr)
- تصميم متجاوب

### 🔄 ما يحتاج إعداد
- Backend API (يجب أن يكون يعمل)
- Authentication (token في localStorage)
- Daily Cron Job (للتحديث اليومي)

---

## 🔧 الإعداد السريع

### Frontend

```bash
# لا يحتاج تثبيت - المكون جاهز
# فقط استورده واستخدمه
```

### Backend

```bash
# تحقق من أن Daily Recommendation Service يعمل
cd backend
npm start

# يجب أن ترى:
# ✅ تم بدء جدولة التحديث اليومي للتوصيات
```

### Environment Variables

```env
# Frontend (.env)
VITE_API_URL=http://localhost:5000

# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/careerak
JWT_SECRET=your_secret_key
```

---

## 🐛 استكشاف الأخطاء السريع

### المشكلة: لا تظهر التوصيات

```bash
# 1. تحقق من تسجيل الدخول
console.log(localStorage.getItem('token'));

# 2. تحقق من API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/recommendations/new

# 3. تحقق من Backend logs
# يجب أن ترى: "✅ تم جلب X توصية جديدة"
```

### المشكلة: خطأ في API

```bash
# تحقق من Backend يعمل
curl http://localhost:5000/api/health

# تحقق من CORS
# يجب أن يكون FRONTEND_URL في .env
```

### المشكلة: التوصيات فارغة

```bash
# تحقق من:
# 1. الملف الشخصي مكتمل (> 30%)
# 2. توجد وظائف في قاعدة البيانات
# 3. Cron Job عمل مرة واحدة على الأقل
```

---

## 📊 اختبار سريع

### Test 1: عرض التوصيات

```jsx
// يجب أن ترى:
// - عنوان "جديد لك"
// - 5 بطاقات توصيات
// - نسبة التطابق على كل بطاقة
```

### Test 2: النقر على توصية

```jsx
// يجب أن:
// - يتم تحديد التوصية كمشاهدة
// - يتم إرسال PATCH request
// - لا يحدث خطأ في console
```

### Test 3: اللغات

```jsx
// غيّر اللغة من الإعدادات
// يجب أن تتغير جميع النصوص
```

---

## 🎨 التخصيص السريع

### تغيير عدد التوصيات

```jsx
<NewForYou limit={10} /> // 10 بدلاً من 5
```

### تغيير الألوان

```css
/* في NewForYou.css */
.recommendation-card {
  border-color: #YOUR_COLOR;
}
```

### تغيير الترجمات

```jsx
// في NewForYou.jsx
const translations = {
  ar: {
    title: 'عنوان جديد',
    // ...
  }
};
```

---

## 📚 المراجع السريعة

### التوثيق الكامل
- `docs/NEW_FOR_YOU_IMPLEMENTATION.md`
- `frontend/src/components/NewForYou/README.md`

### API Endpoints
- `GET /api/recommendations/new?limit=5`
- `PATCH /api/recommendations/:id/seen`

### الملفات الرئيسية
- `frontend/src/components/NewForYou/NewForYou.jsx`
- `frontend/src/components/NewForYou/NewForYou.css`
- `backend/src/controllers/dailyRecommendationController.js`

---

## ✅ Checklist النشر

- [ ] الاختبارات تنجح (17/17)
- [ ] لا أخطاء في console
- [ ] يعمل على Desktop
- [ ] يعمل على Mobile
- [ ] يعمل على جميع المتصفحات
- [ ] يعمل مع جميع اللغات
- [ ] API يعمل في Production
- [ ] Cron Job مفعّل

---

## 🚀 النشر

```bash
# 1. Build Frontend
cd frontend
npm run build

# 2. Deploy Backend
cd backend
npm start

# 3. تحقق من Cron Job
# يجب أن يعمل تلقائياً كل يوم الساعة 2:00 صباحاً
```

---

## 💡 نصائح سريعة

1. **الأداء**: استخدم `limit=5` للصفحة الرئيسية
2. **UX**: أضف loading skeleton بدلاً من spinner
3. **SEO**: أضف structured data للتوصيات
4. **Analytics**: تتبع CTR و Apply Rate
5. **Testing**: اختبر مع بيانات حقيقية

---

## 📞 الدعم

### مشاكل شائعة
- لا تظهر التوصيات → تحقق من token
- API error → تحقق من Backend
- توصيات فارغة → تحقق من Cron Job

### الحصول على المساعدة
- التوثيق الكامل: `docs/NEW_FOR_YOU_IMPLEMENTATION.md`
- README: `frontend/src/components/NewForYou/README.md`
- الاختبارات: `frontend/src/components/NewForYou/NewForYou.test.jsx`

---

**تم الإنشاء**: 2026-02-28  
**الحالة**: ✅ جاهز للاستخدام
