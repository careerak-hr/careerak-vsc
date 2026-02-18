# Requirements Document

## Introduction

هذه الوثيقة تحدد متطلبات تحسينات صفحة الإعدادات في منصة Careerak. الهدف هو تحويل صفحة الإعدادات إلى مركز شامل لإدارة الحساب والخصوصية والأمان مع واجهة منظمة وسهلة الاستخدام، مع الامتثال الكامل لقوانين حماية البيانات (GDPR).

## Glossary

- **System**: منصة Careerak
- **User**: المستخدم (باحث عن عمل، شركة، أو مستقل)
- **Settings_Manager**: مدير الإعدادات في النظام
- **Session_Manager**: مدير الجلسات النشطة
- **Data_Exporter**: مصدّر البيانات الشخصية
- **Account_Deletion_Handler**: معالج حذف الحسابات
- **Notification_Service**: خدمة الإشعارات
- **OTP_Service**: خدمة رموز التحقق
- **Email_Verifier**: مدقق البريد الإلكتروني
- **Active_Session**: جلسة تسجيل دخول نشطة
- **Trusted_Device**: جهاز موثوق
- **2FA**: المصادقة الثنائية (Two-Factor Authentication)
- **Quiet_Hours**: ساعات الهدوء (فترة عدم إرسال إشعارات)
- **Grace_Period**: فترة السماح (30 يوم قبل الحذف النهائي)

## Requirements

### Requirement 1: تنظيم صفحة الإعدادات بتبويبات

**User Story:** كمستخدم، أريد صفحة إعدادات منظمة بتبويبات واضحة، حتى أتمكن من الوصول السريع للإعدادات المختلفة.

#### Acceptance Criteria

1. THE System SHALL display settings page with 5 main tabs: Account, Privacy, Notifications, Security, Data & Privacy
2. WHEN a user clicks on a tab, THE System SHALL display the corresponding settings section
3. THE System SHALL highlight the active tab visually
4. THE System SHALL preserve the last visited tab when user returns to settings page
5. THE System SHALL support RTL layout for Arabic language

### Requirement 2: إدارة معلومات الحساب

**User Story:** كمستخدم، أريد تعديل معلوماتي الشخصية، حتى أحافظ على بياناتي محدثة.

#### Acceptance Criteria

1. WHEN a user updates personal information (name, email, phone, photo), THE Settings_Manager SHALL validate the input
2. WHEN validation passes, THE Settings_Manager SHALL save the changes to database
3. WHEN a user changes profile photo, THE System SHALL validate image format and size (max 5MB, formats: jpg, png, webp)
4. WHEN changes are saved, THE System SHALL display a success confirmation message
5. IF validation fails, THEN THE System SHALL display specific error messages

### Requirement 3: تغيير البريد الإلكتروني

**User Story:** كمستخدم، أريد تغيير بريدي الإلكتروني بشكل آمن، حتى أحافظ على أمان حسابي.

#### Acceptance Criteria

1. WHEN a user requests email change, THE Email_Verifier SHALL check if new email is not already registered
2. WHEN new email is available, THE OTP_Service SHALL send verification code to old email
3. WHEN old email is verified, THE OTP_Service SHALL send verification code to new email
4. WHEN both emails are verified, THE System SHALL require password confirmation
5. WHEN password is confirmed, THE Settings_Manager SHALL update email and invalidate all other sessions
6. WHEN email is changed, THE Notification_Service SHALL send notification to both old and new emails

### Requirement 4: تغيير رقم الهاتف

**User Story:** كمستخدم، أريد تغيير رقم هاتفي بشكل آمن، حتى أستقبل الإشعارات على الرقم الصحيح.

#### Acceptance Criteria

1. WHEN a user requests phone change, THE System SHALL check if new phone number is not already registered
2. WHEN new phone is available, THE OTP_Service SHALL send verification code to new phone number
3. WHEN OTP is verified, THE Settings_Manager SHALL update phone number
4. WHEN phone is changed, THE Notification_Service SHALL send confirmation notification

### Requirement 5: تغيير كلمة المرور

**User Story:** كمستخدم، أريد تغيير كلمة مروري، حتى أحافظ على أمان حسابي.

#### Acceptance Criteria

1. WHEN a user requests password change, THE System SHALL require current password
2. WHEN current password is verified, THE System SHALL validate new password strength (min 8 chars, uppercase, lowercase, number, special char)
3. WHEN new password is valid, THE Settings_Manager SHALL hash and save new password
4. WHEN password is changed, THE Session_Manager SHALL invalidate all other sessions except current
5. WHEN password is changed, THE Notification_Service SHALL send notification to user email

### Requirement 6: إعدادات الخصوصية

**User Story:** كمستخدم، أريد التحكم في من يمكنه رؤية معلوماتي، حتى أحمي خصوصيتي.

#### Acceptance Criteria

1. THE System SHALL provide profile visibility options: Everyone, Registered Users Only, No One
2. THE System SHALL provide options to show/hide email address in profile
3. THE System SHALL provide options to show/hide phone number in profile
4. THE System SHALL provide message permissions: Everyone, Contacts Only, No One
5. THE System SHALL provide option to show/hide online status
6. THE System SHALL provide option to allow/disallow search engine indexing
7. WHEN privacy settings are changed, THE Settings_Manager SHALL apply changes immediately

### Requirement 7: إعدادات الإشعارات

**User Story:** كمستخدم، أريد التحكم في الإشعارات التي أستقبلها، حتى لا أتلقى إشعارات غير مرغوبة.

#### Acceptance Criteria

1. THE System SHALL provide notification toggles for: Job Notifications, Course Notifications, Chat Notifications, Review Notifications, System Notifications
2. THE System SHALL provide notification method options: In-App, Email, Push
3. THE System SHALL provide Quiet Hours configuration (start time, end time)
4. THE System SHALL provide notification frequency options: Immediate, Daily Digest, Weekly Digest
5. WHEN Quiet Hours are active, THE Notification_Service SHALL queue notifications and send after Quiet Hours end
6. WHEN notification settings are changed, THE Settings_Manager SHALL update user preferences immediately

### Requirement 8: المصادقة الثنائية (2FA)

**User Story:** كمستخدم، أريد تفعيل المصادقة الثنائية، حتى أزيد من أمان حسابي.

#### Acceptance Criteria

1. WHEN a user enables 2FA, THE System SHALL generate QR code for authenticator app
2. WHEN user scans QR code, THE System SHALL require verification code to confirm setup
3. WHEN 2FA is enabled, THE System SHALL generate backup codes (10 codes)
4. WHEN user logs in with 2FA enabled, THE System SHALL require OTP after password
5. WHEN a user disables 2FA, THE System SHALL require password and current OTP
6. THE System SHALL allow using backup codes when authenticator is unavailable

### Requirement 9: إدارة الجلسات النشطة

**User Story:** كمستخدم، أريد رؤية جميع الأجهزة المتصلة بحسابي، حتى أتأكد من عدم وجود وصول غير مصرح.

#### Acceptance Criteria

1. THE Session_Manager SHALL display all active sessions with: device type, OS, browser, IP address, approximate location, login time, last activity
2. THE System SHALL highlight current session distinctly
3. WHEN a user clicks "Logout from this session", THE Session_Manager SHALL invalidate that specific session
4. WHEN a user clicks "Logout from all other sessions", THE Session_Manager SHALL invalidate all sessions except current
5. WHEN a session is terminated, THE Notification_Service SHALL send notification to user
6. THE Session_Manager SHALL automatically expire sessions after 30 days of inactivity

### Requirement 10: سجل تسجيل الدخول

**User Story:** كمستخدم، أريد رؤية سجل تسجيلات الدخول، حتى أكتشف أي نشاط مشبوه.

#### Acceptance Criteria

1. THE System SHALL log all login attempts with: timestamp, device, location, IP, success/failure status
2. THE System SHALL display login history for last 90 days
3. THE System SHALL allow filtering by: date range, device type, success/failure
4. WHEN a failed login attempt occurs, THE System SHALL highlight it in red
5. THE System SHALL allow user to report suspicious activity

### Requirement 11: تحميل البيانات الشخصية (GDPR)

**User Story:** كمستخدم، أريد تحميل نسخة من بياناتي الشخصية، حتى أمارس حقي في نقل البيانات.

#### Acceptance Criteria

1. WHEN a user requests data download, THE Data_Exporter SHALL provide options: All Data, Profile Only, Activity History, Messages, Applications & Courses
2. WHEN user selects data types, THE Data_Exporter SHALL provide format options: JSON, CSV, PDF
3. WHEN download is requested, THE Data_Exporter SHALL process request asynchronously for large datasets
4. WHEN data is ready, THE Notification_Service SHALL send notification with download link
5. THE System SHALL expire download link after 7 days
6. THE Data_Exporter SHALL include all user data: profile, posts, messages, applications, courses, reviews, activity logs
7. THE System SHALL complete data export within 48 hours maximum

### Requirement 12: حذف الحساب

**User Story:** كمستخدم، أريد حذف حسابي بشكل نهائي، حتى أمارس حقي في النسيان.

#### Acceptance Criteria

1. WHEN a user requests account deletion, THE System SHALL display clear warning about consequences
2. WHEN user confirms deletion intent, THE System SHALL require password confirmation
3. IF 2FA is enabled, THEN THE System SHALL require OTP confirmation
4. THE System SHALL provide deletion options: Immediate Deletion, Scheduled Deletion (30-day grace period)
5. WHEN scheduled deletion is chosen, THE Account_Deletion_Handler SHALL mark account for deletion and set deletion date
6. DURING grace period, THE System SHALL allow user to cancel deletion and restore account
7. THE System SHALL send reminder notification 7 days before final deletion
8. WHEN grace period ends, THE Account_Deletion_Handler SHALL permanently delete: user profile, posts, messages, applications, reviews, sessions, all personal data
9. THE Account_Deletion_Handler SHALL anonymize data that must be retained for legal reasons (e.g., transaction records)
10. WHEN account is deleted, THE Notification_Service SHALL send final confirmation email

### Requirement 13: حفظ تلقائي وتجربة مستخدم محسّنة

**User Story:** كمستخدم، أريد تجربة سلسة عند تعديل الإعدادات، حتى لا أفقد تغييراتي.

#### Acceptance Criteria

1. WHEN a user modifies a setting, THE System SHALL save changes automatically after 2 seconds of inactivity
2. WHEN changes are saved, THE System SHALL display subtle success indicator
3. WHEN an error occurs, THE System SHALL display clear error message with suggested action
4. THE System SHALL show loading states during save operations
5. THE System SHALL provide "Undo" option for last 5 changes within 30 seconds
6. WHEN user attempts sensitive action (delete, logout all), THE System SHALL require explicit confirmation

### Requirement 14: الأمان والحماية

**User Story:** كمستخدم، أريد أن تكون إعداداتي محمية من الهجمات، حتى أحافظ على أمان حسابي.

#### Acceptance Criteria

1. THE System SHALL implement CSRF protection for all settings endpoints
2. THE System SHALL implement rate limiting: max 10 requests per minute for sensitive operations
3. THE System SHALL validate all inputs on both client and server side
4. THE System SHALL sanitize all user inputs to prevent XSS attacks
5. THE System SHALL log all security-related actions (password change, 2FA toggle, session termination)
6. WHEN suspicious activity is detected, THE System SHALL temporarily lock account and send notification

### Requirement 15: التكامل مع الأنظمة الموجودة

**User Story:** كمطور، أريد أن تتكامل صفحة الإعدادات مع الأنظمة الموجودة، حتى تعمل المنصة بشكل متناسق.

#### Acceptance Criteria

1. THE Settings_Manager SHALL use existing Notification_Service for all notifications
2. THE Settings_Manager SHALL use existing OTP_Service for verification codes
3. THE Settings_Manager SHALL use existing authentication middleware for session management
4. THE System SHALL follow project color scheme: Primary #304B60, Secondary #E3DAD1, Accent #D4816180
5. THE System SHALL use project fonts: Amiri for Arabic, Cormorant Garamond for English
6. THE System SHALL support RTL/LTR based on selected language
