/**
 * usePerformance Hook
 * 
 * Hook مخصص لتحسين أداء المكونات
 * يوفر أدوات سهلة الاستخدام لتحسين الأداء
 * 
 * @module usePerformance
 */

import { useEffect, useCallback, useRef, useMemo } from 'react';
import {
  debounce,
  throttle,
  dataCache,
  measurePagePerformance,
  lazyLoadImages,
  shouldLoadHighQuality,
  cleanupMemory
} from '../utils/performanceOptimization';

/**
 * Hook رئيسي لتحسين الأداء
 */
export const usePerformance = (options = {}) => {
  const {
    enableLazyLoading = true,
    enablePerformanceMonitoring = true,
    enableMemoryCleanup = true,
    cacheKey = null
  } = options;

  const metricsRef = useRef(null);

  // تفعيل lazy loading للصور
  useEffect(() => {
    if (enableLazyLoading) {
      lazyLoadImages();
      
      // إعادة تفعيل عند تحديث DOM
      const observer = new MutationObserver(() => {
        lazyLoadImages();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    }
  }, [enableLazyLoading]);

  // قياس الأداء
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      metricsRef.current = measurePagePerformance();
    }
  }, [enablePerformanceMonitoring]);

  // تنظيف الذاكرة عند unmount
  useEffect(() => {
    return () => {
      if (enableMemoryCleanup) {
        cleanupMemory();
      }
    };
  }, [enableMemoryCleanup]);

  // دالة للحصول على المقاييس
  const getMetrics = useCallback(() => {
    return metricsRef.current;
  }, []);

  // دالة للتحقق من جودة الشبكة
  const isHighQualityNetwork = useCallback(() => {
    return shouldLoadHighQuality();
  }, []);

  return {
    getMetrics,
    isHighQualityNetwork
  };
};

/**
 * Hook للـ debounced callback
 */
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    [delay, ...deps]
  );

  return debouncedFn;
};

/**
 * Hook للـ throttled callback
 */
export const useThrottledCallback = (callback, limit = 100, deps = []) => {
  const throttledFn = useMemo(
    () => throttle(callback, limit),
    [limit, ...deps]
  );

  return throttledFn;
};

/**
 * Hook للـ cached data
 */
export const useCachedData = (key, fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      // التحقق من الـ cache أولاً
      if (dataCache.has(key)) {
        setData(dataCache.get(key));
        setLoading(false);
        return;
      }

      // جلب البيانات
      try {
        setLoading(true);
        const result = await fetchFn();
        dataCache.set(key, result);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, ...dependencies]);

  // دالة لإعادة التحميل
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      dataCache.set(key, result);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn]);

  // دالة لمسح الـ cache
  const clearCache = useCallback(() => {
    dataCache.clear();
  }, []);

  return { data, loading, error, refetch, clearCache };
};

/**
 * Hook للـ intersection observer (lazy loading)
 */
export const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting && triggerOnce) {
          observer.unobserve(target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [targetRef, isIntersecting];
};

/**
 * Hook للـ virtual scrolling
 */
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = useThrottledCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, 16); // ~60fps

  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 3);
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + 3
    );

    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end + 1)
    };
  }, [scrollTop, items, itemHeight, containerHeight]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    containerRef,
    handleScroll,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex
  };
};

/**
 * Hook للـ prefetch
 */
export const usePrefetch = (urls = []) => {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });

    return () => {
      // تنظيف
      urls.forEach(url => {
        const link = document.querySelector(`link[href="${url}"]`);
        if (link) {
          link.remove();
        }
      });
    };
  }, [urls]);
};

/**
 * Hook للـ image optimization
 */
export const useOptimizedImage = (src, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    format = 'auto'
  } = options;

  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const isHighQuality = shouldLoadHighQuality();

  useEffect(() => {
    if (!src) return;

    // تحديد الجودة بناءً على الشبكة
    const actualQuality = isHighQuality ? quality : Math.min(quality, 60);

    // بناء URL محسّن (مثال: Cloudinary)
    let optimizedSrc = src;
    
    if (src.includes('cloudinary.com')) {
      const transformations = [];
      
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`q_${actualQuality}`);
      transformations.push(`f_${format}`);
      
      optimizedSrc = src.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }

    setImageSrc(optimizedSrc);
    setLoading(false);
  }, [src, width, height, quality, format, isHighQuality]);

  return { imageSrc, loading };
};

/**
 * Hook للـ code splitting
 */
export const useDynamicImport = (importFn) => {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        const module = await importFn();
        
        if (mounted) {
          setComponent(() => module.default || module);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          console.error('Error loading component:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [importFn]);

  return { component, loading, error };
};

// Export all hooks
export default {
  usePerformance,
  useDebouncedCallback,
  useThrottledCallback,
  useCachedData,
  useIntersectionObserver,
  useVirtualScroll,
  usePrefetch,
  useOptimizedImage,
  useDynamicImport
};
