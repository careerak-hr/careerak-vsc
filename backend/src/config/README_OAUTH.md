# OAuth Implementation - Backend

## 📁 الملفات

### Models
- **OAuthAccount.js**: نموذج حسابات OAuth مع تشفير tokens

### Config
- **passport.js**: إعداد Passport strategies (Google, Facebook, LinkedIn)

### Controllers
- **oauthController.js**: معالجة OAuth callbacks وإدارة الحسابات

### Routes
- **oauthRoutes.js**: مسارات OAuth API

## 🔐 الأمان

### تشفير Tokens
- Access tokens و Refresh tokens مشفرة في قاعدة البيانات
- استخدام AES-256-CBC encryption
- مفتاح التشفير في `OAUTH_ENCRYPTION_KEY`

### CSRF Protection
- Passport.js يتعامل مع state parameter تلقائياً
- Session-based authentication

### Password Security
- المستخدمون الذين يسجلون عبر OAuth يحصلون على كلمة مرور عشوائية
- كلمة المرور لا تُستخدم (OAuth هو طريقة الدخول)

## 🔄 OAuth Flow

### 1. Initiation
```
User clicks "Login with Google"
  ↓
Frontend redirects to: /auth/google
  ↓
Backend redirects to: Google OAuth page
```

### 2. Authentication
```
User logs in to Google
  ↓
User grants permissions
  ↓
Google redirects to: /auth/google/callback
```

### 3. Callback Processing
```
Backend receives OAuth code
  ↓
Passport exchanges code for tokens
  ↓
Check if OAuth account exists
  ↓
If exists: Login user
If not: Check if email exists
  ↓
If email exists: Link OAuth to existing user
If not: Create new user
  ↓
Generate JWT token
  ↓
Redirect to Frontend with token
```

### 4. Frontend Handling
```
Frontend receives token
  ↓
Save token in localStorage
  ↓
Redirect to dashboard
```

## 📊 Database Schema

### User Model (updated)
```javascript
{
  oauthAccounts: [{
    provider: 'google' | 'facebook' | 'linkedin',
    providerId: String,
    email: String,
    connectedAt: Date
  }],
  emailVerified: Boolean,
  registrationProgress: {
    step: Number,
    completed: Boolean,
    lastSaved: Date
  }
}
```

### OAuthAccount Model
```javascript
{
  userId: ObjectId,
  provider: 'google' | 'facebook' | 'linkedin',
  providerId: String,
  email: String,
  displayName: String,
  profilePicture: String,
  accessToken: String,      // encrypted
  refreshToken: String,     // encrypted
  tokenExpires: Date,
  connectedAt: Date,
  lastUsed: Date
}
```

## 🔧 Configuration

### Environment Variables
```env
# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_CALLBACK_URL=http://localhost:5000/auth/facebook/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_CALLBACK_URL=http://localhost:5000/auth/linkedin/callback

# General
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=...
OAUTH_ENCRYPTION_KEY=...
JWT_SECRET=...
```

## 🧪 Testing

### Unit Tests
```bash
npm test -- oauth.test.js
```

### Manual Testing
1. Start backend: `npm start`
2. Navigate to: `http://localhost:5000/auth/google`
3. Complete OAuth flow
4. Check console for logs
5. Verify user created in database

## 🚀 Deployment

### Production Checklist
- [ ] Update callback URLs in OAuth apps
- [ ] Update `FRONTEND_URL` in .env
- [ ] Update callback URLs in .env
- [ ] Enable HTTPS
- [ ] Test OAuth flow in production
- [ ] Monitor error logs

### Vercel Deployment
- OAuth works on Vercel
- Session storage uses in-memory (consider Redis for production)
- Ensure environment variables are set in Vercel dashboard

## 📝 API Documentation

### Initiate OAuth
```
GET /auth/google
GET /auth/facebook
GET /auth/linkedin
```

### OAuth Callbacks
```
GET /auth/google/callback
GET /auth/facebook/callback
GET /auth/linkedin/callback
```

### OAuth Management (Protected)
```
GET    /auth/oauth/accounts      - Get linked accounts
DELETE /auth/oauth/:provider     - Unlink account
```

## 🐛 Troubleshooting

### "Strategy not configured"
- Check if OAuth credentials are in .env
- Restart backend after adding credentials

### "redirect_uri_mismatch"
- Verify callback URL matches OAuth app settings
- Check for trailing slashes

### "invalid_client"
- Verify Client ID and Secret are correct
- Check for extra spaces in .env

### "access_denied"
- User declined permissions (normal behavior)

## 📚 References

- [Passport.js Documentation](http://www.passportjs.org/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login](https://developers.facebook.com/docs/facebook-login)
- [LinkedIn OAuth](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authentication)

---

**Created**: 2026-02-18  
**Last Updated**: 2026-02-18  
**Status**: ✅ Complete
