/**
 * Performance Measurement Utility
 * Measures FCP (First Contentful Paint) and TTI (Time to Interactive) improvements
 * Uses web-vitals library for accurate Core Web Vitals measurement
 */

import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } from 'web-vitals';

class PerformanceMeasurement {
  constructor() {
    this.metrics = {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTFB: null,
      INP: null,
      TTI: null,
    };
    
    this.baseline = null;
    this.improvements = {};
    this.initialized = false;
  }

  /**
   * Initialize performance measurement
   * Sets up web-vitals listeners and custom TTI measurement
   */
  init() {
    if (this.initialized) return;
    
    // Measure Core Web Vitals using web-vitals library
    this.measureCoreWebVitals();
    
    // Measure TTI (Time to Interactive) using custom implementation
    this.measureTTI();
    
    // Load baseline metrics if available
    this.loadBaseline();
    
    this.initialized = true;
    
    console.log('📊 Performance measurement initialized');
  }

  /**
   * Measure Core Web Vitals using web-vitals library
   */
  measureCoreWebVitals() {
    // First Contentful Paint (FCP)
    // Target: < 1.8s (good), < 3.0s (needs improvement)
    onFCP((metric) => {
      this.metrics.FCP = {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      };
      this.logMetric('FCP', metric);
      this.calculateImprovement('FCP');
    });

    // Largest Contentful Paint (LCP)
    // Target: < 2.5s (good), < 4.0s (needs improvement)
    onLCP((metric) => {
      this.metrics.LCP = {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      };
      this.logMetric('LCP', metric);
    });

    // First Input Delay (FID)
    // Target: < 100ms (good), < 300ms (needs improvement)
    onFID((metric) => {
      this.metrics.FID = {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      };
      this.logMetric('FID', metric);
    });

    // Cumulative Layout Shift (CLS)
    // Target: < 0.1 (good), < 0.25 (needs improvement)
    onCLS((metric) => {
      this.metrics.CLS = {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      };
      this.logMetric('CLS', metric);
    });

    // Time to First Byte (TTFB)
    // Target: < 800ms (good), < 1800ms (needs improvement)
    onTTFB((metric) => {
      this.metrics.TTFB = {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      };
      this.logMetric('TTFB', metric);
    });

    // Interaction to Next Paint (INP) - replaces FID in Chrome 96+
    // Target: < 200ms (good), < 500ms (needs improvement)
    onINP((metric) => {
      this.metrics.INP = {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        timestamp: Date.now(),
      };
      this.logMetric('INP', metric);
    });
  }

  /**
   * Measure Time to Interactive (TTI)
   * TTI is when the page is fully interactive (main thread quiet for 5s)
   * Target: < 3.8s (good), < 7.3s (needs improvement)
   */
  measureTTI() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported, TTI measurement unavailable');
      return;
    }

    // Use Long Tasks API to detect when main thread is quiet
    let longTasksCount = 0;
    let lastLongTaskEnd = 0;
    let ttiStartTime = performance.now();

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            longTasksCount++;
            lastLongTaskEnd = entry.startTime + entry.duration;
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });

      // Check for TTI after page load
      window.addEventListener('load', () => {
        // Wait 5 seconds after last long task to consider page interactive
        const checkTTI = () => {
          const now = performance.now();
          const timeSinceLastLongTask = now - lastLongTaskEnd;

          if (timeSinceLastLongTask >= 5000 || longTasksCount === 0) {
            const ttiValue = lastLongTaskEnd || now;
            
            this.metrics.TTI = {
              value: ttiValue,
              rating: this.getTTIRating(ttiValue),
              longTasksCount,
              timestamp: Date.now(),
            };
            
            this.logMetric('TTI', { value: ttiValue, rating: this.metrics.TTI.rating });
            this.calculateImprovement('TTI');
            
            observer.disconnect();
          } else {
            setTimeout(checkTTI, 1000);
          }
        };

        setTimeout(checkTTI, 5000);
      });
    } catch (error) {
      console.warn('Failed to measure TTI:', error);
      
      // Fallback: estimate TTI using load event
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          const estimatedTTI = navigation.loadEventEnd;
          
          this.metrics.TTI = {
            value: estimatedTTI,
            rating: this.getTTIRating(estimatedTTI),
            estimated: true,
            timestamp: Date.now(),
          };
          
          this.logMetric('TTI (estimated)', { value: estimatedTTI, rating: this.metrics.TTI.rating });
          this.calculateImprovement('TTI');
        }
      });
    }
  }

  /**
   * Get TTI rating based on value
   */
  getTTIRating(value) {
    if (value < 3800) return 'good';
    if (value < 7300) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Log metric to console with color coding
   */
  logMetric(name, metric) {
    const colors = {
      good: '🟢',
      'needs-improvement': '🟡',
      poor: '🔴',
    };

    const icon = colors[metric.rating] || '⚪';
    const value = Math.round(metric.value);
    
    console.log(`${icon} ${name}: ${value}ms (${metric.rating})`);
  }

  /**
   * Load baseline metrics from localStorage
   */
  loadBaseline() {
    try {
      const stored = localStorage.getItem('performance_baseline');
      if (stored) {
        this.baseline = JSON.parse(stored);
        console.log('📊 Loaded baseline metrics:', this.baseline);
      }
    } catch (error) {
      console.warn('Failed to load baseline metrics:', error);
    }
  }

  /**
   * Save current metrics as baseline
   */
  saveBaseline() {
    try {
      const baseline = {
        FCP: this.metrics.FCP?.value,
        TTI: this.metrics.TTI?.value,
        LCP: this.metrics.LCP?.value,
        FID: this.metrics.FID?.value,
        CLS: this.metrics.CLS?.value,
        TTFB: this.metrics.TTFB?.value,
        INP: this.metrics.INP?.value,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      localStorage.setItem('performance_baseline', JSON.stringify(baseline));
      this.baseline = baseline;
      
      console.log('💾 Saved baseline metrics:', baseline);
      return baseline;
    } catch (error) {
      console.error('Failed to save baseline metrics:', error);
      return null;
    }
  }

  /**
   * Calculate improvement percentage compared to baseline
   */
  calculateImprovement(metricName) {
    if (!this.baseline || !this.baseline[metricName]) {
      return null;
    }

    const current = this.metrics[metricName]?.value;
    const baseline = this.baseline[metricName];

    if (!current || !baseline) return null;

    const improvement = ((baseline - current) / baseline) * 100;
    
    this.improvements[metricName] = {
      current,
      baseline,
      improvement: Math.round(improvement * 10) / 10,
      percentage: `${improvement > 0 ? '+' : ''}${Math.round(improvement)}%`,
    };

    console.log(`📈 ${metricName} improvement: ${this.improvements[metricName].percentage}`);
    
    return this.improvements[metricName];
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    return {
      metrics: this.metrics,
      baseline: this.baseline,
      improvements: this.improvements,
      timestamp: Date.now(),
    };
  }

  /**
   * Get performance report
   */
  getReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      
      // Core Web Vitals
      coreWebVitals: {
        FCP: this.metrics.FCP,
        LCP: this.metrics.LCP,
        FID: this.metrics.FID,
        CLS: this.metrics.CLS,
        TTFB: this.metrics.TTFB,
        INP: this.metrics.INP,
        TTI: this.metrics.TTI,
      },
      
      // Improvements
      improvements: this.improvements,
      
      // Baseline
      baseline: this.baseline,
      
      // Summary
      summary: this.getSummary(),
    };

    return report;
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const metrics = this.metrics;
    
    const summary = {
      overallRating: this.getOverallRating(),
      goodMetrics: 0,
      needsImprovementMetrics: 0,
      poorMetrics: 0,
      totalMetrics: 0,
    };

    Object.values(metrics).forEach((metric) => {
      if (metric && metric.rating) {
        summary.totalMetrics++;
        if (metric.rating === 'good') summary.goodMetrics++;
        else if (metric.rating === 'needs-improvement') summary.needsImprovementMetrics++;
        else if (metric.rating === 'poor') summary.poorMetrics++;
      }
    });

    return summary;
  }

  /**
   * Get overall performance rating
   */
  getOverallRating() {
    const metrics = Object.values(this.metrics).filter(m => m && m.rating);
    
    if (metrics.length === 0) return 'unknown';
    
    const goodCount = metrics.filter(m => m.rating === 'good').length;
    const poorCount = metrics.filter(m => m.rating === 'poor').length;
    
    if (goodCount >= metrics.length * 0.75) return 'good';
    if (poorCount >= metrics.length * 0.25) return 'poor';
    return 'needs-improvement';
  }

  /**
   * Print report to console
   */
  printReport() {
    const report = this.getReport();
    
    console.group('📊 Performance Report');
    console.log('Timestamp:', report.timestamp);
    console.log('URL:', report.url);
    console.log('');
    
    console.group('Core Web Vitals');
    Object.entries(report.coreWebVitals).forEach(([name, metric]) => {
      if (metric) {
        const icon = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴';
        console.log(`${icon} ${name}: ${Math.round(metric.value)}ms (${metric.rating})`);
      }
    });
    console.groupEnd();
    
    if (Object.keys(report.improvements).length > 0) {
      console.log('');
      console.group('Improvements vs Baseline');
      Object.entries(report.improvements).forEach(([name, improvement]) => {
        const icon = improvement.improvement > 0 ? '📈' : '📉';
        console.log(`${icon} ${name}: ${improvement.percentage} (${Math.round(improvement.current)}ms vs ${Math.round(improvement.baseline)}ms)`);
      });
      console.groupEnd();
    }
    
    console.log('');
    console.log('Overall Rating:', report.summary.overallRating);
    console.log(`Good: ${report.summary.goodMetrics}, Needs Improvement: ${report.summary.needsImprovementMetrics}, Poor: ${report.summary.poorMetrics}`);
    
    console.groupEnd();
    
    return report;
  }

  /**
   * Send report to analytics (placeholder)
   */
  sendToAnalytics(report) {
    // In production, send to Google Analytics, Sentry, or custom endpoint
    if (process.env.NODE_ENV === 'production') {
      // Example: gtag('event', 'web_vitals', { ... });
      console.log('📤 Would send to analytics:', report);
    }
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTFB: null,
      INP: null,
      TTI: null,
    };
    this.improvements = {};
    console.log('🔄 Performance metrics reset');
  }
}

// Create singleton instance
const performanceMeasurement = new PerformanceMeasurement();

// Export instance and helper functions
export default performanceMeasurement;

export const initPerformanceMeasurement = () => {
  performanceMeasurement.init();
};

export const getPerformanceMetrics = () => {
  return performanceMeasurement.getMetrics();
};

export const getPerformanceReport = () => {
  return performanceMeasurement.getReport();
};

export const printPerformanceReport = () => {
  return performanceMeasurement.printReport();
};

export const savePerformanceBaseline = () => {
  return performanceMeasurement.saveBaseline();
};

export const resetPerformanceMetrics = () => {
  performanceMeasurement.reset();
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  window.performanceMeasurement = performanceMeasurement;
  window.getPerformanceReport = getPerformanceReport;
  window.printPerformanceReport = printPerformanceReport;
  window.savePerformanceBaseline = savePerformanceBaseline;
}
