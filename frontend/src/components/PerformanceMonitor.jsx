import React, { useState, useEffect } from 'react';
import { getPerformanceMetrics, savePerformanceBaseline } from '../utils/performanceMeasurement';

/**
 * Performance Monitor Component
 * Displays FCP, TTI, and other Core Web Vitals metrics
 * Shows improvements compared to baseline
 */
const PerformanceMonitor = ({ visible = false }) => {
  const [metrics, setMetrics] = useState(null);
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      const currentMetrics = getPerformanceMetrics();
      setMetrics(currentMetrics);
    }, 2000);

    // Initial load
    setMetrics(getPerformanceMetrics());

    return () => clearInterval(interval);
  }, []);

  const handleSaveBaseline = () => {
    savePerformanceBaseline();
    alert('Baseline saved! Refresh the page to see improvements.');
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRatingIcon = (rating) => {
    switch (rating) {
      case 'good':
        return '🟢';
      case 'needs-improvement':
        return '🟡';
      case 'poor':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const formatValue = (value) => {
    if (!value) return 'N/A';
    return `${Math.round(value)}ms`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Show Performance Metrics"
      >
        📊 Performance
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 max-w-md z-50 border-2 border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          📊 Performance Metrics
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {metrics && metrics.metrics ? (
        <div className="space-y-3">
          {/* FCP - First Contentful Paint */}
          {metrics.metrics.FCP && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{getRatingIcon(metrics.metrics.FCP.rating)}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  FCP
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getRatingColor(metrics.metrics.FCP.rating)}`}>
                  {formatValue(metrics.metrics.FCP.value)}
                </div>
                {metrics.improvements.FCP && (
                  <div className="text-xs text-gray-500">
                    {metrics.improvements.FCP.percentage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TTI - Time to Interactive */}
          {metrics.metrics.TTI && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{getRatingIcon(metrics.metrics.TTI.rating)}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  TTI {metrics.metrics.TTI.estimated && '(est)'}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getRatingColor(metrics.metrics.TTI.rating)}`}>
                  {formatValue(metrics.metrics.TTI.value)}
                </div>
                {metrics.improvements.TTI && (
                  <div className="text-xs text-gray-500">
                    {metrics.improvements.TTI.percentage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LCP - Largest Contentful Paint */}
          {metrics.metrics.LCP && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{getRatingIcon(metrics.metrics.LCP.rating)}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  LCP
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getRatingColor(metrics.metrics.LCP.rating)}`}>
                  {formatValue(metrics.metrics.LCP.value)}
                </div>
              </div>
            </div>
          )}

          {/* CLS - Cumulative Layout Shift */}
          {metrics.metrics.CLS && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{getRatingIcon(metrics.metrics.CLS.rating)}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CLS
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getRatingColor(metrics.metrics.CLS.rating)}`}>
                  {metrics.metrics.CLS.value.toFixed(3)}
                </div>
              </div>
            </div>
          )}

          {/* FID - First Input Delay */}
          {metrics.metrics.FID && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{getRatingIcon(metrics.metrics.FID.rating)}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  FID
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getRatingColor(metrics.metrics.FID.rating)}`}>
                  {formatValue(metrics.metrics.FID.value)}
                </div>
              </div>
            </div>
          )}

          {/* TTFB - Time to First Byte */}
          {metrics.metrics.TTFB && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{getRatingIcon(metrics.metrics.TTFB.rating)}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  TTFB
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${getRatingColor(metrics.metrics.TTFB.rating)}`}>
                  {formatValue(metrics.metrics.TTFB.value)}
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSaveBaseline}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              💾 Save as Baseline
            </button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Open console and run <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">printPerformanceReport()</code>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading metrics...
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
