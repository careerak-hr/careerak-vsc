/**
 * useIntersectionObserver Hook
 * 
 * A custom React hook that uses the Intersection Observer API to detect
 * when an element enters or exits the viewport.
 * 
 * Features:
 * - Detects when element is visible in viewport
 * - Configurable threshold and root margin
 * - Automatic cleanup
 * - Supports SSR (returns false on server)
 * 
 * Requirements: FR-PERF-4
 * Design: Section 3.3 Image Optimization
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({
 *   threshold: 0.1,
 *   rootMargin: '50px'
 * });
 * 
 * return <div ref={ref}>{isVisible ? 'Visible!' : 'Not visible'}</div>;
 */

import { useState, useEffect, useRef } from 'react';

const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    root = null,
    triggerOnce = true,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    
    // Return early if no element or already been visible (when triggerOnce is true)
    if (!element || (triggerOnce && hasBeenVisible)) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: assume visible if not supported
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        
        if (visible && triggerOnce) {
          setHasBeenVisible(true);
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observer.observe(element);

    // Cleanup
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, root, triggerOnce, hasBeenVisible]);

  return [elementRef, isVisible || hasBeenVisible];
};

export default useIntersectionObserver;
