/**
 * Layout Shift Prevention Utilities
 * 
 * Provides utilities to prevent Cumulative Layout Shift (CLS) during loading states.
 * 
 * Requirements:
 * - FR-LOAD-8: Coordinate loading states to prevent layout shifts
 * - NFR-PERF-5: Achieve CLS < 0.1
 * - NFR-USE-3: Display loading states within 100ms
 * 
 * Key Principles:
 * 1. Reserve space for content before it loads
 * 2. Use fixed dimensions for skeleton loaders
 * 3. Avoid inserting content above existing content
 * 4. Use transform/opacity for animations (GPU-accelerated)
 * 5. Set explicit width/height on images and media
 * 
 * @module layoutShiftPrevention
 */

/**
 * Calculate aspect ratio from dimensions
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {string} Aspect ratio as percentage (e.g., "56.25%")
 */
export const calculateAspectRatio = (width, height) => {
  if (!width || !height || width <= 0 || height <= 0) {
    return '100%';
  }
  return `${(height / width) * 100}%`;
};

/**
 * Create aspect ratio container styles
 * Prevents layout shift by reserving space before content loads
 * 
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {Object} Style object with aspect ratio
 * 
 * @example
 * const containerStyle = getAspectRatioStyles(16, 9);
 * <div style={containerStyle}>
 *   <img src="..." style={{ position: 'absolute', width: '100%', height: '100%' }} />
 * </div>
 */
export const getAspectRatioStyles = (width, height) => {
  return {
    position: 'relative',
    width: '100%',
    paddingBottom: calculateAspectRatio(width, height),
    overflow: 'hidden',
  };
};

/**
 * Get skeleton dimensions that match content
 * Ensures skeleton loader has same dimensions as actual content
 * 
 * @param {string} contentType - Type of content ('card', 'list-item', 'image', 'text', 'button')
 * @param {Object} options - Additional options
 * @returns {Object} Dimensions object { width, height, minHeight }
 * 
 * @example
 * const dimensions = getSkeletonDimensions('card');
 * <SkeletonLoader {...dimensions} />
 */
export const getSkeletonDimensions = (contentType, options = {}) => {
  const defaults = {
    card: {
      width: '100%',
      height: 'auto',
      minHeight: '200px',
    },
    'list-item': {
      width: '100%',
      height: 'auto',
      minHeight: '80px',
    },
    image: {
      width: options.width || '100%',
      height: options.height || 'auto',
      minHeight: options.minHeight || '200px',
    },
    text: {
      width: options.width || '100%',
      height: options.height || '16px',
      minHeight: '16px',
    },
    button: {
      width: options.width || '120px',
      height: '40px',
      minHeight: '40px',
    },
    avatar: {
      width: options.size || '48px',
      height: options.size || '48px',
      minHeight: options.size || '48px',
    },
  };

  return defaults[contentType] || defaults.card;
};

/**
 * Create container with reserved space
 * Prevents layout shift by setting min-height before content loads
 * 
 * @param {number|string} minHeight - Minimum height (px or CSS value)
 * @returns {Object} Style object
 * 
 * @example
 * const containerStyle = reserveSpace('300px');
 * <div style={containerStyle}>
 *   {loading ? <Skeleton /> : <Content />}
 * </div>
 */
export const reserveSpace = (minHeight) => {
  return {
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    transition: 'min-height 200ms ease-in-out',
  };
};

/**
 * Get image container styles with aspect ratio
 * Prevents layout shift for images by reserving space
 * 
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Object} options - Additional options
 * @returns {Object} Container and image styles
 * 
 * @example
 * const { containerStyle, imageStyle } = getImageContainerStyles(800, 600);
 * <div style={containerStyle}>
 *   <img src="..." style={imageStyle} />
 * </div>
 */
export const getImageContainerStyles = (width, height, options = {}) => {
  const aspectRatio = calculateAspectRatio(width, height);
  
  return {
    containerStyle: {
      position: 'relative',
      width: '100%',
      paddingBottom: aspectRatio,
      backgroundColor: options.backgroundColor || '#f3f4f6',
      overflow: 'hidden',
      ...options.containerStyle,
    },
    imageStyle: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: options.objectFit || 'cover',
      transition: 'opacity 200ms ease-in-out',
      ...options.imageStyle,
    },
  };
};

/**
 * Coordinate multiple loading states
 * Ensures all sections load without causing layout shifts
 * 
 * @param {Array<Object>} sections - Array of section configs
 * @returns {Object} Coordinated loading state
 * 
 * @example
 * const sections = [
 *   { id: 'header', minHeight: '100px', loading: true },
 *   { id: 'content', minHeight: '400px', loading: true },
 *   { id: 'footer', minHeight: '80px', loading: false },
 * ];
 * const coordinated = coordinateLoadingStates(sections);
 */
export const coordinateLoadingStates = (sections) => {
  const totalMinHeight = sections.reduce((sum, section) => {
    const height = parseInt(section.minHeight) || 0;
    return sum + height;
  }, 0);

  const loadingCount = sections.filter(s => s.loading).length;
  const allLoaded = loadingCount === 0;

  return {
    totalMinHeight: `${totalMinHeight}px`,
    loadingCount,
    allLoaded,
    sections: sections.map(section => ({
      ...section,
      style: reserveSpace(section.minHeight),
    })),
  };
};

/**
 * Get transition styles for loading state changes
 * Uses GPU-accelerated properties (transform, opacity)
 * 
 * @param {boolean} isLoading - Current loading state
 * @returns {Object} Transition styles
 * 
 * @example
 * const transitionStyle = getLoadingTransitionStyles(loading);
 * <div style={transitionStyle}>
 *   {loading ? <Skeleton /> : <Content />}
 * </div>
 */
export const getLoadingTransitionStyles = (isLoading) => {
  return {
    opacity: isLoading ? 0.6 : 1,
    transform: isLoading ? 'scale(0.98)' : 'scale(1)',
    transition: 'opacity 200ms ease-in-out, transform 200ms ease-in-out',
    willChange: 'opacity, transform',
  };
};

/**
 * Prevent layout shift for dynamic content insertion
 * Ensures content is inserted without shifting existing content
 * 
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement} newContent - New content to insert
 * @param {Object} options - Insertion options
 * 
 * @example
 * preventShiftOnInsert(containerEl, newContentEl, { position: 'append' });
 */
export const preventShiftOnInsert = (container, newContent, options = {}) => {
  if (!container || !newContent) return;

  const { position = 'append', animate = true } = options;

  // Measure container height before insertion
  const beforeHeight = container.offsetHeight;

  // Insert content
  if (position === 'prepend') {
    container.insertBefore(newContent, container.firstChild);
  } else {
    container.appendChild(newContent);
  }

  // If prepending, adjust scroll to prevent visual shift
  if (position === 'prepend') {
    const afterHeight = container.offsetHeight;
    const heightDiff = afterHeight - beforeHeight;
    
    if (heightDiff > 0 && container.scrollTop !== undefined) {
      container.scrollTop += heightDiff;
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
};

/**
 * Get list container styles to prevent shifts
 * Ensures list items load without causing layout shifts
 * 
 * @param {number} itemCount - Number of items
 * @param {number} itemHeight - Height per item
 * @returns {Object} Container styles
 * 
 * @example
 * const listStyle = getListContainerStyles(10, 80);
 * <div style={listStyle}>
 *   {items.map(item => <ListItem key={item.id} />)}
 * </div>
 */
export const getListContainerStyles = (itemCount, itemHeight) => {
  return {
    minHeight: `${itemCount * itemHeight}px`,
    transition: 'min-height 200ms ease-in-out',
  };
};

/**
 * Measure CLS (Cumulative Layout Shift)
 * Uses PerformanceObserver to track layout shifts
 * 
 * @param {Function} callback - Callback with CLS value
 * @returns {PerformanceObserver} Observer instance
 * 
 * @example
 * const observer = measureCLS((cls) => {
 *   console.log('CLS:', cls);
 *   if (cls > 0.1) {
 *     console.warn('CLS exceeds threshold!');
 *   }
 * });
 */
export const measureCLS = (callback) => {
  let clsValue = 0;

  if (typeof PerformanceObserver === 'undefined') {
    console.warn('PerformanceObserver not supported');
    return null;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          callback(clsValue);
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
    return observer;
  } catch (error) {
    console.error('Error measuring CLS:', error);
    return null;
  }
};

/**
 * Create stable grid layout
 * Prevents layout shifts in grid layouts
 * 
 * @param {Object} options - Grid options
 * @returns {Object} Grid styles
 * 
 * @example
 * const gridStyle = getStableGridStyles({ columns: 3, gap: '1rem', minItemHeight: '200px' });
 * <div style={gridStyle}>
 *   {items.map(item => <GridItem key={item.id} />)}
 * </div>
 */
export const getStableGridStyles = (options = {}) => {
  const {
    columns = 3,
    gap = '1rem',
    minItemHeight = '200px',
  } = options;

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    gridAutoRows: `minmax(${minItemHeight}, auto)`,
  };
};

/**
 * Font loading strategy to prevent FOIT/FOUT
 * Prevents layout shift from font loading
 * 
 * @returns {Object} Font loading configuration
 */
export const getFontLoadingStrategy = () => {
  return {
    fontDisplay: 'swap', // Use fallback font immediately
    preloadFonts: [
      { family: 'Amiri', weight: '400' },
      { family: 'Cairo', weight: '400' },
      { family: 'Cormorant Garamond', weight: '400' },
      { family: 'EB Garamond', weight: '400' },
    ],
  };
};

/**
 * Best practices for preventing layout shifts
 */
export const LAYOUT_SHIFT_BEST_PRACTICES = {
  // Always set dimensions on images and media
  images: {
    alwaysSetDimensions: true,
    useAspectRatio: true,
    usePlaceholder: true,
  },
  
  // Reserve space for dynamic content
  dynamicContent: {
    useMinHeight: true,
    useSkeletonLoaders: true,
    matchSkeletonDimensions: true,
  },
  
  // Use GPU-accelerated properties for animations
  animations: {
    useTransform: true,
    useOpacity: true,
    avoidWidthHeight: true,
    avoidTopLeft: true,
  },
  
  // Font loading
  fonts: {
    useFontDisplay: 'swap',
    preloadCriticalFonts: true,
  },
  
  // Content insertion
  insertion: {
    avoidPrepending: true,
    useFixedPositions: true,
    animateGracefully: true,
  },
};

export default {
  calculateAspectRatio,
  getAspectRatioStyles,
  getSkeletonDimensions,
  reserveSpace,
  getImageContainerStyles,
  coordinateLoadingStates,
  getLoadingTransitionStyles,
  preventShiftOnInsert,
  getListContainerStyles,
  measureCLS,
  getStableGridStyles,
  getFontLoadingStrategy,
  LAYOUT_SHIFT_BEST_PRACTICES,
};
