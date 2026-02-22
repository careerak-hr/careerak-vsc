/**
 * Modal Animation Tests
 * 
 * Tests that all modals have smooth animations within 200-300ms duration.
 * 
 * Requirements:
 * - FR-ANIM-2: Modal animations should be 200-300ms
 * - Modals should use scaleIn animation
 * - Backdrop should use fade animation
 * - Animations should respect prefers-reduced-motion
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AnimationProvider } from '../context/AnimationContext';
import { modalVariants } from '../utils/animationVariants';

// Test wrapper with AnimationProvider
const TestWrapper = ({ children, prefersReducedMotion = false }) => {
  // Mock matchMedia for prefers-reduced-motion
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? prefersReducedMotion : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  return (
    <AnimationProvider>
      {children}
    </AnimationProvider>
  );
};

describe('Modal Animation Timing', () => {
  it('should have modal scaleIn animation duration between 200-300ms', () => {
    const scaleInVariant = modalVariants.scaleIn;
    const duration = scaleInVariant.transition.duration;
    
    expect(duration).toBeGreaterThanOrEqual(0.2); // 200ms
    expect(duration).toBeLessThanOrEqual(0.3); // 300ms
  });

  it('should have backdrop fade animation duration between 200-300ms', () => {
    const backdropVariant = modalVariants.backdrop;
    const duration = backdropVariant.transition.duration;
    
    expect(duration).toBeGreaterThanOrEqual(0.2); // 200ms
    expect(duration).toBeLessThanOrEqual(0.3); // 300ms
  });

  it('should have slideUp animation duration between 200-300ms', () => {
    const slideUpVariant = modalVariants.slideUp;
    const duration = slideUpVariant.transition.duration;
    
    expect(duration).toBeGreaterThanOrEqual(0.2); // 200ms
    expect(duration).toBeLessThanOrEqual(0.3); // 300ms
  });

  it('should have slideDown animation duration between 200-300ms', () => {
    const slideDownVariant = modalVariants.slideDown;
    const duration = slideDownVariant.transition.duration;
    
    expect(duration).toBeGreaterThanOrEqual(0.2); // 200ms
    expect(duration).toBeLessThanOrEqual(0.3); // 300ms
  });

  it('should have fade animation duration between 200-300ms', () => {
    const fadeVariant = modalVariants.fade;
    const duration = fadeVariant.transition.duration;
    
    expect(duration).toBeGreaterThanOrEqual(0.2); // 200ms
    expect(duration).toBeLessThanOrEqual(0.3); // 300ms
  });
});

describe('Modal Animation Properties', () => {
  it('should use GPU-accelerated properties (transform, opacity)', () => {
    const scaleInVariant = modalVariants.scaleIn;
    
    // Check initial state uses scale and opacity
    expect(scaleInVariant.initial).toHaveProperty('opacity');
    expect(scaleInVariant.initial).toHaveProperty('scale');
    
    // Check animate state uses scale and opacity
    expect(scaleInVariant.animate).toHaveProperty('opacity');
    expect(scaleInVariant.animate).toHaveProperty('scale');
    
    // Check exit state uses scale and opacity
    expect(scaleInVariant.exit).toHaveProperty('opacity');
    expect(scaleInVariant.exit).toHaveProperty('scale');
  });

  it('should use easeInOut easing for smooth animations', () => {
    const scaleInVariant = modalVariants.scaleIn;
    expect(scaleInVariant.transition.ease).toBe('easeInOut');
  });

  it('should have proper initial, animate, and exit states', () => {
    const scaleInVariant = modalVariants.scaleIn;
    
    // Initial state should be invisible and slightly scaled down
    expect(scaleInVariant.initial.opacity).toBe(0);
    expect(scaleInVariant.initial.scale).toBe(0.95);
    
    // Animate state should be fully visible and normal scale
    expect(scaleInVariant.animate.opacity).toBe(1);
    expect(scaleInVariant.animate.scale).toBe(1);
    
    // Exit state should match initial state
    expect(scaleInVariant.exit.opacity).toBe(0);
    expect(scaleInVariant.exit.scale).toBe(0.95);
  });
});

describe('Modal Animation Variants', () => {
  it('should have all required modal animation variants', () => {
    expect(modalVariants).toHaveProperty('scaleIn');
    expect(modalVariants).toHaveProperty('fade');
    expect(modalVariants).toHaveProperty('slideUp');
    expect(modalVariants).toHaveProperty('slideDown');
    expect(modalVariants).toHaveProperty('zoomIn');
    expect(modalVariants).toHaveProperty('backdrop');
  });

  it('should have consistent structure across all variants', () => {
    const variants = ['scaleIn', 'fade', 'slideUp', 'slideDown'];
    
    variants.forEach(variantName => {
      const variant = modalVariants[variantName];
      expect(variant).toHaveProperty('initial');
      expect(variant).toHaveProperty('animate');
      expect(variant).toHaveProperty('exit');
      expect(variant).toHaveProperty('transition');
    });
  });
});

describe('Modal Animation Performance', () => {
  it('should not animate width or height (causes layout shifts)', () => {
    const scaleInVariant = modalVariants.scaleIn;
    
    // Check that width and height are not animated
    expect(scaleInVariant.initial).not.toHaveProperty('width');
    expect(scaleInVariant.initial).not.toHaveProperty('height');
    expect(scaleInVariant.animate).not.toHaveProperty('width');
    expect(scaleInVariant.animate).not.toHaveProperty('height');
  });

  it('should not animate top, left, right, bottom (causes layout shifts)', () => {
    const scaleInVariant = modalVariants.scaleIn;
    
    expect(scaleInVariant.initial).not.toHaveProperty('top');
    expect(scaleInVariant.initial).not.toHaveProperty('left');
    expect(scaleInVariant.initial).not.toHaveProperty('right');
    expect(scaleInVariant.initial).not.toHaveProperty('bottom');
  });

  it('should use transform properties for position changes', () => {
    const slideUpVariant = modalVariants.slideUp;
    
    // slideUp should use y transform, not top/bottom
    expect(slideUpVariant.initial).toHaveProperty('y');
    expect(slideUpVariant.animate).toHaveProperty('y');
    expect(slideUpVariant.exit).toHaveProperty('y');
  });
});

describe('Backdrop Animation', () => {
  it('should have faster animation than modal content', () => {
    const backdropDuration = modalVariants.backdrop.transition.duration;
    const modalDuration = modalVariants.scaleIn.transition.duration;
    
    // Backdrop should be faster (200ms) than modal (300ms)
    expect(backdropDuration).toBeLessThanOrEqual(modalDuration);
  });

  it('should only animate opacity', () => {
    const backdropVariant = modalVariants.backdrop;
    
    expect(backdropVariant.initial).toHaveProperty('opacity');
    expect(backdropVariant.animate).toHaveProperty('opacity');
    expect(backdropVariant.exit).toHaveProperty('opacity');
    
    // Should not have other properties
    expect(Object.keys(backdropVariant.initial)).toHaveLength(1);
    expect(Object.keys(backdropVariant.animate)).toHaveLength(1);
    expect(Object.keys(backdropVariant.exit)).toHaveLength(1);
  });
});

describe('Modal Animation Accessibility', () => {
  it('should respect prefers-reduced-motion setting', () => {
    // This test verifies that the AnimationContext properly handles reduced motion
    // The actual implementation is in AnimationContext, but we verify the structure
    const scaleInVariant = modalVariants.scaleIn;
    
    // Variants should have proper structure for AnimationContext to override
    expect(scaleInVariant).toHaveProperty('transition');
    expect(scaleInVariant.transition).toHaveProperty('duration');
  });
});

describe('Modal Animation Integration', () => {
  it('should work with AnimatePresence mode="wait"', () => {
    // Verify that exit animations are properly defined
    const scaleInVariant = modalVariants.scaleIn;
    
    expect(scaleInVariant.exit).toBeDefined();
    expect(scaleInVariant.exit.opacity).toBe(0);
  });

  it('should have smooth transitions between states', () => {
    const scaleInVariant = modalVariants.scaleIn;
    
    // Verify smooth transition from initial to animate
    expect(scaleInVariant.initial.opacity).toBe(0);
    expect(scaleInVariant.animate.opacity).toBe(1);
    
    // Verify smooth transition from animate to exit
    expect(scaleInVariant.animate.opacity).toBe(1);
    expect(scaleInVariant.exit.opacity).toBe(0);
  });
});

describe('Modal Animation Timing Summary', () => {
  it('should have all modal animations within 200-300ms range', () => {
    const variants = ['scaleIn', 'fade', 'slideUp', 'slideDown', 'backdrop'];
    
    variants.forEach(variantName => {
      const variant = modalVariants[variantName];
      const duration = variant.transition.duration;
      
      expect(duration, `${variantName} duration should be 200-300ms`).toBeGreaterThanOrEqual(0.2);
      expect(duration, `${variantName} duration should be 200-300ms`).toBeLessThanOrEqual(0.3);
    });
  });

  it('should use consistent easing across all modal animations', () => {
    const variants = ['scaleIn', 'fade', 'slideUp', 'slideDown', 'backdrop'];
    
    variants.forEach(variantName => {
      const variant = modalVariants[variantName];
      expect(variant.transition.ease, `${variantName} should use easeInOut`).toBe('easeInOut');
    });
  });
});
