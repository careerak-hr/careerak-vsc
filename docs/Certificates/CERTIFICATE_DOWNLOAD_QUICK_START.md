# Certificate Download - دليل البدء السريع

## الاستخدام في 30 ثانية

### 1. تحميل مباشر (أبسط طريقة)

```javascript
// في Frontend - فتح في نافذة جديدة
const certificateId = 'abc-123-def-456';
window.open(`${API_URL}/api/certificates/${certificateId}/download`, '_blank');
```

### 2. زر تحميل React

```jsx
const DownloadButton = ({ certificateId }) => (
  <a
    href={`${API_URL}/api/certificates/${certificateId}/download`}
    download
    className="btn btn-primary"
  >
    تحميل الشهادة
  </a>
);
```

### 3. تحميل مع fetch

```javascript
const download = async (certificateId) => {
  const response = await fetch(
    `${API_URL}/api/certificates/${certificateId}/download`
  );
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'certificate.pdf';
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

## API Endpoint

```
GET /api/certificates/:certificateId/download
```

**لا يحتاج authentication** ✅

---

## الاختبار

```bash
# في المتصفح
https://your-domain.com/api/certificates/abc-123/download

# مع curl
curl -O https://your-domain.com/api/certificates/abc-123/download

# تشغيل الاختبارات
cd backend
npm test -- certificateDownload.test.js
```

---

## الميزات

- ✅ جودة 300 DPI (طباعة احترافية)
- ✅ اسم ملف مخصص (certificate-{name}-{course}.pdf)
- ✅ عام (لا يحتاج تسجيل دخول)
- ✅ يعمل على جميع الأجهزة

---

## التوثيق الكامل

📄 `docs/CERTIFICATE_DOWNLOAD_ENDPOINT.md` - دليل شامل مع أمثلة كاملة

---

تم إضافة Certificate Download بنجاح - 2026-03-07
