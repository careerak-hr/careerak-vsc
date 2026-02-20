import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';

/**
 * InteractiveElement Component
 * 
 * Wraps any element with hover and tap animations using Framer Motion.
 * Provides preset animation styles for different element types.
 * Respects prefers-reduced-motion setting via AnimationContext.
 * 
 * Props:
 * - children: Element to animate
 * - as: HTML element type (default: 'button')
 * - variant: Animation preset ('default', 'primary', 'secondary', 'icon', 'floating', 'danger', 'subtle', 'card')
 * - hoverScale: Scale factor on hover (default: 1.05)
 * - tapScale: Scale factor on tap (default: 0.95)
 * - className: CSS classes
 * - style: Inline styles
 * - disabled: Disable animations when true
 * - ...rest: All other props passed to motion element
 * 
 * Variants:
 * - default: Basic scale animation
 * - primary: Scale with accent shadow
 * - secondary: Scale with subtle shadow
 * - icon: Larger scale for icons
 * - floating: Large scale with prominent shadow
 * - danger: Scale with red shadow
 * - subtle: Minimal scale for tabs/filters
 * - card: Lift effect for cards
 * 
 * Usage:
 * <InteractiveElement as="button" variant="primary" onClick={handleClick}>
 *   Click me
 * </InteractiveElement>
 */
const InteractiveElement = ({ 
  children, 
  as = 'button',
  variant = 'default',
  hoverScale,
  tapScale,
  className = '',
  style = {},
  disabled = false,
  ...rest 
}) => {
  const { shouldAnimate } = useAnimation();

  // Create motion component dynamically
  const MotionComponent = motion[as] || motion.button;

  // Variant presets
  const variantPresets = {
    default: {
      hover: { scale: 1.05 },
      tap: { scale: 0.95 }
    },
    primary: {
      hover: { 
        scale: 1.05,
        boxShadow: '0 4px 12px rgba(212, 129, 97, 0.3)'
      },
      tap: { scale: 0.95 }
    },
    secondary: {
      hover: { 
        scale: 1.05,
        boxShadow: '0 2px 8px rgba(48, 75, 96, 0.15)'
      },
      tap: { scale: 0.95 }
    },
    icon: {
      hover: { scale: 1.1 },
      tap: { scale: 0.9 }
    },
    floating: {
      hover: { 
        scale: 1.1,
        boxShadow: '0 8px 24px rgba(212, 129, 97, 0.4)'
      },
      tap: { scale: 0.9 }
    },
    danger: {
      hover: { 
        scale: 1.05,
        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
      },
      tap: { scale: 0.95 }
    },
    subtle: {
      hover: { scale: 1.02 },
      tap: { scale: 0.98 }
    },
    card: {
      hover: { 
        y: -5,
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)'
      },
      tap: { scale: 0.98 }
    }
  };

  // Get preset or use custom scales
  const preset = variantPresets[variant] || variantPresets.default;
  
  const hoverAnimation = hoverScale !== undefined 
    ? { scale: hoverScale }
    : preset.hover;
    
  const tapAnimation = tapScale !== undefined
    ? { scale: tapScale }
    : preset.tap;

  // Animation variants
  const interactiveVariants = {
    hover: {
      ...hoverAnimation,
      transition: { duration: 0.2, ease: 'easeInOut' }
    },
    tap: {
      ...tapAnimation,
      transition: { duration: 0.1, ease: 'easeInOut' }
    }
  };

  // If animations are disabled or element is disabled, render without animation
  if (!shouldAnimate || disabled) {
    const Component = as;
    return (
      <Component 
        className={className} 
        style={style} 
        disabled={disabled}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  return (
    <MotionComponent
      whileHover="hover"
      whileTap="tap"
      variants={interactiveVariants}
      className={className}
      style={style}
      disabled={disabled}
      {...rest}
    >
      {children}
    </MotionComponent>
  );
};

export default InteractiveElement;
