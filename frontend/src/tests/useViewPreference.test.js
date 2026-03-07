import { renderHook, act } from '@testing-library/react';
import { useViewPreference } from '../hooks/useViewPreference';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useViewPreference Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('يجب أن يبدأ بـ grid كقيمة افتراضية', () => {
    const { result } = renderHook(() => useViewPreference());
    const [view] = result.current;
    
    expect(view).toBe('grid');
  });

  test('يجب أن يحفظ التفضيل في localStorage', () => {
    const { result } = renderHook(() => useViewPreference());
    const [, toggleView] = result.current;
    
    act(() => {
      toggleView();
    });
    
    expect(localStorage.getItem('careerak_jobViewPreference')).toBe('list');
  });

  test('يجب أن يسترجع التفضيل المحفوظ', () => {
    localStorage.setItem('careerak_jobViewPreference', 'list');
    
    const { result } = renderHook(() => useViewPreference());
    const [view] = result.current;
    
    expect(view).toBe('list');
  });

  test('يجب أن يبدل بين grid و list', () => {
    const { result } = renderHook(() => useViewPreference());
    
    // البداية: grid
    expect(result.current[0]).toBe('grid');
    
    // التبديل إلى list
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe('list');
    
    // التبديل إلى grid
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe('grid');
  });

  test('يجب أن يعمل setViewType بشكل صحيح', () => {
    const { result } = renderHook(() => useViewPreference());
    const [, , setViewType] = result.current;
    
    act(() => {
      setViewType('list');
    });
    
    expect(result.current[0]).toBe('list');
    expect(localStorage.getItem('careerak_jobViewPreference')).toBe('list');
  });

  test('يجب أن يتجاهل قيم غير صحيحة في setViewType', () => {
    const { result } = renderHook(() => useViewPreference());
    const [, , setViewType] = result.current;
    
    act(() => {
      setViewType('invalid');
    });
    
    // يجب أن يبقى على grid
    expect(result.current[0]).toBe('grid');
  });

  test('يجب أن يتعامل مع أخطاء localStorage بشكل صحيح', () => {
    // Mock localStorage.setItem لرمي خطأ
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = jest.fn(() => {
      throw new Error('Storage full');
    });
    
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { result } = renderHook(() => useViewPreference());
    const [, toggleView] = result.current;
    
    act(() => {
      toggleView();
    });
    
    // يجب أن يسجل الخطأ
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // استعادة الوظيفة الأصلية
    localStorage.setItem = originalSetItem;
    consoleErrorSpy.mockRestore();
  });

  test('يجب أن يستجيب لتغييرات storage من تبويبات أخرى', () => {
    const { result } = renderHook(() => useViewPreference());
    
    // محاكاة تغيير من تبويب آخر
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'careerak_jobViewPreference',
        newValue: 'list',
        oldValue: 'grid'
      });
      window.dispatchEvent(storageEvent);
    });
    
    expect(result.current[0]).toBe('list');
  });

  test('يجب أن يتجاهل تغييرات storage لمفاتيح أخرى', () => {
    const { result } = renderHook(() => useViewPreference());
    
    act(() => {
      const storageEvent = new StorageEvent('storage', {
        key: 'other_key',
        newValue: 'some_value'
      });
      window.dispatchEvent(storageEvent);
    });
    
    // يجب أن يبقى على grid
    expect(result.current[0]).toBe('grid');
  });
});
