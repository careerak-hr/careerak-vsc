# PDF Generator - دليل البدء السريع

## ⚡ البدء في 5 دقائق

### 1. التثبيت (دقيقة واحدة)

```bash
cd backend
npm install pdfkit qrcode
```

### 2. إضافة الشعار (دقيقة واحدة)

```bash
# ضع شعار Careerak في:
backend/assets/logo.png

# أو استخدم placeholder (يعمل تلقائياً)
```

### 3. الاستخدام الأساسي (3 دقائق)

```javascript
const certificateService = require('./services/certificateService');

// توليد PDF
const pdfBuffer = await certificateService.generatePDF('certificate-id-here');

// حفظ محلياً
fs.writeFileSync('certificate.pdf', pdfBuffer);

// أو رفع إلى Cloudinary
const result = await certificateService.generateAndUploadPDF('certificate-id-here');
console.log('PDF URL:', result.pdfUrl);
```

### 4. API Endpoint (دقيقة واحدة)

```javascript
// GET /api/certificates/:id/pdf
router.get('/certificates/:id/pdf', async (req, res) => {
  const pdfBuffer = await certificateService.generatePDF(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
});
```

---

## 🎨 التخصيص السريع

### تغيير الألوان

```javascript
// في pdfGenerator.js
this.colors = {
  primary: '#304B60',    // كحلي
  accent: '#D48161',     // نحاسي
  // غيّر حسب الحاجة
};
```

### إضافة توقيع

```javascript
const certificateData = {
  // ... بيانات أخرى
  instructorName: 'د. محمد علي',
  instructorSignature: 'backend/assets/signatures/instructor-123.png'
};
```

---

## ✅ اختبار سريع

```bash
# في backend/
node -e "
const service = require('./src/services/certificateService');
const fs = require('fs');

(async () => {
  const pdf = await service.generatePDF('test-id');
  fs.writeFileSync('test.pdf', pdf);
  console.log('✅ PDF created: test.pdf');
})();
"
```

---

## 📚 المزيد

للتفاصيل الكاملة، راجع:
- [PDF_GENERATOR_IMPLEMENTATION.md](./PDF_GENERATOR_IMPLEMENTATION.md)

---

**وقت الإعداد الكلي**: 5 دقائق  
**الحالة**: ✅ جاهز للاستخدام
