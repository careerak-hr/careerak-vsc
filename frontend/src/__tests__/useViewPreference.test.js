import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useViewPreference from '../hooks/useViewPreference';

describe('useViewPreference Hook', () => {
  beforeEach(() => {
    // تنظيف localStorage قبل كل اختبار
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with grid view by default', () => {
    const { result } = renderHook(() => useViewPreference());
    expect(result.current.view).toBe('grid');
  });

  it('should initialize with saved preference from localStorage', () => {
    localStorage.setItem('careerak_job_view_preference', 'list');
    const { result } = renderHook(() => useViewPreference());
    expect(result.current.view).toBe('list');
  });

  it('should toggle between grid and list', () => {
    const { result } = renderHook(() => useViewPreference());
    
    expect(result.current.view).toBe('grid');
    
    act(() => {
      result.current.toggleView();
    });
    
    expect(result.current.view).toBe('list');
    
    act(() => {
      result.current.toggleView();
    });
    
    expect(result.current.view).toBe('grid');
  });

  it('should save preference to localStorage when toggling', () => {
    const { result } = renderHook(() => useViewPreference());
    
    act(() => {
      result.current.toggleView();
    });
    
    expect(localStorage.getItem('careerak_job_view_preference')).toBe('list');
    
    act(() => {
      result.current.toggleView();
    });
    
    expect(localStorage.getItem('careerak_job_view_preference')).toBe('grid');
  });

  it('should set view directly using setView', () => {
    const { result } = renderHook(() => useViewPreference());
    
    act(() => {
      result.current.setView('list');
    });
    
    expect(result.current.view).toBe('list');
    expect(localStorage.getItem('careerak_job_view_preference')).toBe('list');
  });

  it('should ignore invalid view values in setView', () => {
    const { result } = renderHook(() => useViewPreference());
    
    act(() => {
      result.current.setView('invalid');
    });
    
    expect(result.current.view).toBe('grid');
  });

  it('should persist preference across hook instances', () => {
    const { result: result1 } = renderHook(() => useViewPreference());
    
    act(() => {
      result1.current.setView('list');
    });
    
    const { result: result2 } = renderHook(() => useViewPreference());
    expect(result2.current.view).toBe('list');
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // محاكاة خطأ في localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const { result } = renderHook(() => useViewPreference());
    
    // يجب أن يعود إلى القيمة الافتراضية
    expect(result.current.view).toBe('grid');
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle localStorage save errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // محاكاة خطأ في حفظ localStorage
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage save error');
    });
    
    const { result } = renderHook(() => useViewPreference());
    
    act(() => {
      result.current.toggleView();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});
