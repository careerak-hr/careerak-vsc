# Deployment Checklist: Apply Page Enhancements

## Overview

This checklist ensures all components, configurations, and dependencies are properly set up before deploying the Apply Page Enhancements feature to production.

## Pre-Deployment Checklist

### 1. Environment Variables

#### Backend Environment Variables

**Required Variables:**

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/careerak
# or for production:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerak

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu  # or your cluster

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Email Configuration (for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB in bytes
MAX_FILES_PER_APPLICATION=10
```

**Verification:**

```bash
# Check all required variables are set
node scripts/check-env-vars.js
```

---

#### Frontend Environment Variables

**Required Variables:**

```bash
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api
# or for development:
VITE_API_URL=http://localhost:5000/api

# Cloudinary Configuration (public key only)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Pusher Configuration (public key only)
VITE_PUSHER_KEY=your_key
VITE_PUSHER_CLUSTER=eu  # or your cluster

# Feature Flags
VITE_ENABLE_AUTO_SAVE=true
VITE_AUTO_SAVE_DELAY=3000  # milliseconds
VITE_ENABLE_REAL_TIME_UPDATES=true

# File Upload Configuration
VITE_MAX_FILE_SIZE=5242880  # 5MB in bytes
VITE_MAX_FILES=10
VITE_ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png
```

**Verification:**

```bash
# Check all required variables are set
npm run check-env
```

---

### 2. External Service Setup

#### Cloudinary Setup

**Steps:**

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com
   - Sign up for free account
   - Note your Cloud Name, API Key, and API Secret

2. **Create Upload Preset**
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Name: `careerak_applications`
   - Signing Mode: `Unsigned` (for frontend uploads) or `Signed` (for backend uploads)
   - Folder: `careerak/applications`
   - Save preset

3. **Configure Folders**
   - Create folders:
     - `careerak/applications/resumes`
     - `careerak/applications/cover_letters`
     - `careerak/applications/certificates`
     - `careerak/applications/portfolios`
     - `careerak/applications/other`

4. **Set Upload Restrictions**
   - Max file size: 5MB
   - Allowed formats: pdf, doc, docx, jpg, png
   - Resource type: auto

**Verification:**

```bash
# Test Cloudinary connection
node scripts/test-cloudinary.js
```

---

#### Pusher Setup

**Steps:**

1. **Create Pusher Account**
   - Go to https://pusher.com
   - Sign up for free account
   - Create a new Channels app

2. **Configure App**
   - Name: `Careerak Applications`
   - Cluster: Choose closest to your users (e.g., `eu`, `us-east-1`)
   - Enable client events: No (not needed)

3. **Get Credentials**
   - App ID
   - Key (public)
   - Secret (private)
   - Cluster

4. **Configure Channels**
   - Channel naming: `application-{applicationId}`
   - Events:
     - `status-updated`
     - `application-submitted`
     - `application-withdrawn`

**Verification:**

```bash
# Test Pusher connection
node scripts/test-pusher.js
```

---

### 3. Database Setup

#### MongoDB Configuration

**Required Collections:**

1. **users** (existing)
2. **jobPostings** (existing)
3. **jobApplications** (existing - needs schema update)
4. **applicationDrafts** (new)

**Schema Updates:**

```javascript
// Update JobApplication schema
db.jobApplications.updateMany(
  {},
  {
    $set: {
      files: [],
      customAnswers: [],
      statusHistory: []
    }
  }
);
```

---

#### Database Indexes

**Create Required Indexes:**

```javascript
// ApplicationDraft indexes
db.applicationDrafts.createIndex({ applicant: 1, jobPosting: 1 }, { unique: true });
db.applicationDrafts.createIndex({ applicant: 1 });
db.applicationDrafts.createIndex({ jobPosting: 1 });
db.applicationDrafts.createIndex({ lastSaved: -1 });

// JobApplication indexes (additional)
db.jobApplications.createIndex({ applicant: 1, status: 1 });
db.jobApplications.createIndex({ jobPosting: 1, status: 1 });
db.jobApplications.createIndex({ submittedAt: -1 });
db.jobApplications.createIndex({ status: 1, submittedAt: -1 });

// JobPosting indexes (for custom questions)
db.jobPostings.createIndex({ 'customQuestions.id': 1 });
```

**Run Index Creation Script:**

```bash
node scripts/create-indexes.js
```

**Verification:**

```bash
# Check indexes
node scripts/verify-indexes.js
```

---

#### Database Migrations

**Run Migrations:**

```bash
# Add files field to existing applications
node migrations/001-add-files-field.js

# Add customAnswers field
node migrations/002-add-custom-answers.js

# Add statusHistory field
node migrations/003-add-status-history.js

# Add customQuestions to job postings
node migrations/004-add-custom-questions.js
```

**Verification:**

```bash
# Verify migrations
node scripts/verify-migrations.js
```

---

### 4. Error Logging Configuration

#### Backend Error Logging

**Setup Winston Logger:**

```javascript
// backend/src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

**Environment Variables:**

```bash
LOG_LEVEL=info  # debug, info, warn, error
LOG_FILE_PATH=./logs
```

---

#### Frontend Error Logging

**Setup Error Boundary:**

```jsx
// frontend/src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    console.error('Error caught:', error, errorInfo);
    
    // Send to backend
    fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.toString(),
        errorInfo: errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    });
  }

  render() {
    return this.props.children;
  }
}
```

---

### 5. Testing Checklist

#### Unit Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

**Required Test Coverage:**
- [ ] All API endpoints tested
- [ ] All services tested
- [ ] All components tested
- [ ] All hooks tested
- [ ] Minimum 80% code coverage

---

#### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

**Required Tests:**
- [ ] Complete application flow
- [ ] Draft save and restore
- [ ] File upload and delete
- [ ] Status updates
- [ ] Withdrawal flow

---

#### Property-Based Tests

```bash
# Run property tests
npm run test:properties
```

**Required Properties:**
- [ ] All 25 properties pass
- [ ] Minimum 100 iterations per property
- [ ] No failures or edge case issues

---

#### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e
```

**Required Scenarios:**
- [ ] User applies to job
- [ ] User saves draft
- [ ] User resumes draft
- [ ] User uploads files
- [ ] User withdraws application
- [ ] Employer updates status

---

### 6. Performance Checklist

#### Backend Performance

**Optimizations:**
- [ ] Database indexes created
- [ ] Query optimization verified
- [ ] Response caching implemented
- [ ] Rate limiting configured
- [ ] Connection pooling enabled

**Benchmarks:**
- [ ] API response time < 200ms (average)
- [ ] Draft save time < 1s
- [ ] File upload time < 5s (for 5MB file)
- [ ] Application submission < 3s

---

#### Frontend Performance

**Optimizations:**
- [ ] Code splitting implemented
- [ ] Lazy loading for heavy components
- [ ] Image optimization
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse score > 90

**Benchmarks:**
- [ ] Initial load < 2s
- [ ] Step navigation < 300ms
- [ ] Auto-save < 1s
- [ ] File upload progress updates < 500ms

---

### 7. Security Checklist

#### Authentication & Authorization

- [ ] JWT tokens properly validated
- [ ] User can only access own drafts
- [ ] User can only access own applications
- [ ] Employer can only update own job applications
- [ ] File uploads authenticated
- [ ] Rate limiting on all endpoints

---

#### Data Validation

- [ ] All input sanitized
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] File type validation
- [ ] File size validation

---

#### Secure Communication

- [ ] HTTPS enforced in production
- [ ] Secure cookies (httpOnly, secure, sameSite)
- [ ] CORS properly configured
- [ ] API keys not exposed in frontend
- [ ] Cloudinary signed uploads (if using backend)

---

### 8. Monitoring & Alerts

#### Application Monitoring

**Setup Monitoring:**

```bash
# Install monitoring tools
npm install --save express-status-monitor
npm install --save @sentry/node  # Optional
```

**Configure Alerts:**
- [ ] Error rate > 5% per hour
- [ ] Response time > 1s (average)
- [ ] Failed uploads > 10% per hour
- [ ] Database connection failures
- [ ] Pusher connection failures

---

#### Health Checks

**Create Health Check Endpoint:**

```javascript
// backend/src/routes/health.js
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    services: {
      database: await checkDatabase(),
      cloudinary: await checkCloudinary(),
      pusher: await checkPusher()
    }
  };
  
  res.json(health);
});
```

**Verification:**

```bash
curl https://your-api-domain.com/api/health
```

---

### 9. Documentation Checklist

- [ ] API documentation complete
- [ ] Component documentation complete
- [ ] User guide complete
- [ ] Deployment checklist complete
- [ ] README updated
- [ ] CHANGELOG updated
- [ ] Environment variables documented

---

### 10. Deployment Steps

#### Pre-Deployment

1. **Code Review**
   - [ ] All code reviewed
   - [ ] No console.logs in production code
   - [ ] No hardcoded credentials
   - [ ] No TODO comments

2. **Version Control**
   - [ ] All changes committed
   - [ ] Branch merged to main
   - [ ] Tagged with version number
   - [ ] Changelog updated

3. **Build**
   ```bash
   # Backend
   cd backend
   npm run build  # if using TypeScript
   
   # Frontend
   cd frontend
   npm run build
   ```

4. **Environment Setup**
   - [ ] Production .env files configured
   - [ ] All secrets rotated
   - [ ] Database backups created

---

#### Deployment

**Backend Deployment:**

```bash
# 1. SSH to server
ssh user@your-server.com

# 2. Pull latest code
cd /var/www/careerak-backend
git pull origin main

# 3. Install dependencies
npm ci --production

# 4. Run migrations
npm run migrate

# 5. Restart server
pm2 restart careerak-backend

# 6. Check logs
pm2 logs careerak-backend
```

**Frontend Deployment:**

```bash
# 1. Build for production
npm run build

# 2. Deploy to hosting (Vercel example)
vercel --prod

# Or upload to server
scp -r dist/* user@your-server.com:/var/www/careerak-frontend/
```

---

#### Post-Deployment

1. **Smoke Tests**
   - [ ] Homepage loads
   - [ ] Login works
   - [ ] Can start application
   - [ ] Can save draft
   - [ ] Can upload file
   - [ ] Can submit application
   - [ ] Status updates work

2. **Monitoring**
   - [ ] Check error logs
   - [ ] Monitor response times
   - [ ] Check database connections
   - [ ] Verify Cloudinary uploads
   - [ ] Verify Pusher connections

3. **User Communication**
   - [ ] Announce new feature
   - [ ] Update help documentation
   - [ ] Train support team
   - [ ] Monitor user feedback

---

### 11. Rollback Plan

**If Issues Occur:**

1. **Immediate Actions**
   ```bash
   # Revert to previous version
   git revert HEAD
   git push origin main
   
   # Or rollback deployment
   pm2 restart careerak-backend --update-env
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   mongorestore --uri="mongodb://..." --drop backup/
   ```

3. **Communication**
   - Notify users of temporary issues
   - Provide ETA for fix
   - Update status page

---

### 12. Post-Launch Monitoring

**First 24 Hours:**
- [ ] Monitor error rates every hour
- [ ] Check user feedback
- [ ] Monitor performance metrics
- [ ] Check database performance
- [ ] Verify all integrations working

**First Week:**
- [ ] Daily error rate review
- [ ] User feedback analysis
- [ ] Performance optimization
- [ ] Bug fixes as needed

**First Month:**
- [ ] Weekly metrics review
- [ ] Feature usage analysis
- [ ] User satisfaction survey
- [ ] Plan improvements

---

## Quick Reference

### Essential Commands

```bash
# Check environment variables
npm run check-env

# Run all tests
npm test

# Create database indexes
npm run create-indexes

# Test external services
npm run test-services

# Build for production
npm run build

# Deploy
npm run deploy

# Check health
curl https://api.careerak.com/health
```

### Essential URLs

- **API Health**: https://api.careerak.com/health
- **Cloudinary Dashboard**: https://cloudinary.com/console
- **Pusher Dashboard**: https://dashboard.pusher.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Error Logs**: /var/log/careerak/

### Support Contacts

- **Technical Lead**: tech@careerak.com
- **DevOps**: devops@careerak.com
- **Support**: careerak.hr@gmail.com

---

## Checklist Summary

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Cloudinary setup complete
- [ ] Pusher setup complete
- [ ] Database migrations run
- [ ] Database indexes created
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] Documentation complete

### Deployment
- [ ] Code reviewed and merged
- [ ] Version tagged
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Smoke tests passed

### Post-Deployment
- [ ] Monitoring active
- [ ] Error logs checked
- [ ] User communication sent
- [ ] Support team trained
- [ ] Rollback plan ready

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Version:** _____________

**Sign-off:** _____________

---

*Last Updated: January 2024*
*Version: 1.0.0*
