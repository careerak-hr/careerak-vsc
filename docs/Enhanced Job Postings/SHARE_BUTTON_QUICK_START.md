# Share Button - دليل البدء السريع ⚡

## 🚀 الاستخدام في 3 خطوات

### 1. الاستيراد
```jsx
import ShareButton from './components/ShareButton';
```

### 2. الاستخدام
```jsx
<ShareButton job={job} />
```

### 3. النتيجة
✅ زر مشاركة جاهز مع 5 خيارات!

---

## 📋 بيانات الوظيفة المطلوبة

```javascript
const job = {
  _id: '507f1f77bcf86cd799439011',  // مطلوب
  title: 'مطور Full Stack',         // مطلوب
  company: {
    name: 'شركة التقنية'             // مطلوب
  }
};
```

---

## 🎨 التخصيص السريع

```jsx
// الحجم
<ShareButton job={job} size="small" />   // صغير
<ShareButton job={job} size="medium" />  // متوسط (افتراضي)
<ShareButton job={job} size="large" />   // كبير

// النمط
<ShareButton job={job} variant="default" />    // أبيض
<ShareButton job={job} variant="primary" />    // نحاسي
<ShareButton job={job} variant="outline" />    // شفاف
<ShareButton job={job} variant="icon-only" />  // أيقونة فقط
```

---

## 📱 خيارات المشاركة

عند النقر على الزر، يظهر Modal مع:

1. 📋 **نسخ الرابط** - ينسخ الرابط مع رسالة تأكيد
2. 💬 **WhatsApp** - يفتح WhatsApp
3. 💼 **LinkedIn** - يفتح LinkedIn
4. 🐦 **Twitter** - يفتح Twitter
5. 👥 **Facebook** - يفتح Facebook
6. 📱 **المزيد** - Web Share API (على الموبايل)

---

## 🧪 الاختبار السريع

```bash
# 1. تشغيل المثال
cd frontend
npm start

# 2. فتح المتصفح
http://localhost:3000/examples/share-button

# 3. اختبار الوظائف
- انقر على زر المشاركة
- جرب جميع خيارات المشاركة
- اختبر على أجهزة مختلفة
```

---

## ✅ Checklist

- [ ] استوردت ShareButton
- [ ] مررت job prop صحيح
- [ ] اخترت size و variant
- [ ] اختبرت على Desktop
- [ ] اختبرت على Mobile
- [ ] اختبرت جميع خيارات المشاركة

---

## 🆘 مشاكل شائعة

### Modal لا يفتح؟
```jsx
// تأكد من job prop صحيح
const job = {
  _id: '123',           // ✅ موجود
  title: 'مطور',        // ✅ موجود
  company: {
    name: 'شركة'        // ✅ موجود
  }
};
```

### نسخ الرابط لا يعمل؟
- استخدم HTTPS في الإنتاج
- في التطوير، استخدم `localhost`

### Web Share API لا يظهر؟
- يظهر فقط على الأجهزة المحمولة
- يتطلب HTTPS

---

## 📚 المزيد من المعلومات

- 📄 [README.md](../../frontend/src/components/ShareButton/README.md) - توثيق كامل
- 📄 [SHARE_BUTTON_IMPLEMENTATION.md](./SHARE_BUTTON_IMPLEMENTATION.md) - دليل التنفيذ
- 💻 [ShareButtonExample.jsx](../../frontend/src/examples/ShareButtonExample.jsx) - 5 أمثلة

---

**تم إنشاؤه**: 2026-03-06  
**الوقت المتوقع**: 5 دقائق ⚡
