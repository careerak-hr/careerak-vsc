import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../../context/AnimationContext';

/**
 * Button Spinner Component
 * 
 * Small spinner for use inside buttons during loading states
 * 
 * Features:
 * - Compact size for buttons
 * - Framer Motion animation
 * - Respects prefers-reduced-motion
 * - Dark mode support
 * 
 * Usage:
 * <button disabled={loading}>
 *   {loading ? <ButtonSpinner /> : 'Submit'}
 * </button>
 */

const ButtonSpinner = ({ 
  color = 'white',
  className = '',
  ariaLabel = 'Processing...'
}) => {
  const { shouldAnimate } = useAnimation();

  // Color configurations
  const colors = {
    white: 'border-white border-t-transparent',
    primary: 'border-[#304B60] border-t-transparent',
    accent: 'border-[#D48161] border-t-transparent'
  };

  // Animation variants
  const spinnerVariants = shouldAnimate ? {
    animate: {
      rotate: 360,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "linear"
      }
    }
  } : {
    animate: { rotate: 0 }
  };

  return (
    <motion.div
      className={`inline-block w-4 h-4 border-2 rounded-full ${colors[color]} ${className}`}
      variants={spinnerVariants}
      animate="animate"
      role="status"
      aria-label={ariaLabel}
    />
  );
};

export default ButtonSpinner;
