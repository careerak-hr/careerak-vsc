# Security Score Feature - ميزة درجة أمان الحساب

## 📋 معلومات الميزة

- **تاريخ الإضافة**: 2026-02-23
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: User Story 7 - تحسينات إضافية للأمان

---

## 🎯 نظرة عامة

ميزة Security Score تقوم بحساب وعرض درجة أمان حساب المستخدم بناءً على عدة عوامل أمنية. تساعد هذه الميزة المستخدمين على:

- معرفة مستوى أمان حسابهم
- الحصول على توصيات لتحسين الأمان
- تتبع تقدمهم في تحسين الأمان

---

## 🏗️ البنية التقنية

### Backend

#### 1. Security Score Service
**الموقع**: `backend/src/services/securityScoreService.js`

**الوظائف الرئيسية**:

```javascript
// حساب Security Score
calculateSecurityScore(user)
// Returns: { score, maxScore, percentage, level, levelLabel, color, factors, recommendations, calculatedAt }

// الحصول على نصائح أمنية
getSecurityTips(securityScore)
// Returns: Array of tips
```

**عوامل الحساب** (إجمالي 100 نقطة):

| العامل | النقاط | الوصف |
|--------|--------|-------|
| قوة كلمة المرور | 25 | بناءً على zxcvbn score (0-4) |
| تأكيد البريد | 20 | 20 نقطة إذا تم التأكيد |
| المصادقة الثنائية | 30 | 30 نقطة إذا تم التفعيل |
| حسابات OAuth | 15 | 5 نقاط لكل حساب (حد أقصى 15) |
| اكتمال الملف | 10 | بناءً على 4 حقول |

**مستويات الأمان**:

| النطاق | المستوى | اللون |
|--------|---------|-------|
| 80-100 | ممتاز (excellent) | أخضر (#10b981) |
| 60-79 | جيد (good) | أزرق (#3b82f6) |
| 40-59 | متوسط (medium) | برتقالي (#f59e0b) |
| 0-39 | ضعيف (weak) | أحمر (#ef4444) |

#### 2. Security Score Controller
**الموقع**: `backend/src/controllers/securityScoreController.js`

**Endpoints**:

```javascript
// GET /api/security-score
exports.getSecurityScore
// Returns: Full security score with factors, recommendations, and tips

// GET /api/security-score/recommendations
exports.getRecommendations
// Returns: Recommendations only with score and level
```

#### 3. Routes
**الموقع**: `backend/src/routes/securityScoreRoutes.js`

```javascript
router.get('/', getSecurityScore);
router.get('/recommendations', getRecommendations);
```

**Authentication**: جميع المسارات محمية بـ `protect` middleware

---

### Frontend

#### 1. SecurityScore Component
**الموقع**: `frontend/src/components/SecurityScore/SecurityScore.jsx`

**Props**:

```javascript
<SecurityScore 
  compact={false}  // true للوضع المضغوط
/>
```

**الميزات**:
- ✅ عرض الدرجة في دائرة تقدم متحركة
- ✅ عرض جميع العوامل مع أشرطة تقدم
- ✅ عرض التوصيات مع أولويات (high, medium, low)
- ✅ عرض نصائح أمنية
- ✅ وضع مضغوط للعرض في Dashboard
- ✅ زر تحديث
- ✅ حالات loading و error

#### 2. Styles
**الموقع**: `frontend/src/components/SecurityScore/SecurityScore.css`

**الميزات**:
- ✅ تصميم responsive
- ✅ دعم RTL
- ✅ ألوان ديناميكية حسب المستوى
- ✅ animations سلسة

---

## 📊 API Documentation

### GET /api/security-score

**Description**: الحصول على Security Score الكامل للمستخدم الحالي

**Authentication**: Required (Bearer Token)

**Request**:
```http
GET /api/security-score
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "score": 65,
    "maxScore": 100,
    "percentage": 65,
    "level": "good",
    "levelLabel": "جيد",
    "color": "#3b82f6",
    "factors": [
      {
        "name": "password_strength",
        "label": "قوة كلمة المرور",
        "score": 18.75,
        "maxScore": 25,
        "status": "good"
      },
      {
        "name": "email_verified",
        "label": "تأكيد البريد الإلكتروني",
        "score": 20,
        "maxScore": 20,
        "status": "good"
      },
      {
        "name": "two_factor",
        "label": "المصادقة الثنائية (2FA)",
        "score": 0,
        "maxScore": 30,
        "status": "weak"
      },
      {
        "name": "oauth_accounts",
        "label": "حسابات OAuth المرتبطة",
        "score": 10,
        "maxScore": 15,
        "status": "medium",
        "count": 2
      },
      {
        "name": "profile_completeness",
        "label": "اكتمال الملف الشخصي",
        "score": 7.5,
        "maxScore": 10,
        "status": "good",
        "completedFields": 3,
        "totalFields": 4
      }
    ],
    "recommendations": [
      {
        "type": "2fa",
        "priority": "medium",
        "message": "فعّل المصادقة الثنائية لحماية إضافية لحسابك",
        "action": "enable_2fa"
      },
      {
        "type": "profile",
        "priority": "low",
        "message": "أكمل ملفك الشخصي لتحسين أمان حسابك",
        "action": "complete_profile"
      }
    ],
    "tips": [
      {
        "category": "general",
        "tip": "لا تشارك كلمة المرور مع أي شخص",
        "icon": "🔒"
      },
      {
        "category": "general",
        "tip": "استخدم كلمة مرور فريدة لكل موقع",
        "icon": "🔑"
      },
      {
        "category": "security",
        "tip": "المصادقة الثنائية تحمي حسابك حتى لو تم اختراق كلمة المرور",
        "icon": "🛡️"
      }
    ],
    "calculatedAt": "2026-02-23T10:30:00.000Z"
  }
}
```

**Error Responses**:

```json
// 401 Unauthorized
{
  "success": false,
  "message": "غير مصرح"
}

// 404 Not Found
{
  "success": false,
  "message": "المستخدم غير موجود"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "حدث خطأ أثناء حساب Security Score",
  "error": "Error message"
}
```

---

### GET /api/security-score/recommendations

**Description**: الحصول على التوصيات فقط

**Authentication**: Required (Bearer Token)

**Request**:
```http
GET /api/security-score/recommendations
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "2fa",
        "priority": "medium",
        "message": "فعّل المصادقة الثنائية لحماية إضافية لحسابك",
        "action": "enable_2fa"
      }
    ],
    "score": 65,
    "level": "good"
  }
}
```

---

## 🎨 استخدام المكون

### الاستخدام الأساسي

```jsx
import SecurityScore from './components/SecurityScore/SecurityScore';

function SettingsPage() {
  return (
    <div>
      <h1>الإعدادات</h1>
      <SecurityScore />
    </div>
  );
}
```

### الوضع المضغوط

```jsx
import SecurityScore from './components/SecurityScore/SecurityScore';

function Dashboard() {
  return (
    <div>
      <h1>لوحة التحكم</h1>
      <SecurityScore compact={true} />
    </div>
  );
}
```

---

## 🔧 التكامل مع الأنظمة الموجودة

### 1. User Model
يستخدم الحقول التالية من User model:
- `passwordStrength.score`
- `emailVerified`
- `twoFactorEnabled`
- `oauthAccounts`
- `phone`, `country`, `city`, `profileImage`

### 2. Authentication
يتطلب JWT token صالح في header:
```javascript
Authorization: Bearer <token>
```

### 3. App.js
تم إضافة المسار في `backend/src/app.js`:
```javascript
app.use('/security-score', require('./routes/securityScoreRoutes'));
```

---

## 📈 الفوائد المتوقعة

- 🔒 زيادة وعي المستخدمين بأمان حساباتهم
- 📊 تحسين معدل تفعيل 2FA بنسبة 30-50%
- ✅ زيادة معدل تأكيد البريد الإلكتروني
- 🎯 تحسين جودة كلمات المرور
- 📈 زيادة ربط حسابات OAuth

---

## 🧪 الاختبار

### اختبار Backend

```bash
# اختبار API endpoint
curl -X GET http://localhost:5000/api/security-score \
  -H "Authorization: Bearer <your_token>"

# اختبار recommendations endpoint
curl -X GET http://localhost:5000/api/security-score/recommendations \
  -H "Authorization: Bearer <your_token>"
```

### اختبار Frontend

```bash
# تشغيل المثال
cd frontend
npm start

# افتح المتصفح على:
# http://localhost:3000/examples/security-score
```

---

## 🎯 أفضل الممارسات

### للمطورين

**✅ افعل**:
- استخدم المكون في صفحة الإعدادات
- استخدم الوضع المضغوط في Dashboard
- حدّث Security Score بعد تغييرات الأمان
- اعرض التوصيات بشكل بارز

**❌ لا تفعل**:
- لا تعرض Security Score للمستخدمين غير المسجلين
- لا تخزن Security Score في localStorage
- لا تتجاهل التوصيات ذات الأولوية العالية

### للمستخدمين

**✅ افعل**:
- اتبع التوصيات حسب الأولوية
- فعّل 2FA للحصول على 30 نقطة إضافية
- أكد بريدك الإلكتروني
- استخدم كلمة مرور قوية

---

## 🔄 التحديثات المستقبلية

### المخطط لها:
- [ ] تتبع تاريخ Security Score
- [ ] إشعارات عند انخفاض الدرجة
- [ ] مكافآت لتحسين الأمان
- [ ] مقارنة مع متوسط المستخدمين
- [ ] تقارير أمنية شهرية

---

## 📚 المراجع

- [OWASP Security Guidelines](https://owasp.org/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)
- [Two-Factor Authentication Best Practices](https://www.ncsc.gov.uk/guidance/multi-factor-authentication-online-services)

---

## 🐛 استكشاف الأخطاء

### "غير مصرح" (401)
- تحقق من وجود token في localStorage
- تحقق من صلاحية token
- تحقق من header Authorization

### "المستخدم غير موجود" (404)
- تحقق من صحة user ID في token
- تحقق من وجود المستخدم في قاعدة البيانات

### "حدث خطأ أثناء حساب Security Score" (500)
- تحقق من اتصال MongoDB
- تحقق من سجلات الخادم
- تحقق من صحة بيانات المستخدم

---

## 📞 الدعم

للمساعدة أو الإبلاغ عن مشاكل:
- البريد الإلكتروني: careerak.hr@gmail.com
- GitHub Issues: [رابط المشروع]

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23  
**الحالة**: ✅ مكتمل ومفعّل
