/**
 * WithdrawalButton Example
 * 
 * Demonstrates usage of the WithdrawalButton component
 * with different application statuses
 */

import React, { useState } from 'react';
import WithdrawalButton from './WithdrawalButton';
import StatusTimeline from './StatusTimeline';

const WithdrawalButtonExample = () => {
  const [applications, setApplications] = useState([
    {
      id: '1',
      status: 'Submitted',
      statusHistory: [
        {
          status: 'Submitted',
          timestamp: new Date('2024-01-15T10:00:00'),
          note: 'Application submitted'
        }
      ]
    },
    {
      id: '2',
      status: 'Reviewed',
      statusHistory: [
        {
          status: 'Submitted',
          timestamp: new Date('2024-01-10T10:00:00'),
          note: 'Application submitted'
        },
        {
          status: 'Reviewed',
          timestamp: new Date('2024-01-12T14:30:00'),
          note: 'Application reviewed by HR'
        }
      ]
    },
    {
      id: '3',
      status: 'Shortlisted',
      statusHistory: [
        {
          status: 'Submitted',
          timestamp: new Date('2024-01-05T10:00:00'),
          note: 'Application submitted'
        },
        {
          status: 'Reviewed',
          timestamp: new Date('2024-01-07T14:30:00'),
          note: 'Application reviewed by HR'
        },
        {
          status: 'Shortlisted',
          timestamp: new Date('2024-01-10T09:00:00'),
          note: 'Candidate shortlisted for interview'
        }
      ]
    }
  ]);

  const handleWithdrawSuccess = (applicationId) => (data) => {
    console.log('Withdrawal successful:', data);
    
    // Update application status
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: 'Withdrawn',
          statusHistory: [
            ...app.statusHistory,
            {
              status: 'Withdrawn',
              timestamp: new Date(data.withdrawnAt),
              note: 'Application withdrawn by applicant'
            }
          ]
        };
      }
      return app;
    }));
  };

  const handleWithdrawError = (error) => {
    console.error('Withdrawal failed:', error);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: '#304B60' }}>
        Withdrawal Button Examples
      </h1>

      {applications.map((app, index) => (
        <div
          key={app.id}
          style={{
            marginBottom: '3rem',
            padding: '2rem',
            backgroundColor: '#E3DAD1',
            borderRadius: '1rem',
            border: '2px solid #304B60'
          }}
        >
          <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
            Example {index + 1}: {app.status} Application
          </h2>

          {/* Status Timeline */}
          <StatusTimeline
            applicationId={app.id}
            currentStatus={app.status}
            statusHistory={app.statusHistory}
          />

          {/* Withdrawal Button */}
          <WithdrawalButton
            applicationId={app.id}
            currentStatus={app.status}
            onWithdrawSuccess={handleWithdrawSuccess(app.id)}
            onWithdrawError={handleWithdrawError}
          />

          {/* Status Info */}
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            {app.status === 'Submitted' && (
              <p>✅ Withdrawal button is displayed (status: Submitted)</p>
            )}
            {app.status === 'Reviewed' && (
              <p>✅ Withdrawal button is displayed (status: Reviewed)</p>
            )}
            {app.status === 'Shortlisted' && (
              <p>❌ Withdrawal button is NOT displayed (status: Shortlisted - not allowed)</p>
            )}
            {app.status === 'Withdrawn' && (
              <p>✅ Application has been withdrawn successfully</p>
            )}
          </div>
        </div>
      ))}

      {/* Usage Instructions */}
      <div
        style={{
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: '#FFF',
          borderRadius: '1rem',
          border: '2px solid #304B60'
        }}
      >
        <h2 style={{ marginBottom: '1rem', color: '#304B60' }}>
          Usage Instructions
        </h2>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#304B60' }}>
          Basic Usage:
        </h3>
        <pre style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto' }}>
{`import WithdrawalButton from './components/Application/WithdrawalButton';

<WithdrawalButton
  applicationId="123"
  currentStatus="Submitted"
  onWithdrawSuccess={(data) => {
    console.log('Withdrawn:', data);
    // Update UI, refresh data, etc.
  }}
  onWithdrawError={(error) => {
    console.error('Error:', error);
  }}
/>`}
        </pre>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#304B60' }}>
          Withdrawal Rules:
        </h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>✅ Allowed for status: <strong>Submitted</strong>, <strong>Reviewed</strong></li>
          <li>❌ Not allowed for status: <strong>Shortlisted</strong>, <strong>Interview Scheduled</strong>, <strong>Accepted</strong>, <strong>Rejected</strong></li>
          <li>🔒 Requires confirmation dialog before withdrawal</li>
          <li>📧 Sends notification to employer after withdrawal</li>
          <li>📊 Updates status timeline automatically</li>
        </ul>

        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: '#304B60' }}>
          Features:
        </h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li>🌍 Multi-language support (Arabic, English, French)</li>
          <li>📱 Responsive design (mobile, tablet, desktop)</li>
          <li>♿ Accessibility compliant (ARIA labels, keyboard navigation)</li>
          <li>🎨 RTL/LTR layout support</li>
          <li>⚡ Real-time status updates via Pusher</li>
          <li>✅ Success/error message handling</li>
          <li>🔄 Loading states during API calls</li>
        </ul>
      </div>
    </div>
  );
};

export default WithdrawalButtonExample;
