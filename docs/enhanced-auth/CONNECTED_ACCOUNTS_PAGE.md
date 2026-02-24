# Connected Accounts Page - Comprehensive Documentation

## 📋 Overview

The Connected Accounts Page allows users to view and manage their linked OAuth accounts (Google, Facebook, LinkedIn). Users can see when each account was connected, when it was last used, and unlink accounts they no longer want to use.

**Created**: 2026-02-23  
**Status**: ✅ Complete  
**Requirements**: 1.6

---

## 🎯 Features

### Core Features
- ✅ Display all connected OAuth accounts
- ✅ Provider icons and colors (Google, Facebook, LinkedIn)
- ✅ Connection date and last used date
- ✅ Unlink button with confirmation modal
- ✅ Loading, error, and empty states
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ RTL/LTR support (Arabic, English, French)
- ✅ Dark mode support
- ✅ Accessibility features

### User Experience
- **Visual Feedback**: Hover effects, animations, loading spinners
- **Confirmation**: Modal before unlinking to prevent accidents
- **Error Handling**: Clear error messages with retry option
- **Empty State**: Helpful message when no accounts are connected
- **Back Navigation**: Easy return to profile page

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── ConnectedAccountsPage.jsx      # Main page component
│   │   └── ConnectedAccountsPage.css      # Page styles
│   ├── components/
│   │   └── auth/
│   │       ├── ConnectedAccountCard.jsx   # Account card component
│   │       └── ConnectedAccountCard.css   # Card styles
│   └── examples/
│       └── ConnectedAccountsExample.jsx   # Usage examples

docs/
└── enhanced-auth/
    ├── CONNECTED_ACCOUNTS_PAGE.md         # This file
    └── CONNECTED_ACCOUNTS_QUICK_START.md  # Quick start guide
```

---

## 🔌 API Integration

### Backend Endpoints

#### 1. Get Connected Accounts
```
GET /auth/oauth/accounts
Authorization: Bearer <token>
```

**Response (Success)**:
```json
{
  "success": true,
  "accounts": [
    {
      "_id": "65abc123...",
      "userId": "65def456...",
      "provider": "google",
      "providerId": "1234567890",
      "email": "user@gmail.com",
      "displayName": "John Doe",
      "profilePicture": "https://...",
      "connectedAt": "2026-01-15T10:30:00Z",
      "lastUsed": "2026-02-20T14:45:00Z"
    },
    {
      "_id": "65abc789...",
      "userId": "65def456...",
      "provider": "facebook",
      "providerId": "9876543210",
      "email": "user@facebook.com",
      "displayName": "John Doe",
      "profilePicture": "https://...",
      "connectedAt": "2026-02-01T08:20:00Z",
      "lastUsed": "2026-02-18T16:30:00Z"
    }
  ]
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "فشل في جلب الحسابات المرتبطة"
}
```

#### 2. Unlink Account
```
DELETE /auth/oauth/:provider
Authorization: Bearer <token>
```

**Parameters**:
- `provider`: `google`, `facebook`, or `linkedin`

**Response (Success)**:
```json
{
  "success": true,
  "message": "تم فك ربط حساب google بنجاح"
}
```

**Response (Error - No Other Login Method)**:
```json
{
  "success": false,
  "error": "لا يمكن فك الربط. يجب أن يكون لديك طريقة دخول أخرى (كلمة مرور أو حساب آخر)"
}
```

**Response (Error - Invalid Provider)**:
```json
{
  "success": false,
  "error": "مزود الخدمة غير صحيح"
}
```

---

## 🎨 Component API

### ConnectedAccountsPage

**Props**: None (uses AuthContext for language and user)

**Usage**:
```jsx
import ConnectedAccountsPage from './pages/ConnectedAccountsPage';

function App() {
  return <ConnectedAccountsPage />;
}
```

**Features**:
- Fetches accounts automatically on mount
- Handles loading, error, and empty states
- Shows confirmation modal before unlinking
- Responsive and accessible

---

### ConnectedAccountCard

**Props**:
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `account` | Object | Yes | - | Account data from API |
| `onUnlink` | Function | Yes | - | Callback when unlink is clicked |
| `language` | String | No | `'ar'` | Language code (`ar`, `en`, `fr`) |

**Account Object Structure**:
```typescript
{
  _id: string;
  provider: 'google' | 'facebook' | 'linkedin';
  email: string;
  connectedAt: string; // ISO date
  lastUsed: string | null; // ISO date or null
}
```

**Usage**:
```jsx
import ConnectedAccountCard from './components/auth/ConnectedAccountCard';

function MyComponent() {
  const account = {
    _id: '123',
    provider: 'google',
    email: 'user@gmail.com',
    connectedAt: '2026-01-15T10:30:00Z',
    lastUsed: '2026-02-20T14:45:00Z'
  };
  
  const handleUnlink = (account) => {
    console.log('Unlink:', account);
  };
  
  return (
    <ConnectedAccountCard
      account={account}
      onUnlink={handleUnlink}
      language="ar"
    />
  );
}
```

---

## 🌍 Internationalization

### Supported Languages
- **Arabic (ar)**: RTL layout, Arabic text
- **English (en)**: LTR layout, English text
- **French (fr)**: LTR layout, French text

### Translation Keys

**ConnectedAccountsPage**:
```javascript
{
  title: 'الحسابات المتصلة',
  subtitle: 'إدارة حساباتك المرتبطة من مواقع التواصل الاجتماعي',
  noAccounts: 'لا توجد حسابات متصلة',
  noAccountsDesc: 'يمكنك ربط حساباتك من Google أو Facebook أو LinkedIn لتسهيل تسجيل الدخول',
  loading: 'جاري التحميل...',
  error: 'حدث خطأ أثناء تحميل الحسابات',
  tryAgain: 'حاول مرة أخرى',
  backToProfile: 'العودة للملف الشخصي',
  unlinkConfirmTitle: 'تأكيد فك الربط',
  unlinkConfirmMessage: 'هل أنت متأكد من فك ربط حساب {provider}؟',
  unlinkSuccess: 'تم فك ربط الحساب بنجاح',
  unlinkError: 'فشل في فك ربط الحساب',
  cancel: 'إلغاء',
  confirm: 'تأكيد'
}
```

**ConnectedAccountCard**:
```javascript
{
  connectedOn: 'متصل منذ',
  lastUsed: 'آخر استخدام',
  unlink: 'فك الربط',
  never: 'لم يستخدم بعد'
}
```

---

## 🎨 Styling

### Color Palette
- **Primary**: `#304B60` (Careerak blue)
- **Secondary**: `#E3DAD1` (Careerak beige)
- **Accent**: `#D48161` (Careerak copper)
- **Error**: `#ef4444` (Red for unlink button)

### Provider Colors
- **Google**: `#4285F4`
- **Facebook**: `#1877F2`
- **LinkedIn**: `#0A66C2`

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 480px) { ... }

/* Tablet */
@media (max-width: 768px) { ... }

/* Desktop */
@media (min-width: 769px) { ... }
```

### Dark Mode
The components support dark mode via `prefers-color-scheme: dark`:
```css
@media (prefers-color-scheme: dark) {
  .connected-accounts-page {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }
  /* ... */
}
```

---

## ♿ Accessibility

### Features
- ✅ Semantic HTML (`<button>`, `<h1>`, `<p>`)
- ✅ ARIA labels for buttons
- ✅ Focus visible styles (`:focus-visible`)
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Color contrast (WCAG AA compliant)

### Focus Styles
```css
.back-button:focus-visible,
.retry-button:focus-visible,
.unlink-button:focus-visible {
  outline: 3px solid #D48161;
  outline-offset: 2px;
}
```

### ARIA Labels
```jsx
<button 
  aria-label={t.backToProfile}
  onClick={...}
>
  {/* Icon */}
</button>

<button 
  aria-label={`${t.unlink} ${providerName}`}
  onClick={...}
>
  {/* Icon + Text */}
</button>
```

---

## 📱 Responsive Design

### Mobile (< 480px)
- Single column layout
- Full-width cards
- Stacked detail rows
- Full-width unlink button
- Smaller fonts and icons

### Tablet (480px - 768px)
- Single column layout
- Cards with padding
- Horizontal detail rows
- Standard fonts

### Desktop (> 768px)
- Grid layout (auto-fill, minmax(320px, 1fr))
- Multiple cards per row
- Hover effects
- Standard spacing

---

## 🔒 Security

### Authentication
- All API calls require JWT token in `Authorization` header
- Token stored in `localStorage` as `authToken`

### Validation
- Provider validation on backend (only `google`, `facebook`, `linkedin`)
- Check for other login methods before unlinking
- Confirmation modal to prevent accidental unlinking

### Error Handling
- Clear error messages
- Retry option for failed requests
- Graceful degradation

---

## 🧪 Testing

### Manual Testing Checklist

**Functionality**:
- [ ] Page loads and fetches accounts
- [ ] Accounts display correctly
- [ ] Unlink button shows confirmation modal
- [ ] Unlink succeeds and removes account from list
- [ ] Unlink fails with error message (no other login method)
- [ ] Back button navigates to profile
- [ ] Retry button refetches accounts

**UI/UX**:
- [ ] Loading spinner shows while fetching
- [ ] Error state shows on fetch failure
- [ ] Empty state shows when no accounts
- [ ] Cards have hover effects
- [ ] Animations are smooth
- [ ] Responsive on mobile, tablet, desktop

**Internationalization**:
- [ ] Arabic (RTL) works correctly
- [ ] English (LTR) works correctly
- [ ] French (LTR) works correctly
- [ ] Dates format correctly per language

**Accessibility**:
- [ ] Keyboard navigation works
- [ ] Focus styles are visible
- [ ] Screen reader announces content
- [ ] Color contrast is sufficient

---

## 🐛 Troubleshooting

### Issue: Accounts not loading
**Symptoms**: Loading spinner forever, or error message  
**Causes**:
- Backend not running
- Invalid auth token
- CORS issues

**Solutions**:
1. Check backend is running: `npm start` in `backend/`
2. Check auth token in localStorage: `localStorage.getItem('authToken')`
3. Check CORS settings in backend
4. Check API URL in `.env`: `VITE_API_URL`

### Issue: Unlink fails
**Symptoms**: Error message "لا يمكن فك الربط..."  
**Causes**:
- User has no other login method (no password, no other OAuth accounts)

**Solutions**:
1. Add a password to the account first
2. Link another OAuth account first
3. Inform user they need another login method

### Issue: Dates not formatting
**Symptoms**: Dates show as ISO strings  
**Causes**:
- Invalid date string
- Browser doesn't support `Intl.DateTimeFormat`

**Solutions**:
1. Check date string is valid ISO format
2. Add polyfill for older browsers
3. Fallback to simple date formatting

### Issue: RTL not working
**Symptoms**: Arabic text shows LTR  
**Causes**:
- `dir` attribute not set
- CSS not applied

**Solutions**:
1. Check `dir={isRTL ? 'rtl' : 'ltr'}` is set
2. Check CSS file is imported
3. Check `language` prop is passed correctly

---

## 📚 Examples

See `frontend/src/examples/ConnectedAccountsExample.jsx` for:
1. Full page usage
2. Single card usage
3. Multiple cards usage
4. Language support
5. API integration
6. Routing integration
7. Navigation

---

## 🔄 Future Enhancements

### Planned Features
- [ ] Link new OAuth accounts from this page
- [ ] Show account permissions/scopes
- [ ] Refresh OAuth tokens
- [ ] Export account data
- [ ] Account activity log
- [ ] Bulk unlink (select multiple)

### Nice to Have
- [ ] Toast notifications instead of alerts
- [ ] Undo unlink (within 5 seconds)
- [ ] Account usage statistics
- [ ] Security recommendations
- [ ] Two-factor authentication status

---

## 📖 Related Documentation

- [Enhanced Auth Spec](../../.kiro/specs/enhanced-auth/)
- [OAuth Integration](./OAUTH_INTEGRATION.md)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [API Documentation](./API_DOCUMENTATION.md)

---

## 📝 Changelog

### 2026-02-23 - Initial Release
- ✅ Created ConnectedAccountsPage component
- ✅ Created ConnectedAccountCard component
- ✅ Added comprehensive documentation
- ✅ Added usage examples
- ✅ Implemented responsive design
- ✅ Added RTL/LTR support
- ✅ Added dark mode support
- ✅ Added accessibility features

---

**Last Updated**: 2026-02-23  
**Version**: 1.0.0  
**Status**: ✅ Complete
