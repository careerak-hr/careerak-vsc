# OAuth Authentication Components

## Overview
This directory contains OAuth authentication components for Google, Facebook, and LinkedIn login/registration.

## Components

### OAuthButtons.jsx
Displays OAuth login/registration buttons with brand colors and icons.

**Features:**
- 3 OAuth providers: Google, Facebook, LinkedIn
- Opens OAuth flow in popup window
- Handles callback messages from popup
- Saves JWT token to localStorage
- Redirects to appropriate interface based on user type
- Supports both login and register modes
- RTL support for Arabic
- Responsive design

**Usage:**
```jsx
import OAuthButtons from '../components/auth/OAuthButtons';

// In registration page
<OAuthButtons mode="register" />

// In login page
<OAuthButtons mode="login" />
```

**Props:**
- `mode` (string): 'register' or 'login' - changes button text

### OAuthCallback.jsx (Page)
Handles OAuth callback from backend after successful authentication.

**Features:**
- Extracts token and user data from URL params
- Saves to localStorage
- Sends message to opener window (if popup)
- Redirects to appropriate interface
- Error handling with user-friendly messages
- Loading states
- Multi-language support

**Flow:**
1. Backend redirects to `/auth/callback?token=xxx&user=xxx`
2. Component extracts params
3. Saves to localStorage
4. Sends message to opener window
5. Closes popup or redirects

## Backend Integration

### OAuth Routes
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/facebook` - Initiate Facebook OAuth
- `GET /auth/linkedin` - Initiate LinkedIn OAuth
- `GET /auth/google/callback` - Google callback
- `GET /auth/facebook/callback` - Facebook callback
- `GET /auth/linkedin/callback` - LinkedIn callback

### Callback URL
Backend redirects to: `${FRONTEND_URL}/auth/callback?token=${token}&user=${user}`

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000
```

## Security

### CORS
Backend must allow frontend origin for OAuth callbacks.

### Message Origin Verification
OAuthButtons component verifies message origin before processing.

### Token Storage
JWT token is stored in localStorage (consider httpOnly cookies for production).

### State Parameter
Backend should implement CSRF protection with state parameter.

## Styling

### CSS File
`OAuthButtons.css` contains all styles for OAuth buttons.

### Brand Colors
- Google: #4285F4
- Facebook: #1877F2
- LinkedIn: #0A66C2

### Responsive
- Mobile-first design
- Touch-friendly buttons (min 44x44px)
- Adapts to small screens

### RTL Support
Buttons reverse direction in RTL mode.

## User Flow

### Registration Flow
1. User clicks "Sign up with Google"
2. Popup opens with Google OAuth
3. User authorizes
4. Backend creates/links account
5. Backend redirects to callback with token
6. Callback saves token and closes popup
7. Main window receives message
8. User redirected to appropriate interface

### Login Flow
Same as registration, but button text changes to "Sign in with..."

## Error Handling

### Popup Blocked
Alert shown if popup is blocked by browser.

### OAuth Errors
- authentication_failed
- token_generation_failed
- user_cancelled
- access_denied
- unknown_error

### Network Errors
Caught and displayed with user-friendly messages.

## Testing

### Manual Testing
1. Click OAuth button
2. Verify popup opens
3. Complete OAuth flow
4. Verify token saved
5. Verify redirect works
6. Test error cases

### Test Accounts
Use OAuth provider test accounts for development.

## Future Enhancements
- [ ] Remember OAuth provider preference
- [ ] Show loading state during OAuth
- [ ] Add more OAuth providers (Twitter, GitHub)
- [ ] Implement account linking UI
- [ ] Add OAuth account management page
- [ ] Implement 2FA for OAuth accounts

## Troubleshooting

### Popup doesn't open
- Check browser popup blocker
- Verify backend URL is correct
- Check CORS settings

### Token not saved
- Check localStorage permissions
- Verify callback URL matches
- Check browser console for errors

### Redirect doesn't work
- Verify user object has accountType
- Check route guards
- Verify routes exist in AppRoutes.jsx

## Related Files
- `frontend/src/pages/02_LoginPage.jsx` - Uses OAuthButtons
- `frontend/src/pages/03_AuthPage.jsx` - Uses OAuthButtons
- `frontend/src/pages/OAuthCallback.jsx` - Handles callback
- `frontend/src/components/AppRoutes.jsx` - Defines routes
- `backend/src/routes/oauthRoutes.js` - Backend routes
- `backend/src/controllers/oauthController.js` - Backend logic

## Documentation
See `.kiro/specs/enhanced-auth/` for full specification and design.
