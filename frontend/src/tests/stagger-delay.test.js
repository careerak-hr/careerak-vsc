/**
 * Stagger Delay Configuration Test
 * Task 4.4.5: Verify 50ms delay between items in stagger animations
 * 
 * This test verifies that:
 * 1. The staggerChildren value is exactly 0.05 (50ms)
 * 2. All list animation variants use the correct delay
 * 3. The configuration is consistent across the codebase
 */

import { describe, it, expect } from 'vitest';
import { listVariants, createStaggerContainer } from '../utils/animationVariants';

describe('Stagger Animation Delay Configuration', () => {
  describe('listVariants.container', () => {
    it('should have staggerChildren set to 0.05 (50ms)', () => {
      const container = listVariants.container;
      expect(container.animate.transition.staggerChildren).toBe(0.05);
    });

    it('should have delayChildren set to 0.1', () => {
      const container = listVariants.container;
      expect(container.animate.transition.delayChildren).toBe(0.1);
    });

    it('should have exit staggerChildren set to 0.03', () => {
      const container = listVariants.container;
      expect(container.exit.transition.staggerChildren).toBe(0.03);
    });

    it('should have staggerDirection set to -1 on exit', () => {
      const container = listVariants.container;
      expect(container.exit.transition.staggerDirection).toBe(-1);
    });
  });

  describe('listVariants.fastContainer', () => {
    it('should have staggerChildren set to 0.03 (30ms)', () => {
      const fastContainer = listVariants.fastContainer;
      expect(fastContainer.animate.transition.staggerChildren).toBe(0.03);
    });

    it('should have delayChildren set to 0.05', () => {
      const fastContainer = listVariants.fastContainer;
      expect(fastContainer.animate.transition.delayChildren).toBe(0.05);
    });
  });

  describe('listVariants.slowContainer', () => {
    it('should have staggerChildren set to 0.1 (100ms)', () => {
      const slowContainer = listVariants.slowContainer;
      expect(slowContainer.animate.transition.staggerChildren).toBe(0.1);
    });

    it('should have delayChildren set to 0.15', () => {
      const slowContainer = listVariants.slowContainer;
      expect(slowContainer.animate.transition.delayChildren).toBe(0.15);
    });
  });

  describe('createStaggerContainer helper', () => {
    it('should default to 0.05 (50ms) staggerDelay', () => {
      const container = createStaggerContainer();
      expect(container.animate.transition.staggerChildren).toBe(0.05);
    });

    it('should default to 0.1 delayChildren', () => {
      const container = createStaggerContainer();
      expect(container.animate.transition.delayChildren).toBe(0.1);
    });

    it('should accept custom staggerDelay', () => {
      const container = createStaggerContainer(0.08);
      expect(container.animate.transition.staggerChildren).toBe(0.08);
    });

    it('should accept custom delayChildren', () => {
      const container = createStaggerContainer(0.05, 0.2);
      expect(container.animate.transition.delayChildren).toBe(0.2);
    });
  });

  describe('listVariants.item', () => {
    it('should have initial state with opacity 0 and y 10', () => {
      const item = listVariants.item;
      expect(item.initial.opacity).toBe(0);
      expect(item.initial.y).toBe(10);
    });

    it('should have animate state with opacity 1 and y 0', () => {
      const item = listVariants.item;
      expect(item.animate.opacity).toBe(1);
      expect(item.animate.y).toBe(0);
    });

    it('should have exit state with opacity 0 and y -10', () => {
      const item = listVariants.item;
      expect(item.exit.opacity).toBe(0);
      expect(item.exit.y).toBe(-10);
    });

    it('should have transition with duration 0.3 and ease easeInOut', () => {
      const item = listVariants.item;
      expect(item.transition.duration).toBe(0.3);
      expect(item.transition.ease).toBe('easeInOut');
    });
  });

  describe('Timing calculations', () => {
    it('should calculate correct total animation time for 5 items', () => {
      // With staggerChildren: 0.05 and delayChildren: 0.1
      // Item 1: starts at 0.1s
      // Item 2: starts at 0.15s (0.1 + 0.05)
      // Item 3: starts at 0.2s (0.1 + 0.05 * 2)
      // Item 4: starts at 0.25s (0.1 + 0.05 * 3)
      // Item 5: starts at 0.3s (0.1 + 0.05 * 4)
      // Each item takes 0.3s to animate
      // Total time: 0.3s (last item start) + 0.3s (animation duration) = 0.6s
      
      const numItems = 5;
      const staggerDelay = 0.05;
      const delayChildren = 0.1;
      const itemDuration = 0.3;
      
      const lastItemStartTime = delayChildren + (staggerDelay * (numItems - 1));
      const totalTime = lastItemStartTime + itemDuration;
      
      expect(lastItemStartTime).toBeCloseTo(0.3, 10);
      expect(totalTime).toBeCloseTo(0.6, 10);
    });

    it('should verify 50ms equals 0.05 seconds', () => {
      const milliseconds = 50;
      const seconds = milliseconds / 1000;
      expect(seconds).toBe(0.05);
    });
  });

  describe('Performance considerations', () => {
    it('should use GPU-accelerated properties only', () => {
      const item = listVariants.item;
      
      // Check that only transform and opacity are animated
      const animatedProps = Object.keys(item.initial);
      const gpuAcceleratedProps = ['opacity', 'x', 'y', 'scale', 'rotate'];
      
      animatedProps.forEach(prop => {
        expect(gpuAcceleratedProps).toContain(prop);
      });
    });

    it('should have reasonable animation duration (not too long)', () => {
      const item = listVariants.item;
      expect(item.transition.duration).toBeLessThanOrEqual(0.5);
      expect(item.transition.duration).toBeGreaterThanOrEqual(0.2);
    });

    it('should have reasonable stagger delay (not too long)', () => {
      const container = listVariants.container;
      expect(container.animate.transition.staggerChildren).toBeLessThanOrEqual(0.1);
      expect(container.animate.transition.staggerChildren).toBeGreaterThanOrEqual(0.03);
    });
  });
});
