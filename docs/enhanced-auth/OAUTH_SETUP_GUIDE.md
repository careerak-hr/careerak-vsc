# دليل إعداد OAuth - Careerak

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إعداد OAuth للتسجيل/تسجيل الدخول عبر:
- ✅ Google OAuth 2.0
- ✅ Facebook Login
- ✅ LinkedIn OAuth

---

## 🔧 المتطلبات الأساسية

1. حساب على كل منصة (Google, Facebook, LinkedIn)
2. Backend يعمل على `http://localhost:5000` (أو URL آخر)
3. Frontend يعمل على `http://localhost:3000` (أو URL آخر)

---

## 1️⃣ إعداد Google OAuth

### الخطوة 1: إنشاء مشروع في Google Cloud Console

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. انقر على "Select a project" → "New Project"
3. أدخل اسم المشروع: `Careerak`
4. انقر على "Create"

### الخطوة 2: تفعيل Google+ API

1. في القائمة الجانبية، اذهب إلى "APIs & Services" → "Library"
2. ابحث عن "Google+ API"
3. انقر على "Enable"

### الخطوة 3: إنشاء OAuth 2.0 Credentials

1. اذهب إلى "APIs & Services" → "Credentials"
2. انقر على "Create Credentials" → "OAuth client ID"
3. إذا طُلب منك، قم بإعداد "OAuth consent screen":
   - User Type: External
   - App name: Careerak
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
   - Scopes: email, profile
   - Test users: أضف بريدك الإلكتروني
4. بعد إعداد Consent Screen، عد إلى "Credentials"
5. انقر على "Create Credentials" → "OAuth client ID"
6. Application type: Web application
7. Name: Careerak Web Client
8. Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:5000
   ```
9. Authorized redirect URIs:
   ```
   http://localhost:5000/auth/google/callback
   ```
10. انقر على "Create"
11. **احفظ Client ID و Client Secret**

### الخطوة 4: إضافة المفاتيح في .env

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

---

## 2️⃣ إعداد Facebook OAuth

### الخطوة 1: إنشاء تطبيق في Facebook Developers

1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. انقر على "My Apps" → "Create App"
3. Use case: "Authenticate and request data from users with Facebook Login"
4. App type: Consumer
5. App name: Careerak
6. App contact email: your-email@example.com
7. انقر على "Create App"

### الخطوة 2: إضافة Facebook Login

1. في Dashboard، انقر على "Add Product"
2. ابحث عن "Facebook Login" وانقر على "Set Up"
3. Platform: Web
4. Site URL: `http://localhost:3000`
5. انقر على "Save" → "Continue"

### الخطوة 3: إعداد OAuth Redirect URIs

1. في القائمة الجانبية، اذهب إلى "Facebook Login" → "Settings"
2. في "Valid OAuth Redirect URIs"، أضف:
   ```
   http://localhost:5000/auth/facebook/callback
   ```
3. انقر على "Save Changes"

### الخطوة 4: الحصول على App ID و App Secret

1. في القائمة الجانبية، اذهب إلى "Settings" → "Basic"
2. **احفظ App ID و App Secret**

### الخطوة 5: إضافة المفاتيح في .env

```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback
```

### الخطوة 6: تفعيل التطبيق (للإنتاج)

1. في "Settings" → "Basic"، قم بملء جميع الحقول المطلوبة
2. في أعلى الصفحة، غيّر الحالة من "Development" إلى "Live"

---

## 3️⃣ إعداد LinkedIn OAuth

### الخطوة 1: إنشاء تطبيق في LinkedIn Developers

1. اذهب إلى [LinkedIn Developers](https://www.linkedin.com/developers/)
2. انقر على "Create app"
3. App name: Careerak
4. LinkedIn Page: (اختر صفحة أو أنشئ واحدة)
5. App logo: (ارفع شعار التطبيق)
6. Legal agreement: (وافق على الشروط)
7. انقر على "Create app"

### الخطوة 2: إضافة Sign In with LinkedIn

1. في تبويب "Products"، ابحث عن "Sign In with LinkedIn"
2. انقر على "Request access"
3. انتظر الموافقة (عادة فورية)

### الخطوة 3: إعداد OAuth 2.0 Settings

1. اذهب إلى تبويب "Auth"
2. في "OAuth 2.0 settings"، أضف:
   - Authorized redirect URLs:
     ```
     http://localhost:5000/auth/linkedin/callback
     ```
3. انقر على "Update"

### الخطوة 4: الحصول على Client ID و Client Secret

1. في تبويب "Auth"، ستجد:
   - Client ID
   - Client Secret (انقر على "Show" لإظهاره)
2. **احفظ Client ID و Client Secret**

### الخطوة 5: إضافة المفاتيح في .env

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_CALLBACK_URL=http://localhost:5000/auth/linkedin/callback
```

---

## 4️⃣ إعداد Backend

### الخطوة 1: تثبيت المكتبات (مثبتة مسبقاً)

```bash
cd backend
npm install passport passport-google-oauth20 passport-facebook passport-linkedin-oauth2
```

### الخطوة 2: إنشاء ملف .env

```bash
cp .env.oauth.example .env
```

ثم املأ المفاتيح التي حصلت عليها من الخطوات السابقة.

### الخطوة 3: تشغيل Backend

```bash
npm start
```

يجب أن ترى:
```
✅ Google OAuth Strategy configured
✅ Facebook OAuth Strategy configured
✅ LinkedIn OAuth Strategy configured
```

---

## 5️⃣ اختبار OAuth

### اختبار Google OAuth

1. افتح المتصفح واذهب إلى:
   ```
   http://localhost:5000/auth/google
   ```
2. سيتم توجيهك إلى صفحة تسجيل الدخول بـ Google
3. اختر حساب Google
4. وافق على الأذونات
5. سيتم توجيهك إلى Frontend مع token

### اختبار Facebook OAuth

1. افتح المتصفح واذهب إلى:
   ```
   http://localhost:5000/auth/facebook
   ```
2. سيتم توجيهك إلى صفحة تسجيل الدخول بـ Facebook
3. أدخل بيانات الدخول
4. وافق على الأذونات
5. سيتم توجيهك إلى Frontend مع token

### اختبار LinkedIn OAuth

1. افتح المتصفح واذهب إلى:
   ```
   http://localhost:5000/auth/linkedin
   ```
2. سيتم توجيهك إلى صفحة تسجيل الدخول بـ LinkedIn
3. أدخل بيانات الدخول
4. وافق على الأذونات
5. سيتم توجيهك إلى Frontend مع token

---

## 6️⃣ API Endpoints

### OAuth Initiation

```
GET /auth/google          - بدء Google OAuth
GET /auth/facebook        - بدء Facebook OAuth
GET /auth/linkedin        - بدء LinkedIn OAuth
```

### OAuth Callbacks

```
GET /auth/google/callback    - Google callback
GET /auth/facebook/callback  - Facebook callback
GET /auth/linkedin/callback  - LinkedIn callback
```

### OAuth Management (محمية - تحتاج token)

```
GET    /auth/oauth/accounts      - جلب الحسابات المرتبطة
DELETE /auth/oauth/:provider     - فك ربط حساب OAuth
```

---

## 7️⃣ Frontend Integration

### مثال: زر Google OAuth

```jsx
function GoogleOAuthButton() {
  const handleGoogleLogin = () => {
    // فتح نافذة OAuth
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      'http://localhost:5000/auth/google',
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    // الاستماع لرسالة النجاح
    window.addEventListener('message', (event) => {
      if (event.data.type === 'oauth-success') {
        const { token, user } = event.data;
        // حفظ token
        localStorage.setItem('authToken', token);
        // إعادة توجيه
        window.location.href = '/dashboard';
      }
    });
  };
  
  return (
    <button onClick={handleGoogleLogin} className="oauth-button google">
      <GoogleIcon />
      <span>تسجيل بـ Google</span>
    </button>
  );
}
```

### صفحة OAuth Callback في Frontend

```jsx
// src/pages/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // حفظ في localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // إرسال رسالة للنافذة الأم (إذا كانت popup)
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth-success',
            token,
            user
          }, '*');
          window.close();
        } else {
          // إعادة توجيه عادية
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=oauth_failed');
      }
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="spinner"></div>
        <p className="mt-4">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;
```

---

## 8️⃣ الإنتاج (Production)

### تحديث Callback URLs

عند النشر على الإنتاج، قم بتحديث Callback URLs في:

1. **Google Cloud Console**:
   - Authorized redirect URIs: `https://your-domain.com/auth/google/callback`

2. **Facebook Developers**:
   - Valid OAuth Redirect URIs: `https://your-domain.com/auth/facebook/callback`

3. **LinkedIn Developers**:
   - Authorized redirect URLs: `https://your-domain.com/auth/linkedin/callback`

### تحديث .env للإنتاج

```env
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
FACEBOOK_CALLBACK_URL=https://your-domain.com/auth/facebook/callback
LINKEDIN_CALLBACK_URL=https://your-domain.com/auth/linkedin/callback
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 9️⃣ استكشاف الأخطاء

### خطأ: "redirect_uri_mismatch"

**السبب**: Callback URL غير مطابق للمسجل في OAuth app

**الحل**:
1. تأكد من أن Callback URL في `.env` مطابق تماماً للمسجل في OAuth app
2. تأكد من عدم وجود `/` في النهاية
3. تأكد من `http` vs `https`

### خطأ: "invalid_client"

**السبب**: Client ID أو Client Secret خاطئ

**الحل**:
1. تحقق من المفاتيح في `.env`
2. تأكد من عدم وجود مسافات زائدة
3. أعد نسخ المفاتيح من OAuth app

### خطأ: "access_denied"

**السبب**: المستخدم رفض الأذونات

**الحل**:
- هذا طبيعي، المستخدم اختار عدم المتابعة

### خطأ: "Strategy not configured"

**السبب**: OAuth credentials غير موجودة في `.env`

**الحل**:
1. تأكد من وجود ملف `.env` في مجلد `backend`
2. تأكد من وجود جميع المفاتيح المطلوبة
3. أعد تشغيل Backend

---

## 🔒 الأمان

### Best Practices

1. **لا تشارك المفاتيح السرية**:
   - لا تضع `.env` في Git
   - استخدم `.gitignore`

2. **استخدم HTTPS في الإنتاج**:
   - OAuth يتطلب HTTPS في Production

3. **قم بتشفير Tokens**:
   - Tokens مشفرة تلقائياً في قاعدة البيانات

4. **استخدم State Parameter**:
   - Passport.js يتعامل مع هذا تلقائياً

5. **قم بتحديث Tokens**:
   - استخدم Refresh Tokens عند انتهاء Access Tokens

---

## 📚 المراجع

- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [LinkedIn OAuth](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)
- [Passport.js](http://www.passportjs.org/)

---

**تاريخ الإنشاء**: 2026-02-18  
**آخر تحديث**: 2026-02-18  
**الحالة**: ✅ مكتمل

