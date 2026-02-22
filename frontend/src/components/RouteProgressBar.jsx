import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ProgressBar from './Loading/ProgressBar';
import useRouteProgress from '../hooks/useRouteProgress';

/**
 * RouteProgressBar Component
 * 
 * Displays a progress bar at the top of the page during route navigation
 * 
 * Features:
 * - Automatic progress tracking during route changes
 * - Smooth animations with Framer Motion
 * - Fixed positioning at top of viewport
 * - Respects prefers-reduced-motion
 * - Screen reader announcements
 * 
 * Requirements:
 * - FR-LOAD-2: Display progress bar at top during page loads
 * - Property LOAD-4: Progress bar visible when page loading
 * 
 * Usage:
 * <RouteProgressBar />
 * 
 * Place this component in ApplicationShell or AppRoutes
 */
const RouteProgressBar = () => {
  const { isNavigating, progress } = useRouteProgress();

  return (
    <AnimatePresence>
      {isNavigating && (
        <ProgressBar
          progress={progress}
          position="top"
          height="h-1"
          color="accent"
          showPercentage={false}
          announceToScreenReader={true}
          loadingMessage="Loading page"
        />
      )}
    </AnimatePresence>
  );
};

export default RouteProgressBar;
