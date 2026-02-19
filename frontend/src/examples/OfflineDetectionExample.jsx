import React from 'react';
import useOffline from '../hooks/useOffline';
import { useOfflineContext } from '../context/OfflineContext';

/**
 * Example component demonstrating offline detection usage
 * 
 * This shows two ways to use offline detection:
 * 1. Simple hook (useOffline) - for basic online/offline status
 * 2. Context (useOfflineContext) - for advanced features like request queueing
 */

// Example 1: Simple offline detection with hook
export const SimpleOfflineExample = () => {
  const { isOnline, isOffline } = useOffline();

  return (
    <div style={{ padding: '20px', border: '2px solid #ccc', margin: '10px' }}>
      <h3>Simple Offline Detection (Hook)</h3>
      <p>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
      <p>isOnline: {isOnline.toString()}</p>
      <p>isOffline: {isOffline.toString()}</p>
    </div>
  );
};

// Example 2: Advanced offline detection with context
export const AdvancedOfflineExample = () => {
  const { 
    isOnline, 
    isOffline, 
    wasOffline, 
    queueRequest,
    offlineQueue 
  } = useOfflineContext();

  const handleApiCall = () => {
    if (isOffline) {
      // Queue the request for later
      queueRequest({
        url: '/api/example',
        method: 'POST',
        data: { test: 'data' }
      });
      alert('Request queued! Will retry when online.');
    } else {
      alert('Making API call...');
      // Make actual API call here
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ccc', margin: '10px' }}>
      <h3>Advanced Offline Detection (Context)</h3>
      <p>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
      {wasOffline && <p style={{ color: 'green' }}>✅ Connection restored!</p>}
      <p>Queued requests: {offlineQueue.length}</p>
      <button onClick={handleApiCall}>Make API Call</button>
    </div>
  );
};

// Example 3: Conditional rendering based on offline status
export const ConditionalRenderExample = () => {
  const { isOffline } = useOffline();

  if (isOffline) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#ffebee', 
        border: '2px solid #f44336',
        margin: '10px'
      }}>
        <h3>⚠️ You are offline</h3>
        <p>Some features may not be available.</p>
        <p>Please check your internet connection.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '2px solid #ccc', margin: '10px' }}>
      <h3>✅ You are online</h3>
      <p>All features are available.</p>
    </div>
  );
};

// Example 4: Form with offline handling
export const OfflineFormExample = () => {
  const { isOffline, queueRequest } = useOfflineContext();
  const [formData, setFormData] = React.useState({ name: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isOffline) {
      // Queue the form submission
      queueRequest({
        url: '/api/submit-form',
        method: 'POST',
        data: formData
      });
      alert('Form queued! Will submit when online.');
    } else {
      // Submit immediately
      console.log('Submitting form:', formData);
      alert('Form submitted!');
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ccc', margin: '10px' }}>
      <h3>Form with Offline Support</h3>
      {isOffline && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fff3cd', 
          marginBottom: '10px' 
        }}>
          ⚠️ You are offline. Form will be queued for submission.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ display: 'block', margin: '10px 0', padding: '5px' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ display: 'block', margin: '10px 0', padding: '5px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>
          {isOffline ? 'Queue for Later' : 'Submit Now'}
        </button>
      </form>
    </div>
  );
};

// Main example component showing all examples
const OfflineDetectionExample = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Offline Detection Examples</h1>
      <p>Try disconnecting your internet to see the offline detection in action!</p>
      
      <SimpleOfflineExample />
      <AdvancedOfflineExample />
      <ConditionalRenderExample />
      <OfflineFormExample />
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3'
      }}>
        <h4>How to test:</h4>
        <ol>
          <li>Open Chrome DevTools (F12)</li>
          <li>Go to Network tab</li>
          <li>Change "Online" dropdown to "Offline"</li>
          <li>Watch the components update in real-time!</li>
        </ol>
      </div>
    </div>
  );
};

export default OfflineDetectionExample;
