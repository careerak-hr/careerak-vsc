# دليل البدء السريع - إخفاء/إظهار الشهادات

## ⚡ البدء السريع (5 دقائق)

### Backend

#### 1. API Endpoint
```javascript
PATCH /api/certificates/:certificateId/visibility
Authorization: Bearer <token>
Content-Type: application/json

{
  "isHidden": true  // true للإخفاء، false للإظهار
}
```

#### 2. مثال cURL
```bash
# إخفاء شهادة
curl -X PATCH \
  https://careerak.com/api/certificates/abc123/visibility \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isHidden": true}'

# إظهار شهادة
curl -X PATCH \
  https://careerak.com/api/certificates/abc123/visibility \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isHidden": false}'
```

---

### Frontend

#### 1. استخدام المكون
```jsx
import CertificatesGallery from './components/Certificates/CertificatesGallery';

function ProfilePage() {
  const { user } = useApp();
  
  return (
    <div>
      <h1>ملفي الشخصي</h1>
      <CertificatesGallery 
        userId={user._id} 
        isOwnProfile={true}  // مهم: يظهر زر الإخفاء/الإظهار
      />
    </div>
  );
}
```

#### 2. استدعاء API مباشرة
```javascript
const toggleVisibility = async (certificateId, isHidden) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `${API_URL}/api/certificates/${certificateId}/visibility`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isHidden: !isHidden })
    }
  );
  
  const data = await response.json();
  console.log(data.message); // "Certificate visibility updated to hidden"
};
```

---

## 🧪 الاختبار

### اختبار Backend
```bash
cd backend
npm test -- certificateVisibility.test.js
```

### اختبار يدوي
1. افتح معرض الشهادات
2. انقر على أيقونة العين لإخفاء شهادة
3. تحقق من ظهور badge "مخفية"
4. انقر مرة أخرى للإظهار
5. تحقق من اختفاء badge "مخفية"

---

## 🎨 التخصيص

### تغيير الألوان
```css
/* في CertificatesGallery.css */
.certificate-card.hidden {
  opacity: 0.6;
  border: 2px dashed #YOUR_COLOR;
}

.hidden-badge {
  background: rgba(YOUR_COLOR, 0.9);
}

.action-btn.visibility {
  background: #YOUR_COLOR;
}
```

### تغيير الأيقونات
```jsx
// في CertificatesGallery.jsx
<i className={`fas ${certificate.isHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>

// أو استخدم أيقونات مخصصة
<i className={`custom-icon ${certificate.isHidden ? 'show' : 'hide'}`}></i>
```

---

## 🔒 الأمان

### التحقق من الصلاحيات
```javascript
// Backend - في certificateService.js
if (certificate.userId.toString() !== userId.toString()) {
  throw new Error('Unauthorized: You can only update your own certificates');
}
```

### Frontend - إخفاء الزر للزوار
```jsx
{isOwnProfile && (
  <button onClick={() => toggleVisibility(cert._id, cert.isHidden)}>
    {cert.isHidden ? 'إظهار' : 'إخفاء'}
  </button>
)}
```

---

## 📊 الاستعلامات الشائعة

### جلب الشهادات المرئية فقط
```javascript
const visibleCertificates = await Certificate.find({
  userId: userId,
  isHidden: false
});
```

### جلب جميع الشهادات (للمالك)
```javascript
const allCertificates = await Certificate.find({
  userId: userId
});
```

### عد الشهادات المخفية
```javascript
const hiddenCount = await Certificate.countDocuments({
  userId: userId,
  isHidden: true
});
```

---

## 🐛 استكشاف الأخطاء السريع

| المشكلة | الحل |
|---------|------|
| 401 Unauthorized | تحقق من JWT token |
| 403 Forbidden | المستخدم ليس مالك الشهادة |
| 404 Not Found | certificateId غير صحيح |
| 400 Bad Request | isHidden ليس boolean |

---

## 📚 المراجع

- 📄 [التوثيق الكامل](./CERTIFICATE_VISIBILITY_IMPLEMENTATION.md)
- 📄 [اختبارات Backend](../backend/tests/certificateVisibility.test.js)
- 📄 [مكون Frontend](../frontend/src/components/Certificates/CertificatesGallery.jsx)

---

**تاريخ الإنشاء**: 2026-03-13  
**الحالة**: جاهز للاستخدام
