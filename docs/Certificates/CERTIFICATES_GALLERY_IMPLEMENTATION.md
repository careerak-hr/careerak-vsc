# معرض الشهادات - دليل التنفيذ الشامل

## 📋 معلومات الوثيقة
- **التاريخ**: 2026-03-13
- **الحالة**: ✅ مكتمل
- **المتطلبات**: Requirements 4.1, 4.2, 4.3, 4.4, 4.5

---

## 🎯 نظرة عامة

معرض الشهادات هو مكون React شامل لعرض جميع شهادات المستخدم بطريقة جذابة واحترافية مع صور مصغرة، فلترة، ترتيب، وإدارة كاملة.

---

## ✨ الميزات الرئيسية

### 1. عرض الشهادات
- ✅ عرض جميع الشهادات في شبكة (Grid) أو قائمة (List)
- ✅ صور مصغرة عالية الجودة لكل شهادة
- ✅ معلومات كاملة (اسم الدورة، تاريخ الإصدار، الحالة)
- ✅ Lazy loading للصور
- ✅ Placeholder احترافي عند عدم وجود صورة

### 2. الفلترة والترتيب
- ✅ فلترة حسب الحالة:
  - الكل (All)
  - نشطة (Active)
  - ملغاة (Revoked)
- ✅ ترتيب حسب:
  - التاريخ (الأحدث أولاً)
  - الاسم (أبجدياً)

### 3. أوضاع العرض
- ✅ وضع الشبكة (Grid): 2-3 أعمدة حسب حجم الشاشة
- ✅ وضع القائمة (List): عرض أفقي مع تفاصيل أكثر

### 4. الإجراءات
- ✅ تحميل PDF الشهادة
- ✅ التحقق من الشهادة (فتح صفحة التحقق)
- ✅ إخفاء/إظهار شهادات (للمالك فقط)

### 5. التصميم
- ✅ تصميم متجاوب (Mobile, Tablet, Desktop)
- ✅ دعم متعدد اللغات (ar, en, fr)
- ✅ RTL Support كامل
- ✅ Dark Mode Support
- ✅ Accessibility كامل
- ✅ Print Styles
- ✅ Animations سلسة

---

## 📁 البنية

```
frontend/src/
├── components/Certificates/
│   ├── CertificatesGallery.jsx       # المكون الرئيسي
│   └── CertificatesGallery.css       # التنسيقات
├── examples/
│   └── CertificatesGalleryExample.jsx # أمثلة استخدام
└── public/
    └── certificate-placeholder.svg    # Placeholder احترافي
```

---

## 🚀 الاستخدام

### مثال أساسي

```jsx
import CertificatesGallery from './components/Certificates/CertificatesGallery';

function ProfilePage() {
  const userId = localStorage.getItem('userId');

  return (
    <div className="profile-page">
      <CertificatesGallery 
        userId={userId} 
        isOwnProfile={true} 
      />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userId` | string | ✅ Yes | - | معرف المستخدم |
| `isOwnProfile` | boolean | ❌ No | false | هل هو الملف الشخصي للمستخدم الحالي |

---

## 🎨 التصميم

### الألوان

```css
--primary: #304B60      /* كحلي */
--secondary: #E3DAD1    /* بيج */
--accent: #D48161       /* نحاسي */
```

### Breakpoints

```css
Mobile:  < 640px
Tablet:  640px - 1023px
Desktop: >= 1024px
```

### Grid Layout

```css
/* Desktop: 3 columns */
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

/* Tablet: 2 columns */
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

/* Mobile: 1 column */
grid-template-columns: 1fr;
```

---

## 🔧 API Integration

### Endpoint: GET /api/certificates

**Request:**
```javascript
GET /api/certificates?userId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response:**
```json
{
  "certificates": [
    {
      "_id": "cert-001",
      "certificateId": "CERT-2024-001",
      "userId": "507f1f77bcf86cd799439011",
      "courseId": "course-001",
      "courseName": "تطوير تطبيقات الويب الحديثة",
      "issueDate": "2024-01-15T10:00:00Z",
      "expiryDate": null,
      "status": "active",
      "isHidden": false,
      "pdfUrl": "https://example.com/certificates/cert-001.pdf",
      "thumbnailUrl": "https://example.com/certificates/cert-001-thumb.jpg",
      "verificationUrl": "https://careerak.com/verify/CERT-2024-001"
    }
  ]
}
```

### Endpoint: PATCH /api/certificates/:id/visibility

**Request:**
```javascript
PATCH /api/certificates/cert-001/visibility
Authorization: Bearer <token>
Content-Type: application/json

{
  "isHidden": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Visibility updated successfully"
}
```

---

## 🖼️ الصور المصغرة

### توليد Thumbnails

المكون يدعم 3 طرق للحصول على الصور المصغرة:

1. **Thumbnail URL مباشر** (الأفضل):
```javascript
thumbnailUrl: "https://cloudinary.com/certificates/cert-001-thumb.jpg"
```

2. **توليد من PDF URL**:
```javascript
// يحول .pdf إلى -thumbnail.jpg
pdfUrl: "https://example.com/cert-001.pdf"
// يصبح: "https://example.com/cert-001-thumbnail.jpg"
```

3. **Placeholder SVG**:
```javascript
// عند عدم وجود صورة
src="/certificate-placeholder.svg"
```

### Cloudinary Integration (موصى به)

```javascript
// في Backend عند إنشاء الشهادة
const thumbnailUrl = cloudinary.url(certificateId, {
  transformation: [
    { width: 600, height: 400, crop: 'fill' },
    { quality: 'auto' },
    { format: 'jpg' }
  ]
});
```

---

## 🎭 الحالات

### 1. Loading State
```jsx
<div className="loading-state">
  جاري التحميل...
</div>
```

### 2. Error State
```jsx
<div className="error-state">
  حدث خطأ أثناء تحميل الشهادات
</div>
```

### 3. Empty State
```jsx
<div className="empty-state">
  لا توجد شهادات بعد
</div>
```

### 4. Certificate States
- **Active**: شهادة نشطة (الحالة الافتراضية)
- **Revoked**: شهادة ملغاة (border أحمر + badge)
- **Hidden**: شهادة مخفية (opacity 0.6 + badge)

---

## ♿ Accessibility

### ARIA Labels
```jsx
<button 
  className="action-btn download"
  aria-label="تحميل الشهادة"
  title="تحميل"
>
  <i className="fas fa-download"></i>
</button>
```

### Keyboard Navigation
- ✅ Tab للتنقل بين الأزرار
- ✅ Enter/Space لتفعيل الأزرار
- ✅ Focus indicators واضحة

### Screen Readers
- ✅ Alt text لجميع الصور
- ✅ ARIA labels للأزرار
- ✅ Semantic HTML

---

## 📱 التصميم المتجاوب

### Mobile (< 640px)
- عمود واحد
- أزرار أكبر (min 44x44px)
- Controls عمودية
- Font sizes أصغر

### Tablet (640px - 1023px)
- عمودين
- Controls أفقية
- Font sizes متوسطة

### Desktop (>= 1024px)
- 3 أعمدة
- Controls أفقية
- Font sizes كاملة

---

## 🌙 Dark Mode

```css
@media (prefers-color-scheme: dark) {
  .certificates-gallery {
    background: #1a1a1a;
  }

  .certificate-card {
    background: #2a2a2a;
    color: #e0e0e0;
  }
}
```

---

## 🖨️ Print Styles

```css
@media print {
  .gallery-controls,
  .certificate-actions {
    display: none;
  }

  .certificate-card {
    break-inside: avoid;
  }
}
```

---

## 🎬 Animations

### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover Effects
```css
.certificate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .certificate-card {
    transition: none;
    animation: none;
  }
}
```

---

## 🧪 الاختبار

### Manual Testing Checklist

- [ ] عرض الشهادات في وضع Grid
- [ ] عرض الشهادات في وضع List
- [ ] فلترة حسب الحالة (الكل، نشطة، ملغاة)
- [ ] ترتيب حسب التاريخ
- [ ] ترتيب حسب الاسم
- [ ] تحميل PDF
- [ ] التحقق من الشهادة
- [ ] إخفاء/إظهار شهادة
- [ ] Lazy loading للصور
- [ ] Placeholder عند فشل تحميل الصورة
- [ ] Responsive على Mobile
- [ ] Responsive على Tablet
- [ ] Responsive على Desktop
- [ ] RTL Support
- [ ] Dark Mode
- [ ] Keyboard Navigation
- [ ] Screen Reader Support

---

## 🐛 استكشاف الأخطاء

### المشكلة: الصور لا تظهر

**الحل:**
```javascript
// تحقق من onError handler
onError={(e) => {
  console.log('Image failed to load:', e.target.src);
  e.target.src = '/certificate-placeholder.svg';
}}
```

### المشكلة: API لا يعمل

**الحل:**
```javascript
// تحقق من VITE_API_URL
console.log('API URL:', import.meta.env.VITE_API_URL);

// تحقق من token
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Present' : 'Missing');
```

### المشكلة: الفلترة لا تعمل

**الحل:**
```javascript
// تحقق من filter state
console.log('Current filter:', filter);
console.log('Filtered certificates:', getFilteredCertificates());
```

---

## 🚀 التحسينات المستقبلية

### المرحلة 1 (قريباً)
- [ ] Drag & Drop لإعادة الترتيب
- [ ] تصدير جميع الشهادات كـ ZIP
- [ ] مشاركة على وسائل التواصل الاجتماعي

### المرحلة 2 (مستقبلاً)
- [ ] Infinite scroll
- [ ] Virtual scrolling للأداء
- [ ] Bulk actions (إخفاء/إظهار متعدد)
- [ ] Search/Filter متقدم

---

## 📚 المراجع

- [React Documentation](https://react.dev/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Responsive Design Best Practices](https://web.dev/responsive-web-design-basics/)

---

## ✅ الخلاصة

معرض الشهادات الآن:
- ✅ يعرض جميع الشهادات بصور مصغرة احترافية
- ✅ يدعم الفلترة والترتيب
- ✅ متجاوب على جميع الأجهزة
- ✅ يدعم متعدد اللغات
- ✅ Accessible بالكامل
- ✅ جاهز للإنتاج

**تاريخ الإنشاء**: 2026-03-13  
**الحالة**: ✅ مكتمل ومفعّل
