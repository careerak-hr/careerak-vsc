/**
 * StatusTimeline Component - Usage Examples
 * 
 * Demonstrates how to use the StatusTimeline component in different scenarios
 */

import React, { useState } from 'react';
import StatusTimeline from './StatusTimeline';
import { AppProvider } from '../../context/AppContext';

const StatusTimelineExample = () => {
  const [language, setLanguage] = useState('en');

  // Example 1: Basic usage with submitted application
  const example1 = {
    applicationId: 'app-001',
    currentStatus: 'Submitted',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date('2024-01-15T10:30:00'),
        note: null
      }
    ]
  };

  // Example 2: Application in review
  const example2 = {
    applicationId: 'app-002',
    currentStatus: 'Reviewed',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date('2024-01-15T10:30:00'),
        note: null
      },
      {
        status: 'Reviewed',
        timestamp: new Date('2024-01-16T14:45:00'),
        note: 'Initial screening completed'
      }
    ]
  };

  // Example 3: Application shortlisted
  const example3 = {
    applicationId: 'app-003',
    currentStatus: 'Shortlisted',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date('2024-01-15T10:30:00'),
        note: null
      },
      {
        status: 'Reviewed',
        timestamp: new Date('2024-01-16T14:45:00'),
        note: 'Initial screening completed'
      },
      {
        status: 'Shortlisted',
        timestamp: new Date('2024-01-17T09:15:00'),
        note: 'Selected for interview'
      }
    ]
  };

  // Example 4: Interview scheduled
  const example4 = {
    applicationId: 'app-004',
    currentStatus: 'Interview Scheduled',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date('2024-01-15T10:30:00'),
        note: null
      },
      {
        status: 'Reviewed',
        timestamp: new Date('2024-01-16T14:45:00'),
        note: null
      },
      {
        status: 'Shortlisted',
        timestamp: new Date('2024-01-17T09:15:00'),
        note: null
      },
      {
        status: 'Interview Scheduled',
        timestamp: new Date('2024-01-18T11:00:00'),
        note: 'Interview scheduled for January 22, 2024 at 2:00 PM'
      }
    ]
  };

  // Example 5: Accepted application
  const example5 = {
    applicationId: 'app-005',
    currentStatus: 'Accepted',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date('2024-01-15T10:30:00'),
        note: null
      },
      {
        status: 'Reviewed',
        timestamp: new Date('2024-01-16T14:45:00'),
        note: null
      },
      {
        status: 'Shortlisted',
        timestamp: new Date('2024-01-17T09:15:00'),
        note: null
      },
      {
        status: 'Interview Scheduled',
        timestamp: new Date('2024-01-18T11:00:00'),
        note: null
      },
      {
        status: 'Accepted',
        timestamp: new Date('2024-01-22T16:30:00'),
        note: 'Congratulations! Please check your email for next steps.'
      }
    ]
  };

  // Example 6: Rejected application
  const example6 = {
    applicationId: 'app-006',
    currentStatus: 'Rejected',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date('2024-01-15T10:30:00'),
        note: null
      },
      {
        status: 'Reviewed',
        timestamp: new Date('2024-01-16T14:45:00'),
        note: null
      },
      {
        status: 'Rejected',
        timestamp: new Date('2024-01-17T10:00:00'),
        note: 'Thank you for your interest. We have decided to move forward with other candidates.'
      }
    ]
  };

  // Example 7: Withdrawn application
  const example7 = {
    applicationId: 'app-007',
    currentStatus: 'Withdrawn',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date('2024-01-15T10:30:00'),
        note: null
      },
      {
        status: 'Withdrawn',
        timestamp: new Date('2024-01-16T09:00:00'),
        note: 'Application withdrawn by candidate'
      }
    ]
  };

  // Handle status update callback
  const handleStatusUpdate = (data) => {
    console.log('Status updated:', data);
    alert(`Status updated to: ${data.status}`);
  };

  const mockUser = {
    _id: 'user123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    userType: 'Employee'
  };

  return (
    <AppProvider value={{ language, user: mockUser }}>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', color: '#304B60' }}>
          StatusTimeline Component Examples
        </h1>

        {/* Language Selector */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>
            Language:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '2px solid #D4816180',
              fontSize: '16px'
            }}
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Example 1 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#304B60', marginBottom: '16px' }}>
            Example 1: Submitted Application
          </h2>
          <StatusTimeline
            applicationId={example1.applicationId}
            currentStatus={example1.currentStatus}
            statusHistory={example1.statusHistory}
            onStatusUpdate={handleStatusUpdate}
          />
        </section>

        {/* Example 2 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#304B60', marginBottom: '16px' }}>
            Example 2: Application Under Review
          </h2>
          <StatusTimeline
            applicationId={example2.applicationId}
            currentStatus={example2.currentStatus}
            statusHistory={example2.statusHistory}
            onStatusUpdate={handleStatusUpdate}
          />
        </section>

        {/* Example 3 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#304B60', marginBottom: '16px' }}>
            Example 3: Shortlisted Application
          </h2>
          <StatusTimeline
            applicationId={example3.applicationId}
            currentStatus={example3.currentStatus}
            statusHistory={example3.statusHistory}
            onStatusUpdate={handleStatusUpdate}
          />
        </section>

        {/* Example 4 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#304B60', marginBottom: '16px' }}>
            Example 4: Interview Scheduled
          </h2>
          <StatusTimeline
            applicationId={example4.applicationId}
            currentStatus={example4.currentStatus}
            statusHistory={example4.statusHistory}
            onStatusUpdate={handleStatusUpdate}
          />
        </section>

        {/* Example 5 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#304B60', marginBottom: '16px' }}>
            Example 5: Accepted Application ✅
          </h2>
          <StatusTimeline
            applicationId={example5.applicationId}
            currentStatus={example5.currentStatus}
            statusHistory={example5.statusHistory}
            onStatusUpdate={handleStatusUpdate}
          />
        </section>

        {/* Example 6 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#304B60', marginBottom: '16px' }}>
            Example 6: Rejected Application ❌
          </h2>
          <StatusTimeline
            applicationId={example6.applicationId}
            currentStatus={example6.currentStatus}
            statusHistory={example6.statusHistory}
            onStatusUpdate={handleStatusUpdate}
          />
        </section>

        {/* Example 7 */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#304B60', marginBottom: '16px' }}>
            Example 7: Withdrawn Application 🔙
          </h2>
          <StatusTimeline
            applicationId={example7.applicationId}
            currentStatus={example7.currentStatus}
            statusHistory={example7.statusHistory}
            onStatusUpdate={handleStatusUpdate}
          />
        </section>

        {/* Usage Instructions */}
        <section style={{ marginTop: '60px', padding: '20px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
          <h2 style={{ color: '#304B60', marginBottom: '16px' }}>
            Usage Instructions
          </h2>
          <pre style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '6px', overflow: 'auto' }}>
{`import StatusTimeline from './components/Application/StatusTimeline';

<StatusTimeline
  applicationId="app-123"
  currentStatus="Reviewed"
  statusHistory={[
    {
      status: 'Submitted',
      timestamp: new Date('2024-01-15T10:30:00'),
      note: null
    },
    {
      status: 'Reviewed',
      timestamp: new Date('2024-01-16T14:45:00'),
      note: 'Initial screening completed'
    }
  ]}
  onStatusUpdate={(data) => {
    console.log('Status updated:', data);
  }}
  className="custom-class"
/>`}
          </pre>

          <h3 style={{ color: '#304B60', marginTop: '24px', marginBottom: '12px' }}>
            Props
          </h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li><strong>applicationId</strong> (string): Unique application ID for Pusher subscription</li>
            <li><strong>currentStatus</strong> (string, required): Current application status</li>
            <li><strong>statusHistory</strong> (array, required): Array of status history entries</li>
            <li><strong>onStatusUpdate</strong> (function, optional): Callback when status is updated via Pusher</li>
            <li><strong>className</strong> (string, optional): Additional CSS classes</li>
          </ul>

          <h3 style={{ color: '#304B60', marginTop: '24px', marginBottom: '12px' }}>
            Features
          </h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>✅ Displays status stages in chronological order</li>
            <li>✅ Highlights current status with pulse animation</li>
            <li>✅ Shows timestamps for completed stages</li>
            <li>✅ Displays notes when provided</li>
            <li>✅ Real-time updates via Pusher</li>
            <li>✅ Responsive design (mobile, tablet, desktop)</li>
            <li>✅ RTL support for Arabic</li>
            <li>✅ Multi-language support (ar, en, fr)</li>
            <li>✅ Handles terminal statuses (Accepted, Rejected, Withdrawn)</li>
          </ul>
        </section>
      </div>
    </AppProvider>
  );
};

export default StatusTimelineExample;
