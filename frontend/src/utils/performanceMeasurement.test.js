import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import performanceMeasurement, {
  initPerformanceMeasurement,
  getPerformanceMetrics,
  getPerformanceReport,
  savePerformanceBaseline,
  resetPerformanceMetrics,
} from './performanceMeasurement';

describe('Performance Measurement', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset metrics
    resetPerformanceMetrics();
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize performance measurement', () => {
      initPerformanceMeasurement();
      expect(performanceMeasurement.initialized).toBe(true);
    });

    it('should not initialize twice', () => {
      initPerformanceMeasurement();
      initPerformanceMeasurement();
      expect(performanceMeasurement.initialized).toBe(true);
    });
  });

  describe('Metrics Collection', () => {
    it('should return metrics object', () => {
      const metrics = getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('metrics');
      expect(metrics).toHaveProperty('baseline');
      expect(metrics).toHaveProperty('improvements');
      expect(metrics).toHaveProperty('timestamp');
    });

    it('should have all Core Web Vitals properties', () => {
      const metrics = getPerformanceMetrics();
      
      expect(metrics.metrics).toHaveProperty('FCP');
      expect(metrics.metrics).toHaveProperty('LCP');
      expect(metrics.metrics).toHaveProperty('FID');
      expect(metrics.metrics).toHaveProperty('CLS');
      expect(metrics.metrics).toHaveProperty('TTFB');
      expect(metrics.metrics).toHaveProperty('INP');
      expect(metrics.metrics).toHaveProperty('TTI');
    });
  });

  describe('Baseline Management', () => {
    it('should save baseline to localStorage', () => {
      // Simulate some metrics
      performanceMeasurement.metrics.FCP = { value: 1500, rating: 'good' };
      performanceMeasurement.metrics.TTI = { value: 3000, rating: 'good' };
      
      const baseline = savePerformanceBaseline();
      
      expect(baseline).toBeTruthy();
      expect(baseline.FCP).toBe(1500);
      expect(baseline.TTI).toBe(3000);
      
      const stored = localStorage.getItem('performance_baseline');
      expect(stored).toBeTruthy();
    });

    it('should load baseline from localStorage', () => {
      const mockBaseline = {
        FCP: 2000,
        TTI: 4000,
        timestamp: Date.now(),
      };
      
      localStorage.setItem('performance_baseline', JSON.stringify(mockBaseline));
      
      performanceMeasurement.loadBaseline();
      
      expect(performanceMeasurement.baseline).toEqual(mockBaseline);
    });

    it('should calculate improvement correctly', () => {
      // Set baseline
      performanceMeasurement.baseline = {
        FCP: 2000,
        TTI: 4000,
      };
      
      // Set current metrics (better than baseline)
      performanceMeasurement.metrics.FCP = { value: 1500, rating: 'good' };
      
      const improvement = performanceMeasurement.calculateImprovement('FCP');
      
      expect(improvement).toBeTruthy();
      expect(improvement.improvement).toBe(25); // 25% improvement
      expect(improvement.current).toBe(1500);
      expect(improvement.baseline).toBe(2000);
    });

    it('should show negative improvement for worse performance', () => {
      // Set baseline
      performanceMeasurement.baseline = {
        FCP: 1500,
      };
      
      // Set current metrics (worse than baseline)
      performanceMeasurement.metrics.FCP = { value: 2000, rating: 'needs-improvement' };
      
      const improvement = performanceMeasurement.calculateImprovement('FCP');
      
      expect(improvement).toBeTruthy();
      expect(improvement.improvement).toBe(-33.3); // 33.3% worse
    });
  });

  describe('TTI Rating', () => {
    it('should rate TTI as good when < 3800ms', () => {
      const rating = performanceMeasurement.getTTIRating(3000);
      expect(rating).toBe('good');
    });

    it('should rate TTI as needs-improvement when 3800-7300ms', () => {
      const rating = performanceMeasurement.getTTIRating(5000);
      expect(rating).toBe('needs-improvement');
    });

    it('should rate TTI as poor when > 7300ms', () => {
      const rating = performanceMeasurement.getTTIRating(8000);
      expect(rating).toBe('poor');
    });
  });

  describe('Performance Report', () => {
    it('should generate performance report', () => {
      performanceMeasurement.metrics.FCP = { value: 1500, rating: 'good' };
      performanceMeasurement.metrics.TTI = { value: 3000, rating: 'good' };
      
      const report = getPerformanceReport();
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('url');
      expect(report).toHaveProperty('userAgent');
      expect(report).toHaveProperty('coreWebVitals');
      expect(report).toHaveProperty('improvements');
      expect(report).toHaveProperty('baseline');
      expect(report).toHaveProperty('summary');
    });

    it('should calculate summary correctly', () => {
      performanceMeasurement.metrics.FCP = { value: 1500, rating: 'good' };
      performanceMeasurement.metrics.TTI = { value: 3000, rating: 'good' };
      performanceMeasurement.metrics.LCP = { value: 2000, rating: 'good' };
      performanceMeasurement.metrics.CLS = { value: 0.05, rating: 'good' };
      
      const summary = performanceMeasurement.getSummary();
      
      expect(summary.totalMetrics).toBe(4);
      expect(summary.goodMetrics).toBe(4);
      expect(summary.needsImprovementMetrics).toBe(0);
      expect(summary.poorMetrics).toBe(0);
      expect(summary.overallRating).toBe('good');
    });

    it('should rate overall as poor when 25%+ metrics are poor', () => {
      performanceMeasurement.metrics.FCP = { value: 1500, rating: 'good' };
      performanceMeasurement.metrics.TTI = { value: 8000, rating: 'poor' };
      performanceMeasurement.metrics.LCP = { value: 5000, rating: 'poor' };
      performanceMeasurement.metrics.CLS = { value: 0.05, rating: 'good' };
      
      const summary = performanceMeasurement.getSummary();
      
      expect(summary.overallRating).toBe('poor');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all metrics', () => {
      performanceMeasurement.metrics.FCP = { value: 1500, rating: 'good' };
      performanceMeasurement.improvements.FCP = { improvement: 25 };
      
      resetPerformanceMetrics();
      
      expect(performanceMeasurement.metrics.FCP).toBeNull();
      expect(Object.keys(performanceMeasurement.improvements)).toHaveLength(0);
    });
  });

  describe('Global Access', () => {
    it('should expose functions globally', () => {
      expect(window.performanceMeasurement).toBeDefined();
      expect(window.getPerformanceReport).toBeDefined();
      expect(window.printPerformanceReport).toBeDefined();
      expect(window.savePerformanceBaseline).toBeDefined();
    });
  });
});
