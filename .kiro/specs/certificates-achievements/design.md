# نظام الشهادات والإنجازات - التصميم التقني

## 📋 معلومات الوثيقة
- **اسم الميزة**: نظام الشهادات والإنجازات
- **تاريخ الإنشاء**: 2026-02-17
- **الحالة**: قيد التصميم

## 1. Overview
نظام شامل للشهادات الرقمية والإنجازات مع QR Code للتحقق، تكامل LinkedIn، ونظام badges تحفيزي.

## 2. Architecture
معمارية ثلاثية الطبقات:
- Presentation: Certificate Display, Gallery, Badges, Verification Page
- Business Logic: Certificate/Badge/Verification/LinkedIn Services
- Data: MongoDB + PDF Generator + QR Code Generator + LinkedIn API

## 3. Data Models

### Certificate Model
```javascript
{
  certificateId: UUID,        // رقم فريد
  userId: ObjectId,
  courseId: ObjectId,
  courseName: String,
  issueDate: Date,
  expiryDate: Date,           // اختياري
  qrCode: String,             // QR Code data
  verificationUrl: String,
  status: 'active' | 'revoked',
  pdfUrl: String,
  linkedInShared: Boolean,
  template: ObjectId
}
```

### Badge Model
```javascript
{
  badgeId: String,
  name: String,
  description: String,
  icon: String,
  criteria: Object,           // شروط الحصول
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  points: Number
}
```

### UserBadge Model
```javascript
{
  userId: ObjectId,
  badgeId: ObjectId,
  earnedAt: Date,
  progress: Number,           // للـ badges التدريجية
  isDisplayed: Boolean
}
```

## 4. Correctness Properties

### Property 1: Automatic Certificate Issuance
*For any* course completion (100% progress), a certificate should be automatically generated within 1 minute.
**Validates: Requirements 1.1**

### Property 2: Unique Certificate ID
*For any* two certificates, their certificateId values must be unique.
**Validates: Requirements 1.4**

### Property 3: QR Code Validity
*For any* certificate with a QR code, scanning it should lead to a valid verification page showing correct certificate details.
**Validates: Requirements 2.1, 2.3**

### Property 4: Verification Accuracy
*For any* valid certificate code, the verification endpoint should return the correct certificate details and status.
**Validates: Requirements 2.3, 7.3**

### Property 5: Badge Award Criteria
*For any* badge with defined criteria, when a user meets those criteria, the badge should be automatically awarded.
**Validates: Requirements 5.2**

### Property 6: Certificate Revocation
*For any* revoked certificate, the verification endpoint should return status='revoked' and the certificate should not be valid.
**Validates: Requirements 6.4**

### Property 7: LinkedIn Share Data
*For any* LinkedIn share action, the shared data should accurately reflect the certificate details (name, course, date, verification URL).
**Validates: Requirements 3.2, 3.4**

### Property 8: Gallery Visibility
*For any* certificate marked as hidden, it should not appear in the public profile but should still be accessible to the owner.
**Validates: Requirements 4.4**

### Property 9: PDF Generation Quality
*For any* generated certificate PDF, it should be at least 300 DPI and contain all required elements (name, course, date, QR code, signature).
**Validates: Requirements 1.4**

### Property 10: Badge Progress Tracking
*For any* progressive badge (e.g., complete 5 courses), the progress should accurately reflect the user's current achievement count.
**Validates: Requirements 5.2, 5.5**

## 5. Services Implementation

### CertificateService
- generateCertificate(): إصدار شهادة جديدة
- generateQRCode(): توليد QR Code
- generatePDF(): توليد PDF عالي الجودة
- verifyCertificate(): التحقق من صحة شهادة
- revokeCertificate(): إلغاء شهادة

### BadgeService
- checkAndAwardBadges(): فحص ومنح badges تلقائياً
- calculateProgress(): حساب تقدم المستخدم
- getBadgesByUser(): جلب badges المستخدم

### LinkedInService
- shareToLinkedIn(): مشاركة على LinkedIn
- addToCertifications(): إضافة لقسم الشهادات

### VerificationService
- verifyByCode(): التحقق برقم الشهادة
- verifyByQR(): التحقق بـ QR Code
- getVerificationPage(): صفحة التحقق العامة

## 6. Testing Strategy
- Property-based tests using fast-check
- Unit tests for certificate generation
- Integration tests for complete workflows
- Visual regression tests for PDF output
- QR Code scanning tests

**تاريخ الإنشاء**: 2026-02-17
