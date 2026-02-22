/**
 * useLayoutShiftPrevention Hook
 * 
 * React hook for preventing layout shifts during loading states.
 * 
 * Requirements:
 * - FR-LOAD-8: Coordinate loading states to prevent layout shifts
 * - NFR-PERF-5: Achieve CLS < 0.1
 * 
 * @module useLayoutShiftPrevention
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  reserveSpace,
  getSkeletonDimensions,
  getImageContainerStyles,
  coordinateLoadingStates,
  getLoadingTransitionStyles,
  measureCLS,
} from '../utils/layoutShiftPrevention';

/**
 * Hook for preventing layout shifts with reserved space
 * 
 * @param {number|string} minHeight - Minimum height to reserve
 * @returns {Object} Style object and loading state
 * 
 * @example
 * const { containerStyle, setLoading } = useReservedSpace('300px');
 * 
 * return (
 *   <div style={containerStyle}>
 *     {loading ? <Skeleton /> : <Content />}
 *   </div>
 * );
 */
export const useReservedSpace = (minHeight) => {
  const [loading, setLoading] = useState(true);
  const containerStyle = reserveSpace(minHeight);

  return {
    containerStyle,
    loading,
    setLoading,
  };
};

/**
 * Hook for skeleton dimensions matching content
 * 
 * @param {string} contentType - Type of content
 * @param {Object} options - Additional options
 * @returns {Object} Skeleton dimensions
 * 
 * @example
 * const skeletonProps = useSkeletonDimensions('card');
 * 
 * return loading ? (
 *   <SkeletonLoader {...skeletonProps} />
 * ) : (
 *   <Card />
 * );
 */
export const useSkeletonDimensions = (contentType, options = {}) => {
  return getSkeletonDimensions(contentType, options);
};

/**
 * Hook for image container with aspect ratio
 * 
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Object} options - Additional options
 * @returns {Object} Container and image styles, loading state
 * 
 * @example
 * const { containerStyle, imageStyle, loading, setLoading } = useImageContainer(800, 600);
 * 
 * return (
 *   <div style={containerStyle}>
 *     {loading && <Skeleton />}
 *     <img 
 *       src="..." 
 *       style={imageStyle} 
 *       onLoad={() => setLoading(false)}
 *     />
 *   </div>
 * );
 */
export const useImageContainer = (width, height, options = {}) => {
  const [loading, setLoading] = useState(true);
  const styles = getImageContainerStyles(width, height, options);

  return {
    ...styles,
    loading,
    setLoading,
  };
};

/**
 * Hook for coordinating multiple loading states
 * 
 * @param {Array<Object>} initialSections - Initial section configurations
 * @returns {Object} Coordinated state and update function
 * 
 * @example
 * const { sections, updateSection, allLoaded } = useCoordinatedLoading([
 *   { id: 'header', minHeight: '100px', loading: true },
 *   { id: 'content', minHeight: '400px', loading: true },
 * ]);
 * 
 * // Update section loading state
 * updateSection('header', false);
 */
export const useCoordinatedLoading = (initialSections) => {
  const [sections, setSections] = useState(initialSections);

  const updateSection = useCallback((sectionId, loading) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, loading }
          : section
      )
    );
  }, []);

  const coordinated = coordinateLoadingStates(sections);

  return {
    sections: coordinated.sections,
    updateSection,
    allLoaded: coordinated.allLoaded,
    loadingCount: coordinated.loadingCount,
    totalMinHeight: coordinated.totalMinHeight,
  };
};

/**
 * Hook for loading transition styles
 * 
 * @param {boolean} initialLoading - Initial loading state
 * @returns {Object} Transition style and loading state
 * 
 * @example
 * const { transitionStyle, loading, setLoading } = useLoadingTransition(true);
 * 
 * return (
 *   <div style={transitionStyle}>
 *     {loading ? <Skeleton /> : <Content />}
 *   </div>
 * );
 */
export const useLoadingTransition = (initialLoading = true) => {
  const [loading, setLoading] = useState(initialLoading);
  const transitionStyle = getLoadingTransitionStyles(loading);

  return {
    transitionStyle,
    loading,
    setLoading,
  };
};

/**
 * Hook for measuring CLS
 * 
 * @returns {Object} CLS value and observer
 * 
 * @example
 * const { cls, isGood } = useCLSMeasurement();
 * 
 * useEffect(() => {
 *   if (!isGood) {
 *     console.warn('CLS exceeds threshold:', cls);
 *   }
 * }, [cls, isGood]);
 */
export const useCLSMeasurement = () => {
  const [cls, setCls] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = measureCLS((value) => {
      setCls(value);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    cls,
    isGood: cls < 0.1,
    needsImprovement: cls >= 0.1 && cls < 0.25,
    isPoor: cls >= 0.25,
  };
};

/**
 * Hook for preventing layout shift on content insertion
 * 
 * @returns {Object} Container ref and insert function
 * 
 * @example
 * const { containerRef, insertContent } = useShiftlessInsertion();
 * 
 * const handleAddItem = () => {
 *   const newItem = document.createElement('div');
 *   newItem.textContent = 'New Item';
 *   insertContent(newItem, { position: 'append', animate: true });
 * };
 * 
 * return <div ref={containerRef}>...</div>;
 */
export const useShiftlessInsertion = () => {
  const containerRef = useRef(null);

  const insertContent = useCallback((newContent, options = {}) => {
    if (!containerRef.current || !newContent) return;

    const { position = 'append', animate = true } = options;

    // Measure container height before insertion
    const beforeHeight = containerRef.current.offsetHeight;

    // Insert content
    if (position === 'prepend') {
      containerRef.current.insertBefore(newContent, containerRef.current.firstChild);
    } else {
      containerRef.current.appendChild(newContent);
    }

    // If prepending, adjust scroll to prevent visual shift
    if (position === 'prepend') {
      const afterHeight = containerRef.current.offsetHeight;
      const heightDiff = afterHeight - beforeHeight;
      
      if (heightDiff > 0 && containerRef.current.scrollTop !== undefined) {
        containerRef.current.scrollTop += heightDiff;
      }
    }

    // Animate in if requested
    if (animate) {
      newContent.style.opacity = '0';
      newContent.style.transform = 'translateY(-10px)';
      newContent.style.transition = 'opacity 200ms ease-in-out, transform 200ms ease-in-out';
      
      requestAnimationFrame(() => {
        newContent.style.opacity = '1';
        newContent.style.transform = 'translateY(0)';
      });
    }
  }, []);

  return {
    containerRef,
    insertContent,
  };
};

/**
 * Hook for stable list rendering
 * 
 * @param {number} itemCount - Number of items
 * @param {number} itemHeight - Height per item
 * @returns {Object} Container style and loading state
 * 
 * @example
 * const { containerStyle, loading, setLoading } = useStableList(10, 80);
 * 
 * return (
 *   <div style={containerStyle}>
 *     {loading ? (
 *       Array(10).fill(0).map((_, i) => <SkeletonItem key={i} />)
 *     ) : (
 *       items.map(item => <ListItem key={item.id} item={item} />)
 *     )}
 *   </div>
 * );
 */
export const useStableList = (itemCount, itemHeight) => {
  const [loading, setLoading] = useState(true);
  
  const containerStyle = {
    minHeight: `${itemCount * itemHeight}px`,
    transition: 'min-height 200ms ease-in-out',
  };

  return {
    containerStyle,
    loading,
    setLoading,
  };
};

/**
 * Hook for preventing layout shift during data fetching
 * Combines reserved space with loading state management
 * 
 * @param {Function} fetchFn - Async function to fetch data
 * @param {string|number} minHeight - Minimum height to reserve
 * @returns {Object} Data, loading state, error, and container style
 * 
 * @example
 * const { data, loading, error, containerStyle } = useShiftlessFetch(
 *   () => fetchUserData(),
 *   '400px'
 * );
 * 
 * return (
 *   <div style={containerStyle}>
 *     {loading && <Skeleton />}
 *     {error && <Error message={error.message} />}
 *     {data && <Content data={data} />}
 *   </div>
 * );
 */
export const useShiftlessFetch = (fetchFn, minHeight) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerStyle = reserveSpace(minHeight);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [fetchFn]);

  return {
    data,
    loading,
    error,
    containerStyle,
    refetch: () => {
      setLoading(true);
      setError(null);
    },
  };
};

export default {
  useReservedSpace,
  useSkeletonDimensions,
  useImageContainer,
  useCoordinatedLoading,
  useLoadingTransition,
  useCLSMeasurement,
  useShiftlessInsertion,
  useStableList,
  useShiftlessFetch,
};
