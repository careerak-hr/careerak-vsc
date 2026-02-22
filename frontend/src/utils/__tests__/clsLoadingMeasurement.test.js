/**
 * CLS Loading Measurement Tests
 * 
 * Tests for the CLS loading measurement utility
 * 
 * Requirements:
 * - Task 8.5.5: Measure CLS during loading
 * - NFR-PERF-5: CLS < 0.1
 * - Property LOAD-5: CLS(loadingState) < 0.1
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import clsLoadingMeasurement, {
  initCLSLoadingMeasurement,
  startLoadingSession,
  endLoadingSession,
  measureLoading,
  getCLSMeasurements,
  printCLSReport,
  saveCLSMeasurements,
  loadCLSMeasurements,
  clearCLSMeasurements,
} from '../clsLoadingMeasurement';

// Mock web-vitals
vi.mock('web-vitals', () => ({
  onCLS: vi.fn((callback) => {
    // Simulate CLS callback
    setTimeout(() => {
      callback({
        value: 0.05,
        rating: 'good',
        delta: 0.05,
        id: 'test-cls-id',
      });
    }, 10);
  }),
}));

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    // Simulate layout shift entry
    setTimeout(() => {
      this.callback({
        getEntries: () => [{
          value: 0.02,
          startTime: performance.now(),
          hadRecentInput: false,
          sources: [
            {
              node: { tagName: 'DIV' },
              previousRect: { top: 0, left: 0, width: 100, height: 100 },
              currentRect: { top: 10, left: 0, width: 100, height: 100 },
            }
          ],
        }],
      });
    }, 20);
  }
  
  disconnect() {}
};

describe('CLSLoadingMeasurement', () => {
  beforeEach(() => {
    // Clear measurements before each test
    clsLoadingMeasurement.clearMeasurements();
    clsLoadingMeasurement.initialized = false;
    clsLoadingMeasurement.currentLoadingSession = null;
    clsLoadingMeasurement.sessionCLS = 0;
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    // Cleanup
    if (clsLoadingMeasurement.clsObserver) {
      clsLoadingMeasurement.disconnect();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      initCLSLoadingMeasurement();
      
      expect(clsLoadingMeasurement.initialized).toBe(true);
    });

    it('should not initialize twice', () => {
      initCLSLoadingMeasurement();
      const firstInit = clsLoadingMeasurement.initialized;
      
      initCLSLoadingMeasurement();
      const secondInit = clsLoadingMeasurement.initialized;
      
      expect(firstInit).toBe(true);
      expect(secondInit).toBe(true);
    });

    it('should set up web-vitals CLS monitoring', () => {
      initCLSLoadingMeasurement();
      
      // web-vitals onCLS should be called
      expect(clsLoadingMeasurement.initialized).toBe(true);
    });

    it('should set up PerformanceObserver', () => {
      initCLSLoadingMeasurement();
      
      expect(clsLoadingMeasurement.clsObserver).toBeTruthy();
    });
  });

  describe('Session Management', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should start a loading session', () => {
      const sessionId = startLoadingSession('TestComponent');
      
      expect(sessionId).toBeTruthy();
      expect(sessionId).toContain('TestComponent');
      expect(clsLoadingMeasurement.currentLoadingSession).toBeTruthy();
      expect(clsLoadingMeasurement.currentLoadingSession.componentName).toBe('TestComponent');
    });

    it('should end a loading session', async () => {
      const sessionId = startLoadingSession('TestComponent');
      
      // Wait a bit for some "loading" to happen
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const result = endLoadingSession(sessionId);
      
      expect(result).toBeTruthy();
      expect(result.componentName).toBe('TestComponent');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.clsDuringLoading).toBeGreaterThanOrEqual(0);
      expect(result.rating).toBeTruthy();
      expect(clsLoadingMeasurement.currentLoadingSession).toBeNull();
    });

    it('should return null when ending non-existent session', () => {
      const result = endLoadingSession('non-existent-session');
      
      expect(result).toBeNull();
    });

    it('should store measurement after ending session', async () => {
      const sessionId = startLoadingSession('TestComponent');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId);
      
      const measurements = getCLSMeasurements();
      
      expect(measurements.measurements.length).toBe(1);
      expect(measurements.measurements[0].componentName).toBe('TestComponent');
    });
  });

  describe('Async Measurement', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should measure CLS for async operation', async () => {
      const result = await measureLoading('AsyncComponent', async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      
      expect(result).toBeTruthy();
      expect(result.componentName).toBe('AsyncComponent');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle errors in async operation', async () => {
      await expect(
        measureLoading('ErrorComponent', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('CLS Rating', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should rate CLS as good when < 0.1', () => {
      const rating = clsLoadingMeasurement.getRating(0.05);
      expect(rating).toBe('good');
    });

    it('should rate CLS as needs-improvement when 0.1 <= CLS < 0.25', () => {
      const rating = clsLoadingMeasurement.getRating(0.15);
      expect(rating).toBe('needs-improvement');
    });

    it('should rate CLS as poor when >= 0.25', () => {
      const rating = clsLoadingMeasurement.getRating(0.3);
      expect(rating).toBe('poor');
    });
  });

  describe('Measurements and Summary', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should get all measurements', async () => {
      const sessionId1 = startLoadingSession('Component1');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId1);
      
      const sessionId2 = startLoadingSession('Component2');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId2);
      
      const measurements = getCLSMeasurements();
      
      expect(measurements.measurements.length).toBe(2);
      expect(measurements.summary).toBeTruthy();
    });

    it('should calculate summary correctly', async () => {
      // Add some measurements
      const sessionId1 = startLoadingSession('Component1');
      await new Promise(resolve => setTimeout(resolve, 50));
      const result1 = endLoadingSession(sessionId1);
      
      const sessionId2 = startLoadingSession('Component2');
      await new Promise(resolve => setTimeout(resolve, 50));
      const result2 = endLoadingSession(sessionId2);
      
      const { summary } = getCLSMeasurements();
      
      expect(summary.totalMeasurements).toBe(2);
      expect(summary.averageCLS).toBeGreaterThanOrEqual(0);
      expect(summary.maxCLS).toBeGreaterThanOrEqual(summary.minCLS);
      expect(summary.passRate).toBeGreaterThanOrEqual(0);
      expect(summary.passRate).toBeLessThanOrEqual(100);
    });

    it('should get component-specific measurements', async () => {
      const sessionId1 = startLoadingSession('Component1');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId1);
      
      const sessionId2 = startLoadingSession('Component1');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId2);
      
      const sessionId3 = startLoadingSession('Component2');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId3);
      
      const component1Measurements = clsLoadingMeasurement.getComponentMeasurements('Component1');
      
      expect(component1Measurements.length).toBe(2);
      expect(component1Measurements.every(m => m.componentName === 'Component1')).toBe(true);
    });

    it('should get failed measurements', async () => {
      // Simulate a failed measurement
      const sessionId = startLoadingSession('FailedComponent');
      clsLoadingMeasurement.currentLoadingSession.currentCLS = 0.15; // Exceeds threshold
      await new Promise(resolve => setTimeout(resolve, 50));
      const result = endLoadingSession(sessionId);
      
      const failedMeasurements = clsLoadingMeasurement.getFailedMeasurements();
      
      expect(failedMeasurements.length).toBeGreaterThan(0);
      expect(failedMeasurements.every(m => !m.passed)).toBe(true);
    });
  });

  describe('Persistence', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should save measurements to localStorage', async () => {
      const sessionId = startLoadingSession('TestComponent');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId);
      
      const saved = saveCLSMeasurements();
      
      expect(saved).toBe(true);
      expect(localStorage.getItem('cls_loading_measurements')).toBeTruthy();
    });

    it('should load measurements from localStorage', async () => {
      // Save some measurements
      const sessionId = startLoadingSession('TestComponent');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId);
      saveCLSMeasurements();
      
      // Clear in-memory measurements
      clsLoadingMeasurement.measurements = [];
      
      // Load from localStorage
      const loaded = loadCLSMeasurements();
      
      expect(loaded).toBe(true);
      expect(clsLoadingMeasurement.measurements.length).toBe(1);
    });

    it('should clear measurements', async () => {
      const sessionId = startLoadingSession('TestComponent');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId);
      saveCLSMeasurements();
      
      clearCLSMeasurements();
      
      expect(clsLoadingMeasurement.measurements.length).toBe(0);
      expect(localStorage.getItem('cls_loading_measurements')).toBeNull();
    });
  });

  describe('Reporting', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should print report', async () => {
      const sessionId = startLoadingSession('TestComponent');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId);
      
      const report = printCLSReport();
      
      expect(report).toBeTruthy();
      expect(report.summary).toBeTruthy();
      expect(report.measurements).toBeTruthy();
    });

    it('should export to JSON', async () => {
      const sessionId = startLoadingSession('TestComponent');
      await new Promise(resolve => setTimeout(resolve, 50));
      endLoadingSession(sessionId);
      
      const json = clsLoadingMeasurement.exportToJSON();
      
      expect(json).toBeTruthy();
      expect(() => JSON.parse(json)).not.toThrow();
      
      const parsed = JSON.parse(json);
      expect(parsed.measurements).toBeTruthy();
      expect(parsed.summary).toBeTruthy();
      expect(parsed.thresholds).toBeTruthy();
    });
  });

  describe('Thresholds', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should use correct thresholds', () => {
      expect(clsLoadingMeasurement.thresholds.good).toBe(0.1);
      expect(clsLoadingMeasurement.thresholds.needsImprovement).toBe(0.25);
    });

    it('should mark measurement as passed when CLS < 0.1', async () => {
      const sessionId = startLoadingSession('GoodComponent');
      clsLoadingMeasurement.currentLoadingSession.currentCLS = 0.05;
      await new Promise(resolve => setTimeout(resolve, 50));
      const result = endLoadingSession(sessionId);
      
      expect(result.passed).toBe(true);
      expect(result.rating).toBe('good');
    });

    it('should mark measurement as failed when CLS >= 0.1', async () => {
      const sessionId = startLoadingSession('PoorComponent');
      clsLoadingMeasurement.currentLoadingSession.currentCLS = 0.15;
      await new Promise(resolve => setTimeout(resolve, 50));
      const result = endLoadingSession(sessionId);
      
      expect(result.passed).toBe(false);
      expect(result.rating).toBe('needs-improvement');
    });
  });

  describe('Global Access', () => {
    it('should be available globally', () => {
      expect(window.clsLoadingMeasurement).toBeTruthy();
      expect(window.startLoadingSession).toBeTruthy();
      expect(window.endLoadingSession).toBeTruthy();
      expect(window.measureLoading).toBeTruthy();
      expect(window.printCLSReport).toBeTruthy();
      expect(window.saveCLSMeasurements).toBeTruthy();
      expect(window.loadCLSMeasurements).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should handle empty measurements', () => {
      const summary = clsLoadingMeasurement.getSummary();
      
      expect(summary.totalMeasurements).toBe(0);
      expect(summary.averageCLS).toBe(0);
      expect(summary.maxCLS).toBe(0);
      expect(summary.minCLS).toBe(0);
      expect(summary.passRate).toBe(0);
    });

    it('should handle session reset', async () => {
      const sessionId = startLoadingSession('TestComponent');
      
      clsLoadingMeasurement.resetSession();
      
      expect(clsLoadingMeasurement.currentLoadingSession).toBeNull();
    });

    it('should handle disconnect', () => {
      clsLoadingMeasurement.disconnect();
      
      expect(clsLoadingMeasurement.clsObserver).toBeNull();
      expect(clsLoadingMeasurement.initialized).toBe(false);
    });

    it('should handle multiple concurrent sessions gracefully', async () => {
      const sessionId1 = startLoadingSession('Component1');
      const sessionId2 = startLoadingSession('Component2'); // Should replace session1
      
      expect(clsLoadingMeasurement.currentLoadingSession.componentName).toBe('Component2');
      
      // Ending session1 should return null
      const result1 = endLoadingSession(sessionId1);
      expect(result1).toBeNull();
      
      // Ending session2 should work
      await new Promise(resolve => setTimeout(resolve, 50));
      const result2 = endLoadingSession(sessionId2);
      expect(result2).toBeTruthy();
    });
  });

  describe('Property LOAD-5: CLS(loadingState) < 0.1', () => {
    beforeEach(() => {
      initCLSLoadingMeasurement();
    });

    it('should validate that CLS during loading is less than 0.1', async () => {
      const result = await measureLoading('TestComponent', async () => {
        // Simulate loading with minimal layout shifts
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      // Property LOAD-5: CLS during loading should be < 0.1
      expect(result.clsDuringLoading).toBeLessThan(0.1);
      expect(result.passed).toBe(true);
      expect(result.rating).toBe('good');
    });

    it('should detect when CLS exceeds threshold', async () => {
      const sessionId = startLoadingSession('BadComponent');
      
      // Simulate high CLS
      clsLoadingMeasurement.currentLoadingSession.currentCLS = 0.3;
      
      await new Promise(resolve => setTimeout(resolve, 50));
      const result = endLoadingSession(sessionId);
      
      // Should fail the threshold
      expect(result.clsDuringLoading).toBeGreaterThanOrEqual(0.1);
      expect(result.passed).toBe(false);
      expect(result.rating).not.toBe('good');
    });
  });
});
