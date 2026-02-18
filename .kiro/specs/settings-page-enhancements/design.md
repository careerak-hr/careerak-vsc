# Design Document: Settings Page Enhancements

## Overview

تصميم شامل لتحسينات صفحة الإعدادات في منصة Careerak، يحول الصفحة إلى مركز متكامل لإدارة الحساب والخصوصية والأمان. التصميم يركز على:

- **تنظيم واضح**: 5 تبويبات رئيسية (Account, Privacy, Notifications, Security, Data & Privacy)
- **أمان محسّن**: 2FA، إدارة جلسات، سجل تسجيل دخول
- **امتثال GDPR**: تحميل البيانات، حذف الحساب مع فترة سماح
- **تجربة مستخدم ممتازة**: حفظ تلقائي، Undo، تأكيدات واضحة
- **تكامل سلس**: مع الأنظمة الموجودة (Notifications, OTP, Authentication)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Account  │ Privacy  │ Notif.   │ Security │   Data   │  │
│  │   Tab    │   Tab    │   Tab    │   Tab    │   Tab    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│         │           │          │          │          │       │
│         └───────────┴──────────┴──────────┴──────────┘       │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Express.js)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   Settings     │  │    Session      │  │  Data Export   │
│   Controller   │  │    Manager      │  │    Service     │
└───────┬────────┘  └────────┬────────┘  └───────┬────────┘
        │                    │                    │
        │           ┌────────▼────────┐           │
        │           │  Auth Middleware│           │
        │           └────────┬────────┘           │
        │                    │                    │
┌───────▼────────────────────▼────────────────────▼────────┐
│                      MongoDB Database                     │
│  ┌──────────┬──────────┬──────────┬──────────────────┐  │
│  │  Users   │ Sessions │ Settings │ DeletionRequests │  │
│  └──────────┴──────────┴──────────┴──────────────────┘  │
└───────────────────────────────────────────────────────────┘
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│ Notification   │  │   OTP Service   │  │ Email Service  │
│    Service     │  │                 │  │                │
└────────────────┘  └─────────────────┘  └────────────────┘
```

### Component Responsibilities

1. **Settings Controller**: معالجة جميع طلبات الإعدادات، التحقق من الصلاحيات
2. **Session Manager**: إدارة الجلسات النشطة، تسجيل الخروج، تتبع الأجهزة
3. **Data Export Service**: معالجة طلبات تصدير البيانات بشكل غير متزامن
4. **Account Deletion Handler**: معالجة طلبات حذف الحسابات مع فترة السماح
5. **Auth Middleware**: التحقق من JWT، التحقق من 2FA عند الحاجة
6. **Notification Service**: إرسال إشعارات للتغييرات الأمنية
7. **OTP Service**: إنشاء وإرسال رموز التحقق

## Components and Interfaces

### Frontend Components

#### 1. SettingsPage Component
```typescript
interface SettingsPageProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
}

interface SettingsPageState {
  activeTab: 'account' | 'privacy' | 'notifications' | 'security' | 'data';
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  undoStack: SettingsChange[];
}
```

#### 2. AccountTab Component
```typescript
interface AccountTabProps {
  user: User;
  onUpdateProfile: (data: ProfileUpdate) => Promise<void>;
  onChangeEmail: (newEmail: string) => Promise<void>;
  onChangePhone: (newPhone: string) => Promise<void>;
  onChangePassword: (oldPass: string, newPass: string) => Promise<void>;
}

interface ProfileUpdate {
  name?: string;
  photo?: File;
  language?: 'ar' | 'en' | 'fr';
  timezone?: string;
}
```

#### 3. PrivacyTab Component
```typescript
interface PrivacyTabProps {
  settings: PrivacySettings;
  onUpdate: (settings: Partial<PrivacySettings>) => Promise<void>;
}

interface PrivacySettings {
  profileVisibility: 'everyone' | 'registered' | 'none';
  showEmail: boolean;
  showPhone: boolean;
  messagePermissions: 'everyone' | 'contacts' | 'none';
  showOnlineStatus: boolean;
  allowSearchEngineIndexing: boolean;
}
```

#### 4. NotificationsTab Component
```typescript
interface NotificationsTabProps {
  preferences: NotificationPreferences;
  onUpdate: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

interface NotificationPreferences {
  jobNotifications: NotificationConfig;
  courseNotifications: NotificationConfig;
  chatNotifications: NotificationConfig;
  reviewNotifications: NotificationConfig;
  systemNotifications: NotificationConfig;
  quietHours: { start: string; end: string; enabled: boolean };
  frequency: 'immediate' | 'daily' | 'weekly';
}

interface NotificationConfig {
  enabled: boolean;
  inApp: boolean;
  email: boolean;
  push: boolean;
}
```

#### 5. SecurityTab Component
```typescript
interface SecurityTabProps {
  user: User;
  sessions: ActiveSession[];
  loginHistory: LoginAttempt[];
  onEnable2FA: () => Promise<{ qrCode: string; backupCodes: string[] }>;
  onDisable2FA: (otp: string) => Promise<void>;
  onLogoutSession: (sessionId: string) => Promise<void>;
  onLogoutAllOthers: () => Promise<void>;
}

interface ActiveSession {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  ipAddress: string;
  location: string;
  loginTime: Date;
  lastActivity: Date;
  isCurrent: boolean;
}

interface LoginAttempt {
  timestamp: Date;
  device: string;
  location: string;
  ipAddress: string;
  success: boolean;
}
```

#### 6. DataTab Component
```typescript
interface DataTabProps {
  onRequestDataExport: (options: ExportOptions) => Promise<void>;
  onDeleteAccount: (options: DeletionOptions) => Promise<void>;
  onCancelDeletion: () => Promise<void>;
  pendingDeletion?: PendingDeletion;
}

interface ExportOptions {
  dataTypes: ('profile' | 'activity' | 'messages' | 'applications' | 'courses')[];
  format: 'json' | 'csv' | 'pdf';
}

interface DeletionOptions {
  type: 'immediate' | 'scheduled';
  password: string;
  otp?: string;
}

interface PendingDeletion {
  scheduledDate: Date;
  daysRemaining: number;
}
```

### Backend API Endpoints

#### Settings Endpoints
```typescript
// Account Management
PUT    /api/settings/profile              // Update profile info
POST   /api/settings/email/change         // Initiate email change
POST   /api/settings/email/verify         // Verify email change
POST   /api/settings/phone/change         // Change phone number
POST   /api/settings/password/change      // Change password

// Privacy Settings
GET    /api/settings/privacy              // Get privacy settings
PUT    /api/settings/privacy              // Update privacy settings

// Notification Preferences
GET    /api/settings/notifications        // Get notification preferences
PUT    /api/settings/notifications        // Update notification preferences

// Security
POST   /api/settings/2fa/enable           // Enable 2FA
POST   /api/settings/2fa/disable          // Disable 2FA
GET    /api/settings/2fa/backup-codes     // Get backup codes
POST   /api/settings/2fa/regenerate-codes // Regenerate backup codes

// Session Management
GET    /api/settings/sessions             // Get all active sessions
DELETE /api/settings/sessions/:id         // Logout specific session
DELETE /api/settings/sessions/others      // Logout all other sessions
GET    /api/settings/login-history        // Get login history

// Data Export
POST   /api/settings/data/export          // Request data export
GET    /api/settings/data/export/:id      // Check export status
GET    /api/settings/data/download/:token // Download exported data

// Account Deletion
POST   /api/settings/account/delete       // Request account deletion
POST   /api/settings/account/cancel-deletion // Cancel deletion
GET    /api/settings/account/deletion-status  // Check deletion status
```

### Backend Services

#### SettingsService
```typescript
class SettingsService {
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<User>;
  async initiateEmailChange(userId: string, newEmail: string): Promise<void>;
  async verifyEmailChange(userId: string, oldOTP: string, newOTP: string, password: string): Promise<void>;
  async changePhone(userId: string, newPhone: string, otp: string): Promise<void>;
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<void>;
  async updateNotificationPreferences(userId: string, prefs: Partial<NotificationPreferences>): Promise<void>;
}
```

#### SessionService
```typescript
class SessionService {
  async getActiveSessions(userId: string): Promise<ActiveSession[]>;
  async logoutSession(userId: string, sessionId: string): Promise<void>;
  async logoutAllOtherSessions(userId: string, currentSessionId: string): Promise<void>;
  async getLoginHistory(userId: string, limit: number): Promise<LoginAttempt[]>;
  async logLoginAttempt(userId: string, device: string, location: string, ip: string, success: boolean): Promise<void>;
  async cleanupExpiredSessions(): Promise<void>;
}
```

#### TwoFactorService
```typescript
class TwoFactorService {
  async enable2FA(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }>;
  async verify2FASetup(userId: string, otp: string): Promise<void>;
  async disable2FA(userId: string, otp: string, password: string): Promise<void>;
  async verifyOTP(userId: string, otp: string): Promise<boolean>;
  async useBackupCode(userId: string, code: string): Promise<boolean>;
  async regenerateBackupCodes(userId: string): Promise<string[]>;
}
```

#### DataExportService
```typescript
class DataExportService {
  async requestExport(userId: string, options: ExportOptions): Promise<string>; // Returns request ID
  async processExport(requestId: string): Promise<void>; // Background job
  async getExportStatus(requestId: string): Promise<ExportStatus>;
  async generateDownloadToken(requestId: string): Promise<string>;
  async downloadExport(token: string): Promise<Buffer>;
  async cleanupExpiredExports(): Promise<void>;
}

interface ExportStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  expiresAt?: Date;
}
```

#### AccountDeletionService
```typescript
class AccountDeletionService {
  async requestDeletion(userId: string, options: DeletionOptions): Promise<void>;
  async cancelDeletion(userId: string): Promise<void>;
  async getDeletionStatus(userId: string): Promise<PendingDeletion | null>;
  async processScheduledDeletions(): Promise<void>; // Cron job
  async sendDeletionReminders(): Promise<void>; // Cron job (7 days before)
  async permanentlyDeleteAccount(userId: string): Promise<void>;
  async anonymizeRetainedData(userId: string): Promise<void>;
}
```

## Data Models

### UserSettings Model
```typescript
interface UserSettings {
  userId: ObjectId;
  
  // Privacy Settings
  privacy: {
    profileVisibility: 'everyone' | 'registered' | 'none';
    showEmail: boolean;
    showPhone: boolean;
    messagePermissions: 'everyone' | 'contacts' | 'none';
    showOnlineStatus: boolean;
    allowSearchEngineIndexing: boolean;
  };
  
  // Notification Preferences
  notifications: {
    job: NotificationConfig;
    course: NotificationConfig;
    chat: NotificationConfig;
    review: NotificationConfig;
    system: NotificationConfig;
    quietHours: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string;
    };
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  
  // Security Settings
  security: {
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    backupCodes?: string[]; // Hashed
    trustedDevices: string[]; // Device fingerprints
  };
  
  // Preferences
  preferences: {
    language: 'ar' | 'en' | 'fr';
    timezone: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
// userId: unique
// updatedAt: 1
```

### ActiveSession Model
```typescript
interface ActiveSession {
  _id: ObjectId;
  userId: ObjectId;
  token: string; // JWT token hash
  
  // Device Information
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    fingerprint: string;
  };
  
  // Location Information
  location: {
    ipAddress: string;
    country?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Timestamps
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  
  // Flags
  isTrusted: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
// userId: 1, expiresAt: 1
// token: unique
// expiresAt: 1 (TTL index)
```

### LoginHistory Model
```typescript
interface LoginHistory {
  _id: ObjectId;
  userId: ObjectId;
  
  // Attempt Information
  timestamp: Date;
  success: boolean;
  failureReason?: string;
  
  // Device Information
  device: {
    type: string;
    os: string;
    browser: string;
  };
  
  // Location Information
  location: {
    ipAddress: string;
    country?: string;
    city?: string;
  };
  
  createdAt: Date;
}

// Indexes
// userId: 1, timestamp: -1
// timestamp: 1 (TTL index - 90 days)
```

### DataExportRequest Model
```typescript
interface DataExportRequest {
  _id: ObjectId;
  userId: ObjectId;
  
  // Request Details
  dataTypes: string[];
  format: 'json' | 'csv' | 'pdf';
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  
  // Result
  fileUrl?: string;
  fileSize?: number;
  downloadToken?: string;
  downloadCount: number;
  
  // Timestamps
  requestedAt: Date;
  completedAt?: Date;
  expiresAt?: Date; // 7 days after completion
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
// userId: 1, requestedAt: -1
// downloadToken: unique, sparse
// expiresAt: 1 (TTL index)
```

### AccountDeletionRequest Model
```typescript
interface AccountDeletionRequest {
  _id: ObjectId;
  userId: ObjectId;
  
  // Deletion Details
  type: 'immediate' | 'scheduled';
  reason?: string;
  
  // Status
  status: 'pending' | 'cancelled' | 'completed';
  
  // Timestamps
  requestedAt: Date;
  scheduledDate?: Date; // 30 days after request
  completedAt?: Date;
  cancelledAt?: Date;
  
  // Reminders
  reminderSent: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
// userId: unique
// scheduledDate: 1
// status: 1, scheduledDate: 1
```

### EmailChangeRequest Model
```typescript
interface EmailChangeRequest {
  _id: ObjectId;
  userId: ObjectId;
  
  // Email Details
  oldEmail: string;
  newEmail: string;
  
  // Verification
  oldEmailOTP: string; // Hashed
  newEmailOTP: string; // Hashed
  oldEmailVerified: boolean;
  newEmailVerified: boolean;
  
  // Status
  status: 'pending' | 'completed' | 'expired';
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date; // 15 minutes
  completedAt?: Date;
}

// Indexes
// userId: 1
// expiresAt: 1 (TTL index)
```

### PhoneChangeRequest Model
```typescript
interface PhoneChangeRequest {
  _id: ObjectId;
  userId: ObjectId;
  
  // Phone Details
  oldPhone: string;
  newPhone: string;
  
  // Verification
  otp: string; // Hashed
  verified: boolean;
  
  // Status
  status: 'pending' | 'completed' | 'expired';
  
  // Timestamps
  createdAt: Date;
  expiresAt: Date; // 10 minutes
  completedAt?: Date;
}

// Indexes
// userId: 1
// expiresAt: 1 (TTL index)
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection Analysis

بعد مراجعة جميع الخصائص المحددة في prework، تم تحديد الخصائص التالية التي يمكن دمجها أو إزالتها لتجنب التكرار:

**خصائص مكررة تم دمجها:**
- خصائص التحقق من البريد/الهاتف المكرر (3.1, 4.1) → دمجها في خاصية واحدة للتحقق من التفرد
- خصائص إرسال الإشعارات (3.6, 4.4, 5.5, 9.5, 11.4, 12.10) → دمجها في خاصية عامة للإشعارات
- خصائص round-trip للإعدادات (2.2, 4.3, 6.7, 7.6) → دمجها في خاصية واحدة للحفظ والاسترجاع
- خصائص التحقق من الصحة (2.1, 2.3, 2.5, 5.2) → دمجها في خاصية عامة للتحقق من المدخلات

**خصائص تم الاحتفاظ بها كخصائص منفصلة:**
- خصائص الأمان (5.4, 8.4, 8.5, 14.1-14.6) - كل منها يختبر جانب أمان مختلف
- خصائص إدارة الجلسات (9.3, 9.4, 9.6) - كل منها يختبر سلوك مختلف
- خصائص حذف الحساب (12.5-12.9) - تسلسل معقد يحتاج خصائص منفصلة

### Core Properties

#### Property 1: Settings Round-Trip Consistency
*For any* user settings update (profile, privacy, notifications), saving then retrieving the settings should return equivalent values.

**Validates: Requirements 2.2, 4.3, 6.7, 7.6**

#### Property 2: Input Validation Rejection
*For any* invalid input (empty name, invalid email format, oversized image, weak password), the system should reject it and return a specific error message.

**Validates: Requirements 2.1, 2.3, 2.5, 5.2**

#### Property 3: Unique Identifier Enforcement
*For any* email or phone number that is already registered, attempting to change to that identifier should be rejected with a "already in use" error.

**Validates: Requirements 3.1, 4.1**

#### Property 4: Email Change Verification Flow
*For any* valid email change request, the system should require verification of both old and new emails plus password confirmation before updating.

**Validates: Requirements 3.2, 3.3, 3.4, 3.5**

#### Property 5: OTP Verification Requirement
*For any* phone change or 2FA operation, the system should require valid OTP verification before completing the action.

**Validates: Requirements 4.2, 4.3, 8.2**

#### Property 6: Password Change Session Invalidation
*For any* successful password change, all sessions except the current one should be invalidated immediately.

**Validates: Requirements 5.4**

#### Property 7: Security Action Notification
*For any* security-sensitive action (password change, email change, phone change, session termination, 2FA toggle, account deletion), the system should send a notification to the user.

**Validates: Requirements 3.6, 4.4, 5.5, 9.5, 11.4, 12.10**

#### Property 8: 2FA Enforcement
*For any* user with 2FA enabled, login attempts should require valid OTP after password verification.

**Validates: Requirements 8.4**

#### Property 9: 2FA Backup Codes Generation
*For any* 2FA activation, the system should generate exactly 10 unique backup codes.

**Validates: Requirements 8.3**

#### Property 10: 2FA Disable Protection
*For any* 2FA disable request, the system should require both current password and valid OTP.

**Validates: Requirements 8.5**

#### Property 11: Backup Code Acceptance
*For any* valid unused backup code, the system should accept it as alternative to OTP and mark it as used.

**Validates: Requirements 8.6**

#### Property 12: Session Termination
*For any* active session, terminating it should immediately invalidate the session token and prevent further API access.

**Validates: Requirements 9.3**

#### Property 13: Bulk Session Termination
*For any* user with multiple active sessions, "logout all others" should invalidate all sessions except the current one.

**Validates: Requirements 9.4**

#### Property 14: Session Auto-Expiration
*For any* session inactive for 30 days, the system should automatically expire and remove it.

**Validates: Requirements 9.6**

#### Property 15: Login Attempt Logging
*For any* login attempt (successful or failed), the system should log it with complete details (timestamp, device, location, IP, status).

**Validates: Requirements 10.1**

#### Property 16: Login History Retention
*For any* login history entry older than 90 days, the system should automatically remove it.

**Validates: Requirements 10.2**

#### Property 17: Quiet Hours Notification Queuing
*For any* notification generated during quiet hours, the system should queue it and send after quiet hours end.

**Validates: Requirements 7.5**

#### Property 18: Data Export Completeness
*For any* data export request, the exported data should include all selected data types with no missing records.

**Validates: Requirements 11.6**

#### Property 19: Data Export Link Expiration
*For any* completed data export, the download link should expire exactly 7 days after generation.

**Validates: Requirements 11.5**

#### Property 20: Data Export Time Limit
*For any* data export request, the system should complete processing within 48 hours.

**Validates: Requirements 11.7**

#### Property 21: Account Deletion Grace Period
*For any* scheduled account deletion, the system should allow cancellation during the 30-day grace period.

**Validates: Requirements 12.5, 12.6**

#### Property 22: Account Deletion Reminder
*For any* scheduled account deletion, the system should send a reminder notification exactly 7 days before the deletion date.

**Validates: Requirements 12.7**

#### Property 23: Complete Data Deletion
*For any* account deletion after grace period, the system should permanently delete all user data (profile, posts, messages, applications, reviews, sessions).

**Validates: Requirements 12.8**

#### Property 24: Legal Data Anonymization
*For any* account deletion, data that must be retained for legal reasons should be anonymized (remove all PII).

**Validates: Requirements 12.9**

#### Property 25: Auto-Save Timing
*For any* settings modification, the system should automatically save changes after exactly 2 seconds of inactivity.

**Validates: Requirements 13.1**

#### Property 26: Undo Stack Management
*For any* settings change, the system should maintain an undo stack of the last 5 changes for 30 seconds.

**Validates: Requirements 13.5**

#### Property 27: Sensitive Action Confirmation
*For any* sensitive action (delete account, logout all sessions, disable 2FA), the system should require explicit user confirmation before execution.

**Validates: Requirements 13.6**

#### Property 28: CSRF Protection
*For any* state-changing request, the system should validate CSRF token and reject requests with invalid or missing tokens.

**Validates: Requirements 14.1**

#### Property 29: Rate Limiting Enforcement
*For any* sensitive operation endpoint, the system should enforce a maximum of 10 requests per minute per user.

**Validates: Requirements 14.2**

#### Property 30: Dual Input Validation
*For any* user input, the system should validate it on both client-side and server-side with identical rules.

**Validates: Requirements 14.3**

#### Property 31: XSS Prevention
*For any* user input containing HTML/JavaScript, the system should sanitize it to prevent XSS attacks.

**Validates: Requirements 14.4**

#### Property 32: Security Action Logging
*For any* security-related action (password change, 2FA toggle, session termination, failed login), the system should create an audit log entry.

**Validates: Requirements 14.5**

#### Property 33: Suspicious Activity Account Lock
*For any* user with 5 failed login attempts within 15 minutes, the system should temporarily lock the account for 30 minutes.

**Validates: Requirements 14.6**

## Error Handling

### Client-Side Error Handling

1. **Network Errors**:
   - Display user-friendly message: "فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت."
   - Provide retry button
   - Cache unsaved changes locally

2. **Validation Errors**:
   - Display inline error messages next to invalid fields
   - Highlight invalid fields in red
   - Prevent form submission until all errors resolved

3. **Session Expiration**:
   - Detect expired JWT
   - Save current form state
   - Redirect to login with return URL
   - Restore form state after re-login

4. **Rate Limiting**:
   - Display message: "تم تجاوز الحد المسموح. يرجى المحاولة بعد {X} دقيقة."
   - Disable submit button temporarily
   - Show countdown timer

### Server-Side Error Handling

1. **Authentication Errors**:
   ```typescript
   - 401 Unauthorized: Invalid or expired token
   - 403 Forbidden: Insufficient permissions
   - 429 Too Many Requests: Rate limit exceeded
   ```

2. **Validation Errors**:
   ```typescript
   - 400 Bad Request: Invalid input data
   - 409 Conflict: Email/phone already in use
   - 422 Unprocessable Entity: Business logic violation
   ```

3. **Server Errors**:
   ```typescript
   - 500 Internal Server Error: Unexpected error
   - 503 Service Unavailable: Database connection failed
   ```

4. **Error Response Format**:
   ```typescript
   {
     success: false,
     error: {
       code: 'EMAIL_ALREADY_EXISTS',
       message: 'البريد الإلكتروني مستخدم بالفعل',
       field: 'email',
       details?: any
     }
   }
   ```

### Error Recovery Strategies

1. **Automatic Retry**:
   - Retry failed requests up to 3 times with exponential backoff
   - Only for idempotent operations (GET, PUT with same data)

2. **Graceful Degradation**:
   - If session list fails to load, show cached data with warning
   - If notification preferences fail, use default settings

3. **Transaction Rollback**:
   - Email change: Rollback if any step fails
   - Account deletion: Rollback if deletion incomplete

4. **User Notification**:
   - Always inform user of errors
   - Provide actionable next steps
   - Log errors for debugging

## Testing Strategy

### Dual Testing Approach

تطبيق استراتيجية اختبار مزدوجة تجمع بين:

1. **Unit Tests**: للحالات المحددة، الحالات الحدية، وشروط الخطأ
2. **Property-Based Tests**: للخصائص العامة عبر جميع المدخلات

كلا النوعين ضروري ومكمل للآخر:
- Unit tests تكتشف أخطاء محددة وتوثق السلوك المتوقع
- Property tests تتحقق من الصحة العامة عبر آلاف المدخلات العشوائية

### Property-Based Testing Configuration

**المكتبة المستخدمة**: fast-check (للـ TypeScript/JavaScript)

**الإعدادات**:
- عدد التكرارات: 100 كحد أدنى لكل property test
- Seed: عشوائي (مع تسجيل seed للإعادة)
- Shrinking: مفعّل لإيجاد أصغر مثال فاشل

**تنسيق Tags**:
```typescript
// Feature: settings-page-enhancements, Property 1: Settings Round-Trip Consistency
test('settings round-trip consistency', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        name: fc.string(),
        language: fc.constantFrom('ar', 'en', 'fr'),
        timezone: fc.string()
      }),
      async (settings) => {
        // Test implementation
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**الحالات المحددة للاختبار**:

1. **Account Tab**:
   - تحديث الاسم بنجاح
   - رفض اسم فارغ
   - تحديث الصورة بنجاح
   - رفض صورة كبيرة (> 5MB)
   - رفض صيغة صورة غير مدعومة

2. **Email Change**:
   - تدفق تغيير البريد الكامل
   - رفض بريد مكرر
   - انتهاء صلاحية OTP بعد 15 دقيقة
   - رفض OTP خاطئ

3. **Password Change**:
   - تغيير كلمة المرور بنجاح
   - رفض كلمة مرور ضعيفة
   - رفض كلمة مرور حالية خاطئة
   - إنهاء الجلسات الأخرى

4. **2FA**:
   - تفعيل 2FA بنجاح
   - إنشاء 10 أكواد احتياطية
   - قبول كود احتياطي صالح
   - رفض كود احتياطي مستخدم
   - تعطيل 2FA بنجاح

5. **Session Management**:
   - عرض جميع الجلسات النشطة
   - تسجيل خروج من جلسة محددة
   - تسجيل خروج من جميع الجلسات الأخرى
   - انتهاء صلاحية جلسة بعد 30 يوم

6. **Data Export**:
   - طلب تصدير بيانات
   - معالجة غير متزامنة
   - إنشاء رابط تحميل
   - انتهاء صلاحية رابط بعد 7 أيام

7. **Account Deletion**:
   - طلب حذف مؤجل
   - إلغاء الحذف خلال فترة السماح
   - إرسال تذكير قبل 7 أيام
   - حذف نهائي بعد 30 يوم

### Integration Testing

**السيناريوهات الشاملة**:

1. **تدفق تغيير البريد الكامل**:
   - طلب تغيير → OTP للقديم → OTP للجديد → تأكيد كلمة المرور → تحديث → إشعار

2. **تدفق تفعيل 2FA**:
   - طلب تفعيل → QR code → تأكيد OTP → أكواد احتياطية → تسجيل دخول مع 2FA

3. **تدفق حذف الحساب**:
   - طلب حذف → تأكيد → فترة سماح → تذكير → حذف نهائي

### Security Testing

**اختبارات الأمان**:

1. **CSRF Protection**: محاولة طلبات بدون CSRF token
2. **Rate Limiting**: إرسال أكثر من 10 طلبات في دقيقة
3. **XSS Prevention**: إدخال نصوص JavaScript في الحقول
4. **SQL Injection**: إدخال استعلامات SQL في الحقول
5. **Session Hijacking**: محاولة استخدام token منتهي الصلاحية
6. **Brute Force**: محاولات تسجيل دخول متكررة

### Performance Testing

**معايير الأداء**:

1. **Response Time**:
   - GET requests: < 200ms
   - POST/PUT requests: < 500ms
   - Data export: < 48 hours

2. **Concurrent Users**:
   - دعم 1000 مستخدم متزامن
   - لا تدهور في الأداء

3. **Database Queries**:
   - استخدام indexes محسّنة
   - تجنب N+1 queries
   - Connection pooling

### Test Coverage Goals

- **Unit Tests**: > 80% code coverage
- **Property Tests**: جميع الـ 33 خاصية
- **Integration Tests**: جميع التدفقات الرئيسية
- **Security Tests**: جميع نقاط الضعف المعروفة

### Continuous Testing

**التكامل المستمر**:
- تشغيل جميع الاختبارات على كل commit
- Property tests على كل pull request
- Security tests أسبوعياً
- Performance tests شهرياً
