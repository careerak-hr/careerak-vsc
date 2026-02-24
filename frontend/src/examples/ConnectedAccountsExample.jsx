/**
 * Connected Accounts Page - Usage Example
 * 
 * This example demonstrates how to use the ConnectedAccountsPage component
 * and the ConnectedAccountCard component.
 */

import React from 'react';
import ConnectedAccountsPage from '../pages/ConnectedAccountsPage';
import ConnectedAccountCard from '../components/auth/ConnectedAccountCard';

// ==================== Example 1: Full Page ====================
// The ConnectedAccountsPage is a complete page that handles everything:
// - Fetching connected accounts from the API
// - Displaying accounts in a grid
// - Handling unlink with confirmation modal
// - Loading, error, and empty states
// - Responsive design
// - RTL/LTR support

function Example1_FullPage() {
  return (
    <ConnectedAccountsPage />
  );
}

// ==================== Example 2: Single Card ====================
// You can also use the ConnectedAccountCard component standalone

function Example2_SingleCard() {
  const mockAccount = {
    _id: '123',
    provider: 'google',
    email: 'user@gmail.com',
    connectedAt: '2026-01-15T10:30:00Z',
    lastUsed: '2026-02-20T14:45:00Z'
  };
  
  const handleUnlink = (account) => {
    console.log('Unlink account:', account);
    // Show confirmation modal
  };
  
  return (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <ConnectedAccountCard
        account={mockAccount}
        onUnlink={handleUnlink}
        language="ar"
      />
    </div>
  );
}

// ==================== Example 3: Multiple Cards ====================
// Display multiple connected accounts

function Example3_MultipleCards() {
  const mockAccounts = [
    {
      _id: '1',
      provider: 'google',
      email: 'user@gmail.com',
      connectedAt: '2026-01-15T10:30:00Z',
      lastUsed: '2026-02-20T14:45:00Z'
    },
    {
      _id: '2',
      provider: 'facebook',
      email: 'user@facebook.com',
      connectedAt: '2026-02-01T08:20:00Z',
      lastUsed: '2026-02-18T16:30:00Z'
    },
    {
      _id: '3',
      provider: 'linkedin',
      email: 'user@linkedin.com',
      connectedAt: '2025-12-10T12:00:00Z',
      lastUsed: null // Never used
    }
  ];
  
  const handleUnlink = (account) => {
    console.log('Unlink account:', account);
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Connected Accounts</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginTop: '1.5rem'
      }}>
        {mockAccounts.map((account) => (
          <ConnectedAccountCard
            key={account._id}
            account={account}
            onUnlink={handleUnlink}
            language="en"
          />
        ))}
      </div>
    </div>
  );
}

// ==================== Example 4: Different Languages ====================
// The component supports Arabic, English, and French

function Example4_Languages() {
  const mockAccount = {
    _id: '123',
    provider: 'google',
    email: 'user@gmail.com',
    connectedAt: '2026-01-15T10:30:00Z',
    lastUsed: '2026-02-20T14:45:00Z'
  };
  
  const handleUnlink = (account) => {
    console.log('Unlink account:', account);
  };
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Language Support</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Arabic (RTL)</h3>
        <div style={{ maxWidth: '400px' }}>
          <ConnectedAccountCard
            account={mockAccount}
            onUnlink={handleUnlink}
            language="ar"
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>English (LTR)</h3>
        <div style={{ maxWidth: '400px' }}>
          <ConnectedAccountCard
            account={mockAccount}
            onUnlink={handleUnlink}
            language="en"
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>French (LTR)</h3>
        <div style={{ maxWidth: '400px' }}>
          <ConnectedAccountCard
            account={mockAccount}
            onUnlink={handleUnlink}
            language="fr"
          />
        </div>
      </div>
    </div>
  );
}

// ==================== Example 5: API Integration ====================
// How to integrate with the backend API

function Example5_APIIntegration() {
  const [accounts, setAccounts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    fetchAccounts();
  }, []);
  
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/auth/oauth/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAccounts(data.accounts || []);
      } else {
        setError(data.error || 'Failed to fetch accounts');
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnlink = async (account) => {
    if (!window.confirm(`Are you sure you want to unlink ${account.provider}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/auth/oauth/${account.provider}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove account from list
        setAccounts(accounts.filter(acc => acc.provider !== account.provider));
        alert('Account unlinked successfully');
      } else {
        alert(data.error || 'Failed to unlink account');
      }
    } catch (err) {
      console.error('Error unlinking account:', err);
      alert('Failed to unlink account');
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Connected Accounts</h2>
      {accounts.length === 0 ? (
        <p>No connected accounts</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem'
        }}>
          {accounts.map((account) => (
            <ConnectedAccountCard
              key={account._id}
              account={account}
              onUnlink={handleUnlink}
              language="en"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Example 6: Routing Integration ====================
// How to add the page to your routing

/*
// In your App.jsx or Routes.jsx:

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConnectedAccountsPage from './pages/ConnectedAccountsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/connected-accounts" element={<ConnectedAccountsPage />} />
        {/* other routes *\/}
      </Routes>
    </BrowserRouter>
  );
}
*/

// ==================== Example 7: Navigation ====================
// How to navigate to the page

/*
// From Profile Page:

import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>Profile</h1>
      <button onClick={() => navigate('/connected-accounts')}>
        Manage Connected Accounts
      </button>
    </div>
  );
}
*/

// ==================== Export Examples ====================

export default function ConnectedAccountsExamples() {
  return (
    <div>
      <h1>Connected Accounts - Examples</h1>
      
      <section>
        <h2>Example 1: Full Page</h2>
        <Example1_FullPage />
      </section>
      
      <section>
        <h2>Example 2: Single Card</h2>
        <Example2_SingleCard />
      </section>
      
      <section>
        <h2>Example 3: Multiple Cards</h2>
        <Example3_MultipleCards />
      </section>
      
      <section>
        <h2>Example 4: Languages</h2>
        <Example4_Languages />
      </section>
      
      <section>
        <h2>Example 5: API Integration</h2>
        <Example5_APIIntegration />
      </section>
    </div>
  );
}

// ==================== Notes ====================

/*
API Endpoints:
- GET /auth/oauth/accounts - Get all connected accounts
- DELETE /auth/oauth/:provider - Unlink an account

Response Format (GET /auth/oauth/accounts):
{
  "success": true,
  "accounts": [
    {
      "_id": "123",
      "userId": "456",
      "provider": "google",
      "providerId": "789",
      "email": "user@gmail.com",
      "displayName": "John Doe",
      "profilePicture": "https://...",
      "connectedAt": "2026-01-15T10:30:00Z",
      "lastUsed": "2026-02-20T14:45:00Z"
    }
  ]
}

Response Format (DELETE /auth/oauth/:provider):
{
  "success": true,
  "message": "تم فك ربط حساب google بنجاح"
}

Error Response:
{
  "success": false,
  "error": "لا يمكن فك الربط. يجب أن يكون لديك طريقة دخول أخرى"
}
*/
