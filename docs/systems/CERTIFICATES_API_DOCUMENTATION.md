# توثيق API - نظام الشهادات والإنجازات

**تاريخ الإنشاء**: 2026-03-15  
**الحالة**: ✅ مكتمل  
**المتطلبات**: معايير القبول النهائية - توثيق كامل للـ API

---

## Base URL

```
https://careerak.com/api
```

## المصادقة (Authentication)

معظم endpoints تتطلب JWT token في الـ header:

```
Authorization: Bearer <token>
```

---

## 1. Certificate API - شهادات المستخدمين

### POST /certificates/generate
إصدار شهادة جديدة لمستخدم عند إكمال دورة.

**الصلاحية**: مصادق عليه (authenticated)

**Body**:
```json
{
  "userId": "string (required)",
  "courseId": "string (required)",
  "issueDate": "ISO date string (optional)",
  "expiryDate": "ISO date string (optional)",
  "templateId": "string (optional)"
}
```

**Response 201**:
```json
{
  "success": true,
  "certificate": {
    "certificateId": "CERT-XXXX-XXXX",
    "userId": "...",
    "courseId": "...",
    "courseName": "...",
    "issueDate": "2026-03-15T00:00:00.000Z",
    "status": "active",
    "qrCode": "data:image/png;base64,...",
    "verificationUrl": "https://careerak.com/verify/CERT-XXXX",
    "pdfUrl": "https://..."
  }
}
```

---

### GET /certificates/user/:userId
جلب جميع شهادات مستخدم معين.

**الصلاحية**: مصادق عليه

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | `active`, `revoked`, `expired` |
| year | number | سنة الإصدار |
| type | string | نوع الشهادة |
| limit | number | عدد النتائج (افتراضي: 20) |
| skip | number | تخطي عدد من النتائج |

**Response 200**:
```json
{
  "success": true,
  "count": 5,
  "certificates": [
    {
      "certificateId": "CERT-XXXX",
      "courseName": "...",
      "issueDate": "...",
      "status": "active",
      "isHidden": false,
      "verificationUrl": "...",
      "linkedInShared": false
    }
  ]
}
```

---

### GET /certificates/:certificateId
جلب تفاصيل شهادة واحدة.

**الصلاحية**: عام (public)

**Response 200**:
```json
{
  "success": true,
  "certificate": {
    "certificateId": "CERT-XXXX",
    "userName": "...",
    "courseName": "...",
    "issueDate": "...",
    "status": "active",
    "qrCode": "...",
    "verificationUrl": "..."
  }
}
```

---

### GET /certificates/:certificateId/download
تحميل الشهادة كملف PDF بجودة 300 DPI.

**الصلاحية**: عام (public)

**Response**: ملف PDF ثنائي

**Headers**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="certificate-[name]-[course].pdf"
```

---

### GET /certificates/verify/:certificateId
التحقق من صحة شهادة.

**الصلاحية**: عام (public)

**Response 200**:
```json
{
  "success": true,
  "valid": true,
  "certificate": {
    "certificateId": "...",
    "holderName": "...",
    "courseName": "...",
    "issueDate": "...",
    "status": "active"
  }
}
```

---

### PUT /certificates/:certificateId/revoke
إلغاء شهادة.

**الصلاحية**: مدرب أو أدمن فقط

**Body**:
```json
{
  "reason": "string (required)"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Certificate revoked successfully",
  "messageAr": "تم إلغاء الشهادة بنجاح"
}
```

---

### POST /certificates/:certificateId/reissue
إعادة إصدار شهادة.

**الصلاحية**: مدرب أو أدمن فقط

**Body**:
```json
{
  "reason": "string (optional)"
}
```

**Response 201**:
```json
{
  "success": true,
  "certificate": { "...": "بيانات الشهادة الجديدة" }
}
```

---

### PATCH /certificates/:certificateId/visibility
إخفاء أو إظهار شهادة في الملف الشخصي.

**الصلاحية**: مصادق عليه (المالك فقط)

**Body**:
```json
{
  "isHidden": true
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Visibility updated",
  "isHidden": true
}
```

---

### POST /certificates/:certificateId/linkedin-share
تحديد الشهادة كمشاركة على LinkedIn.

**الصلاحية**: مصادق عليه

**Response 200**:
```json
{
  "success": true,
  "linkedInShared": true
}
```

---

### GET /certificates/stats
إحصائيات الشهادات للمستخدم الحالي.

**الصلاحية**: مصادق عليه

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | معرف المستخدم (اختياري) |

**Response 200**:
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "active": 8,
    "revoked": 1,
    "expired": 1
  }
}
```

---

## 2. Badge API - نظام الإنجازات

### GET /badges
جلب جميع الـ badges المتاحة.

**الصلاحية**: عام (public)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | تصفية حسب الفئة |
| rarity | string | `common`, `rare`, `epic`, `legendary` |
| lang | string | `ar` (افتراضي), `en`, `fr` |

**Response 200**:
```json
{
  "success": true,
  "count": 7,
  "data": [
    {
      "badgeId": "active-learner",
      "name": "المتعلم النشط",
      "description": "إكمال 5 دورات",
      "icon": "🎓",
      "rarity": "common",
      "points": 100,
      "criteria": { "type": "courses_completed", "count": 5 }
    }
  ]
}
```

---

### GET /badges/user/:userId
جلب badges مستخدم معين.

**الصلاحية**: عام (public)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| lang | string | `ar`, `en`, `fr` |

**Response 200**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "badge": { "...": "تفاصيل الـ badge" },
      "earnedAt": "2026-03-10T00:00:00.000Z",
      "isDisplayed": true
    }
  ]
}
```

---

### GET /badges/progress
تقدم المستخدم الحالي نحو الحصول على badges.

**الصلاحية**: مصادق عليه

**Response 200**:
```json
{
  "success": true,
  "data": {
    "active-learner": { "current": 3, "required": 5, "percentage": 60 },
    "expert": { "current": 3, "required": 10, "percentage": 30 }
  }
}
```

---

### POST /badges/check
فحص ومنح badges جديدة للمستخدم الحالي.

**الصلاحية**: مصادق عليه

**Response 200**:
```json
{
  "success": true,
  "message": "Awarded 2 new badge(s)",
  "count": 2,
  "data": [
    {
      "badge": { "name": "المتعلم النشط", "...": "..." },
      "earnedAt": "2026-03-15T00:00:00.000Z"
    }
  ]
}
```

---

### PATCH /badges/:userBadgeId/display
إخفاء أو إظهار badge في الملف الشخصي.

**الصلاحية**: مصادق عليه

**Response 200**:
```json
{
  "success": true,
  "message": "Badge display toggled",
  "data": { "isDisplayed": false }
}
```

---

### GET /badges/stats
إحصائيات badges المستخدم الحالي.

**الصلاحية**: مصادق عليه

**Response 200**:
```json
{
  "success": true,
  "data": {
    "totalBadges": 7,
    "earnedBadges": 3,
    "remainingBadges": 4,
    "completionPercentage": 43,
    "totalPoints": 350,
    "categoryCount": { "learning": 2, "achievement": 1 },
    "rarityCount": { "common": 2, "rare": 1 }
  }
}
```

---

### GET /badges/leaderboard
لوحة المتصدرين حسب نقاط الـ badges.

**الصلاحية**: مصادق عليه

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | عدد المستخدمين (افتراضي: 10) |

**Response 200**:
```json
{
  "success": true,
  "count": 10,
  "data": [
    { "userId": "...", "userName": "...", "totalPoints": 850, "badgeCount": 6 }
  ]
}
```

---

## 3. Verification API - التحقق من الشهادات

جميع endpoints في هذا القسم **عامة** ولا تتطلب مصادقة.

### GET /verify/:certificateId
التحقق من شهادة واحدة.

**Response 200** (شهادة صالحة):
```json
{
  "success": true,
  "found": true,
  "certificate": {
    "certificateId": "CERT-XXXX",
    "holder": {
      "name": "...",
      "email": "..."
    },
    "course": {
      "name": "...",
      "category": "...",
      "level": "...",
      "instructor": "..."
    },
    "dates": {
      "issued": "2026-01-15T00:00:00.000Z",
      "expiry": null
    },
    "status": {
      "isValid": true,
      "code": "active",
      "label": "صالحة"
    },
    "links": {
      "verification": "https://careerak.com/verify/CERT-XXXX"
    }
  }
}
```

**Response 404** (شهادة غير موجودة):
```json
{
  "success": false,
  "found": false,
  "message": "Certificate not found",
  "messageAr": "الشهادة غير موجودة"
}
```

---

### GET /verify/search
البحث عن شهادات.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | نص البحث (3 أحرف على الأقل) |
| limit | number | عدد النتائج (افتراضي: 10) |
| skip | number | تخطي عدد من النتائج |

**Response 200**:
```json
{
  "success": true,
  "count": 2,
  "certificates": [ { "...": "..." } ]
}
```

---

### POST /verify/bulk
التحقق من عدة شهادات دفعة واحدة (حد أقصى 50).

**Body**:
```json
{
  "certificateIds": ["CERT-001", "CERT-002", "CERT-003"]
}
```

**Response 200**:
```json
{
  "success": true,
  "results": [
    { "certificateId": "CERT-001", "valid": true, "status": "active" },
    { "certificateId": "CERT-002", "valid": false, "status": "revoked" }
  ]
}
```

---

### GET /verify/:certificateId/report
تحميل تقرير التحقق.

**Response 200**:
```json
{
  "success": true,
  "report": {
    "reportTitle": "Certificate Verification Report",
    "generatedAt": "...",
    "certificate": {
      "id": "CERT-XXXX",
      "holderName": "...",
      "courseName": "...",
      "issueDate": "...",
      "status": "VALID",
      "isValid": true,
      "verificationUrl": "..."
    },
    "platform": "Careerak",
    "disclaimer": "..."
  }
}
```

---

### GET /verify/stats
إحصائيات عامة عن الشهادات في المنصة.

**Response 200**:
```json
{
  "success": true,
  "stats": {
    "totalCertificates": 1250,
    "activeCertificates": 1180,
    "revokedCertificates": 45,
    "totalVerifications": 3200
  }
}
```

---

## 4. LinkedIn Integration API

جميع endpoints تتطلب مصادقة.

### GET /linkedin/auth-url
الحصول على رابط OAuth للمصادقة مع LinkedIn.

**Response 200**:
```json
{
  "success": true,
  "authUrl": "https://www.linkedin.com/oauth/v2/authorization?..."
}
```

---

### GET /linkedin/callback
معالجة callback من LinkedIn بعد المصادقة.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| code | string | Authorization code من LinkedIn |
| state | string | State parameter للأمان |

**Response**: إعادة توجيه إلى Frontend مع نتيجة المصادقة.

---

### POST /linkedin/share-certificate
مشاركة الشهادة على LinkedIn كمنشور.

**Body**:
```json
{
  "certificateId": "CERT-XXXX"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Certificate shared on LinkedIn",
  "postUrl": "https://www.linkedin.com/feed/update/..."
}
```

---

### POST /linkedin/add-certification
إضافة الشهادة إلى قسم Certifications في ملف LinkedIn.

**Body**:
```json
{
  "certificateId": "CERT-XXXX"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Certification added to LinkedIn profile"
}
```

---

### POST /linkedin/preview-post
معاينة المنشور قبل النشر على LinkedIn.

**Body**:
```json
{
  "certificateId": "CERT-XXXX"
}
```

**Response 200**:
```json
{
  "success": true,
  "preview": {
    "text": "نص المنشور المقترح...",
    "certificateName": "...",
    "verificationUrl": "..."
  }
}
```

---

### GET /linkedin/status
التحقق من حالة ربط حساب LinkedIn.

**Response 200**:
```json
{
  "success": true,
  "connected": true,
  "linkedInProfile": {
    "name": "...",
    "email": "..."
  }
}
```

---

### GET /linkedin/profile
الحصول على معلومات المستخدم من LinkedIn.

**Response 200**:
```json
{
  "success": true,
  "profile": {
    "id": "...",
    "name": "...",
    "email": "...",
    "profilePicture": "..."
  }
}
```

---

### DELETE /linkedin/unlink
إلغاء ربط حساب LinkedIn.

**Response 200**:
```json
{
  "success": true,
  "message": "LinkedIn account unlinked successfully"
}
```

---

## 5. Certificate Management API - إدارة الشهادات للمدربين

جميع endpoints تتطلب مصادقة بصلاحية مدرب.

### GET /certificate-management/templates
جلب قوالب الشهادات للمدرب الحالي.

**Response 200**:
```json
{
  "success": true,
  "templates": [
    {
      "_id": "...",
      "name": "القالب الافتراضي",
      "colors": { "primary": "#304B60", "secondary": "#E3DAD1" },
      "isDefault": true,
      "courseId": { "title": "...", "thumbnail": "..." },
      "signature": { "imageUrl": "...", "name": "..." }
    }
  ]
}
```

---

### POST /certificate-management/templates
إنشاء قالب شهادة جديد.

**Body**:
```json
{
  "name": "اسم القالب",
  "colors": {
    "primary": "#304B60",
    "secondary": "#E3DAD1",
    "accent": "#D48161"
  },
  "layout": "landscape",
  "logoPosition": "top-center",
  "elements": {
    "showQR": true,
    "showSignature": true,
    "showDate": true
  },
  "signature": {
    "name": "اسم المدرب",
    "title": "المسمى الوظيفي"
  },
  "isDefault": false,
  "courseId": "string (optional)"
}
```

**Response 201**:
```json
{
  "success": true,
  "template": { "...": "بيانات القالب" },
  "messageAr": "تم إنشاء القالب بنجاح"
}
```

---

### PUT /certificate-management/templates/:id
تحديث قالب موجود.

**Body**: نفس حقول POST (جميعها اختيارية)

**Response 200**:
```json
{
  "success": true,
  "template": { "...": "بيانات القالب المحدث" },
  "messageAr": "تم تحديث القالب بنجاح"
}
```

---

### POST /certificate-management/templates/:id/signature
رفع توقيع رقمي للقالب.

**Content-Type**: `multipart/form-data`

**Form Data**:
| Field | Type | Description |
|-------|------|-------------|
| signature | File | صورة التوقيع (PNG/JPG, max 5MB) |

**Response 200**:
```json
{
  "success": true,
  "signatureUrl": "https://res.cloudinary.com/...",
  "messageAr": "تم رفع التوقيع بنجاح"
}
```

---

### GET /certificate-management/issued
جلب الشهادات الصادرة لدورات المدرب.

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | رقم الصفحة (افتراضي: 1) |
| limit | number | عدد النتائج (افتراضي: 20) |
| search | string | بحث بالاسم أو رقم الشهادة |
| courseId | string | تصفية حسب الدورة |
| status | string | `active`, `revoked`, `expired` |
| startDate | string | تاريخ البداية (ISO) |
| endDate | string | تاريخ النهاية (ISO) |

**Response 200**:
```json
{
  "success": true,
  "certificates": [
    {
      "certificateId": "CERT-XXXX",
      "userName": "...",
      "userEmail": "...",
      "courseName": "...",
      "issueDate": "...",
      "status": "active",
      "linkedInShared": false
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 3,
  "courses": [ { "_id": "...", "title": "..." } ]
}
```

---

### GET /certificate-management/stats
إحصائيات الشهادات الصادرة للمدرب.

**Response 200**:
```json
{
  "success": true,
  "stats": {
    "total": 45,
    "active": 40,
    "revoked": 3,
    "expired": 2
  }
}
```

---

## رموز الأخطاء (Error Codes)

| HTTP Status | الوصف |
|-------------|-------|
| 400 | Bad Request - بيانات مفقودة أو غير صحيحة |
| 401 | Unauthorized - لم يتم تقديم token |
| 403 | Forbidden - لا تملك الصلاحية |
| 404 | Not Found - المورد غير موجود |
| 500 | Internal Server Error - خطأ في الخادم |

**شكل رسالة الخطأ**:
```json
{
  "success": false,
  "message": "Error message in English",
  "messageAr": "رسالة الخطأ بالعربية"
}
```

---

## أنواع الـ Badges المتاحة

| Badge ID | الاسم | الشرط | النوع |
|----------|-------|-------|-------|
| `active-learner` | المتعلم النشط | إكمال 5 دورات | common |
| `expert` | الخبير | إكمال 10 دورات | rare |
| `speed-learner` | السريع | إكمال دورة في أقل من أسبوع | rare |
| `top-rated` | المتميز | تقييم 5 نجوم في 3 دورات | epic |
| `specialist` | المتخصص | إكمال 3 دورات في نفس المجال | rare |
| `consistent` | المثابر | تسجيل دخول يومي لمدة 30 يوم | epic |
| `career-achiever` | المحترف | الحصول على وظيفة بعد إكمال دورة | legendary |

---

**تاريخ الإنشاء**: 2026-03-15  
**آخر تحديث**: 2026-03-15
