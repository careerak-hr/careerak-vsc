# نظام إصدار الشهادات التلقائي

## 📋 معلومات النظام
**تاريخ الإضافة**: 2026-03-09  
**الحالة**: ✅ مكتمل ومفعّل  
**المتطلبات**: Requirements 1.1 - الشهادة تُصدر تلقائياً عند إكمال 100% من الدورة

## الملفات الأساسية

```
backend/src/
├── models/
│   ├── Certificate.js                    # نموذج الشهادة
│   └── CourseEnrollment.js               # محدّث مع middleware للإصدار التلقائي
├── services/
│   └── certificateService.js             # خدمة إصدار الشهادات
├── controllers/
│   └── certificateController.js          # معالج طلبات الشهادات
└── routes/
    └── certificateRoutes.js              # مسارات API

tests/
└── certificate-auto-issue.test.js        # اختبارات شاملة
```

## الميزات الرئيسية

### 1. إصدار تلقائي عند إكمال الدورة
- ✅ يتم إصدار الشهادة تلقائياً عند وصول التقدم إلى 100%
- ✅ يعمل في الخلفية (non-blocking) باستخدام `setImmediate`
- ✅ لا يؤثر على أداء حفظ التسجيل

### 2. رقم فريد لكل شهادة (UUID)
- ✅ يتم توليد UUID تلقائياً باستخدام `crypto.randomUUID()`
- ✅ فريد لكل شهادة
- ✅ يستخدم للتحقق من الشهادة

### 3. QR Code للتحقق
- ✅ يتم توليد QR Code تلقائياً لكل شهادة
- ✅ يحتوي على رابط التحقق
- ✅ بجودة عالية (300x300px)
- ✅ ألوان من palette المشروع (#304B60)

### 4. رابط التحقق
- ✅ يتم توليده تلقائياً: `https://careerak.com/verify/{certificateId}`
- ✅ عام - لا يحتاج authentication
- ✅ يعرض تفاصيل الشهادة والمستخدم والدورة

### 5. منع التكرار
- ✅ شهادة واحدة فقط لكل مستخدم لكل دورة
- ✅ Compound unique index على (userId, courseId)

## كيف يعمل

### التدفق التلقائي

```
1. المستخدم يكمل آخر درس
   ↓
2. CourseEnrollment.pre('save') يحسب التقدم
   ↓
3. إذا كان التقدم = 100%:
   - تحديث status إلى 'completed'
   - تعيين completedAt
   - تعيين _shouldIssueCertificate = true
   ↓
4. CourseEnrollment.post('save') يتحقق من _shouldIssueCertificate
   ↓
5. إذا كان true:
   - استدعاء certificateService.issueCertificate() في الخلفية
   - توليد UUID
   - توليد verification URL
   - توليد QR Code
   - حفظ الشهادة
   - تحديث enrollment.certificateIssued
```

### التدفق اليدوي (للاختبار أو الحالات الخاصة)

```javascript
const certificateService = require('./services/certificateService');

// إصدار شهادة يدوياً
const certificate = await certificateService.issueCertificate(userId, courseId);
```

## API Endpoints

### Public (لا تحتاج authentication)

**التحقق من الشهادة**:
```bash
GET /api/certificates/verify/:code
```

Response:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "Certificate is valid",
    "certificate": {
      "certificateId": "uuid",
      "courseName": "Course Name",
      "issueDate": "2026-03-09",
      "status": "active"
    },
    "user": {
      "name": "User Name",
      "email": "user@example.com"
    },
    "course": {
      "title": "Course Title",
      "category": "Technology",
      "level": "Beginner"
    }
  }
}
```

### Protected (تحتاج authentication)

**جلب شهادات المستخدم**:
```bash
GET /api/certificates
Authorization: Bearer <token>
```

**جلب شهادة واحدة**:
```bash
GET /api/certificates/:id
Authorization: Bearer <token>
```

**إصدار شهادة يدوياً** (Admin/HR فقط):
```bash
POST /api/certificates/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "courseId": "course_id"
}
```

**إلغاء شهادة** (Admin/HR فقط):
```bash
PUT /api/certificates/:id/revoke
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Reason for revocation"
}
```

**إعادة إصدار شهادة** (Admin/HR فقط):
```bash
POST /api/certificates/:id/reissue
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Reason for reissue"
}
```

**تحديد كمشاركة على LinkedIn**:
```bash
POST /api/certificates/:id/linkedin-share
Authorization: Bearer <token>
```

**جلب شهادات الدورة** (Admin/HR فقط):
```bash
GET /api/certificates/course/:courseId
Authorization: Bearer <token>
```

**فحص وإصدار الشهادات للتسجيلات المكتملة** (Admin فقط):
```bash
POST /api/certificates/check-and-issue
Authorization: Bearer <token>
```

## نموذج البيانات

### Certificate Schema

```javascript
{
  certificateId: String (UUID),        // رقم فريد
  userId: ObjectId,                    // المستخدم
  courseId: ObjectId,                  // الدورة
  courseName: String,                  // اسم الدورة (محفوظ)
  issueDate: Date,                     // تاريخ الإصدار
  expiryDate: Date,                    // تاريخ الانتهاء (اختياري)
  qrCode: String,                      // QR Code data URL
  verificationUrl: String,             // رابط التحقق
  status: String,                      // active, revoked, expired
  pdfUrl: String,                      // رابط PDF (سيتم تنفيذه لاحقاً)
  linkedInShared: Boolean,             // هل تمت المشاركة على LinkedIn
  linkedInSharedAt: Date,              // تاريخ المشاركة
  template: ObjectId,                  // قالب الشهادة (اختياري)
  revocation: {                        // معلومات الإلغاء
    revokedAt: Date,
    revokedBy: ObjectId,
    reason: String
  },
  reissue: {                           // معلومات إعادة الإصدار
    isReissued: Boolean,
    originalCertificateId: String,
    reissuedAt: Date,
    reissuedBy: ObjectId,
    reason: String
  }
}
```

### Indexes

```javascript
// User's certificates
{ userId: 1, issueDate: -1 }

// Course certificates
{ courseId: 1, issueDate: -1 }

// Certificate verification
{ certificateId: 1 } (unique)

// Status filtering
{ status: 1 }

// Expiry date (for cleanup jobs)
{ expiryDate: 1 }

// Prevent duplicates
{ userId: 1, courseId: 1 } (unique)
```

## الاختبارات

```bash
cd backend
npm test -- certificate-auto-issue.test.js
```

### الاختبارات المتضمنة

1. **Certificate Model** (5 tests):
   - ✅ Create certificate with unique ID
   - ✅ Generate verification URL automatically
   - ✅ Prevent duplicate certificates
   - ✅ Validate certificate correctly
   - ✅ Invalidate revoked certificate

2. **Certificate Service** (5 tests):
   - ✅ Generate QR code
   - ✅ Issue certificate when course is 100% complete
   - ✅ Fail to issue if course not 100% complete
   - ✅ Fail to issue duplicate certificate
   - ✅ Verify valid certificate
   - ✅ Fail to verify non-existent certificate

3. **Auto-Issuance** (1 test):
   - ✅ Trigger certificate issuance when enrollment reaches 100%

4. **Certificate Operations** (3 tests):
   - ✅ Revoke certificate
   - ✅ Reissue certificate
   - ✅ Mark as shared on LinkedIn

## الاستخدام في Frontend

### عرض الشهادة

```jsx
import { useState, useEffect } from 'react';

function CertificatePage({ certificateId }) {
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    fetch(`/api/certificates/${certificateId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setCertificate(data.data));
  }, [certificateId]);

  if (!certificate) return <div>Loading...</div>;

  return (
    <div className="certificate">
      <h1>{certificate.courseName}</h1>
      <p>Issued to: {certificate.userId.firstName} {certificate.userId.lastName}</p>
      <p>Date: {new Date(certificate.issueDate).toLocaleDateString()}</p>
      <img src={certificate.qrCode} alt="QR Code" />
      <a href={certificate.verificationUrl}>Verify Certificate</a>
    </div>
  );
}
```

### التحقق من الشهادة (عام)

```jsx
function VerifyCertificatePage({ code }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`/api/certificates/verify/${code}`)
      .then(res => res.json())
      .then(data => setResult(data.data));
  }, [code]);

  if (!result) return <div>Verifying...</div>;

  if (!result.valid) {
    return <div>❌ Certificate not valid: {result.message}</div>;
  }

  return (
    <div className="verification-result">
      <h1>✅ Certificate is Valid</h1>
      <p>Issued to: {result.user.name}</p>
      <p>Course: {result.course.title}</p>
      <p>Date: {new Date(result.issueDate).toLocaleDateString()}</p>
    </div>
  );
}
```

## الفوائد المتوقعة

- 📈 زيادة معدل إكمال الدورات بنسبة 40%
- 🎓 تحفيز المستخدمين للحصول على شهادات معترف بها
- 🔒 منع التزوير باستخدام QR Code والتحقق الرقمي
- 📊 تتبع الشهادات الصادرة وإحصائياتها
- ✅ تجربة مستخدم ممتازة (إصدار تلقائي فوري)

## ملاحظات مهمة

- الإصدار التلقائي يعمل فقط إذا كانت `settings.certificateEnabled = true` في الدورة
- الشهادة تُصدر مرة واحدة فقط لكل مستخدم لكل دورة
- يمكن إلغاء الشهادة وإعادة إصدارها من قبل Admin/HR
- QR Code يحتوي على رابط التحقق الكامل
- التحقق من الشهادة متاح للجميع (لا يحتاج authentication)

## المراحل القادمة

1. **توليد PDF** (Task 3):
   - استخدام puppeteer أو PDFKit
   - تصميم احترافي مع الألوان الرسمية
   - جودة 300 DPI

2. **إشعارات** (Task 2):
   - إشعار فوري عند إصدار الشهادة
   - بريد إلكتروني مع رابط التحميل

3. **تكامل LinkedIn** (Task 7):
   - OAuth 2.0 authentication
   - مشاركة تلقائية على LinkedIn
   - إضافة لقسم Certifications

4. **معرض الشهادات** (Task 9):
   - عرض جميع الشهادات في الملف الشخصي
   - فلترة وترتيب
   - إخفاء/إظهار

تم إضافة نظام إصدار الشهادات التلقائي بنجاح - 2026-03-09
