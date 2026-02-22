# Dark Mode API Integration

## Overview
This document describes the integration between the frontend dark mode system and the backend user preferences API.

**Date**: 2026-02-21  
**Status**: ✅ Complete  
**Requirements**: IR-4, FR-DM-3

## Architecture

### Backend Components

#### 1. User Model (`backend/src/models/User.js`)
Added `preferences` field to store user preferences:

```javascript
preferences: {
  theme: { 
    type: String, 
    enum: ['light', 'dark', 'system'], 
    default: 'system' 
  },
  language: { 
    type: String, 
    enum: ['ar', 'en', 'fr'], 
    default: 'ar' 
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  accessibility: {
    reducedMotion: { type: Boolean, default: false },
    highContrast: { type: Boolean, default: false },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
  }
}
```

#### 2. API Endpoints (`backend/src/controllers/userController.js`)

**GET /api/users/preferences**
- Returns user preferences including theme
- Requires authentication
- Returns defaults if preferences not set

**PUT /api/users/preferences**
- Updates user preferences
- Validates theme values: 'light', 'dark', 'system'
- Partial updates supported (only update provided fields)
- Requires authentication

### Frontend Components

#### 1. ThemeContext (`frontend/src/context/ThemeContext.jsx`)

**New Features:**
- `isAuthenticated` state to track user authentication
- `setIsAuthenticated` function to update auth state
- Automatic sync with backend on mount if authenticated
- Automatic sync with backend when theme changes

**Sync Behavior:**
1. On mount: Fetch theme from backend if authenticated
2. On theme change: Update backend if authenticated
3. On login: Sync theme from backend
4. On logout: Continue using localStorage

#### 2. useAuthSync Hook (`frontend/src/hooks/useAuthSync.js`)

**Purpose:**
- Automatically sync theme when authentication state changes
- Listen for storage changes (multi-tab support)
- Listen for custom auth events

**Usage:**
```javascript
import { useAuthSync, triggerAuthChange } from './hooks/useAuthSync';

function App() {
  useAuthSync(); // Add this to your App component
  return <YourApp />;
}

// After login
localStorage.setItem('token', token);
triggerAuthChange();

// After logout
localStorage.removeItem('token');
triggerAuthChange();
```

## Data Flow

### Initial Load (Authenticated User)
```
1. User opens app
2. ThemeContext reads localStorage ('careerak-theme')
3. ThemeContext checks authentication (token exists)
4. ThemeContext fetches preferences from backend
5. If backend theme differs from localStorage, update localStorage
6. Apply theme to UI
```

### Theme Change (Authenticated User)
```
1. User toggles theme
2. ThemeContext updates state
3. ThemeContext saves to localStorage
4. ThemeContext syncs with backend API
5. Backend saves to database
```

### Theme Change (Unauthenticated User)
```
1. User toggles theme
2. ThemeContext updates state
3. ThemeContext saves to localStorage
4. No backend sync (user not authenticated)
```

### Login Flow
```
1. User logs in successfully
2. App calls triggerAuthChange()
3. useAuthSync detects auth change
4. ThemeContext fetches preferences from backend
5. If backend theme differs, update localStorage
6. Apply theme to UI
```

### Logout Flow
```
1. User logs out
2. App calls triggerAuthChange()
3. useAuthSync detects auth change
4. Theme continues from localStorage
5. No backend sync until next login
```

## API Examples

### Get User Preferences
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/users/preferences', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.preferences.theme); // 'light', 'dark', or 'system'
```

### Update Theme Preference
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/users/preferences', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ theme: 'dark' })
});

const data = await response.json();
console.log(data.message); // 'تم تحديث التفضيلات بنجاح'
```

### Update Multiple Preferences
```javascript
const token = localStorage.getItem('token');

const response = await fetch('/api/users/preferences', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    theme: 'dark',
    language: 'en',
    accessibility: {
      reducedMotion: true,
      fontSize: 'large'
    }
  })
});
```

## Integration with Existing Code

### Update Login Component
```javascript
import { triggerAuthChange } from '../hooks/useAuthSync';

const handleLogin = async (credentials) => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  
  if (data.token) {
    localStorage.setItem('token', data.token);
    triggerAuthChange(); // Sync theme with backend
    navigate('/dashboard');
  }
};
```

### Update Logout Component
```javascript
import { triggerAuthChange } from '../hooks/useAuthSync';

const handleLogout = () => {
  localStorage.removeItem('token');
  triggerAuthChange(); // Update auth state
  navigate('/login');
};
```

### Update App Component
```javascript
import { useAuthSync } from './hooks/useAuthSync';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  useAuthSync(); // Enable automatic theme syncing
  
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

## Benefits

### Cross-Device Sync
- User's theme preference syncs across all devices
- Login on new device automatically applies saved theme
- Consistent experience everywhere

### Offline Support
- Theme works offline using localStorage
- Syncs with backend when connection restored
- No interruption to user experience

### Multi-Tab Support
- Theme changes sync across browser tabs
- Storage event listener detects changes
- Consistent theme in all tabs

### Backward Compatibility
- Works for unauthenticated users (localStorage only)
- Graceful degradation if backend unavailable
- No breaking changes to existing code

## Testing

### Manual Testing Checklist
- [ ] Theme persists after page reload (unauthenticated)
- [ ] Theme syncs with backend after login
- [ ] Theme persists across devices (same user)
- [ ] Theme changes sync to backend immediately
- [ ] Theme works offline (localStorage fallback)
- [ ] Theme syncs across browser tabs
- [ ] Theme works for unauthenticated users
- [ ] Backend validation rejects invalid theme values

### Test Scenarios

**Scenario 1: First-time user**
1. User opens app (not logged in)
2. System theme is detected
3. User changes to dark mode
4. Theme saved to localStorage
5. User logs in
6. Theme synced to backend
7. User opens app on another device
8. Dark mode applied automatically

**Scenario 2: Returning user**
1. User logs in
2. Backend theme fetched (dark)
3. Dark mode applied
4. User changes to light mode
5. Backend updated immediately
6. User logs out
7. Light mode persists (localStorage)

**Scenario 3: Offline user**
1. User opens app offline
2. Theme loaded from localStorage
3. User changes theme
4. Theme saved to localStorage
5. User goes online
6. Theme synced to backend automatically

## Troubleshooting

### Theme not syncing with backend
- Check if user is authenticated (token exists)
- Check network connection
- Check backend API is running
- Check browser console for errors

### Theme not persisting across devices
- Verify user is logged in on both devices
- Check backend preferences are saved
- Verify API endpoints are working

### Theme not updating in UI
- Check if ThemeProvider is wrapping app
- Check if dark class is applied to document
- Check CSS variables are defined

## Future Enhancements

### Phase 2
- Add theme scheduling (auto dark mode at night)
- Add custom theme colors
- Add theme presets (high contrast, colorblind-friendly)
- Add theme preview before applying

### Phase 3
- Add theme analytics (most popular themes)
- Add theme recommendations based on usage
- Add theme sharing between users
- Add theme marketplace

## Related Files

**Backend:**
- `backend/src/models/User.js` - User model with preferences
- `backend/src/controllers/userController.js` - API endpoints
- `backend/src/routes/userRoutes.js` - Route definitions

**Frontend:**
- `frontend/src/context/ThemeContext.jsx` - Theme context with API sync
- `frontend/src/hooks/useAuthSync.js` - Auth sync hook
- `frontend/src/hooks/useTheme.js` - Theme hook (existing)

**Documentation:**
- `docs/DARK_MODE_API_INTEGRATION.md` - This file
- `.kiro/specs/general-platform-enhancements/requirements.md` - Requirements
- `.kiro/specs/general-platform-enhancements/design.md` - Design document

## Compliance

**Requirements Met:**
- ✅ IR-4: Integration with existing authentication system
- ✅ FR-DM-3: Theme preference persists in localStorage
- ✅ NFR-USE-5: User preferences persist in localStorage
- ✅ Design Section 12.2: API endpoint for user preferences

**Standards Followed:**
- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Graceful degradation
- ✅ Offline-first approach
- ✅ Multi-language support (ar, en, fr)
