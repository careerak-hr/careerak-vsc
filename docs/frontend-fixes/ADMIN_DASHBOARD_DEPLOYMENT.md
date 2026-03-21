# دليل نشر لوحة تحكم الأدمن - Careerak

## نظرة عامة

هذا الدليل يغطي جميع خطوات نشر لوحة تحكم الأدمن على بيئة الإنتاج (Vercel).

---

## المتطلبات الأساسية

### 1. البرامج المطلوبة
- ✅ Node.js v18+ و npm
- ✅ Git
- ✅ Vercel CLI (اختياري)
- ✅ MongoDB Atlas account
- ✅ Cloudinary account
- ✅ Pusher account

### 2. الحسابات المطلوبة
- ✅ حساب GitHub
- ✅ حساب Vercel
- ✅ حساب MongoDB Atlas
- ✅ حساب Cloudinary
- ✅ حساب Pusher

---

## Environment Variables

### Backend Variables

يجب إضافة المتغيرات التالية في Vercel Dashboard → Settings → Environment Variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerak?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pusher
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=eu

# Frontend URL (for CORS)
FRONTEND_URL=https://careerak.com

# Node Environment
NODE_ENV=production

# Port (optional, Vercel handles this)
PORT=5000
```

### Frontend Variables

```env
# API URL
VITE_API_URL=https://careerak.com/api

# Pusher (public keys only)
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=eu

# reCAPTCHA (if enabled)
VITE_RECAPTCHA_ENABLED=true
VITE_RECAPTCHA_SITE_KEY=your_site_key
```

---

## خطوات النشر

### 1. التحضير المحلي

#### أ. التحقق من الكود
```bash
# تأكد من أن جميع الاختبارات تنجح
cd backend
npm test

cd ../frontend
npm test

# تأكد من عدم وجود أخطاء TypeScript/ESLint
npm run lint
```

#### ب. بناء المشروع محلياً
```bash
# بناء Frontend
cd frontend
npm run build

# التحقق من البناء
npm run preview
```

#### ج. التحقق من Environment Variables
```bash
# استخدم سكريبت التحقق
cd backend
node scripts/validate-env-vars.js all
```

---

### 2. النشر على Vercel

#### الطريقة A: عبر Git (موصى بها)

1. **Push الكود إلى GitHub**:
```bash
git add .
git commit -m "Deploy: Admin Dashboard v1.0.0"
git push origin main
```

2. **ربط المشروع بـ Vercel**:
   - افتح [Vercel Dashboard](https://vercel.com/dashboard)
   - انقر على "New Project"
   - اختر repository من GitHub
   - اختر "careerak" repository
   - انقر على "Import"

3. **إعداد المشروع**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **إضافة Environment Variables**:
   - انقر على "Environment Variables"
   - أضف جميع المتغيرات من القسم السابق
   - تأكد من اختيار "Production" environment

5. **النشر**:
   - انقر على "Deploy"
   - انتظر حتى يكتمل النشر (2-3 دقائق)

#### الطريقة B: عبر Vercel CLI

```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# النشر
cd frontend
vercel --prod

# اتبع التعليمات على الشاشة
```

---

### 3. نشر Backend API

#### إعداد Backend على Vercel

1. **إنشاء مشروع منفصل للـ Backend**:
   - في Vercel Dashboard، انقر على "New Project"
   - اختر نفس الـ repository
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: `.`
   - **Install Command**: `npm install`

2. **إضافة Environment Variables**:
   - أضف جميع متغيرات Backend
   - تأكد من `FRONTEND_URL` يشير إلى رابط Frontend الصحيح

3. **إعداد Serverless Functions**:
   - Vercel سيكتشف `api/` folder تلقائياً
   - تأكد من وجود `vercel.json` في مجلد backend:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

4. **النشر**:
   - انقر على "Deploy"
   - انتظر حتى يكتمل النشر

---

### 4. إعداد MongoDB Atlas

#### إنشاء Cluster

1. افتح [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. سجّل الدخول أو أنشئ حساب جديد
3. انقر على "Build a Database"
4. اختر "Shared" (مجاني) أو "Dedicated" (مدفوع)
5. اختر المنطقة الأقرب (مثلاً: AWS / eu-central-1)
6. انقر على "Create Cluster"

#### إعداد Database User

1. انتقل إلى "Database Access"
2. انقر على "Add New Database User"
3. اختر "Password" authentication
4. أدخل username و password قويين
5. اختر "Read and write to any database"
6. انقر على "Add User"

#### إعداد Network Access

1. انتقل إلى "Network Access"
2. انقر على "Add IP Address"
3. اختر "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ في الإنتاج، حدد IP addresses محددة
4. انقر على "Confirm"

#### الحصول على Connection String

1. انتقل إلى "Database"
2. انقر على "Connect" بجانب cluster
3. اختر "Connect your application"
4. انسخ connection string
5. استبدل `<password>` بكلمة المرور الفعلية
6. استبدل `<dbname>` بـ `careerak`
7. أضف الـ string في Vercel Environment Variables

---

### 5. إعداد Cloudinary

#### إنشاء Account

1. افتح [Cloudinary](https://cloudinary.com/)
2. سجّل الدخول أو أنشئ حساب جديد
3. انتقل إلى Dashboard

#### الحصول على Credentials

1. في Dashboard، ستجد:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
2. انسخ هذه القيم
3. أضفها في Vercel Environment Variables

#### إعداد Upload Presets (اختياري)

1. انتقل إلى Settings → Upload
2. انقر على "Add upload preset"
3. أنشئ presets للصور:
   - `PROFILE_PICTURE`
   - `COMPANY_LOGO`
   - `JOB_THUMBNAIL`
4. احفظ

---

### 6. إعداد Pusher

#### إنشاء App

1. افتح [Pusher](https://pusher.com/)
2. سجّل الدخول أو أنشئ حساب جديد
3. انقر على "Create app"
4. أدخل:
   - **App name**: Careerak Admin Dashboard
   - **Cluster**: اختر الأقرب (eu)
   - **Tech stack**: Node.js + React
5. انقر على "Create app"

#### الحصول على Credentials

1. في App Dashboard، انتقل إلى "App Keys"
2. ستجد:
   - **app_id**
   - **key**
   - **secret**
   - **cluster**
3. انسخ هذه القيم
4. أضفها في Vercel Environment Variables

#### إعداد Channels (اختياري)

1. انتقل إلى "Channels"
2. فعّل "Enable client events" إذا لزم الأمر
3. احفظ

---

### 7. التحقق من النشر

#### أ. اختبار Frontend

```bash
# افتح المتصفح
https://careerak.com

# تحقق من:
# ✅ الصفحة تحمّل بدون أخطاء
# ✅ يمكن تسجيل الدخول
# ✅ الإحصائيات تظهر
# ✅ لا أخطاء في Console
```

#### ب. اختبار Backend API

```bash
# اختبار health endpoint
curl https://careerak.com/api/health

# النتيجة المتوقعة:
# {"status":"ok","timestamp":"..."}

# اختبار authentication
curl -X POST https://careerak.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@careerak.com","password":"admin123"}'
```

#### ج. تشغيل Deployment Tests

```bash
# استخدم سكريبت الاختبار
node scripts/test-vercel-deployment.js https://careerak.com

# يجب أن تنجح جميع الاختبارات (17/17)
```

---


## Deployment Checklist

استخدم هذه القائمة للتأكد من اكتمال جميع خطوات النشر:

### قبل النشر

- [ ] جميع الاختبارات تنجح (Unit + Integration + E2E)
- [ ] لا أخطاء في ESLint/TypeScript
- [ ] البناء المحلي ينجح
- [ ] Environment variables محضّرة
- [ ] MongoDB Atlas cluster جاهز
- [ ] Cloudinary account جاهز
- [ ] Pusher app جاهز
- [ ] Git repository محدّث

### أثناء النشر

- [ ] Frontend deployed على Vercel
- [ ] Backend deployed على Vercel
- [ ] Environment variables مضافة في Vercel
- [ ] Custom domain مربوط (إذا لزم الأمر)
- [ ] SSL certificate مفعّل

### بعد النشر

- [ ] Frontend يحمّل بدون أخطاء
- [ ] Backend API يستجيب
- [ ] Database connection يعمل
- [ ] Cloudinary uploads تعمل
- [ ] Pusher real-time updates تعمل
- [ ] Authentication يعمل
- [ ] جميع الـ endpoints تعمل
- [ ] Deployment tests تنجح (17/17)
- [ ] Performance مقبول (< 2s load time)
- [ ] No console errors

### المراقبة

- [ ] Vercel Analytics مفعّل
- [ ] Error tracking مفعّل
- [ ] Performance monitoring مفعّل
- [ ] Uptime monitoring مفعّل

---

## استكشاف الأخطاء

### Frontend لا يحمّل

**الأعراض**: صفحة بيضاء أو أخطاء في Console

**الحلول**:
1. تحقق من Vercel deployment logs
2. تحقق من Environment variables
3. تحقق من `VITE_API_URL` يشير إلى Backend الصحيح
4. امسح cache المتصفح
5. جرّب في وضع incognito

### Backend API لا يستجيب

**الأعراض**: 500 errors أو timeout

**الحلول**:
1. تحقق من Vercel function logs
2. تحقق من `MONGODB_URI` صحيح
3. تحقق من MongoDB Atlas network access
4. تحقق من جميع Environment variables موجودة
5. تحقق من `vercel.json` configuration

### Database connection يفشل

**الأعراض**: "MongoNetworkError" أو "Authentication failed"

**الحلول**:
1. تحقق من `MONGODB_URI` format صحيح
2. تحقق من username و password صحيحين
3. تحقق من IP whitelist في MongoDB Atlas
4. تحقق من database name صحيح
5. جرّب connection string في MongoDB Compass

### Cloudinary uploads تفشل

**الأعراض**: "Invalid credentials" أو upload errors

**الحلول**:
1. تحقق من `CLOUDINARY_CLOUD_NAME` صحيح
2. تحقق من `CLOUDINARY_API_KEY` و `CLOUDINARY_API_SECRET` صحيحين
3. تحقق من upload preset موجود (إذا استخدمته)
4. تحقق من file size limits
5. جرّب upload يدوياً في Cloudinary dashboard

### Pusher real-time لا يعمل

**الأعراض**: الإحصائيات لا تتحدث تلقائياً

**الحلول**:
1. تحقق من `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET` صحيحين
2. تحقق من `PUSHER_CLUSTER` صحيح
3. تحقق من `VITE_PUSHER_KEY` في Frontend
4. افتح Network tab وابحث عن WebSocket connections
5. تحقق من Pusher dashboard للـ events

### CORS errors

**الأعراض**: "Access-Control-Allow-Origin" errors

**الحلول**:
1. تحقق من `FRONTEND_URL` في Backend environment variables
2. تأكد من CORS middleware مفعّل في `app.js`
3. تحقق من domain spelling صحيح
4. أعد نشر Backend بعد تغيير `FRONTEND_URL`

### Performance بطيء

**الأعراض**: صفحات تحمّل ببطء (> 3s)

**الحلول**:
1. تحقق من MongoDB indexes موجودة
2. فعّل caching في Backend
3. قلل عدد API calls في Frontend
4. استخدم lazy loading للمكونات الكبيرة
5. optimize images في Cloudinary
6. تحقق من bundle size (< 1MB)

---

## Rollback Plan

إذا حدثت مشاكل خطيرة بعد النشر، اتبع هذه الخطوات للعودة إلى الإصدار السابق:

### Rollback عبر Vercel Dashboard

1. افتح Vercel Dashboard
2. انتقل إلى Project → Deployments
3. ابحث عن آخر deployment ناجح
4. انقر على "..." → "Promote to Production"
5. أكّد الإجراء
6. سيتم العودة إلى الإصدار السابق خلال دقائق

### Rollback عبر Git

```bash
# العودة إلى commit سابق
git log --oneline  # ابحث عن commit hash
git revert <commit-hash>
git push origin main

# Vercel سينشر تلقائياً
```

### Rollback عبر Vercel CLI

```bash
# عرض deployments
vercel ls

# Promote deployment محدد
vercel promote <deployment-url>
```

### بعد Rollback

1. ✅ تحقق من أن الموقع يعمل
2. ✅ راجع logs لفهم المشكلة
3. ✅ أصلح المشكلة في branch منفصل
4. ✅ اختبر جيداً قبل إعادة النشر
5. ✅ وثّق المشكلة والحل

---

## Monitoring and Maintenance

### Vercel Analytics

1. افتح Vercel Dashboard → Project → Analytics
2. راقب:
   - **Page Views**: عدد الزيارات
   - **Unique Visitors**: الزوار الفريدين
   - **Top Pages**: الصفحات الأكثر زيارة
   - **Performance**: أوقات التحميل
   - **Errors**: الأخطاء

### Error Tracking

استخدم سكريبت تتبع الأخطاء:

```bash
cd backend
npm run track:errors:production

# راجع التقرير
# ✅ Error Rate < 10 errors/hour
# ✅ Recovery Rate > 95%
```

### Performance Monitoring

```bash
# Lighthouse CI
npm run lighthouse:ci

# Bundle Size
npm run monitor:bundle

# النتائج المستهدفة:
# ✅ Performance: 90+
# ✅ Accessibility: 95+
# ✅ SEO: 95+
# ✅ Bundle Size: < 1MB
```

### Database Monitoring

1. افتح MongoDB Atlas Dashboard
2. راقب:
   - **Connections**: عدد الاتصالات النشطة
   - **Operations**: عدد العمليات في الثانية
   - **Storage**: حجم البيانات
   - **Indexes**: استخدام الـ indexes
3. فعّل Alerts للمشاكل

### Uptime Monitoring

استخدم خدمة مثل:
- [UptimeRobot](https://uptimerobot.com/) (مجاني)
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

إعداد:
1. أضف URL: `https://careerak.com`
2. اختر interval: 5 minutes
3. أضف email للتنبيهات
4. احفظ

---

## Backup Strategy

### Database Backups

#### Automatic Backups (MongoDB Atlas)

1. افتح MongoDB Atlas Dashboard
2. انتقل إلى Cluster → Backup
3. فعّل "Continuous Backup"
4. اختر retention period: 7 days
5. احفظ

#### Manual Backups

```bash
# Export database
mongodump --uri="mongodb+srv://..." --out=./backup

# Import database
mongorestore --uri="mongodb+srv://..." ./backup
```

### Code Backups

- ✅ Git repository على GitHub (automatic)
- ✅ Vercel deployments history (30 days)
- ✅ Local backups (weekly)

### Environment Variables Backup

احفظ نسخة من جميع Environment variables في ملف آمن:

```bash
# في مكان آمن (لا تضعه في Git!)
# backup-env-vars.txt

MONGODB_URI=...
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
# إلخ
```

---

## Security Best Practices

### Environment Variables

- ✅ لا تضع secrets في Git
- ✅ استخدم secrets قوية (32+ characters)
- ✅ غيّر secrets كل 90 يوم
- ✅ استخدم secrets مختلفة لكل environment

### Database Security

- ✅ استخدم strong passwords
- ✅ حدد IP whitelist (لا تستخدم 0.0.0.0/0 في الإنتاج)
- ✅ فعّل encryption at rest
- ✅ راجع database users بانتظام

### API Security

- ✅ JWT tokens مع expiration
- ✅ Rate limiting مفعّل
- ✅ CORS محدد للـ domains المسموحة
- ✅ Input validation على جميع endpoints
- ✅ HTTPS فقط (لا HTTP)

### Monitoring

- ✅ راقب failed login attempts
- ✅ راقب unusual activity
- ✅ راجع activity logs أسبوعياً
- ✅ فعّل alerts للمشاكل الأمنية

---

## Performance Optimization

### Frontend Optimization

```bash
# تحليل bundle size
npm run measure:bundle

# تحسينات:
# ✅ Code splitting
# ✅ Lazy loading
# ✅ Tree shaking
# ✅ Minification
# ✅ Compression (gzip/brotli)
```

### Backend Optimization

```bash
# تحسينات:
# ✅ Database indexes
# ✅ Query optimization
# ✅ Caching (Redis/node-cache)
# ✅ Connection pooling
# ✅ Compression middleware
```

### CDN and Caching

- ✅ Vercel Edge Network (automatic)
- ✅ Static assets caching
- ✅ API response caching (30s for statistics)
- ✅ Browser caching headers

---

## Scaling Considerations

### When to Scale

راقب هذه المقاييس:
- **Users**: > 10,000 active users
- **Requests**: > 1,000 requests/minute
- **Database**: > 10GB data
- **Response Time**: > 2 seconds average

### Scaling Options

#### Vercel
- ✅ Automatic scaling (serverless)
- ✅ Edge caching
- ✅ No configuration needed

#### MongoDB Atlas
- ✅ Upgrade cluster tier
- ✅ Add read replicas
- ✅ Enable sharding

#### Cloudinary
- ✅ Upgrade plan
- ✅ Enable auto-optimization
- ✅ Use CDN

#### Pusher
- ✅ Upgrade plan
- ✅ Add more channels
- ✅ Enable presence channels

---

## Support and Resources

### Documentation

- 📄 **API Documentation**: `docs/Admin Dashboard/ADMIN_DASHBOARD_API_DOCUMENTATION.md`
- 📄 **User Guide**: `docs/Admin Dashboard/ADMIN_DASHBOARD_USER_GUIDE.md`
- 📄 **Deployment Guide**: هذا الملف

### External Resources

- 🔗 [Vercel Documentation](https://vercel.com/docs)
- 🔗 [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- 🔗 [Cloudinary Documentation](https://cloudinary.com/documentation)
- 🔗 [Pusher Documentation](https://pusher.com/docs)

### Contact

- 📧 **Email**: careerak.hr@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/careerak/issues)

---

## Changelog

### Version 1.0.0 (2026-02-23)

- ✅ Initial production deployment
- ✅ All features implemented and tested
- ✅ Documentation complete
- ✅ Performance optimized
- ✅ Security hardened

---

**آخر تحديث**: 2026-02-23  
**الإصدار**: 1.0.0  
**المؤلف**: فريق تطوير Careerak

