import React, { useEffect, useState } from 'react';
import { isNewVersionAvailable, updateStoredVersion, forceReload, getBuildVersion } from '../utils/cacheBusting';

/**
 * VersionUpdateNotification Component
 * 
 * Displays a notification when a new version of the app is available.
 * Prompts the user to reload to get the latest version.
 * 
 * Features:
 * - Automatic version detection
 * - User-friendly notification
 * - Manual reload button
 * - Dismissible notification
 * - Multi-language support
 */
const VersionUpdateNotification = ({ 
  checkInterval = 60000, // Check every 60 seconds
  autoCheck = true,
  position = 'bottom-right' // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [newVersion, setNewVersion] = useState('');

  useEffect(() => {
    // Check on mount
    checkForUpdate();

    // Set up periodic checking if enabled
    if (autoCheck) {
      const interval = setInterval(checkForUpdate, checkInterval);
      return () => clearInterval(interval);
    }
  }, [autoCheck, checkInterval]);

  const checkForUpdate = () => {
    if (isNewVersionAvailable()) {
      const version = getBuildVersion();
      setNewVersion(version);
      setShowNotification(true);
    }
  };

  const handleReload = () => {
    updateStoredVersion();
    forceReload();
  };

  const handleDismiss = () => {
    setShowNotification(false);
    // Update version to prevent showing again until next actual update
    updateStoredVersion();
  };

  if (!showNotification) return null;

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div 
      className={`fixed ${positionClasses[position]} z-[9999] max-w-sm animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-[#304B60] p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg 
                className="h-6 w-6 text-[#D48161]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-[#304B60] dark:text-white">
                تحديث متاح
              </h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D48161] rounded"
            aria-label="إغلاق"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            إصدار جديد من التطبيق متاح ({newVersion}). يرجى إعادة تحميل الصفحة للحصول على آخر التحديثات.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            New version available. Please reload to get the latest updates.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleReload}
            className="flex-1 bg-[#304B60] hover:bg-[#243850] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D48161] focus:ring-offset-2"
          >
            إعادة التحميل
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D48161] focus:ring-offset-2"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionUpdateNotification;
