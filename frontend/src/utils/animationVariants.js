/**
 * Animation Variants Library
 * 
 * Comprehensive collection of Framer Motion animation variants for Careerak platform.
 * All animations respect prefers-reduced-motion setting via AnimationContext.
 * 
 * Usage:
 * import { pageVariants, modalVariants, buttonVariants } from '@/utils/animationVariants';
 * 
 * <motion.div variants={pageVariants.fadeIn} initial="initial" animate="animate" exit="exit">
 *   Content
 * </motion.div>
 */

// Default transition settings
const defaultTransition = {
  duration: 0.3,
  ease: "easeInOut"
};

const fastTransition = {
  duration: 0.2,
  ease: "easeInOut"
};

const slowTransition = {
  duration: 0.4,
  ease: "easeInOut"
};

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageVariants = {
  // Fade in/out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: defaultTransition
  },

  // Slide from left
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: defaultTransition
  },

  // Slide from right
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: defaultTransition
  },

  // Slide from top
  slideInTop: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: defaultTransition
  },

  // Slide from bottom
  slideInBottom: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: defaultTransition
  },

  // Scale up
  scaleUp: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: defaultTransition
  },

  // Fade and slide (combined)
  fadeSlide: {
    initial: { opacity: 0, x: -30, y: 10 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 30, y: -10 },
    transition: defaultTransition
  }
};

// ============================================================================
// MODAL ANIMATIONS
// ============================================================================

export const modalVariants = {
  // Scale in with fade (primary modal animation)
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: defaultTransition
  },

  // Simple fade in/out (alternative modal animation)
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: defaultTransition
  },

  // Slide up from bottom
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: defaultTransition
  },

  // Slide down from top
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: defaultTransition
  },

  // Zoom in
  zoomIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: springTransition
  },

  // Backdrop fade (for modal overlay)
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: fastTransition
  }
};

// ============================================================================
// LIST ANIMATIONS (Stagger)
// ============================================================================

export const listVariants = {
  // Container for stagger animation
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05, // 50ms delay between items
        delayChildren: 0.1
      }
    },
    exit: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1
      }
    }
  },

  // Individual list item
  item: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: defaultTransition
  },

  // Item with slide from left
  itemSlideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: defaultTransition
  },

  // Item with scale
  itemScale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: defaultTransition
  },

  // Fast stagger container (30ms delay)
  fastContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05
      }
    }
  },

  // Slow stagger container (100ms delay)
  slowContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  }
};

// ============================================================================
// BUTTON ANIMATIONS
// ============================================================================

export const buttonVariants = {
  // Hover scale up (default)
  hover: {
    scale: 1.05,
    transition: fastTransition
  },

  // Tap scale down
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  },

  // Hover with color shift (use with whileHover)
  hoverGlow: {
    scale: 1.02,
    boxShadow: "0 0 20px rgba(212, 129, 97, 0.3)",
    transition: fastTransition
  },

  // Spring bounce on hover
  hoverBounce: {
    scale: 1.1,
    transition: springTransition
  },

  // Subtle hover (for tabs, filters)
  hoverSubtle: {
    scale: 1.02,
    transition: fastTransition
  },

  // Primary button hover (with shadow)
  hoverPrimary: {
    scale: 1.05,
    boxShadow: "0 4px 12px rgba(212, 129, 97, 0.3)",
    transition: fastTransition
  },

  // Secondary button hover
  hoverSecondary: {
    scale: 1.05,
    boxShadow: "0 2px 8px rgba(48, 75, 96, 0.15)",
    transition: fastTransition
  },

  // Icon button hover (larger scale)
  hoverIcon: {
    scale: 1.1,
    transition: fastTransition
  },

  // Floating button hover (with large shadow)
  hoverFloating: {
    scale: 1.1,
    boxShadow: "0 8px 24px rgba(212, 129, 97, 0.4)",
    transition: fastTransition
  },

  // Danger button hover
  hoverDanger: {
    scale: 1.05,
    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
    transition: fastTransition
  },

  // Close button hover (with rotation)
  hoverClose: {
    scale: 1.1,
    rotate: 90,
    transition: fastTransition
  },

  // Combined hover and tap for Framer Motion
  interactive: {
    whileHover: {
      scale: 1.05,
      transition: fastTransition
    },
    whileTap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  },

  // Interactive with glow
  interactiveGlow: {
    whileHover: {
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(212, 129, 97, 0.3)",
      transition: fastTransition
    },
    whileTap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  },

  // Interactive icon
  interactiveIcon: {
    whileHover: {
      scale: 1.1,
      transition: fastTransition
    },
    whileTap: {
      scale: 0.9,
      transition: { duration: 0.1 }
    }
  }
};

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const loadingVariants = {
  // Spinner rotation
  spinner: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },

  // Pulse animation
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Skeleton shimmer
  shimmer: {
    animate: {
      backgroundPosition: ["200% 0", "-200% 0"],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },

  // Dots loading (for use with multiple elements)
  dots: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};

// ============================================================================
// ERROR/SUCCESS ANIMATIONS
// ============================================================================

export const feedbackVariants = {
  // Shake animation for errors
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  },

  // Bounce animation for success
  bounce: {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  },

  // Error slide in from top
  errorSlide: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: fastTransition
  },

  // Success scale in
  successScale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: springTransition
  },

  // Warning pulse
  warningPulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.8,
        repeat: 3,
        ease: "easeInOut"
      }
    }
  }
};

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardVariants = {
  // Hover lift
  hoverLift: {
    rest: { y: 0, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
    hover: {
      y: -5,
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
      transition: fastTransition
    }
  },

  // Fade in with scale
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: defaultTransition
  },

  // Flip animation
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
    transition: { duration: 0.4 }
  }
};

// ============================================================================
// DROPDOWN/ACCORDION ANIMATIONS
// ============================================================================

export const dropdownVariants = {
  // Expand/collapse
  expand: {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: defaultTransition
  },

  // Slide down
  slideDown: {
    initial: { height: 0, opacity: 0, y: -10 },
    animate: { height: "auto", opacity: 1, y: 0 },
    exit: { height: 0, opacity: 0, y: -10 },
    transition: fastTransition
  },

  // Scale expand
  scaleExpand: {
    initial: { scaleY: 0, opacity: 0, originY: 0 },
    animate: { scaleY: 1, opacity: 1 },
    exit: { scaleY: 0, opacity: 0 },
    transition: fastTransition
  }
};

// ============================================================================
// NOTIFICATION/TOAST ANIMATIONS
// ============================================================================

export const notificationVariants = {
  // Slide in from right
  slideInRight: {
    initial: { x: 400, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 400, opacity: 0 },
    transition: defaultTransition
  },

  // Slide in from top
  slideInTop: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
    transition: defaultTransition
  },

  // Pop in
  popIn: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
    transition: springTransition
  }
};

// ============================================================================
// FORM ANIMATIONS
// ============================================================================

export const formVariants = {
  // Input focus
  inputFocus: {
    scale: 1.02,
    transition: fastTransition
  },

  // Label float
  labelFloat: {
    initial: { y: 0, fontSize: "1rem" },
    animate: { y: -20, fontSize: "0.875rem" },
    transition: fastTransition
  },

  // Error shake
  errorShake: {
    animate: {
      x: [0, -5, 5, -5, 5, 0],
      transition: {
        duration: 0.4
      }
    }
  },

  // Success checkmark
  successCheck: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// ============================================================================
// NAVIGATION ANIMATIONS
// ============================================================================

export const navVariants = {
  // Menu slide in
  menuSlide: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    transition: defaultTransition
  },

  // Menu fade
  menuFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: fastTransition
  },

  // Nav item stagger
  navItemContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },

  navItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: defaultTransition
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get animation variants with reduced motion support
 * @param {Object} variants - Animation variants object
 * @param {boolean} shouldAnimate - Whether animations should be enabled
 * @returns {Object} Modified variants or static variants
 */
export const getReducedMotionVariants = (variants, shouldAnimate = true) => {
  if (!shouldAnimate) {
    // Return static variants (no animation)
    return {
      initial: variants.animate || {},
      animate: variants.animate || {},
      exit: variants.animate || {},
      transition: { duration: 0 }
    };
  }
  return variants;
};

/**
 * Create custom transition
 * @param {Object} options - Transition options
 * @returns {Object} Transition configuration
 */
export const createTransition = ({
  duration = 0.3,
  ease = "easeInOut",
  delay = 0,
  type = "tween"
} = {}) => {
  return { duration, ease, delay, type };
};

/**
 * Create stagger container
 * @param {number} staggerDelay - Delay between children (in seconds)
 * @param {number} delayChildren - Initial delay before first child
 * @returns {Object} Stagger container variants
 */
export const createStaggerContainer = (staggerDelay = 0.05, delayChildren = 0.1) => {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren
      }
    }
  };
};

// ============================================================================
// PRESET COMBINATIONS
// ============================================================================

/**
 * Common preset combinations for quick use
 */
export const presets = {
  // Page with fade
  page: pageVariants.fadeIn,
  
  // Modal with backdrop
  modal: {
    content: modalVariants.scaleIn,
    backdrop: modalVariants.backdrop
  },
  
  // List with stagger
  list: {
    container: listVariants.container,
    item: listVariants.item
  },
  
  // Button interactions (default)
  button: {
    whileHover: buttonVariants.hover,
    whileTap: buttonVariants.tap
  },

  // Primary button with glow
  buttonPrimary: {
    whileHover: buttonVariants.hoverPrimary,
    whileTap: buttonVariants.tap
  },

  // Secondary button
  buttonSecondary: {
    whileHover: buttonVariants.hoverSecondary,
    whileTap: buttonVariants.tap
  },

  // Icon button
  buttonIcon: {
    whileHover: buttonVariants.hoverIcon,
    whileTap: { scale: 0.9, transition: { duration: 0.1 } }
  },

  // Floating action button
  buttonFloating: {
    whileHover: buttonVariants.hoverFloating,
    whileTap: { scale: 0.9, transition: { duration: 0.1 } }
  },

  // Danger button
  buttonDanger: {
    whileHover: buttonVariants.hoverDanger,
    whileTap: buttonVariants.tap
  },
  
  // Card hover effect
  card: cardVariants.hoverLift,
  
  // Notification
  notification: notificationVariants.slideInRight,
  
  // Form error
  formError: feedbackVariants.shake
};

// Export all variants as default
export default {
  pageVariants,
  modalVariants,
  listVariants,
  buttonVariants,
  loadingVariants,
  feedbackVariants,
  cardVariants,
  dropdownVariants,
  notificationVariants,
  formVariants,
  navVariants,
  presets,
  getReducedMotionVariants,
  createTransition,
  createStaggerContainer
};
