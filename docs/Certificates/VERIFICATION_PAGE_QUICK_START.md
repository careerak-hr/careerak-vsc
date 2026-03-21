# دليل البدء السريع - صفحة التحقق من الشهادات مع QR Code
# Quick Start Guide - Certificate Verification Page with QR Code

⏱️ **الوقت المتوقع**: 5 دقائق

---

## 🚀 البدء السريع

### 1. الوصول إلى صفحة التحقق (دقيقة واحدة)

```
https://careerak.com/verify/{certificateId}
```

**مثال**:
```
https://careerak.com/verify/550e8400-e29b-41d4-a716-446655440000
```

---

### 2. استخدام في المكونات (دقيقتان)

```jsx
import { useNavigate } from 'react-router-dom';

function CertificateCard({ certificateId }) {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(`/verify/${certificateId}`)}>
      التحقق من الشهادة
    </button>
  );
}
```

---

### 3. استخدام API (دقيقتان)

```javascript
// التحقق من شهادة
const response = await fetch(`/api/verify/${certificateId}`);
const data = await response.json();

if (data.success && data.found) {
  console.log('✅ شهادة صالحة:', data.certificate);
} else {
  console.log('❌ شهادة غير صالحة');
}
```

---

## 🎨 الميزات الرئيسية

### ✅ التحقق التلقائي
- يتم التحقق تلقائياً عند فتح الصفحة
- عرض حالة الشهادة (صالحة، ملغاة، منتهية)

### 📱 QR Code
```jsx
// عرض QR Code
<button onClick={() => setShowQrCode(!showQrCode)}>
  {showQrCode ? 'إخفاء QR Code' : 'مشاركة QR Code'}
</button>

// تحميل QR Code
<button onClick={downloadQrCode}>
  تحميل QR Code
</button>
```

### 🔗 نسخ الرابط
```jsx
<button onClick={copyVerificationLink}>
  نسخ رابط التحقق
</button>
```

---

## 🌍 دعم اللغات

```javascript
// العربية
const t = translations.ar;

// الإنجليزية
const t = translations.en;

// الفرنسية
const t = translations.fr;
```

---

## 📱 التصميم المتجاوب

- ✅ **Mobile**: < 768px
- ✅ **Tablet**: 768px - 1023px
- ✅ **Desktop**: >= 1024px

---

## 🎨 الألوان

```css
--primary: #304B60;      /* كحلي */
--secondary: #E3DAD1;    /* بيج */
--accent: #D48161;       /* نحاسي */
--valid: #10B981;        /* أخضر */
--invalid: #DC2626;      /* أحمر */
```

---

## 🔌 API Endpoints

### التحقق من شهادة واحدة
```
GET /api/verify/:certificateId
```

### البحث عن شهادات
```
GET /api/verify/search?q=query
```

### التحقق من عدة شهادات
```
POST /api/verify/bulk
```

---

## 📊 مثال كامل

```jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode';

function VerificationPage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    // التحقق من الشهادة
    fetch(`/api/verify/${certificateId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCertificate(data.certificate);
          
          // توليد QR Code
          QRCode.toDataURL(data.certificate.links.verification)
            .then(url => setQrCodeUrl(url));
        }
      });
  }, [certificateId]);

  if (!certificate) return <div>جاري التحقق...</div>;

  return (
    <div>
      <h1>{certificate.status.isValid ? '✅ شهادة صالحة' : '❌ شهادة غير صالحة'}</h1>
      <p>الحامل: {certificate.holder.name}</p>
      <p>الدورة: {certificate.course.name}</p>
      
      {qrCodeUrl && (
        <img src={qrCodeUrl} alt="QR Code" />
      )}
    </div>
  );
}
```

---

## 🧪 الاختبار السريع

### 1. اختبار شهادة صالحة
```
https://careerak.com/verify/550e8400-e29b-41d4-a716-446655440000
```

### 2. اختبار شهادة غير موجودة
```
https://careerak.com/verify/invalid-id
```

### 3. اختبار QR Code
1. افتح صفحة التحقق
2. اضغط "مشاركة QR Code"
3. اضغط "تحميل QR Code"

---

## 📚 المزيد من المعلومات

- 📄 [التوثيق الشامل](./VERIFICATION_PAGE_WITH_QR.md)
- 📄 [أمثلة الاستخدام](../frontend/src/examples/VerificationPageExample.jsx)
- 📄 [Requirements](../.kiro/specs/certificates-achievements/requirements.md)

---

## ✅ Checklist

- [x] صفحة التحقق تعمل
- [x] QR Code يظهر
- [x] نسخ الرابط يعمل
- [x] تحميل QR Code يعمل
- [x] دعم اللغات يعمل
- [x] التصميم متجاوب

---

**تاريخ الإنشاء**: 2026-03-13  
**الحالة**: ✅ جاهز للاستخدام
