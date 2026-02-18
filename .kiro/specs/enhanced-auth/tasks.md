# خطة التنفيذ: تحسينات صفحة التسجيل

## 📋 معلومات المشروع
- **اسم الميزة**: تحسينات صفحة التسجيل (Enhanced Auth Page)
- **تاريخ الإنشاء**: 2026-02-18
- **الحالة**: جاهز للتنفيذ

## نظرة عامة

تحسينات شاملة لصفحة التسجيل تتضمن:
- OAuth Integration (Google, Facebook, LinkedIn)
- مؤشر قوة كلمة المرور
- اقتراحات كلمات مرور قوية
- التحقق الفوري من البريد الإلكتروني
- Stepper للخطوات
- حفظ التقدم تلقائياً
- تحسينات الأمان والتجربة

---

## المهام

### 1. إعداد البنية التحتية والنماذج

- [ ] 1.1 تحديث User Model بالحقول الجديدة
  - إضافة حقل `oauthAccounts` (array)
  - إضافة حقل `passwordStrength` (object)
  - إضافة حقول `emailVerified`, `emailVerificationToken`, `emailVerificationExpires`
  - إضافة حقول `twoFactorEnabled`, `twoFactorSecret`
  - إضافة حقل `registrationProgress` (object)
  - _Requirements: 1.5, 2.1, 4.1, 6.1, 7.2_

- [ ] 1.2 إنشاء OAuthAccount Model
  - تعريف Schema بالحقول: userId, provider, providerId, email, displayName, profilePicture
  - إضافة حقول tokens المشفرة: accessToken, refreshToken, tokenExpires
  - إضافة timestamps: connectedAt, lastUsed
  - إنشاء indexes على userId و provider
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.3 إنشاء PasswordReset Model
  - تعريف Schema بالحقول: userId, token, expires, used, createdAt
  - إنشاء index على token
  - إضافة TTL index على expires
  - _Requirements: 7.3_

- [ ] 1.4 إنشاء EmailVerification Model
  - تعريف Schema بالحقول: userId, email, token, expires, verified, createdAt
  - إنشاء index على token
  - إضافة TTL index على expires
  - _Requirements: 4.1, 4.2_

- [ ]* 1.5 كتابة property test للنماذج
  - **Property 1: OAuth Account Uniqueness**
  - **Validates: Requirements 1.5**

---

### 2. OAuth Integration - Google

- [ ] 2.1 إعداد Google OAuth في Backend
  - تثبيت passport و passport-google-oauth20
  - إضافة GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET في .env
  - إنشاء Google Strategy في Passport
  - معالجة callback: البحث عن مستخدم موجود أو إنشاء جديد
  - حفظ/تحديث OAuthAccount
  - _Requirements: 1.1, 1.4_

- [ ] 2.2 إنشاء routes لـ Google OAuth
  - GET /auth/google - بدء OAuth flow
  - GET /auth/google/callback - معالجة callback
  - إنشاء JWT token بعد النجاح
  - معالجة الأخطاء (رفض الإذن، حساب موجود)
  - _Requirements: 1.1, 1.7_

- [ ] 2.3 إنشاء Google OAuth Button في Frontend
  - مكون OAuthButton قابل لإعادة الاستخدام
  - فتح popup window للـ OAuth
  - الاستماع لرسالة النجاح من popup
  - حفظ token في localStorage
  - إعادة توجيه بعد النجاح
  - _Requirements: 1.1_

- [ ]* 2.4 كتابة unit tests لـ Google OAuth
  - اختبار OAuth flow الكامل
  - اختبار إنشاء حساب جديد
  - اختبار ربط حساب موجود
  - اختبار معالجة الأخطاء
  - _Requirements: 1.1, 1.7_

---

### 3. OAuth Integration - Facebook & LinkedIn

- [ ] 3.1 إعداد Facebook OAuth
  - تثبيت passport-facebook
  - إضافة FACEBOOK_APP_ID و FACEBOOK_APP_SECRET في .env
  - إنشاء Facebook Strategy
  - إنشاء routes: /auth/facebook و /auth/facebook/callback
  - _Requirements: 1.2_

- [ ] 3.2 إعداد LinkedIn OAuth
  - تثبيت passport-linkedin-oauth2
  - إضافة LINKEDIN_CLIENT_ID و LINKEDIN_CLIENT_SECRET في .env
  - إنشاء LinkedIn Strategy
  - إنشاء routes: /auth/linkedin و /auth/linkedin/callback
  - _Requirements: 1.3_

- [ ] 3.3 إضافة Facebook و LinkedIn Buttons في Frontend
  - إضافة FacebookButton مع أيقونة وألوان العلامة التجارية
  - إضافة LinkedInButton مع أيقونة وألوان العلامة التجارية
  - تطبيق نفس منطق popup window
  - _Requirements: 1.2, 1.3_

- [ ]* 3.4 كتابة property test لـ OAuth
  - **Property 10: OAuth State Parameter**
  - **Validates: Requirements 1.1**

---

### 4. Password Strength Indicator

- [ ] 4.1 إنشاء Password Strength Calculator
  - تثبيت zxcvbn library
  - إنشاء دالة calculatePasswordStrength
  - حساب score (0-4) باستخدام zxcvbn
  - التحقق من المتطلبات الخمسة (length, uppercase, lowercase, number, special)
  - إرجاع label, color, percentage, requirements, feedback, crackTime
  - _Requirements: 2.1, 2.3_

- [ ] 4.2 إنشاء PasswordStrengthIndicator Component
  - Progress bar ملون يعرض قوة كلمة المرور
  - Label يعرض المستوى (ضعيف، متوسط، جيد، قوي)
  - عرض وقت الاختراق المتوقع
  - Checklist للمتطلبات الخمسة مع علامات ✓/✗
  - عرض نصائح التحسين من zxcvbn
  - تحديث فوري أثناء الكتابة
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ]* 4.3 كتابة property test لقوة كلمة المرور
  - **Property 2: Password Strength Consistency**
  - **Validates: Requirements 2.1**

---

### 5. Password Generator

- [ ] 5.1 إنشاء Password Generator Algorithm
  - دالة generateStrongPassword(length)
  - ضمان وجود حرف واحد من كل نوع (uppercase, lowercase, number, special)
  - ملء الباقي عشوائياً
  - خلط الأحرف بشكل عشوائي
  - _Requirements: 3.2_

- [ ] 5.2 إنشاء PasswordGenerator Component
  - زر "اقتراح كلمة مرور قوية"
  - عرض كلمة المرور المقترحة في code block
  - زر "نسخ" مع تأكيد بصري
  - زر "توليد جديد" لاقتراح آخر
  - دعم password managers (autocomplete="new-password")
  - _Requirements: 3.1, 3.3, 3.4, 3.5_

- [ ]* 5.3 كتابة unit tests للـ Password Generator
  - اختبار أن كلمة المرور تحتوي على جميع الأنواع
  - اختبار الطول الصحيح
  - اختبار العشوائية (كلمات مرور مختلفة)
  - _Requirements: 3.2_

---

### 6. Email Validation

- [ ] 6.1 إنشاء Email Validator في Backend
  - تثبيت validator و email-typo
  - دالة validateEmail(email)
  - التحقق من صحة الصيغة باستخدام validator.isEmail
  - التحقق من الأخطاء الشائعة باستخدام email-typo
  - التحقق من وجود البريد في قاعدة البيانات
  - إرجاع valid, error, suggestion, action
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6.2 إنشاء API endpoint للتحقق من البريد
  - POST /auth/check-email
  - استقبال email في body
  - استدعاء validateEmail
  - إرجاع النتيجة
  - _Requirements: 4.1_

- [ ] 6.3 إنشاء EmailValidator Component
  - حقل input مع debounced validation (500ms)
  - أيقونة حالة: loading, success (✓), error (✗)
  - عرض رسالة خطأ واضحة
  - زر لتطبيق الاقتراح إذا وُجد
  - رابط "تسجيل الدخول" إذا كان البريد موجود
  - _Requirements: 4.1, 4.4, 4.5, 4.6, 4.7_

- [ ]* 6.4 كتابة property tests للـ Email Validation
  - **Property 3: Email Format Validation**
  - **Property 4: Email Uniqueness**
  - **Validates: Requirements 4.1, 4.4**

---

### 7. Stepper Component

- [ ] 7.1 إنشاء Stepper Logic
  - تعريف 4 خطوات: المعلومات الأساسية، كلمة المرور، نوع الحساب، التفاصيل
  - حساب النسبة المئوية للتقدم
  - معالجة التنقل بين الخطوات
  - التحقق من صحة كل خطوة قبل الانتقال
  - _Requirements: 5.1, 5.8_

- [ ] 7.2 إنشاء StepperComponent UI
  - Progress bar في الأعلى
  - عرض الخطوات الأربعة مع أيقونات
  - تمييز الخطوة الحالية بلون مختلف
  - علامة ✓ للخطوات المكتملة
  - إمكانية النقر على الخطوات المكتملة للعودة
  - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 7.3 إنشاء Navigation Buttons
  - زر "التالي" - معطل حتى ملء الحقول المطلوبة
  - زر "السابق" - للعودة للخطوة السابقة
  - زر "تخطي" - للخطوات الاختيارية فقط
  - Loading state عند الإرسال
  - _Requirements: 5.6, 5.7, 8.5_

- [ ]* 7.4 كتابة property test للـ Stepper
  - **Property 5: Stepper Progress**
  - **Validates: Requirements 5.1**

---

### 8. Progress Saver

- [ ] 8.1 إنشاء ProgressSaver Class
  - دالة save(step, data) - حفظ في localStorage
  - دالة load() - استرجاع من localStorage
  - دالة clear() - مسح البيانات
  - التحقق من انتهاء الصلاحية (7 أيام)
  - عدم حفظ كلمة المرور (أمان)
  - _Requirements: 6.1, 6.2, 6.6, 6.7_

- [ ] 8.2 إنشاء useProgressSaver Hook
  - Hook يوفر saveProgress, loadProgress, clearProgress
  - حفظ تلقائي بعد كل خطوة
  - _Requirements: 6.1_

- [ ] 8.3 إنشاء ProgressRestoration Component
  - رسالة "لديك تسجيل غير مكتمل"
  - عرض تاريخ آخر حفظ
  - زر "المتابعة من حيث توقفت"
  - زر "بدء من جديد"
  - _Requirements: 6.3, 6.4, 6.5_

- [ ]* 8.4 كتابة property tests للـ Progress Saver
  - **Property 6: Progress Expiry**
  - **Property 7: Password Not Saved**
  - **Validates: Requirements 6.6, 6.7**

---

### 9. Security Enhancements

- [ ] 9.1 إنشاء Password Hashing Utilities
  - دالة hashPassword(password) باستخدام bcrypt (12 rounds)
  - دالة verifyPassword(password, hash)
  - _Requirements: 7.1_

- [ ] 9.2 إنشاء JWT Token Utilities
  - دالة generateJWT(user) - access token (7 days)
  - دالة generateRefreshToken(user) - refresh token (30 days)
  - دالة verifyJWT(token)
  - _Requirements: 7.2_

- [ ] 9.3 إضافة Show/Hide Password Toggle
  - أيقونة عين في حقل كلمة المرور
  - تبديل بين type="password" و type="text"
  - _Requirements: 7.1_

- [ ] 9.4 إعداد Email Verification System
  - إنشاء token عشوائي عند التسجيل
  - إرسال email تأكيد باستخدام Nodemailer/SendGrid
  - API endpoint: POST /auth/verify-email
  - التحقق من token وتفعيل الحساب
  - انتهاء صلاحية token بعد 24 ساعة
  - _Requirements: 7.3_

- [ ]* 9.5 كتابة property tests للأمان
  - **Property 8: JWT Token Expiry**
  - **Property 9: Password Hash**
  - **Validates: Requirements 7.1, 7.2**

---

### 10. Registration Form Steps

- [ ] 10.1 إنشاء Step 1: BasicInfo Component
  - حقل الاسم الكامل (مطلوب)
  - حقل البريد الإلكتروني مع EmailValidator (مطلوب)
  - التحقق من صحة البيانات
  - _Requirements: 5.8_

- [ ] 10.2 إنشاء Step 2: Password Component
  - حقل كلمة المرور مع PasswordStrengthIndicator (مطلوب)
  - حقل تأكيد كلمة المرور (مطلوب)
  - PasswordGenerator
  - Show/Hide toggle
  - التحقق من تطابق كلمتي المرور
  - _Requirements: 5.8_

- [ ] 10.3 إنشاء Step 3: AccountType Component
  - اختيار نوع الحساب: باحث عن عمل، شركة، مستقل (مطلوب)
  - أيقونات وأوصاف لكل نوع
  - _Requirements: 5.8_

- [ ] 10.4 إنشاء Step 4: Details Component
  - رفع صورة الملف الشخصي (اختياري)
  - اختيار المدينة (اختياري)
  - اختيار المجال (اختياري)
  - زر "تخطي" متاح
  - _Requirements: 5.8_

---

### 11. Main Auth Page Integration

- [ ] 11.1 إنشاء Enhanced AuthPage Component
  - دمج OAuthButtons في الأعلى
  - Divider ("أو")
  - دمج StepperComponent
  - دمج ProgressRestoration
  - دمج جميع الخطوات الأربعة
  - معالجة التنقل بين الخطوات
  - حفظ تلقائي بعد كل خطوة
  - _Requirements: 1.1, 5.1, 6.1_

- [ ] 11.2 إنشاء Registration API Handler
  - POST /auth/register endpoint
  - التحقق من جميع البيانات
  - hash كلمة المرور
  - إنشاء المستخدم في قاعدة البيانات
  - إنشاء email verification token
  - إرسال email تأكيد
  - إرجاع JWT token
  - _Requirements: 1.1, 7.1, 7.3_

- [ ] 11.3 معالجة Form Submission
  - جمع البيانات من جميع الخطوات
  - إرسال POST request إلى /auth/register
  - معالجة الأخطاء وعرض رسائل واضحة
  - Loading state أثناء الإرسال
  - رسالة نجاح بعد التسجيل
  - إعادة توجيه إلى dashboard
  - مسح البيانات المحفوظة
  - _Requirements: 8.5, 8.6, 8.7, 8.8_

---

### 12. UX Improvements

- [ ] 12.1 تحسين Error Messages
  - رسائل خطأ واضحة ومحددة لكل حقل
  - عرض الأخطاء بشكل بصري واضح
  - اقتراحات لحل المشكلة
  - _Requirements: 8.1_

- [ ] 12.2 تحسين Focus Management
  - تركيز تلقائي على أول حقل في كل خطوة
  - دعم التنقل بـ Tab
  - إرسال النموذج بـ Enter
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 12.3 تحسين Responsive Design
  - تطبيق responsiveFixes.css
  - اختبار على الهواتف والأجهزة اللوحية
  - تحسين Stepper للشاشات الصغيرة
  - تحسين OAuth buttons للموبايل
  - _Requirements: 8.8_

- [ ] 12.4 إضافة Animations
  - تثبيت framer-motion
  - انتقالات سلسة بين الخطوات
  - fade in/out للرسائل
  - loading animations
  - _Requirements: 8.8_

---

### 13. Forgot Password Flow

- [ ] 13.1 إنشاء Forgot Password Page
  - حقل البريد الإلكتروني
  - زر "إرسال رابط إعادة التعيين"
  - رسالة تأكيد بعد الإرسال
  - _Requirements: 7.3_

- [ ] 13.2 إنشاء Forgot Password API
  - POST /auth/forgot-password
  - التحقق من وجود البريد
  - إنشاء reset token
  - حفظ في PasswordReset model
  - إرسال email مع رابط إعادة التعيين
  - _Requirements: 7.3_

- [ ] 13.3 إنشاء Reset Password Page
  - استقبال token من URL
  - حقل كلمة المرور الجديدة مع PasswordStrengthIndicator
  - حقل تأكيد كلمة المرور
  - زر "إعادة تعيين كلمة المرور"
  - _Requirements: 7.3_

- [ ] 13.4 إنشاء Reset Password API
  - POST /auth/reset-password
  - التحقق من صحة token
  - التحقق من عدم انتهاء الصلاحية
  - hash كلمة المرور الجديدة
  - تحديث كلمة المرور
  - تعليم token كـ used
  - _Requirements: 7.3_

---

### 14. OAuth Account Management

- [ ] 14.1 إنشاء Connected Accounts Page
  - عرض جميع الحسابات المتصلة
  - أيقونات للـ providers
  - تاريخ الاتصال
  - زر "فك الربط" لكل حساب
  - _Requirements: 1.6_

- [ ] 14.2 إنشاء Link Account API
  - POST /auth/link-account/:provider
  - ربط حساب OAuth بحساب موجود
  - التحقق من عدم ربط نفس الحساب مرتين
  - _Requirements: 1.5_

- [ ] 14.3 إنشاء Unlink Account API
  - DELETE /auth/unlink-account/:provider
  - فك ربط حساب OAuth
  - التحقق من وجود طريقة تسجيل دخول أخرى
  - _Requirements: 1.6_

---

### 15. Testing & Quality Assurance

- [ ]* 15.1 كتابة Integration Tests
  - اختبار التسجيل الكامل (4 خطوات)
  - اختبار OAuth flow
  - اختبار Forgot Password flow
  - اختبار Email Verification
  - _Requirements: جميع المتطلبات_

- [ ]* 15.2 كتابة E2E Tests
  - اختبار التسجيل من البداية للنهاية
  - اختبار تسجيل الدخول بـ OAuth
  - اختبار حفظ التقدم واسترجاعه
  - اختبار على متصفحات مختلفة
  - _Requirements: جميع المتطلبات_

- [ ] 15.3 Security Audit
  - مراجعة جميع endpoints
  - التحقق من password hashing
  - التحقق من JWT security
  - التحقق من OAuth security
  - اختبار CSRF protection
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 15.4 Performance Testing
  - قياس وقت التسجيل
  - قياس وقت OAuth flow
  - تحسين API response time
  - تحسين Frontend bundle size
  - _Requirements: KPIs_

---

### 16. Documentation & Deployment

- [ ] 16.1 كتابة API Documentation
  - توثيق جميع endpoints
  - أمثلة requests/responses
  - معالجة الأخطاء
  - _Requirements: جميع المتطلبات_

- [ ] 16.2 كتابة User Guide
  - دليل التسجيل
  - دليل OAuth
  - دليل إعادة تعيين كلمة المرور
  - FAQ
  - _Requirements: جميع المتطلبات_

- [ ] 16.3 إعداد Environment Variables
  - إضافة جميع OAuth credentials
  - إضافة JWT secrets
  - إضافة Email service credentials
  - إنشاء .env.example
  - _Requirements: جميع المتطلبات_

- [ ] 16.4 Deployment Checklist
  - اختبار على staging environment
  - مراجعة security settings
  - إعداد monitoring
  - إعداد error tracking
  - Deploy to production
  - _Requirements: جميع المتطلبات_

---

## Checkpoint

- [ ] 17. Checkpoint النهائي
  - التأكد من عمل جميع الميزات
  - التأكد من نجاح جميع الاختبارات
  - مراجعة الأمان
  - مراجعة الأداء
  - مراجعة UX
  - الحصول على موافقة المستخدم

---

## ملاحظات

- المهام المميزة بـ `*` اختيارية ويمكن تخطيها للحصول على MVP أسرع
- كل مهمة تحتوي على مراجع واضحة للمتطلبات
- يُنصح بالعمل على المهام بالترتيب لضمان التكامل السلس
- Checkpoints مهمة للتحقق من التقدم وجودة العمل

---

**تاريخ الإنشاء**: 2026-02-18  
**آخر تحديث**: 2026-02-18
