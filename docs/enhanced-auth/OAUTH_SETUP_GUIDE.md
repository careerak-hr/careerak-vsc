# OAuth Setup Guide

## 📋 نظرة عامة

دليل شامل لإعداد OAuth 2.0 مع Google, Facebook, و LinkedIn.

---

## 🔵 Google OAuth Setup

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
3. اختر "Application type": **Web application**
4. أدخل الاسم: `Careerak Web Client`

### الخطوة 4: إضافة Authorized Redirect URIs

أضف الـ URIs التالية:

**Development:**
```
http://localhost:5000/auth/google/callback
http://localhost:3000/auth/google/callback
```

**Production:**
```
https://your-domain.com/auth/google/callback
https://api.your-domain.com/auth/google/callback
```

### الخطوة 5: الحصول على Credentials

بعد الإنشاء، ستحصل على:
- **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-abc123def456`

### الخطوة 6: إضافة Credentials في Backend

أضف في ملف `.env`:

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

### الخطوة 7: اختبار Google OAuth

```bash
# افتح المتصفح
http://localhost:5000/auth/google

# يجب أن يتم توجيهك لصفحة تسجيل الدخول بـ Google
```

---

## 🔵 Facebook OAuth Setup

### الخطوة 1: إنشاء تطبيق في Facebook Developers

1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. انقر على "My Apps" → "Create App"
3. اختر "Consumer" → "Next"
4. أدخل اسم التطبيق: `Careerak`
5. أدخل بريدك الإلكتروني
6. انقر على "Create App"

### الخطوة 2: إضافة Facebook Login

1. في Dashboard، انقر على "Add Product"
2. ابحث عن "Facebook Login" → "Set Up"
3. اختر "Web"

### الخطوة 3: إعداد Valid OAuth Redirect URIs

1. اذهب إلى "Facebook Login" → "Settings"
2. أضف الـ URIs التالية في "Valid OAuth Redirect URIs":

**Development:**
```
http://localhost:5000/auth/facebook/callback
http://localhost:3000/auth/facebook/callback
```

**Production:**
```
https://your-domain.com/auth/facebook/callback
https://api.your-domain.com/auth/facebook/callback
```

3. احفظ التغييرات

### الخطوة 4: الحصول على App ID و App Secret

1. اذهب إلى "Settings" → "Basic"
2. ستجد:
   - **App ID**: `1234567890123456`
   - **App Secret**: انقر على "Show" لعرضه

### الخطوة 5: إضافة Credentials في Backend

أضف في ملف `.env`:

```env
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abc123def456ghi789
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback
```

### الخطوة 6: تفعيل التطبيق (Production)

1. في Dashboard، اذهب إلى "Settings" → "Basic"
2. أضف "Privacy Policy URL" و "Terms of Service URL"
3. اختر "Category"
4. في أعلى الصفحة، غيّر الوضع من "Development" إلى "Live"

### الخطوة 7: اختبار Facebook OAuth

```bash
# افتح المتصفح
http://localhost:5000/auth/facebook

# يجب أن يتم توجيهك لصفحة تسجيل الدخول بـ Facebook
```

---

## 🔵 LinkedIn OAuth Setup

### الخطوة 1: إنشاء تطبيق في LinkedIn Developers

1. اذهب إلى [LinkedIn Developers](https://www.linkedin.com/developers/)
2. انقر على "Create app"
3. املأ المعلومات:
   - **App name**: Careerak
   - **LinkedIn Page**: اختر صفحة شركتك (أو أنشئ واحدة)
   - **App logo**: ارفع شعار التطبيق
   - **Legal agreement**: وافق على الشروط
4. انقر على "Create app"

### الخطوة 2: إضافة Sign In with LinkedIn

1. في صفحة التطبيق، اذهب إلى "Products"
2. ابحث عن "Sign In with LinkedIn"
3. انقر على "Request access"
4. انتظر الموافقة (عادة فورية)

### الخطوة 3: إعداد Authorized Redirect URLs

1. اذهب إلى "Auth" tab
2. في "Authorized redirect URLs for your app"، أضف:

**Development:**
```
http://localhost:5000/auth/linkedin/callback
http://localhost:3000/auth/linkedin/callback
```

**Production:**
```
https://your-domain.com/auth/linkedin/callback
https://api.your-domain.com/auth/linkedin/callback
```

3. انقر على "Update"

### الخطوة 4: الحصول على Client ID و Client Secret

1. في "Auth" tab، ستجد:
   - **Client ID**: `abc123def456`
   - **Client Secret**: انقر على "Show" لعرضه

### الخطوة 5: إضافة Credentials في Backend

أضف في ملف `.env`:

```env
LINKEDIN_CLIENT_ID=abc123def456
LINKEDIN_CLIENT_SECRET=xyz789uvw012
LINKEDIN_CALLBACK_URL=http://localhost:5000/auth/linkedin/callback
```

### الخطوة 6: اختبار LinkedIn OAuth

```bash
# افتح المتصفح
http://localhost:5000/auth/linkedin

# يجب أن يتم توجيهك لصفحة تسجيل الدخول بـ LinkedIn
```

---

## 🔧 Backend Configuration

### ملف `.env` الكامل

```env
# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abc123def456ghi789
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=abc123def456
LINKEDIN_CLIENT_SECRET=xyz789uvw012
LINKEDIN_CALLBACK_URL=http://localhost:5000/auth/linkedin/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Passport.js Configuration

تأكد من أن ملف `backend/src/config/passport.js` يحتوي على:

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    // Handle user creation/login
  }
));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'emails', 'name', 'picture']
  },
  async (accessToken, refreshToken, profile, done) => {
    // Handle user creation/login
  }
));

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL,
    scope: ['r_emailaddress', 'r_liteprofile']
  },
  async (accessToken, refreshToken, profile, done) => {
    // Handle user creation/login
  }
));
```

---

## 🌐 Frontend Integration

### OAuth Button Component

```jsx
const OAuthButtons = () => {
  const handleOAuthLogin = (provider) => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      `${API_URL}/auth/${provider}`,
      'OAuth Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <div>
      <button onClick={() => handleOAuthLogin('google')}>
        Sign in with Google
      </button>
      <button onClick={() => handleOAuthLogin('facebook')}>
        Sign in with Facebook
      </button>
      <button onClick={() => handleOAuthLogin('linkedin')}>
        Sign in with LinkedIn
      </button>
    </div>
  );
};
```

---

## 🚨 استكشاف الأخطاء

### Google OAuth

**خطأ**: `redirect_uri_mismatch`
- **الحل**: تأكد من أن Redirect URI في Google Console يطابق تماماً الـ URL في Backend

**خطأ**: `access_denied`
- **الحل**: المستخدم رفض الإذن. هذا طبيعي.

### Facebook OAuth

**خطأ**: `Can't Load URL`
- **الحل**: تأكد من إضافة Redirect URI في Facebook Login Settings

**خطأ**: `App Not Setup`
- **الحل**: تأكد من إضافة Facebook Login product

### LinkedIn OAuth

**خطأ**: `unauthorized_client`
- **الحل**: تأكد من الحصول على موافقة "Sign In with LinkedIn"

**خطأ**: `invalid_redirect_uri`
- **الحل**: تأكد من إضافة Redirect URI في Auth settings

---

## ✅ Checklist

### قبل Production

- [ ] تحديث Redirect URIs لـ Production URLs
- [ ] تفعيل HTTPS
- [ ] تحديث FRONTEND_URL في `.env`
- [ ] اختبار OAuth على جميع المنصات الثلاث
- [ ] إضافة Privacy Policy URL (Facebook)
- [ ] إضافة Terms of Service URL (Facebook)
- [ ] تفعيل التطبيق (Facebook)
- [ ] مراجعة Scopes المطلوبة
- [ ] اختبار على أجهزة مختلفة

---

## 📞 الدعم

للمساعدة:
- **Email**: careerak.hr@gmail.com
- **Documentation**: [GitHub Repository]

---

**آخر تحديث**: 2026-02-18  
**الإصدار**: 1.0.0
