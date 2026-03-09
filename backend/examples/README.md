# Certificate PDF Examples

## 📋 نظرة عامة

هذا المجلد يحتوي على أمثلة كاملة لاستخدام نظام توليد شهادات PDF.

---

## 📁 الملفات

### certificatePDFExample.js
أمثلة شاملة لتوليد شهادات PDF:
- مثال 1: توليد PDF مباشرة
- مثال 2: توليد عدة شهادات (Batch)
- مثال 3: استخدام مع CertificateService
- مثال 4: توليد ورفع إلى Cloudinary
- مثال 5: اختبار الأداء
- مثال 6: مع توقيع مخصص

---

## 🚀 التشغيل

### تشغيل جميع الأمثلة
```bash
cd backend
node examples/certificatePDFExample.js
```

### تشغيل مثال واحد
```javascript
const examples = require('./examples/certificatePDFExample');

// مثال 1 فقط
await examples.example1_DirectPDFGeneration();

// اختبار الأداء فقط
await examples.example5_PerformanceTest();
```

---

## 📦 المتطلبات

```bash
# تثبيت التبعيات
npm install pdfkit qrcode
```

---

## 📂 المخرجات

جميع ملفات PDF المولدة تُحفظ في:
```
backend/examples/output/
├── certificate-example-1.pdf
├── certificate-أحمد محمد.pdf
├── certificate-فاطمة علي.pdf
├── certificate-محمد حسن.pdf
└── certificate-with-signature.pdf
```

---

## 🎯 النتائج المتوقعة

عند تشغيل الأمثلة، يجب أن ترى:
```
✅ PDF generated successfully!
⚡ Generation time: 1234ms
📦 File size: 87.45 KB
💾 Saved to: backend/examples/output/certificate-example-1.pdf
```

---

## 🐛 استكشاف الأخطاء

### "Cannot find module 'pdfkit'"
```bash
npm install pdfkit qrcode
```

### "Logo not found"
```bash
# أضف الشعار في:
backend/assets/logo.png

# أو استخدم placeholder (يعمل تلقائياً)
```

### "MongoDB connection error" (للأمثلة 3 و 4)
```bash
# تأكد من:
# 1. MongoDB يعمل
# 2. MONGODB_URI في .env صحيح
# 3. الشهادة موجودة في قاعدة البيانات
```

---

## 📚 المزيد

للتفاصيل الكاملة، راجع:
- [PDF_GENERATOR_IMPLEMENTATION.md](../../docs/Certificates/PDF_GENERATOR_IMPLEMENTATION.md)
- [PDF_GENERATOR_QUICK_START.md](../../docs/Certificates/PDF_GENERATOR_QUICK_START.md)

---

**ملاحظة**: الأمثلة 3 و 4 تتطلب اتصال MongoDB و Cloudinary. باقي الأمثلة تعمل بدون اتصال.
