import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import useViewPreference from '../useViewPreference';

describe('useViewPreference Property Tests', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    window.localStorage.clear();
  });

  it('Property 8: View Preference Persistence - should always persist the latest view state in localStorage', () => {
    fc.assert(
      fc.property(fc.array(fc.constantFrom('grid', 'list'), { minLength: 1, maxLength: 20 }), (viewTransitions) => {
        const { result } = renderHook(() => useViewPreference());

        // Execute a sequence of view changes
        viewTransitions.forEach(viewType => {
          act(() => {
            result.current.setView(viewType);
          });

          // Verify immediate persistence for each step
          expect(window.localStorage.getItem('job_view_preference')).toBe(viewType);
          expect(result.current.view).toBe(viewType);
        });

        // Final state check
        const lastView = viewTransitions[viewTransitions.length - 1];
        expect(window.localStorage.getItem('job_view_preference')).toBe(lastView);
      })
    );
  });

  it('should initialize with value from localStorage if present', () => {
    window.localStorage.setItem('job_view_preference', 'list');
    const { result } = renderHook(() => useViewPreference());
    expect(result.current.view).toBe('list');
  });
});
