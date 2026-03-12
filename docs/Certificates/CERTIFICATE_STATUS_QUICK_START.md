# عرض حالة الشهادة - دليل البدء السريع

## ⚡ البدء السريع (5 دقائق)

### 1. استيراد المكون

```jsx
import CertificateStatus from '../components/Certificates/CertificateStatus';
```

### 2. الاستخدام الأساسي

```jsx
// شهادة صالحة
<CertificateStatus
  status="active"
  expiryDate="2025-12-31T23:59:59.000Z"
/>

// شهادة منتهية
<CertificateStatus
  status="active"
  expiryDate="2024-01-01T00:00:00.000Z"
/>

// شهادة ملغاة
<CertificateStatus
  status="revoked"
  revocationReason="Certificate was revoked due to policy violation"
/>
```

### 3. مع API

```jsx
const [certificate, setCertificate] = useState(null);

useEffect(() => {
  fetch(`/api/certificates/verify/${certificateId}`)
    .then(res => res.json())
    .then(data => setCertificate(data.certificate));
}, [certificateId]);

return certificate && (
  <CertificateStatus
    status={certificate.status}
    expiryDate={certificate.expiryDate}
    revocationReason={certificate.revocationReason}
  />
);
```

---

## 🎨 الحالات الثلاث

### ✅ صالحة (Valid)
```jsx
<CertificateStatus status="active" />
```
- أيقونة: ✅
- لون: أخضر

### ⏰ منتهية (Expired)
```jsx
<CertificateStatus 
  status="active" 
  expiryDate="2024-01-01T00:00:00.000Z" 
/>
```
- أيقونة: ⏰
- لون: برتقالي

### ❌ ملغاة (Revoked)
```jsx
<CertificateStatus 
  status="revoked" 
  revocationReason="Policy violation" 
/>
```
- أيقونة: ❌
- لون: أحمر

---

## 🚀 صفحة التحقق الكاملة

### إضافة Route

```jsx
// في App.jsx
import CertificateVerificationPage from './pages/CertificateVerificationPage';

<Route 
  path="/verify/:certificateId" 
  element={<CertificateVerificationPage />} 
/>
```

### الاستخدام

```
https://careerak.com/verify/550e8400-e29b-41d4-a716-446655440000
```

---

## 📋 Props

| Prop | Type | Required | Example |
|------|------|----------|---------|
| `status` | string | ✅ | 'active', 'revoked' |
| `expiryDate` | string | ❌ | '2025-12-31T23:59:59.000Z' |
| `revocationReason` | string | ❌ | 'Policy violation' |
| `className` | string | ❌ | 'my-custom-class' |

---

## 🎨 التخصيص

### إضافة CSS مخصص

```jsx
<CertificateStatus
  status="active"
  className="my-custom-status"
/>
```

```css
.my-custom-status {
  border-radius: 20px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

---

## 🧪 الاختبار

### اختبار سريع

```bash
# Frontend
cd frontend
npm start

# افتح المتصفح
http://localhost:3000/verify/test-certificate-id
```

### أمثلة الاستخدام

```bash
# افتح صفحة الأمثلة
http://localhost:3000/examples/certificate-status
```

---

## ✅ Checklist

- [ ] استيراد المكون
- [ ] إضافة Props المطلوبة
- [ ] اختبار الحالات الثلاث
- [ ] إضافة Route للتحقق
- [ ] اختبار على الموبايل
- [ ] اختبار Dark Mode
- [ ] اختبار RTL/LTR

---

## 🆘 استكشاف الأخطاء

### المكون لا يظهر؟
```bash
# تأكد من استيراد CSS
import './CertificateStatus.css';
```

### الألوان غير صحيحة؟
```bash
# تأكد من status صحيح
status="active" // ✅
status="Active" // ❌
```

### التاريخ لا يعمل؟
```bash
# استخدم ISO 8601 format
expiryDate="2025-12-31T23:59:59.000Z" // ✅
expiryDate="31/12/2025" // ❌
```

---

## 📚 المزيد من المعلومات

- [التوثيق الكامل](./CERTIFICATE_STATUS_DISPLAY.md)
- [أمثلة الاستخدام](../../frontend/src/examples/CertificateStatusExample.jsx)
- [صفحة التحقق](../../frontend/src/pages/CertificateVerificationPage.jsx)

---

**تم إنشاؤه**: 2026-03-09  
**الحالة**: ✅ جاهز للاستخدام
