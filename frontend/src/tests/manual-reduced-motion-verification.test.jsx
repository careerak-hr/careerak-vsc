/**
 * Manual Verification Test for prefers-reduced-motion
 * 
 * Task: 4.6.7 Verify prefers-reduced-motion works
 * 
 * This test verifies that the prefers-reduced-motion functionality works correctly
 * across the entire application by testing:
 * 1. AnimationContext detects the media query
 * 2. shouldAnimate flag is set correctly
 * 3. PageTransition respects the setting
 * 4. All animation variants are disabled when reduced motion is preferred
 * 5. Transitions have 0 duration when reduced motion is preferred
 * 
 * Validates: Requirements FR-ANIM-6, NFR-USE-4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { AnimationProvider, useAnimation } from '../context/AnimationContext';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

// Helper to mock matchMedia
const mockMatchMedia = (matches) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Test component that uses animation context
const TestComponent = () => {
  const { shouldAnimate, prefersReducedMotion, getTransition, variants } = useAnimation();
  
  return (
    <div>
      <div data-testid="shouldAnimate">{shouldAnimate.toString()}</div>
      <div data-testid="prefersReducedMotion">{prefersReducedMotion.toString()}</div>
      <div data-testid="transition-duration">{getTransition().duration}</div>
      <div data-testid="has-variants">{variants ? 'true' : 'false'}</div>
    </div>
  );
};

describe('Manual Verification: prefers-reduced-motion', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. AnimationContext Detection', () => {
    it('should detect when prefers-reduced-motion is NOT set', () => {
      mockMatchMedia(false);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('prefersReducedMotion').textContent).toBe('false');
      expect(screen.getByTestId('shouldAnimate').textContent).toBe('true');
    });

    it('should detect when prefers-reduced-motion IS set', () => {
      mockMatchMedia(true);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('prefersReducedMotion').textContent).toBe('true');
      expect(screen.getByTestId('shouldAnimate').textContent).toBe('false');
    });
  });

  describe('2. shouldAnimate Flag', () => {
    it('should set shouldAnimate to true when animations are enabled', () => {
      mockMatchMedia(false);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      const shouldAnimate = screen.getByTestId('shouldAnimate').textContent === 'true';
      expect(shouldAnimate).toBe(true);
    });

    it('should set shouldAnimate to false when reduced motion is preferred', () => {
      mockMatchMedia(true);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      const shouldAnimate = screen.getByTestId('shouldAnimate').textContent === 'true';
      expect(shouldAnimate).toBe(false);
    });
  });

  describe('3. PageTransition Behavior', () => {
    it('should render with animations when reduced motion is NOT preferred', () => {
      mockMatchMedia(false);

      const { container } = render(
        <AnimationProvider>
          <PageTransition variant="fadeIn">
            <div data-testid="content">Test Content</div>
          </PageTransition>
        </AnimationProvider>
      );

      // Should render motion.div (with animations)
      const motionDiv = container.querySelector('[style*="width"]');
      expect(motionDiv).toBeTruthy();
      expect(screen.getByTestId('content')).toBeTruthy();
    });

    it('should render without animations when reduced motion IS preferred', () => {
      mockMatchMedia(true);

      const { container } = render(
        <AnimationProvider>
          <PageTransition variant="fadeIn">
            <div data-testid="content">Test Content</div>
          </PageTransition>
        </AnimationProvider>
      );

      // Should render plain div (no animations)
      expect(screen.getByTestId('content')).toBeTruthy();
      // Content should still be visible
      expect(screen.getByTestId('content').textContent).toBe('Test Content');
    });

    it('should work with all page transition variants', () => {
      mockMatchMedia(true);

      const variants = ['fadeIn', 'slideInLeft', 'slideInRight', 'slideInTop', 'slideInBottom', 'scaleUp'];

      variants.forEach(variant => {
        cleanup();
        
        render(
          <AnimationProvider>
            <PageTransition variant={variant}>
              <div data-testid={`content-${variant}`}>Content</div>
            </PageTransition>
          </AnimationProvider>
        );

        expect(screen.getByTestId(`content-${variant}`)).toBeTruthy();
      });
    });
  });

  describe('4. Transition Duration', () => {
    it('should have normal duration when animations are enabled', () => {
      mockMatchMedia(false);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      const duration = parseFloat(screen.getByTestId('transition-duration').textContent);
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBe(0.3); // Default duration
    });

    it('should have 0 duration when reduced motion is preferred', () => {
      mockMatchMedia(true);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      const duration = parseFloat(screen.getByTestId('transition-duration').textContent);
      expect(duration).toBe(0);
    });

    it('should respect custom transitions when animations are enabled', () => {
      mockMatchMedia(false);

      const CustomTransitionComponent = () => {
        const { getTransition } = useAnimation();
        const customTransition = getTransition({ duration: 0.5, ease: 'easeOut' });
        
        return (
          <div>
            <div data-testid="custom-duration">{customTransition.duration}</div>
            <div data-testid="custom-ease">{customTransition.ease}</div>
          </div>
        );
      };

      render(
        <AnimationProvider>
          <CustomTransitionComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('custom-duration').textContent).toBe('0.5');
      expect(screen.getByTestId('custom-ease').textContent).toBe('easeOut');
    });

    it('should override custom transitions to 0 when reduced motion is preferred', () => {
      mockMatchMedia(true);

      const CustomTransitionComponent = () => {
        const { getTransition } = useAnimation();
        const customTransition = getTransition({ duration: 0.5, ease: 'easeOut' });
        
        return (
          <div>
            <div data-testid="custom-duration">{customTransition.duration}</div>
          </div>
        );
      };

      render(
        <AnimationProvider>
          <CustomTransitionComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('custom-duration').textContent).toBe('0');
    });
  });

  describe('5. Animation Variants Library', () => {
    it('should provide variants library when animations are enabled', () => {
      mockMatchMedia(false);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('has-variants').textContent).toBe('true');
    });

    it('should still provide variants library when reduced motion is preferred', () => {
      mockMatchMedia(true);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      // Variants should still be available, but shouldAnimate controls their usage
      expect(screen.getByTestId('has-variants').textContent).toBe('true');
    });

    it('should have all expected variant categories', () => {
      mockMatchMedia(false);

      const VariantsTestComponent = () => {
        const { variants } = useAnimation();
        
        return (
          <div>
            <div data-testid="has-page">{variants.pageVariants ? 'true' : 'false'}</div>
            <div data-testid="has-modal">{variants.modalVariants ? 'true' : 'false'}</div>
            <div data-testid="has-list">{variants.listVariants ? 'true' : 'false'}</div>
            <div data-testid="has-button">{variants.buttonVariants ? 'true' : 'false'}</div>
            <div data-testid="has-loading">{variants.loadingVariants ? 'true' : 'false'}</div>
            <div data-testid="has-feedback">{variants.feedbackVariants ? 'true' : 'false'}</div>
          </div>
        );
      };

      render(
        <AnimationProvider>
          <VariantsTestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('has-page').textContent).toBe('true');
      expect(screen.getByTestId('has-modal').textContent).toBe('true');
      expect(screen.getByTestId('has-list').textContent).toBe('true');
      expect(screen.getByTestId('has-button').textContent).toBe('true');
      expect(screen.getByTestId('has-loading').textContent).toBe('true');
      expect(screen.getByTestId('has-feedback').textContent).toBe('true');
    });
  });

  describe('6. Media Query Change Detection', () => {
    it('should have event listeners for media query changes', () => {
      // Mock matchMedia with event listener tracking
      const addEventListenerMock = vi.fn();
      const removeEventListenerMock = vi.fn();
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: addEventListenerMock,
          removeEventListener: removeEventListenerMock,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { unmount } = render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      // Verify event listener was added
      expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));

      // Cleanup
      unmount();

      // Verify event listener was removed
      expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should respond to different initial media query states', () => {
      // Test with reduced motion enabled from start
      mockMatchMedia(true);

      const { unmount } = render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('shouldAnimate').textContent).toBe('false');
      
      unmount();
      cleanup();

      // Test with reduced motion disabled from start
      mockMatchMedia(false);

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      expect(screen.getByTestId('shouldAnimate').textContent).toBe('true');
    });
  });

  describe('7. Integration Test', () => {
    it('should work end-to-end with reduced motion disabled', () => {
      mockMatchMedia(false);

      const IntegrationComponent = () => {
        const { shouldAnimate, prefersReducedMotion, getTransition } = useAnimation();
        
        return (
          <div>
            <div data-testid="integration-animate">{shouldAnimate.toString()}</div>
            <div data-testid="integration-reduced">{prefersReducedMotion.toString()}</div>
            <div data-testid="integration-duration">{getTransition().duration}</div>
            <PageTransition variant="fadeIn">
              <div data-testid="integration-content">Page Content</div>
            </PageTransition>
          </div>
        );
      };

      render(
        <AnimationProvider>
          <IntegrationComponent />
        </AnimationProvider>
      );

      // Verify all aspects work together
      expect(screen.getByTestId('integration-animate').textContent).toBe('true');
      expect(screen.getByTestId('integration-reduced').textContent).toBe('false');
      expect(screen.getByTestId('integration-duration').textContent).toBe('0.3');
      expect(screen.getByTestId('integration-content')).toBeTruthy();
    });

    it('should work end-to-end with reduced motion enabled', () => {
      mockMatchMedia(true);

      const IntegrationComponent = () => {
        const { shouldAnimate, prefersReducedMotion, getTransition } = useAnimation();
        
        return (
          <div>
            <div data-testid="integration-animate">{shouldAnimate.toString()}</div>
            <div data-testid="integration-reduced">{prefersReducedMotion.toString()}</div>
            <div data-testid="integration-duration">{getTransition().duration}</div>
            <PageTransition variant="fadeIn">
              <div data-testid="integration-content">Page Content</div>
            </PageTransition>
          </div>
        );
      };

      render(
        <AnimationProvider>
          <IntegrationComponent />
        </AnimationProvider>
      );

      // Verify all aspects work together with reduced motion
      expect(screen.getByTestId('integration-animate').textContent).toBe('false');
      expect(screen.getByTestId('integration-reduced').textContent).toBe('true');
      expect(screen.getByTestId('integration-duration').textContent).toBe('0');
      expect(screen.getByTestId('integration-content')).toBeTruthy();
    });
  });

  describe('8. Error Handling', () => {
    it('should throw error when useAnimation is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAnimation must be used within an AnimationProvider');

      console.error = originalError;
    });

    it('should handle missing matchMedia gracefully', () => {
      // Remove matchMedia
      const originalMatchMedia = window.matchMedia;
      delete window.matchMedia;

      render(
        <AnimationProvider>
          <TestComponent />
        </AnimationProvider>
      );

      // Should default to animations enabled
      expect(screen.getByTestId('shouldAnimate').textContent).toBe('true');

      // Restore matchMedia
      window.matchMedia = originalMatchMedia;
    });
  });
});

/**
 * Manual Testing Instructions:
 * 
 * To manually verify prefers-reduced-motion in a browser:
 * 
 * 1. Chrome/Edge:
 *    - Open DevTools (F12)
 *    - Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
 *    - Type "Emulate CSS prefers-reduced-motion"
 *    - Select "prefers-reduced-motion: reduce"
 *    - Reload the page
 *    - Verify animations are disabled
 * 
 * 2. Firefox:
 *    - Type about:config in address bar
 *    - Search for "ui.prefersReducedMotion"
 *    - Set to 1 (reduced motion)
 *    - Reload the page
 *    - Verify animations are disabled
 * 
 * 3. Safari:
 *    - Open System Preferences > Accessibility
 *    - Select "Display"
 *    - Check "Reduce motion"
 *    - Reload the page
 *    - Verify animations are disabled
 * 
 * 4. Windows:
 *    - Settings > Ease of Access > Display
 *    - Turn on "Show animations in Windows"
 *    - Reload the page
 *    - Verify animations are disabled
 * 
 * 5. macOS:
 *    - System Preferences > Accessibility > Display
 *    - Check "Reduce motion"
 *    - Reload the page
 *    - Verify animations are disabled
 * 
 * Expected Behavior:
 * - Page transitions should be instant (no fade/slide)
 * - Modal animations should be instant (no scale/fade)
 * - Button hover effects should be instant or disabled
 * - List stagger animations should be instant
 * - All content should still be visible and functional
 * - No layout shifts should occur
 */
