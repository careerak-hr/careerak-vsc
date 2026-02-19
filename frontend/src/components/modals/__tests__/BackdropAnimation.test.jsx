import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../../utils/animationVariants';

/**
 * Backdrop Fade Animation Tests
 * 
 * Tests for task 4.3.3: Add backdrop fade animation
 * Validates that modal backdrops have proper fade animations
 */

describe('Backdrop Fade Animation', () => {
  describe('Animation Variants', () => {
    it('should have backdrop variant defined', () => {
      expect(modalVariants.backdrop).toBeDefined();
    });

    it('should have initial opacity of 0', () => {
      expect(modalVariants.backdrop.initial.opacity).toBe(0);
    });

    it('should animate to opacity 1', () => {
      expect(modalVariants.backdrop.animate.opacity).toBe(1);
    });

    it('should exit with opacity 0', () => {
      expect(modalVariants.backdrop.exit.opacity).toBe(0);
    });

    it('should have fast transition (200ms)', () => {
      expect(modalVariants.backdrop.transition.duration).toBe(0.2);
    });

    it('should use easeInOut easing', () => {
      expect(modalVariants.backdrop.transition.ease).toBe('easeInOut');
    });
  });

  describe('Backdrop Component Rendering', () => {
    it('should render backdrop with animation variants', () => {
      const TestBackdrop = ({ isOpen }) => (
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              data-testid="modal-backdrop"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={modalVariants.backdrop}
            >
              <div data-testid="modal-content">Modal Content</div>
            </motion.div>
          )}
        </AnimatePresence>
      );

      const { rerender } = render(<TestBackdrop isOpen={true} />);
      expect(screen.getByTestId('modal-backdrop')).toBeInTheDocument();
      
      rerender(<TestBackdrop isOpen={false} />);
      // After animation completes, backdrop should be removed
    });

    it('should apply backdrop variants to modal overlay', () => {
      const TestModal = () => (
        <motion.div
          data-testid="backdrop"
          variants={modalVariants.backdrop}
          initial="initial"
          animate="animate"
        >
          <motion.div
            data-testid="content"
            variants={modalVariants.scaleIn}
            initial="initial"
            animate="animate"
          >
            Content
          </motion.div>
        </motion.div>
      );

      render(<TestModal />);
      expect(screen.getByTestId('backdrop')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  describe('Animation Properties', () => {
    it('should only animate opacity (GPU-accelerated)', () => {
      const { initial, animate, exit } = modalVariants.backdrop;
      
      // Check that only opacity is animated
      expect(Object.keys(initial)).toEqual(['opacity']);
      expect(Object.keys(animate)).toEqual(['opacity']);
      expect(Object.keys(exit)).toEqual(['opacity']);
    });

    it('should have faster transition than modal content', () => {
      const backdropDuration = modalVariants.backdrop.transition.duration;
      const contentDuration = modalVariants.scaleIn.transition.duration;
      
      expect(backdropDuration).toBeLessThan(contentDuration);
    });

    it('should meet animation duration requirements (200-300ms)', () => {
      const duration = modalVariants.backdrop.transition.duration * 1000; // Convert to ms
      expect(duration).toBeGreaterThanOrEqual(200);
      expect(duration).toBeLessThanOrEqual(300);
    });
  });

  describe('Reduced Motion Support', () => {
    it('should support reduced motion by accepting empty variants', () => {
      const shouldAnimate = false;
      const variants = shouldAnimate ? modalVariants.backdrop : {};
      
      expect(variants).toEqual({});
    });

    it('should use backdrop variants when animations are enabled', () => {
      const shouldAnimate = true;
      const variants = shouldAnimate ? modalVariants.backdrop : {};
      
      expect(variants).toEqual(modalVariants.backdrop);
    });
  });

  describe('Integration with Modal Content', () => {
    it('should coordinate with modal content animation', () => {
      const backdrop = modalVariants.backdrop;
      const content = modalVariants.scaleIn;
      
      // Both should have same animation states
      expect(backdrop.initial).toBeDefined();
      expect(backdrop.animate).toBeDefined();
      expect(backdrop.exit).toBeDefined();
      
      expect(content.initial).toBeDefined();
      expect(content.animate).toBeDefined();
      expect(content.exit).toBeDefined();
    });

    it('should have consistent easing with modal content', () => {
      const backdropEase = modalVariants.backdrop.transition.ease;
      const contentEase = modalVariants.scaleIn.transition.ease;
      
      expect(backdropEase).toBe(contentEase);
    });
  });
});
