# Certificate Download Endpoint - توثيق

## نظرة عامة

تم إضافة endpoint جديد لتحميل شهادات PDF بجودة عالية (300 DPI) مباشرة من النظام.

**تاريخ الإضافة**: 2026-03-07  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Task 3.1 - تحميل PDF بجودة عالية (300 DPI)

---

## الميزات الرئيسية

- ✅ تحميل PDF بجودة 300 DPI
- ✅ اسم ملف مخصص (certificate-{userName}-{courseName}.pdf)
- ✅ عام (لا يحتاج authentication)
- ✅ معالجة أخطاء شاملة
- ✅ دعم الأسماء العربية والإنجليزية

---

## API Endpoint

### تحميل شهادة PDF

**Endpoint**: `GET /api/certificates/:certificateId/download`

**Authentication**: لا يحتاج (عام للتحقق)

**Parameters**:
- `certificateId` (path, required): معرف الشهادة الفريد

**Response Headers**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="certificate-{userName}-{courseName}.pdf"
Content-Length: {size}
```

**Response Body**: PDF file (binary)

---

## أمثلة الاستخدام

### 1. تحميل مباشر في المتصفح

```javascript
// في Frontend
const downloadCertificate = async (certificateId) => {
  const url = `${API_URL}/api/certificates/${certificateId}/download`;
  
  // فتح في نافذة جديدة (تحميل تلقائي)
  window.open(url, '_blank');
};
```

### 2. تحميل باستخدام fetch

```javascript
const downloadCertificate = async (certificateId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/certificates/${certificateId}/download`
    );
    
    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }
    
    // الحصول على اسم الملف من headers
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
      .split('filename=')[1]
      .replace(/"/g, '');
    
    // تحويل إلى blob
    const blob = await response.blob();
    
    // إنشاء رابط تحميل
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // تنظيف
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    alert('فشل تحميل الشهادة');
  }
};
```

### 3. تحميل باستخدام axios

```javascript
import axios from 'axios';

const downloadCertificate = async (certificateId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/certificates/${certificateId}/download`,
      {
        responseType: 'blob'
      }
    );
    
    // الحصول على اسم الملف
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition
      .split('filename=')[1]
      .replace(/"/g, '');
    
    // إنشاء رابط تحميل
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // تنظيف
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    alert('فشل تحميل الشهادة');
  }
};
```

### 4. مكون React كامل

```jsx
import React, { useState } from 'react';
import { Download } from 'lucide-react';

const CertificateDownloadButton = ({ certificateId }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/certificates/${certificateId}/download`
      );
      
      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }
      
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        .split('filename=')[1]
        .replace(/"/g, '');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('فشل تحميل الشهادة');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
    >
      <Download size={20} />
      {downloading ? 'جاري التحميل...' : 'تحميل الشهادة'}
    </button>
  );
};

export default CertificateDownloadButton;
```

---

## استجابات الأخطاء

### شهادة غير موجودة

**Status**: 500 Internal Server Error

```json
{
  "success": false,
  "message": "Certificate not found",
  "messageAr": "حدث خطأ أثناء تحميل الشهادة"
}
```

### خطأ في توليد PDF

**Status**: 500 Internal Server Error

```json
{
  "success": false,
  "message": "Error generating PDF: ...",
  "messageAr": "حدث خطأ أثناء تحميل الشهادة"
}
```

---

## التفاصيل التقنية

### جودة PDF

- **DPI**: 300 (جودة طباعة عالية)
- **الحجم**: A4 Landscape (842 × 595 نقطة)
- **الخطوط**: Amiri (عربي), Cormorant Garamond (إنجليزي)
- **الألوان**: RGB (Primary: #304B60, Secondary: #E3DAD1, Accent: #D48161)

### اسم الملف

يتم توليد اسم الملف تلقائياً بالصيغة:
```
certificate-{userName}-{courseName}.pdf
```

**مثال**:
- المستخدم: "أحمد محمد"
- الدورة: "دورة تطوير الويب"
- اسم الملف: `certificate-أحمد-محمد-دورة-تطوير-الويب.pdf`

**تنظيف الأسماء**:
- إزالة الأحرف الخاصة (ما عدا الحروف والأرقام والمسافات)
- استبدال المسافات بـ `-`
- دعم الأحرف العربية والإنجليزية

### الأمان

- ✅ لا يحتاج authentication (عام للتحقق)
- ✅ لا يكشف معلومات حساسة
- ✅ معالجة أخطاء آمنة (لا تكشف تفاصيل داخلية)

---

## الاختبارات

### تشغيل الاختبارات

```bash
cd backend
npm test -- certificateDownload.test.js
```

### الاختبارات المتضمنة

1. ✅ تحميل PDF بجودة عالية (300 DPI)
2. ✅ اسم الملف يحتوي على اسم المستخدم واسم الدورة
3. ✅ يعمل بدون authentication (عام)
4. ✅ يرجع 500 عند certificateId غير موجود
5. ✅ PDF يحتوي على محتوى (حجم معقول)

---

## الملفات المعدلة

### Backend

1. **`backend/src/controllers/certificateController.js`**
   - إضافة دالة `downloadCertificate`
   - توليد PDF بجودة 300 DPI
   - إعداد headers للتحميل
   - معالجة الأخطاء

2. **`backend/src/routes/certificateRoutes.js`**
   - إضافة route: `GET /:certificateId/download`
   - بدون authentication (عام)
   - قبل route `/:certificateId` لتجنب التعارض

3. **`backend/tests/certificateDownload.test.js`**
   - 5 اختبارات شاملة
   - تغطية جميع الحالات

---

## الفوائد

- 📄 تحميل مباشر للشهادات بجودة طباعة عالية
- 🔗 رابط بسيط وسهل المشاركة
- 🌍 عام للتحقق (لا يحتاج تسجيل دخول)
- 📱 يعمل على جميع الأجهزة والمتصفحات
- 🎨 اسم ملف مخصص ومنظم

---

## ملاحظات مهمة

- الـ endpoint عام (لا يحتاج authentication) لأن الشهادات مصممة للمشاركة والتحقق
- PDF يتم توليده في الوقت الفعلي (لا يتم حفظه)
- جودة 300 DPI مناسبة للطباعة الاحترافية
- يدعم الأسماء العربية والإنجليزية في اسم الملف

---

## المراجع

- 📄 `.kiro/specs/certificates-achievements/requirements.md` - المتطلبات
- 📄 `.kiro/specs/certificates-achievements/design.md` - التصميم
- 📄 `backend/src/services/pdfGenerator.js` - مولد PDF
- 📄 `backend/src/services/certificateService.js` - خدمة الشهادات

---

تم إضافة Certificate Download Endpoint بنجاح - 2026-03-07
