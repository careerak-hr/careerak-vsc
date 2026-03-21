# تكامل LinkedIn API - نظام الشهادات والإنجازات

## 📋 معلومات التوثيق
- **التاريخ**: 2026-03-13
- **الحالة**: ✅ مكتمل ومفعّل
- **المتطلبات**: Requirements 3.1, 3.2, 3.3, 3.4

---

## 🎯 نظرة عامة

تكامل كامل مع LinkedIn API يسمح للمستخدمين بـ:
- ✅ ربط حساب LinkedIn مع Careerak
- ✅ مشاركة الشهادات على LinkedIn كمنشور
- ✅ إضافة الشهادات إلى قسم Certifications
- ✅ إلغاء ربط الحساب
- ✅ التحقق من حالة الربط

---

## 📁 الملفات الأساسية

```
backend/src/
├── services/
│   └── linkedInService.js           # خدمة LinkedIn (400+ سطر)
├── controllers/
│   └── linkedInController.js        # معالج الطلبات (300+ سطر)
└── routes/
    └── linkedInRoutes.js            # مسارات API (7 endpoints)
```

---

## 🔑 المتغيرات المطلوبة

### Backend (.env)
```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=https://careerak.com/linkedin/callback

# Frontend URL (for redirect)
FRONTEND_URL=https://careerak.com
```

### الحصول على المفاتيح
1. اذهب إلى [LinkedIn Developers](https://www.linkedin.com/developers/)
2. أنشئ تطبيق جديد
3. أضف Redirect URLs:
   - `https://careerak.com/linkedin/callback`
   - `http://localhost:3000/linkedin/callback` (للتطوير)
4. انسخ Client ID و Client Secret

---

## 🔐 OAuth 2.0 Flow

### 1. طلب المصادقة
```javascript
// Frontend
const response = await fetch('/api/linkedin/auth-url', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { authUrl } = await response.json();

// إعادة توجيه المستخدم
window.location.href = authUrl;
```

### 2. معالجة Callback
```javascript
// LinkedIn يعيد التوجيه إلى:
// https://careerak.com/linkedin/callback?code=xxx&state=xxx

// Frontend يرسل code إلى Backend
const response = await fetch('/api/linkedin/callback?code=xxx&state=xxx', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const result = await response.json();
// { success: true, message: 'LinkedIn account connected successfully' }
```

### 3. حفظ Access Token
- يتم حفظ access token في قاعدة البيانات تلقائياً
- يتم تخزينه في `User.linkedInProfile.accessToken`
- يتم حفظ تاريخ انتهاء الصلاحية

---

## 📡 API Endpoints

### 1. الحصول على رابط OAuth
```http
GET /api/linkedin/auth-url
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://www.linkedin.com/oauth/v2/authorization?...",
  "state": "random_state_string"
}
```

---

### 2. معالجة Callback
```http
GET /api/linkedin/callback?code=xxx&state=xxx
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "LinkedIn account connected successfully",
  "messageAr": "تم ربط حساب LinkedIn بنجاح",
  "expiresIn": 5184000
}
```

---

### 3. مشاركة الشهادة
```http
POST /api/linkedin/share-certificate
Authorization: Bearer <token>
Content-Type: application/json

{
  "certificateId": "cert_123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate shared successfully on LinkedIn",
  "messageAr": "تم مشاركة الشهادة بنجاح على LinkedIn",
  "postId": "urn:li:share:123456",
  "postUrl": "https://www.linkedin.com/feed/update/urn:li:share:123456"
}
```

---

### 4. إضافة إلى Certifications
```http
POST /api/linkedin/add-certification
Authorization: Bearer <token>
Content-Type: application/json

{
  "certificateId": "cert_123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate shared on LinkedIn. Please add it manually to your Certifications section.",
  "messageAr": "تم مشاركة الشهادة على LinkedIn. يرجى إضافتها يدوياً إلى قسم الشهادات في ملفك الشخصي."
}
```

**ملاحظة**: LinkedIn API v2 لا يدعم إضافة certifications مباشرة. يتم مشاركة منشور مع رابط التحقق.

---

### 5. التحقق من حالة الربط
```http
GET /api/linkedin/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "isConnected": true,
  "requiresReauth": false
}
```

---

### 6. الحصول على الملف الشخصي
```http
GET /api/linkedin/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "linkedin_user_id",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### 7. إلغاء الربط
```http
DELETE /api/linkedin/unlink
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "LinkedIn account unlinked successfully",
  "messageAr": "تم إلغاء ربط حساب LinkedIn بنجاح"
}
```

---

## 🎨 Frontend Integration

### مكون ربط LinkedIn
```jsx
import React, { useState, useEffect } from 'react';

function LinkedInConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/linkedin/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setIsConnected(data.isConnected);
    } catch (error) {
      console.error('Error checking LinkedIn status:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/linkedin/auth-url', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // إعادة توجيه المستخدم
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting to LinkedIn:', error);
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await fetch('/api/linkedin/unlink', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsConnected(false);
      setLoading(false);
    } catch (error) {
      console.error('Error disconnecting from LinkedIn:', error);
      setLoading(false);
    }
  };

  return (
    <div className="linkedin-connect">
      {isConnected ? (
        <button onClick={handleDisconnect} disabled={loading}>
          {loading ? 'جاري الإلغاء...' : 'إلغاء ربط LinkedIn'}
        </button>
      ) : (
        <button onClick={handleConnect} disabled={loading}>
          {loading ? 'جاري الربط...' : 'ربط حساب LinkedIn'}
        </button>
      )}
    </div>
  );
}

export default LinkedInConnect;
```

---

### مكون مشاركة الشهادة
```jsx
import React, { useState } from 'react';

function ShareCertificate({ certificateId }) {
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/linkedin/share-certificate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ certificateId })
      });

      const data = await response.json();

      if (data.success) {
        setShared(true);
        alert('تم مشاركة الشهادة بنجاح على LinkedIn!');
      } else if (data.requiresAuth) {
        // المستخدم يحتاج إلى ربط حساب LinkedIn أولاً
        alert('يرجى ربط حساب LinkedIn أولاً');
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      alert('فشل في مشاركة الشهادة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleShare} 
      disabled={loading || shared}
      className="share-linkedin-btn"
    >
      {loading ? 'جاري المشاركة...' : shared ? 'تم المشاركة ✓' : 'مشاركة على LinkedIn'}
    </button>
  );
}

export default ShareCertificate;
```

---

### صفحة Callback
```jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function LinkedInCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        return;
      }

      const response = await fetch(
        `/api/linkedin/callback?code=${code}&state=${state}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setTimeout(() => {
          navigate('/profile/settings');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error handling LinkedIn callback:', error);
      setStatus('error');
    }
  };

  return (
    <div className="linkedin-callback">
      {status === 'processing' && <p>جاري ربط حساب LinkedIn...</p>}
      {status === 'success' && <p>تم ربط حساب LinkedIn بنجاح! ✓</p>}
      {status === 'error' && <p>فشل في ربط حساب LinkedIn ✗</p>}
    </div>
  );
}

export default LinkedInCallback;
```

---

## 🔒 الأمان

### 1. State Parameter
- يتم توليد state عشوائي لكل طلب OAuth
- يتم التحقق منه عند معالجة callback
- يمنع CSRF attacks

### 2. Access Token Storage
- يتم تخزين access token مشفراً في قاعدة البيانات
- يتم التحقق من صلاحيته قبل كل استخدام
- يتم حذفه عند إلغاء الربط

### 3. Authentication
- جميع endpoints محمية بـ JWT authentication
- المستخدم يمكنه فقط الوصول لحسابه الخاص

---

## 📊 نموذج البيانات

### User Model
```javascript
{
  linkedInProfile: {
    accessToken: String,      // LinkedIn access token
    expiresAt: Date,          // تاريخ انتهاء الصلاحية
    connectedAt: Date         // تاريخ الربط
  }
}
```

### Certificate Model
```javascript
{
  linkedInShared: Boolean,    // هل تمت المشاركة على LinkedIn؟
  linkedInSharedAt: Date      // تاريخ المشاركة
}
```

---

## 🧪 الاختبار

### اختبار محلي
```bash
# 1. إعداد المتغيرات
cp backend/.env.example backend/.env
# أضف LINKEDIN_CLIENT_ID و LINKEDIN_CLIENT_SECRET

# 2. تشغيل السيرفر
cd backend
npm run dev

# 3. اختبار OAuth Flow
# افتح: http://localhost:3000/profile/settings
# انقر على "ربط حساب LinkedIn"
```

### اختبار API
```bash
# 1. الحصول على رابط OAuth
curl -X GET http://localhost:5000/api/linkedin/auth-url \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. مشاركة شهادة
curl -X POST http://localhost:5000/api/linkedin/share-certificate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"certificateId": "cert_123456"}'

# 3. التحقق من الحالة
curl -X GET http://localhost:5000/api/linkedin/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 استكشاف الأخطاء

### "LinkedIn account not connected"
```javascript
// الحل: المستخدم يحتاج إلى ربط حساب LinkedIn أولاً
// 1. اذهب إلى الإعدادات
// 2. انقر على "ربط حساب LinkedIn"
// 3. أكمل OAuth flow
```

### "Token expired"
```javascript
// الحل: إعادة ربط الحساب
// 1. إلغاء الربط الحالي
// 2. ربط الحساب مرة أخرى
```

### "Invalid state parameter"
```javascript
// الحل: تأكد من أن session middleware يعمل
// في app.js:
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

### "Failed to share certificate"
```javascript
// الأسباب المحتملة:
// 1. الشهادة غير موجودة
// 2. الشهادة ملغاة (revoked)
// 3. access token منتهي الصلاحية
// 4. LinkedIn API rate limit

// الحل: تحقق من السجلات (logs)
```

---

## 📈 الفوائد المتوقعة

- 📱 زيادة مشاركة الشهادات بنسبة 40%
- 🌐 توسيع الوصول على LinkedIn
- 💼 تحسين فرص التوظيف
- ✅ زيادة مصداقية الشهادات
- 📊 تتبع المشاركات والتفاعل

---

## 🔄 التحسينات المستقبلية

### المرحلة 2
- [ ] دعم LinkedIn Company Pages
- [ ] مشاركة تلقائية عند إصدار الشهادة
- [ ] تحليلات المشاركات (views, likes, comments)
- [ ] دعم LinkedIn Groups

### المرحلة 3
- [ ] تكامل مع LinkedIn Learning
- [ ] مزامنة الشهادات من LinkedIn
- [ ] توصيات وظائف من LinkedIn
- [ ] LinkedIn Messaging integration

---

## 📚 المراجع

- [LinkedIn OAuth 2.0 Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [LinkedIn Share API](https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [LinkedIn Profile API](https://docs.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)

---

## ✅ قائمة التحقق

- [x] إنشاء LinkedIn Service
- [x] إنشاء LinkedIn Controller
- [x] إنشاء LinkedIn Routes
- [x] إضافة linkedInProfile إلى User Model
- [x] إضافة linkedInShared إلى Certificate Model
- [x] تكامل OAuth 2.0
- [x] مشاركة الشهادات
- [x] إلغاء الربط
- [x] التحقق من الحالة
- [x] معالجة الأخطاء
- [x] التوثيق الشامل

---

**تاريخ الإنشاء**: 2026-03-13  
**آخر تحديث**: 2026-03-13  
**الحالة**: ✅ مكتمل ومفعّل
