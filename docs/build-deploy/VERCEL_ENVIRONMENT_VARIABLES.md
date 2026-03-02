# Vercel Environment Variables Configuration

## Overview
This guide provides comprehensive instructions for setting environment variables on Vercel for the Careerak platform deployment.

**Status**: ✅ Complete  
**Date**: 2026-02-22  
**Requirements**: Task 10.3.4

---

## Table of Contents
1. [Required Environment Variables](#required-environment-variables)
2. [Setting Variables on Vercel](#setting-variables-on-vercel)
3. [Environment-Specific Configuration](#environment-specific-configuration)
4. [Security Best Practices](#security-best-practices)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

---

## Required Environment Variables

### Backend Variables (API)

#### Core Configuration
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerak?retryWrites=true&w=majority

# Security
JWT_SECRET=your_secure_jwt_secret_here_min_32_chars
SESSION_SECRET=your_secure_session_secret_here
FRONTEND_ENCRYPTION_KEY=careerak_secure_key_2024
```

#### Cloudinary (Image Optimization)
```env
CLOUDINARY_CLOUD_NAME=careerak
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Pusher (Real-time Features)
```env
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=eu
```

#### OAuth (Optional - Enhanced Auth)
```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=https://your-domain.com/auth/facebook/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=https://your-domain.com/auth/linkedin/callback

# OAuth Settings
FRONTEND_URL=https://your-frontend-domain.com
OAUTH_ENCRYPTION_KEY=careerak_oauth_key_2024_32chars!
```

#### Email Service (Optional)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=noreply@careerak.com
```

#### Admin Credentials
```env
ADMIN_USERNAME=admin01
ADMIN_PASSWORD=your_secure_admin_password
```

#### Additional Settings
```env
# WhatsApp Support
WHATSAPP_SUPPORT_NUMBER=+201228195728

# Logging
LOG_LEVEL=info

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance
API_TIMEOUT=30000
```

### Frontend Variables (Static Site)

```env
# API Configuration
VITE_API_URL=https://your-backend-domain.vercel.app

# App Configuration
VITE_APP_NAME=Careerak
VITE_APP_VERSION=1.3.0
VITE_APP_URL=https://your-domain.com

# Security
VITE_ENCRYPTION_KEY=careerak_secure_key_2024

# WhatsApp Support
VITE_WHATSAPP_NUMBER=+201228195728

# Pusher (Real-time)
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=eu

# Analytics & Monitoring (Optional)
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_GA_MEASUREMENT_ID=your_ga_id_here

# Performance
VITE_API_TIMEOUT=30000
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Development Settings
VITE_DEBUG_MODE=false
```

---

## Setting Variables on Vercel

### Method 1: Vercel Dashboard (Recommended)

1. **Navigate to Project Settings**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Click "Settings" tab
   - Click "Environment Variables" in the sidebar

2. **Add Variables**
   - Click "Add New" button
   - Enter variable name (e.g., `MONGODB_URI`)
   - Enter variable value
   - Select environments:
     - ✅ Production
     - ✅ Preview (optional)
     - ✅ Development (optional)
   - Click "Save"

3. **Repeat for All Variables**
   - Add all backend variables
   - Add all frontend variables
   - Verify each variable is saved

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Select "Use existing Build Cache" (optional)
   - Click "Redeploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add MONGODB_URI production
# Enter value when prompted

# Add multiple variables from file
vercel env pull .env.production
# Edit .env.production
vercel env push .env.production production

# Redeploy
vercel --prod
```

### Method 3: .env Files (Local Development)

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your values

# Frontend
cd frontend
cp .env.example .env
# Edit .env with your values
```

**⚠️ Important**: Never commit `.env` files to Git!

---

## Environment-Specific Configuration

### Production Environment

**Characteristics**:
- Live user traffic
- Strict security
- Performance optimized
- Error tracking enabled

**Required Variables**:
```env
NODE_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Preview Environment (Optional)

**Characteristics**:
- Testing before production
- Similar to production
- Can use test credentials

**Configuration**:
- Use same variables as production
- Or use separate test database/services
- Enable debug mode if needed

### Development Environment (Optional)

**Characteristics**:
- Local development
- Debug mode enabled
- Test credentials

**Configuration**:
```env
NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_API_URL=http://localhost:5000
```

---

## Security Best Practices

### ✅ Do's

1. **Use Strong Secrets**
   - Minimum 32 characters
   - Mix of letters, numbers, symbols
   - Use password generator

2. **Separate Environments**
   - Different secrets for prod/preview/dev
   - Different database credentials
   - Different API keys

3. **Rotate Regularly**
   - Change secrets every 90 days
   - Update after team member leaves
   - Update after security incident

4. **Limit Access**
   - Only necessary team members
   - Use Vercel team permissions
   - Audit access regularly

5. **Use Vercel's Encryption**
   - Variables encrypted at rest
   - Encrypted in transit
   - Never logged

### ❌ Don'ts

1. **Never Commit Secrets**
   - No `.env` files in Git
   - No secrets in code
   - Use `.gitignore`

2. **Never Share Publicly**
   - No secrets in screenshots
   - No secrets in documentation
   - No secrets in support tickets

3. **Never Use Weak Secrets**
   - No "password123"
   - No dictionary words
   - No personal information

4. **Never Reuse Secrets**
   - Different secret per service
   - Different secret per environment
   - Different secret per project

---

## Verification

### 1. Check Variables Are Set

**Vercel Dashboard**:
- Go to Settings → Environment Variables
- Verify all required variables are listed
- Check correct environments are selected

**Vercel CLI**:
```bash
vercel env ls
```

### 2. Test Backend API

```bash
# Test health endpoint
curl https://your-backend-domain.vercel.app/api/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 3. Test Frontend

```bash
# Visit your domain
https://your-domain.com

# Check browser console
# Should see no environment variable errors
```

### 4. Test Integrations

**Cloudinary**:
- Upload an image
- Verify it appears optimized
- Check Network tab for WebP format

**Pusher**:
- Open chat
- Send a message
- Verify real-time delivery

**MongoDB**:
- Login to app
- Create/read/update data
- Verify database operations work

### 5. Check Logs

**Vercel Dashboard**:
- Go to Deployments
- Click on latest deployment
- Click "View Function Logs"
- Look for errors related to environment variables

---

## Troubleshooting

### Issue: "Environment variable not found"

**Symptoms**:
- Error in logs: `process.env.VARIABLE_NAME is undefined`
- Feature not working

**Solutions**:
1. Verify variable is set in Vercel dashboard
2. Check variable name spelling (case-sensitive)
3. Redeploy after adding variable
4. Check correct environment (production/preview/dev)

### Issue: "Invalid credentials"

**Symptoms**:
- Authentication fails
- Database connection fails
- API returns 401/403

**Solutions**:
1. Verify credentials are correct
2. Check for extra spaces in values
3. Verify service is active (MongoDB, Pusher, etc.)
4. Check IP whitelist (MongoDB Atlas)

### Issue: "CORS errors"

**Symptoms**:
- Frontend can't connect to backend
- Browser console shows CORS error

**Solutions**:
1. Verify `FRONTEND_URL` is set correctly
2. Check `VITE_API_URL` points to correct backend
3. Verify backend CORS configuration
4. Check protocol (http vs https)

### Issue: "Build fails"

**Symptoms**:
- Deployment fails during build
- Error mentions environment variables

**Solutions**:
1. Check all required variables are set
2. Verify variable names match code
3. Check for typos in variable names
4. Review build logs for specific error

### Issue: "Variables not updating"

**Symptoms**:
- Changed variable but app still uses old value
- New variable not taking effect

**Solutions**:
1. Redeploy after changing variables
2. Clear build cache (uncheck "Use existing Build Cache")
3. Wait 1-2 minutes for propagation
4. Hard refresh browser (Ctrl+Shift+R)

---

## Quick Reference

### Minimum Required Variables

**Backend (Must Have)**:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`

**Frontend (Must Have)**:
- `VITE_API_URL`
- `VITE_PUSHER_KEY`
- `VITE_PUSHER_CLUSTER`

### Optional Variables

**Backend**:
- OAuth credentials (if using social login)
- Email service (if using email features)
- Analytics/monitoring (Sentry, etc.)

**Frontend**:
- Analytics (Google Analytics, etc.)
- Error tracking (Sentry, etc.)

---

## Checklist

Before deploying to production:

- [ ] All required backend variables set
- [ ] All required frontend variables set
- [ ] Secrets are strong (32+ characters)
- [ ] Production environment selected
- [ ] Variables verified in dashboard
- [ ] Test deployment successful
- [ ] Backend API responding
- [ ] Frontend loading correctly
- [ ] Cloudinary images optimized
- [ ] Pusher real-time working
- [ ] Database operations working
- [ ] No errors in logs
- [ ] CORS configured correctly
- [ ] OAuth working (if enabled)
- [ ] Email working (if enabled)

---

## Resources

### Documentation
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary](https://cloudinary.com/documentation)
- [Pusher](https://pusher.com/docs)

### Internal Docs
- `backend/.env.example` - Backend variables template
- `frontend/.env.example` - Frontend variables template
- `docs/CLOUDINARY_TRANSFORMATIONS.md` - Cloudinary setup
- `docs/PWA_PUSHER_INTEGRATION.md` - Pusher setup
- `docs/OAuth_Frontend_Implementation.md` - OAuth setup

### Support
- Vercel Support: https://vercel.com/support
- MongoDB Support: https://support.mongodb.com/
- Cloudinary Support: https://support.cloudinary.com/
- Pusher Support: https://support.pusher.com/

---

## Summary

Setting environment variables correctly is critical for:
- ✅ Security (protecting secrets)
- ✅ Functionality (services work correctly)
- ✅ Performance (optimizations enabled)
- ✅ Monitoring (tracking enabled)

**Key Points**:
1. Set all required variables before deploying
2. Use strong, unique secrets
3. Never commit secrets to Git
4. Redeploy after changing variables
5. Test thoroughly after deployment

**Next Steps**:
1. Set all variables in Vercel dashboard
2. Redeploy application
3. Run verification tests
4. Monitor logs for errors
5. Proceed to Task 10.3.5 (Test deployment)

---

**Last Updated**: 2026-02-22  
**Task**: 10.3.4 Set environment variables  
**Status**: ✅ Complete
