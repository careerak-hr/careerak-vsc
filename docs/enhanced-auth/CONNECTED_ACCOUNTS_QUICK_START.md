# Connected Accounts Page - Quick Start Guide

## 🚀 5-Minute Setup

This guide will get you up and running with the Connected Accounts Page in 5 minutes.

---

## ✅ Prerequisites

- Backend OAuth routes are set up (`/auth/oauth/accounts`, `/auth/oauth/:provider`)
- User is authenticated (has JWT token)
- React Router is configured

---

## 📦 Step 1: Add Route (1 minute)

Add the route to your `App.jsx` or routing file:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConnectedAccountsPage from './pages/ConnectedAccountsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* New route */}
        <Route path="/connected-accounts" element={<ConnectedAccountsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔗 Step 2: Add Navigation (1 minute)

Add a link to the page from your Profile page:

```jsx
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Profile</h1>
      
      {/* Add this button */}
      <button onClick={() => navigate('/connected-accounts')}>
        Manage Connected Accounts
      </button>
    </div>
  );
}
```

---

## 🎨 Step 3: Verify Styles (30 seconds)

The CSS files are already created. Just make sure they're imported:

```jsx
// In ConnectedAccountsPage.jsx (already done)
import './ConnectedAccountsPage.css';

// In ConnectedAccountCard.jsx (already done)
import './ConnectedAccountCard.css';
```

---

## 🧪 Step 4: Test (2 minutes)

1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the Page**:
   - Navigate to `/connected-accounts`
   - Should see your connected accounts (or empty state)
   - Click "فك الربط" (Unlink) on an account
   - Confirm in the modal
   - Account should be removed

---

## 🌍 Step 5: Language Support (30 seconds)

The page automatically uses the language from `AuthContext`. No additional setup needed!

Supported languages:
- **Arabic (ar)**: RTL layout
- **English (en)**: LTR layout
- **French (fr)**: LTR layout

---

## ✅ Done!

You're all set! The Connected Accounts Page is now live.

---

## 📋 Quick Reference

### API Endpoints
```
GET    /auth/oauth/accounts     # Get connected accounts
DELETE /auth/oauth/:provider    # Unlink account
```

### Component Props
```jsx
<ConnectedAccountCard
  account={account}      // Required: Account object
  onUnlink={handleUnlink} // Required: Unlink callback
  language="ar"          // Optional: Language code
/>
```

### Account Object
```javascript
{
  _id: string,
  provider: 'google' | 'facebook' | 'linkedin',
  email: string,
  connectedAt: string, // ISO date
  lastUsed: string | null
}
```

---

## 🐛 Common Issues

### Issue: "Cannot GET /auth/oauth/accounts"
**Solution**: Make sure backend is running and OAuth routes are registered.

### Issue: Accounts not showing
**Solution**: Check auth token in localStorage: `localStorage.getItem('authToken')`

### Issue: RTL not working
**Solution**: Make sure `language` is set in `AuthContext`.

---

## 📚 Next Steps

- Read the [full documentation](./CONNECTED_ACCOUNTS_PAGE.md)
- Check out [usage examples](../../frontend/src/examples/ConnectedAccountsExample.jsx)
- Customize the styles to match your brand
- Add toast notifications for better UX

---

## 💡 Pro Tips

1. **Custom Confirmation Modal**: Replace the default `ConfirmationModal` with your own for consistent branding.

2. **Toast Notifications**: Replace `alert()` with a toast library like `react-hot-toast`:
   ```jsx
   import toast from 'react-hot-toast';
   
   // Instead of alert(t.unlinkSuccess)
   toast.success(t.unlinkSuccess);
   ```

3. **Loading States**: The page already handles loading, but you can customize the spinner:
   ```css
   .spinner {
     /* Your custom spinner styles */
   }
   ```

4. **Empty State CTA**: Add a button to link new accounts:
   ```jsx
   <div className="empty-state">
     <h2>{t.noAccounts}</h2>
     <p>{t.noAccountsDesc}</p>
     <button onClick={() => navigate('/auth')}>
       Link an Account
     </button>
   </div>
   ```

---

## 🎉 That's It!

You now have a fully functional Connected Accounts Page. Enjoy! 🚀

**Need help?** Check the [full documentation](./CONNECTED_ACCOUNTS_PAGE.md) or [examples](../../frontend/src/examples/ConnectedAccountsExample.jsx).

---

**Last Updated**: 2026-02-23  
**Version**: 1.0.0
