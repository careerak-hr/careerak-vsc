import { useState, useEffect } from 'react';

/**
 * Custom hook for detecting offline/online status
 * 
 * Requirements:
 * - FR-PWA-9: When the user is offline, the system shall queue failed API requests and retry when online
 * - NFR-REL-2: The system shall maintain offline functionality for previously visited pages
 * 
 * @returns {Object} - { isOffline: boolean, isOnline: boolean }
 */
const useOffline = () => {
  // Initialize with current online status
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Handler for when connection is restored
    const handleOnline = () => {
      console.log('[useOffline] Connection restored - now online');
      setIsOnline(true);
    };

    // Handler for when connection is lost
    const handleOffline = () => {
      console.log('[useOffline] Connection lost - now offline');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline
  };
};

export default useOffline;
