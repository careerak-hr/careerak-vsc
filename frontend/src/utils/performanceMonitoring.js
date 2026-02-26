/**
 * Performance Monitoring Utility
 * 
 * Tracks Web Vitals and custom performance metrics for the admin dashboard
 * Requirements: 11.1 (Dashboard load within 2 seconds)
 * 
 * Metrics tracked:
 * - FCP (First Contentful Paint): < 1.8s
 * - LCP (Largest Contentful Paint): < 2.5s
 * - CLS (Cumulative Layout Shift): < 0.1
 * - TTI (Time to Interactive): < 3.8s
 * - TBT (Total Blocking Time): < 300ms
 * - Dashboard Load Time: < 2s
 */

import { onCLS, onFCP, onLCP, onTTI, onFID } from 'web-vitals';

// Performance metrics storage
const metrics = {
  fcp: null,
  lcp: null,
  cls: null,
  tti: null,
  fid: null,
  dashboardLoadTime: null,
  chartLoadTimes: {},
  widgetLoadTimes: {},
};

// Performance thresholds (from requirements)
const THRESHOLDS = {
  fcp: 1800, // 1.8s
  lcp: 2500, // 2.5s
  cls: 0.1,
  tti: 3800, // 3.8s
  tbt: 300, // 300ms
  dashboardLoad: 2000, // 2s
};

// Callbacks for metric updates
const callbacks = [];

/**
 * Initialize Web Vitals monitoring
 */
export const initPerformanceMonitoring = () => {
  // Track FCP (First Contentful Paint)
  onFCP((metric) => {
    metrics.fcp = metric.value;
    notifyCallbacks('fcp', metric);
    
    // Log if threshold exceeded
    if (metric.value > THRESHOLDS.fcp) {
      console.warn(`⚠️ FCP exceeded threshold: ${metric.value}ms > ${THRESHOLDS.fcp}ms`);
    }
  });

  // Track LCP (Largest Contentful Paint)
  onLCP((metric) => {
    metrics.lcp = metric.value;
    notifyCallbacks('lcp', metric);
    
    if (metric.value > THRESHOLDS.lcp) {
      console.warn(`⚠️ LCP exceeded threshold: ${metric.value}ms > ${THRESHOLDS.lcp}ms`);
    }
  });

  // Track CLS (Cumulative Layout Shift)
  onCLS((metric) => {
    metrics.cls = metric.value;
    notifyCallbacks('cls', metric);
    
    if (metric.value > THRESHOLDS.cls) {
      console.warn(`⚠️ CLS exceeded threshold: ${metric.value} > ${THRESHOLDS.cls}`);
    }
  });

  // Track TTI (Time to Interactive)
  onTTI((metric) => {
    metrics.tti = metric.value;
    notifyCallbacks('tti', metric);
    
    if (metric.value > THRESHOLDS.tti) {
      console.warn(`⚠️ TTI exceeded threshold: ${metric.value}ms > ${THRESHOLDS.tti}ms`);
    }
  });

  // Track FID (First Input Delay)
  onFID((metric) => {
    metrics.fid = metric.value;
    notifyCallbacks('fid', metric);
  });

  // Track dashboard load time
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        metrics.dashboardLoadTime = loadTime;
        notifyCallbacks('dashboardLoad', { value: loadTime });
        
        if (loadTime > THRESHOLDS.dashboardLoad) {
          console.warn(`⚠️ Dashboard load exceeded threshold: ${loadTime}ms > ${THRESHOLDS.dashboardLoad}ms`);
        } else {
          console.log(`✓ Dashboard loaded in ${loadTime}ms`);
        }
      }, 0);
    });
  }
};

/**
 * Track chart component load time
 * @param {string} chartName - Name of the chart component
 * @param {number} startTime - Performance.now() when component started loading
 */
export const trackChartLoad = (chartName, startTime) => {
  const loadTime = performance.now() - startTime;
  metrics.chartLoadTimes[chartName] = loadTime;
  
  console.log(`📊 ${chartName} loaded in ${loadTime.toFixed(2)}ms`);
  notifyCallbacks('chartLoad', { name: chartName, value: loadTime });
  
  return loadTime;
};

/**
 * Track widget component load time
 * @param {string} widgetName - Name of the widget component
 * @param {number} startTime - Performance.now() when component started loading
 */
export const trackWidgetLoad = (widgetName, startTime) => {
  const loadTime = performance.now() - startTime;
  metrics.widgetLoadTimes[widgetName] = loadTime;
  
  console.log(`🔧 ${widgetName} loaded in ${loadTime.toFixed(2)}ms`);
  notifyCallbacks('widgetLoad', { name: widgetName, value: loadTime });
  
  return loadTime;
};

/**
 * Mark a performance milestone
 * @param {string} name - Milestone name
 */
export const markPerformance = (name) => {
  if (window.performance && window.performance.mark) {
    window.performance.mark(name);
  }
};

/**
 * Measure time between two performance marks
 * @param {string} name - Measure name
 * @param {string} startMark - Start mark name
 * @param {string} endMark - End mark name
 * @returns {number} Duration in milliseconds
 */
export const measurePerformance = (name, startMark, endMark) => {
  if (window.performance && window.performance.measure) {
    try {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];
      return measure.duration;
    } catch (error) {
      console.error('Performance measurement failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Get all collected metrics
 * @returns {object} All performance metrics
 */
export const getMetrics = () => {
  return { ...metrics };
};

/**
 * Get metrics summary with pass/fail status
 * @returns {object} Metrics summary
 */
export const getMetricsSummary = () => {
  return {
    fcp: {
      value: metrics.fcp,
      threshold: THRESHOLDS.fcp,
      passed: metrics.fcp ? metrics.fcp <= THRESHOLDS.fcp : null,
      unit: 'ms',
    },
    lcp: {
      value: metrics.lcp,
      threshold: THRESHOLDS.lcp,
      passed: metrics.lcp ? metrics.lcp <= THRESHOLDS.lcp : null,
      unit: 'ms',
    },
    cls: {
      value: metrics.cls,
      threshold: THRESHOLDS.cls,
      passed: metrics.cls !== null ? metrics.cls <= THRESHOLDS.cls : null,
      unit: '',
    },
    tti: {
      value: metrics.tti,
      threshold: THRESHOLDS.tti,
      passed: metrics.tti ? metrics.tti <= THRESHOLDS.tti : null,
      unit: 'ms',
    },
    dashboardLoad: {
      value: metrics.dashboardLoadTime,
      threshold: THRESHOLDS.dashboardLoad,
      passed: metrics.dashboardLoadTime ? metrics.dashboardLoadTime <= THRESHOLDS.dashboardLoad : null,
      unit: 'ms',
    },
  };
};

/**
 * Log metrics summary to console
 */
export const logMetricsSummary = () => {
  const summary = getMetricsSummary();
  
  console.group('📊 Performance Metrics Summary');
  
  Object.entries(summary).forEach(([key, data]) => {
    if (data.value !== null) {
      const status = data.passed ? '✓' : '✗';
      const color = data.passed ? 'color: green' : 'color: red';
      console.log(
        `%c${status} ${key.toUpperCase()}: ${data.value.toFixed(2)}${data.unit} (threshold: ${data.threshold}${data.unit})`,
        color
      );
    }
  });
  
  // Log chart load times
  if (Object.keys(metrics.chartLoadTimes).length > 0) {
    console.group('📊 Chart Load Times');
    Object.entries(metrics.chartLoadTimes).forEach(([name, time]) => {
      console.log(`  ${name}: ${time.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
  
  // Log widget load times
  if (Object.keys(metrics.widgetLoadTimes).length > 0) {
    console.group('🔧 Widget Load Times');
    Object.entries(metrics.widgetLoadTimes).forEach(([name, time]) => {
      console.log(`  ${name}: ${time.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
};

/**
 * Subscribe to metric updates
 * @param {function} callback - Callback function (metricName, metricData) => void
 * @returns {function} Unsubscribe function
 */
export const onMetricUpdate = (callback) => {
  callbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  };
};

/**
 * Notify all callbacks of metric update
 * @param {string} metricName - Name of the metric
 * @param {object} metricData - Metric data
 */
const notifyCallbacks = (metricName, metricData) => {
  callbacks.forEach(callback => {
    try {
      callback(metricName, metricData);
    } catch (error) {
      console.error('Error in performance callback:', error);
    }
  });
};

/**
 * Send metrics to analytics endpoint (optional)
 * @param {string} endpoint - Analytics endpoint URL
 */
export const sendMetricsToAnalytics = async (endpoint) => {
  const summary = getMetricsSummary();
  
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: summary,
        chartLoadTimes: metrics.chartLoadTimes,
        widgetLoadTimes: metrics.widgetLoadTimes,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    });
  } catch (error) {
    console.error('Failed to send metrics to analytics:', error);
  }
};

/**
 * Reset all metrics (useful for testing)
 */
export const resetMetrics = () => {
  metrics.fcp = null;
  metrics.lcp = null;
  metrics.cls = null;
  metrics.tti = null;
  metrics.fid = null;
  metrics.dashboardLoadTime = null;
  metrics.chartLoadTimes = {};
  metrics.widgetLoadTimes = {};
};

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize on next tick to ensure DOM is ready
  setTimeout(() => {
    initPerformanceMonitoring();
  }, 0);
  
  // Log summary after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      logMetricsSummary();
    }, 3000); // Wait 3s for all metrics to be collected
  });
}

export default {
  initPerformanceMonitoring,
  trackChartLoad,
  trackWidgetLoad,
  markPerformance,
  measurePerformance,
  getMetrics,
  getMetricsSummary,
  logMetricsSummary,
  onMetricUpdate,
  sendMetricsToAnalytics,
  resetMetrics,
};
