import React, { createContext, useContext, useState, useEffect } from 'react';
import animationVariantsLibrary from '../utils/animationVariants';

/**
 * AnimationContext - Manages animation settings and prefers-reduced-motion detection
 * 
 * Features:
 * - defaultTransition: Default Framer Motion transition settings
 * - prefersReducedMotion: Detected user preference for reduced motion
 * - shouldAnimate: Boolean indicating if animations should be enabled
 * - animationVariants: Common animation variants for reuse
 * - variants: Comprehensive animation variants library
 * 
 * Default transition: { duration: 0.3, ease: "easeInOut" }
 * Respects prefers-reduced-motion media query
 */

const AnimationContext = createContext(undefined);

export const AnimationProvider = ({ children }) => {
  // Default transition settings for Framer Motion
  const defaultTransition = {
    duration: 0.3,
    ease: "easeInOut"
  };

  // Detect prefers-reduced-motion setting
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window.matchMedia is available (for SSR compatibility)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // Create media query for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create event listener for changes
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener (using addEventListener for modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup function
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Determine if animations should be enabled
  const shouldAnimate = !prefersReducedMotion;

  // Common animation variants for reuse across the app
  const animationVariants = {
    // Page transitions
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: defaultTransition
    },
    slideIn: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
      transition: defaultTransition
    },
    // Modal animations
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: defaultTransition
    },
    // Backdrop fade
    backdropFade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    },
    // List stagger (50ms delay between items)
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.05 // 50ms delay
        }
      }
    },
    staggerItem: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: defaultTransition
    },
    // Button interactions
    buttonHover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    buttonTap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Helper function to get transition with reduced motion support
  const getTransition = (customTransition = {}) => {
    if (!shouldAnimate) {
      return { duration: 0 };
    }
    return { ...defaultTransition, ...customTransition };
  };

  // Helper function to get animation variants with reduced motion support
  const getVariants = (variantName) => {
    if (!shouldAnimate) {
      // Return variants with no animation
      const variant = animationVariants[variantName];
      if (variant) {
        return {
          initial: variant.animate,
          animate: variant.animate,
          exit: variant.animate,
          transition: { duration: 0 }
        };
      }
    }
    return animationVariants[variantName];
  };

  const value = {
    defaultTransition,
    prefersReducedMotion,
    shouldAnimate,
    animationVariants,
    getTransition,
    getVariants,
    // Export comprehensive variants library
    variants: animationVariantsLibrary
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * Custom hook to use animation context
 * @returns {Object} { defaultTransition, prefersReducedMotion, shouldAnimate, animationVariants, getTransition, getVariants, variants }
 * @throws {Error} If used outside AnimationProvider
 */
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  
  return context;
};

// Re-export animation variants library for direct import
export { default as animationVariants } from '../utils/animationVariants';
export * from '../utils/animationVariants';

export default AnimationContext;
