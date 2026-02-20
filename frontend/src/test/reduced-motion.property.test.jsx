/**
 * Reduced Motion Property-Based Tests
 * 
 * Property ANIM-2: Reduced Motion
 * prefersReducedMotion = true → animation.disabled = true
 * 
 * Validates: Requirements FR-ANIM-6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';
import { AnimationProvider, useAnimation } from '../context/AnimationContext';
import PageTransition from '../components/PageTransition';

const AnimatedTestComponent = ({ variant = 'fadeIn', testId = 'animated-content' }) => {
  const { shouldAnimate, prefersReducedMotion, getTransition } = useAnimation();
  
  return (
    <div>
      <div data-testid="shouldAnimate">{shouldAnimate.toString()}</div>
      <div data-testid="prefersReducedMotion">{prefersReducedMotion.toString()}</div>
      <div data-testid="transition-duration">{getTransition().duration}</div>
      <PageTransition variant={variant}>
        <div data-testid={testId}>Animated Content</div>
      </PageTransition>
    </div>
  );
};

const mockMatchMedia = (matches) => {
  const listeners = [];
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn((listener) => listeners.push(listener)),
      removeListener: vi.fn((listener) => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      }),
      addEventListener: vi.fn((event, listener) => {
        if (event === 'change') listeners.push(listener);
      }),
      removeEventListener: vi.fn((event, listener) => {
        if (event === 'change') {
          const index = listeners.indexOf(listener);
          if (index > -1) listeners.splice(index, 1);
        }
      }),
      dispatchEvent: vi.fn((event) => {
        listeners.forEach(listener => listener(event));
      }),
    })),
  });
  
  return listeners;
};

describe('Property ANIM-2: Reduced Motion Support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should disable animations when prefersReducedMotion is true (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.constantFrom('fadeIn', 'slideInLeft', 'slideInRight', 'slideInTop', 'slideInBottom', 'scaleUp'),
        (prefersReducedMotion, variant) => {
          // Clean up before each property test
          cleanup();
          
          mockMatchMedia(prefersReducedMotion);

          const { container } = render(
            <AnimationProvider>
              <AnimatedTestComponent variant={variant} testId={`test-${variant}`} />
            </AnimationProvider>
          );

          const shouldAnimate = container.querySelector('[data-testid="shouldAnimate"]').textContent === 'true';
          const detectedPreference = container.querySelector('[data-testid="prefersReducedMotion"]').textContent === 'true';
          const transitionDuration = parseFloat(container.querySelector('[data-testid="transition-duration"]').textContent);

          if (prefersReducedMotion) {
            expect(detectedPreference).toBe(true);
            expect(shouldAnimate).toBe(false);
            expect(transitionDuration).toBe(0);
          } else {
            expect(detectedPreference).toBe(false);
            expect(shouldAnimate).toBe(true);
            expect(transitionDuration).toBeGreaterThan(0);
          }

          expect(container.querySelector(`[data-testid="test-${variant}"]`)).toBeInTheDocument();
          
          // Clean up after each property test
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should set transition duration to 0 when reduced motion is enabled (100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.record({
          duration: fc.double({ min: 0.1, max: 1.0, noNaN: true }),
          ease: fc.constantFrom('easeIn', 'easeOut', 'easeInOut', 'linear'),
        }),
        (prefersReducedMotion, customTransition) => {
          // Clean up before each property test
          cleanup();
          
          mockMatchMedia(prefersReducedMotion);

          const TestComponent = () => {
            const { getTransition } = useAnimation();
            const transition = getTransition(customTransition);
            
            return (
              <div>
                <div data-testid="duration">{transition.duration}</div>
              </div>
            );
          };

          const { container } = render(
            <AnimationProvider>
              <TestComponent />
            </AnimationProvider>
          );

          const duration = parseFloat(container.querySelector('[data-testid="duration"]').textContent);

          if (prefersReducedMotion) {
            expect(duration).toBe(0);
          } else {
            expect(duration).toBeGreaterThan(0);
          }
          
          // Clean up after each property test
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
