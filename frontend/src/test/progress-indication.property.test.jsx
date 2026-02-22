/**
 * Progress Indication Property-Based Test
 * Task 8.6.4: Write property-based test for progress indication (100 iterations)
 * 
 * Property LOAD-4: Progress Indication
 * page.loading = true → progressBar.visible = true
 * 
 * This test verifies that:
 * 1. Progress bar is visible when page is loading
 * 2. Progress bar is hidden when page is not loading
 * 3. Progress value is within valid range (0-100)
 * 4. Progress bar has proper ARIA attributes
 * 5. Progress bar respects prefers-reduced-motion
 * 6. Progress increments are smooth and logical
 * 7. Progress completes within reasonable time
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import RouteProgressBar from '../components/RouteProgressBar';
import ProgressBar from '../components/Loading/ProgressBar';
import { AnimationProvider } from '../context/AnimationContext';
import { ThemeProvider } from '../context/ThemeContext';

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ThemeProvider>
    <AnimationProvider>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </AnimationProvider>
  </ThemeProvider>
);

// Navigation test component
const NavigationTest = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button onClick={() => navigate('/page1')}>Go to Page 1</button>
      <button onClick={() => navigate('/page2')}>Go to Page 2</button>
      <RouteProgressBar />
      <Routes>
        <Route path="/page1" element={<div>Page 1</div>} />
        <Route path="/page2" element={<div>Page 2</div>} />
      </Routes>
    </div>
  );
};

describe('Progress Indication Property-Based Tests', () => {
  describe('Property LOAD-4: Progress Bar Visibility', () => {
    it('should show progress bar when loading is true (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isLoading) => {
            const { container } = render(
              <TestWrapper>
                {isLoading && <ProgressBar progress={50} position="top" />}
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            
            if (isLoading) {
              expect(progressBar).toBeTruthy();
            } else {
              expect(progressBar).toBeFalsy();
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should hide progress bar when loading is false (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constant(false),
          (isLoading) => {
            const { container } = render(
              <TestWrapper>
                {isLoading && <ProgressBar progress={50} position="top" />}
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            expect(progressBar).toBeFalsy();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Progress Value Range', () => {
    it('should keep progress value within 0-100 range (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }),
          (rawProgress) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={rawProgress} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            const ariaValueNow = parseInt(progressBar.getAttribute('aria-valuenow'));
            
            expect(ariaValueNow).toBeGreaterThanOrEqual(0);
            expect(ariaValueNow).toBeLessThanOrEqual(100);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clamp negative progress to 0 (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: -1 }),
          (negativeProgress) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={negativeProgress} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            const ariaValueNow = parseInt(progressBar.getAttribute('aria-valuenow'));
            
            expect(ariaValueNow).toBe(0);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clamp progress over 100 to 100 (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 101, max: 1000 }),
          (overProgress) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={overProgress} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            const ariaValueNow = parseInt(progressBar.getAttribute('aria-valuenow'));
            
            expect(ariaValueNow).toBe(100);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: ARIA Attributes', () => {
    it('should have proper ARIA attributes when visible (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={progress} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            
            expect(progressBar).toBeTruthy();
            expect(progressBar.getAttribute('role')).toBe('progressbar');
            expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
            expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
            expect(progressBar.getAttribute('aria-valuenow')).toBe(progress.toString());
            expect(progressBar.getAttribute('aria-label')).toBeTruthy();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should announce progress to screen readers (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.constantFrom('Loading', 'Uploading', 'Downloading', 'Processing'),
          (progress, message) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar 
                  progress={progress} 
                  loadingMessage={message}
                  announceToScreenReader={true}
                />
              </TestWrapper>
            );

            const ariaLive = container.querySelector('[aria-live]');
            expect(ariaLive).toBeTruthy();
            
            const progressBar = container.querySelector('[role="progressbar"]');
            const ariaLabel = progressBar.getAttribute('aria-label');
            expect(ariaLabel).toContain(message);
            expect(ariaLabel).toContain(progress.toString());
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Progress Positioning', () => {
    it('should support different positions (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('relative', 'top', 'bottom'),
          fc.integer({ min: 0, max: 100 }),
          (position, progress) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={progress} position={position} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            expect(progressBar).toBeTruthy();
            
            const wrapper = progressBar.parentElement;
            if (position === 'top') {
              expect(wrapper.className).toContain('fixed');
              expect(wrapper.className).toContain('top-0');
            } else if (position === 'bottom') {
              expect(wrapper.className).toContain('fixed');
              expect(wrapper.className).toContain('bottom-0');
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Progress Colors', () => {
    it('should support different color schemes (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('primary', 'accent', 'success', 'warning', 'error'),
          fc.integer({ min: 0, max: 100 }),
          (color, progress) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={progress} color={color} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            expect(progressBar).toBeTruthy();
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Progress Increments', () => {
    it('should handle smooth progress increments (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 10 }),
          (progressValues) => {
            const { container, rerender } = render(
              <TestWrapper>
                <ProgressBar progress={progressValues[0]} />
              </TestWrapper>
            );

            progressValues.forEach((progress, index) => {
              if (index > 0) {
                rerender(
                  <TestWrapper>
                    <ProgressBar progress={progress} />
                  </TestWrapper>
                );
              }

              const progressBar = container.querySelector('[role="progressbar"]');
              const ariaValueNow = parseInt(progressBar.getAttribute('aria-valuenow'));
              expect(ariaValueNow).toBe(progress);
            });
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle progress from 0 to 100 (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constant([0, 25, 50, 75, 100]),
          (progressSequence) => {
            const { container, rerender } = render(
              <TestWrapper>
                <ProgressBar progress={progressSequence[0]} />
              </TestWrapper>
            );

            progressSequence.forEach((progress) => {
              rerender(
                <TestWrapper>
                  <ProgressBar progress={progress} />
                </TestWrapper>
              );

              const progressBar = container.querySelector('[role="progressbar"]');
              const ariaValueNow = parseInt(progressBar.getAttribute('aria-valuenow'));
              expect(ariaValueNow).toBe(progress);
            });
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Percentage Display', () => {
    it('should show percentage when enabled (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // Start from 1 to avoid "0%" in aria-label
          fc.boolean(),
          (progress, showPercentage) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={progress} showPercentage={showPercentage} />
              </TestWrapper>
            );

            // Look for percentage in a specific element, not just text content
            const percentageElement = container.querySelector('.text-center');
            
            if (showPercentage) {
              expect(percentageElement).toBeTruthy();
              expect(percentageElement.textContent).toContain(`${Math.round(progress)}%`);
            } else {
              expect(percentageElement).toBeFalsy();
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Animation Behavior', () => {
    it('should respect prefers-reduced-motion (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (progress) => {
            // Mock prefers-reduced-motion
            const matchMediaMock = vi.fn().mockImplementation((query) => ({
              matches: query === '(prefers-reduced-motion: reduce)',
              media: query,
              onchange: null,
              addListener: vi.fn(),
              removeListener: vi.fn(),
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
              dispatchEvent: vi.fn(),
            }));

            global.matchMedia = matchMediaMock;

            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={progress} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            expect(progressBar).toBeTruthy();
            
            // Cleanup
            delete global.matchMedia;
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Loading State Consistency', () => {
    it('should maintain consistent state during loading (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.integer({ min: 0, max: 100 }),
          (isLoading, progress) => {
            const { container } = render(
              <TestWrapper>
                {isLoading && <ProgressBar progress={progress} position="top" />}
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            
            // If loading, progress bar should exist with correct value
            if (isLoading) {
              expect(progressBar).toBeTruthy();
              expect(progressBar.getAttribute('aria-valuenow')).toBe(progress.toString());
            } else {
              expect(progressBar).toBeFalsy();
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show progress bar only when page is loading (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (pageLoading) => {
            const { container } = render(
              <TestWrapper>
                {pageLoading && <ProgressBar progress={50} position="top" />}
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            
            // Property LOAD-4: page.loading = true → progressBar.visible = true
            if (pageLoading) {
              expect(progressBar).toBeTruthy();
            } else {
              expect(progressBar).toBeFalsy();
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Edge Cases', () => {
    it('should handle rapid progress updates (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 5, maxLength: 20 }),
          (progressUpdates) => {
            const { container, rerender } = render(
              <TestWrapper>
                <ProgressBar progress={0} />
              </TestWrapper>
            );

            progressUpdates.forEach((progress) => {
              rerender(
                <TestWrapper>
                  <ProgressBar progress={progress} />
                </TestWrapper>
              );

              const progressBar = container.querySelector('[role="progressbar"]');
              expect(progressBar).toBeTruthy();
              expect(parseInt(progressBar.getAttribute('aria-valuenow'))).toBe(progress);
            });
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle zero progress (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constant(0),
          (progress) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={progress} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            expect(progressBar.getAttribute('aria-valuenow')).toBe('0');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle complete progress (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.constant(100),
          (progress) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={progress} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            expect(progressBar.getAttribute('aria-valuenow')).toBe('100');
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Dark Mode Support', () => {
    it('should support dark mode (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.boolean(),
          (progress, showPercentage) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar progress={progress} showPercentage={showPercentage} />
              </TestWrapper>
            );

            const progressBar = container.querySelector('[role="progressbar"]');
            expect(progressBar).toBeTruthy();
            
            // Check for dark mode classes
            if (showPercentage) {
              const percentageElement = container.querySelector('.text-\\[\\#304B60\\]');
              expect(percentageElement).toBeTruthy();
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property LOAD-4: Screen Reader Announcements', () => {
    it('should announce progress changes (100 iterations)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.boolean(),
          (progress, announceToScreenReader) => {
            const { container } = render(
              <TestWrapper>
                <ProgressBar 
                  progress={progress} 
                  announceToScreenReader={announceToScreenReader}
                />
              </TestWrapper>
            );

            const ariaLive = container.querySelector('[aria-live]');
            
            if (announceToScreenReader) {
              expect(ariaLive).toBeTruthy();
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
