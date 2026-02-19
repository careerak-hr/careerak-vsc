/**
 * VersionCheck Component
 * 
 * Checks for new application versions and prompts user to reload
 * Integrates with cache busting utilities
 * 
 * Requirements: FR-PERF-7
 */

import { useEffect, useState } from 'react';
import { 
  isNewVersionAvailable, 
  updateStoredVersion, 
  forceReload,
  getBuildVersion 
} from '../utils/cacheBusting';

const VersionCheck = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    // Check for new version on mount
    const checkVersion = () => {
      const version = getBuildVersion();
      setCurrentVersion(version);
      
      if (isNewVersionAvailable()) {
        setShowUpdatePrompt(true);
      } else {
        // Update stored version if it matches
        updateStoredVersion();
      }
    };

    checkVersion();

    // Check for updates every 5 minutes
    const interval = setInterval(checkVersion, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    updateStoredVersion();
    forceReload();
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    updateStoredVersion();
  };

  if (!showUpdatePrompt) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-[#304B60] p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg 
            className="w-6 h-6 text-[#D48161]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
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
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#304B60] dark:text-white mb-1">
            New Version Available
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Version {currentVersion} is ready. Reload to get the latest features and improvements.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#304B60] hover:bg-[#243a4d] rounded transition-colors"
              aria-label="Reload to update"
            >
              Reload Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs font-medium text-[#304B60] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Dismiss update notification"
            >
              Later
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close notification"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VersionCheck;
