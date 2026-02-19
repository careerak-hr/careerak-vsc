import React from 'react';
import { motion } from 'framer-motion';
import { useAnimation } from '../context/AnimationContext';

/**
 * PageTransition Component
 * 
 * Wraps page content with Framer Motion animations for smooth page transitions.
 * Respects prefers-reduced-motion setting via AnimationContext.
 * 
 * Props:
 * - children: Page content to animate
 * - variant: Animation variant to use ('fadeIn', 'slideIn', 'slideInLeft', 'slideInRight', 'scaleUp')
 * 
 * Default: fadeIn animation
 * 
 * Usage:
 * <PageTransition variant="fadeIn">
 *   <YourPageContent />
 * </PageTransition>
 */
const PageTransition = ({ children, variant = 'fadeIn' }) => {
  const { shouldAnimate, variants } = useAnimation();

  // Get the appropriate page variant
  const pageVariant = variants.pageVariants[variant] || variants.pageVariants.fadeIn;

  // If animations are disabled (prefers-reduced-motion), render without animation
  if (!shouldAnimate) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariant}
      style={{
        width: '100%',
        minHeight: '100vh'
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
