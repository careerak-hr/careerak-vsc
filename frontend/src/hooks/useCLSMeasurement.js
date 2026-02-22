/**
 * useCLSMeasurement Hook
 * 
 * React hook for measuring CLS during loading states in components
 * 
 * @module useCLSMeasurement
 */

import { useEffect, useRef, useCallback } from 'react';
import clsLoadingMeasurement from '../utils/clsLoadingMeasurement';

/**
 * Hook to measure CLS during component loading
 * 
 * @param {string} componentName - Name of the component
 * @param {boolean} isLoading - Loading state
 * @param {Object} options - Additional options
 * @returns {Object} Measurement utilities
 * 
 * @example
 * function JobPostingsPage() {
 *   const [loading, setLoading] = useState(true);
 *   const { measurement, startMeasurement, endMeasurement } = useCLSMeasurement('JobPostingsPage', loading);
 *   
 *   useEffect(() => {
 *     fetchJobs().then(() => setLoading(false));
 *   }, []);
 *   
 *   return <div>...</div>;
 * }
 */
export function useCLSMeasurement(componentName, isLoading, options = {}) {
  const sessionIdRef = useRef(null);
  const measurementRef = useRef(null);
  const previousLoadingRef = useRef(isLoading);

  // Initialize CLS measurement on mount
  useEffect(() => {
    if (!clsLoadingMeasurement.initialized) {
      clsLoadingMeasurement.init();
    }
  }, []);

  // Start measurement when loading begins
  const startMeasurement = useCallback(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = clsLoadingMeasurement.startLoadingSession(componentName, options);
    }
  }, [componentName, options]);

  // End measurement when loading completes
  const endMeasurement = useCallback(() => {
    if (sessionIdRef.current) {
      measurementRef.current = clsLoadingMeasurement.endLoadingSession(sessionIdRef.current);
      sessionIdRef.current = null;
      return measurementRef.current;
    }
    return null;
  }, []);

  // Auto-track loading state changes
  useEffect(() => {
    const wasLoading = previousLoadingRef.current;
    const isNowLoading = isLoading;

    // Loading started
    if (!wasLoading && isNowLoading) {
      startMeasurement();
    }

    // Loading ended
    if (wasLoading && !isNowLoading) {
      endMeasurement();
    }

    previousLoadingRef.current = isLoading;
  }, [isLoading, startMeasurement, endMeasurement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        clsLoadingMeasurement.endLoadingSession(sessionIdRef.current);
        sessionIdRef.current = null;
      }
    };
  }, []);

  return {
    measurement: measurementRef.current,
    startMeasurement,
    endMeasurement,
    isActive: !!sessionIdRef.current,
  };
}

/**
 * Hook to measure CLS for async operations
 * 
 * @param {string} componentName - Name of the component
 * @returns {Function} measureAsync function
 * 
 * @example
 * function JobPostingsPage() {
 *   const measureAsync = useCLSMeasurementAsync('JobPostingsPage');
 *   
 *   const loadJobs = async () => {
 *     const result = await measureAsync(async () => {
 *       const jobs = await fetchJobs();
 *       setJobs(jobs);
 *     });
 *     console.log('CLS during loading:', result.clsDuringLoading);
 *   };
 *   
 *   return <div>...</div>;
 * }
 */
export function useCLSMeasurementAsync(componentName) {
  // Initialize CLS measurement on mount
  useEffect(() => {
    if (!clsLoadingMeasurement.initialized) {
      clsLoadingMeasurement.init();
    }
  }, []);

  const measureAsync = useCallback(
    async (asyncFn) => {
      return clsLoadingMeasurement.measureLoading(componentName, asyncFn);
    },
    [componentName]
  );

  return measureAsync;
}

/**
 * Hook to get CLS measurements for a component
 * 
 * @param {string} componentName - Name of the component
 * @returns {Object} Component measurements
 * 
 * @example
 * function PerformanceDebugger() {
 *   const measurements = useComponentCLSMeasurements('JobPostingsPage');
 *   
 *   return (
 *     <div>
 *       <h3>CLS Measurements</h3>
 *       {measurements.map(m => (
 *         <div key={m.id}>
 *           CLS: {m.clsDuringLoading.toFixed(4)} ({m.rating})
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 */
export function useComponentCLSMeasurements(componentName) {
  const measurements = clsLoadingMeasurement.getComponentMeasurements(componentName);
  return measurements;
}

/**
 * Hook to get all CLS measurements
 * 
 * @returns {Object} All measurements and summary
 * 
 * @example
 * function PerformanceDashboard() {
 *   const { measurements, summary } = useAllCLSMeasurements();
 *   
 *   return (
 *     <div>
 *       <h2>CLS Performance</h2>
 *       <p>Average CLS: {summary.averageCLS.toFixed(4)}</p>
 *       <p>Pass rate: {summary.passRate.toFixed(1)}%</p>
 *     </div>
 *   );
 * }
 */
export function useAllCLSMeasurements() {
  return clsLoadingMeasurement.getMeasurements();
}

export default useCLSMeasurement;
