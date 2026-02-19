/**
 * Tests for Animation Variants
 * Validates modal animation variants (scaleIn, fade)
 */

import { modalVariants } from '../animationVariants';

describe('Modal Animation Variants', () => {
  describe('scaleIn variant', () => {
    it('should have initial, animate, and exit states', () => {
      expect(modalVariants.scaleIn).toHaveProperty('initial');
      expect(modalVariants.scaleIn).toHaveProperty('animate');
      expect(modalVariants.scaleIn).toHaveProperty('exit');
      expect(modalVariants.scaleIn).toHaveProperty('transition');
    });

    it('should start with opacity 0 and scale 0.95', () => {
      expect(modalVariants.scaleIn.initial).toEqual({
        opacity: 0,
        scale: 0.95
      });
    });

    it('should animate to opacity 1 and scale 1', () => {
      expect(modalVariants.scaleIn.animate).toEqual({
        opacity: 1,
        scale: 1
      });
    });

    it('should exit with opacity 0 and scale 0.95', () => {
      expect(modalVariants.scaleIn.exit).toEqual({
        opacity: 0,
        scale: 0.95
      });
    });

    it('should have 300ms duration transition', () => {
      expect(modalVariants.scaleIn.transition.duration).toBe(0.3);
      expect(modalVariants.scaleIn.transition.ease).toBe('easeInOut');
    });
  });

  describe('fade variant', () => {
    it('should have initial, animate, and exit states', () => {
      expect(modalVariants.fade).toHaveProperty('initial');
      expect(modalVariants.fade).toHaveProperty('animate');
      expect(modalVariants.fade).toHaveProperty('exit');
      expect(modalVariants.fade).toHaveProperty('transition');
    });

    it('should start with opacity 0', () => {
      expect(modalVariants.fade.initial).toEqual({ opacity: 0 });
    });

    it('should animate to opacity 1', () => {
      expect(modalVariants.fade.animate).toEqual({ opacity: 1 });
    });

    it('should exit with opacity 0', () => {
      expect(modalVariants.fade.exit).toEqual({ opacity: 0 });
    });

    it('should have 300ms duration transition', () => {
      expect(modalVariants.fade.transition.duration).toBe(0.3);
      expect(modalVariants.fade.transition.ease).toBe('easeInOut');
    });
  });

  describe('backdrop variant', () => {
    it('should exist for modal overlays', () => {
      expect(modalVariants.backdrop).toBeDefined();
    });

    it('should have faster transition (200ms)', () => {
      expect(modalVariants.backdrop.transition.duration).toBe(0.2);
    });
  });

  describe('animation requirements', () => {
    it('should use GPU-accelerated properties only', () => {
      // scaleIn uses opacity and scale (GPU-accelerated)
      const scaleInProps = Object.keys(modalVariants.scaleIn.animate);
      expect(scaleInProps).toEqual(expect.arrayContaining(['opacity', 'scale']));
      
      // fade uses opacity only (GPU-accelerated)
      const fadeProps = Object.keys(modalVariants.fade.animate);
      expect(fadeProps).toEqual(['opacity']);
    });

    it('should have duration between 200-300ms', () => {
      expect(modalVariants.scaleIn.transition.duration).toBeGreaterThanOrEqual(0.2);
      expect(modalVariants.scaleIn.transition.duration).toBeLessThanOrEqual(0.3);
      
      expect(modalVariants.fade.transition.duration).toBeGreaterThanOrEqual(0.2);
      expect(modalVariants.fade.transition.duration).toBeLessThanOrEqual(0.3);
    });
  });
});
