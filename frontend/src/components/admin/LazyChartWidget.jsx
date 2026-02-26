/**
 * LazyChartWidget - Lazy-loaded wrapper for chart components
 * 
 * Implements code splitting for chart components to reduce initial bundle size
 * Requirements: 11.1 (Dashboard load within 2 seconds)
 * 
 * Features:
 * - React.lazy() for dynamic imports
 * - Suspense boundary with loading state
 * - Performance tracking
 * - Error boundary for graceful fallback
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { trackChartLoad } from '../../utils/performanceMonitoring';

// Loading spinner component
const ChartLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Loading chart...</p>
    </div>
  </div>
);

// Error fallback component
const ChartErrorFallback = ({ error, retry }) => (
  <div className="flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg shadow">
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="text-red-500 dark:text-red-400">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-red-800 dark:text-red-200">Failed to load chart</p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error?.message || 'Unknown error'}</p>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
);

ChartErrorFallback.propTypes = {
  error: PropTypes.object,
  retry: PropTypes.func,
};

// Lazy load chart components
const lazyChartComponents = {
  UsersChartWidget: lazy(() => import('./UsersChartWidget')),
  JobsChartWidget: lazy(() => import('./JobsChartWidget')),
  CoursesChartWidget: lazy(() => import('./CoursesChartWidget')),
  ReviewsChartWidget: lazy(() => import('./ReviewsChartWidget')),
  RevenueChartWidget: lazy(() => import('./RevenueChartWidget')),
};

/**
 * LazyChartWidget Component
 * 
 * Dynamically loads chart components with performance tracking
 * 
 * @param {string} chartType - Type of chart to load (users, jobs, courses, reviews, revenue)
 * @param {object} props - Props to pass to the chart component
 */
const LazyChartWidget = ({ chartType, ...props }) => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [startTime] = useState(() => performance.now());

  // Get the lazy component
  const ChartComponent = lazyChartComponents[chartType];

  // Track load time when component mounts
  useEffect(() => {
    const loadTime = trackChartLoad(chartType, startTime);
    
    // Log warning if load time exceeds 1 second
    if (loadTime > 1000) {
      console.warn(`⚠️ ${chartType} took ${loadTime.toFixed(2)}ms to load (> 1000ms)`);
    }
  }, [chartType, startTime]);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  // Error boundary
  if (error) {
    return <ChartErrorFallback error={error} retry={handleRetry} />;
  }

  // Validate chart type
  if (!ChartComponent) {
    return (
      <ChartErrorFallback 
        error={{ message: `Unknown chart type: ${chartType}` }} 
        retry={null}
      />
    );
  }

  return (
    <Suspense fallback={<ChartLoadingSpinner />}>
      <ErrorBoundary
        onError={setError}
        resetKey={retryCount}
      >
        <ChartComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

LazyChartWidget.propTypes = {
  chartType: PropTypes.oneOf([
    'UsersChartWidget',
    'JobsChartWidget',
    'CoursesChartWidget',
    'ReviewsChartWidget',
    'RevenueChartWidget',
  ]).isRequired,
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
    console.error('Chart component error:', error, errorInfo);
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

export default LazyChartWidget;
