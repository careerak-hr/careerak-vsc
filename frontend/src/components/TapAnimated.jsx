import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';

/**
 * TapAnimated Component
 * 
 * Wraps any element with tap (press) animations using Framer Motion.
 * Respects prefers-reduced-motion setting via AnimationContext.
 * 
 * Props:
 * - children: Element to animate
 * - as: HTML element type (default: 'div')
 * - scale: Scale factor on tap (default: 0.95)
 * - className: CSS classes
 * - style: Inline styles
 * - ...rest: All other props passed to motion element
 * 
 * Usage:
 * <TapAnimated as="button" onClick={handleClick}>
 *   Click me
 * </TapAnimated>
 */
const TapAnimated = ({ 
  children, 
  as = 'div',
  scale = 0.95,
  className = '',
  style = {},
  ...rest 
}) => {
  const { shouldAnimate } = useAnimation();

  // Create motion component dynamically
  const MotionComponent = motion[as] || motion.div;

  // Tap animation variants
  const tapVariants = {
    tap: {
      scale: shouldAnimate ? scale : 1,
      transition: { duration: 0.1, ease: 'easeInOut' }
    }
  };

  // If animations are disabled, render without animation
  if (!shouldAnimate) {
    const Component = as;
    return (
      <Component className={className} style={style} {...rest}>
        {children}
      </Component>
    );
  }

  return (
    <MotionComponent
      whileTap="tap"
      variants={tapVariants}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
};

export default TapAnimated;
