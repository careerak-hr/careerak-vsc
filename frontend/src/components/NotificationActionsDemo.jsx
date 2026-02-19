/**
 * NotificationActionsDemo Component
 * Task 3.5.4: Display notifications with actions
 * 
 * Demo component to showcase notification actions functionality
 */

import React, { useState } from 'react';
import { useNotificationActions } from '../hooks/useNotificationActions';

const NotificationActionsDemo = () => {
  const {
    permission,
    isSupported,
    isEnabled,
    requestPermission,
    notifyJobMatch,
    notifyApplicationAccepted,
    notifyApplicationRejected,
    notifyApplicationReviewed,
    notifyNewApplication,
    notifyJobClosed,
    notifyCourseMatch,
    notifyNewMessage,
    notifySystem,
  } = useNotificationActions();

  const [status, setStatus] = useState('');

  const handleRequestPermission = async () => {
    setStatus('Requesting permission...');
    const result = await requestPermission();
    setStatus(`Permission: ${result}`);
  };

  const handleNotification = async (notifyFn, ...args) => {
    setStatus('Sending notification...');
    const success = await notifyFn(...args);
    setStatus(success ? 'Notification sent!' : 'Failed to send notification');
    setTimeout(() => setStatus(''), 3000);
  };

  if (!isSupported) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">
          Notifications Not Supported
        </h2>
        <p className="text-red-700">
          Your browser does not support notifications or service workers.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Notification Actions Demo
      </h2>

      {/* Permission Status */}
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Permission Status: <span className="font-bold">{permission}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enabled: <span className="font-bold">{isEnabled ? 'Yes' : 'No'}</span>
            </p>
          </div>
          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg">
          {status}
        </div>
      )}

      {/* Notification Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Match */}
        <button
          onClick={() =>
            handleNotification(
              notifyJobMatch,
              'Senior React Developer',
              'job123',
              '/jobs/job123'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">🎯 Job Match</div>
          <div className="text-sm opacity-90">
            Actions: View Job, Apply Now
          </div>
        </button>

        {/* Application Accepted */}
        <button
          onClick={() =>
            handleNotification(
              notifyApplicationAccepted,
              'Senior React Developer',
              'app123',
              'conv123'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">✅ Application Accepted</div>
          <div className="text-sm opacity-90">
            Actions: View Details, Send Message
          </div>
        </button>

        {/* Application Rejected */}
        <button
          onClick={() =>
            handleNotification(
              notifyApplicationRejected,
              'Senior React Developer',
              'app123',
              'Thank you for applying'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">❌ Application Rejected</div>
          <div className="text-sm opacity-90">
            Actions: View Feedback, Dismiss
          </div>
        </button>

        {/* Application Reviewed */}
        <button
          onClick={() =>
            handleNotification(
              notifyApplicationReviewed,
              'Senior React Developer',
              'app123',
              'under_review'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">📋 Application Reviewed</div>
          <div className="text-sm opacity-90">
            Actions: View Status, Dismiss
          </div>
        </button>

        {/* New Application (Employer) */}
        <button
          onClick={() =>
            handleNotification(
              notifyNewApplication,
              'John Doe',
              'Senior React Developer',
              'app123'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">📬 New Application</div>
          <div className="text-sm opacity-90">
            Actions: Review Now, Review Later
          </div>
        </button>

        {/* Job Closed */}
        <button
          onClick={() =>
            handleNotification(
              notifyJobClosed,
              'Senior React Developer',
              'job123',
              'Position filled'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">🔒 Job Closed</div>
          <div className="text-sm opacity-90">
            Actions: View Details, Dismiss
          </div>
        </button>

        {/* Course Match */}
        <button
          onClick={() =>
            handleNotification(
              notifyCourseMatch,
              'Advanced React Patterns',
              'course123',
              '/courses/course123'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">📚 Course Match</div>
          <div className="text-sm opacity-90">
            Actions: View Course, Enroll Now
          </div>
        </button>

        {/* New Message */}
        <button
          onClick={() =>
            handleNotification(
              notifyNewMessage,
              'Jane Smith',
              'Hello! I have a question about...',
              'conv123'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">💬 New Message</div>
          <div className="text-sm opacity-90">
            Actions: Reply, View Chat
          </div>
        </button>

        {/* System Notification */}
        <button
          onClick={() =>
            handleNotification(
              notifySystem,
              'System Update',
              'A new version is available',
              '/settings'
            )
          }
          disabled={!isEnabled}
          className="p-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="font-bold mb-1">🔔 System Notification</div>
          <div className="text-sm opacity-90">
            Actions: View, Dismiss
          </div>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
          📝 Instructions
        </h3>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• Click "Enable Notifications" to grant permission</li>
          <li>• Click any notification button to test</li>
          <li>• Notifications will appear with action buttons</li>
          <li>• Click actions to see navigation behavior</li>
          <li>• Works in Chrome, Firefox, Edge, and Safari</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationActionsDemo;
