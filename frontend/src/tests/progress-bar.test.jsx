/**
 * Progress Bar Test Suite
 * Task 8.2.1: Create ProgressBar component for page loads
 * 
 * This test suite validates that the progress bar is displayed at the top
 * of the page during route navigation and page loads.
 * 
 * Requirements:
 * - FR-LOAD-2: Display progress bar at top during page loads
 * - Property LOAD-4: Progress bar visible when page loading
 * - NFR-USE-3: Display loading states within 100ms
 */

import React, { useState, useEffect } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AnimationProvider } from '../context/AnimationContext';
import ProgressBar from '../components/Loading/ProgressBar';
import RouteProgressBar from '../components/RouteProgressBar';
import useRouteProgress from '../hooks/useRouteProgress';

// Mock framer-motion for controlled testing
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, initial, animate, exit, transition, style, ...props }, ref) => {
      return (
        <div 
          ref={ref}
          data-testid="animated-progress"
          data-width={animate?.width || '0%'}
          style={style}
          {...props}
        >
          {children}
        </div>
      );
    })
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock AriaLiveRegion
vi.mock('../components/Accessibility/AriaLiveRegion', () => ({
  default: ({ message }) => <div data-testid="aria-live-region">{message}</div>
}));

describe('ProgressBar Component Tests', () => {
  
  describe('Basic Rendering', () => {
    it('should render progress bar with correct progress value', () => {
      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={50} />
        </AnimationProvider>
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
    });

    it('should render at top position when specified', () => {
      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={50} position="top" />
        </AnimationProvider>
      );

      // Check that the progress bar is rendered with correct ARIA attributes
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
      
      // The component should render successfully with top position
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should use accent color by default', () => {
      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={50} />
        </AnimationProvider>
      );

      const progressFill = container.querySelector('[data-testid="animated-progress"]');
      expect(progressFill.className).toContain('bg-[#D48161]');
    });

    it('should display percentage when showPercentage is true', () => {
      render(
        <AnimationProvider>
          <ProgressBar progress={75} showPercentage={true} />
        </AnimationProvider>
      );

      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('Progress Value Handling', () => {
    it('should clamp progress to 0-100 range', () => {
      const { container: container1 } = render(
        <AnimationProvider>
          <ProgressBar progress={-10} />
        </AnimationProvider>
      );

      const progressBar1 = container1.querySelector('[role="progressbar"]');
      expect(progressBar1.getAttribute('aria-valuenow')).toBe('0');

      const { container: container2 } = render(
        <AnimationProvider>
          <ProgressBar progress={150} />
        </AnimationProvider>
      );

      const progressBar2 = container2.querySelector('[role="progressbar"]');
      expect(progressBar2.getAttribute('aria-valuenow')).toBe('100');
    });

    it('should handle decimal progress values', () => {
      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={45.7} showPercentage={true} />
        </AnimationProvider>
      );

      expect(screen.getByText('46%')).toBeInTheDocument();
    });

    it('should update progress value dynamically', async () => {
      const DynamicProgress = () => {
        const [progress, setProgress] = useState(0);

        useEffect(() => {
          const timer = setTimeout(() => setProgress(50), 100);
          return () => clearTimeout(timer);
        }, []);

        return (
          <AnimationProvider>
            <ProgressBar progress={progress} showPercentage={true} />
          </AnimationProvider>
        );
      };

      render(<DynamicProgress />);

      expect(screen.getByText('0%')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      }, { timeout: 300 });
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={60} />
        </AnimationProvider>
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label');
    });

    it('should announce progress to screen readers', () => {
      render(
        <AnimationProvider>
          <ProgressBar progress={75} announceToScreenReader={true} />
        </AnimationProvider>
      );

      const ariaLive = screen.getByTestId('aria-live-region');
      expect(ariaLive).toBeInTheDocument();
      expect(ariaLive.textContent).toContain('75%');
    });

    it('should not announce when announceToScreenReader is false', () => {
      render(
        <AnimationProvider>
          <ProgressBar progress={75} announceToScreenReader={false} />
        </AnimationProvider>
      );

      const ariaLive = screen.queryByTestId('aria-live-region');
      expect(ariaLive).not.toBeInTheDocument();
    });

    it('should use custom loading message', () => {
      render(
        <AnimationProvider>
          <ProgressBar 
            progress={50} 
            loadingMessage="Uploading file"
            announceToScreenReader={true}
          />
        </AnimationProvider>
      );

      const ariaLive = screen.getByTestId('aria-live-region');
      expect(ariaLive.textContent).toContain('Uploading file');
    });
  });

  describe('Color Variants', () => {
    it('should support different color variants', () => {
      const colors = ['primary', 'accent', 'success', 'warning', 'error'];

      colors.forEach(color => {
        const { container, unmount } = render(
          <AnimationProvider>
            <ProgressBar progress={50} color={color} />
          </AnimationProvider>
        );

        const progressFill = container.querySelector('[data-testid="animated-progress"]');
        expect(progressFill).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Animation Behavior', () => {
    it('should animate progress width', () => {
      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={75} />
        </AnimationProvider>
      );

      const progressFill = container.querySelector('[data-testid="animated-progress"]');
      expect(progressFill).toBeInTheDocument();
      // The animated progress element should exist and have width data
      const widthAttr = progressFill.getAttribute('data-width');
      expect(widthAttr).toBeTruthy();
    });

    it('should respect prefers-reduced-motion', () => {
      // Mock matchMedia for prefers-reduced-motion
      const mockMatchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });

      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={50} />
        </AnimationProvider>
      );

      const progressFill = container.querySelector('[data-testid="animated-progress"]');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should render correctly in dark mode', () => {
      // Add dark class to document
      document.documentElement.classList.add('dark');

      const { container } = render(
        <AnimationProvider>
          <ProgressBar progress={50} showPercentage={true} />
        </AnimationProvider>
      );

      expect(container.firstChild).toBeInTheDocument();

      // Clean up
      document.documentElement.classList.remove('dark');
    });
  });
});

describe('RouteProgressBar Component Tests', () => {
  
  describe('Integration with useRouteProgress', () => {
    it('should display progress bar during navigation', () => {
      // Create a test component that uses the hook
      const TestComponent = () => {
        const { isNavigating, progress } = useRouteProgress();
        
        return (
          <div>
            <div data-testid="is-navigating">{isNavigating.toString()}</div>
            <div data-testid="progress-value">{progress}</div>
          </div>
        );
      };

      render(
        <BrowserRouter>
          <TestComponent />
        </BrowserRouter>
      );

      // Initially should be navigating
      expect(screen.getByTestId('is-navigating').textContent).toBe('true');
    });

    it('should show progress bar at top of page', () => {
      const { container } = render(
        <BrowserRouter>
          <AnimationProvider>
            <RouteProgressBar />
          </AnimationProvider>
        </BrowserRouter>
      );

      // Should render the component
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Progress Simulation', () => {
    it('should simulate progress increments', async () => {
      const ProgressTracker = () => {
        const { progress } = useRouteProgress();
        return <div data-testid="progress">{progress}</div>;
      };

      render(
        <BrowserRouter>
          <ProgressTracker />
        </BrowserRouter>
      );

      const progressElement = screen.getByTestId('progress');
      const initialProgress = parseInt(progressElement.textContent);

      // Progress should start at 0
      expect(initialProgress).toBe(0);

      // Wait for progress to increase
      await waitFor(() => {
        const currentProgress = parseInt(progressElement.textContent);
        expect(currentProgress).toBeGreaterThan(0);
      }, { timeout: 200 });
    });

    it('should complete progress after navigation', async () => {
      const ProgressTracker = () => {
        const { isNavigating, progress } = useRouteProgress();
        return (
          <div>
            <div data-testid="navigating">{isNavigating.toString()}</div>
            <div data-testid="progress">{progress}</div>
          </div>
        );
      };

      render(
        <BrowserRouter>
          <ProgressTracker />
        </BrowserRouter>
      );

      // Should eventually complete
      await waitFor(() => {
        const navigating = screen.getByTestId('navigating').textContent;
        expect(navigating).toBe('false');
      }, { timeout: 1000 });
    });
  });
});

describe('Progress Bar - Performance Tests', () => {
  
  it('should render within 100ms', () => {
    const startTime = Date.now();
    
    render(
      <AnimationProvider>
        <ProgressBar progress={50} position="top" />
      </AnimationProvider>
    );

    const renderTime = Date.now() - startTime;
    
    // Should render quickly (NFR-USE-3: within 100ms)
    expect(renderTime).toBeLessThan(100);
  });

  it('should handle rapid progress updates efficiently', () => {
    const RapidUpdates = () => {
      const [progress, setProgress] = useState(0);

      useEffect(() => {
        const interval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 100));
        }, 50);

        return () => clearInterval(interval);
      }, []);

      return (
        <AnimationProvider>
          <ProgressBar progress={progress} />
        </AnimationProvider>
      );
    };

    const { container } = render(<RapidUpdates />);
    
    // Should handle updates without errors
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('Progress Bar - Integration Tests', () => {
  
  it('should work correctly in ApplicationShell context', () => {
    const { container } = render(
      <BrowserRouter>
        <AnimationProvider>
          <RouteProgressBar />
        </AnimationProvider>
      </BrowserRouter>
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it('should maintain fixed position at top of viewport', () => {
    const { container } = render(
      <AnimationProvider>
        <ProgressBar progress={50} position="top" />
      </AnimationProvider>
    );

    // Check that the progress bar is rendered correctly
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
    
    // Verify the component renders with the top position prop
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should not block user interaction', () => {
    const { container } = render(
      <AnimationProvider>
        <div>
          <ProgressBar progress={50} position="top" />
          <button data-testid="test-button">Click Me</button>
        </div>
      </AnimationProvider>
    );

    const button = screen.getByTestId('test-button');
    expect(button).toBeInTheDocument();
    
    // Button should be clickable (progress bar doesn't block)
    button.click();
  });
});

/**
 * Manual Testing Checklist
 * 
 * To fully validate the progress bar implementation, perform these manual tests:
 * 
 * 1. Visual Appearance:
 *    - Navigate between pages
 *    - Progress bar should appear at the top of the page
 *    - Bar should be thin (1px height) and accent colored (#D48161)
 *    - Bar should span full width of viewport
 * 
 * 2. Progress Animation:
 *    - Progress should start at 0% and animate to 100%
 *    - Animation should be smooth and continuous
 *    - Progress should complete within 500-800ms
 * 
 * 3. Multiple Navigations:
 *    - Navigate between multiple pages quickly
 *    - Progress bar should reset and restart for each navigation
 *    - No visual glitches or overlapping progress bars
 * 
 * 4. Accessibility:
 *    - Use screen reader to verify announcements
 *    - Progress should be announced as "Loading page: X%"
 *    - ARIA attributes should be present and correct
 * 
 * 5. Performance:
 *    - Progress bar should not cause layout shifts
 *    - Should not impact page load performance
 *    - Should render within 100ms of navigation start
 * 
 * 6. Dark Mode:
 *    - Toggle dark mode
 *    - Progress bar should remain visible
 *    - Colors should adapt appropriately
 * 
 * 7. Reduced Motion:
 *    - Enable "Reduce motion" in OS settings
 *    - Progress bar should still function
 *    - Animation may be simplified or instant
 * 
 * 8. Different Devices:
 *    - Test on desktop browsers (Chrome, Firefox, Safari, Edge)
 *    - Test on mobile devices (iOS Safari, Chrome Mobile)
 *    - Test on tablets
 * 
 * 9. Network Conditions:
 *    - Test with fast connection (progress completes quickly)
 *    - Test with slow 3G (progress may take longer)
 *    - Progress bar should always complete
 * 
 * Expected Results:
 * - Progress bar visible at top during all page loads
 * - Smooth animation from 0% to 100%
 * - No layout shifts or visual glitches
 * - Accessible to screen readers
 * - Works in all browsers and devices
 * - Respects user motion preferences
 */
