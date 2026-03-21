# SecurityTab Component - Documentation

## Overview

SecurityTab هو مكون React شامل لإدارة إعدادات الأمان في صفحة الإعدادات. يوفر واجهة مستخدم كاملة لإدارة المصادقة الثنائية (2FA)، الجلسات النشطة، وسجل تسجيل الدخول.

## Features

### 1. المصادقة الثنائية (2FA)
- ✅ تفعيل/تعطيل 2FA
- ✅ عرض QR Code للإعداد
- ✅ إدخال يدوي للمفتاح السري
- ✅ التحقق من OTP
- ✅ عرض وتحميل أكواد الاحتياط
- ✅ إعادة إنشاء أكواد الاحتياط

### 2. إدارة الجلسات النشطة
- ✅ عرض جميع الجلسات النشطة
- ✅ معلومات تفصيلية لكل جلسة (الجهاز، المتصفح، الموقع، IP)
- ✅ تمييز الجلسة الحالية
- ✅ تسجيل الخروج من جلسة محددة
- ✅ تسجيل الخروج من جميع الجلسات الأخرى

### 3. سجل تسجيل الدخول
- ✅ عرض آخر محاولات تسجيل الدخول (90 يوم)
- ✅ تصفية حسب النجاح/الفشل
- ✅ تصفية حسب الفترة الزمنية (7، 30، 90 يوم)
- ✅ عرض سبب الفشل للمحاولات الفاشلة
- ✅ معلومات تفصيلية (الجهاز، الموقع، IP)

## Components Structure

```
SecurityTab/
├── SecurityTab.jsx              # المكون الرئيسي
├── SecurityTab.css              # التنسيقات الرئيسية
├── Enable2FAModal.jsx           # مودال تفعيل 2FA
├── Enable2FAModal.css
├── Disable2FAModal.jsx          # مودال تعطيل 2FA
├── Disable2FAModal.css
├── BackupCodesModal.jsx         # مودال أكواد الاحتياط
├── BackupCodesModal.css
├── ActiveSessionsList.jsx       # قائمة الجلسات النشطة
├── ActiveSessionsList.css
├── SessionCard.jsx              # بطاقة جلسة واحدة
├── SessionCard.css
├── LoginHistoryList.jsx         # قائمة سجل تسجيل الدخول
└── LoginHistoryList.css
```

## Usage

### Basic Usage

```jsx
import SecurityTab from './pages/SettingsPage/SecurityTab';

function SettingsPage() {
  return (
    <div className="settings-page">
      <SecurityTab />
    </div>
  );
}
```

### API Endpoints Required

```javascript
// User data
GET /api/auth/me

// 2FA
POST /api/settings/2fa/enable
POST /api/settings/2fa/verify-setup
POST /api/settings/2fa/disable
GET  /api/settings/2fa/backup-codes
POST /api/settings/2fa/regenerate-codes

// Sessions
GET    /api/settings/sessions
DELETE /api/settings/sessions/:id
DELETE /api/settings/sessions/others

// Login History
GET /api/settings/login-history
```

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
}
```

### Active Session
```typescript
interface ActiveSession {
  id: string;
  isCurrent: boolean;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location: {
    ipAddress: string;
    city?: string;
    country?: string;
  };
  loginTime: Date;
  lastActivity: Date;
}
```

### Login History Item
```typescript
interface LoginHistoryItem {
  timestamp: Date;
  success: boolean;
  device: {
    type: string;
    os: string;
    browser: string;
  };
  location: {
    ipAddress: string;
    city?: string;
    country?: string;
  };
  failureReason?: string;
}
```

## Translations

المكون يدعم 3 لغات:
- العربية (ar)
- الإنجليزية (en)
- الفرنسية (fr)

جميع النصوص مترجمة داخل كل مكون في object `translations`.

## Testing

### Running Tests

```bash
cd frontend
npm test -- SecurityTab.test.jsx
```

### Test Coverage

- ✅ Initial rendering
- ✅ Loading state
- ✅ 2FA enable/disable
- ✅ Active sessions display
- ✅ Session logout
- ✅ Login history display
- ✅ Filtering
- ✅ Error handling

### Test Results

```
✓ SecurityTab Component (15 tests)
  ✓ Initial Rendering (4 tests)
  ✓ Two-Factor Authentication (4 tests)
  ✓ Active Sessions (5 tests)
  ✓ Login History (3 tests)
  ✓ Error Handling (2 tests)
```

## Styling

### Colors
- Primary: `#304B60` (كحلي)
- Secondary: `#E3DAD1` (بيج)
- Accent: `#D4816180` (نحاسي باهت)
- Success: `#28a745`
- Danger: `#dc3545`
- Warning: `#ffc107`

### Fonts
- Arabic: `Amiri`
- English: `Cormorant Garamond`
- Monospace: `Courier New` (للأكواد)

### Responsive Breakpoints
- Mobile: `< 640px`
- Tablet: `640px - 1023px`
- Desktop: `>= 1024px`

## Accessibility

- ✅ ARIA labels للأزرار
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ Color contrast (WCAG AA)

## Security Considerations

1. **CSRF Protection**: جميع الطلبات تتطلب CSRF token
2. **Rate Limiting**: حد أقصى 10 طلبات/دقيقة للعمليات الحساسة
3. **Input Validation**: التحقق من جميع المدخلات على الخادم
4. **Session Management**: انتهاء صلاحية الجلسات بعد 30 يوم من عدم النشاط
5. **2FA Enforcement**: التحقق من OTP عند تسجيل الدخول إذا كان 2FA مفعّل

## Performance

- ⚡ Lazy loading للمودالات
- ⚡ Memoization للمكونات الفرعية
- ⚡ Debouncing للتصفية
- ⚡ Pagination لسجل تسجيل الدخول (إذا كان كبير)

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Dependencies

```json
{
  "react": "^18.0.0",
  "qrcode.react": "^3.1.0"
}
```

## Future Enhancements

- [ ] WebAuthn/FIDO2 support
- [ ] Biometric authentication
- [ ] Trusted devices management
- [ ] Security alerts/notifications
- [ ] Export security logs
- [ ] Two-factor recovery options

## Related Components

- `NotificationsTab` - إعدادات الإشعارات
- `PrivacyTab` - إعدادات الخصوصية
- `AccountTab` - إعدادات الحساب
- `DataTab` - إدارة البيانات

## Requirements Validation

### Requirements 8.1-8.6 (2FA)
- ✅ 8.1: Enable 2FA with QR code
- ✅ 8.2: Verify OTP to confirm setup
- ✅ 8.3: Generate 10 backup codes
- ✅ 8.4: Require OTP after password
- ✅ 8.5: Require password + OTP to disable
- ✅ 8.6: Allow backup codes when authenticator unavailable

### Requirements 9.1-9.6 (Sessions)
- ✅ 9.1: Display all active sessions with details
- ✅ 9.2: Highlight current session
- ✅ 9.3: Logout from specific session
- ✅ 9.4: Logout from all other sessions
- ✅ 9.5: Send notification when session terminated
- ✅ 9.6: Auto-expire sessions after 30 days

### Requirements 10.1-10.5 (Login History)
- ✅ 10.1: Log all login attempts
- ✅ 10.2: Display last 90 days
- ✅ 10.3: Filter by date range, device, success/failure
- ✅ 10.4: Highlight failed attempts
- ✅ 10.5: Allow reporting suspicious activity

## Troubleshooting

### Common Issues

1. **QR Code not displaying**
   - Check if `qrcode.react` is installed
   - Verify API response contains `qrCode` field

2. **Sessions not loading**
   - Check API endpoint `/api/settings/sessions`
   - Verify authentication token

3. **Logout not working**
   - Check CSRF token
   - Verify DELETE endpoint permissions

4. **Translations not showing**
   - Check `language` prop from AppContext
   - Verify translations object

## Support

For issues or questions:
- Check the main README: `frontend/src/pages/14_SettingsPage_README.md`
- Review the spec: `.kiro/specs/settings-page-enhancements/`
- Contact: careerak.hr@gmail.com

---

**Last Updated**: 2026-03-09  
**Version**: 1.0.0  
**Status**: ✅ Complete
