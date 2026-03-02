# Vercel Environment Variables - Deployment Checklist

## 📋 Pre-Deployment Checklist

Use this checklist to ensure all environment variables are properly configured before deploying to Vercel.

**Date**: ___________  
**Deployed By**: ___________  
**Environment**: Production / Preview / Development

---

## 1. Backend Environment Variables

### Critical Variables (Must Have)

- [ ] **MONGODB_URI**
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/careerak`
  - Verified: Database connection works
  - IP whitelist: Configured for Vercel (0.0.0.0/0 or specific IPs)

- [ ] **JWT_SECRET**
  - Length: Minimum 32 characters
  - Strength: Strong random string
  - Unique: Different from other environments

- [ ] **CLOUDINARY_CLOUD_NAME**
  - Value: `careerak` (or your cloud name)
  - Verified: Matches Cloudinary dashboard

- [ ] **CLOUDINARY_API_KEY**
  - Verified: Copied from Cloudinary dashboard
  - No extra spaces or characters

- [ ] **CLOUDINARY_API_SECRET**
  - Verified: Copied from Cloudinary dashboard
  - Kept secret (not shared)

- [ ] **PUSHER_APP_ID**
  - Verified: Copied from Pusher dashboard
  - Correct app selected

- [ ] **PUSHER_KEY**
  - Verified: Copied from Pusher dashboard
  - Matches app ID

- [ ] **PUSHER_SECRET**
  - Verified: Copied from Pusher dashboard
  - Kept secret (not shared)

- [ ] **PUSHER_CLUSTER**
  - Value: `eu` or `ap1` or your cluster
  - Verified: Matches Pusher dashboard

### Recommended Variables

- [ ] **SESSION_SECRET**
  - Length: Minimum 32 characters
  - Unique: Different from JWT_SECRET

- [ ] **FRONTEND_ENCRYPTION_KEY**
  - Value: `careerak_secure_key_2024` or custom
  - Consistent: Same as frontend

- [ ] **NODE_ENV**
  - Value: `production`
  - Correct: Not `development`

- [ ] **PORT**
  - Value: `5000` (default)
  - Optional: Vercel handles this

- [ ] **ADMIN_USERNAME**
  - Value: `admin01` or custom
  - Secure: Not default in production

- [ ] **ADMIN_PASSWORD**
  - Strength: Strong password
  - Changed: Not default `admin123`

### Optional Variables (If Using Features)

- [ ] **GOOGLE_CLIENT_ID** (OAuth)
- [ ] **GOOGLE_CLIENT_SECRET** (OAuth)
- [ ] **GOOGLE_CALLBACK_URL** (OAuth)
- [ ] **FACEBOOK_APP_ID** (OAuth)
- [ ] **FACEBOOK_APP_SECRET** (OAuth)
- [ ] **FACEBOOK_CALLBACK_URL** (OAuth)
- [ ] **LINKEDIN_CLIENT_ID** (OAuth)
- [ ] **LINKEDIN_CLIENT_SECRET** (OAuth)
- [ ] **LINKEDIN_CALLBACK_URL** (OAuth)
- [ ] **EMAIL_SERVICE** (Email)
- [ ] **EMAIL_USER** (Email)
- [ ] **EMAIL_PASSWORD** (Email)
- [ ] **EMAIL_FROM** (Email)

---

## 2. Frontend Environment Variables

### Critical Variables (Must Have)

- [ ] **VITE_API_URL**
  - Format: `https://your-backend.vercel.app`
  - Verified: Backend URL is correct
  - Protocol: Uses `https://` in production

- [ ] **VITE_PUSHER_KEY**
  - Verified: Matches backend PUSHER_KEY
  - Public: Safe to expose (not secret)

- [ ] **VITE_PUSHER_CLUSTER**
  - Value: Matches backend PUSHER_CLUSTER
  - Verified: `eu` or `ap1` or your cluster

### Recommended Variables

- [ ] **VITE_APP_NAME**
  - Value: `Careerak`
  - Consistent: Matches branding

- [ ] **VITE_APP_VERSION**
  - Value: `1.3.0` or current version
  - Updated: Matches package.json

- [ ] **VITE_APP_URL**
  - Format: `https://your-domain.com`
  - Verified: Frontend URL is correct
  - No trailing slash

- [ ] **VITE_ENCRYPTION_KEY**
  - Value: Matches backend FRONTEND_ENCRYPTION_KEY
  - Consistent: Same across environments

- [ ] **VITE_WHATSAPP_NUMBER**
  - Format: `+201228195728` or your number
  - Verified: Number is correct

### Optional Variables (If Using Features)

- [ ] **VITE_ENABLE_ANALYTICS** (Analytics)
- [ ] **VITE_SENTRY_DSN** (Error Tracking)
- [ ] **VITE_GA_MEASUREMENT_ID** (Google Analytics)
- [ ] **VITE_DEBUG_MODE** (Development)
- [ ] **VITE_ENABLE_PERFORMANCE_MONITORING** (Monitoring)

---

## 3. Vercel Configuration

### Dashboard Settings

- [ ] **Project linked**
  - Verified: Correct repository connected
  - Branch: Main/master branch selected

- [ ] **Environment selected**
  - Production: ✅ Checked
  - Preview: ⬜ Optional
  - Development: ⬜ Optional

- [ ] **Variables saved**
  - All variables: Saved successfully
  - No errors: No red warnings

### Build Settings

- [ ] **Build command**
  - Backend: Automatic (Vercel handles)
  - Frontend: `npm run build` or automatic

- [ ] **Output directory**
  - Backend: `backend/src`
  - Frontend: `frontend/build` or `frontend/dist`

- [ ] **Install command**
  - Default: `npm install` or `yarn install`
  - Custom: If needed

---

## 4. Security Checks

### Secrets Management

- [ ] **Strong secrets**
  - All secrets: Minimum 32 characters
  - Random: Generated, not guessed
  - Unique: Different per environment

- [ ] **No commits**
  - `.env` files: In `.gitignore`
  - No secrets: In code or commits
  - History: Checked for leaks

- [ ] **Access control**
  - Team members: Only necessary access
  - Permissions: Reviewed and limited
  - Audit: Regular access reviews

### Production Security

- [ ] **HTTPS only**
  - All URLs: Use `https://`
  - No mixed content: All resources secure

- [ ] **CORS configured**
  - Frontend URL: Whitelisted in backend
  - No wildcards: Specific domains only

- [ ] **Rate limiting**
  - Enabled: In backend
  - Configured: Appropriate limits

---

## 5. Integration Tests

### Database (MongoDB)

- [ ] **Connection works**
  - Test: Can connect from Vercel
  - IP whitelist: Configured correctly
  - Credentials: Valid and working

- [ ] **Operations work**
  - Create: Can insert documents
  - Read: Can query documents
  - Update: Can modify documents
  - Delete: Can remove documents

### Image Service (Cloudinary)

- [ ] **Upload works**
  - Test: Can upload images
  - Optimization: f_auto, q_auto applied
  - Format: WebP generated

- [ ] **Delivery works**
  - Test: Images load on frontend
  - Performance: Fast loading
  - Transformations: Applied correctly

### Real-time (Pusher)

- [ ] **Connection works**
  - Test: Can connect to Pusher
  - Channels: Can subscribe
  - Events: Can send/receive

- [ ] **Features work**
  - Chat: Messages delivered
  - Notifications: Received in real-time
  - Presence: Online status works

### OAuth (If Enabled)

- [ ] **Google OAuth**
  - Login: Works correctly
  - Callback: Redirects properly
  - User data: Retrieved successfully

- [ ] **Facebook OAuth**
  - Login: Works correctly
  - Callback: Redirects properly
  - User data: Retrieved successfully

- [ ] **LinkedIn OAuth**
  - Login: Works correctly
  - Callback: Redirects properly
  - User data: Retrieved successfully

---

## 6. Deployment Verification

### Pre-Deployment

- [ ] **All variables set**
  - Backend: All critical variables
  - Frontend: All critical variables
  - Verified: Using validation script

- [ ] **Local testing**
  - Backend: Works locally
  - Frontend: Works locally
  - Integration: All features work

- [ ] **Build succeeds**
  - Backend: No build errors
  - Frontend: No build errors
  - Dependencies: All installed

### Post-Deployment

- [ ] **Deployment successful**
  - Status: Deployment completed
  - No errors: In deployment logs
  - URL: Accessible

- [ ] **Backend API**
  - Health check: `/api/health` returns OK
  - Authentication: Login works
  - Database: Operations work

- [ ] **Frontend**
  - Loads: Homepage loads correctly
  - No errors: In browser console
  - Assets: All resources load

- [ ] **Features**
  - Authentication: Login/logout works
  - Images: Upload and display work
  - Real-time: Chat/notifications work
  - Forms: Submit and validate work

### Performance

- [ ] **Load times**
  - Backend API: < 1 second
  - Frontend: < 3 seconds
  - Images: Optimized and fast

- [ ] **Lighthouse scores**
  - Performance: 90+
  - Accessibility: 95+
  - SEO: 95+
  - Best Practices: 90+

---

## 7. Monitoring Setup

### Error Tracking

- [ ] **Sentry configured** (if using)
  - DSN: Set in environment variables
  - Errors: Being captured
  - Alerts: Configured

### Analytics

- [ ] **Google Analytics** (if using)
  - Measurement ID: Set correctly
  - Tracking: Working
  - Events: Being recorded

### Logs

- [ ] **Vercel logs**
  - Access: Can view logs
  - Monitoring: Set up alerts
  - Retention: Configured

---

## 8. Documentation

### Internal Docs

- [ ] **Environment variables**
  - Documented: All variables listed
  - Updated: Current values (not secrets)
  - Accessible: Team can find

- [ ] **Deployment process**
  - Documented: Step-by-step guide
  - Updated: Current process
  - Tested: Process works

### External Docs

- [ ] **API documentation**
  - Updated: Current endpoints
  - Examples: Working examples
  - Accessible: Public or team

---

## 9. Rollback Plan

### Backup

- [ ] **Previous deployment**
  - Available: Can rollback
  - Tested: Rollback works
  - Quick: < 5 minutes

- [ ] **Database backup**
  - Recent: Within 24 hours
  - Accessible: Can restore
  - Tested: Restore works

### Emergency Contacts

- [ ] **Team contacts**
  - List: All team members
  - Available: Contact methods
  - Escalation: Process defined

---

## 10. Sign-Off

### Checklist Completion

- [ ] **All critical items**: Checked and verified
- [ ] **All tests**: Passed successfully
- [ ] **Documentation**: Updated and complete
- [ ] **Team notified**: Deployment communicated

### Approval

**Deployed By**: ___________  
**Date**: ___________  
**Time**: ___________  

**Reviewed By**: ___________  
**Date**: ___________  

**Approved By**: ___________  
**Date**: ___________  

---

## 📞 Support Contacts

### Services
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://support.mongodb.com/
- **Cloudinary Support**: https://support.cloudinary.com/
- **Pusher Support**: https://support.pusher.com/

### Internal
- **Tech Lead**: ___________
- **DevOps**: ___________
- **On-Call**: ___________

---

## 📚 Related Documentation

- [Full Environment Variables Guide](./VERCEL_ENVIRONMENT_VARIABLES.md)
- [Quick Start Guide](./VERCEL_ENV_QUICK_START.md)
- [Cloudinary Setup](./CLOUDINARY_TRANSFORMATIONS.md)
- [Pusher Setup](./PWA_PUSHER_INTEGRATION.md)
- [Deployment Guide](./DEPLOY_BACKEND.md)

---

**Last Updated**: 2026-02-22  
**Version**: 1.0  
**Status**: ✅ Ready to use
