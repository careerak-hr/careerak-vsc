import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';
import Spinner from './Spinner';

/**
 * Overlay Spinner Component
 * 
 * Full-screen overlay with centered spinner for blocking operations
 * 
 * Features:
 * - Backdrop with fade animation
 * - Centered spinner
 * - Optional message
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * 
 * Usage:
 * <OverlaySpinner show={isLoading} message="Uploading..." />
 */

const OverlaySpinner = ({ 
  show = false,
  message = '',
  backdropOpacity = 0.5,
  spinnerSize = 'large',
  spinnerColor = 'primary'
}) => {
  const { shouldAnimate, variants } = useAnimation();

  // Backdrop animation
  const backdropVariants = shouldAnimate ? {
    initial: { opacity: 0 },
    animate: { opacity: backdropOpacity },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: backdropOpacity },
    animate: { opacity: backdropOpacity },
    exit: { opacity: backdropOpacity }
  };

  // Content animation
  const contentVariants = shouldAnimate ? {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 }
  } : {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 1, scale: 1 }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={backdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black" style={{ opacity: backdropOpacity }} />
          
          {/* Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4 p-6 bg-[#E3DAD1] dark:bg-[#2d2d2d] rounded-2xl shadow-2xl"
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Spinner size={spinnerSize} color={spinnerColor} />
            
            {message && (
              <p className="text-[#304B60] dark:text-[#e0e0e0] text-center font-medium">
                {message}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OverlaySpinner;
