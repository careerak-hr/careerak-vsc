# Dark Mode API Integration - Quick Start Example

## Step-by-Step Integration Guide

### 1. Update Your App Component

Add the `useAuthSync` hook to enable automatic theme syncing:

```javascript
// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { useAuthSync } from './hooks/useAuthSync';
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  // Enable automatic theme syncing with backend
  useAuthSync();
  
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
```

### 2. Update Your Login Component

Trigger theme sync after successful login:

```javascript
// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { triggerAuthChange } from '../hooks/useAuthSync';

function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.token) {
        // Save token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Trigger theme sync with backend
        triggerAuthChange();
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('حدث خطأ في تسجيل الدخول');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
      />
      <button type="submit">تسجيل الدخول</button>
    </form>
  );
}

export default LoginPage;
```

### 3. Update Your Logout Component

Trigger auth change after logout:

```javascript
// frontend/src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { triggerAuthChange } from '../hooks/useAuthSync';

function Navbar() {
  const navigate = useNavigate();
  const { isDark, toggleTheme, themeMode } = useTheme();

  const handleLogout = () => {
    // Remove auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Trigger auth change (theme will continue from localStorage)
    triggerAuthChange();
    
    // Navigate to login
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Careerak</div>
      
      <div className="navbar-actions">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle theme"
        >
          {themeMode === 'light' && '🌙 Dark'}
          {themeMode === 'dark' && '☀️ Light'}
          {themeMode === 'system' && '💻 System'}
        </button>
        
        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-btn">
          تسجيل الخروج
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
```

### 4. Create a Settings Page (Optional)

Allow users to manage their preferences:

```javascript
// frontend/src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

function SettingsPage() {
  const { themeMode, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'ar',
    notifications: { enabled: true, email: true, push: true },
    accessibility: { reducedMotion: false, highContrast: false, fontSize: 'medium' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Save preferences
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });
      
      if (response.ok) {
        alert('تم حفظ الإعدادات بنجاح');
        
        // Update theme if changed
        if (preferences.theme !== themeMode) {
          setTheme(preferences.theme);
        }
      } else {
        alert('فشل حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('حدث خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="settings-page">
      <h1>الإعدادات</h1>
      
      {/* Theme Settings */}
      <section className="settings-section">
        <h2>المظهر</h2>
        <div className="setting-item">
          <label>الوضع</label>
          <select
            value={preferences.theme}
            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
          >
            <option value="light">فاتح</option>
            <option value="dark">داكن</option>
            <option value="system">تلقائي (حسب النظام)</option>
          </select>
        </div>
      </section>

      {/* Language Settings */}
      <section className="settings-section">
        <h2>اللغة</h2>
        <div className="setting-item">
          <label>اللغة المفضلة</label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="settings-section">
        <h2>الإشعارات</h2>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.notifications.enabled}
              onChange={(e) => setPreferences({
                ...preferences,
                notifications: { ...preferences.notifications, enabled: e.target.checked }
              })}
            />
            تفعيل الإشعارات
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.notifications.email}
              onChange={(e) => setPreferences({
                ...preferences,
                notifications: { ...preferences.notifications, email: e.target.checked }
              })}
            />
            إشعارات البريد الإلكتروني
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.notifications.push}
              onChange={(e) => setPreferences({
                ...preferences,
                notifications: { ...preferences.notifications, push: e.target.checked }
              })}
            />
            الإشعارات الفورية
          </label>
        </div>
      </section>

      {/* Accessibility Settings */}
      <section className="settings-section">
        <h2>إمكانية الوصول</h2>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.accessibility.reducedMotion}
              onChange={(e) => setPreferences({
                ...preferences,
                accessibility: { ...preferences.accessibility, reducedMotion: e.target.checked }
              })}
            />
            تقليل الحركة
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={preferences.accessibility.highContrast}
              onChange={(e) => setPreferences({
                ...preferences,
                accessibility: { ...preferences.accessibility, highContrast: e.target.checked }
              })}
            />
            تباين عالي
          </label>
        </div>
        <div className="setting-item">
          <label>حجم الخط</label>
          <select
            value={preferences.accessibility.fontSize}
            onChange={(e) => setPreferences({
              ...preferences,
              accessibility: { ...preferences.accessibility, fontSize: e.target.value }
            })}
          >
            <option value="small">صغير</option>
            <option value="medium">متوسط</option>
            <option value="large">كبير</option>
          </select>
        </div>
      </section>

      {/* Save Button */}
      <button 
        onClick={handleSave} 
        disabled={saving}
        className="save-btn"
      >
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
}

export default SettingsPage;
```

## Testing the Integration

### 1. Test Unauthenticated User
```bash
# Open browser console
localStorage.clear()
# Reload page
# Change theme using toggle button
# Check localStorage
localStorage.getItem('careerak-theme') // Should show 'light', 'dark', or 'system'
```

### 2. Test Authenticated User
```bash
# Login with credentials
# Change theme using toggle button
# Check backend (MongoDB)
# Theme should be saved in user.preferences.theme

# Open app on another device with same account
# Theme should be synced automatically
```

### 3. Test Multi-Tab Sync
```bash
# Open app in two browser tabs
# Login in both tabs
# Change theme in tab 1
# Tab 2 should update automatically
```

### 4. Test Offline Mode
```bash
# Login and set theme to dark
# Go offline (disable network)
# Reload page
# Dark theme should still work (from localStorage)
# Go online
# Theme should sync to backend
```

## Common Issues and Solutions

### Issue 1: Theme not syncing after login
**Solution:** Make sure you call `triggerAuthChange()` after setting the token:
```javascript
localStorage.setItem('token', token);
triggerAuthChange(); // Don't forget this!
```

### Issue 2: Theme not persisting across devices
**Solution:** Verify the backend API is working:
```javascript
// Test GET endpoint
const token = localStorage.getItem('token');
fetch('/api/users/preferences', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => console.log(data));

// Test PUT endpoint
fetch('/api/users/preferences', {
  method: 'PUT',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ theme: 'dark' })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Issue 3: useAuthSync not working
**Solution:** Make sure it's called inside ThemeProvider:
```javascript
// ❌ Wrong
function App() {
  useAuthSync(); // Outside ThemeProvider
  return <ThemeProvider><AppContent /></ThemeProvider>;
}

// ✅ Correct
function App() {
  return (
    <ThemeProvider>
      <AppContent /> {/* useAuthSync called inside */}
    </ThemeProvider>
  );
}
```

## Next Steps

1. ✅ Backend API endpoints created
2. ✅ Frontend ThemeContext updated
3. ✅ useAuthSync hook created
4. ⏳ Update App.jsx to use useAuthSync
5. ⏳ Update LoginPage to trigger auth change
6. ⏳ Update Navbar/Logout to trigger auth change
7. ⏳ Test integration end-to-end
8. ⏳ Create SettingsPage (optional)

## Related Documentation

- [Dark Mode API Integration](./DARK_MODE_API_INTEGRATION.md) - Full technical documentation
- [Requirements](../.kiro/specs/general-platform-enhancements/requirements.md) - Feature requirements
- [Design](../.kiro/specs/general-platform-enhancements/design.md) - Design document
