# توثيق API - نظام الإحالة والمكافآت

> **المتطلبات**: معايير القبول النهائية - توثيق كامل للـ API  
> **تاريخ الإنشاء**: 2026-03-20  
> **الحالة**: ✅ مكتمل

---

## 📋 نظرة عامة

جميع endpoints تتطلب مصادقة عبر JWT Bearer Token ما لم يُذكر خلاف ذلك.

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Base URL**: `/api`

---

## 1. Referral API - نظام الإحالة

### `GET /referrals/my-code`
جلب كود ورابط الإحالة الخاص بالمستخدم. يُنشئ الكود تلقائياً إن لم يكن موجوداً.

**Response `200`**:
```json
{
  "code": "ABC123",
  "link": "https://careerak.com/register?ref=ABC123"
}
```

---

### `POST /referrals/track`
تسجيل إحالة جديدة عند تسجيل مستخدم باستخدام كود إحالة.

**Body**:
```json
{
  "referralCode": "ABC123",
  "source": "whatsapp"
}
```
`source`: `whatsapp | email | direct | other`

**Response `201`**:
```json
{
  "message": "تم تسجيل الإحالة بنجاح",
  "referral": { "_id": "...", "status": "pending", "referrerId": "..." }
}
```

**Response `400`** - كود غير صالح أو مستخدم مسبقاً:
```json
{ "error": "كود الإحالة غير صالح أو تم استخدامه مسبقاً" }
```

**Response `403`** - احتيال مكتشف:
```json
{
  "error": "تم رفض الإحالة بسبب نشاط مشبوه",
  "fraudResult": { "suspicionScore": 70, "flags": ["same_ip"] }
}
```

---

### `GET /referrals/my-referrals`
جلب قائمة الإحالات الخاصة بالمستخدم مع pagination.

**Query Params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | رقم الصفحة |
| `limit` | number | 20 | عدد النتائج |

**Response `200`**:
```json
{
  "referrals": [
    {
      "_id": "...",
      "referredUserId": "...",
      "status": "completed",
      "source": "whatsapp",
      "createdAt": "2026-03-01T10:00:00Z",
      "completedAt": "2026-03-02T10:00:00Z",
      "rewards": [
        { "type": "signup", "points": 50, "awardedAt": "2026-03-01T10:05:00Z" }
      ]
    }
  ],
  "total": 15,
  "page": 1,
  "pages": 1
}
```

---

### `GET /referrals/stats`
إحصائيات الإحالات الملخصة للمستخدم.

**Response `200`**:
```json
{
  "total": 15,
  "completed": 10,
  "pending": 3,
  "cancelled": 2,
  "totalPointsEarned": 850
}
```

---

### `GET /referrals/analytics/personal`
لوحة الإحصائيات الشخصية الكاملة (معدل التحويل، ROI، إلخ).

**Response `200`**:
```json
{
  "conversionRate": 66.7,
  "totalReferrals": 15,
  "completedReferrals": 10,
  "totalPointsEarned": 850,
  "pointsRedeemed": 400,
  "activePoints": 450
}
```

---

### `GET /referrals/analytics/trend`
الاتجاه الشهري للإحالات (آخر 6 أشهر).

**Response `200`**:
```json
{
  "trend": [
    { "month": "2026-01", "referrals": 3, "points": 150 },
    { "month": "2026-02", "referrals": 5, "points": 300 }
  ]
}
```

---

### `GET /referrals/analytics/earnings`
توزيع النقاط المكتسبة حسب المصدر.

**Response `200`**:
```json
{
  "earnings": [
    { "source": "signup", "points": 250, "count": 5 },
    { "source": "first_course", "points": 400, "count": 4 },
    { "source": "job", "points": 200, "count": 1 }
  ]
}
```

---

### `GET /referrals/analytics/roi`
معدل الاستبدال وعائد الاستثمار.

**Response `200`**:
```json
{
  "redemptionRate": 47.1,
  "pointsEarned": 850,
  "pointsRedeemed": 400,
  "estimatedValue": 40
}
```

---

### `GET /referrals/export`
تصدير تقرير الإحالات الشخصي.

**Query Params**:
| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `format` | string | `pdf \| excel` | صيغة التصدير |

**Response**: ملف PDF أو Excel للتنزيل.

---

## 2. Rewards API - نظام النقاط

### `GET /rewards/balance`
جلب رصيد النقاط الحالي.

**Response `200`**:
```json
{ "balance": 450 }
```

---

### `GET /rewards/history`
سجل جميع معاملات النقاط (كسب + استبدال + انتهاء صلاحية).

**Query Params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | رقم الصفحة |
| `limit` | number | 20 | عدد النتائج |
| `type` | string | - | `earn \| redeem \| expire` |
| `source` | string | - | `referral \| redemption` |

**Response `200`**:
```json
{
  "transactions": [
    {
      "_id": "...",
      "type": "earn",
      "amount": 50,
      "balance": 450,
      "source": "referral",
      "description": "مكافأة تسجيل إحالة",
      "createdAt": "2026-03-01T10:05:00Z"
    }
  ],
  "total": 20,
  "page": 1,
  "pages": 1
}
```

---

### `GET /rewards/earned`
سجل المكافآت المكتسبة فقط مع الإجمالي.

**Query Params**: `page`, `limit`, `source`

**Response `200`**:
```json
{
  "rewards": [...],
  "totalEarned": 850,
  "total": 12,
  "page": 1,
  "pages": 1
}
```

---

### `GET /rewards/options`
جلب خيارات الاستبدال المتاحة.

**Response `200`**:
```json
{
  "options": [
    {
      "optionId": "discount_10",
      "name": { "ar": "خصم 10% على دورة", "en": "10% Course Discount" },
      "description": { "ar": "احصل على خصم 10% على أي دورة", "en": "Get 10% off any course" },
      "pointsCost": 100,
      "type": "discount",
      "value": 10,
      "isActive": true,
      "expiryDays": 30
    },
    {
      "optionId": "discount_25",
      "pointsCost": 250,
      "type": "discount",
      "value": 25
    },
    {
      "optionId": "free_course",
      "pointsCost": 500,
      "type": "discount",
      "value": 100
    },
    {
      "optionId": "monthly_subscription",
      "pointsCost": 1000,
      "type": "subscription",
      "value": 1
    },
    {
      "optionId": "profile_highlight",
      "pointsCost": 150,
      "type": "feature",
      "value": 7
    },
    {
      "optionId": "premium_badge",
      "pointsCost": 200,
      "type": "feature",
      "value": 1
    }
  ]
}
```

---

### `POST /rewards/redeem/preview`
معاينة الاستبدال قبل التأكيد النهائي.

**Body**:
```json
{ "optionId": "discount_10" }
```

**Response `200`**:
```json
{
  "option": {
    "optionId": "discount_10",
    "name": { "ar": "خصم 10% على دورة", "en": "10% Course Discount" },
    "pointsCost": 100,
    "type": "discount",
    "value": 10,
    "expiryDays": 30
  },
  "currentBalance": 450,
  "balanceAfter": 350,
  "canRedeem": true,
  "insufficientPoints": null
}
```

**Response `200`** - رصيد غير كافٍ:
```json
{
  "currentBalance": 80,
  "balanceAfter": null,
  "canRedeem": false,
  "insufficientPoints": 20
}
```

---

### `POST /rewards/redeem`
استبدال النقاط وتطبيق الخصم/الميزة فوراً.

**Body**:
```json
{ "optionId": "discount_10" }
```

**Response `200`**:
```json
{
  "success": true,
  "optionId": "discount_10",
  "optionName": { "ar": "خصم 10% على دورة", "en": "10% Course Discount" },
  "pointsDeducted": 100,
  "newBalance": 350,
  "transactionId": "...",
  "appliedRedemption": { "_id": "...", "expiresAt": "2026-04-20T00:00:00Z" }
}
```

**Response `400`** - رصيد غير كافٍ:
```json
{
  "error": "رصيد النقاط غير كافٍ",
  "required": 100,
  "available": 80
}
```

---

### `GET /rewards/redemptions`
سجل الاستبدالات السابقة.

**Query Params**: `page`, `limit`

**Response `200`**:
```json
{
  "redemptions": [
    {
      "_id": "...",
      "optionId": "discount_10",
      "optionName": "خصم 10% على دورة",
      "pointsCost": 100,
      "status": "applied",
      "createdAt": "2026-03-10T12:00:00Z"
    }
  ],
  "total": 4,
  "page": 1,
  "pages": 1
}
```

---

### `GET /rewards/active-redemptions`
جلب الاستبدالات النشطة (غير منتهية وغير مستخدمة).

**Response `200`**:
```json
{
  "redemptions": [
    {
      "_id": "...",
      "optionId": "discount_10",
      "type": "discount",
      "value": 10,
      "expiresAt": "2026-04-20T00:00:00Z"
    }
  ]
}
```

---

### `POST /rewards/apply-redemption`
تطبيق استبدال نشط على عملية شراء.

**Body**:
```json
{ "redemptionId": "<redemption_id>" }
```

**Response `200`**:
```json
{
  "success": true,
  "redemption": { "_id": "...", "status": "used", "usedAt": "2026-03-20T10:00:00Z" }
}
```

---

## 3. Leaderboard API - لوحة المتصدرين

### `GET /leaderboard`
جلب لوحة المتصدرين مع فلترة حسب الفترة.

**Query Params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `alltime` | `monthly \| yearly \| alltime` |
| `page` | number | 1 | رقم الصفحة |
| `limit` | number | 20 | عدد النتائج |

**Response `200`**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "...",
      "name": "أحمد محمد",
      "referralCount": 45,
      "totalPoints": 4200,
      "isVisible": true
    }
  ],
  "period": "monthly",
  "total": 150
}
```

---

### `GET /leaderboard/my-rank`
جلب ترتيب المستخدم الحالي في اللوحة.

**Query Params**: `period` (`monthly | yearly | alltime`)

**Response `200`**:
```json
{
  "rank": 12,
  "referralCount": 8,
  "totalPoints": 650,
  "period": "monthly",
  "isVisible": true
}
```

---

### `PUT /leaderboard/visibility`
تحديث خيار إخفاء/إظهار الاسم في لوحة المتصدرين.

**Body**:
```json
{ "isVisible": false }
```

**Response `200`**:
```json
{ "message": "تم تحديث الإعداد بنجاح", "isVisible": false }
```

---

### `POST /leaderboard/refresh`
تحديث يدوي للوحة المتصدرين (للمستخدمين المصرح لهم).

**Response `200`**:
```json
{ "message": "تم تحديث لوحة المتصدرين بنجاح" }
```

---

## 4. Anti-Fraud API - منع الاحتيال

> ⚠️ جميع endpoints هذه تتطلب صلاحية `Admin` ما عدا `POST /fraud/check`.

### `POST /fraud/check`
فحص إحالة للكشف عن الاحتيال (للنظام الداخلي).

**Body**:
```json
{
  "referralId": "...",
  "ipAddress": "192.168.1.1",
  "deviceFingerprint": "abc123"
}
```

**Response `200`**:
```json
{
  "status": "clean",
  "suspicionScore": 10,
  "flags": []
}
```

---

### `GET /fraud/suspicious` 🔒 Admin
جلب الإحالات المشبوهة مع pagination وفلترة.

**Query Params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | رقم الصفحة |
| `limit` | number | 20 | عدد النتائج |
| `status` | string | `all` | `suspicious \| blocked \| clean \| all` |
| `minScore` | number | - | الحد الأدنى لدرجة الشك |
| `maxScore` | number | - | الحد الأقصى لدرجة الشك |

**Response `200`**:
```json
{
  "referrals": [
    {
      "_id": "...",
      "referrerId": "...",
      "suspicionScore": 70,
      "flags": ["same_ip", "rapid_signups"],
      "status": "suspicious",
      "createdAt": "2026-03-15T08:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}
```

---

### `GET /fraud/suspicious/:id` 🔒 Admin
جلب تفاصيل فحص احتيال واحد.

**Response `200`**:
```json
{
  "_id": "...",
  "referralId": "...",
  "suspicionScore": 70,
  "flags": ["same_ip"],
  "status": "suspicious",
  "reviewedBy": null,
  "reviewedAt": null
}
```

---

### `POST /fraud/review/:referralId` 🔒 Admin
مراجعة إحالة مشبوهة (قبول أو رفض).

**Body**:
```json
{
  "decision": "approve",
  "notes": "تم التحقق يدوياً"
}
```
`decision`: `approve | reject`

**Response `200`**:
```json
{ "message": "تم تحديث حالة الإحالة بنجاح" }
```

---

### `POST /fraud/flag` 🔒 Admin
وضع علامة مشبوهة على مستخدم.

**Body**:
```json
{ "userId": "...", "reason": "نشاط مشبوه" }
```

---

### `POST /fraud/block` 🔒 Admin
حظر مستخدم.

**Body**:
```json
{ "userId": "...", "reason": "إحالات وهمية" }
```

**Response `200`**:
```json
{ "message": "تم حظر المستخدم بنجاح" }
```

---

### `POST /fraud/unblock/:userId` 🔒 Admin
رفع الحظر عن مستخدم.

**Response `200`**:
```json
{ "message": "تم رفع الحظر عن المستخدم بنجاح" }
```

---

### `POST /fraud/revoke-rewards/:referralId` 🔒 Admin
إلغاء مكافآت إحالة محددة.

**Response `200`**:
```json
{ "message": "تم إلغاء المكافآت بنجاح" }
```

---

### `POST /fraud/revoke-rewards/user/:userId` 🔒 Admin
إلغاء جميع مكافآت مستخدم.

**Response `200`**:
```json
{ "message": "تم إلغاء جميع مكافآت المستخدم بنجاح" }
```

---

### `GET /fraud/stats` 🔒 Admin
إحصائيات الاحتيال الإجمالية.

**Response `200`**:
```json
{
  "total": 120,
  "suspicious": 8,
  "blocked": 3,
  "clean": 109,
  "blockedUsers": 2
}
```

---

## 5. Company Referral API - إحالة الشركات

### `GET /company-referrals/my-code`
جلب كود ورابط إحالة الشركة.

**Response `200`**:
```json
{
  "code": "COMP_XYZ789",
  "link": "https://careerak.com/company/register?ref=COMP_XYZ789"
}
```

---

### `POST /company-referrals/track`
تسجيل إحالة شركة جديدة.

**Body**:
```json
{
  "referralCode": "COMP_XYZ789",
  "source": "email"
}
```

---

### `GET /company-referrals/my-referrals`
قائمة الشركات المُحالة.

**Query Params**: `page`, `limit`

---

### `GET /company-referrals/stats`
إحصائيات إحالات الشركة.

**Response `200`**:
```json
{
  "total": 5,
  "completed": 3,
  "totalPointsEarned": 2400,
  "breakdown": {
    "company_referral": 1500,
    "first_job_post": 900
  }
}
```

---

### `GET /company-referrals/discount`
جلب نسبة الخصم المستحقة بناءً على الإحالات.

**Response `200`**:
```json
{
  "discountPercentage": 15,
  "eligibleReferrals": 3
}
```

---

### `POST /company-referrals/apply-discount`
تطبيق خصم بالنقاط على باقة توظيف.

**Body**:
```json
{
  "packageId": "...",
  "pointsToUse": 500
}
```

---

### `POST /company-referrals/apply-discount-by-referrals`
تطبيق خصم تلقائي بناءً على الإحالات المكتملة.

**Body**:
```json
{ "packageId": "..." }
```

---

## 6. Admin Referral Export API 🔒 Admin

### `GET /admin/referrals/export`
تصدير تقرير الإحالات الإداري الشامل.

**Query Params**:
| Param | Type | Values |
|-------|------|--------|
| `format` | string | `pdf \| excel` |

**Response**: ملف PDF أو Excel للتنزيل.

---

### `GET /admin/referrals/analytics/conversion` 🔒 Admin
معدل التحويل والنجاح على مستوى البرنامج كله.

**Response `200`**:
```json
{
  "totalReferrals": 500,
  "completedReferrals": 210,
  "conversionRate": 42.0,
  "successRate": 42.0,
  "totalPointsAwarded": 45000,
  "totalPointsRedeemed": 22000,
  "redemptionRate": 48.9
}
```

---

## 📊 هيكل المكافآت

| الحدث | نقاط المحيل | نقاط المُحال |
|-------|------------|-------------|
| تسجيل مستخدم جديد | 50 | 25 |
| إكمال أول دورة | 100 | - |
| الحصول على وظيفة | 200 | - |
| إكمال 5 دورات | 150 | - |
| اشتراك مدفوع | 300 | - |
| إحالة شركة | 500 | - |
| نشر أول وظيفة (شركة) | 300 | - |
| توظيف ناجح (شركة) | 400 | - |
| اشتراك سنوي (شركة) | 1000 | - |

---

## 🔒 رموز الأخطاء

| الكود | HTTP | الوصف |
|-------|------|-------|
| `FRAUD_DETECTED` | 403 | تم رفض الإحالة بسبب نشاط مشبوه |
| `INSUFFICIENT_POINTS` | 400 | رصيد النقاط غير كافٍ للاستبدال |
| `REDEMPTION_NOT_FOUND` | 404 | الاستبدال غير موجود أو منتهي |
| - | 401 | غير مصادق - يجب تسجيل الدخول |
| - | 403 | غير مصرح - يتطلب صلاحية Admin |

---

**تاريخ الإنشاء**: 2026-03-20  
**المتطلبات**: معايير القبول النهائية - توثيق كامل للـ API
