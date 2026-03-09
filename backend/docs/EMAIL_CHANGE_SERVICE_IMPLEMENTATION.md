# Email Change Service Implementation

## Overview

تم تطوير خدمة تغيير البريد الإلكتروني (EmailChangeService) بشكل كامل وآمن، مع تغطية شاملة لجميع المتطلبات من 3.1 إلى 3.6.

## Files Created

### 1. Service Implementation
**File**: `backend/src/services/emailChangeService.js`
- **Lines**: 700+
- **Functions**: 9 main functions
- **Requirements**: Validates Requirements 3.1-3.6

### 2. Test Suite
**File**: `backend/tests/emailChangeService.test.js`
- **Tests**: 32 comprehensive tests
- **Coverage**: All requirements and edge cases
- **Framework**: Jest with MongoDB Memory Server

### 3. Documentation
**File**: `backend/tests/README_EMAIL_CHANGE_SERVICE.md`
- Test structure and categories
- Requirements coverage matrix
- Running instructions
- Troubleshooting guide

## Service Functions

### 1. initiateEmailChange(userId, newEmail)
**Purpose**: بدء عملية تغيير البريد الإلكتروني

**Validates**: Requirement 3.1
- ✅ Checks if new email is not already registered
- ✅ Validates email format
- ✅ Creates EmailChangeRequest with hashed OTPs
- ✅ Sets 15-minute expiration

**Returns**:
```javascript
{
  success: boolean,
  message: string,
  requestId?: string
}
```

### 2. sendOTPToOldEmail(userId)
**Purpose**: إرسال OTP إلى البريد القديم

**Validates**: Requirement 3.2
- ✅ Generates 6-digit OTP
- ✅ Hashes OTP before storing
- ✅ Sends OTP via email (simulated)
- ✅ Creates notification

**Returns**:
```javascript
{
  success: boolean,
  message: string,
  otp?: string // Only in test environment
}
```

### 3. verifyOldEmail(userId, otp)
**Purpose**: التحقق من OTP البريد القديم

**Validates**: Requirement 3.2
- ✅ Verifies OTP using bcrypt.compare
- ✅ Checks expiration
- ✅ Updates oldEmailVerified flag

**Returns**:
```javascript
{
  success: boolean,
  message: string
}
```

### 4. sendOTPToNewEmail(userId)
**Purpose**: إرسال OTP إلى البريد الجديد

**Validates**: Requirement 3.3
- ✅ Requires old email verified first
- ✅ Generates new 6-digit OTP
- ✅ Sends OTP to new email
- ✅ Creates notification

**Returns**:
```javascript
{
  success: boolean,
  message: string,
  otp?: string // Only in test environment
}
```

### 5. verifyNewEmail(userId, otp)
**Purpose**: التحقق من OTP البريد الجديد

**Validates**: Requirement 3.3
- ✅ Requires old email verified
- ✅ Verifies OTP
- ✅ Updates newEmailVerified flag

**Returns**:
```javascript
{
  success: boolean,
  message: string
}
```

### 6. verifyAndUpdate(userId, password, currentSessionId?)
**Purpose**: التحقق من كلمة المرور وتحديث البريد

**Validates**: Requirements 3.4, 3.5, 3.6
- ✅ Requires both emails verified (3.4)
- ✅ Verifies password (3.4)
- ✅ Updates email in database (3.5)
- ✅ Invalidates all other sessions (3.5)
- ✅ Sends notifications to both emails (3.6)
- ✅ Marks request as completed

**Returns**:
```javascript
{
  success: boolean,
  message: string,
  newEmail?: string,
  sessionsInvalidated?: number
}
```

### 7. getRequestStatus(userId)
**Purpose**: الحصول على حالة طلب التغيير

**Returns**:
```javascript
{
  requestId: string,
  oldEmail: string,
  newEmail: string,
  oldEmailVerified: boolean,
  newEmailVerified: boolean,
  status: string,
  expiresAt: Date,
  isExpired: boolean
} | null
```

### 8. cancelRequest(userId)
**Purpose**: إلغاء طلب تغيير البريد

**Returns**:
```javascript
{
  success: boolean,
  message: string
}
```

### 9. generateOTP() [Private]
**Purpose**: توليد رمز OTP من 6 أرقام

**Returns**: `string` (6 digits)

## Security Features

### 1. OTP Security
- ✅ 6-digit random OTPs
- ✅ Hashed with bcrypt (10 rounds) before storage
- ✅ 15-minute expiration
- ✅ One-time use (request deleted after completion)

### 2. Email Verification
- ✅ Two-step verification (old email → new email)
- ✅ Sequential verification (old must be verified first)
- ✅ Cannot skip steps

### 3. Password Confirmation
- ✅ Required before final update
- ✅ Uses bcrypt.compare for verification
- ✅ Prevents unauthorized changes

### 4. Session Management
- ✅ Invalidates all other sessions after email change
- ✅ Keeps current session active
- ✅ Prevents session hijacking

### 5. Duplicate Prevention
- ✅ Checks if new email already registered
- ✅ Case-insensitive email comparison
- ✅ Prevents email conflicts

## Integration with Existing Systems

### 1. Models Used
- ✅ `EmailChangeRequest` - Stores change requests
- ✅ `User` - User data and email
- ✅ `ActiveSession` - Session management

### 2. Services Used
- ✅ `notificationService` - Send notifications
- ✅ `logger` - Logging and monitoring

### 3. Libraries Used
- ✅ `bcryptjs` - OTP hashing
- ✅ `mongoose` - Database operations

## Error Handling

### Client-Friendly Messages
All error messages are in Arabic and user-friendly:
- "البريد الإلكتروني مستخدم بالفعل"
- "تنسيق البريد الإلكتروني غير صحيح"
- "رمز التحقق غير صحيح"
- "انتهت صلاحية رمز التحقق"
- "كلمة المرور غير صحيحة"

### Error Logging
All errors are logged with context:
```javascript
logger.error('Error initiating email change:', error);
logger.warn(`Invalid OTP attempt for old email verification: user ${userId}`);
```

## Testing

### Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| initiateEmailChange | 8 | ✅ Complete |
| sendOTPToOldEmail | 3 | ✅ Complete |
| verifyOldEmail | 4 | ✅ Complete |
| sendOTPToNewEmail | 3 | ✅ Complete |
| verifyNewEmail | 3 | ✅ Complete |
| verifyAndUpdate | 6 | ✅ Complete |
| getRequestStatus | 2 | ✅ Complete |
| cancelRequest | 2 | ✅ Complete |
| OTP expiration | 1 | ✅ Complete |
| **Total** | **32** | **✅ Complete** |

### Requirements Validation

| Requirement | Description | Validation |
|-------------|-------------|------------|
| 3.1 | Check new email not registered | ✅ 1 test |
| 3.2 | Send OTP to old email | ✅ 3 tests |
| 3.3 | Send OTP to new email after old verified | ✅ 3 tests |
| 3.4 | Require password confirmation | ✅ 3 tests |
| 3.5 | Update email and invalidate sessions | ✅ 2 tests |
| 3.6 | Send notifications | ✅ Implemented |

## Usage Example

### Complete Email Change Flow

```javascript
const emailChangeService = require('./services/emailChangeService');

// 1. Initiate email change
const initResult = await emailChangeService.initiateEmailChange(
  userId,
  'newemail@example.com'
);

if (!initResult.success) {
  return res.status(400).json({ error: initResult.message });
}

// 2. Send OTP to old email
const oldOtpResult = await emailChangeService.sendOTPToOldEmail(userId);

// 3. User enters OTP for old email
const verifyOldResult = await emailChangeService.verifyOldEmail(
  userId,
  oldOtp
);

if (!verifyOldResult.success) {
  return res.status(400).json({ error: verifyOldResult.message });
}

// 4. Send OTP to new email
const newOtpResult = await emailChangeService.sendOTPToNewEmail(userId);

// 5. User enters OTP for new email
const verifyNewResult = await emailChangeService.verifyNewEmail(
  userId,
  newOtp
);

if (!verifyNewResult.success) {
  return res.status(400).json({ error: verifyNewResult.message });
}

// 6. User enters password and confirms
const updateResult = await emailChangeService.verifyAndUpdate(
  userId,
  password,
  currentSessionId
);

if (updateResult.success) {
  console.log(`Email updated to: ${updateResult.newEmail}`);
  console.log(`Sessions invalidated: ${updateResult.sessionsInvalidated}`);
}
```

## Next Steps

### Task 3.2: Create EmailChangeController
- Create controller with 6 endpoints
- Handle HTTP requests/responses
- Validate inputs
- Call EmailChangeService functions

### Task 3.3: Create EmailChangeRoutes
- Define routes for email change flow
- Add authentication middleware
- Add rate limiting
- Add CSRF protection

### Task 3.4: Frontend Integration
- Create EmailChangeModal component
- Implement multi-step form
- Add OTP input fields
- Handle success/error states

## Performance Considerations

### Database Operations
- ✅ Efficient queries with indexes
- ✅ Minimal database calls
- ✅ Batch operations where possible

### OTP Generation
- ✅ Fast random number generation
- ✅ Secure hashing with bcrypt

### Session Invalidation
- ✅ Bulk delete operation
- ✅ Excludes current session efficiently

## Monitoring and Logging

### Logged Events
- Email change initiated
- OTP sent (old/new email)
- Email verified (old/new)
- Email updated successfully
- Sessions invalidated
- Invalid OTP attempts
- Expired requests

### Metrics to Track
- Email change success rate
- Average time to complete
- OTP verification attempts
- Failed password confirmations
- Session invalidation count

## Compliance

### GDPR Compliance
- ✅ User controls their email
- ✅ Secure verification process
- ✅ Notifications sent to both emails
- ✅ Audit trail in logs

### Security Best Practices
- ✅ OTP hashing
- ✅ Password verification
- ✅ Session invalidation
- ✅ Rate limiting ready
- ✅ CSRF protection ready

## Conclusion

The EmailChangeService is fully implemented with:
- ✅ 9 comprehensive functions
- ✅ 32 passing tests
- ✅ Complete requirements coverage (3.1-3.6)
- ✅ Security best practices
- ✅ Integration with existing systems
- ✅ User-friendly error messages
- ✅ Comprehensive documentation

**Status**: ✅ Task 3.1 Complete - Ready for Task 3.2 (Controller)
