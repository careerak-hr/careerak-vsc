# دليل البدء السريع - أزرار OAuth

## 🚀 البدء السريع (5 دقائق)

### 1. الإعداد (دقيقة واحدة)

#### Frontend
```bash
# لا يحتاج تثبيت - المكونات موجودة بالفعل
```

#### Backend
```bash
cd backend
npm install passport passport-google-oauth20 passport-facebook passport-linkedin-oauth2
```

### 2. المتغيرات البيئية (دقيقتان)

أضف في `backend/.env`:
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:5000/auth/linkedin/callback

# General
OAUTH_CALLBACK_URL=http://localhost:5000/auth
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
```

### 3. الاستخدام (دقيقة واحدة)

#### في أي صفحة React
```jsx
import OAuthButtons from '../components/auth/OAuthButtons';
import '../components/auth/OAuthButtons.css';

function MyPage() {
  return (
    <div>
      <OAuthButtons mode="register" />
      {/* أو */}
      <OAuthButtons mode="login" />
    </div>
  );
}
```

### 4. الاختبار (دقيقة واحدة)

```bash
# 1. شغّل Backend
cd backend
npm start

# 2. شغّل Frontend (في terminal آخر)
cd frontend
npm run dev

# 3. افتح المتصفح
# http://localhost:3000/auth

# 4. انقر على أي زر OAuth
```

---

## 📋 الحصول على OAuth Credentials

### Google OAuth
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد
3. فعّل Google+ API
4. أنشئ OAuth 2.0 credentials
5. أضف Authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback`
   - `https://your-domain.com/auth/google/callback`

### Facebook OAuth
1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. أنشئ تطبيق جديد
3. أضف Facebook Login product
4. في Settings → Basic، احصل على App ID و App Secret
5. في Facebook Login → Settings، أضف Valid OAuth Redirect URIs:
   - `http://localhost:5000/auth/facebook/callback`
   - `https://your-domain.com/auth/facebook/callback`

### LinkedIn OAuth
1. اذهب إلى [LinkedIn Developers](https://www.linkedin.com/developers/)
2. أنشئ تطبيق جديد
3. في Auth tab، احصل على Client ID و Client Secret
4. أضف Authorized redirect URLs:
   - `http://localhost:5000/auth/linkedin/callback`
   - `https://your-domain.com/auth/linkedin/callback`

---

## 🎨 التخصيص

### تغيير النصوص
```jsx
// في OAuthButtons.jsx
const translations = {
  ar: {
    google: 'نص مخصص',
    facebook: 'نص مخصص',
    linkedin: 'نص مخصص'
  }
};
```

### تغيير الألوان
```css
/* في OAuthButtons.css */
.oauth-button-google {
  border-color: #YOUR_COLOR;
  color: #YOUR_COLOR;
}
```

### تغيير الأيقونات
```jsx
// استبدل SVG في OAuthButtons.jsx
<svg className="oauth-icon" viewBox="0 0 24 24">
  {/* أيقونتك هنا */}
</svg>
```

---

## 🐛 استكشاف الأخطاء

### "Popup blocked"
```javascript
// تأكد من أن المستخدم نقر على الزر
// لا تفتح popup تلقائياً
```

### "OAuth credentials not found"
```bash
# تحقق من .env
cat backend/.env | grep GOOGLE_CLIENT_ID
```

### "Redirect URI mismatch"
```
# تأكد من أن callback URL في:
# 1. .env
# 2. OAuth provider settings
# متطابقة تماماً
```

### "CORS error"
```javascript
// في backend/src/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

---

## 📚 المزيد من المعلومات

- [التوثيق الكامل](./OAUTH_BUTTONS_IMPLEMENTATION.md)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login)
- [LinkedIn OAuth Docs](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)

---

## ✅ Checklist

- [ ] تثبيت dependencies
- [ ] إضافة environment variables
- [ ] الحصول على OAuth credentials
- [ ] تكوين callback URLs
- [ ] اختبار كل provider
- [ ] نشر إلى production

---

**تاريخ الإنشاء**: 2026-02-23  
**آخر تحديث**: 2026-02-23
