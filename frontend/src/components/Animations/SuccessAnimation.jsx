import React from 'react';
import { motion } from 'framer-motion';
import { feedbackVariants } from '../../utils/animationVariants';

/**
 * SuccessAnimation Component
 * 
 * Displays success animations with checkmark and fade effects.
 * Respects prefers-reduced-motion setting.
 * 
 * @param {Object} props
 * @param {string} props.variant - Animation variant: 'checkmark', 'fade', 'glow', 'bounce', 'slide'
 * @param {string} props.size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.color - Color: 'green', 'accent', 'primary' (default: 'green')
 * @param {React.ReactNode} props.children - Optional content to display with animation
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onAnimationComplete - Callback when animation completes
 */
const SuccessAnimation = ({
  variant = 'checkmark',
  size = 'md',
  color = 'green',
  children,
  className = '',
  onAnimationComplete
}) => {
  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48
  };

  // Color mappings
  const colorClasses = {
    green: 'text-green-500',
    accent: 'text-[#D48161]',
    primary: 'text-[#304B60]'
  };

  const strokeColors = {
    green: '#22c55e',
    accent: '#D48161',
    primary: '#304B60'
  };

  // Get animation variant
  const getVariant = () => {
    switch (variant) {
      case 'checkmark':
        return feedbackVariants.successCheckmarkContainer;
      case 'fade':
        return feedbackVariants.successFade;
      case 'glow':
        return feedbackVariants.successGlow;
      case 'bounce':
        return feedbackVariants.successCheckmarkBounce;
      case 'slide':
        return feedbackVariants.successSlideBottom;
      default:
        return feedbackVariants.successCheckmarkContainer;
    }
  };

  // Checkmark SVG component
  const CheckmarkIcon = () => (
    <svg
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke={strokeColors[color]}
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.path
        d="M7 12l3 3 7-7"
        stroke={strokeColors[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={feedbackVariants.successCheckmark}
        initial="initial"
        animate="animate"
      />
    </svg>
  );

  return (
    <motion.div
      variants={getVariant()}
      initial="initial"
      animate="animate"
      exit="exit"
      onAnimationComplete={onAnimationComplete}
      className={`flex items-center justify-center ${className}`}
    >
      {variant === 'checkmark' || variant === 'bounce' ? (
        <div className={`${sizeClasses[size]} ${colorClasses[color]}`}>
          <CheckmarkIcon />
        </div>
      ) : null}
      {children && (
        <motion.div
          variants={feedbackVariants.successFadeSlide}
          initial="initial"
          animate="animate"
          className="ml-3"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SuccessAnimation;
