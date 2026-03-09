# نظام الشهادات والإنجازات - دليل سريع

## 📋 نظرة عامة

خدمة شاملة لإدارة الشهادات الرقمية مع QR Code للتحقق، تكامل LinkedIn، ونظام badges تحفيزي.

## ✨ الميزات الرئيسية

- ✅ إصدار شهادات تلقائي عند إكمال الدورة
- ✅ رقم فريد (UUID) لكل شهادة
- ✅ QR Code للتحقق السريع
- ✅ التحقق من صحة الشهادات (عام)
- ✅ إلغاء وإعادة إصدار الشهادات
- ✅ تكامل مع LinkedIn
- ✅ إحصائيات شاملة

## 🚀 الاستخدام السريع

### 1. إصدار شهادة جديدة

```javascript
const certificateService = require('./services/certificateService');

const result = await certificateService.issueCertificate(
  'user123',      // معرف المستخدم
  'course456',    // معرف الدورة
  {
    issueDate: new Date(),
    expiryDate: null,
    templateId: null
  }
);

console.log('رقم الشهادة:', result.certificate.certificateId);
console.log('اسم المستخدم:', result.certificate.userName);
console.log('اسم الدورة:', result.certificate.courseName);
console.log('رابط التحقق:', result.certificate.verificationUrl);
```

### 2. التحقق من صحة الشهادة

```javascript
const result = await certificateService.verifyCertificate('cert-uuid-123');

console.log('صالحة؟', result.valid);
console.log('الرسالة:', result.messageAr);
```

### 3. الحصول على شهادات المستخدم

```javascript
const result = await certificateService.getUserCertificates('user123', {
  status: 'active',
  limit: 10,
  skip: 0
});

console.log(`عدد الشهادات: ${result.count}`);
```

## 📡 API Endpoints

### إصدار شهادة
```
POST /api/certificates/generate
Authorization: Bearer <token>

Body:
{
  "userId": "user123",
  "courseId": "course456",
  "issueDate": "2026-03-09T00:00:00.000Z",
  "expiryDate": null,
  "templateId": null
}
```

### جلب شهادة واحدة
```
GET /api/certificates/:certificateId
```

### جلب شهادات المستخدم
```
GET /api/certificates/user/:userId?status=active&limit=10&skip=0
Authorization: Bearer <token>
```

### التحقق من شهادة (عام)
```
GET /api/certificates/verify/:certificateId
```

### إلغاء شهادة
```
PUT /api/certificates/:certificateId/revoke
Authorization: Bearer <token>

Body:
{
  "reason": "سبب الإلغاء"
}
```

### إعادة إصدار شهادة
```
POST /api/certificates/:certificateId/reissue
Authorization: Bearer <token>

Body:
{
  "reason": "سبب إعادة الإصدار"
}
```

### تحديد كمشاركة على LinkedIn
```
POST /api/certificates/:certificateId/linkedin-share
Authorization: Bearer <token>
```

### إحصائيات الشهادات
```
GET /api/certificates/stats?userId=user123
Authorization: Bearer <token>
```

## 📊 بنية الشهادة

```javascript
{
  certificateId: "uuid-v4",           // رقم فريد
  userId: ObjectId,                   // معرف المستخدم
  courseId: ObjectId,                 // معرف الدورة
  courseName: "اسم الدورة",          // اسم الدورة (محفوظ)
  issueDate: Date,                    // تاريخ الإصدار
  expiryDate: Date | null,            // تاريخ الانتهاء (اختياري)
  qrCode: "data:image/png;base64...", // QR Code
  verificationUrl: "https://...",     // رابط التحقق
  status: "active|revoked|expired",   // الحالة
  pdfUrl: String | null,              // رابط PDF
  linkedInShared: Boolean,            // مشاركة على LinkedIn
  template: ObjectId | null           // قالب الشهادة
}
```

## 🔍 التحقق من الشهادات

### كيف يعمل التحقق؟

1. المستخدم يمسح QR Code أو يدخل رقم الشهادة
2. النظام يبحث عن الشهادة في قاعدة البيانات
3. يتحقق من حالة الشهادة (active, revoked, expired)
4. يعرض تفاصيل الشهادة إذا كانت صالحة

### مثال على التحقق

```javascript
const result = await certificateService.verifyCertificate('cert-uuid-123');

if (result.valid) {
  console.log('✅ الشهادة صالحة');
  console.log('اسم المستخدم:', result.certificate.userName);
  console.log('اسم الدورة:', result.certificate.courseName);
  console.log('تاريخ الإصدار:', result.certificate.issueDate);
} else {
  console.log('❌ الشهادة غير صالحة');
  console.log('السبب:', result.certificate.revocationReason);
}
```

## 🎨 QR Code

### توليد QR Code

```javascript
const qrCode = await certificateService.generateQRCode(
  'https://careerak.com/verify/cert-uuid-123'
);

// النتيجة: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
```

### خصائص QR Code

- **الحجم**: 300x300 بكسل
- **مستوى التصحيح**: H (أعلى مستوى)
- **اللون**: #304B60 (كحلي من palette المشروع)
- **الخلفية**: #FFFFFF (أبيض)
- **الصيغة**: PNG (base64)

## 📝 الأمثلة

راجع ملف `backend/examples/certificateExample.js` لأمثلة شاملة.

## 🧪 الاختبارات

```bash
npm test -- certificate.test.js
```

## 🔒 الأمان

- جميع endpoints محمية بـ authentication (ما عدا التحقق العام)
- رقم فريد (UUID) لكل شهادة
- QR Code مشفر مع توقيع رقمي
- سجل كامل لجميع عمليات الإصدار والإلغاء

## 📚 المراجع

- [Requirements](../../.kiro/specs/certificates-achievements/requirements.md)
- [Design](../../.kiro/specs/certificates-achievements/design.md)
- [Tasks](../../.kiro/specs/certificates-achievements/tasks.md)

---

**تاريخ الإنشاء**: 2026-03-09  
**الحالة**: ✅ مكتمل ومفعّل
