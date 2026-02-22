/**
 * CLS Loading Measurement Utility
 * 
 * Measures Cumulative Layout Shift (CLS) specifically during loading states
 * to ensure loading transitions don't cause layout shifts.
 * 
 * Requirements:
 * - Task 8.5.5: Measure CLS during loading
 * - NFR-PERF-5: Achieve CLS < 0.1
 * - Property LOAD-5: CLS(loadingState) < 0.1
 * 
 * @module clsLoadingMeasurement
 */

import { onCLS } from 'web-vitals';

class CLSLoadingMeasurement {
  constructor() {
    this.measurements = [];
    this.currentLoadingSession = null;
    this.clsObserver = null;
    this.sessionCLS = 0;
    this.initialized = false;
    this.thresholds = {
      good: 0.1,
      needsImprovement: 0.25,
    };
  }

  /**
   * Initialize CLS measurement for loading states
   */
  init() {
    if (this.initialized) return;

    // Set up web-vitals CLS monitoring
    this.setupWebVitalsCLS();

    // Set up custom PerformanceObserver for detailed tracking
    this.setupPerformanceObserver();

    this.initialized = true;
    console.log('📊 CLS Loading Measurement initialized');
  }

  /**
   * Set up web-vitals CLS monitoring
   */
  setupWebVitalsCLS() {
    onCLS((metric) => {
      this.sessionCLS = metric.value;
      
      // If we're in a loading session, record the CLS
      if (this.currentLoadingSession) {
        this.currentLoadingSession.currentCLS = metric.value;
      }

      // Log if CLS exceeds threshold
      if (metric.value > this.thresholds.good) {
        console.warn(`⚠️ CLS exceeds threshold: ${metric.value.toFixed(4)} (threshold: ${this.thresholds.good})`);
      }
    });
  }

  /**
   * Set up PerformanceObserver for detailed layout shift tracking
   */
  setupPerformanceObserver() {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported, detailed CLS tracking unavailable');
      return;
    }

    try {
      this.clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Only count layout shifts that weren't caused by user input
          if (!entry.hadRecentInput) {
            this.handleLayoutShift(entry);
          }
        }
      });

      this.clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.error('Failed to set up CLS observer:', error);
    }
  }

  /**
   * Handle individual layout shift entry
   */
  handleLayoutShift(entry) {
    const shift = {
      value: entry.value,
      timestamp: entry.startTime,
      sources: entry.sources?.map(source => ({
        node: source.node?.tagName || 'unknown',
        previousRect: source.previousRect,
        currentRect: source.currentRect,
      })) || [],
    };

    // If we're in a loading session, add to session shifts
    if (this.currentLoadingSession) {
      this.currentLoadingSession.shifts.push(shift);
      this.currentLoadingSession.totalShift += entry.value;
    }

    // Log significant shifts
    if (entry.value > 0.01) {
      console.log(`📐 Layout shift detected: ${entry.value.toFixed(4)}`, shift.sources);
    }
  }

  /**
   * Start measuring CLS for a loading session
   * 
   * @param {string} componentName - Name of the component loading
   * @param {Object} options - Additional options
   * @returns {string} Session ID
   * 
   * @example
   * const sessionId = clsMeasurement.startLoadingSession('JobPostingsPage');
   * // ... loading happens ...
   * clsMeasurement.endLoadingSession(sessionId);
   */
  startLoadingSession(componentName, options = {}) {
    const sessionId = `${componentName}-${Date.now()}`;
    
    this.currentLoadingSession = {
      id: sessionId,
      componentName,
      startTime: performance.now(),
      startCLS: this.sessionCLS,
      currentCLS: this.sessionCLS,
      totalShift: 0,
      shifts: [],
      options,
      status: 'active',
    };

    console.log(`🔄 Started CLS measurement for: ${componentName}`);
    return sessionId;
  }

  /**
   * End measuring CLS for a loading session
   * 
   * @param {string} sessionId - Session ID from startLoadingSession
   * @returns {Object} Measurement result
   * 
   * @example
   * const result = clsMeasurement.endLoadingSession(sessionId);
   * console.log('CLS during loading:', result.clsDuringLoading);
   */
  endLoadingSession(sessionId) {
    if (!this.currentLoadingSession || this.currentLoadingSession.id !== sessionId) {
      console.warn(`No active loading session found for: ${sessionId}`);
      return null;
    }

    const session = this.currentLoadingSession;
    const endTime = performance.now();
    const duration = endTime - session.startTime;
    const clsDuringLoading = session.currentCLS - session.startCLS;

    const result = {
      id: session.id,
      componentName: session.componentName,
      duration,
      startCLS: session.startCLS,
      endCLS: session.currentCLS,
      clsDuringLoading,
      totalShift: session.totalShift,
      shiftsCount: session.shifts.length,
      shifts: session.shifts,
      rating: this.getRating(clsDuringLoading),
      passed: clsDuringLoading < this.thresholds.good,
      timestamp: Date.now(),
    };

    // Store measurement
    this.measurements.push(result);

    // Log result
    this.logResult(result);

    // Clear current session
    this.currentLoadingSession = null;

    return result;
  }

  /**
   * Get rating for CLS value
   */
  getRating(cls) {
    if (cls < this.thresholds.good) return 'good';
    if (cls < this.thresholds.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Log measurement result
   */
  logResult(result) {
    const icon = result.rating === 'good' ? '✅' : result.rating === 'needs-improvement' ? '⚠️' : '❌';
    const cls = result.clsDuringLoading.toFixed(4);
    
    console.group(`${icon} CLS Measurement: ${result.componentName}`);
    console.log(`Duration: ${Math.round(result.duration)}ms`);
    console.log(`CLS during loading: ${cls} (${result.rating})`);
    console.log(`Layout shifts: ${result.shiftsCount}`);
    console.log(`Total shift value: ${result.totalShift.toFixed(4)}`);
    
    if (result.shifts.length > 0) {
      console.log('Shifts:', result.shifts);
    }
    
    if (!result.passed) {
      console.warn(`⚠️ CLS exceeds threshold of ${this.thresholds.good}`);
    }
    
    console.groupEnd();
  }

  /**
   * Measure CLS for a specific loading operation
   * 
   * @param {string} componentName - Component name
   * @param {Function} loadingFn - Async function that performs loading
   * @returns {Promise<Object>} Measurement result
   * 
   * @example
   * const result = await clsMeasurement.measureLoading('JobList', async () => {
   *   await fetchJobs();
   *   renderJobs();
   * });
   */
  async measureLoading(componentName, loadingFn) {
    const sessionId = this.startLoadingSession(componentName);
    
    try {
      await loadingFn();
      
      // Wait a bit for any final layout shifts
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return this.endLoadingSession(sessionId);
    } catch (error) {
      console.error(`Error during loading measurement for ${componentName}:`, error);
      
      if (this.currentLoadingSession) {
        this.currentLoadingSession.error = error.message;
        return this.endLoadingSession(sessionId);
      }
      
      throw error;
    }
  }

  /**
   * Get all measurements
   */
  getMeasurements() {
    return {
      measurements: this.measurements,
      summary: this.getSummary(),
      currentSession: this.currentLoadingSession,
      timestamp: Date.now(),
    };
  }

  /**
   * Get summary of all measurements
   */
  getSummary() {
    if (this.measurements.length === 0) {
      return {
        totalMeasurements: 0,
        averageCLS: 0,
        maxCLS: 0,
        minCLS: 0,
        passedCount: 0,
        failedCount: 0,
        passRate: 0,
      };
    }

    const clsValues = this.measurements.map(m => m.clsDuringLoading);
    const passedCount = this.measurements.filter(m => m.passed).length;

    return {
      totalMeasurements: this.measurements.length,
      averageCLS: clsValues.reduce((a, b) => a + b, 0) / clsValues.length,
      maxCLS: Math.max(...clsValues),
      minCLS: Math.min(...clsValues),
      passedCount,
      failedCount: this.measurements.length - passedCount,
      passRate: (passedCount / this.measurements.length) * 100,
    };
  }

  /**
   * Get measurements for a specific component
   */
  getComponentMeasurements(componentName) {
    return this.measurements.filter(m => m.componentName === componentName);
  }

  /**
   * Get failed measurements (CLS > threshold)
   */
  getFailedMeasurements() {
    return this.measurements.filter(m => !m.passed);
  }

  /**
   * Print report to console
   */
  printReport() {
    const summary = this.getSummary();
    
    console.group('📊 CLS Loading Measurement Report');
    console.log(`Total measurements: ${summary.totalMeasurements}`);
    console.log(`Average CLS: ${summary.averageCLS.toFixed(4)}`);
    console.log(`Max CLS: ${summary.maxCLS.toFixed(4)}`);
    console.log(`Min CLS: ${summary.minCLS.toFixed(4)}`);
    console.log(`Pass rate: ${summary.passRate.toFixed(1)}% (${summary.passedCount}/${summary.totalMeasurements})`);
    
    if (summary.failedCount > 0) {
      console.log('');
      console.group(`❌ Failed measurements (${summary.failedCount})`);
      this.getFailedMeasurements().forEach(m => {
        console.log(`- ${m.componentName}: ${m.clsDuringLoading.toFixed(4)} (${m.shiftsCount} shifts)`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    return { summary, measurements: this.measurements };
  }

  /**
   * Export measurements to JSON
   */
  exportToJSON() {
    return JSON.stringify({
      measurements: this.measurements,
      summary: this.getSummary(),
      timestamp: new Date().toISOString(),
      thresholds: this.thresholds,
    }, null, 2);
  }

  /**
   * Save measurements to localStorage
   */
  saveMeasurements() {
    try {
      const data = {
        measurements: this.measurements,
        summary: this.getSummary(),
        timestamp: Date.now(),
      };
      
      localStorage.setItem('cls_loading_measurements', JSON.stringify(data));
      console.log('💾 Saved CLS measurements to localStorage');
      return true;
    } catch (error) {
      console.error('Failed to save CLS measurements:', error);
      return false;
    }
  }

  /**
   * Load measurements from localStorage
   */
  loadMeasurements() {
    try {
      const stored = localStorage.getItem('cls_loading_measurements');
      if (stored) {
        const data = JSON.parse(stored);
        this.measurements = data.measurements || [];
        console.log(`📂 Loaded ${this.measurements.length} CLS measurements from localStorage`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load CLS measurements:', error);
      return false;
    }
  }

  /**
   * Clear all measurements
   */
  clearMeasurements() {
    this.measurements = [];
    localStorage.removeItem('cls_loading_measurements');
    console.log('🗑️ Cleared all CLS measurements');
  }

  /**
   * Reset current session
   */
  resetSession() {
    if (this.currentLoadingSession) {
      console.log(`🔄 Reset loading session: ${this.currentLoadingSession.componentName}`);
      this.currentLoadingSession = null;
    }
  }

  /**
   * Disconnect observer
   */
  disconnect() {
    if (this.clsObserver) {
      this.clsObserver.disconnect();
      this.clsObserver = null;
    }
    this.initialized = false;
    console.log('🔌 CLS observer disconnected');
  }
}

// Create singleton instance
const clsLoadingMeasurement = new CLSLoadingMeasurement();

// Export instance and helper functions
export default clsLoadingMeasurement;

export const initCLSLoadingMeasurement = () => {
  clsLoadingMeasurement.init();
};

export const startLoadingSession = (componentName, options) => {
  return clsLoadingMeasurement.startLoadingSession(componentName, options);
};

export const endLoadingSession = (sessionId) => {
  return clsLoadingMeasurement.endLoadingSession(sessionId);
};

export const measureLoading = (componentName, loadingFn) => {
  return clsLoadingMeasurement.measureLoading(componentName, loadingFn);
};

export const getCLSMeasurements = () => {
  return clsLoadingMeasurement.getMeasurements();
};

export const printCLSReport = () => {
  return clsLoadingMeasurement.printReport();
};

export const saveCLSMeasurements = () => {
  return clsLoadingMeasurement.saveMeasurements();
};

export const loadCLSMeasurements = () => {
  return clsLoadingMeasurement.loadMeasurements();
};

export const clearCLSMeasurements = () => {
  clsLoadingMeasurement.clearMeasurements();
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  window.clsLoadingMeasurement = clsLoadingMeasurement;
  window.startLoadingSession = startLoadingSession;
  window.endLoadingSession = endLoadingSession;
  window.measureLoading = measureLoading;
  window.printCLSReport = printCLSReport;
  window.saveCLSMeasurements = saveCLSMeasurements;
  window.loadCLSMeasurements = loadCLSMeasurements;
}
