# Careerak - منصة إدارة الموارد البشرية المتقدمة

**الإصدار:** v1.4.0 | **تاريخ الإصدار:** 22 فبراير 2026
**الحالة:** جاهز للنشر العالمي 🚀

> منصة شاملة لإدارة الموارد البشرية مبنية بـ Node.js/Express في الخلفية و React في الواجهة الأمامية.

## ✨ الميزات الرئيسية

### 1. **Job Management**
- 📋 Post job openings with detailed requirements and descriptions
- 👥 Manage job applications from candidates
- 📊 Track application status (Pending, Reviewed, Shortlisted, Rejected, Accepted)
- 🔍 Filter and search job postings

### 2. **Educational Courses**
- 📚 Create and publish educational courses for employees
- 👨‍🎓 Employee enrollment and course completion tracking
- 📋 Course categories and skill levels (Beginner, Intermediate, Advanced)
- 🎯 Track course participation and completion

### 3. **Training Courses**
- 🎓 Manage departmental training programs
- 👥 Enroll employees in training courses
- 📈 Track trainee progress and completion status
- 💰 Budget management for training programs

### 4. **User Management**
- 🔐 User authentication with JWT tokens
- 👤 Different roles: Admin, HR, Manager, Employee, Applicant
- 📝 User profile management
- 🔒 Secure password hashing with bcryptjs

## 🌟 الميزات الجديدة في الإصدار 1.4.0

### 🌓 **Dark Mode**
- ✅ **وضع داكن كامل:** دعم شامل للوضع الداكن في جميع الصفحات
- ✅ **كشف تلقائي:** اكتشاف تفضيلات النظام تلقائياً
- ✅ **حفظ التفضيلات:** حفظ اختيار المستخدم في localStorage
- ✅ **انتقالات سلسة:** تحولات سلسة بين الأوضاع (300ms)

### ⚡ **تحسينات الأداء**
- ✅ **Lazy Loading:** تحميل الصفحات عند الحاجة فقط
- ✅ **Code Splitting:** تقسيم الكود لتحميل أسرع (40-60% تقليل)
- ✅ **تحسين الصور:** WebP مع lazy loading وتحويلات Cloudinary
- ✅ **التخزين المؤقت:** استراتيجية تخزين ذكية (30 يوم للأصول الثابتة)
- ✅ **Lighthouse Score:** 90+ للأداء

### 📱 **PWA Support**
- ✅ **تثبيت التطبيق:** إمكانية تثبيت التطبيق على الأجهزة
- ✅ **العمل بدون إنترنت:** دعم كامل للعمل offline
- ✅ **Service Worker:** تخزين ذكي للصفحات والبيانات
- ✅ **إشعارات Push:** إشعارات فورية مع تكامل Pusher
- ✅ **تحديثات تلقائية:** إشعار بالتحديثات الجديدة

### 🎬 **رسوم متحركة سلسة**
- ✅ **انتقالات الصفحات:** تأثيرات fade وslide مع Framer Motion
- ✅ **رسوم Modal:** تأثيرات scale وfade للنوافذ المنبثقة
- ✅ **قوائم متدرجة:** تأثير stagger للقوائم (50ms تأخير)
- ✅ **احترام التفضيلات:** دعم prefers-reduced-motion
- ✅ **GPU Accelerated:** استخدام transform وopacity فقط

### ♿ **إمكانية الوصول المحسنة**
- ✅ **ARIA Labels:** تسميات ARIA كاملة لجميع العناصر
- ✅ **التنقل بلوحة المفاتيح:** دعم كامل للتنقل بالكيبورد
- ✅ **Focus Trap:** حبس التركيز في النوافذ المنبثقة
- ✅ **قارئات الشاشة:** دعم NVDA وVoiceOver
- ✅ **تباين الألوان:** نسبة 4.5:1 للنصوص العادية
- ✅ **Lighthouse Score:** 95+ لإمكانية الوصول

### 🔍 **تحسين محركات البحث (SEO)**
- ✅ **Meta Tags:** عناوين وأوصاف فريدة لكل صفحة
- ✅ **Open Graph:** دعم المشاركة على وسائل التواصل
- ✅ **Structured Data:** JSON-LD للوظائف والدورات
- ✅ **Sitemap:** خريطة موقع تلقائية
- ✅ **Canonical URLs:** روابط قانونية لمنع التكرار
- ✅ **Lighthouse Score:** 95+ للـ SEO

### 🛡️ **معالجة الأخطاء**
- ✅ **Error Boundaries:** حدود أخطاء على مستوى الصفحة والمكون
- ✅ **رسائل ودية:** رسائل خطأ واضحة بثلاث لغات
- ✅ **زر إعادة المحاولة:** إمكانية إعادة المحاولة بعد الخطأ
- ✅ **تسجيل الأخطاء:** تسجيل تفصيلي للأخطاء
- ✅ **صفحات مخصصة:** صفحات 404 و500 مخصصة

### ⏳ **حالات التحميل الموحدة**
- ✅ **Skeleton Loaders:** هياكل تحميل تطابق المحتوى
- ✅ **شريط التقدم:** شريط علوي لتحميل الصفحات
- ✅ **Button Spinners:** مؤشرات تحميل داخل الأزرار
- ✅ **انتقالات سلسة:** تحولات 200ms بين حالات التحميل
- ✅ **منع Layout Shifts:** CLS < 0.1

### 🎨 **نظام التسجيل المتقدم** (v1.3.0)
- ✅ **التحقق من العمر:** نظام ذكي للتحقق من عمر المستخدم (18+)
- ✅ **تسجيل الأفراد والشركات:** نماذج منفصلة ومتقدمة لكل نوع
- ✅ **رفع الصور بالذكاء الاصطناعي:** تحليل تلقائي لنوع الصورة
- ✅ **أداة كروب ذكية:** قص دائري متقدم للصور الشخصية

### 🌍 **دعم متعدد اللغات والثقافات**
- ✅ **العربية والإنجليزية والفرنسية:** دعم كامل لثلاث لغات
- ✅ **تخطيط RTL/LTR:** دعم كامل للغة العربية
- ✅ **ترجمة شاملة:** جميع النصوص والرسائل مترجمة

## Project Structure

```
Careerak-vsc/
├── backend/
│   ├── src/
│   │   ├── models/          # Database schemas
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   ├── config/          # Database configuration
│   │   └── index.js         # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx
│   ├── package.json
│   └── public/
└── docs/                     # Documentation
```

## Installation

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure secret key
- `PORT` - Server port (default: 5000)

Start the server:
```bash
npm run dev  # Development with nodemon
npm start   # Production
```

### Frontend Setup

```bash
cd frontend
npm install
npm start   # Starts on port 3000
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires token)
- `PUT /api/users/profile` - Update profile (requires token)

### Job Postings
- `POST /api/job-postings` - Create job posting
- `GET /api/job-postings` - Get all job postings
- `GET /api/job-postings/:id` - Get specific job posting
- `PUT /api/job-postings/:id` - Update job posting
- `DELETE /api/job-postings/:id` - Delete job posting

### Job Applications
- `POST /api/job-applications` - Apply for job
- `GET /api/job-applications/job/:jobPostingId` - Get applications for a job
- `GET /api/job-applications/my-applications` - Get my applications
- `PUT /api/job-applications/:id/status` - Update application status

### Educational Courses
- `POST /api/educational-courses` - Create course
- `GET /api/educational-courses` - Get all courses
- `GET /api/educational-courses/:id` - Get specific course
- `POST /api/educational-courses/:id/enroll` - Enroll in course
- `PUT /api/educational-courses/:id` - Update course

### Training Courses
- `POST /api/training-courses` - Create training course
- `GET /api/training-courses` - Get all training courses
- `GET /api/training-courses/:id` - Get specific training course
- `POST /api/training-courses/:id/enroll` - Enroll trainee
- `PUT /api/training-courses/:id/status` - Update course status

## Technology Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Pusher for real-time notifications
- Cloudinary for image optimization

**Frontend:**
- React 18
- React Router 6
- Axios for HTTP requests
- Tailwind CSS for styling
- Framer Motion for animations
- Workbox for PWA/Service Worker
- fast-check for property-based testing

## Database Models

1. **User** - System users with roles and departments
2. **JobPosting** - Job opening information
3. **JobApplication** - Application records and status tracking
4. **EducationalCourse** - Educational course details
5. **TrainingCourse** - Internal training programs

## User Roles

- **Admin** - Full system access
- **HR** - HR department operations
- **Manager** - Department management
- **Employee** - Regular employee
- **Applicant** - Job applicants

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcryptjs
- CORS protection
- Environment variable configuration
- Error boundaries for graceful error handling
- Input validation and sanitization
- Secure image upload with AI validation

## 📊 Performance Metrics

### Lighthouse Scores (v1.4.0)
- **Performance:** 90+ ⚡
- **Accessibility:** 95+ ♿
- **SEO:** 95+ 🔍
- **Best Practices:** 90+ ✅
- **PWA:** Installable 📱

### Key Metrics
- **First Contentful Paint (FCP):** < 1.8s
- **Time to Interactive (TTI):** < 3.8s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Bundle Size Reduction:** 40-60%
- **Image Optimization:** 60% bandwidth reduction

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Setup & Configuration
- `docs/Backend Setup/HOW_TO_START.md` - Backend setup guide
- `docs/Backend Setup/QUICK_START.md` - Quick start guide
- `docs/Backend Setup/PM2_QUICK_START.md` - PM2 deployment guide

### Systems Documentation
- `docs/NOTIFICATION_SYSTEM.md` - Notification system guide
- `docs/CHAT_SYSTEM.md` - Real-time chat system
- `docs/REVIEW_SYSTEM.md` - Review and rating system
- `docs/PWA_PUSHER_INTEGRATION.md` - PWA push notifications

### Performance & Optimization
- `docs/IMAGE_OPTIMIZATION_INTEGRATION.md` - Image optimization guide
- `docs/CLOUDINARY_TRANSFORMATIONS.md` - Cloudinary setup
- `docs/PAGE_TRANSITIONS_IMPLEMENTATION.md` - Animation guide
- `frontend/docs/IMAGE_OPTIMIZATION_BUILD_CONFIG.md` - Build configuration for images
- `frontend/docs/IMAGE_OPTIMIZATION_QUICK_REFERENCE.md` - Quick reference guide

### SEO & Accessibility
- `docs/SEO_IMPLEMENTATION.md` - SEO best practices
- `docs/ACCESSIBILITY_FEATURES.md` - Accessibility guide

### Design & Standards
- `docs/RESPONSIVE_DESIGN_FIX.md` - Responsive design guide
- `CORE_RULES.md` - Project standards and rules

## Future Enhancements

- [ ] Advanced analytics and reporting dashboard
- [ ] Real-time video interviews
- [ ] Document management system
- [ ] Interview scheduling with calendar integration
- [ ] Performance reviews and 360-degree feedback
- [ ] AI-powered job matching
- [ ] Resume parsing and analysis
- [ ] Automated email campaigns
- [ ] Mobile app (iOS/Android native)
- [ ] Integration with third-party HR tools

## 📋 إصدارات التطبيق (Version History)

### v1.4.0 - التحسينات الشاملة للمنصة (22 فبراير 2026)
- 🌓 **Dark Mode:** وضع داكن كامل مع حفظ التفضيلات
- ⚡ **تحسينات الأداء:** Lazy loading + Code splitting (40-60% تقليل)
- 📱 **PWA Support:** تثبيت التطبيق + العمل offline + إشعارات Push
- 🎬 **رسوم متحركة:** انتقالات سلسة مع Framer Motion
- ♿ **إمكانية الوصول:** WCAG 2.1 Level AA + Lighthouse 95+
- 🔍 **SEO:** Meta tags + Open Graph + Structured Data + Sitemap
- 🛡️ **Error Boundaries:** معالجة أخطاء متقدمة
- ⏳ **Loading States:** Skeleton loaders + Progress indicators
- 🖼️ **تحسين الصور:** WebP + Lazy loading + Cloudinary transformations
- 📊 **Lighthouse Scores:** Performance 90+, Accessibility 95+, SEO 95+

### v1.3.0 - التميز والإتقان (26 يناير 2026)
- 🎨 إعادة تصميم كاملة لصفحة التسجيل
- 🔐 نظام التحقق من العمر
- 🤖 تحليل الصور بالذكاء الاصطناعي
- 🌍 دعم متعدد اللغات (عربي، إنجليزي، فرنسي)
- 📱 تصميم متجاوب ومتقدم
- 🔧 إصلاح مشاكل الأداء والأمان

### v1.0.0 - الإطلاق الأولي
- 📋 نظام إدارة الوظائف
- 📚 إدارة الدورات التعليمية
- 👥 إدارة المستخدمين والأدوار
- 🔐 نظام المصادقة الأساسي

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC License

## Support

For issues or questions, please contact the HR department.
