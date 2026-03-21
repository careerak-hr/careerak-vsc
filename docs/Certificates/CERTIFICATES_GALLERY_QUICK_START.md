# معرض الشهادات - دليل البدء السريع ⚡

## 🚀 البدء في 5 دقائق

### 1. الاستيراد (30 ثانية)

```jsx
import CertificatesGallery from './components/Certificates/CertificatesGallery';
```

### 2. الاستخدام الأساسي (1 دقيقة)

```jsx
function ProfilePage() {
  const userId = localStorage.getItem('userId');

  return (
    <CertificatesGallery 
      userId={userId} 
      isOwnProfile={true} 
    />
  );
}
```

### 3. Props (1 دقيقة)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | string | ✅ | معرف المستخدم |
| `isOwnProfile` | boolean | ❌ | هل هو الملف الشخصي للمستخدم الحالي |

### 4. API Setup (2 دقيقة)

**Backend Endpoint:**
```javascript
GET /api/certificates?userId=<userId>
Authorization: Bearer <token>
```

**Response Format:**
```json
{
  "certificates": [
    {
      "_id": "cert-001",
      "certificateId": "CERT-2024-001",
      "courseName": "تطوير تطبيقات الويب",
      "issueDate": "2024-01-15T10:00:00Z",
      "status": "active",
      "isHidden": false,
      "pdfUrl": "https://example.com/cert.pdf",
      "thumbnailUrl": "https://example.com/thumb.jpg"
    }
  ]
}
```

### 5. Environment Variables (30 ثانية)

```env
VITE_API_URL=http://localhost:5000
```

---

## ✨ الميزات الرئيسية

- ✅ عرض Grid/List
- ✅ فلترة (الكل، نشطة، ملغاة)
- ✅ ترتيب (التاريخ، الاسم)
- ✅ صور مصغرة
- ✅ تحميل PDF
- ✅ التحقق من الشهادة
- ✅ إخفاء/إظهار
- ✅ متعدد اللغات (ar, en, fr)
- ✅ Responsive
- ✅ Dark Mode
- ✅ RTL Support

---

## 🎨 التخصيص السريع

### تغيير الألوان

```css
/* في CertificatesGallery.css */
.certificate-card {
  --primary: #304B60;
  --accent: #D48161;
}
```

### تغيير عدد الأعمدة

```css
.certificates-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  /* غير 250px حسب الحاجة */
}
```

---

## 🐛 استكشاف الأخطاء السريع

### الصور لا تظهر؟
```javascript
// تحقق من placeholder
// يجب أن يكون في: frontend/public/certificate-placeholder.svg
```

### API لا يعمل؟
```javascript
// تحقق من:
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Token:', localStorage.getItem('token'));
```

### الفلترة لا تعمل؟
```javascript
// تحقق من status في البيانات
// يجب أن يكون: 'active' أو 'revoked'
```

---

## 📱 اختبار سريع

```bash
# 1. تشغيل Frontend
cd frontend
npm run dev

# 2. افتح المتصفح
http://localhost:3000/profile

# 3. تحقق من:
# - عرض الشهادات ✅
# - الفلترة تعمل ✅
# - الترتيب يعمل ✅
# - الصور تظهر ✅
```

---

## 🎯 أمثلة سريعة

### مثال 1: ملف شخصي خاص
```jsx
<CertificatesGallery 
  userId={currentUserId} 
  isOwnProfile={true} 
/>
```

### مثال 2: ملف شخصي عام
```jsx
<CertificatesGallery 
  userId={viewedUserId} 
  isOwnProfile={false} 
/>
```

### مثال 3: في صفحة منفصلة
```jsx
function CertificatesPage() {
  return (
    <div className="page-container">
      <h1>شهاداتي</h1>
      <CertificatesGallery 
        userId={userId} 
        isOwnProfile={true} 
      />
    </div>
  );
}
```

---

## ✅ Checklist

- [ ] استيراد المكون
- [ ] تمرير userId
- [ ] تمرير isOwnProfile
- [ ] إعداد API endpoint
- [ ] إعداد VITE_API_URL
- [ ] إضافة placeholder SVG
- [ ] اختبار على Mobile
- [ ] اختبار الفلترة
- [ ] اختبار الترتيب
- [ ] اختبار تحميل PDF

---

## 📚 المزيد من المعلومات

- 📄 [دليل التنفيذ الشامل](./CERTIFICATES_GALLERY_IMPLEMENTATION.md)
- 📄 [أمثلة الاستخدام](../../frontend/src/examples/CertificatesGalleryExample.jsx)

---

**تاريخ الإنشاء**: 2026-03-13  
**الحالة**: ✅ جاهز للاستخدام
