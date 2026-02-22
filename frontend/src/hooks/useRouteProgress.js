import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useRouteProgress Hook
 * 
 * Tracks route navigation progress for displaying a progress bar
 * 
 * Features:
 * - Automatic progress simulation during route changes
 * - Smooth progress increments
 * - Completion detection
 * - Reset on navigation complete
 * 
 * Returns:
 * - isNavigating: boolean - whether navigation is in progress
 * - progress: number - current progress (0-100)
 * 
 * Usage:
 * const { isNavigating, progress } = useRouteProgress();
 */
const useRouteProgress = () => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start navigation progress
    setIsNavigating(true);
    setProgress(0);

    // Simulate progress increments
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we approach 90%
        if (prev >= 90) {
          return Math.min(prev + 1, 95);
        } else if (prev >= 70) {
          return prev + 5;
        } else if (prev >= 50) {
          return prev + 10;
        } else {
          return prev + 20;
        }
      });
    }, 100);

    // Complete progress after a short delay (simulating page load)
    const completeTimeout = setTimeout(() => {
      setProgress(100);
      
      // Hide progress bar after completion animation
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 300);
    }, 500);

    // Cleanup
    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [location.pathname]);

  return {
    isNavigating,
    progress
  };
};

export default useRouteProgress;
