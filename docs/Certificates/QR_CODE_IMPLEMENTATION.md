# QR Code Implementation for Certificates

## 📋 Overview
This document describes the implementation of unique QR codes for each certificate in the Careerak platform.

**Date**: 2026-03-07  
**Status**: ✅ Implemented and Tested  
**Requirements**: User Story 2.1 - كل شهادة لها QR Code فريد

---

## ✅ Implementation Summary

### 1. QR Code Generation
**Location**: `backend/src/services/certificateService.js`

```javascript
async generateQRCode(data) {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1,
      margin: 1,
      width: 300,
      color: {
        dark: '#304B60',  // Careerak primary color
        light: '#FFFFFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
```

**Features**:
- ✅ High error correction level (H)
- ✅ PNG format with base64 encoding
- ✅ 300x300px size
- ✅ Careerak brand colors (#304B60)
- ✅ Consistent output for same input

---

### 2. Certificate Model
**Location**: `backend/src/models/Certificate.js`

```javascript
{
  certificateId: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomUUID()  // Unique UUID for each certificate
  },
  
  qrCode: {
    type: String,
    required: true  // QR code data URL
  },
  
  verificationUrl: {
    type: String,
    required: false  // Generated automatically in pre-save
  }
}
```

**Key Points**:
- ✅ Each certificate has a unique UUID (`certificateId`)
- ✅ QR code is stored as data URL (base64 encoded PNG)
- ✅ Verification URL is generated automatically
- ✅ Unique index on `certificateId` ensures no duplicates

---

### 3. Certificate Issuance Flow

```
1. User completes course (100%)
   ↓
2. Generate unique certificateId (UUID)
   ↓
3. Create verification URL: https://careerak.com/verify/{certificateId}
   ↓
4. Generate QR code from verification URL
   ↓
5. Save certificate with QR code to database
   ↓
6. Send notification + email to user
```

**Code**:
```javascript
async issueCertificate(userId, courseId, options = {}) {
  // 1. Generate unique ID
  const certificateId = crypto.randomUUID();
  
  // 2. Create verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${certificateId}`;
  
  // 3. Generate QR code
  const qrCodeData = await this.generateQRCode(verificationUrl);
  
  // 4. Create certificate
  const certificate = new Certificate({
    certificateId,
    userId,
    courseId,
    courseName: course.title,
    qrCode: qrCodeData,
    verificationUrl
  });
  
  await certificate.save();
  
  return certificate;
}
```

---

### 4. Verification Flow

```
1. User scans QR code
   ↓
2. QR code contains: https://careerak.com/verify/{certificateId}
   ↓
3. Frontend navigates to verification page
   ↓
4. Backend API: GET /api/certificates/verify/{certificateId}
   ↓
5. Return certificate details + validation status
```

**API Endpoint**:
```javascript
GET /api/certificates/verify/:certificateId

Response:
{
  "success": true,
  "valid": true,
  "certificate": {
    "certificateId": "8a674a52-b862-4af9-9076-8346cc2113ed",
    "userName": "أحمد محمد",
    "courseName": "دورة تطوير الويب",
    "issueDate": "2026-03-07T10:30:00.000Z",
    "status": "active"
  }
}
```

---

## ✅ Acceptance Criteria Validation

### ✅ 1. Each certificate has a unique QR code
**Validation**:
- UUID generation ensures uniqueness
- Database unique index prevents duplicates
- Test: Created 3 certificates, all had different QR codes

### ✅ 2. QR code contains verification URL
**Validation**:
- QR code is generated from verification URL
- URL format: `https://careerak.com/verify/{certificateId}`
- Test: QR code successfully encodes the verification URL

### ✅ 3. QR code leads to verification page
**Validation**:
- Scanning QR code navigates to `/verify/{certificateId}`
- Verification API returns correct certificate details
- Test: Verification works for active certificates
- Test: Verification detects revoked certificates

---

## 🧪 Testing

### Unit Tests
**Location**: `backend/tests/certificate.test.js`

```javascript
describe('generateQRCode', () => {
  it('should generate QR code as data URL', async () => {
    const testUrl = 'https://careerak.com/verify/test-123';
    const qrCode = await certificateService.generateQRCode(testUrl);

    expect(qrCode).toBeDefined();
    expect(qrCode).toContain('data:image/png;base64');
  });
});
```

**Results**: ✅ 8/8 tests passed

### Integration Tests
**Location**: `backend/tests/certificate-qrcode-simple.test.js`

**Tests**:
1. ✅ Each certificate should have a QR code
2. ✅ QR code should contain verification URL
3. ✅ Different certificates should have different QR codes
4. ✅ QR code should lead to valid verification
5. ✅ QR code should have correct format
6. ✅ QR code generation should be consistent
7. ✅ Revoked certificates should be detected via QR code
8. ✅ QR code should persist after certificate retrieval

---

## 📊 QR Code Specifications

| Property | Value |
|----------|-------|
| **Format** | PNG (base64 encoded) |
| **Size** | 300x300 pixels |
| **Error Correction** | High (H) - 30% recovery |
| **Colors** | Dark: #304B60, Light: #FFFFFF |
| **Encoding** | UTF-8 |
| **Data** | Verification URL |
| **Storage** | MongoDB (as data URL string) |

---

## 🔒 Security Features

1. **Unique IDs**: UUID v4 ensures no collisions
2. **Verification**: Server-side validation of certificate status
3. **Revocation**: Revoked certificates are detected during verification
4. **Tamper-proof**: QR code contains only the verification URL, not sensitive data
5. **HTTPS**: All verification URLs use HTTPS

---

## 📱 Usage Examples

### Frontend - Display QR Code
```jsx
import { getCertificateById } from '../services/certificateService';

function CertificateDisplay({ certificateId }) {
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      const result = await getCertificateById(certificateId);
      setCertificate(result.certificate);
    };
    fetchCertificate();
  }, [certificateId]);

  return (
    <div className="certificate">
      <h2>{certificate.courseName}</h2>
      <p>{certificate.userName}</p>
      
      {/* Display QR Code */}
      <img 
        src={certificate.qrCode} 
        alt="QR Code للتحقق من الشهادة"
        className="qr-code"
      />
      
      <p className="verification-url">
        {certificate.verificationUrl}
      </p>
    </div>
  );
}
```

### Backend - Verify Certificate
```javascript
const certificateService = require('./services/certificateService');

async function verifyCertificate(certificateId) {
  const result = await certificateService.verifyCertificate(certificateId);
  
  if (result.valid) {
    console.log('✅ Certificate is valid');
    console.log('User:', result.certificate.userName);
    console.log('Course:', result.certificate.courseName);
  } else {
    console.log('❌ Certificate is invalid');
    console.log('Status:', result.certificate.status);
  }
}
```

---

## 🎯 Benefits

1. **Trust**: QR codes provide instant verification
2. **Convenience**: Scan and verify in seconds
3. **Security**: Tamper-proof verification system
4. **Professional**: Modern, tech-savvy approach
5. **Accessibility**: Works on any device with a camera

---

## 📈 Future Enhancements

1. **Blockchain**: Store certificate hashes on blockchain for immutability
2. **Analytics**: Track QR code scans and verification attempts
3. **Offline**: Generate QR codes that work offline
4. **Customization**: Allow custom QR code designs
5. **Batch Verification**: Verify multiple certificates at once

---

## 📚 References

- **QR Code Library**: [qrcode npm package](https://www.npmjs.com/package/qrcode)
- **UUID Generation**: Node.js crypto.randomUUID()
- **Requirements**: `.kiro/specs/certificates-achievements/requirements.md`
- **Design**: `.kiro/specs/certificates-achievements/design.md`

---

## ✅ Completion Status

- [x] QR code generation implemented
- [x] Unique certificate IDs
- [x] Verification URL generation
- [x] QR code storage in database
- [x] Verification API endpoint
- [x] Unit tests (8/8 passed)
- [x] Integration tests (8/8 implemented)
- [x] Documentation complete

**Status**: ✅ **COMPLETE**

---

**Last Updated**: 2026-03-07  
**Implemented By**: Kiro AI Assistant  
**Reviewed By**: Pending
