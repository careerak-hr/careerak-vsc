/**
 * LazyWidget - Lazy-loaded wrapper for widget components
 * 
 * Implements code splitting for widget components to reduce initial bundle size
 * Requirements: 11.1 (Dashboard load within 2 seconds)
 * 
 * Features:
 * - React.lazy() for dynamic imports
 * - Suspense boundary with loading state
 * - Performance tracking
 * - Error boundary for graceful fallback
 * - Intersection Observer for viewport-based loading
 */

import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { trackWidgetLoad } from '../../utils/performanceMonitoring';

// Loading skeleton component
const WidgetLoadingSkeleton = ({ height = '200px' }) => (
  <div 
    className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
    style={{ height }}
  >
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
    </div>
  </div>
);

WidgetLoadingSkeleton.propTypes = {
  height: PropTypes.string,
};

// Error fallback component
const WidgetErrorFallback = ({ error, retry, widgetName }) => (
  <div className="flex items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow">
    <div className="flex flex-col items-center space-y-3 text-center">
      <div className="text-red-500 dark:text-red-400">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          Failed to load {widgetName || 'widget'}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          {error?.message || 'Unknown error'}
        </p>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

WidgetErrorFallback.propTypes = {
  error: PropTypes.object,
  retry: PropTypes.func,
  widgetName: PropTypes.string,
};

// Lazy load widget components
const lazyWidgetComponents = {
  StatisticsWidget: lazy(() => import('./StatisticsWidget')),
  ActivityLogWidget: lazy(() => import('./ActivityLogWidget')),
  NotificationCenter: lazy(() => import('./NotificationCenter')),
  RecentUsersWidget: lazy(() => import('./RecentUsersWidget')),
  RecentJobsWidget: lazy(() => import('./RecentJobsWidget')),
  RecentApplicationsWidget: lazy(() => import('./RecentApplicationsWidget')),
  FlaggedReviewsWidget: lazy(() => import('./FlaggedReviewsWidget')),
  ExportModal: lazy(() => import('./ExportModal')),
};

/**
 * LazyWidget Component
 * 
 * Dynamically loads widget components with performance tracking
 * Supports viewport-based loading (only load when visible)
 * 
 * @param {string} widgetType - Type of widget to load
 * @param {boolean} lazyLoad - Whether to use Intersection Observer for viewport-based loading
 * @param {string} height - Height for loading skeleton
 * @param {object} props - Props to pass to the widget component
 */
const LazyWidget = ({ widgetType, lazyLoad = true, height = '200px', ...props }) => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [startTime] = useState(() => performance.now());
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
  const containerRef = useRef(null);

  // Get the lazy component
  const WidgetComponent = lazyWidgetComponents[widgetType];

  // Intersection Observer for viewport-based loading
  useEffect(() => {
    if (!lazyLoad || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, shouldLoad]);

  // Track load time when component mounts
  useEffect(() => {
    if (shouldLoad) {
      const loadTime = trackWidgetLoad(widgetType, startTime);
      
      // Log warning if load time exceeds 500ms
      if (loadTime > 500) {
        console.warn(`⚠️ ${widgetType} took ${loadTime.toFixed(2)}ms to load (> 500ms)`);
      }
    }
  }, [widgetType, startTime, shouldLoad]);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Error boundary
  if (error) {
    return <WidgetErrorFallback error={error} retry={handleRetry} widgetName={widgetType} />;
  }

  // Validate widget type
  if (!WidgetComponent) {
    return (
      <WidgetErrorFallback 
        error={{ message: `Unknown widget type: ${widgetType}` }} 
        retry={null}
        widgetName={widgetType}
      />
    );
  }

  // Show skeleton while waiting for viewport intersection
  if (!shouldLoad) {
    return (
      <div ref={containerRef}>
        <WidgetLoadingSkeleton height={height} />
      </div>
    );
  }

  return (
    <Suspense fallback={<WidgetLoadingSkeleton height={height} />}>
      <ErrorBoundary
        onError={setError}
        resetKey={retryCount}
      >
        <WidgetComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

LazyWidget.propTypes = {
  widgetType: PropTypes.oneOf([
    'StatisticsWidget',
    'ActivityLogWidget',
    'NotificationCenter',
    'RecentUsersWidget',
    'RecentJobsWidget',
    'RecentApplicationsWidget',
    'FlaggedReviewsWidget',
    'ExportModal',
  ]).isRequired,
  lazyLoad: PropTypes.bool,
  height: PropTypes.string,
};

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Widget component error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  componentDidUpdate(prevProps) {
    // Reset error state when resetKey changes (for retry)
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle error display
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func,
  resetKey: PropTypes.number,
};

export default LazyWidget;
