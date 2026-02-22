/**
 * useCLSMeasurement Hook Tests
 * 
 * Tests for the CLS measurement React hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useCLSMeasurement,
  useCLSMeasurementAsync,
  useComponentCLSMeasurements,
  useAllCLSMeasurements,
} from '../useCLSMeasurement';
import clsLoadingMeasurement from '../../utils/clsLoadingMeasurement';

// Mock web-vitals
vi.mock('web-vitals', () => ({
  onCLS: vi.fn((callback) => {
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
  observe() {}
  disconnect() {}
};

describe('useCLSMeasurement', () => {
  beforeEach(() => {
    clsLoadingMeasurement.clearMeasurements();
    clsLoadingMeasurement.initialized = false;
    clsLoadingMeasurement.currentLoadingSession = null;
  });

  afterEach(() => {
    if (clsLoadingMeasurement.clsObserver) {
      clsLoadingMeasurement.disconnect();
    }
  });

  describe('Automatic Measurement', () => {
    it('should initialize on mount', () => {
      renderHook(() => useCLSMeasurement('TestComponent', false));
      
      expect(clsLoadingMeasurement.initialized).toBe(true);
    });

    it('should start measurement when loading begins', async () => {
      const { result, rerender } = renderHook(
        ({ loading }) => useCLSMeasurement('TestComponent', loading),
        { initialProps: { loading: false } }
      );
      
      expect(result.current.isActive).toBe(false);
      
      // Start loading
      rerender({ loading: true });
      
      await waitFor(() => {
        expect(result.current.isActive).toBe(true);
      });
    });

    it('should end measurement when loading completes', async () => {
      const { result, rerender } = renderHook(
        ({ loading }) => useCLSMeasurement('TestComponent', loading),
        { initialProps: { loading: true } }
      );
      
      expect(result.current.isActive).toBe(true);
      
      // End loading
      rerender({ loading: false });
      
      await waitFor(() => {
        expect(result.current.isActive).toBe(false);
        expect(result.current.measurement).toBeTruthy();
      });
    });

    it('should provide measurement result', async () => {
      const { result, rerender } = renderHook(
        ({ loading }) => useCLSMeasurement('TestComponent', loading),
        { initialProps: { loading: true } }
      );
      
      // End loading
      rerender({ loading: false });
      
      await waitFor(() => {
        expect(result.current.measurement).toBeTruthy();
        expect(result.current.measurement.componentName).toBe('TestComponent');
        expect(result.current.measurement.clsDuringLoading).toBeGreaterThanOrEqual(0);
      });
    });

    it('should cleanup on unmount', async () => {
      const { unmount } = renderHook(() => useCLSMeasurement('TestComponent', true));
      
      expect(clsLoadingMeasurement.currentLoadingSession).toBeTruthy();
      
      unmount();
      
      // Session should be ended
      expect(clsLoadingMeasurement.currentLoadingSession).toBeNull();
    });
  });

  describe('Manual Measurement', () => {
    it('should provide startMeasurement function', () => {
      const { result } = renderHook(() => useCLSMeasurement('TestComponent', false));
      
      expect(result.current.startMeasurement).toBeTruthy();
      expect(typeof result.current.startMeasurement).toBe('function');
    });

    it('should provide endMeasurement function', () => {
      const { result } = renderHook(() => useCLSMeasurement('TestComponent', false));
      
      expect(result.current.endMeasurement).toBeTruthy();
      expect(typeof result.current.endMeasurement).toBe('function');
    });

    it('should start measurement manually', () => {
      const { result } = renderHook(() => useCLSMeasurement('TestComponent', false));
      
      act(() => {
        result.current.startMeasurement();
      });
      
      expect(result.current.isActive).toBe(true);
    });

    it('should end measurement manually', async () => {
      const { result } = renderHook(() => useCLSMeasurement('TestComponent', false));
      
      act(() => {
        result.current.startMeasurement();
      });
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      let measurement;
      act(() => {
        measurement = result.current.endMeasurement();
      });
      
      expect(measurement).toBeTruthy();
      expect(measurement.componentName).toBe('TestComponent');
      expect(result.current.isActive).toBe(false);
    });
  });

  describe('useCLSMeasurementAsync', () => {
    it('should provide measureAsync function', () => {
      const { result } = renderHook(() => useCLSMeasurementAsync('TestComponent'));
      
      expect(result.current).toBeTruthy();
      expect(typeof result.current).toBe('function');
    });

    it('should measure async operation', async () => {
      const { result } = renderHook(() => useCLSMeasurementAsync('TestComponent'));
      
      let measurement;
      await act(async () => {
        measurement = await result.current(async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
        });
      });
      
      expect(measurement).toBeTruthy();
      expect(measurement.componentName).toBe('TestComponent');
      expect(measurement.duration).toBeGreaterThan(0);
    });

    it('should handle errors in async operation', async () => {
      const { result } = renderHook(() => useCLSMeasurementAsync('TestComponent'));
      
      await expect(
        act(async () => {
          await result.current(async () => {
            throw new Error('Test error');
          });
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('useComponentCLSMeasurements', () => {
    it('should return empty array initially', () => {
      const { result } = renderHook(() => useComponentCLSMeasurements('TestComponent'));
      
      expect(result.current).toEqual([]);
    });

    it('should return component measurements', async () => {
      // Add some measurements
      const sessionId = clsLoadingMeasurement.startLoadingSession('TestComponent');
      await new Promise(resolve => setTimeout(resolve, 50));
      clsLoadingMeasurement.endLoadingSession(sessionId);
      
      const { result } = renderHook(() => useComponentCLSMeasurements('TestComponent'));
      
      expect(result.current.length).toBe(1);
      expect(result.current[0].componentName).toBe('TestComponent');
    });

    it('should filter by component name', async () => {
      // Add measurements for different components
      const sessionId1 = clsLoadingMeasurement.startLoadingSession('Component1');
      await new Promise(resolve => setTimeout(resolve, 50));
      clsLoadingMeasurement.endLoadingSession(sessionId1);
      
      const sessionId2 = clsLoadingMeasurement.startLoadingSession('Component2');
      await new Promise(resolve => setTimeout(resolve, 50));
      clsLoadingMeasurement.endLoadingSession(sessionId2);
      
      const { result } = renderHook(() => useComponentCLSMeasurements('Component1'));
      
      expect(result.current.length).toBe(1);
      expect(result.current[0].componentName).toBe('Component1');
    });
  });

  describe('useAllCLSMeasurements', () => {
    it('should return measurements and summary', () => {
      const { result } = renderHook(() => useAllCLSMeasurements());
      
      expect(result.current).toBeTruthy();
      expect(result.current.measurements).toBeTruthy();
      expect(result.current.summary).toBeTruthy();
    });

    it('should return all measurements', async () => {
      // Add some measurements
      const sessionId1 = clsLoadingMeasurement.startLoadingSession('Component1');
      await new Promise(resolve => setTimeout(resolve, 50));
      clsLoadingMeasurement.endLoadingSession(sessionId1);
      
      const sessionId2 = clsLoadingMeasurement.startLoadingSession('Component2');
      await new Promise(resolve => setTimeout(resolve, 50));
      clsLoadingMeasurement.endLoadingSession(sessionId2);
      
      const { result } = renderHook(() => useAllCLSMeasurements());
      
      expect(result.current.measurements.length).toBe(2);
      expect(result.current.summary.totalMeasurements).toBe(2);
    });

    it('should include summary statistics', async () => {
      // Add a measurement
      const sessionId = clsLoadingMeasurement.startLoadingSession('TestComponent');
      await new Promise(resolve => setTimeout(resolve, 50));
      clsLoadingMeasurement.endLoadingSession(sessionId);
      
      const { result } = renderHook(() => useAllCLSMeasurements());
      
      expect(result.current.summary.totalMeasurements).toBeGreaterThan(0);
      expect(result.current.summary.averageCLS).toBeGreaterThanOrEqual(0);
      expect(result.current.summary.passRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Integration', () => {
    it('should work with multiple components', async () => {
      const { result: result1, rerender: rerender1 } = renderHook(
        ({ loading }) => useCLSMeasurement('Component1', loading),
        { initialProps: { loading: true } }
      );
      
      const { result: result2, rerender: rerender2 } = renderHook(
        ({ loading }) => useCLSMeasurement('Component2', loading),
        { initialProps: { loading: true } }
      );
      
      // End loading for both
      rerender1({ loading: false });
      rerender2({ loading: false });
      
      await waitFor(() => {
        expect(result1.current.measurement).toBeTruthy();
        expect(result2.current.measurement).toBeTruthy();
      });
      
      const allMeasurements = clsLoadingMeasurement.getMeasurements();
      expect(allMeasurements.measurements.length).toBe(2);
    });

    it('should handle rapid loading state changes', async () => {
      const { result, rerender } = renderHook(
        ({ loading }) => useCLSMeasurement('TestComponent', loading),
        { initialProps: { loading: false } }
      );
      
      // Rapid changes
      rerender({ loading: true });
      rerender({ loading: false });
      rerender({ loading: true });
      rerender({ loading: false });
      
      await waitFor(() => {
        expect(result.current.isActive).toBe(false);
      });
      
      // Should have measurements
      const measurements = clsLoadingMeasurement.getMeasurements();
      expect(measurements.measurements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle component name changes', async () => {
      const { result, rerender } = renderHook(
        ({ name, loading }) => useCLSMeasurement(name, loading),
        { initialProps: { name: 'Component1', loading: true } }
      );
      
      // Change component name while loading
      rerender({ name: 'Component2', loading: true });
      
      // End loading
      rerender({ name: 'Component2', loading: false });
      
      await waitFor(() => {
        expect(result.current.measurement).toBeTruthy();
      });
    });

    it('should handle unmount during loading', () => {
      const { unmount } = renderHook(() => useCLSMeasurement('TestComponent', true));
      
      // Should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple start calls', () => {
      const { result } = renderHook(() => useCLSMeasurement('TestComponent', false));
      
      act(() => {
        result.current.startMeasurement();
        result.current.startMeasurement(); // Second call should be ignored
      });
      
      expect(result.current.isActive).toBe(true);
    });

    it('should handle end without start', () => {
      const { result } = renderHook(() => useCLSMeasurement('TestComponent', false));
      
      let measurement;
      act(() => {
        measurement = result.current.endMeasurement();
      });
      
      expect(measurement).toBeNull();
    });
  });
});
