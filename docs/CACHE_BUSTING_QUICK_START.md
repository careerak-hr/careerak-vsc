# Cache Busting - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Add to Your App

```jsx
// src/App.jsx
import { useEffect } from 'react';
import { initCacheBusting } from '@/utils/cacheBusting';
import VersionUpdateNotification from '@/components/VersionUpdateNotification';

function App() {
  useEffect(() => {
    initCacheBusting(false); // false = don't auto-reload
  }, []);

  return (
    <>
      <VersionUpdateNotification />
      {/* Your app content */}
    </>
  );
}
```

### 2. Use Cache-Busted URLs

```javascript
import { getCacheBustedUrl } from '@/utils/cacheBusting';

// For API calls
fetch(getCacheBustedUrl('/api/data'));

// For images
<img src={getCacheBustedUrl('/images/logo.png')} />
```

### 3. Build & Deploy

```bash
# Update version in package.json
npm version patch  # 1.0.0 → 1.0.1

# Build
npm run build

# Deploy (Vercel, etc.)
```

---

## 📋 Common Use Cases

### Show Update Notification

```jsx
import { useCacheBusting } from '@/hooks/useCacheBusting';

function MyComponent() {
  const { hasUpdate, reload } = useCacheBusting({ autoCheck: true });

  if (hasUpdate) {
    return <button onClick={reload}>Update Available</button>;
  }
}
```

### Clear Cache on Logout

```javascript
import { clearAllCaches } from '@/utils/cacheBusting';

async function handleLogout() {
  await clearAllCaches();
  // ... logout logic
}
```

### Preload Critical Assets

```javascript
import { preloadAssets } from '@/utils/cacheBusting';

preloadAssets([
  '/fonts/main.woff2',
  '/images/hero.webp'
]);
```

---

## 🔧 Configuration Options

### VersionUpdateNotification Props

```jsx
<VersionUpdateNotification 
  checkInterval={60000}      // Check every 60s
  autoCheck={true}           // Enable auto-check
  position="bottom-right"    // Notification position
/>
```

### useCacheBusting Options

```javascript
useCacheBusting({
  autoCheck: true,           // Enable auto-check
  checkInterval: 60000,      // Check every 60s
  autoReload: false          // Don't auto-reload
});
```

---

## 🐛 Quick Troubleshooting

### Users Not Getting Updates?

```javascript
// 1. Check version
console.log(import.meta.env.VITE_BUILD_VERSION);

// 2. Force reload
import { forceReload } from '@/utils/cacheBusting';
forceReload();
```

### Notification Not Showing?

```javascript
// Check if new version is available
import { isNewVersionAvailable } from '@/utils/cacheBusting';
console.log('Has update:', isNewVersionAvailable());
```

### Clear Everything

```javascript
// Nuclear option - clear all caches
import { clearAllCaches } from '@/utils/cacheBusting';
await clearAllCaches();
window.location.reload(true);
```

---

## 📚 Full Documentation

See [CACHE_BUSTING_GUIDE.md](./CACHE_BUSTING_GUIDE.md) for complete documentation.

---

## ✅ Checklist

- [ ] Added `initCacheBusting()` to App.jsx
- [ ] Added `<VersionUpdateNotification />` component
- [ ] Using `getCacheBustedUrl()` for dynamic URLs
- [ ] Updated version in package.json
- [ ] Tested in development
- [ ] Built and deployed
- [ ] Verified users get updates

---

**Quick Links**:
- [Full Guide](./CACHE_BUSTING_GUIDE.md)
- [API Reference](./CACHE_BUSTING_GUIDE.md#api-reference)
- [Troubleshooting](./CACHE_BUSTING_GUIDE.md#troubleshooting)
