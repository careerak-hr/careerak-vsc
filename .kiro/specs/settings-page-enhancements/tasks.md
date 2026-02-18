# Implementation Plan: Settings Page Enhancements

## Overview

خطة تنفيذ شاملة لتحسينات صفحة الإعدادات في منصة Careerak. التنفيذ يتبع نهج تدريجي يبدأ بالبنية التحتية والنماذج، ثم الخدمات الأساسية، ثم واجهة المستخدم، مع اختبارات property-based لضمان الصحة.

## Tasks

- [ ] 1. إعداد البنية التحتية والنماذج
  - إنشاء نماذج MongoDB: UserSettings, ActiveSession, LoginHistory, DataExportRequest, AccountDeletionRequest, EmailChangeRequest, PhoneChangeRequest
  - إضافة indexes محسّنة لكل نموذج
  - إعداد TTL indexes للبيانات المؤقتة
  - _Requirements: 15.1, 15.2_

- [ ] 2. تطوير خدمات الإعدادات الأساسية
  - [ ] 2.1 تطوير SettingsService
    - تنفيذ updateProfile: التحقق من الصحة، حفظ التغييرات
    - تنفيذ updatePrivacySettings: حفظ إعدادات الخصوصية
    - تنفيذ updateNotificationPreferences: حفظ تفضيلات الإشعارات
    - _Requirements: 2.1, 2.2, 6.7, 7.6_
  
  - [ ]* 2.2 كتابة property test لـ SettingsService
    - **Property 1: Settings Round-Trip Consistency**
    - **Validates: Requirements 2.2, 4.3, 6.7, 7.6**
  
  - [ ]* 2.3 كتابة property test للتحقق من المدخلات
    - **Property 2: Input Validation Rejection**
    - **Validates: Requirements 2.1, 2.3, 2.5, 5.2**

- [ ] 3. تطوير نظام تغيير البريد الإلكتروني
  - [ ] 3.1 تطوير EmailChangeService
    - تنفيذ initiateEmailChange: التحقق من عدم تكرار البريد
    - تنفيذ sendOTPToOldEmail: إرسال OTP للبريد القديم
    - تنفيذ sendOTPToNewEmail: إرسال OTP للبريد الجديد
    - تنفيذ verifyAndUpdate: التحقق من OTPs وكلمة المرور، تحديث البريد
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 3.2 كتابة property test لتفرد البريد
    - **Property 3: Unique Identifier Enforcement**
    - **Validates: Requirements 3.1, 4.1**
  
  - [ ]* 3.3 كتابة property test لتدفق تغيير البريد
    - **Property 4: Email Change Verification Flow**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**

- [ ] 4. تطوير نظام تغيير رقم الهاتف
  - [ ] 4.1 تطوير PhoneChangeService
    - تنفيذ initiatePhoneChange: التحقق من عدم تكرار الرقم
    - تنفيذ sendOTP: إرسال OTP للرقم الجديد
    - تنفيذ verifyAndUpdate: التحقق من OTP، تحديث الرقم
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 4.2 كتابة property test للتحقق من OTP
    - **Property 5: OTP Verification Requirement**
    - **Validates: Requirements 4.2, 4.3, 8.2**

- [ ] 5. Checkpoint - التأكد من عمل الخدمات الأساسية
  - التأكد من نجاح جميع الاختبارات، سؤال المستخدم إذا كانت هناك أسئلة.


- [ ] 6. تطوير نظام تغيير كلمة المرور
  - [ ] 6.1 تطوير PasswordChangeService
    - تنفيذ verifyCurrentPassword: التحقق من كلمة المرور الحالية
    - تنفيذ validateNewPassword: التحقق من قوة كلمة المرور الجديدة
    - تنفيذ changePassword: تشفير وحفظ كلمة المرور الجديدة
    - تنفيذ invalidateOtherSessions: إنهاء جميع الجلسات الأخرى
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 6.2 كتابة property test لإنهاء الجلسات
    - **Property 6: Password Change Session Invalidation**
    - **Validates: Requirements 5.4**
  
  - [ ]* 6.3 كتابة unit tests لتغيير كلمة المرور
    - اختبار رفض كلمة مرور ضعيفة
    - اختبار رفض كلمة مرور حالية خاطئة
    - اختبار تغيير ناجح
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7. تطوير نظام المصادقة الثنائية (2FA)
  - [ ] 7.1 تطوير TwoFactorService
    - تنفيذ enable2FA: إنشاء secret، QR code، backup codes
    - تنفيذ verify2FASetup: التحقق من OTP لتأكيد الإعداد
    - تنفيذ disable2FA: تعطيل 2FA مع التحقق
    - تنفيذ verifyOTP: التحقق من OTP
    - تنفيذ useBackupCode: استخدام كود احتياطي
    - تنفيذ regenerateBackupCodes: إعادة إنشاء أكواد احتياطية
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 7.2 كتابة property test لتطبيق 2FA
    - **Property 8: 2FA Enforcement**
    - **Validates: Requirements 8.4**
  
  - [ ]* 7.3 كتابة property test لأكواد الاحتياط
    - **Property 9: 2FA Backup Codes Generation**
    - **Property 11: Backup Code Acceptance**
    - **Validates: Requirements 8.3, 8.6**
  
  - [ ]* 7.4 كتابة property test لحماية تعطيل 2FA
    - **Property 10: 2FA Disable Protection**
    - **Validates: Requirements 8.5**

- [ ] 8. تطوير نظام إدارة الجلسات
  - [ ] 8.1 تطوير SessionService
    - تنفيذ getActiveSessions: جلب جميع الجلسات النشطة
    - تنفيذ logoutSession: إنهاء جلسة محددة
    - تنفيذ logoutAllOtherSessions: إنهاء جميع الجلسات الأخرى
    - تنفيذ getLoginHistory: جلب سجل تسجيل الدخول
    - تنفيذ logLoginAttempt: تسجيل محاولة تسجيل دخول
    - تنفيذ cleanupExpiredSessions: تنظيف الجلسات المنتهية (cron job)
    - _Requirements: 9.1, 9.3, 9.4, 9.6, 10.1, 10.2_
  
  - [ ]* 8.2 كتابة property test لإنهاء الجلسات
    - **Property 12: Session Termination**
    - **Property 13: Bulk Session Termination**
    - **Validates: Requirements 9.3, 9.4**
  
  - [ ]* 8.3 كتابة property test لانتهاء صلاحية الجلسات
    - **Property 14: Session Auto-Expiration**
    - **Validates: Requirements 9.6**
  
  - [ ]* 8.4 كتابة property test لتسجيل محاولات الدخول
    - **Property 15: Login Attempt Logging**
    - **Property 16: Login History Retention**
    - **Validates: Requirements 10.1, 10.2**

- [ ] 9. Checkpoint - التأكد من عمل أنظمة الأمان
  - التأكد من نجاح جميع الاختبارات، سؤال المستخدم إذا كانت هناك أسئلة.

- [ ] 10. تطوير نظام تصدير البيانات (GDPR)
  - [ ] 10.1 تطوير DataExportService
    - تنفيذ requestExport: إنشاء طلب تصدير
    - تنفيذ processExport: معالجة التصدير (background job)
    - تنفيذ collectUserData: جمع جميع بيانات المستخدم
    - تنفيذ generateExportFile: إنشاء ملف بالتنسيق المطلوب (JSON/CSV/PDF)
    - تنفيذ getExportStatus: التحقق من حالة التصدير
    - تنفيذ generateDownloadToken: إنشاء token للتحميل
    - تنفيذ downloadExport: تحميل الملف
    - تنفيذ cleanupExpiredExports: تنظيف الملفات المنتهية (cron job)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  
  - [ ]* 10.2 كتابة property test لاكتمال البيانات
    - **Property 18: Data Export Completeness**
    - **Validates: Requirements 11.6**
  
  - [ ]* 10.3 كتابة property test لانتهاء صلاحية الرابط
    - **Property 19: Data Export Link Expiration**
    - **Validates: Requirements 11.5**
  
  - [ ]* 10.4 كتابة property test للحد الزمني
    - **Property 20: Data Export Time Limit**
    - **Validates: Requirements 11.7**

- [ ] 11. تطوير نظام حذف الحساب
  - [ ] 11.1 تطوير AccountDeletionService
    - تنفيذ requestDeletion: إنشاء طلب حذف
    - تنفيذ cancelDeletion: إلغاء طلب الحذف
    - تنفيذ getDeletionStatus: التحقق من حالة الحذف
    - تنفيذ processScheduledDeletions: معالجة الحذف المؤجل (cron job)
    - تنفيذ sendDeletionReminders: إرسال تذكيرات (cron job)
    - تنفيذ permanentlyDeleteAccount: حذف نهائي لجميع البيانات
    - تنفيذ anonymizeRetainedData: إخفاء هوية البيانات المحفوظة
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10_
  
  - [ ]* 11.2 كتابة property test لفترة السماح
    - **Property 21: Account Deletion Grace Period**
    - **Validates: Requirements 12.5, 12.6**
  
  - [ ]* 11.3 كتابة property test للتذكيرات
    - **Property 22: Account Deletion Reminder**
    - **Validates: Requirements 12.7**
  
  - [ ]* 11.4 كتابة property test للحذف الكامل
    - **Property 23: Complete Data Deletion**
    - **Property 24: Legal Data Anonymization**
    - **Validates: Requirements 12.8, 12.9**

- [ ] 12. تطوير نظام الإشعارات للإعدادات
  - [ ] 12.1 تكامل مع NotificationService الموجود
    - إضافة دالة sendSecurityNotification: إرسال إشعارات أمنية
    - إضافة دالة queueNotificationDuringQuietHours: تأجيل الإشعارات
    - إضافة دالة sendQueuedNotifications: إرسال الإشعارات المؤجلة (cron job)
    - _Requirements: 7.5, 15.1_
  
  - [ ]* 12.2 كتابة property test لساعات الهدوء
    - **Property 17: Quiet Hours Notification Queuing**
    - **Validates: Requirements 7.5**
  
  - [ ]* 12.3 كتابة property test للإشعارات الأمنية
    - **Property 7: Security Action Notification**
    - **Validates: Requirements 3.6, 4.4, 5.5, 9.5, 11.4, 12.10**

- [ ] 13. Checkpoint - التأكد من عمل جميع الخدمات الخلفية
  - التأكد من نجاح جميع الاختبارات، سؤال المستخدم إذا كانت هناك أسئلة.

- [ ] 14. تطوير API Endpoints
  - [ ] 14.1 إنشاء SettingsController
    - تنفيذ PUT /api/settings/profile
    - تنفيذ POST /api/settings/email/change
    - تنفيذ POST /api/settings/email/verify
    - تنفيذ POST /api/settings/phone/change
    - تنفيذ POST /api/settings/password/change
    - تنفيذ GET /api/settings/privacy
    - تنفيذ PUT /api/settings/privacy
    - تنفيذ GET /api/settings/notifications
    - تنفيذ PUT /api/settings/notifications
    - _Requirements: 2.1, 2.2, 3.1-3.5, 4.1-4.3, 5.1-5.4, 6.7, 7.6_
  
  - [ ] 14.2 إنشاء SecurityController
    - تنفيذ POST /api/settings/2fa/enable
    - تنفيذ POST /api/settings/2fa/disable
    - تنفيذ GET /api/settings/2fa/backup-codes
    - تنفيذ POST /api/settings/2fa/regenerate-codes
    - تنفيذ GET /api/settings/sessions
    - تنفيذ DELETE /api/settings/sessions/:id
    - تنفيذ DELETE /api/settings/sessions/others
    - تنفيذ GET /api/settings/login-history
    - _Requirements: 8.1-8.6, 9.1-9.6, 10.1-10.2_
  
  - [ ] 14.3 إنشاء DataController
    - تنفيذ POST /api/settings/data/export
    - تنفيذ GET /api/settings/data/export/:id
    - تنفيذ GET /api/settings/data/download/:token
    - تنفيذ POST /api/settings/account/delete
    - تنفيذ POST /api/settings/account/cancel-deletion
    - تنفيذ GET /api/settings/account/deletion-status
    - _Requirements: 11.1-11.7, 12.1-12.10_
  
  - [ ]* 14.4 كتابة integration tests للـ API
    - اختبار تدفق تغيير البريد الكامل
    - اختبار تدفق تفعيل 2FA
    - اختبار تدفق حذف الحساب
    - _Requirements: جميع المتطلبات_

- [ ] 15. تطبيق حماية الأمان
  - [ ] 15.1 إضافة CSRF Protection Middleware
    - تنفيذ generateCSRFToken
    - تنفيذ validateCSRFToken
    - إضافة middleware لجميع endpoints
    - _Requirements: 14.1_
  
  - [ ] 15.2 إضافة Rate Limiting Middleware
    - تنفيذ rate limiter: 10 requests/minute للعمليات الحساسة
    - إضافة middleware للـ endpoints الحساسة
    - _Requirements: 14.2_
  
  - [ ] 15.3 إضافة Input Validation & Sanitization
    - تنفيذ validation schemas (Joi/Yup)
    - تنفيذ sanitization للمدخلات (DOMPurify)
    - إضافة validation middleware
    - _Requirements: 14.3, 14.4_
  
  - [ ] 15.4 إضافة Security Logging
    - تنفيذ logSecurityAction
    - تسجيل جميع الإجراءات الأمنية
    - _Requirements: 14.5_
  
  - [ ] 15.5 إضافة Account Lock Mechanism
    - تنفيذ detectSuspiciousActivity
    - تنفيذ lockAccount
    - تنفيذ unlockAccount (بعد 30 دقيقة أو بواسطة admin)
    - _Requirements: 14.6_
  
  - [ ]* 15.6 كتابة property tests للأمان
    - **Property 28: CSRF Protection**
    - **Property 29: Rate Limiting Enforcement**
    - **Property 30: Dual Input Validation**
    - **Property 31: XSS Prevention**
    - **Property 32: Security Action Logging**
    - **Property 33: Suspicious Activity Account Lock**
    - **Validates: Requirements 14.1-14.6**

- [ ] 16. Checkpoint - التأكد من عمل جميع APIs والأمان
  - التأكد من نجاح جميع الاختبارات، سؤال المستخدم إذا كانت هناك أسئلة.

- [ ] 17. تطوير واجهة المستخدم - SettingsPage
  - [ ] 17.1 إنشاء SettingsPage Component
    - تنفيذ tab navigation (5 tabs)
    - تنفيذ state management (activeTab, unsavedChanges, undoStack)
    - تنفيذ حفظ آخر tab مزار
    - تنفيذ RTL/LTR support
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [ ]* 17.2 كتابة unit tests لـ SettingsPage
    - اختبار عرض 5 تبويبات
    - اختبار التنقل بين التبويبات
    - اختبار حفظ آخر tab
    - _Requirements: 1.1, 1.2, 1.4_

- [ ] 18. تطوير واجهة المستخدم - AccountTab
  - [ ] 18.1 إنشاء AccountTab Component
    - تنفيذ نموذج تعديل الملف الشخصي
    - تنفيذ رفع وقص الصورة (react-easy-crop)
    - تنفيذ تغيير اللغة والمنطقة الزمنية
    - تنفيذ EmailChangeModal
    - تنفيذ PhoneChangeModal
    - تنفيذ PasswordChangeModal
    - _Requirements: 2.1-2.5, 3.1-3.6, 4.1-4.4, 5.1-5.5_
  
  - [ ]* 18.2 كتابة unit tests لـ AccountTab
    - اختبار تحديث الملف الشخصي
    - اختبار رفض صورة كبيرة
    - اختبار تدفق تغيير البريد
    - اختبار تدفق تغيير الهاتف
    - اختبار تدفق تغيير كلمة المرور
    - _Requirements: 2.1-2.5, 3.1-3.6, 4.1-4.4, 5.1-5.5_

- [ ] 19. تطوير واجهة المستخدم - PrivacyTab
  - [ ] 19.1 إنشاء PrivacyTab Component
    - تنفيذ خيارات رؤية الملف الشخصي
    - تنفيذ خيارات إظهار/إخفاء البريد والهاتف
    - تنفيذ خيارات أذونات الرسائل
    - تنفيذ خيار إظهار حالة النشاط
    - تنفيذ خيار فهرسة محركات البحث
    - _Requirements: 6.1-6.7_
  
  - [ ]* 19.2 كتابة unit tests لـ PrivacyTab
    - اختبار تحديث إعدادات الخصوصية
    - اختبار حفظ التغييرات
    - _Requirements: 6.7_

- [ ] 20. تطوير واجهة المستخدم - NotificationsTab
  - [ ] 20.1 إنشاء NotificationsTab Component
    - تنفيذ toggles لأنواع الإشعارات (5 أنواع)
    - تنفيذ خيارات طريقة الإشعار (In-App, Email, Push)
    - تنفيذ إعداد ساعات الهدوء (start time, end time)
    - تنفيذ خيارات تكرار الإشعارات
    - _Requirements: 7.1-7.6_
  
  - [ ]* 20.2 كتابة unit tests لـ NotificationsTab
    - اختبار تحديث تفضيلات الإشعارات
    - اختبار إعداد ساعات الهدوء
    - _Requirements: 7.6_

- [ ] 21. تطوير واجهة المستخدم - SecurityTab
  - [ ] 21.1 إنشاء SecurityTab Component
    - تنفيذ Enable2FAModal (QR code, verification)
    - تنفيذ Disable2FAModal (password + OTP)
    - تنفيذ BackupCodesModal (عرض وتحميل)
    - تنفيذ ActiveSessionsList (عرض جميع الجلسات)
    - تنفيذ SessionCard (معلومات الجلسة، logout button)
    - تنفيذ LoginHistoryList (عرض السجل، filtering)
    - _Requirements: 8.1-8.6, 9.1-9.6, 10.1-10.5_
  
  - [ ]* 21.2 كتابة unit tests لـ SecurityTab
    - اختبار تفعيل 2FA
    - اختبار تعطيل 2FA
    - اختبار عرض الجلسات النشطة
    - اختبار تسجيل خروج من جلسة
    - اختبار عرض سجل تسجيل الدخول
    - _Requirements: 8.1-8.6, 9.1-9.6, 10.1-10.5_

- [ ] 22. تطوير واجهة المستخدم - DataTab
  - [ ] 22.1 إنشاء DataTab Component
    - تنفيذ DataExportSection (خيارات التصدير، طلب تصدير)
    - تنفيذ ExportStatusCard (حالة التصدير، progress bar)
    - تنفيذ AccountDeletionSection (تحذير، خيارات الحذف)
    - تنفيذ DeleteAccountModal (تأكيدات متعددة)
    - تنفيذ PendingDeletionCard (عرض فترة السماح، إلغاء)
    - _Requirements: 11.1-11.7, 12.1-12.10_
  
  - [ ]* 22.2 كتابة unit tests لـ DataTab
    - اختبار طلب تصدير بيانات
    - اختبار عرض حالة التصدير
    - اختبار طلب حذف حساب
    - اختبار إلغاء الحذف
    - _Requirements: 11.1-11.7, 12.1-12.10_

- [ ] 23. Checkpoint - التأكد من عمل جميع واجهات المستخدم
  - التأكد من نجاح جميع الاختبارات، سؤال المستخدم إذا كانت هناك أسئلة.

- [ ] 24. تطبيق ميزات UX المحسّنة
  - [ ] 24.1 تطوير Auto-Save System
    - تنفيذ useAutoSave hook (حفظ بعد 2 ثانية من عدم النشاط)
    - تنفيذ success indicator
    - تنفيذ error handling
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ] 24.2 تطوير Undo System
    - تنفيذ useUndoStack hook (آخر 5 تغييرات، 30 ثانية)
    - تنفيذ Undo button
    - تنفيذ undo notification
    - _Requirements: 13.5_
  
  - [ ] 24.3 تطوير Confirmation Dialogs
    - تنفيذ ConfirmationModal component
    - إضافة تأكيدات للإجراءات الحساسة
    - _Requirements: 13.6_
  
  - [ ]* 24.4 كتابة property tests لـ UX features
    - **Property 25: Auto-Save Timing**
    - **Property 26: Undo Stack Management**
    - **Property 27: Sensitive Action Confirmation**
    - **Validates: Requirements 13.1, 13.5, 13.6**

- [ ] 25. تطبيق التصميم والأنماط
  - [ ] 25.1 تطبيق project-standards.md
    - استخدام الألوان: Primary #304B60, Secondary #E3DAD1, Accent #D4816180
    - استخدام الخطوط: Amiri (عربي), Cormorant Garamond (إنجليزي)
    - تطبيق إطارات الحقول النحاسية الباهتة
    - _Requirements: 15.4, 15.5_
  
  - [ ] 25.2 تطبيق Responsive Design
    - استخدام responsiveFixes.css
    - اختبار على جميع أحجام الشاشات
    - اختبار RTL/LTR
    - _Requirements: 1.5, 15.6_

- [ ] 26. إعداد Cron Jobs
  - [ ] 26.1 إنشاء Cron Job Scheduler
    - تنفيذ cleanupExpiredSessions (يومياً)
    - تنفيذ cleanupExpiredExports (يومياً)
    - تنفيذ processScheduledDeletions (يومياً)
    - تنفيذ sendDeletionReminders (يومياً)
    - تنفيذ sendQueuedNotifications (كل ساعة)
    - _Requirements: 7.5, 9.6, 11.5, 12.7, 12.8_

- [ ] 27. Integration Testing الشامل
  - [ ]* 27.1 كتابة integration tests للتدفقات الكاملة
    - اختبار تدفق تغيير البريد الكامل (من البداية للنهاية)
    - اختبار تدفق تفعيل 2FA الكامل
    - اختبار تدفق حذف الحساب الكامل (مع فترة السماح)
    - اختبار تدفق تصدير البيانات الكامل
    - _Requirements: جميع المتطلبات_

- [ ] 28. Security Testing
  - [ ]* 28.1 كتابة security tests
    - اختبار CSRF protection
    - اختبار rate limiting
    - اختبار XSS prevention
    - اختبار SQL injection prevention
    - اختبار session hijacking prevention
    - اختبار brute force protection
    - _Requirements: 14.1-14.6_

- [ ] 29. Performance Testing
  - [ ]* 29.1 كتابة performance tests
    - اختبار response time (< 200ms GET, < 500ms POST)
    - اختبار concurrent users (1000 users)
    - اختبار database query optimization
    - اختبار data export time (< 48 hours)
    - _Requirements: 11.7_

- [ ] 30. Checkpoint النهائي
  - التأكد من نجاح جميع الاختبارات (unit, property, integration, security, performance)
  - مراجعة code coverage (> 80%)
  - مراجعة documentation
  - سؤال المستخدم إذا كانت هناك أسئلة أو تحسينات مطلوبة

## Notes

- المهام المميزة بـ `*` اختيارية ويمكن تخطيها للحصول على MVP أسرع
- كل مهمة تشير إلى المتطلبات المحددة للتتبع
- Checkpoints تضمن التحقق التدريجي من الصحة
- Property tests تتحقق من الخصائص العامة عبر آلاف المدخلات
- Unit tests تتحقق من أمثلة محددة وحالات حدية
- جميع الاختبارات يجب أن تنجح قبل الانتقال للمرحلة التالية
