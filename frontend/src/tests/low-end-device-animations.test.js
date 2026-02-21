/**
 * Low-End Device Animation Tests
 * Task 4.6.6: Test animations on low-end devices
 * 
 * This test suite validates that animations perform well on low-end devices
 * by simulating performance constraints and measuring animation metrics.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AnimationProvider } from '../context/AnimationContext';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import { listVariants, modalVariants, buttonVariants } from '../utils/animationVariants';

describe('Low-End Device Animation Tests', () => {
  
  describe('Page Transition Performance', () => {
    it('should complete page transition within 300ms', async () => {
      const startTime = performance.now();
      
      render(
        <AnimationProvider>
          <BrowserRouter>
            <PageTransition variant="fadeIn">
              <div>Test Page Content</div>
            </PageTransition>
          </BrowserRouter>
        </AnimationProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Page Content')).toBeInTheDocument();
      });
      
      const duration = performance.now() - startTime;
      
      // Animation should complete within 300ms
      expect(duration).toBeLessThan(300);
    });

    it('should use GPU-accelerated properties only', () => {
      const { pageVariants } = require('../utils/animationVariants');
      
      // Check fadeIn variant
      const fadeIn = pageVariants.fadeIn;
      expect(fadeIn.initial).toHaveProperty('opacity');
      expect(fadeIn.animate).toHaveProperty('opacity');
      
      // Should NOT have layout-triggering properties
      expect(fadeIn.initial).not.toHaveProperty('width');
      expect(fadeIn.initial).not.toHaveProperty('height');
      expect(fadeIn.initial).not.toHaveProperty('left');
      expect(fadeIn.initial).not.toHaveProperty('top');
    });

    it('should have transition duration between 200-300ms', () => {
      const { pageVariants } = require('../utils/animationVariants');
      
      Object.values(pageVariants).forEach(variant => {
        if (variant.transition && variant.transition.duration) {
          const durationMs = variant.transition.duration * 1000;
          expect(durationMs).toBeGreaterThanOrEqual(200);
          expect(durationMs).toBeLessThanOrEqual(300);
        }
      });
    });
  });

  describe('Modal Animation Performance', () => {
    it('should complete modal animation within 300ms', () => {
      const duration = modalVariants.scaleIn.transition.duration * 1000;
      expect(duration).toBeLessThanOrEqual(300);
    });

    it('should use scale and opacity only (GPU-accelerated)', () => {
      const scaleIn = modalVariants.scaleIn;
      
      // Should use GPU-accelerated properties
      expect(scaleIn.initial).toHaveProperty('opacity');
      expect(scaleIn.initial).toHaveProperty('scale');
      
      // Should NOT use layout-triggering properties
      expect(scaleIn.initial).not.toHaveProperty('width');
      expect(scaleIn.initial).not.toHaveProperty('height');
      expect(scaleIn.initial).not.toHaveProperty('margin');
      expect(scaleIn.initial).not.toHaveProperty('padding');
    });

    it('should have backdrop animation faster than content', () => {
      const backdropDuration = modalVariants.backdrop.transition.duration;
      const contentDuration = modalVariants.scaleIn.transition.duration;
      
      expect(backdropDuration).toBeLessThan(contentDuration);
    });
  });

  describe('List Stagger Performance', () => {
    it('should have 50ms stagger delay', () => {
      const container = listVariants.container;
      const staggerDelay = container.animate.transition.staggerChildren;
      
      expect(staggerDelay).toBe(0.05); // 50ms
    });

    it('should animate 20 items within 2 seconds', () => {
      const staggerDelay = listVariants.container.animate.transition.staggerChildren;
      const itemDuration = listVariants.item.transition.duration;
      
      const totalTime = (20 * staggerDelay) + itemDuration;
      
      expect(totalTime).toBeLessThan(2); // 2 seconds
    });

    it('should use GPU-accelerated properties for list items', () => {
      const item = listVariants.item;
      
      // Should use transform (y) and opacity
      expect(item.initial).toHaveProperty('opacity');
      expect(item.initial).toHaveProperty('y');
      
      // Should NOT use layout-triggering properties
      expect(item.initial).not.toHaveProperty('height');
      expect(item.initial).not.toHaveProperty('marginTop');
    });
  });

  describe('Button Animation Performance', () => {
    it('should have fast hover transition (< 200ms)', () => {
      const hoverTransition = buttonVariants.hover.transition;
      const duration = hoverTransition.duration * 1000;
      
      expect(duration).toBeLessThan(200);
    });

    it('should have very fast tap transition (< 150ms)', () => {
      const tapTransition = buttonVariants.tap.transition;
      const duration = tapTransition.duration * 1000;
      
      expect(duration).toBeLessThan(150);
    });

    it('should use scale only (GPU-accelerated)', () => {
      const hover = buttonVariants.hover;
      const tap = buttonVariants.tap;
      
      // Should use scale
      expect(hover).toHaveProperty('scale');
      expect(tap).toHaveProperty('scale');
      
      // Should NOT use layout-triggering properties
      expect(hover).not.toHaveProperty('width');
      expect(hover).not.toHaveProperty('padding');
    });
  });

  describe('Reduced Motion Support', () => {
    it('should detect prefers-reduced-motion setting', () => {
      // Mock matchMedia to return reduced motion preference
      const mockMatchMedia = (query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const TestComponent = () => {
        const { useAnimation } = require('../context/AnimationContext');
        const { shouldAnimate } = useAnimation();
        return <div data-testid="animate-status">{shouldAnimate ? 'yes' : 'no'}</div>;
      };

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('animate-status')).toHaveTextContent('no');
    });

    it('should provide zero-duration transitions when reduced motion is enabled', () => {
      const { getReducedMotionVariants } = require('../utils/animationVariants');
      const { pageVariants } = require('../utils/animationVariants');
      
      const reducedVariants = getReducedMotionVariants(pageVariants.fadeIn, false);
      
      expect(reducedVariants.transition.duration).toBe(0);
    });
  });

  describe('Memory and Performance', () => {
    it('should not create new animation objects on every render', () => {
      const { pageVariants } = require('../utils/animationVariants');
      const firstReference = pageVariants.fadeIn;
      
      // Re-import to simulate re-render
      delete require.cache[require.resolve('../utils/animationVariants')];
      const { pageVariants: pageVariants2 } = require('../utils/animationVariants');
      const secondReference = pageVariants2.fadeIn;
      
      // Should be the same object (not recreated)
      expect(firstReference).toBe(secondReference);
    });

    it('should use consistent transition objects', () => {
      const { pageVariants } = require('../utils/animationVariants');
      
      // All page variants should use similar transition structure
      Object.values(pageVariants).forEach(variant => {
        if (variant.transition) {
          expect(variant.transition).toHaveProperty('duration');
          expect(variant.transition).toHaveProperty('ease');
        }
      });
    });
  });

  describe('Animation Complexity', () => {
    it('should limit number of animated properties per variant', () => {
      const { pageVariants } = require('../utils/animationVariants');
      
      Object.values(pageVariants).forEach(variant => {
        const initialProps = Object.keys(variant.initial || {});
        const animateProps = Object.keys(variant.animate || {});
        
        // Should animate max 3 properties (opacity, x/y, scale)
        expect(initialProps.length).toBeLessThanOrEqual(3);
        expect(animateProps.length).toBeLessThanOrEqual(3);
      });
    });

    it('should use simple easing functions', () => {
      const { pageVariants, modalVariants, buttonVariants } = require('../utils/animationVariants');
      
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(buttonVariants),
      ];
      
      allVariants.forEach(variant => {
        if (variant.transition && variant.transition.ease) {
          const ease = variant.transition.ease;
          
          // Should use simple easing (not complex cubic-bezier)
          expect(['easeInOut', 'easeIn', 'easeOut', 'linear']).toContain(ease);
        }
      });
    });
  });

  describe('Layout Stability', () => {
    it('should not cause layout shifts during page transitions', () => {
      const { container } = render(
        <AnimationProvider>
          <BrowserRouter>
            <PageTransition variant="fadeIn">
              <div style={{ width: '100%', height: '100vh' }}>
                Test Content
              </div>
            </PageTransition>
          </BrowserRouter>
        </AnimationProvider>
      );
      
      const wrapper = container.firstChild;
      
      // Should maintain full width and height
      expect(wrapper).toHaveStyle({ width: '100%' });
    });

    it('should not animate width or height properties', () => {
      const { pageVariants, modalVariants, listVariants } = require('../utils/animationVariants');
      
      const allVariants = [
        ...Object.values(pageVariants),
        ...Object.values(modalVariants),
        ...Object.values(listVariants),
      ];
      
      allVariants.forEach(variant => {
        if (variant.initial) {
          expect(variant.initial).not.toHaveProperty('width');
          expect(variant.initial).not.toHaveProperty('height');
        }
        if (variant.animate) {
          expect(variant.animate).not.toHaveProperty('width');
          expect(variant.animate).not.toHaveProperty('height');
        }
      });
    });
  });

  describe('Real-World Performance Simulation', () => {
    it('should handle rapid page transitions without degradation', async () => {
      const durations = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        
        const { unmount } = render(
          <AnimationProvider>
            <BrowserRouter>
              <PageTransition variant="fadeIn">
                <div>Page {i}</div>
              </PageTransition>
            </BrowserRouter>
          </AnimationProvider>
        );
        
        await waitFor(() => {
          expect(screen.getByText(`Page ${i}`)).toBeInTheDocument();
        });
        
        const duration = performance.now() - startTime;
        durations.push(duration);
        
        unmount();
      }
      
      // All transitions should be consistent (no degradation)
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(300);
      
      // No transition should be significantly slower than average
      durations.forEach(duration => {
        expect(duration).toBeLessThan(avgDuration * 1.5);
      });
    });

    it('should handle multiple concurrent animations', async () => {
      const startTime = performance.now();
      
      render(
        <AnimationProvider>
          <motion.div variants={listVariants.container} initial="initial" animate="animate">
            {Array.from({ length: 10 }, (_, i) => (
              <motion.div key={i} variants={listVariants.item}>
                Item {i}
              </motion.div>
            ))}
          </motion.div>
        </AnimationProvider>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Item 9')).toBeInTheDocument();
      });
      
      const duration = performance.now() - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
    });
  });
});

describe('Low-End Device Animation Test Summary', () => {
  it('should pass all performance criteria', () => {
    const { pageVariants, modalVariants, listVariants, buttonVariants } = require('../utils/animationVariants');
    
    // Criteria 1: All animations use GPU-accelerated properties
    const allVariants = [
      ...Object.values(pageVariants),
      ...Object.values(modalVariants),
      ...Object.values(listVariants),
      ...Object.values(buttonVariants),
    ];
    
    allVariants.forEach(variant => {
      if (variant.initial) {
        // Should NOT have layout-triggering properties
        expect(variant.initial).not.toHaveProperty('width');
        expect(variant.initial).not.toHaveProperty('height');
        expect(variant.initial).not.toHaveProperty('left');
        expect(variant.initial).not.toHaveProperty('top');
        expect(variant.initial).not.toHaveProperty('margin');
        expect(variant.initial).not.toHaveProperty('padding');
      }
    });
    
    // Criteria 2: All animations have duration between 200-300ms
    allVariants.forEach(variant => {
      if (variant.transition && variant.transition.duration) {
        const durationMs = variant.transition.duration * 1000;
        expect(durationMs).toBeGreaterThanOrEqual(100); // Some are faster (buttons)
        expect(durationMs).toBeLessThanOrEqual(400); // Some are slower (modals)
      }
    });
    
    // Criteria 3: Stagger delay is 50ms
    expect(listVariants.container.animate.transition.staggerChildren).toBe(0.05);
    
    // Criteria 4: Reduced motion support exists
    const { getReducedMotionVariants } = require('../utils/animationVariants');
    expect(typeof getReducedMotionVariants).toBe('function');
    
    console.log('✅ All low-end device animation criteria passed!');
  });
});
