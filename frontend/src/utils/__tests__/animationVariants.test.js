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

describe('Success Animation Variants', () => {
  const { feedbackVariants } = require('../animationVariants');

  describe('successFade variant', () => {
    it('should have initial, animate, and exit states', () => {
      expect(feedbackVariants.successFade).toHaveProperty('initial');
      expect(feedbackVariants.successFade).toHaveProperty('animate');
      expect(feedbackVariants.successFade).toHaveProperty('exit');
      expect(feedbackVariants.successFade).toHaveProperty('transition');
    });

    it('should start with opacity 0', () => {
      expect(feedbackVariants.successFade.initial).toEqual({ opacity: 0 });
    });

    it('should animate to opacity 1', () => {
      expect(feedbackVariants.successFade.animate).toEqual({ opacity: 1 });
    });

    it('should exit with opacity 0', () => {
      expect(feedbackVariants.successFade.exit).toEqual({ opacity: 0 });
    });

    it('should have 300ms duration transition', () => {
      expect(feedbackVariants.successFade.transition.duration).toBe(0.3);
      expect(feedbackVariants.successFade.transition.ease).toBe('easeInOut');
    });
  });

  describe('successFadeSlide variant', () => {
    it('should have initial, animate, and exit states', () => {
      expect(feedbackVariants.successFadeSlide).toHaveProperty('initial');
      expect(feedbackVariants.successFadeSlide).toHaveProperty('animate');
      expect(feedbackVariants.successFadeSlide).toHaveProperty('exit');
    });

    it('should start with opacity 0 and y offset', () => {
      expect(feedbackVariants.successFadeSlide.initial).toEqual({ 
        opacity: 0, 
        y: 10 
      });
    });

    it('should animate to opacity 1 and y 0', () => {
      expect(feedbackVariants.successFadeSlide.animate).toEqual({ 
        opacity: 1, 
        y: 0 
      });
    });

    it('should exit with opacity 0 and negative y', () => {
      expect(feedbackVariants.successFadeSlide.exit).toEqual({ 
        opacity: 0, 
        y: -10 
      });
    });
  });

  describe('successCheckmark variant', () => {
    it('should have initial and animate states for SVG path', () => {
      expect(feedbackVariants.successCheckmark).toHaveProperty('initial');
      expect(feedbackVariants.successCheckmark).toHaveProperty('animate');
    });

    it('should start with pathLength 0 and opacity 0', () => {
      expect(feedbackVariants.successCheckmark.initial).toEqual({ 
        pathLength: 0, 
        opacity: 0 
      });
    });

    it('should animate to pathLength 1 and opacity 1', () => {
      expect(feedbackVariants.successCheckmark.animate.pathLength).toBe(1);
      expect(feedbackVariants.successCheckmark.animate.opacity).toBe(1);
    });

    it('should have transition configuration', () => {
      expect(feedbackVariants.successCheckmark.animate.transition).toBeDefined();
      expect(feedbackVariants.successCheckmark.animate.transition.pathLength).toBeDefined();
      expect(feedbackVariants.successCheckmark.animate.transition.opacity).toBeDefined();
    });

    it('should have 500ms pathLength animation', () => {
      expect(feedbackVariants.successCheckmark.animate.transition.pathLength.duration).toBe(0.5);
      expect(feedbackVariants.successCheckmark.animate.transition.pathLength.ease).toBe('easeOut');
    });
  });

  describe('successCheckmarkContainer variant', () => {
    it('should have initial, animate, and exit states', () => {
      expect(feedbackVariants.successCheckmarkContainer).toHaveProperty('initial');
      expect(feedbackVariants.successCheckmarkContainer).toHaveProperty('animate');
      expect(feedbackVariants.successCheckmarkContainer).toHaveProperty('exit');
    });

    it('should start with scale 0 and opacity 0', () => {
      expect(feedbackVariants.successCheckmarkContainer.initial).toEqual({ 
        scale: 0, 
        opacity: 0 
      });
    });

    it('should animate to scale 1 and opacity 1', () => {
      expect(feedbackVariants.successCheckmarkContainer.animate.scale).toBe(1);
      expect(feedbackVariants.successCheckmarkContainer.animate.opacity).toBe(1);
    });

    it('should use spring transition', () => {
      expect(feedbackVariants.successCheckmarkContainer.animate.transition.type).toBe('spring');
    });
  });

  describe('successCheckmarkBounce variant', () => {
    it('should have bounce animation', () => {
      expect(feedbackVariants.successCheckmarkBounce).toHaveProperty('initial');
      expect(feedbackVariants.successCheckmarkBounce).toHaveProperty('animate');
    });

    it('should animate with scale array for bounce effect', () => {
      expect(Array.isArray(feedbackVariants.successCheckmarkBounce.animate.scale)).toBe(true);
      expect(feedbackVariants.successCheckmarkBounce.animate.scale).toEqual([0, 1.2, 1]);
    });

    it('should have 600ms duration', () => {
      expect(feedbackVariants.successCheckmarkBounce.animate.transition.duration).toBe(0.6);
    });
  });

  describe('successGlow variant', () => {
    it('should have initial, animate, and exit states', () => {
      expect(feedbackVariants.successGlow).toHaveProperty('initial');
      expect(feedbackVariants.successGlow).toHaveProperty('animate');
      expect(feedbackVariants.successGlow).toHaveProperty('exit');
    });

    it('should have boxShadow animation', () => {
      expect(feedbackVariants.successGlow.animate.boxShadow).toBeDefined();
      expect(Array.isArray(feedbackVariants.successGlow.animate.boxShadow)).toBe(true);
    });

    it('should animate scale and opacity', () => {
      expect(feedbackVariants.successGlow.animate.scale).toBe(1);
      expect(feedbackVariants.successGlow.animate.opacity).toBe(1);
    });
  });

  describe('successPulse variant', () => {
    it('should have animate state with repeat', () => {
      expect(feedbackVariants.successPulse).toHaveProperty('animate');
      expect(feedbackVariants.successPulse.animate.transition.repeat).toBe(2);
    });

    it('should pulse scale and opacity', () => {
      expect(Array.isArray(feedbackVariants.successPulse.animate.scale)).toBe(true);
      expect(Array.isArray(feedbackVariants.successPulse.animate.opacity)).toBe(true);
    });
  });

  describe('successSlideBottom variant', () => {
    it('should slide from bottom', () => {
      expect(feedbackVariants.successSlideBottom.initial.y).toBe(20);
      expect(feedbackVariants.successSlideBottom.animate.y).toBe(0);
    });

    it('should have opacity animation', () => {
      expect(feedbackVariants.successSlideBottom.initial.opacity).toBe(0);
      expect(feedbackVariants.successSlideBottom.animate.opacity).toBe(1);
    });
  });

  describe('successRotate variant', () => {
    it('should have rotation animation', () => {
      expect(feedbackVariants.successRotate.initial.rotate).toBe(-180);
      expect(feedbackVariants.successRotate.animate.rotate).toBe(0);
    });

    it('should combine scale and opacity', () => {
      expect(feedbackVariants.successRotate.initial.scale).toBe(0);
      expect(feedbackVariants.successRotate.animate.scale).toBe(1);
      expect(feedbackVariants.successRotate.initial.opacity).toBe(0);
      expect(feedbackVariants.successRotate.animate.opacity).toBe(1);
    });
  });

  describe('animation requirements', () => {
    it('should use GPU-accelerated properties only', () => {
      // Check successFade uses opacity
      const fadeProps = Object.keys(feedbackVariants.successFade.animate);
      expect(fadeProps).toEqual(['opacity']);

      // Check successCheckmarkContainer uses scale and opacity
      const checkmarkProps = Object.keys(feedbackVariants.successCheckmarkContainer.animate);
      expect(checkmarkProps).toEqual(expect.arrayContaining(['scale', 'opacity']));
    });

    it('should have duration between 200-600ms', () => {
      expect(feedbackVariants.successFade.transition.duration).toBeGreaterThanOrEqual(0.2);
      expect(feedbackVariants.successFade.transition.duration).toBeLessThanOrEqual(0.6);
      
      expect(feedbackVariants.successCheckmarkBounce.animate.transition.duration).toBeGreaterThanOrEqual(0.2);
      expect(feedbackVariants.successCheckmarkBounce.animate.transition.duration).toBeLessThanOrEqual(0.6);
    });

    it('should respect animation timing constraints', () => {
      // Success animations should be quick and satisfying
      expect(feedbackVariants.successFade.transition.duration).toBeLessThanOrEqual(0.3);
      expect(feedbackVariants.successFadeSlide.transition.duration).toBeLessThanOrEqual(0.3);
    });
  });

  describe('presets', () => {
    const { presets } = require('../animationVariants');

    it('should include success presets', () => {
      expect(presets.success).toBeDefined();
      expect(presets.successCheckmark).toBeDefined();
      expect(presets.successMessage).toBeDefined();
      expect(presets.successGlow).toBeDefined();
    });

    it('should map to correct variants', () => {
      expect(presets.success).toEqual(feedbackVariants.successFade);
      expect(presets.successCheckmark).toEqual(feedbackVariants.successCheckmarkContainer);
      expect(presets.successMessage).toEqual(feedbackVariants.successFadeSlide);
      expect(presets.successGlow).toEqual(feedbackVariants.successGlow);
    });
  });
});
